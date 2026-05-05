import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useOpportunity } from '../../hooks/useOpportunities'
import { useApply, useWithdrawApplication } from '../../hooks/useApplications'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { OPPORTUNITY_TYPE_LABELS, formatDate } from '../../lib/utils'
import { Select } from '../../components/ui/Select'
import { Calendar, MapPin, Mail, Building2, ArrowLeft, CheckCircle, XCircle, Clock, Undo2, DollarSign } from 'lucide-react'
import type { ApplicationStatus } from '../../types'

const STATUS_VARIANTS = {
  open: 'success',
  closed: 'default',
  filled: 'warning',
} as const

const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'default'; icon: React.ReactNode }> = {
  pending: { label: 'Application Pending', variant: 'warning', icon: <Clock className="h-4 w-4" /> },
  approved: { label: 'Application Approved', variant: 'success', icon: <CheckCircle className="h-4 w-4" /> },
  rejected: { label: 'Application Rejected', variant: 'danger', icon: <XCircle className="h-4 w-4" /> },
  withdrawn: { label: 'Application Withdrawn', variant: 'default', icon: <Undo2 className="h-4 w-4" /> },
}

export function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: opp, isLoading } = useOpportunity(id!)
  const [message, setMessage] = useState('')
  const [applyOpen, setApplyOpen] = useState(false)
  const [applicantOrgId, setApplicantOrgId] = useState('')

  const apply = useApply(Number(id))
  const withdraw = useWithdrawApplication()

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
  }

  if (!opp) return <div className="py-16 text-center text-gray-500">Opportunity not found.</div>

  const myApp = opp.my_application
  const canApply = user && opp.status === 'open' && !myApp
  const isFunding = opp.opportunity_type === 'funding'

  const handleApply = () => {
    apply.mutate(
      { message, applicant_org_id: applicantOrgId ? Number(applicantOrgId) : undefined },
      {
        onSuccess: () => {
          setApplyOpen(false)
          setMessage('')
          setApplicantOrgId('')
        },
      }
    )
  }

  const handleWithdraw = () => {
    if (!myApp) return
    withdraw.mutate({ id: myApp.id, opportunityId: Number(id) })
  }

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

          {isFunding && (opp.funding_amount || opp.eligibility) && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 space-y-2 ring-1 ring-amber-200">
              {opp.funding_amount && (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                  <DollarSign className="h-4 w-4" />
                  Funding amount: ${Number(opp.funding_amount).toLocaleString()}
                </div>
              )}
              {opp.eligibility && (
                <div>
                  <p className="text-sm font-medium text-amber-900">Eligibility</p>
                  <p className="text-sm text-amber-800 whitespace-pre-line">{opp.eligibility}</p>
                </div>
              )}
            </div>
          )}

          {/* Application section */}
          {user && (
            <div className="border-t pt-4">
              {myApp ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {APPLICATION_STATUS_CONFIG[myApp.status].icon}
                    <span className="text-sm font-medium text-gray-700">
                      {APPLICATION_STATUS_CONFIG[myApp.status].label}
                    </span>
                  </div>
                  {myApp.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWithdraw}
                      disabled={withdraw.isPending}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              ) : canApply ? (
                applyOpen ? (
                  <div className="space-y-3">
                    <h2 className="font-semibold text-gray-900">
                      {isFunding ? 'Submit a Grant Application' : 'Apply to this opportunity'}
                    </h2>
                    {isFunding && (
                      <p className="text-sm text-gray-500">
                        Your application will be reviewed by the funding organization. Select the organization you are applying on behalf of.
                      </p>
                    )}
                    {isFunding && user.organizations.length > 0 ? (
                      <Select
                        label="Applying organization (required for grants)"
                        options={[
                          { value: '', label: 'Select an organization…' },
                          ...user.organizations.map((o) => ({ value: String(o.id), label: o.name })),
                        ]}
                        value={applicantOrgId}
                        onChange={(e) => setApplicantOrgId(e.target.value)}
                      />
                    ) : isFunding ? (
                      <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                        You must belong to an organization to apply for grant funding.
                      </p>
                    ) : null}
                    <textarea
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={3}
                      placeholder={isFunding ? 'Describe your organization\'s project and how this funding will be used…' : 'Optional: introduce yourself or explain why you\'re interested…'}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    {apply.error && (
                      <p className="text-sm text-red-600">
                        {(apply.error as { response?: { data?: { errors?: string[] } } })?.response?.data?.errors?.[0] ?? 'Something went wrong'}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleApply}
                        disabled={apply.isPending || (isFunding && user.organizations.length > 0 && !applicantOrgId)}
                      >
                        {apply.isPending ? 'Submitting…' : isFunding ? 'Submit Grant Application' : 'Submit Application'}
                      </Button>
                      <Button variant="outline" onClick={() => setApplyOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setApplyOpen(true)}>
                    {isFunding ? 'Apply for Funding' : 'Apply to this opportunity'}
                  </Button>
                )
              ) : null}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
