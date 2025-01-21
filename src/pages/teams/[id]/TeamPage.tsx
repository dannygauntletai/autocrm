import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTeam } from '../../../hooks/useTeam'
import { Button } from '../../../components/common/Button'
import { UserSelect } from '../../../components/teams/UserSelect'
import type { Profile } from '../../../types'

export default function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    team,
    loading,
    error,
    fetchTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMemberRole,
    removeMember
  } = useTeam(id)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [selectedRole, setSelectedRole] = useState<'leader' | 'member'>('member')

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  useEffect(() => {
    if (team) {
      setEditName(team.name)
      setEditDescription(team.description || '')
    }
  }, [team])

  const handleUpdateTeam = async () => {
    try {
      await updateTeam({
        name: editName,
        description: editDescription || null
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update team:', err)
    }
  }

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return
    }

    try {
      await deleteTeam()
      navigate('/teams')
    } catch (err) {
      console.error('Failed to delete team:', err)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUser) return

    try {
      await addMember(selectedUser.id, selectedRole)
      setShowAddMember(false)
      setSelectedUser(null)
      setSelectedRole('member')
    } catch (err) {
      console.error('Failed to add member:', err)
    }
  }

  if (loading && !team) {
    return <div className="p-4">Loading team...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading team: {error.message}
      </div>
    )
  }

  if (!team) {
    return <div className="p-4">Team not found</div>
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          {isEditing ? (
            <div className="space-y-4 flex-1 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateTeam}>Save Changes</Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{team.name}</h1>
              {team.description && (
                <p className="mt-2 text-gray-600">{team.description}</p>
              )}
            </div>
          )}
          
          {!isEditing && (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)}>Edit Team</Button>
              <Button variant="danger" onClick={handleDeleteTeam}>
                Delete Team
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Team Members</h2>
          <Button onClick={() => setShowAddMember(true)}>Add Member</Button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {team.members.map((member) => (
              <li key={member.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {member.profiles.avatar_url && (
                      <img
                        src={member.profiles.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {member.profiles.first_name} {member.profiles.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Role: {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => 
                        updateMemberRole(
                          member.user_id,
                          e.target.value as 'leader' | 'member'
                        )
                      }
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="member">Member</option>
                      <option value="leader">Leader</option>
                    </select>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeMember(member.user_id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
            
            <div className="space-y-4">
              <UserSelect
                value={selectedUser}
                onChange={setSelectedUser}
                excludeUserIds={team.members.map(m => m.user_id)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'leader' | 'member')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="member">Member</option>
                  <option value="leader">Leader</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddMember(false)
                    setSelectedUser(null)
                    setSelectedRole('member')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUser}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 