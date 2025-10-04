'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import type { Ticket } from '@/services/api/tickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ticket as TicketIcon,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface TicketWidgetProps {
  projectId: number;
  onCreateTicket?: () => void;
  onViewTickets?: () => void;
  compact?: boolean;
}

export default function TicketWidget({
  projectId,
  onCreateTicket,
  onViewTickets,
  compact = false,
}: TicketWidgetProps) {
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
      console.error('Failed to load tickets:', error);
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
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-500">Loading tickets...</div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
        <TicketIcon className="h-8 w-8 text-blue-500" />
        <div className="flex-1">
          <div className="text-sm font-medium">Tickets</div>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {openTickets} open
            </Badge>
            {urgentTickets > 0 && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                {urgentTickets} urgent
              </Badge>
            )}
            {overdueTickets > 0 && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                {overdueTickets} overdue
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onCreateTicket && (
            <Button size="sm" variant="outline" onClick={onCreateTicket}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {onViewTickets && (
            <Button size="sm" onClick={onViewTickets}>
              View All
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Tickets</CardTitle>
        {onCreateTicket && (
          <Button size="sm" onClick={onCreateTicket}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TicketIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{openTickets}</div>
              <div className="text-xs text-gray-600">Open</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{inProgressTickets}</div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
          </div>

          {urgentTickets > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{urgentTickets}</div>
                <div className="text-xs text-gray-600">Urgent</div>
              </div>
            </div>
          )}

          {overdueTickets > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overdueTickets}</div>
                <div className="text-xs text-gray-600">Overdue</div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        {tickets.slice(0, 3).length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-gray-700">Recent</div>
            {tickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => onViewTickets?.()}
              >
                <div className="flex-1 truncate">
                  <span className="font-medium">{ticket.ticket_number}</span>
                  <span className="text-gray-600 ml-2 truncate">{ticket.title}</span>
                </div>
                <Badge
                  className={
                    ticket.priority === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : ticket.priority === 'high'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
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
            className="w-full mt-4"
            onClick={onViewTickets}
          >
            View All Tickets
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
