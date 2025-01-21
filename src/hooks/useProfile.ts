import { useState, useCallback } from 'react'
import { profileService } from '../services/profile.service'
import type { Profile } from '../types'

export function useProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getCurrentProfile()
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.updateProfile(updates)
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Admin only functions
  const listUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.listUsers()
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getUser = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getUser(userId)
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (userId: string, updates: Partial<Profile>) => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.updateUser(userId, updates)
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    try {
      await profileService.deleteUser(userId)
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const inviteUser = useCallback(async (email: string, role: 'agent' | 'admin') => {
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.inviteUser(email, role)
      return data
    } catch (err) {
      const error = err as Error
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getCurrentProfile,
    updateProfile,
    listUsers,
    getUser,
    updateUser,
    deleteUser,
    inviteUser,
    loading,
    error
  }
} 