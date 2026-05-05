import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { MultiSelectChipInput } from '../components/ui/MultiSelectChipInput'

const SPECIALTY_OPTIONS = [
  'Legal',
  'Medical / Healthcare',
  'Mental Health / Counseling',
  'Education / Tutoring',
  'Financial / Accounting',
  'Technology',
  'Social Work',
  'Career Coaching',
  'Other',
]

const NEEDS_OPTIONS = [
  'Food & nutrition',
  'Housing & shelter',
  'Healthcare',
  'Mental health',
  'Job training & employment',
  'Education',
  'Transportation',
  'Legal aid',
  'Financial assistance',
  'Childcare',
  'Substance use support',
  'Other',
]

function Controlled({
  options,
  label,
  placeholder,
  error,
  initialValue = [],
}: {
  options?: string[]
  label?: string
  placeholder?: string
  error?: string
  initialValue?: string[]
}) {
  const [value, setValue] = useState<string[]>(initialValue)
  return (
    <div className="max-w-sm">
      <MultiSelectChipInput
        label={label}
        value={value}
        onChange={setValue}
        options={options}
        placeholder={placeholder}
        error={error}
      />
      {value.length > 0 && (
        <p className="mt-2 font-mono text-xs text-muted">value: {JSON.stringify(value)}</p>
      )}
    </div>
  )
}

const meta: Meta<typeof MultiSelectChipInput> = {
  title: 'UI/MultiSelectChipInput',
  component: MultiSelectChipInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof MultiSelectChipInput>

export const Freeform: Story = {
  name: 'Freeform (no options)',
  render: () => (
    <Controlled
      label="Communities served"
      placeholder="Type a value and press Enter or comma…"
    />
  ),
}

export const WithOptions: Story = {
  name: 'With autocomplete options',
  render: () => (
    <Controlled
      label="Specialties"
      options={SPECIALTY_OPTIONS}
      placeholder="Search or type a specialty…"
    />
  ),
}

export const PrePopulated: Story = {
  name: 'Pre-populated chips',
  render: () => (
    <Controlled
      label="Services offered"
      options={SPECIALTY_OPTIONS}
      placeholder="Add more…"
      initialValue={['Legal', 'Social Work']}
    />
  ),
}

export const NeedsCategories: Story = {
  name: 'Needs categories',
  render: () => (
    <Controlled
      label="Services needed"
      options={NEEDS_OPTIONS}
      placeholder="Search needs…"
      initialValue={['Food & nutrition', 'Housing & shelter']}
    />
  ),
}

export const WithError: Story = {
  name: 'With error',
  render: () => (
    <Controlled
      label="Required field"
      placeholder="Add at least one value"
      error="At least one item is required."
    />
  ),
}
