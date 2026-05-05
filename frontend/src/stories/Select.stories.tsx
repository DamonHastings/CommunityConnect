import type { Meta, StoryObj } from '@storybook/react'
import { Select } from '../components/ui/Select'

const ORG_TYPE_OPTIONS = [
  { value: 'nonprofit',  label: 'Nonprofit / Community Org' },
  { value: 'business',   label: 'Business / Service Provider' },
  { value: 'school',     label: 'School / Institution' },
  { value: 'foundation', label: 'Foundation / Funder' },
]

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  args: { options: ORG_TYPE_OPTIONS },
  argTypes: {
    label:    { control: 'text' },
    error:    { control: 'text' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Select>

export const WithPlaceholder: Story = {
  args: { label: 'Organization type', placeholder: 'Select a type…' },
}

export const WithSelection: Story = {
  args: { label: 'Organization type', defaultValue: 'nonprofit' },
}

export const WithError: Story = {
  args: { label: 'Organization type', error: 'Please select a type.' },
}

export const Disabled: Story = {
  args: { label: 'Organization type', defaultValue: 'nonprofit', disabled: true },
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm p-4">
      <Select label="Default" placeholder="Select…" options={ORG_TYPE_OPTIONS} />
      <Select label="With value" defaultValue="business" options={ORG_TYPE_OPTIONS} />
      <Select label="With error" error="Required field." options={ORG_TYPE_OPTIONS} />
      <Select label="Disabled" defaultValue="school" disabled options={ORG_TYPE_OPTIONS} />
    </div>
  ),
}
