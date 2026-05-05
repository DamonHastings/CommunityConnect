import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyApplications, useWithdrawApplication } from '../../hooks/useApplications'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../lib/utils'
import { ClipboardList } from 'lucide-react'
import type { ApplicationStatus, ServiceApplication } from '../../types'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
}

export function MyApplicationsPage() {
  const { data, isLoading } = useMyApplications()
  const withdraw = useWithdrawApplication()
  const applications = data?.applications ?? []
  const [pendingWithdraw, setPendingWithdraw] = useState<ServiceApplication | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">My Applications</h1>
        <p className="mt-1 text-secondary">Track the status of opportunities you've applied to.</p>
      </div>

      <ConfirmDialog
        open={!!pendingWithdraw}
        title="Withdraw application?"
        message="This cannot be undone. The organization will no longer see your application."
        confirmLabel="Withdraw"
        danger
        onConfirm={() => {
          if (pendingWithdraw) {
            withdraw.mutate({ id: pendingWithdraw.id, opportunityId: pendingWithdraw.opportunity.id })
            setPendingWithdraw(null)
          }
        }}
        onCancel={() => setPendingWithdraw(null)}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-border" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted" />
            <p className="text-secondary">You haven't applied to any opportunities yet.</p>
            <Link to="/opportunities" className="mt-3 inline-block">
              <Button size="sm" variant="outline">Browse opportunities</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const config = STATUS_CONFIG[app.status]
            return (
              <Card key={app.id}>
                <CardBody className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={`/opportunities/${app.opportunity.id}`}
                      className="font-semibold text-heading hover:text-primary"
                    >
                      {app.opportunity.title}
                    </Link>
                    <p className="text-sm text-secondary">
                      <Link
                        to={`/organizations/${app.opportunity.organization.id}`}
                        className="hover:text-primary"
                      >
                        {app.opportunity.organization.name}
                      </Link>
                    </p>
                    {app.message && (
                      <p className="mt-1 text-sm text-secondary line-clamp-1">{app.message}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">Applied {formatDate(app.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {app.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={withdraw.isPending}
                        onClick={() => setPendingWithdraw(app)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
