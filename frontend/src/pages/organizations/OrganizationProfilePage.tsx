import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useOrganization, useUpdateOrganization } from '../../hooks/useOrganizations'
import { useOrganizationOpportunities } from '../../hooks/useOpportunities'
import { useOrganizationPrograms } from '../../hooks/usePrograms'
import { useOpportunityApplications, useUpdateApplication } from '../../hooks/useApplications'
import { useSaveOrganization, useUnsaveOrganization } from '../../hooks/useSavedOrganizations'
import { useOrgAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncements'
import { useOrgConnections, useSendConnectionRequest, useUpdateConnectionRequest, useCancelConnectionRequest } from '../../hooks/usePartnerConnections'
import { useOrgReferrals, useSendReferral } from '../../hooks/useReferrals'
import { useStartConversation } from '../../hooks/useMessages'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { ProgramCard } from '../../components/programs/ProgramCard'
import { CATEGORY_LABELS, ORG_TYPE_LABELS, formatDate } from '../../lib/utils'
import { MapPin, Globe, Mail, Phone, Users, Calendar, Pencil, ChevronDown, ChevronRight, Bookmark, Star, Megaphone, Trash2, Handshake, UserCheck, MessageSquare } from 'lucide-react'
import type { EngagementOpportunity } from '../../types'

function OppApplicationsPanel({ opp }: { opp: EngagementOpportunity }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useOpportunityApplications(open ? opp.id : undefined)
  const update = useUpdateApplication()
  const apps = data?.applications ?? []

  return (
    <div className="mt-2 border-t pt-2">
      <button
        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
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
                  {app.applicant_org && (
                    <p className="text-xs text-indigo-600">on behalf of {app.applicant_org.name}</p>
                  )}
                  {app.message && <p className="mt-1 text-gray-600 line-clamp-2">{app.message}</p>}
                  <p className="mt-1 text-xs text-gray-400">Applied {formatDate(app.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ApplicationStatusBadge status={app.status} />
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

function ApplicationStatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    pending: 'warning', approved: 'success', rejected: 'danger', withdrawn: 'default',
  }
  return <Badge variant={variants[status] ?? 'default'}>{status}</Badge>
}

function AnnouncementsPanel({ orgId, isAdmin }: { orgId: number; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const { data } = useOrgAnnouncements(orgId)
  const create = useCreateAnnouncement(orgId)
  const del = useDeleteAnnouncement(orgId)
  const announcements = data?.announcements ?? []

  const handleCreate = () => {
    if (!title.trim() || !body.trim()) return
    create.mutate({ title, body, publish: true }, {
      onSuccess: () => { setTitle(''); setBody('') },
    })
  }

  if (!isAdmin && announcements.length === 0) return null

  return (
    <div>
      <button
        className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <Megaphone className="h-5 w-5 text-indigo-600" />
        Announcements
        {announcements.length > 0 && <span className="text-sm font-normal text-gray-500">({announcements.length})</span>}
      </button>

      {open && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardBody className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{a.title}</p>
                  <p className="mt-0.5 text-sm text-gray-600 whitespace-pre-line">{a.body}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(a.published_at ?? a.created_at)}</p>
                </div>
                {isAdmin && (
                  <button onClick={() => del.mutate(a.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </CardBody>
            </Card>
          ))}

          {isAdmin && (
            <Card>
              <CardBody className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Post new announcement</p>
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                  placeholder="What would you like to share?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <Button size="sm" disabled={create.isPending || !title.trim() || !body.trim()} onClick={handleCreate}>
                  {create.isPending ? 'Posting…' : 'Post announcement'}
                </Button>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function ReferralsPanel({ orgId }: { orgId: number }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { data } = useOrgReferrals(orgId)
  const send = useSendReferral(orgId)
  const referrals = data?.referrals ?? []

  const handleSend = () => {
    if (!email.trim()) return
    send.mutate({ referred_user_email: email.trim(), message: message.trim() || undefined }, {
      onSuccess: () => { setEmail(''); setMessage('') },
    })
  }

  return (
    <div>
      <button
        className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <UserCheck className="h-5 w-5 text-indigo-600" />
        Referrals
        {referrals.length > 0 && <span className="text-sm font-normal text-gray-500">({referrals.length} sent)</span>}
      </button>

      {open && (
        <div className="space-y-3">
          {referrals.map((r) => (
            <Card key={r.id}>
              <CardBody className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{r.referred_user.name}</p>
                  {r.target && (
                    <p className="text-xs text-gray-500">
                      → {r.target.type}: {r.target.title ?? r.target.name}
                    </p>
                  )}
                  {r.message && <p className="mt-0.5 text-gray-600">{r.message}</p>}
                </div>
                <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'declined' ? 'danger' : 'warning'}>
                  {r.status}
                </Badge>
              </CardBody>
            </Card>
          ))}

          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Send a referral</p>
              <Input
                placeholder="User email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                rows={2}
                placeholder="Optional message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button size="sm" disabled={send.isPending || !email.trim()} onClick={handleSend}>
                {send.isPending ? 'Sending…' : 'Send Referral'}
              </Button>
              {send.isError && (
                <p className="text-sm text-red-600">User not found or referral failed.</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

function PartnerConnectionsPanel({ orgId, isAdmin }: { orgId: number; isAdmin: boolean }) {
  const [open, setOpen] = useState(false)
  const { data } = useOrgConnections(orgId)
  const update = useUpdateConnectionRequest()
  const cancel = useCancelConnectionRequest()

  const connections = data?.partner_connections ?? []
  const accepted = connections.filter((c) => c.status === 'accepted')
  const pendingIncoming = connections.filter(
    (c) => c.status === 'pending' && c.target_org.id === orgId
  )
  const pendingOutgoing = connections.filter(
    (c) => c.status === 'pending' && c.requester_org.id === orgId
  )

  if (!isAdmin && accepted.length === 0) return null

  return (
    <div>
      <button
        className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        <Handshake className="h-5 w-5 text-indigo-600" />
        Partner Organizations
        {accepted.length > 0 && <span className="text-sm font-normal text-gray-500">({accepted.length})</span>}
      </button>

      {open && (
        <div className="space-y-3">
          {accepted.length === 0 && !isAdmin && (
            <p className="text-sm text-gray-500">No partner organizations yet.</p>
          )}

          {accepted.map((c) => {
            const partner = c.requester_org.id === orgId ? c.target_org : c.requester_org
            return (
              <Card key={c.id}>
                <CardBody className="flex items-center justify-between gap-3">
                  <Link to={`/organizations/${partner.id}`} className="font-medium text-indigo-600 hover:underline">
                    {partner.name}
                  </Link>
                  <Badge variant="success">Partner</Badge>
                </CardBody>
              </Card>
            )
          })}

          {isAdmin && pendingIncoming.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Incoming requests</p>
              {pendingIncoming.map((c) => (
                <Card key={c.id} className="mb-2">
                  <CardBody className="flex items-start justify-between gap-3">
                    <div>
                      <Link to={`/organizations/${c.requester_org.id}`} className="font-medium text-indigo-600 hover:underline">
                        {c.requester_org.name}
                      </Link>
                      {c.message && <p className="mt-0.5 text-sm text-gray-600">{c.message}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="outline" disabled={update.isPending}
                        onClick={() => update.mutate({ id: c.id, status: 'accepted' })}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" disabled={update.isPending}
                        onClick={() => update.mutate({ id: c.id, status: 'declined' })}>
                        Decline
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {isAdmin && pendingOutgoing.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Sent requests</p>
              {pendingOutgoing.map((c) => (
                <Card key={c.id} className="mb-2">
                  <CardBody className="flex items-center justify-between gap-3">
                    <div>
                      <Link to={`/organizations/${c.target_org.id}`} className="font-medium text-indigo-600 hover:underline">
                        {c.target_org.name}
                      </Link>
                      <Badge variant="warning" className="ml-2">Pending</Badge>
                    </div>
                    <Button size="sm" variant="outline" disabled={cancel.isPending}
                      onClick={() => cancel.mutate(c.id)}>
                      Cancel
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function OrganizationProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: org, isLoading } = useOrganization(id!)
  const { data: oppsData } = useOrganizationOpportunities(id!)
  const { data: programsData } = useOrganizationPrograms(id!)
  const save = useSaveOrganization()
  const unsave = useUnsaveOrganization()
  const updateOrg = useUpdateOrganization(id!)
  const startConversation = useStartConversation()

  // Find an org the viewer admins (other than the viewed org) for partnership request
  const viewerAdminOrg = user?.organizations.find((m) => m.role === 'admin' && m.id !== Number(id))
  const { data: connectionsData } = useOrgConnections(viewerAdminOrg?.id ?? 0)
  const sendRequest = useSendConnectionRequest(viewerAdminOrg?.id ?? 0)

  const handleMessageOrg = () => {
    if (!org?.primary_admin) return
    startConversation.mutate(org.primary_admin.id, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
    })
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-40 rounded-xl bg-gray-200" />
      </div>
    )
  }

  if (!org) return <div className="py-16 text-center text-gray-500">Organization not found.</div>

  const isAdmin = user?.organizations.some((m) => m.id === org.id && m.role === 'admin')
  const isMemberNavigator = user?.profile_type === 'resource_navigator' && user?.organizations.some((m) => m.id === org.id)
  const canSendReferrals = isAdmin || isMemberNavigator
  const isPlatformAdmin = user?.platform_admin ?? false
  const openOpps = oppsData?.opportunities.filter((o) => o.status === 'open') ?? []
  const isSaved = user?.saved_org_ids?.includes(org.id) ?? false

  const existingConnection = connectionsData?.partner_connections.find(
    (c) => c.requester_org.id === org.id || c.target_org.id === org.id
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
            {org.verified && <Badge variant="success">Verified</Badge>}
            {org.featured && (
              <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                Featured
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="info">{CATEGORY_LABELS[org.category]}</Badge>
            {org.org_type && org.org_type !== 'nonprofit' && (
              <Badge variant="default">{ORG_TYPE_LABELS[org.org_type]}</Badge>
            )}
            <Badge variant={org.status === 'active' ? 'success' : 'default'}>{org.status}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPlatformAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateOrg.mutate({ featured: !org.featured } as Parameters<typeof updateOrg.mutate>[0])}
            >
              <Star className="mr-1.5 h-4 w-4" />
              {org.featured ? 'Unfeature' : 'Feature'}
            </Button>
          )}
          {user && !isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => isSaved ? unsave.mutate(org.id) : save.mutate(org.id)}
            >
              <Bookmark
                className="mr-1.5 h-4 w-4"
                fill={isSaved ? 'currentColor' : 'none'}
                strokeWidth={isSaved ? 0 : 1.5}
              />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          )}
          {user && !isAdmin && org.primary_admin && user.id !== org.primary_admin.id && (
            <Button
              variant="outline"
              size="sm"
              disabled={startConversation.isPending}
              onClick={handleMessageOrg}
            >
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Message
            </Button>
          )}
          {viewerAdminOrg && !existingConnection && (
            <Button
              variant="outline"
              size="sm"
              disabled={sendRequest.isPending}
              onClick={() => sendRequest.mutate({ target_org_id: org.id })}
            >
              <Handshake className="mr-1.5 h-4 w-4" />
              Request Partnership
            </Button>
          )}
          {viewerAdminOrg && existingConnection && (
            <Badge variant={existingConnection.status === 'accepted' ? 'success' : existingConnection.status === 'declined' ? 'danger' : 'warning'}>
              {existingConnection.status === 'accepted' ? 'Partners' : existingConnection.status === 'declined' ? 'Declined' : 'Partnership Pending'}
            </Badge>
          )}
          {isAdmin && (
            <>
              <Link to={`/organizations/${org.id}/manage`}>
                <Button size="sm">
                  Manage org →
                </Button>
              </Link>
              <Link to={`/organizations/${org.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {org.description && (
            <Card>
              <CardHeader><h2 className="font-semibold text-gray-900">About</h2></CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-line">{org.description}</p>
              </CardBody>
            </Card>
          )}

          {org.mission && (
            <Card>
              <CardHeader><h2 className="font-semibold text-gray-900">Mission</h2></CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-line">{org.mission}</p>
              </CardBody>
            </Card>
          )}

          <AnnouncementsPanel orgId={org.id} isAdmin={!!isAdmin} />

          <PartnerConnectionsPanel orgId={org.id} isAdmin={!!isAdmin} />

          {canSendReferrals && <ReferralsPanel orgId={org.id} />}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Open Opportunities
                {openOpps.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({openOpps.length})</span>
                )}
              </h2>
              {isAdmin && (
                <Link to={`/organizations/${org.id}/opportunities/new`}>
                  <Button size="sm">+ Add Opportunity</Button>
                </Link>
              )}
            </div>
            {openOpps.length === 0 ? (
              <p className="text-gray-500">No open opportunities at this time.</p>
            ) : (
              <div className="space-y-3">
                {openOpps.map((opp) => (
                  <div key={opp.id}>
                    <OpportunityCard opportunity={opp} />
                    {isAdmin && <OppApplicationsPanel opp={opp} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Programs
                {(programsData?.programs.length ?? 0) > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({programsData!.programs.length})</span>
                )}
              </h2>
              {isAdmin && (
                <Link to={`/organizations/${org.id}/programs/new`}>
                  <Button size="sm">+ Add Program</Button>
                </Link>
              )}
            </div>
            {(programsData?.programs.length ?? 0) === 0 ? (
              <p className="text-gray-500">No programs at this time.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {programsData!.programs.map((program) => (
                  <ProgramCard key={program.id} program={program} showOrg={false} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Contact & Info</h2></CardHeader>
            <CardBody className="space-y-3 text-sm">
              {(org.city || org.state) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{[org.address, org.city, org.state, org.zip].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {org.website && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                    {org.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {org.contact_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={`mailto:${org.contact_email}`} className="text-indigo-600 hover:underline">
                    {org.contact_email}
                  </a>
                </div>
              )}
              {org.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{org.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{org.member_count} member{org.member_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <span>Joined {formatDate(org.created_at)}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
