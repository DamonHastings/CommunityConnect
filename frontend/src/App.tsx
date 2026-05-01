import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { OrganizationsPage } from './pages/organizations/OrganizationsPage'
import { OrganizationProfilePage } from './pages/organizations/OrganizationProfilePage'
import { OrganizationFormPage } from './pages/organizations/OrganizationFormPage'
import { OpportunitiesPage } from './pages/opportunities/OpportunitiesPage'
import { OpportunityDetailPage } from './pages/opportunities/OpportunityDetailPage'
import { OpportunityFormPage } from './pages/opportunities/OpportunityFormPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-64 items-center justify-center text-gray-400">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
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
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/organizations/new" element={<RequireAuth><OrganizationFormPage /></RequireAuth>} />
        <Route path="/organizations/:id/edit" element={<RequireAuth><OrganizationFormPage /></RequireAuth>} />
        <Route path="/organizations/:id/opportunities/new" element={<RequireAuth><OpportunityFormPage /></RequireAuth>} />

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
