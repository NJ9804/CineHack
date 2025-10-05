'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import type { Ticket } from '@/services/api/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface IssueWidgetProps {
  projectId: number;
  onCreateTicket?: () => void;
  onViewTickets?: () => void;
  compact?: boolean;
}

export default function IssueWidget({
  projectId,
  onCreateTicket,
  onViewTickets,
  compact = false,
}: IssueWidgetProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
    // Refresh every 30 seconds
    const interval = setInterval(loadTickets, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  const loadTickets = async () => {
    try {
      const data = await apiClient.getProjectTickets(projectId);
      setTickets(data);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress').length;
  const urgentTickets = tickets.filter((t) => t.priority === 'urgent').length;
  const overdueTickets = tickets.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'closed'
  ).length;

  if (loading) {
    return (
      <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-sm text-text-secondary">Loading issues...</div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-secondary-bg/95 rounded-lg border border-accent-brown/40 shadow-lg backdrop-blur-sm">
        <AlertTriangle className="h-8 w-8 text-accent-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium text-accent-secondary">Issues</div>
          <div className="flex gap-2 mt-1">
            <Badge className="bg-accent-primary/20 text-accent-primary border-accent-primary/40 text-xs">
              {openTickets} open
            </Badge>
            {urgentTickets > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs">
                {urgentTickets} urgent
              </Badge>
            )}
            {overdueTickets > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 text-xs">
                {overdueTickets} overdue
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onCreateTicket && (
            <Button size="sm" variant="outline" onClick={onCreateTicket} className="border-accent-brown/50 text-text-secondary hover:bg-accent-primary/20">
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {onViewTickets && (
            <Button size="sm" onClick={onViewTickets} className="bg-accent-primary hover:bg-accent-primary/80 text-accent-brown">
              View All
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-accent-brown/20">
        <CardTitle className="text-lg font-semibold text-accent-secondary">Issues</CardTitle>
        {onCreateTicket && (
          <Button size="sm" onClick={onCreateTicket} className="bg-accent-primary hover:bg-accent-primary/80 text-accent-brown">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-primary/20 rounded-lg border border-accent-primary/40">
              <AlertTriangle className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{openTickets}</div>
              <div className="text-xs text-text-secondary">Open</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-secondary/20 rounded-lg border border-accent-secondary/40">
              <Clock className="h-5 w-5 text-accent-secondary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{inProgressTickets}</div>
              <div className="text-xs text-text-secondary">In Progress</div>
            </div>
          </div>

          {urgentTickets > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/40">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{urgentTickets}</div>
                <div className="text-xs text-text-secondary">Urgent</div>
              </div>
            </div>
          )}

          {overdueTickets > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/40">
                <AlertCircle className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">{overdueTickets}</div>
                <div className="text-xs text-text-secondary">Overdue</div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Issues */}
        {tickets.slice(0, 3).length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-accent-secondary">Recent</div>
            {tickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between text-sm p-2 hover:bg-primary-bg/50 rounded cursor-pointer border border-accent-brown/20"
                onClick={() => onViewTickets?.()}
              >
                <div className="flex-1 truncate">
                  <span className="font-medium text-text-primary">{ticket.ticket_number}</span>
                  <span className="text-text-secondary ml-2 truncate">{ticket.title}</span>
                </div>
                <Badge
                  className={
                    ticket.priority === 'urgent'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : ticket.priority === 'high'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : 'bg-accent-primary/20 text-accent-primary border-accent-primary/40'
                  }
                >
                  {ticket.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {onViewTickets && (
          <Button
            variant="outline"
            className="w-full mt-4 border-accent-brown/50 text-text-secondary hover:bg-accent-primary/20 hover:text-accent-primary"
            onClick={onViewTickets}
          >
            View All Issues
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
