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

interface IssueListProps {
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
  { value: 'low', label: 'Low', color: 'bg-accent-primary/20 text-accent-primary border-accent-primary/40' },
  { value: 'medium', label: 'Medium', color: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/40' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
];

const STATUSES = [
  { value: 'open', label: 'Open', icon: Circle, color: 'text-accent-primary' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-accent-secondary' },
  { value: 'waiting_response', label: 'Waiting Response', icon: AlertCircle, color: 'text-orange-400' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle2, color: 'text-green-400' },
  { value: 'closed', label: 'Closed', icon: CheckCircle2, color: 'text-text-secondary' },
];

const CATEGORIES = [
  { value: 'editing', label: 'Editing' },
  { value: 'vfx', label: 'VFX' },
  { value: 'color_grading', label: 'Color Grading' },
  { value: 'sound', label: 'Sound' },
  { value: 'music', label: 'Music' },
  { value: 'graphics', label: 'Graphics' },
];

export default function IssueList({ projectId }: IssueListProps) {
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
      console.error('Failed to load issues:', error);
      toast.error('Failed to load issues');
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
    toast.success('Issue created successfully');
  };

  const handleTicketUpdated = () => {
    setShowDetailsDialog(false);
    loadTickets();
    toast.success('Issue updated successfully');
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITIES.find((p) => p.value === priority)?.color || 'bg-accent-brown/20 text-text-secondary border-accent-brown/40';
  };

  const getStatusIcon = (status: string) => {
    const statusObj = STATUSES.find((s) => s.value === status);
    const Icon = statusObj?.icon || Circle;
    return <Icon className={`h-4 w-4 ${statusObj?.color || 'text-text-secondary'}`} />;
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
        <div className="text-text-secondary">Loading issues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent-secondary">Issues</h2>
          <p className="text-sm text-text-secondary">
            {filteredTickets.length} {filteredTickets.length === 1 ? 'issue' : 'issues'}
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-accent-primary hover:bg-accent-primary/80 text-accent-brown">
          <Plus className="h-4 w-4 mr-2" />
          New Issue
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary-bg border-accent-brown/30 text-text-primary placeholder-text-secondary/70"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-accent-brown/50 text-text-secondary hover:bg-accent-primary/20 hover:text-accent-primary"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="border-b border-accent-brown/20">
            <CardTitle className="text-accent-secondary">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-text-secondary">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value || undefined })
                  }
                >
                  <SelectTrigger className="bg-secondary-bg border-accent-brown/30 text-text-primary">
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
                <label className="text-sm font-medium mb-2 block text-text-secondary">Priority</label>
                <Select
                  value={filters.priority || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priority: value || undefined })
                  }
                >
                  <SelectTrigger className="bg-secondary-bg border-accent-brown/30 text-text-primary">
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
                <label className="text-sm font-medium mb-2 block text-text-secondary">Category</label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value || undefined })
                  }
                >
                  <SelectTrigger className="bg-secondary-bg border-accent-brown/30 text-text-primary">
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
                <label className="text-sm font-medium mb-2 block text-text-secondary">Type</label>
                <Select
                  value={filters.ticket_type || ''}
                  onValueChange={(value) =>
                    setFilters({ ...filters, ticket_type: value || undefined })
                  }
                >
                  <SelectTrigger className="bg-secondary-bg border-accent-brown/30 text-text-primary">
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
                className="border-accent-brown/50 text-text-secondary hover:bg-accent-primary/20 hover:text-accent-primary"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {filteredTickets.length === 0 ? (
        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-text-secondary">No issues found</p>
            <Button
              variant="link"
              onClick={() => setShowCreateDialog(true)}
              className="mt-2 text-accent-primary hover:text-accent-primary/80"
            >
              Create your first issue
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-lg transition-shadow bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm hover:border-accent-primary/50"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-xs font-mono text-text-secondary">
                        {ticket.ticket_number}
                      </span>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      {ticket.category && (
                        <Badge className="bg-accent-secondary/20 text-accent-secondary border-accent-secondary/40">{ticket.category}</Badge>
                      )}
                      {ticket.due_date && isOverdue(ticket.due_date) && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/40">Overdue</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-1 text-text-primary">{ticket.title}</h3>
                    {ticket.description && (
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      {ticket.creator && (
                        <span>Created by {ticket.creator.full_name || ticket.creator.username}</span>
                      )}
                      {ticket.assignee && (
                        <span>Assigned to {ticket.assignee.full_name || ticket.assignee.username}</span>
                      )}
                      <span>{formatDate(ticket.created_at)}</span>
                      {ticket.due_date && (
                        <span className={isOverdue(ticket.due_date) ? 'text-red-400' : ''}>
                          Due {formatDate(ticket.due_date)}
                        </span>
                      )}
                    </div>

                    {ticket.tags && ticket.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {ticket.tags.map((tag, idx) => (
                          <Badge key={idx} className="bg-accent-brown/20 text-accent-secondary border-accent-brown/40 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium mb-1 text-accent-secondary">
                      {STATUSES.find((s) => s.value === ticket.status)?.label}
                    </div>
                    {ticket.source_department && (
                      <div className="text-xs text-text-secondary">
                        From: {ticket.source_department}
                      </div>
                    )}
                    {ticket.target_department && (
                      <div className="text-xs text-text-secondary">
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
