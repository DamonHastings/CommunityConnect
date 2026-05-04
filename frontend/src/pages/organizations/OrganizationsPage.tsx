import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrganizations } from '../../hooks/useOrganizations'
import { OrganizationCard } from '../../components/organizations/OrganizationCard'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { CATEGORY_LABELS, ORG_TYPE_LABELS } from '../../lib/utils'
import type { OrganizationCategory } from '../../types'
import { Search } from 'lucide-react'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

const ORG_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(ORG_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

export function OrganizationsPage() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [orgType, setOrgType] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useOrganizations({ q, category: category as OrganizationCategory, org_type: orgType, city, state, page })

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-1 text-gray-600">Find community resource organizations in your area</p>
        </div>
        {user && (
          <Link to="/organizations/new">
            <Button>+ Add Organization</Button>
          </Link>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            placeholder="Search by name or mission..."
            className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <Select
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          placeholder="All categories"
        />
        <Select
          options={ORG_TYPE_OPTIONS}
          value={orgType}
          onChange={(e) => { setOrgType(e.target.value); setPage(1) }}
          placeholder="All types"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="City"
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(1) }}
          />
          <Input
            placeholder="State"
            value={state}
            onChange={(e) => { setState(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : data?.organizations.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No organizations found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-500">
            {data?.meta.total_count} organization{data?.meta.total_count !== 1 ? 's' : ''} found
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.organizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>

          {data && data.meta.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {data.meta.current_page} of {data.meta.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.meta.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
