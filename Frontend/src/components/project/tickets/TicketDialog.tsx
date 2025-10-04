'use client';

import React, { useState } from 'react';
import { apiClient } from '@/services/api/client';
import type { CreateTicketData } from '@/services/api/tickets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

interface TicketDialogProps {
  projectId: number;
  taskId?: number;
  stageId?: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TICKET_TYPES = [
  { value: 'file_request', label: 'File Request', description: 'Request files from another department' },
  { value: 'feedback', label: 'Feedback', description: 'Provide feedback on work' },
  { value: 'issue', label: 'Issue', description: 'Report a problem' },
  { value: 'question', label: 'Question', description: 'Ask a question' },
  { value: 'asset_delivery', label: 'Asset Delivery', description: 'Deliver assets to another team' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const DEPARTMENTS = [
  { value: 'editing', label: 'Editing' },
  { value: 'vfx', label: 'VFX' },
  { value: 'color_grading', label: 'Color Grading' },
  { value: 'sound', label: 'Sound' },
  { value: 'music', label: 'Music' },
  { value: 'graphics', label: 'Graphics' },
  { value: 'production', label: 'Production' },
];

export default function TicketDialog({
  projectId,
  taskId,
  stageId,
  open,
  onClose,
  onSuccess,
}: TicketDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTicketData>({
    project_id: projectId,
    task_id: taskId,
    stage_id: stageId,
    title: '',
    description: '',
    ticket_type: 'file_request',
    priority: 'medium',
    category: '',
    source_department: '',
    target_department: '',
    due_date: '',
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      setLoading(true);
      await apiClient.createTicket(projectId, formData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateTicketData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Create a ticket to communicate with other departments and track work requests
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Brief description of the request"
              required
            />
          </div>

          {/* Ticket Type */}
          <div>
            <Label htmlFor="ticket_type">Type *</Label>
            <Select
              value={formData.ticket_type}
              onValueChange={(value) => handleChange('ticket_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide detailed information about your request"
              rows={4}
            />
          </div>

          {/* Priority and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
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
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Departments */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source_department">From Department</Label>
              <Select
                value={formData.source_department || ''}
                onValueChange={(value) => handleChange('source_department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Your department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target_department">To Department</Label>
              <Select
                value={formData.target_department || ''}
                onValueChange={(value) => handleChange('target_department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Target department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) =>
                handleChange(
                  'tags',
                  e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                )
              }
              placeholder="urgent, final-files, review-needed"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
