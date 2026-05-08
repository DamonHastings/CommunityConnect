import { Outlet } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { NotificationBell } from './NotificationBell'
import ancchorLogo from '../../assets/ancchor-logo-w-text-blkblue.svg'

function LandingNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1B1D2E]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img src={ancchorLogo} alt="Ancchor" className="h-9 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
          <Link to="/programs" className="hover:text-white transition-colors">Programs</Link>
          <Link to="/organizations" className="hover:text-white transition-colors">Organizations</Link>
          <Link to="/professionals" className="hover:text-white transition-colors">People</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <Link to="/dashboard" className="text-sm font-medium text-white/80 hover:text-white">
                {user.full_name}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}
                className="border-white/20 text-white hover:bg-white/10">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function LandingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
