import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { useState } from 'react'
import type { ProfileType } from '../../types'
import { PROFILE_TYPE_OPTIONS } from '../../lib/utils'

const step1Schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

type Step1Data = z.infer<typeof step1Schema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [selectedType, setSelectedType] = useState<ProfileType>('individual_seeker')
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting: formSubmitting } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  })

  const onStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setServerErrors([])
    setStep(2)
  }

  const onSubmit = async () => {
    if (!step1Data) return
    setServerErrors([])
    setIsSubmitting(true)
    try {
      await registerUser({ ...step1Data, profile_type: selectedType })
      navigate(selectedType === 'individual_seeker' ? '/intake' : '/profile')
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors
      setServerErrors(errs || ['Registration failed. Please try again.'])
      setStep(1)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Join the CommunityConnect network</p>
        </div>

        <Card>
          <CardBody className="space-y-5">
            {serverErrors.length > 0 && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                <ul className="list-inside list-disc space-y-1">
                  {serverErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSubmit(onStep1)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First name"
                    placeholder="Jane"
                    error={errors.first_name?.message}
                    {...register('first_name')}
                  />
                  <Input
                    label="Last name"
                    placeholder="Smith"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                  />
                </div>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password_confirmation?.message}
                  {...register('password_confirmation')}
                />
                <Button type="submit" className="w-full" isLoading={formSubmitting}>
                  Continue
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="mb-3 text-sm font-medium text-gray-700">I am joining as a…</p>
                  <div className="space-y-2">
                    {PROFILE_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedType(opt.value as ProfileType)}
                        className={[
                          'w-full rounded-lg border-2 p-4 text-left transition-colors',
                          selectedType === opt.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300',
                        ].join(' ')}
                      >
                        <span role="heading" aria-level={3} className="block font-medium text-gray-900">
                          {opt.label}
                        </span>
                        <p className="mt-0.5 text-sm text-gray-500">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" isLoading={isSubmitting} onClick={onSubmit}>
                    Create account
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
