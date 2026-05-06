import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useOrganization, useOrganizations } from '../../hooks/useOrganizations'
import { useOrganizationOpportunities } from '../../hooks/useOpportunities'
import { useOrganizationPrograms } from '../../hooks/usePrograms'
import { useOpportunityApplications, useUpdateApplication } from '../../hooks/useApplications'
import { useProgramApplications, useUpdateProgramApplication } from '../../hooks/useProgramApplications'
import { useOrgAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncements'
import { useOrgConnections, useUpdateConnectionRequest } from '../../hooks/usePartnerConnections'
import { useOrgReferrals, useSendReferral } from '../../hooks/useReferrals'
import { useStartConversation } from '../../hooks/useMessages'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { ProgramCard } from '../../components/programs/ProgramCard'
import { formatDate } from '../../lib/utils'
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, Megaphone, Handshake, Send, Users, MessageSquare } from 'lucide-react'
import type { EngagementOpportunity, Program } from '../../types'

/* ── Applications panel ─────────────────────────────────────────────────── */

function ApplicationStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    pending: 'warning', approved: 'success', rejected: 'danger', withdrawn: 'default',
  }
  return <Badge variant={variants[status] ?? 'default'}>{status}</Badge>
}

function OppApplicationsList({ opp, onMessage }: { opp: EngagementOpportunity; onMessage: (userId: number) => void }) {
  const { data, isLoading } = useOpportunityApplications(opp.id)
  const update = useUpdateApplication()
  const apps = data?.applications ?? []
  if (isLoading) return <p className="text-sm text-gray-400 py-2">Loading applications…</p>
  if (apps.length === 0) return <p className="text-sm text-gray-400 py-2">No applications for this opportunity.</p>

  return (
    <div className="space-y-2 mt-2">
      {apps.map((app) => (
        <div key={app.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">{app.applicant.name}</p>
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
              <p className="font-medium text-heading">{app.applicant.name}</p>
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
          {programs.map((p) => <ProgramCard key={p.id} program={p} />)}
        </div>
      )}
    </div>
  )
}

/* ── Opportunities tab ──────────────────────────────────────────────────── */

function OpportunitiesTab({ orgId }: { orgId: number }) {
  const { data } = useOrganizationOpportunities(orgId)
  const opps = data?.opportunities ?? []

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{opps.length} opportunit{opps.length !== 1 ? 'ies' : 'y'}</p>
        <Link to={`/organizations/${orgId}/opportunities/new`}>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New Opportunity
          </Button>
        </Link>
      </div>
      {opps.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-gray-500">No opportunities yet.</CardBody>
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

/* ── Main page ──────────────────────────────────────────────────────────── */

type Tab = 'applications' | 'programs' | 'opportunities' | 'partners' | 'referrals' | 'announcements'

const TABS: { id: Tab; label: string }[] = [
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
      {activeTab === 'opportunities' && <OpportunitiesTab orgId={org.id} />}
      {activeTab === 'partners' && <PartnersTab orgId={org.id} />}
      {activeTab === 'referrals' && <ReferralsTab orgId={org.id} />}
      {activeTab === 'announcements' && <AnnouncementsTab orgId={org.id} />}
    </div>
  )
}
