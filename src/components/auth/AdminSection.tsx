import { useState, useEffect } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { InviteAgentForm } from './InviteAgentForm'
import type { Profile } from '../../types'

export function AdminSection() {
  const { getCurrentProfile, listUsers, loading, error } = useProfile()
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const profile = await getCurrentProfile()
        setIsAdmin(profile.role === 'admin')
        if (profile.role === 'admin') {
          const userList = await listUsers()
          setUsers(userList)
        }
      } catch (err) {
        console.error('Failed to check admin status:', err)
      }
    }
    checkAdmin()
  }, [getCurrentProfile, listUsers])

  if (!isAdmin) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Team Management</h2>
        <p className="text-sm text-gray-500">Invite and manage team members</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-md font-medium mb-4">Invite New Agent</h3>
        <InviteAgentForm onSuccess={() => {}} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-md font-medium mb-4">Team Members</h3>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map(user => (
              <li key={user.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}`}
                      alt=""
                      className="h-8 w-8 rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.role}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 