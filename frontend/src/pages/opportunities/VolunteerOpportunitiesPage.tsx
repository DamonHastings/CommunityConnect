import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOpportunities } from '../../hooks/useOpportunities'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatDate } from '../../lib/utils'
import { Search, Wifi, Building2, CalendarDays } from 'lucide-react'
import type { EngagementOpportunity } from '../../types'

type RemoteFilter = 'all' | 'remote' | 'in-person'

function OpportunityRow({ opp }: { opp: EngagementOpportunity }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link to={`/opportunities/${opp.id}`} className="font-semibold text-heading hover:text-primary">
              {opp.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <Link to={`/organizations/${opp.organization.id}`} className="hover:text-primary">
                  {opp.organization.name}
                </Link>
              </span>
              {opp.remote && (
                <span className="flex items-center gap-1 text-success-text">
                  <Wifi className="h-3 w-3" /> Remote
                </span>
              )}
              {opp.start_date && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(opp.start_date)}
                </span>
              )}
            </div>
            {opp.description && (
              <p className="mt-1.5 text-sm text-secondary line-clamp-2">{opp.description}</p>
            )}
          </div>
          <div className="shrink-0">
            <Link to={`/opportunities/${opp.id}`}>
              <Button size="sm" variant="outline">View</Button>
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export function VolunteerOpportunitiesPage() {
  const [search, setSearch] = useState('')
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>('all')

  const remoteParam = remoteFilter === 'remote' ? true : remoteFilter === 'in-person' ? false : undefined
  const { data, isLoading } = useOpportunities({ type: 'volunteer', status: 'open', remote: remoteParam })
  const all = data?.opportunities ?? []

  const filtered = search.trim()
    ? all.filter((o) =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.description?.toLowerCase().includes(search.toLowerCase()) ||
        o.organization.name.toLowerCase().includes(search.toLowerCase())
      )
    : all

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">Volunteer Opportunities</h1>
        <p className="mt-1 text-secondary">Find open volunteer roles that match your availability and interests.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, org, or description…"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'remote', 'in-person'] as RemoteFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setRemoteFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                remoteFilter === f
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {f === 'all' ? 'All' : f === 'remote' ? 'Remote' : 'In-person'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-secondary">
              {search || remoteFilter !== 'all'
                ? 'No opportunities match your filters.'
                : 'No open volunteer opportunities right now. Check back soon.'}
            </p>
            {(search || remoteFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setRemoteFilter('all') }}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted">{filtered.length} opportunit{filtered.length !== 1 ? 'ies' : 'y'}</p>
          <div className="space-y-3">
            {filtered.map((opp) => <OpportunityRow key={opp.id} opp={opp} />)}
          </div>
        </>
      )}
    </div>
  )
}
