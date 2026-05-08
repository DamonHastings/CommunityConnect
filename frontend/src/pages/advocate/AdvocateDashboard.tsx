import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useClientProfiles, useCreateClientProfile } from '../../hooks/useClientProfiles'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Plus, Users, MapPin, X } from 'lucide-react'
import type { ClientProfile } from '../../types'

const HOUSING_LABELS: Record<string, string> = {
  housed_stable: 'Housed — Stable',
  housed_at_risk: 'Housed — At Risk',
  unhoused: 'Unhoused',
  shelter: 'Emergency Shelter',
  transitional: 'Transitional Housing',
}

const URGENCY_VARIANTS: Record<string, 'danger' | 'warning' | 'info' | 'default'> = {
  crisis: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'default',
}

function ClientProfileCard({ profile }: { profile: ClientProfile }) {
  return (
    <Link to={`/client-profiles/${profile.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardBody>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900">{profile.full_name}</h3>
            {profile.urgency && (
              <Badge variant={URGENCY_VARIANTS[profile.urgency] ?? 'default'}>
                {profile.urgency}
              </Badge>
            )}
          </div>
          {profile.housing_status && (
            <p className="mt-1 text-sm text-gray-500">{HOUSING_LABELS[profile.housing_status] ?? profile.housing_status}</p>
          )}
          {profile.city && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {profile.city}{profile.state ? `, ${profile.state}` : ''}
            </p>
          )}
          {profile.needs_categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {profile.needs_categories.slice(0, 3).map((n) => (
                <Badge key={n} variant="info" className="text-xs">{n.replace(/_/g, ' ')}</Badge>
              ))}
              {profile.needs_categories.length > 3 && (
                <span className="text-xs text-gray-400">+{profile.needs_categories.length - 3} more</span>
              )}
            </div>
          )}
          {profile.application_count > 0 && (
            <p className="mt-2 text-xs text-gray-400">{profile.application_count} application{profile.application_count !== 1 ? 's' : ''}</p>
          )}
        </CardBody>
      </Card>
    </Link>
  )
}

const NEEDS_OPTIONS = [
  { value: 'food_nutrition', label: 'Food & Nutrition' },
  { value: 'housing_shelter', label: 'Housing & Shelter' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'mental_health', label: 'Mental Health' },
  { value: 'job_training', label: 'Job Training' },
  { value: 'education', label: 'Education' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'legal_aid', label: 'Legal Aid' },
  { value: 'financial_assistance', label: 'Financial Assistance' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'other', label: 'Other' },
]

function AddClientModal({ onClose }: { onClose: () => void }) {
  const createProfile = useCreateClientProfile()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    housing_status: '',
    employment_status: '',
    urgency: '',
    goals: '',
    needs_categories: [] as string[],
  })

  function toggleNeed(v: string) {
    setForm((f) => ({
      ...f,
      needs_categories: f.needs_categories.includes(v)
        ? f.needs_categories.filter((n) => n !== v)
        : [...f.needs_categories, v],
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Partial<ClientProfile> = {
      first_name: form.first_name,
      last_name: form.last_name,
      needs_categories: form.needs_categories,
    }
    if (form.email) payload.email = form.email
    if (form.phone) payload.phone = form.phone
    if (form.city) payload.city = form.city
    if (form.state) payload.state = form.state
    if (form.housing_status) payload.housing_status = form.housing_status
    if (form.employment_status) payload.employment_status = form.employment_status
    if (form.urgency) payload.urgency = form.urgency
    if (form.goals) payload.goals = form.goals
    createProfile.mutate(payload, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[70vh] px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">First name *</label>
              <input
                required
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Last name *</label>
              <input
                required
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Housing status</label>
            <select
              value={form.housing_status}
              onChange={(e) => setForm((f) => ({ ...f, housing_status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select…</option>
              <option value="housed_stable">Housed — Stable</option>
              <option value="housed_at_risk">Housed — At Risk</option>
              <option value="unhoused">Unhoused</option>
              <option value="shelter">Emergency Shelter</option>
              <option value="transitional">Transitional Housing</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Employment status</label>
            <select
              value={form.employment_status}
              onChange={(e) => setForm((f) => ({ ...f, employment_status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select…</option>
              <option value="employed_full_time">Employed — Full Time</option>
              <option value="employed_part_time">Employed — Part Time</option>
              <option value="unemployed_seeking">Unemployed — Seeking</option>
              <option value="unemployed_not_seeking">Unemployed — Not Seeking</option>
              <option value="student">Student</option>
              <option value="retired">Retired</option>
              <option value="unable_to_work">Unable to Work</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Urgency</label>
            <select
              value={form.urgency}
              onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select…</option>
              <option value="crisis">Crisis</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Needs</label>
            <div className="flex flex-wrap gap-2">
              {NEEDS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleNeed(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    form.needs_categories.includes(opt.value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Goals</label>
            <textarea
              value={form.goals}
              onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
              rows={3}
              placeholder="What is this person hoping to achieve?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {createProfile.error && (
            <p className="text-sm text-red-600">Failed to create client profile. Please try again.</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={createProfile.isPending} className="flex-1">
              Add Client
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdvocateDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useClientProfiles(!!user)
  const [showAddModal, setShowAddModal] = useState(false)
  const profiles = data?.client_profiles ?? []

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />

  return (
    <div className="space-y-6">
      {showAddModal && <AddClientModal onClose={() => setShowAddModal(false)} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Clients</h1>
          <p className="mt-1 text-gray-500">Manage client profiles and apply to programs on their behalf.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No clients yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add your first client to start managing their applications.</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ClientProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  )
}
