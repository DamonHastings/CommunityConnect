import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../components/ui/Badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger', 'info'] },
  },
  args: { children: 'Badge', variant: 'default' },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'Default',  variant: 'default'  } }
export const Success: Story = { args: { children: 'Active',   variant: 'success'  } }
export const Warning: Story = { args: { children: 'Pending',  variant: 'warning'  } }
export const Danger:  Story = { args: { children: 'Rejected', variant: 'danger'   } }
export const Info:    Story = { args: { children: 'New',      variant: 'info'     } }

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div className="flex flex-wrap items-center gap-2 p-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="danger">Rejected</Badge>
      <Badge variant="info">New</Badge>
    </div>
  ),
}

export const StatusExamples: Story = {
  name: 'Status examples',
  render: () => (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-secondary">Application:</span>
        <Badge variant="warning">Pending review</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-secondary">Application:</span>
        <Badge variant="success">Approved</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-secondary">Application:</span>
        <Badge variant="danger">Rejected</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-secondary">Organization:</span>
        <Badge variant="info">Verified</Badge>
      </div>
    </div>
  ),
}
