import { useEffect, useState } from 'react'
import { ticketService } from '../../services/ticket.service'
import { supabase } from '../../utils/supabase'
import type { CommentWithAuthor } from '../../types'

interface CommentListProps {
  ticketId: string
}

export function CommentList({ ticketId }: CommentListProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sortComments = (comments: CommentWithAuthor[]) => {
    return [...comments].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  }

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await ticketService.getTicketComments(ticketId)
        setComments(sortComments(data))
      } catch (err) {
        const error = err as Error
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()

    // Subscribe to new comments
    const subscription = supabase
      .channel(`comments:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Only listen for new comments
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${ticketId}`
        },
        () => {
          // Simply refetch comments when any change occurs
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [ticketId])

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  if (error) return (
    <div className="p-4 bg-red-50 text-red-600 rounded-md">
      Error: {error}
    </div>
  )

  if (comments.length === 0) return (
    <div className="text-center text-gray-500 p-8">
      No comments yet
    </div>
  )

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-4">
          <div className="flex-shrink-0">
            {comment.profiles ? (
              <img
                src={comment.profiles.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles.first_name}+${comment.profiles.last_name}`}
                alt={`${comment.profiles.first_name} ${comment.profiles.last_name}`}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=Customer`}
                alt="Customer"
                className="h-10 w-10 rounded-full"
              />
            )}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">
                  {comment.profiles ? (
                    `${comment.profiles.first_name} ${comment.profiles.last_name}`
                  ) : (
                    'Customer'
                  )}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              {comment.is_internal && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Internal Note
                </span>
              )}
            </div>
            <div className={`mt-1 p-3 rounded-lg ${
              comment.is_internal 
                ? 'bg-yellow-50 text-gray-800' 
                : 'bg-gray-50 text-gray-700'
            }`}>
              {comment.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 