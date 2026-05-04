import { useState } from 'react'
import { usePrograms } from '../../hooks/usePrograms'
import { ProgramCard } from '../../components/programs/ProgramCard'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { PROGRAM_TYPE_LABELS } from '../../lib/utils'
import type { ProgramType } from '../../types'

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  ...Object.entries(PROGRAM_TYPE_LABELS).map(([value, label]) => ({ value, label })),
]

export function ProgramsPage() {
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = usePrograms({ type: type as ProgramType || undefined, page })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
        <p className="mt-1 text-gray-600">Browse mentorship, workshops, and community programs</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          options={TYPE_OPTIONS}
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1) }}
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : data?.programs.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          No programs found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-500">
            {data?.meta.total_count} program{data?.meta.total_count !== 1 ? 's' : ''} found
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
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
