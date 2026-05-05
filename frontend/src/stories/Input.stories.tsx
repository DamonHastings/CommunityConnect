import type { Meta, StoryObj } from '@storybook/react'
import { Input } from '../components/ui/Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label:       { control: 'text' },
    error:       { control: 'text' },
    placeholder: { control: 'text' },
    disabled:    { control: 'boolean' },
    type:        { control: 'select', options: ['text', 'email', 'password', 'tel', 'url', 'number'] },
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Empty: Story = {
  args: { placeholder: 'Enter a value…' },
}

export const WithLabel: Story = {
  args: { label: 'Email address', placeholder: 'you@example.com', type: 'email' },
}

export const WithError: Story = {
  args: {
    label: 'Email address',
    defaultValue: 'not-an-email',
    error: 'Please enter a valid email address.',
  },
}

export const Disabled: Story = {
  args: { label: 'Username', defaultValue: 'johndoe', disabled: true },
}

export const Password: Story = {
  args: { label: 'Password', type: 'password', placeholder: '••••••••' },
}

export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm p-4">
      <Input label="Default" placeholder="Enter a value…" />
      <Input label="With value" defaultValue="Some value" />
      <Input label="With error" defaultValue="bad input" error="This field has an error." />
      <Input label="Disabled" defaultValue="Read only value" disabled />
    </div>
  ),
}
