import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Ticket {
  id: number;
  project_id: number;
  task_id?: number;
  stage_id?: number;
  ticket_number: string;
  title: string;
  description?: string;
  ticket_type: 'file_request' | 'feedback' | 'issue' | 'question' | 'asset_delivery';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  created_by: number;
  assigned_to?: number;
  watchers?: number[];
  source_department?: string;
  target_department?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  related_files?: Array<{ name: string; url: string; type: string }>;
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  response_time?: number;
  resolution_time?: number;
  tags?: string[];
  ticket_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    username: string;
    full_name?: string;
    email: string;
  };
  assignee?: {
    id: number;
    username: string;
    full_name?: string;
    email: string;
  };
  comments?: TicketComment[];
  reminders?: TicketReminder[];
  activities?: TicketActivity[];
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  comment_type: 'comment' | 'status_change' | 'internal_note';
  attachments?: Array<{ name: string; url: string; type: string }>;
  mentions?: number[];
  is_internal: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    full_name?: string;
    email: string;
  };
}

export interface TicketReminder {
  id: number;
  ticket_id: number;
  user_id: number;
  reminder_type: 'due_date' | 'follow_up' | 'custom';
  reminder_time: string;
  message?: string;
  is_recurring: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'custom';
  recurrence_end?: string;
  is_sent: boolean;
  sent_at?: string;
  is_active: boolean;
  notify_email: boolean;
  notify_in_app: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketActivity {
  id: number;
  ticket_id: number;
  user_id: number;
  activity_type: 'created' | 'updated' | 'assigned' | 'status_changed' | 'commented' | 'closed';
  description: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  activity_metadata?: Record<string, any>;
  created_at: string;
  user?: {
    id: number;
    username: string;
    full_name?: string;
    email: string;
  };
}

export interface CreateTicketData {
  project_id: number;
  task_id?: number;
  stage_id?: number;
  title: string;
  description?: string;
  ticket_type: string;
  priority?: string;
  category?: string;
  assigned_to?: number;
  watchers?: number[];
  source_department?: string;
  target_department?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  related_files?: Array<{ name: string; url: string; type: string }>;
  due_date?: string;
  tags?: string[];
  ticket_metadata?: Record<string, any>;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  ticket_type?: string;
  priority?: string;
  category?: string;
  status?: string;
  assigned_to?: number;
  watchers?: number[];
  source_department?: string;
  target_department?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  related_files?: Array<{ name: string; url: string; type: string }>;
  due_date?: string;
  tags?: string[];
  ticket_metadata?: Record<string, any>;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  ticket_type?: string;
  assigned_to?: number;
  created_by?: number;
  department?: string;
  search?: string;
}

export interface CreateCommentData {
  content: string;
  comment_type?: string;
  attachments?: Array<{ name: string; url: string; type: string }>;
  mentions?: number[];
  is_internal?: boolean;
}

export interface CreateReminderData {
  reminder_type: string;
  reminder_time: string;
  message?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_end?: string;
  notify_email?: boolean;
  notify_in_app?: boolean;
}

export interface TicketAnalytics {
  total_tickets: number;
  status_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  department_breakdown: Record<string, number>;
  avg_response_time_hours: number;
  avg_resolution_time_hours: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
}

class TicketService {
  private getAuthHeader() {
    if (typeof window === 'undefined') {
      return {};
    }
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Ticket CRUD operations
  async createTicket(projectId: number, data: CreateTicketData): Promise<Ticket> {
    const response = await axios.post(
      `${API_URL}/api/projects/${projectId}/tickets`,
      data,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getProjectTickets(projectId: number, filters?: TicketFilters): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const response = await axios.get(
      `${API_URL}/api/projects/${projectId}/tickets?${params.toString()}`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getTicket(ticketId: number): Promise<Ticket> {
    const response = await axios.get(
      `${API_URL}/api/tickets/${ticketId}`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async updateTicket(ticketId: number, data: UpdateTicketData): Promise<Ticket> {
    const response = await axios.put(
      `${API_URL}/api/tickets/${ticketId}`,
      data,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteTicket(ticketId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/api/tickets/${ticketId}`,
      { headers: this.getAuthHeader() }
    );
  }

  // Comments
  async addComment(ticketId: number, data: CreateCommentData): Promise<TicketComment> {
    const response = await axios.post(
      `${API_URL}/api/tickets/${ticketId}/comments`,
      data,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getComments(ticketId: number): Promise<TicketComment[]> {
    const response = await axios.get(
      `${API_URL}/api/tickets/${ticketId}/comments`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async updateComment(commentId: number, content: string): Promise<TicketComment> {
    const response = await axios.put(
      `${API_URL}/api/tickets/comments/${commentId}`,
      { content },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async deleteComment(commentId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/api/tickets/comments/${commentId}`,
      { headers: this.getAuthHeader() }
    );
  }

  // Reminders
  async createReminder(ticketId: number, data: CreateReminderData): Promise<TicketReminder> {
    const response = await axios.post(
      `${API_URL}/api/tickets/${ticketId}/reminders`,
      data,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getReminders(ticketId: number): Promise<TicketReminder[]> {
    const response = await axios.get(
      `${API_URL}/api/tickets/${ticketId}/reminders`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getPendingReminders(): Promise<TicketReminder[]> {
    const response = await axios.get(
      `${API_URL}/api/reminders/pending`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async markReminderSent(reminderId: number): Promise<void> {
    await axios.put(
      `${API_URL}/api/reminders/${reminderId}/mark-sent`,
      {},
      { headers: this.getAuthHeader() }
    );
  }

  async deleteReminder(reminderId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/api/reminders/${reminderId}`,
      { headers: this.getAuthHeader() }
    );
  }

  // Analytics
  async getAnalytics(projectId: number): Promise<TicketAnalytics> {
    const response = await axios.get(
      `${API_URL}/api/projects/${projectId}/tickets/analytics`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  // Bulk operations
  async bulkUpdate(ticketIds: number[], updates: UpdateTicketData): Promise<void> {
    await axios.post(
      `${API_URL}/api/tickets/bulk-update`,
      { ticket_ids: ticketIds, ...updates },
      { headers: this.getAuthHeader() }
    );
  }
}

export const ticketService = new TicketService();
