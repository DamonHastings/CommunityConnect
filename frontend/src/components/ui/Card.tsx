import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-card border border-border bg-surface shadow-card', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4 border-b border-border', className)}>{children}</div>
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn('px-6 py-4 border-t border-border bg-bg rounded-b-card', className)}>{children}</div>
}
