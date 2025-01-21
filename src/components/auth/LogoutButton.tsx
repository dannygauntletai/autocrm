import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
} 