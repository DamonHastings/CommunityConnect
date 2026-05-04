import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useConversations } from '../../hooks/useMessages'
import { Button } from '../ui/Button'
import { MessageSquare } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: convsData } = useConversations(!!user)
  const totalUnread = (convsData?.conversations ?? []).reduce((sum, c) => sum + c.unread_count, 0)
  const isIntakeGated =
    user?.profile_type === 'individual_seeker' &&
    user.intake_completed === false &&
    location.pathname === '/intake'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
              <span className="text-2xl">🤝</span>
              CommunityConnect
            </Link>
            {!isIntakeGated && (
              <div className="hidden items-center gap-6 md:flex">
                <Link to="/organizations" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Organizations
                </Link>
                <Link to="/programs" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Programs
                </Link>
                <Link to="/opportunities" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Opportunities
                </Link>
                <Link to="/professionals" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Professionals
                </Link>
                {user && (
                  <>
                    <Link to="/my-services" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                      My Services
                    </Link>
                    <Link to="/messages" className="relative text-sm font-medium text-gray-600 hover:text-gray-900">
                      <MessageSquare className="h-4 w-4" />
                      {totalUnread > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                          {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {!isIntakeGated && (
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
                      {user.full_name}
                    </Link>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
