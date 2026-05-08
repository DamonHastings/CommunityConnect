import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useClientProfile, useClientApplications, useApplyOnBehalf } from '../../hooks/useClientProfiles'
import { usePrograms } from '../../hooks/usePrograms'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, MapPin, Mail, Phone, Briefcase, Home, X } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import type { ApplicationStatus } from '../../types'

const HOUSING_LABELS: Record<string, string> = {
  housed_stable: 'Housed — Stable',
  housed_at_risk: 'Housed — At Risk',
  unhoused: 'Unhoused',
  shelter: 'Emergency Shelter',
  transitional: 'Transitional Housing',
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  employed_full_time: 'Employed Full Time',
  employed_part_time: 'Employed Part Time',
  unemployed_seeking: 'Unemployed — Seeking Work',
  unemployed_not_seeking: 'Unemployed — Not Seeking',
  student: 'Student',
  retired: 'Retired',
  unable_to_work: 'Unable to Work',
}

const APP_VARIANTS: Record<ApplicationStatus, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  withdrawn: 'default',
}

function ApplyOnBehalfModal({ clientProfileId, onClose }: { clientProfileId: number; onClose: () => void }) {
  const { data: programsData } = usePrograms()
  const apply = useApplyOnBehalf(clientProfileId)
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [message, setMessage] = useState('')
  const programs = programsData?.programs ?? []

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProgramId) return
    apply.mutate(
      { programId: parseInt(selectedProgramId), message },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Apply to a Program</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Program</label>
            <select
              required
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select a program…</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.title} — {p.organization.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Tell the organization about this client's situation…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          {apply.error && <p className="text-sm text-red-600">Failed to submit application. They may already have one.</p>}
          <div className="flex gap-3">
            <Button type="submit" isLoading={apply.isPending} className="flex-1">Submit Application</Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: profileData, isLoading } = useClientProfile(id ? parseInt(id) : undefined)
  const { data: appsData } = useClientApplications(id ? parseInt(id) : undefined)
  const [showApplyModal, setShowApplyModal] = useState(false)

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />

  const profile = profileData?.client_profile
  if (!profile) return <div className="py-16 text-center text-gray-500">Client not found.</div>

  const applications = appsData?.applications ?? []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {showApplyModal && (
        <ApplyOnBehalfModal
          clientProfileId={profile.id}
          onClose={() => setShowApplyModal(false)}
        />
      )}

      <Link to="/advocate/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              {profile.urgency && (
                <Badge
                  variant={({ crisis: 'danger', high: 'warning', medium: 'info', low: 'default' } as Record<string, 'danger' | 'warning' | 'info' | 'default'>)[profile.urgency] ?? 'default'}
                  className="mt-1"
                >
                  {profile.urgency} urgency
                </Badge>
              )}
            </div>
            <Button onClick={() => setShowApplyModal(true)}>Apply to Program</Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {profile.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                {profile.email}
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                {profile.phone}
              </div>
            )}
            {(profile.city || profile.state) && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                {[profile.city, profile.state].filter(Boolean).join(', ')}
              </div>
            )}
          </div>

          {(profile.housing_status || profile.employment_status) && (
            <div className="flex flex-wrap gap-3 text-sm">
              {profile.housing_status && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Home className="h-4 w-4 text-gray-400" />
                  {HOUSING_LABELS[profile.housing_status] ?? profile.housing_status}
                </div>
              )}
              {profile.employment_status && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  {EMPLOYMENT_LABELS[profile.employment_status] ?? profile.employment_status}
                </div>
              )}
            </div>
          )}

          {profile.needs_categories.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Needs</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.needs_categories.map((n) => (
                  <Badge key={n} variant="info">{n.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          )}

          {profile.goals && (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Goals</p>
              <p className="text-sm text-gray-600">{profile.goals}</p>
            </div>
          )}

          {profile.barriers && (
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Barriers</p>
              <p className="text-sm text-gray-600">{profile.barriers}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Applications */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Applications</h2>
        {applications.length === 0 ? (
          <Card>
            <CardBody className="py-8 text-center text-gray-500">
              No applications yet.
              <div className="mt-3">
                <Button onClick={() => setShowApplyModal(true)}>Apply to a Program</Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardBody className="flex items-start justify-between gap-4">
                  <div>
                    <Link to={`/programs/${app.program_id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                      {app.program.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                  </div>
                  <Badge variant={APP_VARIANTS[app.status]}>{app.status}</Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
