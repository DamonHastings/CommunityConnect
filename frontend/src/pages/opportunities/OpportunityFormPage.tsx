import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateOpportunity } from '../../hooks/useOpportunities'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { OPPORTUNITY_TYPE_LABELS } from '../../lib/utils'
import { useState } from 'react'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  opportunity_type: z.string().min(1, 'Type is required'),
  status: z.string(),
  remote: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  requirements: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS = Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'filled', label: 'Filled' },
]

export function OpportunityFormPage() {
  const { id: orgId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const createMutation = useCreateOpportunity(orgId!)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'open', remote: false },
  })

  const onSubmit = async (data: FormData) => {
    setServerErrors([])
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      )
      await createMutation.mutateAsync(cleaned)
      navigate(`/organizations/${orgId}`)
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors
      setServerErrors(errs || ['Something went wrong.'])
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Engagement Opportunity</h1>

      {serverErrors.length > 0 && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <ul className="list-inside list-disc space-y-1">
            {serverErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Opportunity Details</h2></CardHeader>
          <CardBody className="space-y-4">
            <Input label="Title *" error={errors.title?.message} {...register('title')} />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Type *"
                options={TYPE_OPTIONS}
                placeholder="Select type"
                error={errors.opportunity_type?.message}
                {...register('opportunity_type')}
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Requirements</label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                {...register('requirements')}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Schedule & Contact</h2></CardHeader>
          <CardBody className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" {...register('remote')} className="rounded border-gray-300" />
              Remote opportunity
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start date" type="date" {...register('start_date')} />
              <Input label="End date" type="date" {...register('end_date')} />
            </div>
            <Input
              label="Contact email"
              type="email"
              error={errors.contact_email?.message}
              {...register('contact_email')}
            />
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>Create opportunity</Button>
        </div>
      </form>
    </div>
  )
}
