import { Navigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
} 