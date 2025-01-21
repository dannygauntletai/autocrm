import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export function LogoutPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      } catch (error) {
        console.error('Error logging out:', error)
      } finally {
        navigate('/login')
      }
    }

    handleLogout()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Logging out...</p>
      </div>
    </div>
  )
} 