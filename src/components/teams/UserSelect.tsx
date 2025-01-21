import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import type { Profile } from '../../types'

interface UserSelectProps {
  value: Profile | null
  onChange: (user: Profile | null) => void
  excludeUserIds?: string[]
}

export function UserSelect({ value, onChange, excludeUserIds = [] }: UserSelectProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('profiles')
          .select('*')
          .in('role', ['admin', 'agent'])
          .not('id', 'in', excludeUserIds)
          .order('first_name', { ascending: true })

        if (search) {
          query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
          )
        }

        const { data, error: err } = await query

        if (err) throw err
        setUsers(data as Profile[])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [search, excludeUserIds])

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Select User
      </label>
      <div className="mt-1 relative">
        <input
          type="text"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && (
          <div className="absolute right-2 top-2.5">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          Error loading users: {error.message}
        </p>
      )}

      <ul className="mt-2 max-h-60 overflow-auto border rounded-md divide-y">
        {users.map((user) => (
          <li
            key={user.id}
            className={`p-2 cursor-pointer hover:bg-gray-50 ${
              value?.id === user.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onChange(user)}
          >
            <div className="flex items-center">
              {user.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-sm text-gray-500">
                  Role: {user.role}
                </p>
              </div>
            </div>
          </li>
        ))}
        {!loading && !users.length && (
          <li className="p-2 text-sm text-gray-500 text-center">
            No users found
          </li>
        )}
      </ul>
    </div>
  )
} 