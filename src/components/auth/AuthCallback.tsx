import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  useEffect(() => {
    const handleCallback = async () => {
      // Get the auth code from the URL
      const code = searchParams.get('code')
      const next = searchParams.get('next') || '/dashboard'

      if (code) {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=Authentication failed')
          return
        }
      }

      // Redirect to the next page
      navigate(next)
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-600">Completing authentication...</div>
    </div>
  )
} 