import { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'

interface InviteAgentFormProps {
  onSuccess: () => void | Promise<void>
}

export function InviteAgentForm({ onSuccess }: InviteAgentFormProps) {
  const { inviteUser, loading, error } = useProfile()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'agent' | 'admin'>('agent')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await inviteUser(email, role)
      setSuccess(true)
      setEmail('')
      onSuccess()
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded">
          Invitation sent successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'agent' | 'admin')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {loading ? 'Sending...' : 'Send Invitation'}
      </button>
    </form>
  )
} 