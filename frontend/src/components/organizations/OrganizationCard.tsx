import { Link } from 'react-router-dom'
import type { Organization } from '../../types'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { CATEGORY_LABELS } from '../../lib/utils'
import { MapPin, Users, Briefcase } from 'lucide-react'

interface OrganizationCardProps {
  organization: Organization
}

export function OrganizationCard({ organization: org }: OrganizationCardProps) {
  return (
    <Link to={`/organizations/${org.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight">{org.name}</h3>
            <Badge variant="info" className="shrink-0">
              {CATEGORY_LABELS[org.category]}
            </Badge>
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
