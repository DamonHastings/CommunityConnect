import { Link } from 'react-router-dom'
import type { Organization } from '../../types'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { CATEGORY_LABELS, ORG_TYPE_LABELS } from '../../lib/utils'
import { MapPin, Users, Briefcase, Bookmark, Star } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useSaveOrganization, useUnsaveOrganization } from '../../hooks/useSavedOrganizations'

interface OrganizationCardProps {
  organization: Organization
}

export function OrganizationCard({ organization: org }: OrganizationCardProps) {
  const { user } = useAuth()
  const isSaved = user?.saved_org_ids?.includes(org.id) ?? false
  const save = useSaveOrganization()
  const unsave = useUnsaveOrganization()

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSaved) {
      unsave.mutate(org.id)
    } else {
      save.mutate(org.id)
    }
  }

  return (
    <Link to={`/organizations/${org.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardBody className="flex flex-col gap-3">
          {org.featured && (
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-600">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              Featured
            </div>
          )}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight">{org.name}</h3>
            <div className="flex shrink-0 items-center gap-1.5">
              {user && (
                <button
                  onClick={handleToggleSave}
                  className="rounded p-0.5 text-gray-400 hover:text-indigo-600 transition-colors"
                  title={isSaved ? 'Remove from saved' : 'Save organization'}
                >
                  <Bookmark
                    className="h-4 w-4"
                    fill={isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={isSaved ? 0 : 1.5}
                    color={isSaved ? '#4f46e5' : undefined}
                  />
                </button>
              )}
              {org.org_type && org.org_type !== 'nonprofit' && (
                <Badge variant="default">{ORG_TYPE_LABELS[org.org_type]}</Badge>
              )}
              <Badge variant="info">{CATEGORY_LABELS[org.category]}</Badge>
            </div>
          </div>

          {org.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
          )}

          <div className="mt-auto flex flex-wrap gap-3 text-xs text-gray-500">
            {(org.city || org.state) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[org.city, org.state].filter(Boolean).join(', ')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {org.member_count} member{org.member_count !== 1 ? 's' : ''}
            </span>
            {org.open_opportunity_count > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <Briefcase className="h-3 w-3" />
                {org.open_opportunity_count} open
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
