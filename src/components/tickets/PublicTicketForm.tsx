import React, { useState } from 'react'
import { ticketService } from '../../services/ticket.service'
import type { TicketCategory, TicketPriority } from '../../types'

export function PublicTicketForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    category: 'general_inquiry' as TicketCategory,
    priority: 'normal' as TicketPriority,
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await ticketService.createPublicTicket({
        email: formData.email,
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority
      })
      
      setSuccess(true)
      setFormData({
        email: '',
        subject: '',
        category: 'general_inquiry',
        priority: 'normal',
        description: ''
      })
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="mb-4 text-green-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Ticket Submitted Successfully</h3>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a confirmation email with your ticket details.<br />
            We'll notify you when we respond to your ticket.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 text-sm text-blue-600 hover:text-blue-500"
          >
            Submit another ticket
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Submit a Support Ticket</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
            className="w-full p-2 border border-gray-200 rounded-md"
          >
            <option value="account_access">Account Access</option>
            <option value="technical_issue">Technical Issue</option>
            <option value="billing">Billing</option>
            <option value="feature_request">Feature Request</option>
            <option value="general_inquiry">General Inquiry</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
            className="w-full p-2 border border-gray-200 rounded-md"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-200 rounded-md"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  )
} 