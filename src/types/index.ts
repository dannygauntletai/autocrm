export type TeamMemberRole = 'leader' | 'member';

export type TicketStatus = 'new' | 'open' | 'pending' | 'solved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory = 'account_access' | 'technical_issue' | 'billing' | 'feature_request' | 'general_inquiry';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  joined_at: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requester_id: string;
  assignee_id: string | null;
  team_id: string | null;
  created_at: string;
  updated_at: string;
} 