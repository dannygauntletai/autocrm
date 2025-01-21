import { PublicTicketForm } from '../../components/tickets/PublicTicketForm'

export function SubmitTicketPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit a Support Ticket</h1>
          <p className="mt-2 text-sm text-gray-600">
            Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        
        <PublicTicketForm />
      </div>
    </div>
  )
} 