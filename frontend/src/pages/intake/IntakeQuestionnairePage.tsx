import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import type { HousingStatus, EmploymentStatus, IntakeUrgency, IntakeFormData } from '../../types'

const HOUSING_OPTIONS: { value: HousingStatus; label: string }[] = [
  { value: 'stable', label: 'I have stable housing' },
  { value: 'at_risk', label: 'I am at risk of losing housing' },
  { value: 'transitional', label: 'I am in transitional or shelter housing' },
  { value: 'experiencing_homelessness', label: 'I am currently experiencing homelessness' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const EMPLOYMENT_OPTIONS: { value: EmploymentStatus; label: string }[] = [
  { value: 'employed_full_time', label: 'Employed full-time' },
  { value: 'employed_part_time', label: 'Employed part-time' },
  { value: 'unemployed_seeking', label: 'Unemployed and looking for work' },
  { value: 'unemployed_not_seeking', label: 'Unemployed and not seeking work' },
  { value: 'self_employed', label: 'Self-employed or freelance' },
  { value: 'unable_to_work', label: 'Unable to work' },
]

const NEEDS_OPTIONS = [
  { value: 'food_nutrition', label: 'Food & nutrition' },
  { value: 'housing_shelter', label: 'Housing & shelter' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'mental_health', label: 'Mental health' },
  { value: 'job_training', label: 'Job training & employment' },
  { value: 'education', label: 'Education' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'legal_aid', label: 'Legal aid' },
  { value: 'financial_assistance', label: 'Financial assistance' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'substance_use_support', label: 'Substance use support' },
  { value: 'other', label: 'Other' },
]

const URGENCY_OPTIONS: { value: IntakeUrgency; label: string; description: string }[] = [
  { value: 'immediate', label: 'I need help immediately', description: 'Crisis or urgent situation' },
  { value: 'within_weeks', label: 'Within the next few weeks', description: 'Pressing but not a crisis' },
  { value: 'within_months', label: 'Within the next few months', description: 'Planning ahead' },
  { value: 'ongoing', label: 'Ongoing / long-term support', description: 'Continuous help over time' },
]

const TOTAL_STEPS = 3

interface StepData {
  housing_status: HousingStatus | null
  employment_status: EmploymentStatus | null
  needs_categories: string[]
  urgency: IntakeUrgency | null
  goals: string
  barriers: string
  preferred_contact: string
}

function RadioCard<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description?: string }[]
  value: T | null
  onChange: (v: T) => void
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={[
            'w-full rounded-lg border-2 p-3 text-left transition-colors',
            value === opt.value
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300',
          ].join(' ')}
        >
          <p className="font-medium text-gray-900 text-sm">{opt.label}</p>
          {opt.description && <p className="mt-0.5 text-xs text-gray-500">{opt.description}</p>}
        </button>
      ))}
    </div>
  )
}

export function IntakeQuestionnairePage() {
  const { submitIntake } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [data, setData] = useState<StepData>({
    housing_status: null,
    employment_status: null,
    needs_categories: [],
    urgency: null,
    goals: '',
    barriers: '',
    preferred_contact: 'email',
  })

  const set = <K extends keyof StepData>(key: K, value: StepData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }))

  const toggleNeed = (value: string) => {
    setData((prev) => ({
      ...prev,
      needs_categories: prev.needs_categories.includes(value)
        ? prev.needs_categories.filter((v) => v !== value)
        : [...prev.needs_categories, value],
    }))
  }

  const step1Valid = data.housing_status !== null && data.employment_status !== null
  const step2Valid = data.needs_categories.length > 0 && data.urgency !== null

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)

  const handleSubmit = async () => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await submitIntake(data as IntakeFormData)
      navigate('/dashboard')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Tell us about yourself</h1>
          <span className="text-sm text-gray-500">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <p className="text-gray-600 text-sm">
          This helps us connect you with the right resources and services.
        </p>
        <div className="mt-4 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors',
                i < step ? 'bg-indigo-600' : 'bg-gray-200',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Card>
            <CardHeader>What is your current housing situation?</CardHeader>
            <CardBody>
              <RadioCard
                options={HOUSING_OPTIONS}
                value={data.housing_status}
                onChange={(v) => set('housing_status', v)}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>What is your current employment status?</CardHeader>
            <CardBody>
              <RadioCard
                options={EMPLOYMENT_OPTIONS}
                value={data.employment_status}
                onChange={(v) => set('employment_status', v)}
              />
            </CardBody>
          </Card>

          <Button className="w-full" disabled={!step1Valid} onClick={handleNext}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <Card>
            <CardHeader>What types of support are you looking for?</CardHeader>
            <CardBody>
              <p className="mb-3 text-xs text-gray-500">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {NEEDS_OPTIONS.map((opt) => {
                  const selected = data.needs_categories.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleNeed(opt.value)}
                      className={[
                        'rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors',
                        selected
                          ? 'border-indigo-600 bg-indigo-50 font-medium text-indigo-700'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>How urgently do you need support?</CardHeader>
            <CardBody>
              <RadioCard
                options={URGENCY_OPTIONS}
                value={data.urgency}
                onChange={(v) => set('urgency', v)}
              />
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
            <Button className="flex-1" disabled={!step2Valid} onClick={handleNext}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <Card>
            <CardHeader>Your goals</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  What are you hoping to achieve? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={data.goals}
                  onChange={(e) => set('goals', e.target.value)}
                  placeholder="e.g. Find stable housing, get a job, improve my mental health…"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Are there any obstacles we should know about? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={data.barriers}
                  onChange={(e) => set('barriers', e.target.value)}
                  placeholder="e.g. No transportation, limited English, lack of documentation…"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Preferred way to be contacted</CardHeader>
            <CardBody>
              <div className="flex gap-3">
                {(['email', 'phone', 'either'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set('preferred_contact', opt)}
                    className={[
                      'flex-1 rounded-lg border-2 py-2.5 text-sm font-medium capitalize transition-colors',
                      data.preferred_contact === opt
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
            <Button className="flex-1" isLoading={isSubmitting} onClick={handleSubmit}>
              Finish setup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
