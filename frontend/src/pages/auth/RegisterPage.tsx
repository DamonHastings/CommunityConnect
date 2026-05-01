import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardBody } from '../../components/ui/Card'
import { useState } from 'react'

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverErrors, setServerErrors] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerErrors([])
    try {
      await registerUser(data)
      navigate('/dashboard')
    } catch (err: unknown) {
      const errs = (err as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors
      setServerErrors(errs || ['Registration failed. Please try again.'])
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Create account
              </Button>
            </form>

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
