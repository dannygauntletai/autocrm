import { supabase } from '../utils/supabase'

interface InviteAcceptanceData {
  firstName: string
  lastName: string
  password: string
}

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signup(params: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'admin' | 'agent'
  }) {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          first_name: params.firstName,
          last_name: params.lastName,
          role: params.role
        }
      }
    })
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async verifyInvite(token_hash: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'invite',
    })
    if (error) throw error
    return data
  },

  async acceptInvite(data: InviteAcceptanceData) {
    // Get the current session which should be set after the callback
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    if (sessionError) throw sessionError
    if (!user) throw new Error('No authenticated user found')

    // Update the user's password and metadata
    const { data: authData, error: updateError } = await supabase.auth.updateUser({
      password: data.password,
      data: {
        first_name: data.firstName,
        last_name: data.lastName
      }
    })
    if (updateError) throw updateError

    // Create or update their profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: authData.user.email,
        role: user.user_metadata?.role || 'agent'
      })

    if (profileError) throw profileError

    return authData
  }
} 