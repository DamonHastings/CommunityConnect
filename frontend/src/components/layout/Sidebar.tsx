import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useConversations } from '../../hooks/useMessages'
import { MessageSquare, LayoutDashboard, Building2, BookOpen, Briefcase, Users, Landmark, Star, Activity, HandHeart, ChevronDown, ClipboardList } from 'lucide-react'

const ACTIVE_ORG_KEY = 'active_org_id'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, authOnly: true },
  { to: '/feed', label: 'Activity', icon: Activity, authOnly: true },
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/programs', label: 'Programs', icon: BookOpen },
  { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
  { to: '/professionals', label: 'People', icon: Users },
  { to: '/organizations?type=foundation', label: 'Funders', icon: Landmark },
  { to: '/my-services', label: 'My Services', icon: Star, authOnly: true },
]

export function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const { data: convsData } = useConversations(!!user)
  const totalUnread = (convsData?.conversations ?? []).reduce((sum, c) => sum + c.unread_count, 0)

  const orgs = user?.organizations ?? []
  const showOrgContext =
    !!user &&
    (user.profile_type === 'resource_navigator' ||
     user.profile_type === 'community_org' ||
     user.profile_type === 'business_service_provider') &&
    orgs.length > 0

  const [activeOrgId, setActiveOrgId] = useState<number>(() => {
    const stored = localStorage.getItem(ACTIVE_ORG_KEY)
    const storedNum = stored ? Number(stored) : null
    const first = orgs[0]?.id ?? 0
    return storedNum && orgs.some((o) => o.id === storedNum) ? storedNum : first
  })
  const [orgPickerOpen, setOrgPickerOpen] = useState(false)

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? orgs[0]

  const selectOrg = (id: number) => {
    setActiveOrgId(id)
    localStorage.setItem(ACTIVE_ORG_KEY, String(id))
    setOrgPickerOpen(false)
  }

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
        {user?.profile_type === 'resource_navigator' && (
          <Link to="/caseload" className={linkClass('/caseload')}>
            <ClipboardList className="h-4 w-4 shrink-0" />
            My Caseload
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

      {showOrgContext && activeOrg && (
        <div className="mt-auto border-t border-border p-3">
          {orgs.length > 1 ? (
            <div className="relative">
              <button
                onClick={() => setOrgPickerOpen((v) => !v)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-bg transition-colors"
              >
                <Building2 className="h-4 w-4 shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-heading">{activeOrg.name}</p>
                  <p className="text-[10px] text-muted capitalize">{activeOrg.role}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
              </button>
              {orgPickerOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full rounded-lg border border-border bg-surface shadow-dropdown">
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => selectOrg(org.id)}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-bg transition-colors first:rounded-t-lg last:rounded-b-lg ${org.id === activeOrgId ? 'text-primary font-medium' : 'text-heading'}`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link to={`/organizations/${activeOrg.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-bg transition-colors">
              <Building2 className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-heading">{activeOrg.name}</p>
                <p className="text-[10px] text-muted capitalize">{activeOrg.role}</p>
              </div>
            </Link>
          )}
        </div>
      )}
    </aside>
  )
}
