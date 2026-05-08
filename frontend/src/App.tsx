import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OrganizationsPage } from './pages/organizations/OrganizationsPage'
import { OrganizationProfilePage } from './pages/organizations/OrganizationProfilePage'
import { OrganizationFormPage } from './pages/organizations/OrganizationFormPage'
import { OrganizationManagePage } from './pages/organizations/OrganizationManagePage'
import { OpportunitiesPage } from './pages/opportunities/OpportunitiesPage'
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage'
import { OpportunityFormPage } from './pages/opportunities/OpportunityFormPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { UserProfilePage } from './pages/profile/UserProfilePage'
import { IntakeQuestionnairePage } from './pages/intake/IntakeQuestionnairePage'
import { MyServicesPage } from './pages/services/MyServicesPage'
import { ProgramsPage } from './pages/programs/ProgramsPage'
import { ProgramDetailPage } from './pages/programs/ProgramDetailPage'
import { ProgramFormPage } from './pages/programs/ProgramFormPage'
import { ProfessionalsPage } from './pages/professionals/ProfessionalsPage'
import { MessagesPage } from './pages/messages/MessagesPage'
import { ConversationPage } from './pages/messages/ConversationPage'
import { FeedPage } from './pages/feed/FeedPage'
import { VolunteerOpportunitiesPage } from './pages/opportunities/VolunteerOpportunitiesPage'
import { CaseloadPage } from './pages/caseloads/CaseloadPage'
import { AdvocateDashboard } from './pages/advocate/AdvocateDashboard'
import { ClientProfilePage } from './pages/advocate/ClientProfilePage'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="flex h-64 items-center justify-center text-gray-400">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (
    user.profile_type === 'individual_seeker' &&
    user.intake_completed === false &&
    location.pathname !== '/intake'
  ) {
    return <Navigate to="/intake" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/organizations/:id" element={<OrganizationProfilePage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:id" element={<ProgramDetailPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="/volunteer-opportunities" element={<RequireAuth><VolunteerOpportunitiesPage /></RequireAuth>} />

        <Route path="/users/:id" element={<UserProfilePage />} />
        <Route path="/professionals" element={<ProfessionalsPage />} />

        {/* Protected routes */}
        <Route path="/intake" element={<RequireAuth><IntakeQuestionnairePage /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/organizations/new" element={<RequireAuth><OrganizationFormPage /></RequireAuth>} />
        <Route path="/organizations/:id/edit" element={<RequireAuth><OrganizationFormPage /></RequireAuth>} />
        <Route path="/organizations/:id/manage" element={<RequireAuth><OrganizationManagePage /></RequireAuth>} />
        <Route path="/organizations/:id/opportunities/new" element={<RequireAuth><OpportunityFormPage /></RequireAuth>} />
        <Route path="/organizations/:orgId/programs/new" element={<RequireAuth><ProgramFormPage /></RequireAuth>} />
        <Route path="/programs/:id/edit" element={<RequireAuth><ProgramFormPage /></RequireAuth>} />
        <Route path="/my-applications" element={<Navigate to="/my-services" replace />} />
        <Route path="/my-services" element={<RequireAuth><MyServicesPage /></RequireAuth>} />
        <Route path="/caseload" element={<RequireAuth><CaseloadPage /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/messages/:id" element={<RequireAuth><ConversationPage /></RequireAuth>} />
        <Route path="/feed" element={<RequireAuth><FeedPage /></RequireAuth>} />
        <Route path="/advocate/dashboard" element={<RequireAuth><AdvocateDashboard /></RequireAuth>} />
        <Route path="/client-profiles/:id" element={<RequireAuth><ClientProfilePage /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
