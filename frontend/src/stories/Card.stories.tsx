import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Building2, MapPin } from 'lucide-react'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof Card>

export const Simple: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardBody>
        <p className="text-secondary">A simple card with body content only.</p>
      </CardBody>
    </Card>
  ),
}

export const WithHeaderAndFooter: Story = {
  name: 'With header and footer',
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <h3 className="text-base font-semibold text-heading">Card Title</h3>
        <p className="mt-0.5 text-sm text-muted">Optional subtitle or description</p>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-secondary">Main content area of the card goes here.</p>
      </CardBody>
      <CardFooter>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button variant="primary" size="sm">Save changes</Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

export const OrganizationCard: Story = {
  name: 'Organization card example',
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-subtle">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-heading">City Food Bank</h3>
              <p className="text-xs text-muted">Nonprofit</p>
            </div>
          </div>
          <Badge variant="success">Verified</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <p className="mb-3 text-sm text-secondary">Providing emergency food assistance to families across the metro area.</p>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          Chicago, IL
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex gap-2">
          <Badge variant="info">Food Bank</Badge>
          <Badge variant="warning">Volunteers needed</Badge>
        </div>
      </CardFooter>
    </Card>
  ),
}

export const Grid: Story = {
  name: 'Card grid',
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      {['Dashboard', 'Organizations', 'Programs', 'Opportunities'].map((label) => (
        <Card key={label}>
          <CardBody>
            <p className="font-medium text-heading">{label}</p>
            <p className="mt-1 text-sm text-muted">Manage your {label.toLowerCase()}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  ),
}
