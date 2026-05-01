import { Link } from 'react-router-dom'
import type { EngagementOpportunity } from '../../types'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { OPPORTUNITY_TYPE_LABELS, formatDate } from '../../lib/utils'
import { Calendar, MapPin, Building2 } from 'lucide-react'

interface OpportunityCardProps {
  opportunity: EngagementOpportunity
  showOrg?: boolean
}

const STATUS_VARIANTS = {
  open: 'success',
  closed: 'default',
  filled: 'warning',
} as const

const TYPE_VARIANTS = {
  volunteer: 'info',
  partnership: 'info',
  funding: 'success',
  mentorship: 'info',
  resource_sharing: 'info',
} as const

export function OpportunityCard({ opportunity: opp, showOrg = true }: OpportunityCardProps) {
  return (
    <Link to={`/opportunities/${opp.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardBody className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight">{opp.title}</h3>
            <div className="flex shrink-0 gap-1.5">
              <Badge variant={TYPE_VARIANTS[opp.opportunity_type]}>
                {OPPORTUNITY_TYPE_LABELS[opp.opportunity_type]}
              </Badge>
              <Badge variant={STATUS_VARIANTS[opp.status]}>{opp.status}</Badge>
            </div>
          </div>

          {opp.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{opp.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {showOrg && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {opp.organization.name}
              </span>
            )}
            {opp.remote && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Remote
              </span>
            )}
            {opp.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(opp.start_date)}
                {opp.end_date && ` – ${formatDate(opp.end_date)}`}
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
