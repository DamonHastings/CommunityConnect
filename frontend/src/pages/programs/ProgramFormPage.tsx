import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateProgram, useUpdateProgram, useProgram } from '../../hooks/usePrograms'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { PROGRAM_TYPE_LABELS, PROGRAM_STATUS_LABELS } from '../../lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  program_type: z.string().min(1, 'Type is required'),
  status: z.string().min(1),
  description: z.string().optional(),
  goals: z.string().optional(),
  capacity: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  remote: z.boolean(),
  city: z.string().optional(),
  state: z.string().optional(),
  starts_on: z.string().optional(),
  ends_on: z.string().optional(),
  application_opens_at: z.string().optional(),
  application_closes_at: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS = Object.entries(PROGRAM_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = Object.entries(PROGRAM_STATUS_LABELS).map(([value, label]) => ({ value, label }))

export function ProgramFormPage() {
  const { orgId, id: programId } = useParams<{ orgId: string; id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!programId

  const { data: existing, isLoading: loadingExisting } = useProgram(programId)

  const adminOrgs = user?.organizations.filter((m) => m.role === 'admin') ?? []
  const resolvedOrgId = orgId ?? (existing ? String(existing.organization.id) : adminOrgs[0]?.id?.toString() ?? '')

  const createMutation = useCreateProgram(resolvedOrgId)
  const updateMutation = useUpdateProgram(programId ?? '')
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState(resolvedOrgId)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft', remote: false, program_type: 'workshop' },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        program_type: existing.program_type,
        status: existing.status,
        description: existing.description ?? '',
        goals: existing.goals ?? '',
        capacity: existing.capacity ? String(existing.capacity) : '',
        contact_email: existing.contact_email ?? '',
        remote: existing.remote,
        city: existing.city ?? '',
        state: existing.state ?? '',
        starts_on: existing.starts_on ?? '',
        ends_on: existing.ends_on ?? '',
        application_opens_at: existing.application_opens_at
          ? existing.application_opens_at.slice(0, 16)
          : '',
        application_closes_at: existing.application_closes_at
          ? existing.application_closes_at.slice(0, 16)
          : '',
      })
    }
  }, [existing, reset])

  if (isEdit && loadingExisting) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
  }

  if (!isEdit && adminOrgs.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        You must be an organization admin to create programs.
      </div>
    )
  }

  const orgOptions = adminOrgs.map((m) => ({ value: String(m.id), label: m.name }))

  const onSubmit = async (data: FormData) => {
    setServerErrors([])
    try {
      const payload = {
        ...data,
        capacity: data.capacity ? Number(data.capacity) : undefined,
      }
      const cleaned = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== '' && v !== undefined)
      )
      if (isEdit) {
        await updateMutation.mutateAsync(cleaned)
        navigate(`/programs/${programId}`)
      } else {
        const created = await createMutation.mutateAsync(cleaned)
        navigate(`/programs/${created.id}`)
      }
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors
      setServerErrors(errs || ['Something went wrong.'])
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit Program' : 'Create Program'}
      </h1>

      {serverErrors.length > 0 && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <ul className="list-inside list-disc space-y-1">
            {serverErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Program Details</h2></CardHeader>
          <CardBody className="space-y-4">
            {!isEdit && adminOrgs.length > 1 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Organization *</label>
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                >
                  {orgOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}
            <Input label="Title *" error={errors.title?.message} {...register('title')} />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type *"
                options={TYPE_OPTIONS}
                error={errors.program_type?.message}
                {...register('program_type')}
              />
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                {...register('status')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={4}
                {...register('description')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Goals</label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                {...register('goals')}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Capacity (max participants)" type="number" min={1} {...register('capacity')} />
              <Input
                label="Contact email"
                type="email"
                error={errors.contact_email?.message}
                {...register('contact_email')}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Location & Dates</h2></CardHeader>
          <CardBody className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" {...register('remote')} className="rounded border-gray-300" />
              Remote program
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" {...register('city')} />
              <Input label="State" {...register('state')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Program start" type="date" {...register('starts_on')} />
              <Input label="Program end" type="date" {...register('ends_on')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Applications open" type="datetime-local" {...register('application_opens_at')} />
              <Input label="Applications close" type="datetime-local" {...register('application_closes_at')} />
            </div>
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create program'}
          </Button>
        </div>
      </form>
    </div>
  )
}
