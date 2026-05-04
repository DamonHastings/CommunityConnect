import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useOpportunities } from '../../hooks/useOpportunities'
import { useMatches } from '../../hooks/useMatches'
import { useMyApplications } from '../../hooks/useApplications'
import { useMyReferrals } from '../../hooks/useReferrals'
import { useConversations } from '../../hooks/useMessages'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { OrganizationCard } from '../../components/organizations/OrganizationCard'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { CATEGORY_LABELS, NEEDS_CATEGORY_LABELS } from '../../lib/utils'
import {
  Building2, Briefcase, Plus, Users, Sparkles, ClipboardList, Bookmark,
  Clock, CheckCircle, MessageSquare, UserCheck, ArrowRight, Search,
  Send, RefreshCw,
} from 'lucide-react'

/* ── Seeker section ─────────────────────────────────────────────────────── */

function SeekerSection() {
  const { user } = useAuth()
  const { data: matches, isLoading: matchesLoading } = useMatches(true)
  const { data: appsData } = useMyApplications()

  const applications = appsData?.applications ?? []
  const pendingCount = applications.filter((a) => a.status === 'pending').length
  const connectedCount = applications.filter((a) => a.status === 'approved').length
  const savedCount = user?.saved_org_ids?.length ?? 0

  const needsLabels = (matches?.needs_categories ?? [])
    .map((n) => NEEDS_CATEGORY_LABELS[n])
    .filter(Boolean)

  return (
    <>
      {/* My Services summary */}
      <section>
        <Card>
          <CardBody className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                My Services
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  {pendingCount} pending
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {connectedCount} connected
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="h-4 w-4 text-indigo-500" />
                  {savedCount} saved
                </span>
              </div>
            </div>
            <Link to="/my-services" className="shrink-0 text-sm font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </CardBody>
        </Card>
      </section>

      {/* Matched for you */}
      <section>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            Matched for you
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/intake" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900">
              <RefreshCw className="h-3.5 w-3.5" />
              Update my needs
            </Link>
            <Link to="/organizations" className="text-sm font-medium text-indigo-600 hover:underline">
              Browse all →
            </Link>
          </div>
        </div>

        {needsLabels.length > 0 && (
          <p className="mb-4 text-sm text-gray-500">
            Based on your needs:{' '}
            <span className="font-medium text-gray-700">{needsLabels.join(', ')}</span>
          </p>
        )}

        {matchesLoading ? (
          <p className="text-sm text-gray-400">Finding matches…</p>
        ) : matches?.organizations.length === 0 && matches?.opportunities.length === 0 ? (
          <Card>
            <CardBody className="py-10 text-center">
              <Sparkles className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">No matching organizations found yet.</p>
              <Link to="/organizations" className="mt-3 inline-block">
                <Button size="sm" variant="outline">Browse all organizations</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-6">
            {matches?.organizations && matches.organizations.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Organizations</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {matches.organizations.map((org) => (
                    <OrganizationCard key={org.id} organization={org} />
                  ))}
                </div>
              </div>
            )}
            {matches?.opportunities && matches.opportunities.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Open Opportunities</h3>
                <div className="space-y-3">
                  {matches.opportunities.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  )
}

/* ── Professional section ───────────────────────────────────────────────── */

function ProfessionalSection() {
  const { user } = useAuth()
  const { data: convsData } = useConversations(true)
  const { data: oppsData } = useOpportunities({ type: 'partnership', status: 'open', page: 1 })

  const unreadCount = (convsData?.conversations ?? []).reduce((sum, c) => sum + c.unread_count, 0)

  const completenessItems = [
    { label: 'Specialty', done: !!user?.specialty },
    { label: 'Bio', done: !!user?.bio },
    { label: 'Services offered', done: (user?.services_offered?.length ?? 0) > 0 },
    { label: 'Communities served', done: (user?.communities_served?.length ?? 0) > 0 },
    { label: 'Availability', done: !!user?.availability },
    { label: 'Location (city/state)', done: !!(user?.city || user?.state) },
  ]
  const doneCount = completenessItems.filter((i) => i.done).length
  const complete = doneCount === completenessItems.length

  const recentOpps = oppsData?.opportunities.slice(0, 3) ?? []

  return (
    <>
      {/* Inbox + profile completeness */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unread messages</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                </div>
              </div>
              <Link to="/messages">
                <Button variant="outline" size="sm">
                  View inbox
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                <p className="font-semibold text-gray-900">Profile completeness</p>
              </div>
              <span className="text-sm font-medium text-gray-500">{doneCount}/{completenessItems.length}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(doneCount / completenessItems.length) * 100}%` }}
              />
            </div>
            {!complete && (
              <div className="space-y-1">
                {completenessItems.filter((i) => !i.done).slice(0, 2).map((item) => (
                  <p key={item.label} className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 inline-block" />
                    Missing: {item.label}
                  </p>
                ))}
                <Link to="/profile" className="text-xs font-medium text-indigo-600 hover:underline">
                  Complete your profile →
                </Link>
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {/* Partnership / mentorship opportunities */}
      {recentOpps.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Partnership Opportunities
            </h2>
            <Link to="/opportunities?type=partnership" className="text-sm font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

/* ── Volunteer section ──────────────────────────────────────────────────── */

function VolunteerSection() {
  const { user } = useAuth()
  const { data: oppsData, isLoading } = useOpportunities({ type: 'volunteer', status: 'open', page: 1 })
  const { data: appsData } = useMyApplications()

  const applications = appsData?.applications ?? []
  const pendingCount = applications.filter((a) => a.status === 'pending').length
  const approvedCount = applications.filter((a) => a.status === 'approved').length

  return (
    <>
      {/* Availability status */}
      {user?.availability && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Your availability</p>
                <p className="font-semibold text-gray-900 capitalize">{user.availability.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm">Update</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* My applications summary */}
      {(pendingCount > 0 || approvedCount > 0) && (
        <Card>
          <CardBody className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                My Applications
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  {pendingCount} pending
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {approvedCount} approved
                </span>
              </div>
            </div>
            <Link to="/my-services" className="shrink-0 text-sm font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Open volunteer opportunities */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            Open Volunteer Opportunities
          </h2>
          <Link to="/opportunities?type=volunteer" className="text-sm font-medium text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
          </div>
        ) : oppsData?.opportunities.length === 0 ? (
          <Card>
            <CardBody className="py-10 text-center text-gray-500">No volunteer opportunities open right now.</CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {oppsData?.opportunities.slice(0, 5).map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

/* ── Resource Navigator section ─────────────────────────────────────────── */

function NavigatorSection() {
  const { data: referralsData } = useMyReferrals()
  const referrals = referralsData?.referrals ?? []
  const pendingCount = referrals.filter((r) => r.status === 'pending').length
  const acceptedCount = referrals.filter((r) => r.status === 'accepted').length

  return (
    <>
      {/* Referrals sent */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                <Send className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Referrals pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Referrals accepted</p>
                <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Quick search */}
      <Card>
        <CardBody>
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
            <Search className="h-5 w-5 text-indigo-600" />
            Find resources for a client
          </h2>
          <div className="flex gap-3">
            <Link to="/organizations" className="flex-1">
              <Button variant="outline" className="w-full justify-center">
                Browse organizations
              </Button>
            </Link>
            <Link to="/programs" className="flex-1">
              <Button variant="outline" className="w-full justify-center">
                Browse programs
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </>
  )
}

/* ── My Organizations section (shared for org-type users) ───────────────── */

function MyOrganizationsSection() {
  const { user } = useAuth()
  const orgIds = user?.organizations.map((m) => m.id) ?? []
  const { data: myOrgsData } = useOrganizations()
  const myOrgs = myOrgsData?.organizations.filter((o) => orgIds.includes(o.id)) ?? []

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Building2 className="h-5 w-5 text-indigo-600" />
          My Organizations
        </h2>
        <Link to="/organizations/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Organization
          </Button>
        </Link>
      </div>

      {myOrgs.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">You haven't added an organization yet.</p>
            <Link to="/organizations/new" className="mt-3 inline-block">
              <Button size="sm">Create your first org</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myOrgs.map((org) => {
            const membership = user?.organizations.find((m) => m.id === org.id)
            return (
              <Card key={org.id}>
                <CardHeader className="flex items-center justify-between">
                  <Link to={`/organizations/${org.id}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                    {org.name}
                  </Link>
                  <Badge variant={membership?.role === 'admin' ? 'info' : 'default'}>
                    {membership?.role}
                  </Badge>
                </CardHeader>
                <CardBody className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">{CATEGORY_LABELS[org.category]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {org.member_count} member{org.member_count !== 1 ? 's' : ''}
                    </span>
                    {org.open_opportunity_count > 0 && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Briefcase className="h-3.5 w-3.5" />
                        {org.open_opportunity_count} open
                      </span>
                    )}
                  </div>
                  {membership?.role === 'admin' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Link to={`/organizations/${org.id}/manage`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                      <Link to={`/organizations/${org.id}/opportunities/new`}>
                        <Button variant="outline" size="sm">+ Opportunity</Button>
                      </Link>
                    </div>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}

/* ── Main dashboard ─────────────────────────────────────────────────────── */

export function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const pt = user.profile_type
  const isSeeker = pt === 'individual_seeker'
  const isProfessional = pt === 'individual_professional'
  const isVolunteer = pt === 'volunteer'
  const isNavigator = pt === 'resource_navigator'
  const isOrgType = pt === 'community_org' || pt === 'business_service_provider'

  const showSeeker = isSeeker && user.intake_completed === true

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back, {user.first_name}</p>
      </div>

      {/* Individual seeker with completed intake */}
      {showSeeker && <SeekerSection />}

      {/* Professional */}
      {isProfessional && <ProfessionalSection />}

      {/* Volunteer */}
      {isVolunteer && <VolunteerSection />}

      {/* Resource navigator */}
      {isNavigator && (
        <>
          <NavigatorSection />
          <MyOrganizationsSection />
        </>
      )}

      {/* Org-type users (community_org, business_service_provider, foundation) */}
      {isOrgType && <MyOrganizationsSection />}

      {/* Seeker without intake */}
      {isSeeker && user.intake_completed !== true && (
        <Card>
          <CardBody className="py-10 text-center">
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
            <p className="font-semibold text-gray-900 mb-1">Complete your intake questionnaire</p>
            <p className="text-sm text-gray-500 mb-4">We'll match you with organizations and opportunities based on your needs.</p>
            <Link to="/intake">
              <Button>Start questionnaire</Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
