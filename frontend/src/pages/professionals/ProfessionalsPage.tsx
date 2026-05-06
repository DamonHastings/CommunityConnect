import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import type { User } from '../../types'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { useAuth } from '../../contexts/AuthContext'
import { useStartConversation } from '../../hooks/useMessages'
import { SPECIALTY_OPTIONS } from '../../lib/utils'
import { Briefcase, MapPin, Search, MessageSquare } from 'lucide-react'

type PersonaFilter = 'all' | 'individual_professional' | 'volunteer' | 'resource_navigator'

const PERSONA_LABELS: Record<PersonaFilter, string> = {
  all: 'All',
  individual_professional: 'Professionals',
  volunteer: 'Volunteers',
  resource_navigator: 'Navigators',
}

function useProfessionals(q: string, specialty: string, profileType: PersonaFilter) {
  return useQuery<{ professionals: User[] }>({
    queryKey: ['professionals', q, specialty, profileType],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (specialty) params.set('specialty', specialty)
      if (profileType !== 'all') params.set('profile_type', profileType)
      return api.get(`/professionals?${params.toString()}`).then((r) => r.data)
    },
  })
}

function ProfessionalCard({ user, onMessage }: { user: User; onMessage?: (userId: number) => void }) {
  const profileLabel = user.profile_type === 'volunteer' ? 'Volunteer'
    : user.profile_type === 'resource_navigator' ? 'Navigator'
    : null

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/users/${user.id}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-heading hover:text-primary">{user.full_name}</h3>
            {user.specialty && (
              <p className="flex items-center gap-1 text-sm text-primary">
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                {user.specialty}
              </p>
            )}
            {profileLabel && !user.specialty && (
              <p className="text-xs text-muted">{profileLabel}</p>
            )}
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            {profileLabel && user.specialty && (
              <Badge variant="default">{profileLabel}</Badge>
            )}
            {onMessage && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.preventDefault(); onMessage(user.id) }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {(user.city || user.state) && (
          <p className="flex items-center gap-1 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {[user.city, user.state].filter(Boolean).join(', ')}
          </p>
        )}

        {user.bio && (
          <p className="line-clamp-2 text-sm text-secondary">{user.bio}</p>
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
          <Badge
            variant={
              user.availability === 'available_now' ? 'success' :
              user.availability === 'limited_availability' ? 'warning' :
              'default'
            }
          >
            {user.availability.replace(/_/g, ' ')}
          </Badge>
        )}
      </CardBody>
    </Card>
  )
}

export function ProfessionalsPage() {
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const startConversation = useStartConversation()
  const [q, setQ] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>('all')
  const { data, isLoading } = useProfessionals(q, specialty, personaFilter)
  const professionals = data?.professionals ?? []

  const handleMessage = (userId: number) => {
    startConversation.mutate(userId, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
    })
  }

  const showSpecialtyFilter = personaFilter === 'all' || personaFilter === 'individual_professional'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-heading">People</h1>
        <p className="mt-1 text-secondary">Find professionals, volunteers, and resource navigators in the community.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, specialty, or bio…"
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {showSpecialtyFilter && (
            <Select
              options={[
                { value: '', label: 'All specialties' },
                ...SPECIALTY_OPTIONS.map((s) => ({ value: s, label: s })),
              ]}
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-48"
            />
          )}
        </div>
        <div className="flex gap-1.5">
          {(Object.keys(PERSONA_LABELS) as PersonaFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => { setPersonaFilter(f); if (f !== 'individual_professional') setSpecialty('') }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                personaFilter === f
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {PERSONA_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-xl bg-border" />)}
        </div>
      ) : professionals.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-muted">
            No people found. Try adjusting your search.
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((user) => (
            <ProfessionalCard
              key={user.id}
              user={user}
              onMessage={currentUser && currentUser.id !== user.id ? handleMessage : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
