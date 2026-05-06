import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useOpportunities } from '../../hooks/useOpportunities'
import { useMatches } from '../../hooks/useMatches'
import { useMyApplications } from '../../hooks/useApplications'
import { useMyReferrals } from '../../hooks/useReferrals'
import { useConversations } from '../../hooks/useMessages'
import { useFeed } from '../../hooks/useFeed'
import type { FeedItem as FeedItemType } from '../../hooks/useFeed'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { OrganizationCard } from '../../components/organizations/OrganizationCard'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { ProgramCard } from '../../components/programs/ProgramCard'
import { FeedItem } from '../../components/feed/FeedItem'
import { CATEGORY_LABELS, NEEDS_CATEGORY_LABELS } from '../../lib/utils'
import {
  Building2, Briefcase, Plus, Users, Sparkles, ClipboardList, Bookmark,
  Clock, CheckCircle, MessageSquare, UserCheck, ArrowRight, Search,
  Send, RefreshCw, Activity, BookOpen, Megaphone, Handshake, ArrowRightLeft,
  X, ListChecks,
} from 'lucide-react'

/* ── Feed type definitions ──────────────────────────────────────────────── */

type FilterType = FeedItemType['type'] | 'all'

const FILTER_OPTIONS: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all',                label: 'All',               icon: Activity       },
  { value: 'new_opportunity',    label: 'Opportunities',     icon: Briefcase      },
  { value: 'new_program',        label: 'Programs',          icon: BookOpen       },
  { value: 'announcement',       label: 'Announcements',     icon: Megaphone      },
  { value: 'application_update', label: 'Applications',      icon: CheckCircle    },
  { value: 'partner_request',    label: 'Partner Requests',  icon: Handshake      },
  { value: 'referral',           label: 'Referrals',         icon: ArrowRightLeft },
]

/* ── Social feed ────────────────────────────────────────────────────────── */

function SocialFeed() {
  const { data, isLoading } = useFeed()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const allItems = data?.feed ?? []

  const filtered = allItems.filter(item => {
    const matchesType = activeFilter === 'all' || item.type === activeFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.body ?? '').toLowerCase().includes(q) ||
      item.org_name.toLowerCase().includes(q)
    return matchesType && matchesSearch
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search activity…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-4 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
          const count = value === 'all' ? allItems.length : allItems.filter(i => i.type === value).length
          const active = activeFilter === value
          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-secondary hover:bg-bg hover:text-heading'
              }`}
            >
              <Icon className="h-3 w-3" />
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  active ? 'bg-white/20 text-white' : 'bg-bg text-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Feed items */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-border" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <CardBody className="py-12 text-center">
            <Activity className="mx-auto mb-2 h-8 w-8 text-muted opacity-50" />
            <p className="text-sm text-muted">
              {searchQuery || activeFilter !== 'all' ? 'No matching activity.' : 'No recent activity yet.'}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery('') }}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </CardBody>
        </Card>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map(item => <FeedItem key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}

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
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-heading">
              <ClipboardList className="h-4 w-4 text-primary" />
              My Services
            </h2>
            <Link to="/my-services" className="text-xs font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-bg py-2.5">
              <Clock className="mb-0.5 h-3.5 w-3.5 text-warning" />
              <span className="text-base font-bold text-heading">{pendingCount}</span>
              <span className="text-[10px] text-muted">pending</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-bg py-2.5">
              <CheckCircle className="mb-0.5 h-3.5 w-3.5 text-success" />
              <span className="text-base font-bold text-heading">{connectedCount}</span>
              <span className="text-[10px] text-muted">connected</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg bg-bg py-2.5">
              <Bookmark className="mb-0.5 h-3.5 w-3.5 text-primary" />
              <span className="text-base font-bold text-heading">{savedCount}</span>
              <span className="text-[10px] text-muted">saved</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            <Sparkles className="h-4 w-4 text-primary" />
            Matched for you
          </h2>
          <Link to="/organizations" className="text-xs font-medium text-primary hover:underline">
            Browse all →
          </Link>
        </div>

        {needsLabels.length > 0 && (
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-muted">
              Based on: <span className="font-medium text-secondary">{needsLabels.join(', ')}</span>
            </p>
            <Link to="/intake" className="flex shrink-0 items-center gap-1 text-xs text-muted hover:text-heading">
              <RefreshCw className="h-3 w-3" />
              Update
            </Link>
          </div>
        )}

        {matchesLoading ? (
          <p className="text-xs text-muted">Finding matches…</p>
        ) : matches?.organizations.length === 0 && matches?.opportunities.length === 0 && (matches?.programs?.length ?? 0) === 0 ? (
          <Card>
            <CardBody className="py-6 text-center">
              <Sparkles className="mx-auto mb-2 h-7 w-7 text-muted opacity-50" />
              <p className="text-xs text-muted">No matches yet.</p>
              <Link to="/organizations" className="mt-2 inline-block">
                <Button size="sm" variant="outline">Browse orgs</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {matches?.organizations.slice(0, 3).map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
            {(matches?.programs ?? []).slice(0, 2).map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
            {matches?.opportunities.slice(0, 2).map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
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
    { label: 'Location', done: !!(user?.city || user?.state) },
  ]
  const doneCount = completenessItems.filter((i) => i.done).length
  const complete = doneCount === completenessItems.length

  const recentOpps = oppsData?.opportunities.slice(0, 2) ?? []

  return (
    <>
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-heading">Inbox</p>
            </div>
            <Link to="/messages">
              <Button variant="outline" size="sm">
                View <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <p className="text-2xl font-bold text-heading">{unreadCount}
            <span className="ml-1 text-sm font-normal text-muted">unread</span>
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-heading">Profile</p>
            </div>
            <span className="text-xs text-muted">{doneCount}/{completenessItems.length}</span>
          </div>
          <div className="w-full bg-bg rounded-full h-1.5 mb-2">
            <div
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${(doneCount / completenessItems.length) * 100}%` }}
            />
          </div>
          {!complete && (
            <div className="space-y-1">
              {completenessItems.filter((i) => !i.done).slice(0, 2).map((item) => (
                <p key={item.label} className="text-xs text-muted flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-border inline-block" />
                  Missing: {item.label}
                </p>
              ))}
              <Link to="/profile" className="text-xs font-medium text-primary hover:underline">
                Complete profile →
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {recentOpps.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-heading">
              <Briefcase className="h-4 w-4 text-primary" />
              Partnerships
            </h2>
            <Link to="/opportunities?type=partnership" className="text-xs font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {recentOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </div>
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
      {user?.availability && (
        <Card>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-success-text" />
              <div>
                <p className="text-xs text-muted">Availability</p>
                <p className="text-sm font-semibold text-heading capitalize">{user.availability.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm">Update</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {(pendingCount > 0 || approvedCount > 0) && (
        <Card>
          <CardBody className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-heading">
              <ClipboardList className="h-4 w-4 text-primary" />
              Applications
            </h2>
            <div className="flex items-center gap-3 text-xs text-secondary">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-warning" />
                {pendingCount} pending
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                {approvedCount} approved
              </span>
            </div>
            <Link to="/my-services" className="shrink-0 text-xs font-medium text-primary hover:underline">
              View →
            </Link>
          </CardBody>
        </Card>
      )}

      {(user?.total_volunteer_hours ?? 0) > 0 && (
        <Card>
          <CardBody className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-success-text" />
            <div>
              <p className="text-xs text-muted">Total volunteer hours</p>
              <p className="text-lg font-bold text-heading">{user!.total_volunteer_hours}</p>
            </div>
          </CardBody>
        </Card>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            <Briefcase className="h-4 w-4 text-primary" />
            Volunteer Opportunities
          </h2>
          <Link to="/opportunities?type=volunteer" className="text-xs font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-card bg-border" />)}
          </div>
        ) : oppsData?.opportunities.length === 0 ? (
          <p className="text-xs text-muted">No volunteer opportunities open right now.</p>
        ) : (
          <div className="space-y-2">
            {oppsData?.opportunities.slice(0, 3).map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}
      </div>
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
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-xs text-muted">Pending</p>
                <p className="text-xl font-bold text-heading">{pendingCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success-text" />
              <div>
                <p className="text-xs text-muted">Accepted</p>
                <p className="text-xl font-bold text-heading">{acceptedCount}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-heading">
              <Search className="h-4 w-4 text-primary" />
              Find resources
            </h2>
            <Link to="/programs" className="text-xs font-medium text-primary hover:underline">
              All programs →
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'Housing',       category: 'housing'       },
              { label: 'Food',          category: 'food_bank'     },
              { label: 'Mental Health', category: 'mental_health' },
              { label: 'Healthcare',    category: 'healthcare'    },
              { label: 'Youth',         category: 'youth_services'},
              { label: 'Shelter',       category: 'shelter'       },
              { label: 'Education',     category: 'education'     },
            ].map(({ label, category }) => (
              <Link
                key={category}
                to={`/organizations?category=${category}`}
                className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs text-secondary transition hover:border-primary hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </div>
          <Link to="/organizations" className="text-xs text-muted hover:text-heading">
            Browse all organizations →
          </Link>
        </CardBody>
      </Card>
    </>
  )
}

/* ── Onboarding checklist ───────────────────────────────────────────────── */

function OnboardingChecklist() {
  const { user } = useAuth()
  const dismissedKey = user ? `onboarding_checklist_dismissed_${user.id}` : null
  const [dismissed, setDismissed] = useState(() =>
    dismissedKey ? localStorage.getItem(dismissedKey) === 'true' : false
  )

  if (!user || dismissed) return null

  const hasOrg = user.organizations.length > 0
  const profileComplete = !!(user.bio && (user.city || user.state))
  const hasSpecialty = !!user.specialty
  const hasAvailability = !!user.availability
  const intakeDone = user.intake_completed === true

  let steps: { label: string; done: boolean; to: string }[] = []

  switch (user.profile_type) {
    case 'individual_seeker':
      steps = [
        { label: 'Complete intake questionnaire', done: intakeDone, to: '/intake' },
        { label: 'Browse your matched organizations', done: false, to: '/organizations' },
        { label: 'Apply to a program or service', done: false, to: '/programs' },
      ]
      break
    case 'individual_professional':
      steps = [
        { label: 'Add bio and specialty to your profile', done: profileComplete && hasSpecialty, to: '/profile' },
        { label: 'Browse partnership opportunities', done: false, to: '/opportunities' },
        { label: 'Apply to an opportunity', done: false, to: '/opportunities' },
      ]
      break
    case 'volunteer':
      steps = [
        { label: 'Add availability and bio to your profile', done: profileComplete && hasAvailability, to: '/profile' },
        { label: 'Browse volunteer opportunities', done: false, to: '/volunteer-opportunities' },
        { label: 'Apply to an opportunity', done: false, to: '/volunteer-opportunities' },
      ]
      break
    case 'resource_navigator':
      steps = [
        { label: 'Complete your profile', done: profileComplete, to: '/profile' },
        { label: 'Create or join an organization', done: hasOrg, to: '/organizations/new' },
        { label: 'Add a client to your caseload', done: false, to: '/caseload' },
      ]
      break
    case 'community_org':
    case 'business_service_provider':
      steps = [
        { label: 'Create your organization profile', done: hasOrg, to: '/organizations/new' },
        { label: 'Post your first opportunity', done: false, to: hasOrg ? `/organizations/${user.organizations[0]?.id}/manage` : '/organizations/new' },
        { label: 'Connect with a partner organization', done: false, to: '/organizations' },
      ]
      break
    default:
      return null
  }

  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  const dismiss = () => {
    if (dismissedKey) localStorage.setItem(dismissedKey, 'true')
    setDismissed(true)
  }

  return (
    <Card>
      <CardBody>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-heading">Getting started</p>
          </div>
          <button onClick={dismiss} className="text-muted hover:text-heading" aria-label="Dismiss">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mb-3 text-xs text-muted">{doneCount}/{steps.length} complete</p>
        <div className="space-y-2">
          {steps.map((step) => (
            <Link
              key={step.label}
              to={step.done ? '#' : step.to}
              onClick={step.done ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-2 text-xs ${step.done ? 'text-muted pointer-events-none' : 'text-heading hover:text-primary'}`}
            >
              <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${step.done ? 'text-success-text' : 'text-border'}`} />
              <span className={step.done ? 'line-through' : ''}>{step.label}</span>
            </Link>
          ))}
        </div>
        {allDone && (
          <p className="mt-3 text-xs font-medium text-success-text">You're all set!</p>
        )}
      </CardBody>
    </Card>
  )
}

/* ── My Organizations section ───────────────────────────────────────────── */

function MyOrganizationsSection() {
  const { user } = useAuth()
  const orgIds = user?.organizations.map((m) => m.id) ?? []
  const { data: myOrgsData } = useOrganizations()
  const myOrgs = myOrgsData?.organizations.filter((o) => orgIds.includes(o.id)) ?? []

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-heading">
          <Building2 className="h-4 w-4 text-primary" />
          My Organizations
        </h2>
        <Link to="/organizations/new">
          <Button size="sm">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </Link>
      </div>

      {myOrgs.length === 0 ? (
        <Card>
          <CardBody className="py-6 text-center">
            <Building2 className="mx-auto mb-2 h-7 w-7 text-muted opacity-50" />
            <p className="text-xs text-muted">No organizations yet.</p>
            <Link to="/organizations/new" className="mt-2 inline-block">
              <Button size="sm">Create first org</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {myOrgs.map((org) => {
            const membership = user?.organizations.find((m) => m.id === org.id)
            return (
              <Card key={org.id}>
                <CardBody className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Link to={`/organizations/${org.id}`} className="text-sm font-semibold text-heading hover:text-primary">
                      {org.name}
                    </Link>
                    <Badge variant={membership?.role === 'admin' ? 'info' : 'default'}>
                      {membership?.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">{CATEGORY_LABELS[org.category]}</p>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {org.member_count}
                    </span>
                    {org.open_opportunity_count > 0 && (
                      <span className="flex items-center gap-1 text-success-text">
                        <Briefcase className="h-3 w-3" />
                        {org.open_opportunity_count} open
                      </span>
                    )}
                  </div>
                  {membership?.role === 'admin' && (
                    <div className="flex gap-2 pt-1">
                      <Link to={`/organizations/${org.id}/manage`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                      <Link to={`/organizations/${org.id}/opportunities/new`}>
                        <Button variant="outline" size="sm">+ Opp</Button>
                      </Link>
                    </div>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Right sidebar ──────────────────────────────────────────────────────── */

function RightSidebar() {
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
    <div className="space-y-5">
      <OnboardingChecklist />
      {showSeeker && <SeekerSection />}
      {isProfessional && <ProfessionalSection />}
      {isVolunteer && <VolunteerSection />}
      {isNavigator && (
        <>
          <NavigatorSection />
          <MyOrganizationsSection />
        </>
      )}
      {isOrgType && <MyOrganizationsSection />}
      {isSeeker && user.intake_completed !== true && (
        <Card>
          <CardBody className="py-6 text-center">
            <Sparkles className="mx-auto mb-2 h-8 w-8 text-primary opacity-60" />
            <p className="text-sm font-semibold text-heading mb-1">Complete your intake</p>
            <p className="text-xs text-muted mb-3">We'll match you with orgs and opportunities based on your needs.</p>
            <Link to="/intake">
              <Button size="sm">Start questionnaire</Button>
            </Link>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

/* ── Main dashboard ─────────────────────────────────────────────────────── */

export function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading">Dashboard</h1>
        <p className="mt-0.5 text-sm text-secondary">Welcome back, {user.first_name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left — social feed */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-heading">Activity Feed</h2>
          </div>
          <SocialFeed />
        </div>

        {/* Right — role-specific modules */}
        <RightSidebar />
      </div>
    </div>
  )
}
