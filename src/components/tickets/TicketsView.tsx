import { Search, Clock, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { Ticket } from "../../types";
import { CommentList } from './CommentList'
import { TicketAssigneeSelect } from './TicketAssigneeSelect'
import { TicketPrioritySelect } from './TicketPrioritySelect'
import { TeamAssignSelect } from './TeamAssignSelect'
import { TicketStatusSelect } from './TicketStatusSelect'
import { ticketService } from "../../services/ticket.service";

const statusConfig = {
  new: { label: 'New', color: 'bg-purple-100 text-purple-800' },
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-800' },
  pending: { label: 'Pending', color: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
} as const

const priorityConfig = {
  urgent: { color: 'bg-red-100 text-red-800' },
  high: { color: 'bg-orange-100 text-orange-800' },
  normal: { color: 'bg-blue-100 text-blue-800' },
  low: { color: 'bg-gray-100 text-gray-800' }
} as const

// Add a helper function to get status config with fallback
const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
}

const getPriorityConfig = (priority: string) => {
  return priorityConfig[priority as keyof typeof priorityConfig] || { color: 'bg-gray-100 text-gray-800' };
}

interface DashboardContext {
  tickets: Ticket[];
  fetchTickets: () => Promise<void>;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
}

export function TicketsView() {
  const { tickets, fetchTickets, selectedTicketId, setSelectedTicketId } = useOutletContext<DashboardContext>();
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out closed tickets and apply search filter
  const filteredTickets = tickets.filter(ticket => {
    if (ticket.status === 'closed') return false;
    
    const searchLower = searchQuery.toLowerCase();
    
    return (
      ticket.subject.toLowerCase().includes(searchLower) ||
      ticket.description.toLowerCase().includes(searchLower) ||
      ticket.requester_email.toLowerCase().includes(searchLower) ||
      (ticket.assignee?.email?.toLowerCase().includes(searchLower) ?? false) ||
      ticket.status.toLowerCase().includes(searchLower) ||
      ticket.priority.toLowerCase().includes(searchLower) ||
      ticket.category.toLowerCase().includes(searchLower)
    );
  });

  const selectedTicket = selectedTicketId ? tickets.find(t => t.id === selectedTicketId) : null;

  // Clear selected ticket if it's closed
  useEffect(() => {
    if (selectedTicket?.status === 'closed') {
      setSelectedTicketId(null);
    }
  }, [selectedTicket, setSelectedTicketId]);

  const handleTicketUpdate = async (updatedTicket: Ticket) => {
    try {
      await ticketService.updateTicket(updatedTicket.id, updatedTicket);
      await fetchTickets();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  }

  const handleSendReply = async () => {
    if (!selectedTicketId || !newMessage.trim()) return;

    try {
      await ticketService.addComment(selectedTicketId, newMessage, isInternal);
      setNewMessage('');
      setIsInternal(false);
      await fetchTickets();
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tickets by subject, description, requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicketId(ticket.id)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedTicketId === ticket.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig(ticket.status).color}`}>
                  {getStatusConfig(ticket.status).label}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityConfig(ticket.priority).color}`}>
                  {ticket.priority}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {ticket.subject}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                {ticket.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(ticket.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-3 w-3" />
                  <span>{ticket.category}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div>
                  From: {ticket.requester_email}
                </div>
                {ticket.assignee && (
                  <div>
                    To: {ticket.assignee.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {selectedTicket ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedTicket.subject}</h2>
            <div className="text-sm text-gray-500 mb-4">
              Created by {selectedTicket.requester_email} on {formatDate(selectedTicket.created_at)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <TicketStatusSelect ticket={selectedTicket} onUpdate={handleTicketUpdate} />
                <TicketPrioritySelect ticket={selectedTicket} onUpdate={handleTicketUpdate} />
              </div>
              <div className="flex items-center space-x-4">
                <TeamAssignSelect ticket={selectedTicket} onUpdate={handleTicketUpdate} />
                <TicketAssigneeSelect ticket={selectedTicket} onUpdate={handleTicketUpdate} />
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">
                  Created by {selectedTicket.requester_email} on {formatDate(selectedTicket.created_at)}
                </div>
                <div className="text-sm text-gray-500">
                  Category: {selectedTicket.category}
                </div>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
            </div>
            
            <CommentList ticketId={selectedTicket.id} />
            
            <div className="mt-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Internal note</span>
                </label>
                <button
                  onClick={handleSendReply}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a ticket to view details
        </div>
      )}
    </div>
  );
}
