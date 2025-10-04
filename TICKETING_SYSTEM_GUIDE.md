# Ticketing System Documentation

## Overview

The Ticketing System is a comprehensive communication and task tracking solution designed specifically for post-production workflows. It enables seamless collaboration between different departments (VFX, Editing, Color Grading, Sound, etc.) and keeps the production company informed of all activities.

## Key Features

### 1. **Department-to-Department Communication**
- **Source & Target Departments**: Each ticket specifies which department is requesting something and which department should respond
- **Clear Ownership**: Tickets are assigned to specific team members
- **Watchers**: Multiple stakeholders can watch a ticket and receive updates

### 2. **Ticket Types**
- **File Request**: Request files from another department (e.g., VFX requesting raw footage from Editing)
- **Feedback**: Provide feedback on work completed
- **Issue**: Report problems that need resolution
- **Question**: Ask questions to clarify requirements
- **Asset Delivery**: Notify when assets are ready for pickup

### 3. **Priority Management**
- **Low**: Non-urgent requests
- **Medium**: Standard priority (default)
- **High**: Important, time-sensitive
- **Urgent**: Critical, requires immediate attention

### 4. **Status Tracking**
- **Open**: Newly created ticket
- **In Progress**: Work has started
- **Waiting Response**: Awaiting response from another party
- **Resolved**: Issue resolved, awaiting confirmation
- **Closed**: Ticket completed

### 5. **Reminders & Notifications**
- **Automated Reminders**: Set reminders for follow-ups
- **Recurring Reminders**: Daily, weekly, or custom schedules
- **Due Date Alerts**: Automatic notifications before due dates
- **In-App Notifications**: Real-time updates in the application
- **Email Notifications**: Optional email alerts (when configured)

### 6. **Activity Tracking**
- Complete audit trail of all ticket changes
- Track who did what and when
- Response and resolution time metrics

### 7. **Analytics Dashboard**
- Status distribution charts
- Priority breakdown
- Department activity metrics
- Average response and resolution times
- Resolution rate tracking

## Backend API Endpoints

### Tickets

#### Create Ticket
```
POST /api/projects/{project_id}/tickets
```
**Body:**
```json
{
  "title": "Request final color graded files",
  "description": "Need the color graded versions of scenes 1-5",
  "ticket_type": "file_request",
  "priority": "high",
  "category": "color_grading",
  "source_department": "editing",
  "target_department": "color_grading",
  "assigned_to": 5,
  "watchers": [1, 2, 3],
  "due_date": "2025-10-15T18:00:00",
  "tags": ["final-delivery", "urgent"]
}
```

#### Get Project Tickets
```
GET /api/projects/{project_id}/tickets?status=open&priority=high
```
**Query Parameters:**
- `status`: Filter by status
- `priority`: Filter by priority
- `category`: Filter by category
- `ticket_type`: Filter by type
- `assigned_to`: Filter by assignee
- `created_by`: Filter by creator
- `department`: Filter by source or target department
- `search`: Search in title, description, ticket number

#### Get Ticket Details
```
GET /api/tickets/{ticket_id}
```
Returns ticket with comments, reminders, and activity history.

#### Update Ticket
```
PUT /api/tickets/{ticket_id}
```
**Body:**
```json
{
  "status": "in_progress",
  "priority": "urgent",
  "assigned_to": 6
}
```

#### Delete Ticket
```
DELETE /api/tickets/{ticket_id}
```

### Comments

#### Add Comment
```
POST /api/tickets/{ticket_id}/comments
```
**Body:**
```json
{
  "content": "Files are ready and uploaded to the shared drive",
  "comment_type": "comment",
  "mentions": [3, 5],
  "is_internal": false
}
```

#### Get Comments
```
GET /api/tickets/{ticket_id}/comments
```

#### Update Comment
```
PUT /api/tickets/comments/{comment_id}
```

#### Delete Comment
```
DELETE /api/tickets/comments/{comment_id}
```

### Reminders

#### Create Reminder
```
POST /api/tickets/{ticket_id}/reminders
```
**Body:**
```json
{
  "reminder_type": "follow_up",
  "reminder_time": "2025-10-10T10:00:00",
  "message": "Check if files were received",
  "is_recurring": true,
  "recurrence_pattern": "daily",
  "notify_in_app": true,
  "notify_email": false
}
```

#### Get Ticket Reminders
```
GET /api/tickets/{ticket_id}/reminders
```

#### Get Pending Reminders
```
GET /api/reminders/pending
```
Returns all pending reminders for the current user.

#### Mark Reminder as Sent
```
PUT /api/reminders/{reminder_id}/mark-sent
```

#### Delete Reminder
```
DELETE /api/reminders/{reminder_id}
```

### Analytics

#### Get Ticket Analytics
```
GET /api/projects/{project_id}/tickets/analytics
```
**Response:**
```json
{
  "total_tickets": 45,
  "status_breakdown": {
    "open": 12,
    "in_progress": 15,
    "resolved": 10,
    "closed": 8
  },
  "priority_breakdown": {
    "low": 5,
    "medium": 20,
    "high": 15,
    "urgent": 5
  },
  "category_breakdown": {
    "editing": 15,
    "vfx": 12,
    "color_grading": 10,
    "sound": 8
  },
  "department_breakdown": {
    "editing": 20,
    "vfx": 15,
    "color_grading": 10
  },
  "avg_response_time_hours": 2.5,
  "avg_resolution_time_hours": 24.3,
  "open_tickets": 12,
  "in_progress_tickets": 15,
  "resolved_tickets": 10,
  "closed_tickets": 8
}
```

### Bulk Operations

#### Bulk Update Tickets
```
POST /api/tickets/bulk-update
```
**Body:**
```json
{
  "ticket_ids": [1, 2, 3, 4],
  "status": "closed",
  "priority": "low"
}
```

## Frontend Components

### 1. TicketList Component
Main component for displaying and filtering tickets.

**Usage:**
```tsx
import TicketList from '@/components/project/tickets/TicketList';

<TicketList projectId={projectId} />
```

**Features:**
- Search and filter tickets
- Create new tickets
- View ticket details
- Status indicators
- Priority badges
- Due date tracking

### 2. TicketDialog Component
Modal for creating new tickets.

**Usage:**
```tsx
import TicketDialog from '@/components/project/tickets/TicketDialog';

<TicketDialog
  projectId={projectId}
  taskId={taskId}  // optional
  stageId={stageId}  // optional
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSuccess={() => handleSuccess()}
/>
```

### 3. TicketDetailsDialog Component
Detailed view of a ticket with comments, reminders, and activity.

**Usage:**
```tsx
import TicketDetailsDialog from '@/components/project/tickets/TicketDetailsDialog';

<TicketDetailsDialog
  ticket={selectedTicket}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onUpdate={() => handleUpdate()}
/>
```

**Features:**
- Edit ticket details
- Add comments
- Set reminders
- View activity history
- Change status
- Inline editing

### 4. TicketDashboard Component
Analytics and metrics dashboard.

**Usage:**
```tsx
import TicketDashboard from '@/components/project/tickets/TicketDashboard';

<TicketDashboard projectId={projectId} />
```

**Features:**
- Summary cards
- Status distribution chart
- Priority breakdown chart
- Department activity chart
- Performance metrics

## Integration Guide

### 1. Backend Setup

1. **Run Migration:**
```bash
cd Backend
python migrate_ticket_system.py
```

2. **Restart Server:**
```bash
python main.py
```

3. **Verify:**
Visit `http://localhost:8000/docs` and check for ticket endpoints.

### 2. Frontend Integration

#### In Project Detail Page
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TicketList from '@/components/project/tickets/TicketList';
import TicketDashboard from '@/components/project/tickets/TicketDashboard';

function ProjectPage({ projectId }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="tickets">
        <TicketList projectId={projectId} />
      </TabsContent>
      
      <TabsContent value="analytics">
        <TicketDashboard projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
```

#### In Task Management
```tsx
import TicketDialog from '@/components/project/tickets/TicketDialog';

function TaskCard({ task }) {
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowTicketDialog(true)}>
        Create Ticket
      </Button>
      
      <TicketDialog
        projectId={task.project_id}
        taskId={task.id}
        open={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        onSuccess={() => {
          setShowTicketDialog(false);
          toast.success('Ticket created!');
        }}
      />
    </>
  );
}
```

## Common Use Cases

### 1. VFX Artist Requesting Files from Editor
```typescript
await ticketService.createTicket(projectId, {
  title: "Need raw footage for Scene 15",
  description: "Require 4K raw footage for VFX work on the explosion sequence",
  ticket_type: "file_request",
  priority: "high",
  source_department: "vfx",
  target_department: "editing",
  due_date: "2025-10-12T17:00:00",
  tags: ["scene-15", "explosion", "4k"]
});
```

### 2. Production Company Following Up
```typescript
await ticketService.createReminder(ticketId, {
  reminder_type: "follow_up",
  reminder_time: "2025-10-11T09:00:00",
  message: "Check status of VFX file request",
  notify_in_app: true
});
```

### 3. Colorist Delivering Final Files
```typescript
await ticketService.createTicket(projectId, {
  title: "Final color graded files ready - Scenes 1-10",
  description: "All files uploaded to shared drive at /final/color/scenes_1-10/",
  ticket_type: "asset_delivery",
  priority: "medium",
  source_department: "color_grading",
  target_department: "editing",
  watchers: [productionManagerId, directorId],
  tags: ["final-delivery", "color-grading"]
});
```

## Best Practices

1. **Use Clear Titles**: Make ticket titles descriptive and actionable
2. **Set Appropriate Priorities**: Use urgent sparingly to maintain its importance
3. **Add Watchers**: Include all stakeholders who need to be informed
4. **Update Status Regularly**: Keep ticket status current
5. **Use Tags**: Tag tickets for easy filtering and organization
6. **Set Due Dates**: Always set realistic due dates for time-sensitive requests
7. **Comment Frequently**: Keep communication transparent with regular updates
8. **Set Reminders**: Don't let important tickets slip through the cracks
9. **Close Resolved Tickets**: Close tickets once work is verified complete

## Notification Flow

1. **Ticket Created**: All watchers + assignee notified
2. **Status Changed**: All watchers notified
3. **Comment Added**: All watchers notified
4. **User Mentioned**: Mentioned user gets specific notification
5. **Due Date Approaching**: Assignee receives reminder
6. **Reminder Triggered**: User receives in-app (and optionally email) notification

## Database Schema

### Tickets Table
- Core ticket information
- Links to project, task, stage
- Status and priority tracking
- Department information
- Timing and metrics

### Ticket Comments Table
- User comments
- Attachments support
- Mention tracking
- Internal notes flag

### Ticket Reminders Table
- Reminder scheduling
- Recurrence support
- Notification preferences
- Sent status tracking

### Ticket Activities Table
- Complete audit trail
- Field-level change tracking
- User attribution
- Timestamp for all changes

## Performance Considerations

- Indexes on frequently queried fields (status, priority, project_id)
- Eager loading of relationships to avoid N+1 queries
- Pagination for large ticket lists (can be added if needed)
- Caching of analytics data for large projects

## Future Enhancements

- File attachments to tickets and comments
- Email integration for notifications
- Ticket templates for common requests
- SLA tracking and alerts
- Advanced search with full-text search
- Ticket dependencies and blocking
- Custom fields per project
- Ticket export (PDF, CSV)
- Mobile app integration

## Troubleshooting

### Tickets not appearing
- Check project_id is correct
- Verify user has access to the project
- Check filters aren't too restrictive

### Reminders not firing
- Ensure reminder time is in the future
- Check user has notifications enabled
- Verify reminder is marked as active

### Analytics not loading
- Ensure there are tickets in the project
- Check browser console for errors
- Verify API endpoint is accessible

## Support

For issues or questions:
1. Check API documentation at `/docs`
2. Review error messages in browser console
3. Check backend logs for server errors
4. Verify database migrations ran successfully
