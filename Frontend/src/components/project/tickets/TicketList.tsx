'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import type { Ticket, TicketFilters } from '@/services/api/tickets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToastNotification } from '@/providers/ToastProvider';
import { Plus, Filter, Search, Clock, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import TicketDialog from './TicketDialog';
import TicketDetailsDialog from './TicketDetailsDialog';

interface TicketListProps {
  projectId: number;
}

const TICKET_TYPES = [
  { value: 'file_request', label: 'File Request' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'issue', label: 'Issue' },
  { value: 'question', label: 'Question' },
  { value: 'asset_delivery', label: 'Asset Delivery' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const STATUSES = [
  { value: 'open', label: 'Open', icon: Circle, color: 'text-blue-500' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
  { value: 'waiting_response', label: 'Waiting Response', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'closed', label: 'Closed', icon: CheckCircle2, color: 'text-gray-500' },
];

const CATEGORIES = [
  { value: 'editing', label: 'Editing' },
  { value: 'vfx', label: 'VFX' },
  { value: 'color_grading', label: 'Color Grading' },
  { value: 'sound', label: 'Sound' },
  { value: 'music', label: 'Music' },
  { value: 'graphics', label: 'Graphics' },
];

export default function TicketList({ projectId }: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const toast = useToastNotification();

  // Filters
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [projectId]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchQuery]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProjectTickets(projectId);
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    // Apply ticket type filter
    if (filters.ticket_type) {
      filtered = filtered.filter((t) => t.ticket_type === filters.ticket_type);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.ticket_number.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(filtered);
  };

  const handleTicketClick = async (ticket: Ticket) => {
    try {
      const fullTicket = await apiClient.getTicket(ticket.id);
      setSelectedTicket(fullTicket);
      setShowDetailsDialog(true);
    } catch (error) {
      console.error('Failed to load ticket details:', error);
      toast.error('Failed to load ticket details');
    }
  };

  const handleTicketCreated = () => {
    setShowCreateDialog(false);
    loadTickets();
    toast.success('Ticket created successfully');
  };

  const handleTicketUpdated = () => {
    setShowDetailsDialog(false);
    loadTickets();
    toast.success('Ticket updated successfully');
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITIES.find((p) => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusObj = STATUSES.find((s) => s.value === status);
    const Icon = statusObj?.icon || Circle;
    return <Icon className={`h-4 w-4 ${statusObj?.color || 'text-gray-500'}`} />;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tickets</h2>
          <p className="text-sm text-gray-500">
            {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select
                  value={filters.priority || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priority: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={filters.ticket_type || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, ticket_type: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {TICKET_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No tickets found</p>
            <Button
              variant="link"
              onClick={() => setShowCreateDialog(true)}
              className="mt-2"
            >
              Create your first ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-xs font-mono text-gray-500">
                        {ticket.ticket_number}
                      </span>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      {ticket.category && (
                        <Badge variant="outline">{ticket.category}</Badge>
                      )}
                      {ticket.due_date && isOverdue(ticket.due_date) && (
                        <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                    {ticket.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {ticket.creator && (
                        <span>Created by {ticket.creator.full_name || ticket.creator.username}</span>
                      )}
                      {ticket.assignee && (
                        <span>Assigned to {ticket.assignee.full_name || ticket.assignee.username}</span>
                      )}
                      <span>{formatDate(ticket.created_at)}</span>
                      {ticket.due_date && (
                        <span className={isOverdue(ticket.due_date) ? 'text-red-500' : ''}>
                          Due {formatDate(ticket.due_date)}
                        </span>
                      )}
                    </div>

                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {ticket.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">
                      {STATUSES.find((s) => s.value === ticket.status)?.label}
                    </div>
                    {ticket.source_department && (
                      <div className="text-xs text-gray-500">
                        From: {ticket.source_department}
                      </div>
                    )}
                    {ticket.target_department && (
                      <div className="text-xs text-gray-500">
                        To: {ticket.target_department}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {showCreateDialog && (
        <TicketDialog
          projectId={projectId}
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleTicketCreated}
        />
      )}

      {showDetailsDialog && selectedTicket && (
        <TicketDetailsDialog
          ticket={selectedTicket}
          open={showDetailsDialog}
          onClose={() => setShowDetailsDialog(false)}
          onUpdate={handleTicketUpdated}
        />
      )}
    </div>
  );
}
