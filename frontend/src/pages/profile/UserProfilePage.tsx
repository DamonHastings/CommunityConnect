import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import type { User } from '../../types'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PROFILE_TYPE_LABELS } from '../../lib/utils'
import { Building2 } from 'lucide-react'

function fetchUser(id: string): Promise<User> {
  return api.get(`/users/${id}`).then((r) => r.data.user)
}

export function UserProfilePage() {
  const { id } = useParams<{ id: string }>()

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex h-64 items-center justify-center text-gray-400">Loading…</div>
  if (isError || !user) return <div className="py-16 text-center text-gray-500">User not found.</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
      </div>

      <Card>
        <CardBody>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Account type</p>
          <p className="mt-1 font-medium text-gray-900">{PROFILE_TYPE_LABELS[user.profile_type]}</p>
        </CardBody>
      </Card>

      {(user.bio || user.city || user.state || user.website) && (
        <Card>
          <CardHeader>About</CardHeader>
          <CardBody className="space-y-3 text-sm text-gray-700">
            {user.bio && <p>{user.bio}</p>}
            {(user.city || user.state) && (
              <p className="text-gray-500">{[user.city, user.state].filter(Boolean).join(', ')}</p>
            )}
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {user.website}
              </a>
            )}
          </CardBody>
        </Card>
      )}

      {(user.services_offered.length > 0 || user.services_needed.length > 0 || user.availability) && (
        <Card>
          <CardHeader>Services &amp; availability</CardHeader>
          <CardBody className="space-y-3">
            {user.services_offered.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">Offering</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.services_offered.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                </div>
              </div>
            )}
            {user.services_needed.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">Seeking</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.services_needed.map((s) => <Badge key={s} variant="warning">{s}</Badge>)}
                </div>
              </div>
            )}
            {user.availability && (
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">Availability</p>
                <p className="text-sm capitalize text-gray-700">{user.availability.replace('_', ' ')}</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {user.organizations.length > 0 && (
        <Card>
          <CardHeader>Organizations</CardHeader>
          <CardBody className="space-y-2">
            {user.organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between">
                <Link to={`/organizations/${org.id}`} className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-indigo-600">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {org.name}
                </Link>
                <Badge variant={org.role === 'admin' ? 'info' : 'default'}>{org.role}</Badge>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
