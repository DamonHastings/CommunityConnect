import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../components/ui/Button'
import { Trash2, Plus, ArrowRight } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant:   { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size:      { control: 'select', options: ['sm', 'md', 'lg'] },
    isLoading: { control: 'boolean' },
    disabled:  { control: 'boolean' },
  },
  args: { children: 'Button', variant: 'primary', size: 'md' },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story   = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Outline: Story   = { args: { variant: 'outline' } }
export const Ghost: Story     = { args: { variant: 'ghost' } }
export const Danger: Story    = { args: { children: 'Delete', variant: 'danger' } }
export const Loading: Story   = { args: { children: 'Saving…', isLoading: true } }
export const Disabled: Story  = { args: { disabled: true } }

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-4">
      {(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const).map((v) => (
        <Button key={v} variant={v}>{v}</Button>
      ))}
    </div>
  ),
}

export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div className="flex items-center gap-3 p-4">
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Button key={s} size={s}>{s}</Button>
      ))}
    </div>
  ),
}

export const WithIcons: Story = {
  name: 'With icons',
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-4">
      <Button><Plus className="mr-1.5 h-4 w-4" />New</Button>
      <Button variant="danger"><Trash2 className="mr-1.5 h-4 w-4" />Delete</Button>
      <Button variant="outline">Continue <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
    </div>
  ),
}
