import { useState } from 'react'
import { useOpportunities } from '../../hooks/useOpportunities'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { OPPORTUNITY_TYPE_LABELS } from '../../lib/utils'
import type { OpportunityType } from '../../types'

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: '', label: 'All statuses' },
  { value: 'closed', label: 'Closed' },
  { value: 'filled', label: 'Filled' },
]

export function OpportunitiesPage() {
  const [type, setType] = useState('')
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useOpportunities({ type: type as OpportunityType, status, page })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Engagement Opportunities</h1>
        <p className="mt-1 text-gray-600">Browse volunteer, partnership, and funding opportunities</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          className="w-44"
        />
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="w-36"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : data?.opportunities.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No opportunities found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-500">
            {data?.meta.total_count} opportunit{data?.meta.total_count !== 1 ? 'ies' : 'y'} found
          </div>
          <div className="space-y-3">
            {data?.opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>

          {data && data.meta.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.meta.current_page} of {data.meta.total_pages}
              </span>
              <Button variant="outline" size="sm" disabled={page === data.meta.total_pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
