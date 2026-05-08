import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import type { ProfileUpdateData } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { MultiSelectChipInput } from '../../components/ui/MultiSelectChipInput'
import { PROFILE_TYPE_LABELS, PROFILE_TYPE_OPTIONS, SPECIALTY_OPTIONS, NEEDS_CATEGORY_LABELS } from '../../lib/utils'
import { Link } from 'react-router-dom'
import { Building2, Pencil, X, Check, RefreshCw } from 'lucide-react'
import type { ProfileType } from '../../types'

const schema = z.object({
  profile_type: z.enum(['individual_seeker', 'individual_professional', 'community_org', 'business_service_provider', 'volunteer', 'resource_navigator', 'advocate']),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  availability: z.string().optional(),
  specialty: z.string().optional(),
  communities_served: z.array(z.string()),
  services_offered: z.array(z.string()),
  services_needed: z.array(z.string()),
})

type FormData = z.infer<typeof schema>


export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      profile_type: user?.profile_type ?? 'individual_seeker',
      bio: user?.bio ?? '',
      phone: user?.phone ?? '',
      city: user?.city ?? '',
      state: user?.state ?? '',
      website: user?.website ?? '',
      availability: user?.availability ?? '',
      specialty: user?.specialty ?? '',
      communities_served: user?.communities_served ?? [],
      services_offered: user?.services_offered ?? [],
      services_needed: user?.services_needed ?? [],
    },
  })

  const watchedProfileType = watch('profile_type')

  if (!user) return null

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const payload: ProfileUpdateData = {
      profile_type: data.profile_type as ProfileType,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      website: data.website || undefined,
      availability: data.availability || undefined,
      specialty: data.specialty || undefined,
      communities_served: data.communities_served,
      services_offered: data.services_offered,
      services_needed: data.services_needed,
    }
    try {
      await updateProfile(payload)
      setEditing(false)
    } catch {
      setServerError('Failed to save profile. Please try again.')
    }
  }

  const onCancel = () => {
    reset({
      profile_type: user.profile_type,
      bio: user.bio ?? '',
      phone: user.phone ?? '',
      city: user.city ?? '',
      state: user.state ?? '',
      website: user.website ?? '',
      availability: user.availability ?? '',
      specialty: user.specialty ?? '',
      communities_served: user.communities_served ?? [],
      services_offered: user.services_offered ?? [],
      services_needed: user.services_needed ?? [],
    })
    setEditing(false)
    setServerError(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
          <p className="mt-1 text-gray-500">{user.email}</p>
        </div>
        {!editing && (
          <div className="flex items-center gap-2">
            {user.profile_type === 'individual_seeker' && user.intake_completed === true && (
              <Link to="/intake">
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Update needs
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit profile
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
          )}

          <Card>
            <CardHeader>Account type</CardHeader>
            <CardBody>
              <Controller
                name="profile_type"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {PROFILE_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={[
                          'w-full rounded-lg border-2 p-3 text-left transition-colors',
                          field.value === opt.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300',
                        ].join(' ')}
                      >
                        <p className="font-medium text-gray-900">{opt.label}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>About you</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  placeholder="Tell the community about yourself…"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {errors.bio && <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" placeholder="Chicago" {...register('city')} />
                <Input label="State" placeholder="IL" {...register('state')} />
              </div>
              <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" {...register('phone')} />
              <Input label="Website" type="url" placeholder="https://example.com" error={errors.website?.message} {...register('website')} />
            </CardBody>
          </Card>

          {watchedProfileType === 'individual_professional' && (
            <Card>
              <CardHeader>Professional details</CardHeader>
              <CardBody className="space-y-4">
                <Select
                  label="Specialty"
                  options={[
                    { value: '', label: 'Not specified' },
                    ...SPECIALTY_OPTIONS.map((s) => ({ value: s, label: s })),
                  ]}
                  {...register('specialty')}
                />
                <Controller
                  name="communities_served"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectChipInput
                      label="Communities served"
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Type and press Enter to add…"
                      error={errors.communities_served?.message}
                    />
                  )}
                />
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>Services &amp; availability</CardHeader>
            <CardBody className="space-y-4">
              <Controller
                name="services_offered"
                control={control}
                render={({ field }) => (
                  <MultiSelectChipInput
                    label="Services offered"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={SPECIALTY_OPTIONS}
                    placeholder="Select or type a service…"
                    error={errors.services_offered?.message}
                  />
                )}
              />
              <Controller
                name="services_needed"
                control={control}
                render={({ field }) => (
                  <MultiSelectChipInput
                    label="Services needed"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={Object.values(NEEDS_CATEGORY_LABELS)}
                    placeholder="Select or type a need…"
                    error={errors.services_needed?.message}
                  />
                )}
              />
              <Select
                label="Availability"
                options={[
                  { value: '', label: 'Not specified' },
                  { value: 'full_time', label: 'Full-time' },
                  { value: 'part_time', label: 'Part-time' },
                  { value: 'weekends', label: 'Weekends only' },
                  { value: 'flexible', label: 'Flexible' },
                ]}
                {...register('availability')}
              />
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              <Check className="mr-1.5 h-4 w-4" />
              Save profile
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Account type</p>
                <p className="mt-1 font-medium text-gray-900">{PROFILE_TYPE_LABELS[user.profile_type]}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>About</CardHeader>
            <CardBody className="space-y-3 text-sm text-gray-700">
              {user.bio ? (
                <p>{user.bio}</p>
              ) : (
                <p className="italic text-gray-400">No bio yet. Edit your profile to add one.</p>
              )}
              {(user.city || user.state) && (
                <p className="text-gray-500">{[user.city, user.state].filter(Boolean).join(', ')}</p>
              )}
              {user.phone && <p className="text-gray-500">{user.phone}</p>}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  {user.website}
                </a>
              )}
            </CardBody>
          </Card>

          {(user.services_offered.length > 0 || user.services_needed.length > 0 || user.availability) && (
            <Card>
              <CardHeader>Services &amp; availability</CardHeader>
              <CardBody className="space-y-3">
                {user.services_offered.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">Offering</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.services_offered.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {user.services_needed.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">Seeking</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.services_needed.map((s) => <Badge key={s} variant="warning">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {user.availability && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Availability</p>
                    <p className="text-sm capitalize text-gray-700">{user.availability.replace('_', ' ')}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {user.organizations.length > 0 && (
            <Card>
              <CardHeader>Organizations</CardHeader>
              <CardBody className="space-y-2">
                {user.organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between">
                    <Link to={`/organizations/${org.id}`} className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-indigo-600">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {org.name}
                    </Link>
                    <Badge variant={org.role === 'admin' ? 'info' : 'default'}>{org.role}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
