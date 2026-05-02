import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useOpportunities } from '../../hooks/useOpportunities'
import { useMatches } from '../../hooks/useMatches'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { OrganizationCard } from '../../components/organizations/OrganizationCard'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { CATEGORY_LABELS, NEEDS_CATEGORY_LABELS } from '../../lib/utils'
import { Building2, Briefcase, Plus, Users, Sparkles } from 'lucide-react'

export function DashboardPage() {
  const { user } = useAuth()
  const orgIds = user?.organizations.map((m) => m.id) ?? []

  const showMatches = user?.profile_type === 'individual_seeker' && user.intake_completed === true

  const { data: myOrgsData } = useOrganizations()
  const myOrgs = myOrgsData?.organizations.filter((o) => orgIds.includes(o.id)) ?? []

  const { data: recentOpps } = useOpportunities({ status: 'open', page: 1 })
  const { data: matches, isLoading: matchesLoading } = useMatches(!!showMatches)

  if (!user) return null

  const needsLabels = (matches?.needs_categories ?? [])
    .map((n) => NEEDS_CATEGORY_LABELS[n])
    .filter(Boolean)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back, {user.first_name}</p>
      </div>

      {/* My Organizations */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
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
              const membership = user.organizations.find((m) => m.id === org.id)
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
                      <div className="flex gap-2 pt-2">
                        <Link to={`/organizations/${org.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
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

      {showMatches ? (
        /* Matched for you — individual seekers with completed intake */
        <section>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Matched for you
            </h2>
            <Link to="/organizations" className="text-sm font-medium text-indigo-600 hover:underline">
              Browse all →
            </Link>
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
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Organizations
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {matches.organizations.map((org) => (
                      <OrganizationCard key={org.id} organization={org} />
                    ))}
                  </div>
                </div>
              )}

              {matches?.opportunities && matches.opportunities.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Open Opportunities
                  </h3>
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
      ) : (
        /* Generic recent opportunities for all other users */
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Recent Open Opportunities
            </h2>
            <Link to="/opportunities" className="text-sm font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          {recentOpps?.opportunities.length === 0 ? (
            <p className="text-gray-500">No open opportunities at the moment.</p>
          ) : (
            <div className="space-y-3">
              {recentOpps?.opportunities.slice(0, 5).map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
