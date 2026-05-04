import { useParams, Link } from 'react-router-dom'
import { useProgram } from '../../hooks/usePrograms'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PROGRAM_TYPE_LABELS, PROGRAM_STATUS_LABELS, formatDate } from '../../lib/utils'
import { Calendar, MapPin, Mail, Building2, ArrowLeft, Users, Pencil } from 'lucide-react'

const STATUS_VARIANTS: Record<string, 'warning' | 'info' | 'success' | 'default' | 'error'> = {
  draft: 'warning',
  published: 'info',
  active: 'success',
  completed: 'default',
  cancelled: 'error',
}

export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: program, isLoading } = useProgram(id)

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
  }

  if (!program) return <div className="py-16 text-center text-gray-500">Program not found.</div>

  const isAdmin = user?.organizations.some(
    (m) => m.id === program.organization.id && m.role === 'admin'
  )

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/programs" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to programs
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{program.title}</h1>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <Badge variant="info">{PROGRAM_TYPE_LABELS[program.program_type]}</Badge>
              <Badge variant={STATUS_VARIANTS[program.status]}>
                {PROGRAM_STATUS_LABELS[program.status]}
              </Badge>
              {isAdmin && (
                <Link to={`/programs/${program.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-5">
          {program.applications_open && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-green-200">
              Applications are currently open
              {program.application_closes_at && ` — closes ${formatDate(program.application_closes_at)}`}
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-gray-400" />
              <Link to={`/organizations/${program.organization.id}`} className="text-indigo-600 hover:underline">
                {program.organization.name}
              </Link>
            </span>
            {program.remote ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                Remote
              </span>
            ) : (program.city || program.state) ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {[program.city, program.state].filter(Boolean).join(', ')}
              </span>
            ) : null}
            {program.starts_on && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDate(program.starts_on)}
                {program.ends_on && ` – ${formatDate(program.ends_on)}`}
              </span>
            )}
            {program.capacity && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />
                {program.capacity} spots
              </span>
            )}
            {program.contact_email && (
              <a href={`mailto:${program.contact_email}`} className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                <Mail className="h-4 w-4" />
                {program.contact_email}
              </a>
            )}
          </div>

          {program.description && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">About</h2>
              <p className="text-gray-700 whitespace-pre-line">{program.description}</p>
            </div>
          )}

          {program.goals && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Goals</h2>
              <p className="text-gray-700 whitespace-pre-line">{program.goals}</p>
            </div>
          )}

          {(program.application_opens_at || program.application_closes_at) && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Application Window</h2>
              <p className="text-sm text-gray-600">
                {program.application_opens_at && `Opens: ${formatDate(program.application_opens_at)}`}
                {program.application_opens_at && program.application_closes_at && ' · '}
                {program.application_closes_at && `Closes: ${formatDate(program.application_closes_at)}`}
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
