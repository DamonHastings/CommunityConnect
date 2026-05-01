import { useParams, Link } from 'react-router-dom'
import { useOpportunity } from '../../hooks/useOpportunities'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { OPPORTUNITY_TYPE_LABELS, formatDate } from '../../lib/utils'
import { Calendar, MapPin, Mail, Building2, ArrowLeft } from 'lucide-react'

const STATUS_VARIANTS = {
  open: 'success',
  closed: 'default',
  filled: 'warning',
} as const

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: opp, isLoading } = useOpportunity(id!)

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
  }

  if (!opp) return <div className="py-16 text-center text-gray-500">Opportunity not found.</div>

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/opportunities" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to opportunities
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{opp.title}</h1>
            <div className="flex shrink-0 gap-2">
              <Badge variant="info">{OPPORTUNITY_TYPE_LABELS[opp.opportunity_type]}</Badge>
              <Badge variant={STATUS_VARIANTS[opp.status]}>{opp.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              <Link to={`/organizations/${opp.organization.id}`} className="text-indigo-600 hover:underline">
                {opp.organization.name}
              </Link>
            </span>
            {opp.remote && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                Remote
              </span>
            )}
            {opp.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(opp.start_date)}
                {opp.end_date && ` – ${formatDate(opp.end_date)}`}
              </span>
            )}
            {opp.contact_email && (
              <a href={`mailto:${opp.contact_email}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                <Mail className="h-4 w-4" />
                {opp.contact_email}
              </a>
            )}
          </div>

          {opp.description && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{opp.description}</p>
            </div>
          )}

          {opp.requirements && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-line">{opp.requirements}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
