import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useOrganization, useOrganizations } from '../../hooks/useOrganizations'
import { useOrganizationOpportunities } from '../../hooks/useOpportunities'
import { useOrganizationPrograms, useUpdateProgram } from '../../hooks/usePrograms'
import { useOpportunityApplications, useUpdateApplication } from '../../hooks/useApplications'
import { useProgramApplications, useUpdateProgramApplication } from '../../hooks/useProgramApplications'
import { useOrgAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncements'
import { useOrgConnections, useUpdateConnectionRequest } from '../../hooks/usePartnerConnections'
import { useOrgReferrals, useSendReferral } from '../../hooks/useReferrals'
import { useStartConversation } from '../../hooks/useMessages'
import { useAuth } from '../../contexts/AuthContext'
import { useCohorts, useCreateCohort, useAddCohortMember, useRemoveCohortMember } from '../../hooks/useCohorts'
import { useMilestones, useCreateMilestone, useDeleteMilestone } from '../../hooks/useMilestones'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { ProgramCard } from '../../components/programs/ProgramCard'
import { formatDate } from '../../lib/utils'
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, Megaphone, Handshake, Send, Users, MessageSquare, BarChart2, ChevronDown, ChevronRight, DollarSign, Flag } from 'lucide-react'
import type { EngagementOpportunity, Program, ServiceApplication, Cohort, ProgramMilestone } from '../../types'

/* ── Applications panel ─────────────────────────────────────────────────── */

function ApplicationStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    pending: 'warning', approved: 'success', rejected: 'danger', withdrawn: 'default',
  }
  return <Badge variant={variants[status] ?? 'default'}>{status}</Badge>
}

function GrantApplicationCard({
  app,
  onMessage,
  update,
}: {
  app: ServiceApplication
  onMessage: (userId: number) => void
  update: ReturnType<typeof useUpdateApplication>
}) {
  const [awardDraft, setAwardDraft] = useState(app.award_amount ?? '')

  function handleAwardBlur() {
    const parsed = parseFloat(String(awardDraft))
    if (!isNaN(parsed) && parsed >= 0) {
      update.mutate({ id: app.id, award_amount: parsed })
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{app.applicant_org?.name ?? app.applicant.name}</p>
          <p className="text-xs text-gray-500">Applied by: <Link to={`/users/${app.applicant.id}`} className="hover:underline hover:text-primary">{app.applicant.name}</Link> · {app.applicant.email}</p>
          {app.message && <p className="mt-1 text-gray-600 line-clamp-2">{app.message}</p>}
          <p className="mt-0.5 text-xs text-gray-400">Submitted {formatDate(app.created_at)}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ApplicationStatusBadge status={app.status} />
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onMessage(app.applicant.id)}>
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>
            {app.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" disabled={update.isPending}
                  onClick={() => update.mutate({ id: app.id, status: 'approved' })}>
                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" disabled={update.isPending}
                  onClick={() => update.mutate({ id: app.id, status: 'rejected' })}>
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {app.status === 'approved' && (
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-amber-200 pt-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Award amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={awardDraft}
              onChange={(e) => setAwardDraft(e.target.value)}
              onBlur={handleAwardBlur}
              className="w-32 rounded border border-gray-300 px-2 py-0.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={app.disbursed}
              onChange={() => update.mutate({ id: app.id, disbursed: !app.disbursed })}
              className="rounded border-gray-300"
            />
            Funds disbursed
          </label>
        </div>
      )}
    </div>
  )
}

function GrantApplicationsList({
  opp,
  apps,
  onMessage,
  update,
}: {
  opp: EngagementOpportunity
  apps: ServiceApplication[]
  onMessage: (userId: number) => void
  update: ReturnType<typeof useUpdateApplication>
}) {
  const totalAwarded = apps.reduce((sum, a) => sum + (a.award_amount ? Number(a.award_amount) : 0), 0)

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm">
        <span className="text-gray-600">
          Requested: <strong className="text-gray-900">
            {opp.funding_amount ? `$${Number(opp.funding_amount).toLocaleString()}` : '—'}
          </strong>
          <span className="text-gray-400"> × {apps.length} applicant{apps.length !== 1 ? 's' : ''}</span>
        </span>
        <span className="text-gray-600">
          Awarded: <strong className="text-gray-900">${totalAwarded.toLocaleString()}</strong>
        </span>
      </div>
      {apps.map((app) => (
        <GrantApplicationCard key={app.id} app={app} onMessage={onMessage} update={update} />
      ))}
    </div>
  )
}

function OppApplicationsList({ opp, onMessage }: { opp: EngagementOpportunity; onMessage: (userId: number) => void }) {
  const { data, isLoading } = useOpportunityApplications(opp.id)
  const update = useUpdateApplication()
  const apps = data?.applications ?? []
  if (isLoading) return <p className="text-sm text-gray-400 py-2">Loading applications…</p>
  if (apps.length === 0) return <p className="text-sm text-gray-400 py-2">No applications for this opportunity.</p>

  if (opp.opportunity_type === 'funding') {
    return <GrantApplicationsList opp={opp} apps={apps} onMessage={onMessage} update={update} />
  }

  return (
    <div className="space-y-2 mt-2">
      {apps.map((app) => (
        <div key={app.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/users/${app.applicant.id}`} className="font-medium text-gray-900 hover:text-primary hover:underline">{app.applicant.name}</Link>
              <p className="text-gray-500 text-xs">{app.applicant.email}</p>
              {app.applicant_org && (
                <p className="text-xs text-indigo-600">on behalf of {app.applicant_org.name}</p>
              )}
              {app.message && <p className="mt-1 text-gray-600 line-clamp-2">{app.message}</p>}
              <p className="mt-1 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <ApplicationStatusBadge status={app.status} />
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onMessage(app.applicant.id)}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
                {app.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" disabled={update.isPending}
                      onClick={() => update.mutate({ id: app.id, status: 'approved' })}>
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={update.isPending}
                      onClick={() => update.mutate({ id: app.id, status: 'rejected' })}>
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProgApplicationsList({ program, onMessage }: { program: Program; onMessage: (userId: number) => void }) {
  const { data, isLoading } = useProgramApplications(program.id)
  const update = useUpdateProgramApplication()
  const apps = data?.applications ?? []
  if (isLoading) return <p className="text-sm text-muted py-2">Loading applications…</p>
  if (apps.length === 0) return <p className="text-sm text-muted py-2">No applications for this program.</p>

  return (
    <div className="space-y-2 mt-2">
      {apps.map((app) => (
        <div key={app.id} className="rounded-lg border border-border bg-bg px-3 py-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/users/${app.applicant.id}`} className="font-medium text-heading hover:text-primary hover:underline">{app.applicant.name}</Link>
              <p className="text-muted text-xs">{app.applicant.email}</p>
              {app.message && <p className="mt-1 text-secondary line-clamp-2">{app.message}</p>}
              <p className="mt-1 text-xs text-muted">Applied {formatDate(app.created_at)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <ApplicationStatusBadge status={app.status} />
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onMessage(app.applicant.id)}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </Button>
                {app.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" disabled={update.isPending}
                      onClick={() => update.mutate({ id: app.id, status: 'approved' })}>
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" disabled={update.isPending}
                      onClick={() => update.mutate({ id: app.id, status: 'rejected' })}>
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ApplicationsTab({ orgId }: { orgId: number }) {
  const { data: oppsData } = useOrganizationOpportunities(orgId)
  const { data: progsData } = useOrganizationPrograms(orgId)
  const opps = oppsData?.opportunities ?? []
  const programs = progsData?.programs ?? []
  const [expandedOppId, setExpandedOppId] = useState<number | null>(null)
  const [expandedProgId, setExpandedProgId] = useState<number | null>(null)
  const startConversation = useStartConversation()
  const navigate = useNavigate()

  const handleMessage = (userId: number) => {
    startConversation.mutate(userId, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
    })
  }

  const hasOpps = opps.length > 0
  const hasProgs = programs.length > 0

  if (!hasOpps && !hasProgs) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-muted">
          No opportunities or programs yet. Create one to start receiving applications.
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {hasOpps && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Service Applications</h3>
          <div className="space-y-3">
            {opps.map((opp) => (
              <Card key={opp.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-heading">{opp.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={opp.status === 'open' ? 'success' : 'default'}>{opp.status}</Badge>
                        <Badge variant="info">{opp.opportunity_type}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm"
                      onClick={() => setExpandedOppId(expandedOppId === opp.id ? null : opp.id)}>
                      {expandedOppId === opp.id ? 'Collapse' : 'View applications'}
                    </Button>
                  </div>
                  {expandedOppId === opp.id && <OppApplicationsList opp={opp} onMessage={handleMessage} />}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {hasProgs && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Program Applications</h3>
          <div className="space-y-3">
            {programs.map((prog) => (
              <Card key={prog.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-heading">{prog.title}</p>
                      <p className="text-xs text-muted mt-0.5">{prog.status}</p>
                    </div>
                    <Button variant="outline" size="sm"
                      onClick={() => setExpandedProgId(expandedProgId === prog.id ? null : prog.id)}>
                      {expandedProgId === prog.id ? 'Collapse' : 'View applications'}
                    </Button>
                  </div>
                  {expandedProgId === prog.id && <ProgApplicationsList program={prog} onMessage={handleMessage} />}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Programs tab ───────────────────────────────────────────────────────── */

function OutcomesPanel({ program }: { program: Program }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(program.outcomes ?? '')
  const [editing, setEditing] = useState(false)
  const update = useUpdateProgram(program.id)

  const REPORTABLE_STATUSES = ['active', 'completed', 'cancelled']
  if (!REPORTABLE_STATUSES.includes(program.status)) return null

  function handleSave() {
    update.mutate({ outcomes: draft }, { onSuccess: () => setEditing(false) })
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
      >
        <BarChart2 className="h-3.5 w-3.5" />
        {program.outcomes ? 'Outcomes recorded' : 'Record outcomes'}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="mt-3">
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="Describe the outcomes, impact, and learnings from this program…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={update.isPending}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => { setDraft(program.outcomes ?? ''); setEditing(false) }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 p-3">
              {program.outcomes ? (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{program.outcomes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No outcomes recorded yet.</p>
              )}
              <button
                onClick={() => setEditing(true)}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
              >
                {program.outcomes ? 'Edit' : 'Add outcomes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProgramsTab({ orgId }: { orgId: number }) {
  const { data } = useOrganizationPrograms(orgId)
  const programs = data?.programs ?? []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{programs.length} program{programs.length !== 1 ? 's' : ''}</p>
        <Link to={`/organizations/${orgId}/programs/new`}>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Program
          </Button>
        </Link>
      </div>
      {programs.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-gray-500">No programs yet.</CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <div key={p.id} className="flex flex-col">
              <ProgramCard program={p} />
              <div className="-mt-1 rounded-b-xl border border-t-0 border-gray-200 bg-white px-4 pb-3">
                <OutcomesPanel program={p} />
                <MilestonesPanel program={p} />
                <CohortPanel program={p} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Opportunities tab ──────────────────────────────────────────────────── */

function OpportunitiesTab({ orgId, isFoundation }: { orgId: number; isFoundation?: boolean }) {
  const { data } = useOrganizationOpportunities(orgId)
  const allOpps = data?.opportunities ?? []
  const opps = isFoundation ? allOpps.filter((o) => o.opportunity_type === 'funding') : allOpps

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isFoundation
            ? `${opps.length} funding opportunit${opps.length !== 1 ? 'ies' : 'y'}`
            : `${opps.length} opportunit${opps.length !== 1 ? 'ies' : 'y'}`}
        </p>
        <Link to={`/organizations/${orgId}/opportunities/new`}>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            {isFoundation ? 'New Funding Opportunity' : 'New Opportunity'}
          </Button>
        </Link>
      </div>
      {opps.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-gray-500">
            {isFoundation ? 'No funding opportunities yet.' : 'No opportunities yet.'}
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {opps.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
        </div>
      )}
    </div>
  )
}

/* ── Partners tab ───────────────────────────────────────────────────────── */

function PartnersTab({ orgId }: { orgId: number }) {
  const { data } = useOrgConnections(orgId)
  const update = useUpdateConnectionRequest()
  const connections = data?.partner_connections ?? []
  const accepted = connections.filter((c) => c.status === 'accepted')
  const pending = connections.filter((c) => c.status === 'pending' && c.target_org.id === orgId)
  const startConversation = useStartConversation()
  const navigate = useNavigate()

  const handleMessage = (userId: number) => {
    startConversation.mutate(userId, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
    })
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Pending requests</h3>
          <div className="space-y-2">
            {pending.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{c.requester_org.name}</p>
                    {c.message && <p className="text-sm text-gray-500">{c.message}</p>}
                    <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => update.mutate({ id: c.id, status: 'accepted' })} disabled={update.isPending}>
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: c.id, status: 'declined' })} disabled={update.isPending}>
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Active partners ({accepted.length})
        </h3>
        {accepted.length === 0 ? (
          <Card>
            <CardBody className="py-8 text-center text-gray-500">
              No partners yet.{' '}
              <Link to="/organizations" className="text-indigo-600 hover:underline">Browse organizations</Link>
              {' '}to find potential partners.
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {accepted.map((c) => {
              const partner = c.requester_org.id === orgId ? c.target_org : c.requester_org
              const partnerAdminId = partner.primary_admin_id
              return (
                <Card key={c.id}>
                  <CardBody className="flex items-center justify-between">
                    <Link to={`/organizations/${partner.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                      <div className="flex items-center gap-2">
                        <Handshake className="h-4 w-4 text-gray-400" />
                        {partner.name}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      {partnerAdminId && (
                        <Button size="sm" variant="outline" onClick={() => handleMessage(partnerAdminId)}>
                          <MessageSquare className="mr-1 h-3.5 w-3.5" />
                          Message
                        </Button>
                      )}
                      <Badge variant="success">Partner</Badge>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Referrals tab ──────────────────────────────────────────────────────── */

type TargetType = 'none' | 'program' | 'organization'

function ReferralsTab({ orgId }: { orgId: number }) {
  const { data } = useOrgReferrals(orgId)
  const { data: progsData } = useOrganizationPrograms(orgId)
  const send = useSendReferral(orgId)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [targetType, setTargetType] = useState<TargetType>('none')
  const [targetId, setTargetId] = useState<number | undefined>(undefined)
  const [orgSearch, setOrgSearch] = useState('')
  const { data: orgSearchData } = useOrganizations({ q: orgSearch })
  const programs = progsData?.programs ?? []
  const referrals = data?.referrals ?? []

  const resetForm = () => {
    setEmail(''); setMessage(''); setTargetType('none'); setTargetId(undefined); setOrgSearch('')
  }

  const handleSend = () => {
    if (!email.trim()) return
    send.mutate(
      { referred_user_email: email, message, target_type: targetType !== 'none' ? targetType : undefined, target_id: targetId },
      { onSuccess: () => { resetForm(); setShowForm(false) } }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Send className="mr-1 h-4 w-4" />
          Send Referral
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>Send a referral</CardHeader>
          <CardBody className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">User email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-surface text-heading"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Refer to (optional)</label>
              <div className="flex gap-2">
                {(['none', 'program', 'organization'] as TargetType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTargetType(t); setTargetId(undefined); setOrgSearch('') }}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                      targetType === t
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-secondary hover:border-primary hover:text-primary'
                    }`}
                  >
                    {t === 'none' ? 'None' : t === 'program' ? 'Program' : 'Organization'}
                  </button>
                ))}
              </div>
            </div>

            {targetType === 'program' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary">Select program</label>
                <select
                  value={targetId ?? ''}
                  onChange={(e) => setTargetId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-surface text-heading"
                >
                  <option value="">— choose a program —</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'organization' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-secondary">Search organization</label>
                <input
                  type="text"
                  value={orgSearch}
                  onChange={(e) => { setOrgSearch(e.target.value); setTargetId(undefined) }}
                  placeholder="Type org name…"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-surface text-heading"
                />
                {orgSearch.length >= 2 && (
                  <div className="mt-1 rounded-lg border border-border bg-surface shadow-dropdown max-h-40 overflow-y-auto">
                    {(orgSearchData?.organizations ?? []).slice(0, 8).map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => { setTargetId(org.id); setOrgSearch(org.name) }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-bg transition ${targetId === org.id ? 'text-primary font-medium' : 'text-heading'}`}
                      >
                        {org.name}
                      </button>
                    ))}
                    {(orgSearchData?.organizations ?? []).length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted">No organizations found.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-secondary">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none bg-surface text-heading"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSend} disabled={!email.trim() || send.isPending} size="sm">
                {send.isPending ? 'Sending…' : 'Send'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { resetForm(); setShowForm(false) }}>Cancel</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {referrals.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-gray-500">No referrals sent yet.</CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {referrals.map((r) => (
            <Card key={r.id}>
              <CardBody className="text-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{r.referred_user.name}</p>
                    {r.target && (
                      <p className="text-xs text-indigo-600">
                        → {r.target.type}: {r.target.title ?? r.target.name}
                      </p>
                    )}
                    {r.message && <p className="mt-1 text-gray-600">{r.message}</p>}
                    <p className="mt-1 text-xs text-gray-400">{formatDate(r.created_at)}</p>
                  </div>
                  <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'declined' ? 'danger' : 'warning'}>
                    {r.status}
                  </Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Announcements tab ──────────────────────────────────────────────────── */

function AnnouncementsTab({ orgId }: { orgId: number }) {
  const { data } = useOrgAnnouncements(orgId)
  const create = useCreateAnnouncement(orgId)
  const del = useDeleteAnnouncement(orgId)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [showForm, setShowForm] = useState(false)
  const announcements = data?.announcements ?? []

  const handleCreate = () => {
    if (!title.trim() || !body.trim()) return
    create.mutate({ title, body, publish: true }, {
      onSuccess: () => { setTitle(''); setBody(''); setShowForm(false) },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Megaphone className="mr-1 h-4 w-4" />
          Post Announcement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>New announcement</CardHeader>
          <CardBody className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!title.trim() || !body.trim() || create.isPending} size="sm">
                {create.isPending ? 'Posting…' : 'Publish'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {announcements.length === 0 ? (
        <Card>
          <CardBody className="py-8 text-center text-gray-500">No announcements yet.</CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{a.title}</p>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{a.body}</p>
                    <p className="mt-2 text-xs text-gray-400">Published {formatDate(a.published_at ?? a.created_at)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => del.mutate(a.id)}
                    disabled={del.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Cohorts tab ────────────────────────────────────────────────────────── */

function MilestonesPanel({ program }: { program: Program }) {
  const { data } = useMilestones(program.id)
  const createMilestone = useCreateMilestone(program.id)
  const deleteMilestone = useDeleteMilestone()
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const milestones: ProgramMilestone[] = data?.milestones ?? []

  function handleAdd() {
    if (!newTitle.trim()) return
    createMilestone.mutate({ title: newTitle.trim(), position: milestones.length }, {
      onSuccess: () => setNewTitle(''),
    })
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
      >
        <Flag className="h-3.5 w-3.5" />
        {milestones.length > 0 ? `${milestones.length} milestone${milestones.length !== 1 ? 's' : ''}` : 'Add milestones'}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="font-medium text-gray-800">{m.title}</span>
              <button
                onClick={() => deleteMilestone.mutate({ id: m.id, programId: program.id })}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="New milestone title…"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            />
            <Button size="sm" onClick={handleAdd} disabled={createMilestone.isPending}>Add</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CohortPanel({ program }: { program: Program }) {
  const { data: cohortsData } = useCohorts(program.id)
  const { data: applicationsData } = useProgramApplications(program.id)
  const createCohort = useCreateCohort(program.id)
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [cohortName, setCohortName] = useState('')
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [selectedUserId, setSelectedUserId] = useState('')

  const cohorts: Cohort[] = cohortsData?.cohorts ?? []
  const approvedApps = (applicationsData?.applications ?? []).filter((a) => a.status === 'approved')

  const addMemberMutation = useAddCohortMember(selectedCohort?.id ?? 0)
  const removeMemberMutation = useRemoveCohortMember(selectedCohort?.id ?? 0)

  function handleCreateCohort() {
    if (!cohortName.trim()) return
    createCohort.mutate({ name: cohortName.trim() }, {
      onSuccess: () => { setCohortName(''); setShowForm(false) },
    })
  }

  function handleAddMember() {
    if (!selectedCohort || !selectedUserId) return
    addMemberMutation.mutate(parseInt(selectedUserId), {
      onSuccess: () => setSelectedUserId(''),
    })
  }

  const availableToAdd = approvedApps.filter(
    (a) => !selectedCohort?.members.some((m) => m.id === a.applicant.id)
  )

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800"
      >
        <Users className="h-3.5 w-3.5" />
        {cohorts.length > 0 ? `${cohorts.length} cohort${cohorts.length !== 1 ? 's' : ''}` : 'Create cohort'}
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {cohorts.map((cohort) => (
            <div key={cohort.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">{cohort.name}</p>
                <span className="text-xs text-gray-500">{cohort.member_count} member{cohort.member_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="mt-2 space-y-1">
                {cohort.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs text-gray-700">
                    <span>{m.first_name} {m.last_name}</span>
                    <button
                      onClick={() => removeMemberMutation.mutate(m.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {availableToAdd.length > 0 && (
                <div className="mt-2 flex gap-2" onClick={() => setSelectedCohort(cohort)}>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    <option value="">Add participant…</option>
                    {availableToAdd.map((a) => (
                      <option key={a.applicant.id} value={a.applicant.id}>{a.applicant.name}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAddMember} disabled={!selectedUserId}>Add</Button>
                </div>
              )}
            </div>
          ))}
          {showForm ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCohort()}
                placeholder="Cohort name (e.g. Spring 2026)"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <Button size="sm" onClick={handleCreateCohort} disabled={createCohort.isPending}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Cohort
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────── */

type Tab = 'applications' | 'programs' | 'opportunities' | 'partners' | 'referrals' | 'announcements'

const BASE_TABS: { id: Tab; label: string }[] = [
  { id: 'applications', label: 'Applications' },
  { id: 'programs', label: 'Programs' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'partners', label: 'Partners' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'announcements', label: 'Announcements' },
]

export function OrganizationManagePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: org, isLoading } = useOrganization(id!)
  const [activeTab, setActiveTab] = useState<Tab>('applications')

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />

  if (!org) return <div className="py-16 text-center text-gray-500">Organization not found.</div>

  const isAdmin = user?.organizations.some((m) => m.id === org.id && m.role === 'admin')
  const isMemberNavigator = user?.profile_type === 'resource_navigator' && user?.organizations.some((m) => m.id === org.id)

  if (!isAdmin && !isMemberNavigator) {
    navigate(`/organizations/${id}`)
    return null
  }

  const isFoundation = org.org_type === 'foundation'
  const TABS = isFoundation
    ? BASE_TABS.map((t) => t.id === 'opportunities' ? { ...t, label: 'Funding' } : t)
    : BASE_TABS
  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter((t) => t.id === 'referrals')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/organizations/${id}`} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <Users className="h-3.5 w-3.5" />
            {org.member_count} member{org.member_count !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to={`/organizations/${id}/edit`}>
          <Button variant="outline" size="sm">Edit org</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'applications' && <ApplicationsTab orgId={org.id} />}
      {activeTab === 'programs' && <ProgramsTab orgId={org.id} />}
      {activeTab === 'opportunities' && <OpportunitiesTab orgId={org.id} isFoundation={isFoundation} />}
      {activeTab === 'partners' && <PartnersTab orgId={org.id} />}
      {activeTab === 'referrals' && <ReferralsTab orgId={org.id} />}
      {activeTab === 'announcements' && <AnnouncementsTab orgId={org.id} />}
    </div>
  )
}
