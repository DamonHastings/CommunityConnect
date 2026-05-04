import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyApplications, useWithdrawApplication } from '../../hooks/useApplications'
import { useMyProgramApplications, useWithdrawProgramApplication } from '../../hooks/useProgramApplications'
import { useSavedOrganizations, useUnsaveOrganization } from '../../hooks/useSavedOrganizations'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { OrganizationCard } from '../../components/organizations/OrganizationCard'
import { formatDate } from '../../lib/utils'
import { ClipboardList, Bookmark, ChevronDown, ChevronRight, Clock, CheckCircle, GraduationCap } from 'lucide-react'
import type { ApplicationStatus } from '../../types'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Connected', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-4 text-center shadow-sm">
      <div className="mb-1 text-indigo-600">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

export function MyServicesPage() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const { data: appsData, isLoading: appsLoading } = useMyApplications()
  const { data: progAppsData, isLoading: progAppsLoading } = useMyProgramApplications()
  const { data: savedData, isLoading: savedLoading } = useSavedOrganizations()
  const withdraw = useWithdrawApplication()
  const withdrawProgram = useWithdrawProgramApplication()
  const unsave = useUnsaveOrganization()

  const applications = appsData?.applications ?? []
  const programApplications = progAppsData?.applications ?? []
  const savedOrgs = savedData?.organizations ?? []

  const activeApps = applications.filter((a) => a.status === 'pending' || a.status === 'approved')
  const historyApps = applications.filter((a) => a.status === 'rejected' || a.status === 'withdrawn')
  const pendingCount = applications.filter((a) => a.status === 'pending').length
  const connectedCount = applications.filter((a) => a.status === 'approved').length
  const activeProgramApps = programApplications.filter((a) => a.status === 'pending' || a.status === 'approved')
  const historyProgramApps = programApplications.filter((a) => a.status === 'rejected' || a.status === 'withdrawn')

  const isLoading = appsLoading || savedLoading || progAppsLoading

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
        <p className="mt-1 text-gray-600">Track your applications, connections, and saved organizations.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={pendingCount} label="Pending" icon={<Clock className="h-5 w-5" />} />
        <StatCard value={connectedCount} label="Connected" icon={<CheckCircle className="h-5 w-5" />} />
        <StatCard value={savedOrgs.length} label="Saved" icon={<Bookmark className="h-5 w-5" />} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : (
        <>
          {/* Active Applications */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              Active Applications
              {activeApps.length > 0 && (
                <span className="text-sm font-normal text-gray-500">({activeApps.length})</span>
              )}
            </h2>
            {activeApps.length === 0 ? (
              <Card>
                <CardBody className="py-8 text-center">
                  <p className="text-gray-500">No active applications.</p>
                  <Link to="/opportunities" className="mt-2 inline-block">
                    <Button size="sm" variant="outline">Browse opportunities</Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-2">
                {activeApps.map((app) => {
                  const config = STATUS_CONFIG[app.status]
                  return (
                    <Card key={app.id}>
                      <CardBody className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link
                            to={`/opportunities/${app.opportunity.id}`}
                            className="font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            {app.opportunity.title}
                          </Link>
                          <p className="text-sm text-gray-500">
                            <Link to={`/organizations/${app.opportunity.organization.id}`} className="hover:text-indigo-600">
                              {app.opportunity.organization.name}
                            </Link>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <Badge variant={config.variant}>{config.label}</Badge>
                          {app.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={withdraw.isPending}
                              onClick={() => withdraw.mutate({ id: app.id, opportunityId: app.opportunity.id })}
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
          </section>

          {/* Program Applications */}
          {(activeProgramApps.length > 0 || historyProgramApps.length > 0) && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Program Applications
                {activeProgramApps.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">({activeProgramApps.length} active)</span>
                )}
              </h2>
              {activeProgramApps.length === 0 ? null : (
                <div className="space-y-2">
                  {activeProgramApps.map((app) => {
                    const cfg = STATUS_CONFIG[app.status]
                    return (
                      <Card key={app.id}>
                        <CardBody className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link to={`/programs/${app.program.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                              {app.program.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              <Link to={`/organizations/${app.program.organization.id}`} className="hover:text-indigo-600">
                                {app.program.organization.name}
                              </Link>
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <Badge variant={cfg.variant}>{cfg.label}</Badge>
                            {app.status === 'pending' && (
                              <Button size="sm" variant="outline" disabled={withdrawProgram.isPending}
                                onClick={() => withdrawProgram.mutate({ id: app.id, programId: app.program.id })}>
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
              {historyProgramApps.length > 0 && (
                <div className="mt-2 space-y-2">
                  {historyProgramApps.map((app) => {
                    const cfg = STATUS_CONFIG[app.status]
                    return (
                      <Card key={app.id}>
                        <CardBody className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link to={`/programs/${app.program.id}`} className="font-semibold text-gray-700 hover:text-indigo-600">
                              {app.program.title}
                            </Link>
                            <p className="text-sm text-gray-500">{app.program.organization.name}</p>
                            <p className="mt-0.5 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                          </div>
                          <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Saved Organizations */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Bookmark className="h-5 w-5 text-indigo-600" />
              Saved Organizations
              {savedOrgs.length > 0 && (
                <span className="text-sm font-normal text-gray-500">({savedOrgs.length})</span>
              )}
            </h2>
            {savedOrgs.length === 0 ? (
              <Card>
                <CardBody className="py-8 text-center">
                  <p className="text-gray-500">No saved organizations yet.</p>
                  <Link to="/organizations" className="mt-2 inline-block">
                    <Button size="sm" variant="outline">Browse organizations</Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedOrgs.map((org) => (
                  <div key={org.id} className="relative">
                    <OrganizationCard organization={org} />
                    <button
                      onClick={() => unsave.mutate(org.id)}
                      className="absolute right-10 top-3 z-10 rounded p-0.5 text-indigo-600 hover:text-red-500 transition-colors"
                      title="Remove from saved"
                    >
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* History (collapsible) */}
          {historyApps.length > 0 && (
            <section>
              <button
                className="flex items-center gap-2 text-lg font-semibold text-gray-900"
                onClick={() => setHistoryOpen((v) => !v)}
              >
                {historyOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                History
                <span className="text-sm font-normal text-gray-500">({historyApps.length})</span>
              </button>
              {historyOpen && (
                <div className="mt-3 space-y-2">
                  {historyApps.map((app) => {
                    const config = STATUS_CONFIG[app.status]
                    return (
                      <Card key={app.id}>
                        <CardBody className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              to={`/opportunities/${app.opportunity.id}`}
                              className="font-semibold text-gray-700 hover:text-indigo-600"
                            >
                              {app.opportunity.title}
                            </Link>
                            <p className="text-sm text-gray-500">{app.opportunity.organization.name}</p>
                            <p className="mt-0.5 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                          </div>
                          <Badge variant={config.variant}>{config.label}</Badge>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
