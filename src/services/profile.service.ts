import { supabase, supabaseAdmin } from '../utils/supabase'
import type { Profile } from '../types'

async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No user found')
      return false
    }

    console.log('Checking admin status for user:', user.id)
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return !!data
  } catch (err) {
    console.error('Error in isAdmin check:', err)
    return false
  }
}

async function listPendingInvites(): Promise<{
  email: string
  invited_at: string
  id: string
}[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) throw error
  
  // Filter for users who haven't accepted their invite
  return data.users
    .filter(user => !user.email_confirmed_at)
    .map(user => ({
      email: user.email!,
      invited_at: user.created_at,
      id: user.id
    }))
}

export const profileService = {
  // Public methods
  async getCurrentProfile(): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Admin only methods
  async listUsers(): Promise<Profile[]> {
    const isUserAdmin = await isAdmin()
    if (!isUserAdmin) {
      console.error('User is not admin')
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, avatar_url')
      .order('first_name', { ascending: true })

    if (error) {
      console.error('Error listing users:', error)
      throw error
    }
    return data
  },

  async getUser(userId: string): Promise<Profile> {
    if (!await isAdmin()) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role, avatar_url')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  async updateUser(userId: string, updates: Partial<Profile>) {
    if (!await isAdmin()) throw new Error('Unauthorized')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUser(userId: string) {
    if (!await isAdmin()) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
  },

  async inviteUser(email: string, role: 'agent' | 'admin') {
    if (!await isAdmin()) throw new Error('Unauthorized')

    const siteUrl = import.meta.env.VITE_SITE_URL
    if (!siteUrl) throw new Error('VITE_SITE_URL environment variable is not set')

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: `${siteUrl}/accept-invite`
    })

    if (error) throw error
    return data
  },

  async listAllMembers(): Promise<(Profile & { status: 'active' | 'pending', invited_at?: string })[]> {
    if (!await isAdmin()) throw new Error('Unauthorized')

    // Get active users
    const { data: activeUsers, error: activeError } = await supabase
      .from('profiles')
      .select('*')
      .order('first_name', { ascending: true })
    if (activeError) throw activeError

    // Get pending invites
    const pendingUsers = await listPendingInvites()

    return [
      ...activeUsers.map(user => ({ ...user, status: 'active' as const })),
      ...pendingUsers.map(user => ({
        id: user.id,
        email: user.email,
        first_name: null,
        last_name: null,
        avatar_url: null,
        role: 'agent' as const,
        status: 'pending' as const,
        invited_at: user.invited_at
      }))
    ]
  },

  async deleteMember(userId: string) {
    if (!await isAdmin()) throw new Error('Unauthorized')

    // Delete from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    // Delete from profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    if (profileError) throw profileError
  }
} 