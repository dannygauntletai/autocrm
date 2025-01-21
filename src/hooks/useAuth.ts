import { useState, useCallback } from 'react'
import { authService } from '../services/auth.service'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authService.login(email, password)
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (params: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'admin' | 'agent'
  }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authService.signup(params)
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.logout()
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    login,
    signup,
    logout,
    loading,
    error
  }
} 