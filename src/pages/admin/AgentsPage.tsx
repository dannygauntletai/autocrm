import { useState, useEffect } from 'react'
import { profileService } from '../../services/profile.service'
import { formatDate } from '../../utils/date'
import { InviteAgentForm } from '../../components/auth/InviteAgentForm'

export function AgentsPage() {
  const [members, setMembers] = useState<Awaited<ReturnType<typeof profileService.listAllMembers>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    try {
      const data = await profileService.listAllMembers()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      await profileService.deleteMember(userId)
      await loadMembers() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Team Members</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all team members including pending invites.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <InviteAgentForm onSuccess={loadMembers} />
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                      {member.status === 'pending' ? (
                        <span className="text-gray-500">Pending...</span>
                      ) : (
                        <span>{member.first_name} {member.last_name}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {member.status === 'pending' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Invited {member.invited_at && formatDate(new Date(member.invited_at))}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {member.role}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 