import { Link } from 'react-router-dom'
import type { Program } from '../../types'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { PROGRAM_TYPE_LABELS, PROGRAM_STATUS_LABELS, formatDate } from '../../lib/utils'
import { Calendar, MapPin, Building2, Users } from 'lucide-react'

interface ProgramCardProps {
  program: Program
  showOrg?: boolean
}

const STATUS_VARIANTS: Record<Program['status'], 'warning' | 'info' | 'success' | 'default' | 'danger'> = {
  draft: 'warning',
  published: 'info',
  active: 'success',
  completed: 'default',
  cancelled: 'danger',
}

export function ProgramCard({ program, showOrg = true }: ProgramCardProps) {
  return (
    <Link to={`/programs/${program.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md cursor-pointer">
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight">{program.title}</h3>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              <Badge variant="info">{PROGRAM_TYPE_LABELS[program.program_type]}</Badge>
              <Badge variant={STATUS_VARIANTS[program.status]}>
                {PROGRAM_STATUS_LABELS[program.status]}
              </Badge>
            </div>
          </div>

          {program.applications_open && (
            <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
              Applications Open
            </span>
          )}

          {program.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>
          )}

          <div className="mt-auto flex flex-wrap gap-3 text-xs text-gray-500">
            {showOrg && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {program.organizations && program.organizations.length > 1
                  ? `${program.organizations[0].name} + ${program.organizations.length - 1} more`
                  : program.organization.name}
              </span>
            )}
            {program.remote ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Remote
              </span>
            ) : (program.city || program.state) ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[program.city, program.state].filter(Boolean).join(', ')}
              </span>
            ) : null}
            {program.starts_on && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(program.starts_on)}
                {program.ends_on && ` – ${formatDate(program.ends_on)}`}
              </span>
            )}
            {program.capacity && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {program.capacity} spots
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  )
}
