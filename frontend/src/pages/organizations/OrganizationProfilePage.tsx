import { useParams, Link } from 'react-router-dom'
import { useOrganization } from '../../hooks/useOrganizations'
import { useOrganizationOpportunities } from '../../hooks/useOpportunities'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { OpportunityCard } from '../../components/opportunities/OpportunityCard'
import { CATEGORY_LABELS, formatDate } from '../../lib/utils'
import { MapPin, Globe, Mail, Phone, Users, Calendar, Pencil } from 'lucide-react'

export function OrganizationProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: org, isLoading } = useOrganization(id!)
  const { data: oppsData } = useOrganizationOpportunities(id!)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-40 rounded-xl bg-gray-200" />
      </div>
    )
  }

  if (!org) return <div className="py-16 text-center text-gray-500">Organization not found.</div>

  const isAdmin = user?.organizations.some((m) => m.id === org.id && m.role === 'admin')
  const openOpps = oppsData?.opportunities.filter((o) => o.status === 'open') ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
            {org.verified && <Badge variant="success">Verified</Badge>}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="info">{CATEGORY_LABELS[org.category]}</Badge>
            <Badge variant={org.status === 'active' ? 'success' : 'default'}>{org.status}</Badge>
          </div>
        </div>
        {isAdmin && (
          <Link to={`/organizations/${org.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {org.description && (
            <Card>
              <CardHeader><h2 className="font-semibold text-gray-900">About</h2></CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-line">{org.description}</p>
              </CardBody>
            </Card>
          )}

          {org.mission && (
            <Card>
              <CardHeader><h2 className="font-semibold text-gray-900">Mission</h2></CardHeader>
              <CardBody>
                <p className="text-gray-700 whitespace-pre-line">{org.mission}</p>
              </CardBody>
            </Card>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Open Opportunities
                {openOpps.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">({openOpps.length})</span>
                )}
              </h2>
              {isAdmin && (
                <Link to={`/organizations/${org.id}/opportunities/new`}>
                  <Button size="sm">+ Add Opportunity</Button>
                </Link>
              )}
            </div>
            {openOpps.length === 0 ? (
              <p className="text-gray-500">No open opportunities at this time.</p>
            ) : (
              <div className="space-y-3">
                {openOpps.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><h2 className="font-semibold text-gray-900">Contact & Info</h2></CardHeader>
            <CardBody className="space-y-3 text-sm">
              {(org.city || org.state) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{[org.address, org.city, org.state, org.zip].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {org.website && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate">
                    {org.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {org.contact_email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <a href={`mailto:${org.contact_email}`} className="text-indigo-600 hover:underline">
                    {org.contact_email}
                  </a>
                </div>
              )}
              {org.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{org.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 shrink-0 text-gray-400" />
                <span>{org.member_count} member{org.member_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                <span>Joined {formatDate(org.created_at)}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
