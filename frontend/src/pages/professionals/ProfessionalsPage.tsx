import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import type { User } from '../../types'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { SPECIALTY_OPTIONS } from '../../lib/utils'
import { Briefcase, MapPin, Search } from 'lucide-react'

function useProfessionals(q: string, specialty: string) {
  return useQuery<{ professionals: User[] }>({
    queryKey: ['professionals', q, specialty],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (specialty) params.set('specialty', specialty)
      return api.get(`/professionals?${params.toString()}`).then((r) => r.data)
    },
  })
}

function ProfessionalCard({ user }: { user: User }) {
  return (
    <Link to={`/users/${user.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
            {user.specialty && (
              <p className="flex items-center gap-1 text-sm text-indigo-600">
                <Briefcase className="h-3.5 w-3.5" />
                {user.specialty}
              </p>
            )}
          </div>

          {(user.city || user.state) && (
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5" />
              {[user.city, user.state].filter(Boolean).join(', ')}
            </p>
          )}

          {user.bio && (
            <p className="line-clamp-2 text-sm text-gray-600">{user.bio}</p>
          )}

          {user.services_offered.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user.services_offered.slice(0, 4).map((s) => (
                <Badge key={s} variant="success">{s}</Badge>
              ))}
              {user.services_offered.length > 4 && (
                <Badge variant="default">+{user.services_offered.length - 4}</Badge>
              )}
            </div>
          )}

          {user.communities_served && user.communities_served.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {user.communities_served.slice(0, 3).map((c) => (
                <Badge key={c} variant="info">{c}</Badge>
              ))}
            </div>
          )}

          {user.availability && (
            <p className="text-xs text-gray-400 capitalize">{user.availability.replace(/_/g, ' ')}</p>
          )}
        </CardBody>
      </Card>
    </Link>
  )
}

export function ProfessionalsPage() {
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState('')
  const { data, isLoading } = useProfessionals(q, specialty)
  const professionals = data?.professionals ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Professionals</h1>
        <p className="mt-1 text-gray-600">Discover individual professionals offering services to organizations and community members.</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, specialty, or bio…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All specialties' },
            ...SPECIALTY_OPTIONS.map((s) => ({ value: s, label: s })),
          ]}
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="w-52"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-200" />)}
        </div>
      ) : professionals.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-gray-500">
            No professionals found. Try adjusting your search.
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((user) => (
            <ProfessionalCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
