import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProgram } from '../../hooks/usePrograms'
import { useApplyToProgram, useWithdrawProgramApplication, useProgramApplications, useUpdateProgramApplication } from '../../hooks/useProgramApplications'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PROGRAM_TYPE_LABELS, PROGRAM_STATUS_LABELS, formatDate } from '../../lib/utils'
import { Calendar, MapPin, Mail, Building2, ArrowLeft, Users, Pencil, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Undo2 } from 'lucide-react'
import type { ApplicationStatus } from '../../types'

const STATUS_VARIANTS: Record<string, 'warning' | 'info' | 'success' | 'default' | 'error'> = {
  draft: 'warning', published: 'info', active: 'success', completed: 'default', cancelled: 'error',
}

const APP_STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
  pending: { label: 'Application Pending', variant: 'warning', icon: <Clock className="h-4 w-4" /> },
  approved: { label: 'Application Approved', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Application Rejected', variant: 'error', icon: <XCircle className="h-4 w-4" /> },
  withdrawn: { label: 'Application Withdrawn', variant: 'default', icon: <Undo2 className="h-4 w-4" /> },
}

function AdminApplicationsPanel({ programId }: { programId: number }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useProgramApplications(open ? programId : undefined)
  const update = useUpdateProgramApplication()
  const apps = data?.applications ?? []

  return (
    <div className="border-t pt-4">
      <button
        className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        Applications {data ? `(${apps.length})` : ''}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {isLoading && <p className="text-sm text-gray-400">Loading…</p>}
          {!isLoading && apps.length === 0 && (
            <p className="text-sm text-gray-400">No applications yet.</p>
          )}
          {apps.map((app) => (
            <div key={app.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{app.applicant.name}</p>
                  <p className="text-gray-500">{app.applicant.email}</p>
                  {app.message && <p className="mt-1 text-gray-600 line-clamp-2">{app.message}</p>}
                  <p className="mt-1 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'error' : 'default'}>
                    {app.status}
                  </Badge>
                  {app.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" disabled={update.isPending}
                        onClick={() => update.mutate({ id: app.id, status: 'approved' })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={update.isPending}
                        onClick={() => update.mutate({ id: app.id, status: 'rejected' })}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: program, isLoading } = useProgram(id)
  const [message, setMessage] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)

  const apply = useApplyToProgram(Number(id))
  const withdraw = useWithdrawProgramApplication()

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
  if (!program) return <div className="py-16 text-center text-gray-500">Program not found.</div>

  const isAdmin = user?.organizations.some((m) => m.id === program.organization.id && m.role === 'admin')
  const myApp = program.my_application
  const canApply = user && program.applications_open && !myApp && !isAdmin

  const handleApply = () => {
    apply.mutate(message, {
      onSuccess: () => { setApplyOpen(false); setMessage('') },
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/programs" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to programs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <Badge variant="info">{PROGRAM_TYPE_LABELS[program.program_type]}</Badge>
              <Badge variant={STATUS_VARIANTS[program.status]}>
                {PROGRAM_STATUS_LABELS[program.status]}
              </Badge>
              {isAdmin && (
                <Link to={`/programs/${program.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {program.applications_open && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-green-200">
              Applications are currently open
              {program.application_closes_at && ` — closes ${formatDate(program.application_closes_at)}`}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              <Link to={`/organizations/${program.organization.id}`} className="text-indigo-600 hover:underline">
                {program.organization.name}
              </Link>
            </span>
            {program.remote ? (
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />Remote</span>
            ) : (program.city || program.state) ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {[program.city, program.state].filter(Boolean).join(', ')}
              </span>
            ) : null}
            {program.starts_on && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(program.starts_on)}
                {program.ends_on && ` – ${formatDate(program.ends_on)}`}
              </span>
            )}
            {program.capacity && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />{program.capacity} spots
              </span>
            )}
            {program.contact_email && (
              <a href={`mailto:${program.contact_email}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                <Mail className="h-4 w-4" />{program.contact_email}
              </a>
            )}
          </div>

          {program.description && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{program.description}</p>
            </div>
          )}

          {program.goals && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Goals</h2>
              <p className="text-gray-700 whitespace-pre-line">{program.goals}</p>
            </div>
          )}

          {(program.application_opens_at || program.application_closes_at) && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Application Window</h2>
              <p className="text-sm text-gray-600">
                {program.application_opens_at && `Opens: ${formatDate(program.application_opens_at)}`}
                {program.application_opens_at && program.application_closes_at && ' · '}
                {program.application_closes_at && `Closes: ${formatDate(program.application_closes_at)}`}
              </p>
            </div>
          )}

          {/* Apply / application status */}
          {user && (
            <div className="border-t pt-4">
              {myApp ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {APP_STATUS_CONFIG[myApp.status].icon}
                    <span className="text-sm font-medium text-gray-700">
                      {APP_STATUS_CONFIG[myApp.status].label}
                    </span>
                  </div>
                  {myApp.status === 'pending' && (
                    <Button variant="outline" size="sm"
                      disabled={withdraw.isPending}
                      onClick={() => withdraw.mutate({ id: myApp.id, programId: Number(id) })}>
                      Withdraw
                    </Button>
                  )}
                </div>
              ) : canApply ? (
                applyOpen ? (
                  <div className="space-y-3">
                    <h2 className="font-semibold text-gray-900">Apply to this program</h2>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Optional: tell the organizers why you're interested…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    {apply.error && (
                      <p className="text-sm text-red-600">
                        {(apply.error as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ?? 'Something went wrong'}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={handleApply} disabled={apply.isPending}>
                        {apply.isPending ? 'Submitting…' : 'Submit Application'}
                      </Button>
                      <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setApplyOpen(true)}>Apply to this program</Button>
                )
              ) : null}
            </div>
          )}

          {/* Admin applications panel */}
          {isAdmin && <AdminApplicationsPanel programId={Number(id)} />}
        </CardBody>
      </Card>
    </div>
  )
}
