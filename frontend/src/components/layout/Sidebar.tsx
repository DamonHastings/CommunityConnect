import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useConversations } from '../../hooks/useMessages'
import { MessageSquare, LayoutDashboard, Building2, BookOpen, Briefcase, Users, Landmark, Star, Activity, HandHeart } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authOnly: true },
  { to: '/feed', label: 'Activity', icon: Activity, authOnly: true },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/programs', label: 'Programs', icon: BookOpen },
  { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { to: '/professionals', label: 'Professionals', icon: Users },
  { to: '/organizations?type=foundation', label: 'Funders', icon: Landmark },
  { to: '/my-services', label: 'My Services', icon: Star, authOnly: true },
]

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const { data: convsData } = useConversations(!!user)
  const totalUnread = (convsData?.conversations ?? []).reduce((sum, c) => sum + c.unread_count, 0)

  const isIntakeGated =
    user?.profile_type === 'individual_seeker' &&
    user.intake_completed === false &&
    location.pathname === '/intake'

  if (isIntakeGated) return null

  const isActive = (to: string) => {
    const path = to.split('?')[0]
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  }

  const linkClass = (to: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive(to)
        ? 'bg-primary-subtle text-primary'
        : 'text-secondary hover:bg-bg hover:text-heading'
    }`

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {navItems
          .filter(item => !item.authOnly || !!user)
          .map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        {user?.profile_type === 'volunteer' && (
          <Link to="/volunteer-opportunities" className={linkClass('/volunteer-opportunities')}>
            <HandHeart className="h-4 w-4 shrink-0" />
            Volunteer Roles
          </Link>
        )}
        {user && (
          <Link
            to="/messages"
            className={`${linkClass('/messages')} relative`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            Messages
            {totalUnread > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {totalUnread > 9 ? '9+' : totalUnread}
              </span>
            )}
          </Link>
        )}
      </nav>
    </aside>
  )
}
