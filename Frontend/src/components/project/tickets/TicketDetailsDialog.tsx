'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import type {
  Ticket,
  UpdateTicketData,
  CreateCommentData,
  CreateReminderData,
} from '@/services/api/tickets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  MessageSquare,
  Bell,
  Activity,
  Calendar,
  User,
  Edit,
  Save,
  X,
} from 'lucide-react';

interface TicketDetailsDialogProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_response', label: 'Waiting Response' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function TicketDetailsDialog({
  ticket: initialTicket,
  open,
  onClose,
  onUpdate,
}: TicketDetailsDialogProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateTicketData>({});

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Reminder state
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderData, setReminderData] = useState<CreateReminderData>({
    reminder_type: 'follow_up',
    reminder_time: '',
    message: '',
    notify_in_app: true,
  });

  useEffect(() => {
    if (open) {
      loadTicketDetails();
    }
  }, [open]);

  const loadTicketDetails = async () => {
    try {
      const data = await apiClient.getTicket(initialTicket.id);
      setTicket(data);
    } catch (error) {
      console.error('Failed to load ticket details:', error);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      setLoading(true);
      await apiClient.updateTicket(ticket.id, updateData);
      setEditing(false);
      setUpdateData({});
      onUpdate();
      await loadTicketDetails();
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      setLoading(true);
      await apiClient.updateTicket(ticket.id, { status });
      onUpdate();
      await loadTicketDetails();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await apiClient.addTicketComment(ticket.id, { content: newComment });
      setNewComment('');
      await loadTicketDetails();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderData.reminder_time) return;

    try {
      setLoading(true);
      await apiClient.createTicketReminder(ticket.id, reminderData);
      setShowReminderForm(false);
      setReminderData({
        reminder_type: 'follow_up',
        reminder_time: '',
        message: '',
        notify_in_app: true,
      });
      await loadTicketDetails();
    } catch (error) {
      console.error('Failed to add reminder:', error);
      alert('Failed to add reminder');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${hours.toFixed(1)} hours`;
    return `${(hours / 24).toFixed(1)} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>{ticket.ticket_number}</DialogTitle>
              <Badge>{ticket.priority}</Badge>
              {ticket.category && <Badge variant="outline">{ticket.category}</Badge>}
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdateTicket} disabled={loading}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title and Description */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={updateData.title ?? ticket.title}
                  onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={updateData.description ?? ticket.description ?? ''}
                  onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={updateData.priority ?? ticket.priority}
                    onValueChange={(value) => setUpdateData({ ...updateData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="datetime-local"
                    value={updateData.due_date ?? ticket.due_date?.slice(0, 16) ?? ''}
                    onChange={(e) => setUpdateData({ ...updateData, due_date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold mb-2">{ticket.title}</h3>
                {ticket.description && (
                  <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Created by:</span>
                  <span className="font-medium">
                    {ticket.creator?.full_name || ticket.creator?.username}
                  </span>
                </div>
                {ticket.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium">
                      {ticket.assignee.full_name || ticket.assignee.username}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate(ticket.created_at)}</span>
                </div>
                {ticket.due_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Due:</span>
                    <span>{formatDate(ticket.due_date)}</span>
                  </div>
                )}
                {ticket.source_department && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">{ticket.source_department}</span>
                  </div>
                )}
                {ticket.target_department && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{ticket.target_department}</span>
                  </div>
                )}
              </div>

              {/* Metrics */}
              {(ticket.response_time || ticket.resolution_time) && (
                <div className="flex gap-4 text-sm">
                  {ticket.response_time && (
                    <div>
                      <span className="text-gray-600">Response time:</span>{' '}
                      <span className="font-medium">{formatDuration(ticket.response_time)}</span>
                    </div>
                  )}
                  {ticket.resolution_time && (
                    <div>
                      <span className="text-gray-600">Resolution time:</span>{' '}
                      <span className="font-medium">{formatDuration(ticket.resolution_time)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Tabs */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({ticket.comments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="reminders">
                <Bell className="h-4 w-4 mr-2" />
                Reminders ({ticket.reminders?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                Activity ({ticket.activities?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              <form onSubmit={handleAddComment} className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button type="submit" disabled={commentLoading || !newComment.trim()}>
                  {commentLoading ? 'Adding...' : 'Add Comment'}
                </Button>
              </form>

              <div className="space-y-3">
                {ticket.comments?.map((comment) => (
                  <Card key={comment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {comment.user?.full_name || comment.user?.username}
                          </span>
                          {comment.is_internal && (
                            <Badge variant="secondary" className="text-xs">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                          {comment.is_edited && ' (edited)'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reminders Tab */}
            <TabsContent value="reminders" className="space-y-4">
              {!showReminderForm ? (
                <Button onClick={() => setShowReminderForm(true)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>New Reminder</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddReminder} className="space-y-3">
                      <div>
                        <Label>Reminder Time</Label>
                        <Input
                          type="datetime-local"
                          value={reminderData.reminder_time}
                          onChange={(e) =>
                            setReminderData({ ...reminderData, reminder_time: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Message (optional)</Label>
                        <Textarea
                          value={reminderData.message}
                          onChange={(e) =>
                            setReminderData({ ...reminderData, message: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          Create Reminder
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowReminderForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {ticket.reminders?.map((reminder) => (
                  <Card key={reminder.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{formatDate(reminder.reminder_time)}</div>
                          {reminder.message && (
                            <div className="text-sm text-gray-600">{reminder.message}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {reminder.is_sent ? (
                            <Badge variant="secondary">Sent</Badge>
                          ) : (
                            <Badge>Pending</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-2">
              {ticket.activities?.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Activity className="h-4 w-4 mt-1 text-gray-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {activity.user?.full_name || activity.user?.username}
                          </span>
                          <span className="text-sm text-gray-600">{activity.description}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
