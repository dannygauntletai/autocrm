import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SessionProvider } from './context/SessionContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { LogoutPage } from './pages/auth/LogoutPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardView } from './components/dashboard/DashboardView'
import { TicketsView } from './components/tickets/TicketsView'
import { AgentsPage } from './pages/admin/AgentsPage'
import { useProfile } from './hooks/useProfile'
import { AgentInviteAcceptance } from './components/auth/AgentInviteAcceptance'
import TeamsPage from './pages/teams/TeamsPage'
import TeamPage from './pages/teams/[id]/TeamPage'
import { useEffect, useState } from 'react'
import { SubmitTicketPage } from './pages/public/SubmitTicket'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { getCurrentProfile } = useProfile()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const profile = await getCurrentProfile()
        setIsAdmin(profile.role === 'admin')
      } catch (err) {
        console.error('Failed to check admin status:', err)
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [getCurrentProfile])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/submit-ticket" element={<SubmitTicketPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="tickets" element={<TicketsView />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="teams/:id" element={<TeamPage />} />
            <Route path="admin/agents" element={
              <AdminRoute>
                <AgentsPage />
              </AdminRoute>
            } />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/accept-invite" 
            element={<AgentInviteAcceptance />} 
          />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}
