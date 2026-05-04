import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateOrganization, useUpdateOrganization, useOrganization } from '../../hooks/useOrganizations'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { CATEGORY_LABELS, ORG_TYPE_OPTIONS } from '../../lib/utils'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  org_type: z.string().optional(),
  description: z.string().optional(),
  mission: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

export function OrganizationFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const [serverErrors, setServerErrors] = useState<string[]>([])

  const { data: existing } = useOrganization(id ?? '')
  const createMutation = useCreateOrganization()
  const updateMutation = useUpdateOrganization(id ?? '')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        org_type: existing.org_type ?? 'nonprofit',
        description: existing.description ?? '',
        mission: existing.mission ?? '',
        category: existing.category,
        website: existing.website ?? '',
        contact_email: existing.contact_email ?? '',
        phone: existing.phone ?? '',
        address: existing.address ?? '',
        city: existing.city ?? '',
        state: existing.state ?? '',
        zip: existing.zip ?? '',
        country: existing.country ?? '',
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: FormData) => {
    setServerErrors([])
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      )
      if (isEditing) {
        const updated = await updateMutation.mutateAsync(cleaned)
        navigate(`/organizations/${updated.id}`)
      } else {
        const created = await createMutation.mutateAsync(cleaned)
        navigate(`/organizations/${created.id}`)
      }
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors
      setServerErrors(errs || ['Something went wrong. Please try again.'])
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEditing ? 'Edit Organization' : 'Add Your Organization'}
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
          <CardHeader><h2 className="font-semibold text-gray-900">Basic Information</h2></CardHeader>
          <CardBody className="space-y-4">
            <Input label="Organization name *" error={errors.name?.message} {...register('name')} />
            <Select
              label="Organization type"
              options={ORG_TYPE_OPTIONS}
              {...register('org_type')}
            />
            <Select
              label="Category *"
              options={CATEGORY_OPTIONS}
              placeholder="Select a category"
              error={errors.category?.message}
              {...register('category')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                placeholder="Brief overview of your organization..."
                {...register('description')}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Mission statement</label>
              <textarea
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={3}
                placeholder="What is your organization's mission?"
                {...register('mission')}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-gray-900">Contact & Location</h2></CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Contact email" type="email" error={errors.contact_email?.message} {...register('contact_email')} />
              <Input label="Phone" type="tel" {...register('phone')} />
            </div>
            <Input label="Website" type="url" placeholder="https://..." error={errors.website?.message} {...register('website')} />
            <Input label="Street address" {...register('address')} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-2">
                <Input label="City" {...register('city')} />
              </div>
              <Input label="State" {...register('state')} />
              <Input label="ZIP" {...register('zip')} />
            </div>
            <Input label="Country" defaultValue="US" {...register('country')} />
          </CardBody>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Create organization'}
          </Button>
        </div>
      </form>
    </div>
  )
}
