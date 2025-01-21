import { supabase } from '../utils/supabase'
import type { Team, TeamMember, TeamWithMembers, Profile } from '../types'

export const teamService = {
  // Team operations
  async createTeam(name: string, description?: string, settings: object = {}) {
    const { data, error } = await supabase
      .from('teams')
      .insert({ name, description, settings })
      .select()
      .single()

    if (error) throw error
    return data as Team
  },

  async getTeam(teamId: string): Promise<TeamWithMembers> {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members(
          *,
          profiles(
            first_name,
            last_name,
            avatar_url,
            role
          )
        )
      `)
      .eq('id', teamId)
      .single()

    if (error) throw error
    return data as TeamWithMembers
  },

  async updateTeam(teamId: string, updates: Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw error
    return data as Team
  },

  async deleteTeam(teamId: string) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    if (error) throw error
  },

  async listTeams(page = 1, limit = 10) {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('teams')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (error) throw error
    return { data: data as Team[], count }
  },

  // Team member operations
  async addTeamMember(teamId: string, userId: string, role: 'leader' | 'member' = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, user_id: userId, role })
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async updateTeamMemberRole(teamId: string, userId: string, role: 'leader' | 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as TeamMember
  },

  async removeTeamMember(teamId: string, userId: string) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
  },

  async listTeamMembers(teamId: string) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        profiles(
          first_name,
          last_name,
          avatar_url,
          role
        )
      `)
      .eq('team_id', teamId)

    if (error) throw error
    return data as (TeamMember & {
      profiles: {
        first_name: string | null
        last_name: string | null
        avatar_url: string | null
        role: string
      }
    })[]
  },

  async getAvailableUsers(teamId: string): Promise<Profile[]> {
    // Get all users who are not members of the specified team
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', 
        supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', teamId)
      )
      .order('first_name', { ascending: true })

    if (error) throw error
    return data
  }
} 