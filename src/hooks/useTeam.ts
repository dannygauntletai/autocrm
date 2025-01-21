import { useState, useCallback } from 'react'
import { teamService } from '../services/team.service'
import type { Team, TeamWithMembers } from '../types'

export function useTeam(teamId?: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [team, setTeam] = useState<TeamWithMembers | null>(null)

  const fetchTeam = useCallback(async () => {
    if (!teamId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await teamService.getTeam(teamId)
      setTeam(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [teamId])

  const createTeam = async (name: string, description?: string, settings: object = {}) => {
    try {
      setLoading(true)
      setError(null)
      const data = await teamService.createTeam(name, description, settings)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTeam = async (updates: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!teamId) return

    try {
      setLoading(true)
      setError(null)
      const data = await teamService.updateTeam(teamId, updates)
      setTeam(prev => prev ? { ...prev, ...data } : null)
      return data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteTeam = async () => {
    if (!teamId) return

    try {
      setLoading(true)
      setError(null)
      await teamService.deleteTeam(teamId)
      setTeam(null)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (userId: string, role: 'leader' | 'member' = 'member') => {
    if (!teamId) return

    try {
      setLoading(true)
      setError(null)
      await teamService.addTeamMember(teamId, userId, role)
      const updatedTeam = await teamService.getTeam(teamId)
      setTeam(updatedTeam)
      return updatedTeam.members.find(m => m.user_id === userId)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateMemberRole = async (userId: string, role: 'leader' | 'member') => {
    if (!teamId) return

    try {
      setLoading(true)
      setError(null)
      await teamService.updateTeamMemberRole(teamId, userId, role)
      const updatedTeam = await teamService.getTeam(teamId)
      setTeam(updatedTeam)
      return updatedTeam.members.find(m => m.user_id === userId)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (userId: string) => {
    if (!teamId) return

    try {
      setLoading(true)
      setError(null)
      await teamService.removeTeamMember(teamId, userId)
      setTeam(prev => {
        if (!prev) return null
        return {
          ...prev,
          members: prev.members.filter(member => member.user_id !== userId)
        }
      })
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    team,
    loading,
    error,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMemberRole,
    removeMember
  }
} 