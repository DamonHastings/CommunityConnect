import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useOrganizations } from '../hooks/useOrganizations'
import { OrganizationCard } from '../components/organizations/OrganizationCard'
import { HandshakeIcon, SearchIcon, CalendarCheckIcon } from 'lucide-react'

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}

export function LandingPage() {
  const { user } = useAuth()
  const { data } = useOrganizations({ page: 1 })
  const featured = data?.organizations.slice(0, 3) ?? []

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 text-5xl">🤝</div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Connect Your Community
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            CommunityConnect brings resource organizations together — making it easy to discover
            partners, share opportunities, and amplify your impact.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg">Get started free</Button>
                </Link>
                <Link to="/organizations">
                  <Button variant="outline" size="lg">Browse organizations</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Everything your organization needs
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<SearchIcon className="h-5 w-5" />}
            title="Discover Organizations"
            description="Search and filter hundreds of community organizations by category, location, and mission to find the right partners."
          />
          <FeatureCard
            icon={<CalendarCheckIcon className="h-5 w-5" />}
            title="Manage Opportunities"
            description="Post volunteer, partnership, and funding opportunities. Browse what's available from organizations like yours."
          />
          <FeatureCard
            icon={<HandshakeIcon className="h-5 w-5" />}
            title="Build Connections"
            description="Invite teammates to your org profile, manage your network, and grow your community presence."
          />
        </div>
      </section>

      {/* Featured orgs */}
      {featured.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Organizations on the platform</h2>
            <Link to="/organizations" className="text-sm font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featured.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {!user && (
        <section className="rounded-2xl bg-indigo-600 p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-indigo-200">
            Join the network and connect your organization with others doing great work.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg">Create your profile</Button>
            </Link>
            <Link to="/organizations">
              <Button variant="ghost" size="lg" className="text-white hover:bg-indigo-500">
                Explore first
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
