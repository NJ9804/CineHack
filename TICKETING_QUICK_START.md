# Ticketing System - Quick Start Guide

## What Problem Does This Solve?

In post-production, different departments (VFX, Editing, Color Grading, Sound, etc.) need to communicate frequently:
- VFX artists need raw files from editors
- Colorists need to deliver final files to editors
- Sound designers need feedback from directors
- Editors need assets from multiple sources

**The Problem:** These communications happen via email, messages, or verbal conversations. The production company often doesn't know what's happening, leading to:
- ❌ Lost time when people aren't aware of delays
- ❌ Missed deadlines because requests fall through the cracks
- ❌ No accountability or tracking of who's waiting for what
- ❌ No metrics on team performance

**The Solution:** A ticketing system that:
- ✅ Tracks all inter-department communication
- ✅ Notifies all stakeholders automatically
- ✅ Sets reminders so nothing is forgotten
- ✅ Provides analytics on team performance
- ✅ Keeps the production company in the loop

## 5-Minute Setup

### Step 1: Backend (Already Done! ✅)
The database migration has already been run successfully. The tables are created and ready.

### Step 2: Restart Your Backend Server
```bash
cd Backend
python main.py
```

### Step 3: Verify API
Visit `http://localhost:8000/docs` and look for the **tickets** section.

### Step 4: Frontend Integration
Add the ticketing system to your project page:

```tsx
// In your project detail page (e.g., src/app/projects/[id]/page.tsx)
import { TicketList, TicketDashboard, TicketWidget } from '@/components/project/tickets';

function ProjectPage({ params }) {
  const projectId = params.id;
  
  return (
    <div>
      {/* Add a widget to your dashboard */}
      <TicketWidget 
        projectId={projectId}
        onCreateTicket={() => setShowCreateDialog(true)}
        onViewTickets={() => router.push(`/projects/${projectId}/tickets`)}
      />
      
      {/* Or add a full tickets page */}
      <Tabs>
        <TabsList>
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
    </div>
  );
}
```

## Common Scenarios

### Scenario 1: VFX Artist Needs Files from Editor

**Old Way:**
1. VFX artist emails editor: "Need raw footage for Scene 15"
2. Email gets buried
3. Editor doesn't respond
4. Production manager has no idea there's a delay
5. VFX work is delayed by days

**New Way:**
1. VFX artist clicks "New Ticket"
2. Selects "File Request"
3. Fills in:
   - Title: "Need raw footage for Scene 15"
   - From: VFX Department
   - To: Editing Department
   - Priority: High
   - Due Date: Tomorrow
   - Add production manager as watcher
4. Clicks Create

**What Happens:**
- ✅ Editor gets instant notification
- ✅ Production manager sees it in dashboard
- ✅ Automatic reminder set for tomorrow
- ✅ Ticket appears in "urgent" section
- ✅ Everyone knows who's waiting for what

### Scenario 2: Colorist Delivers Final Files

**Old Way:**
1. Colorist uploads files to shared drive
2. Sends message to editor: "Files are ready"
3. Editor might not see message for hours
4. Production doesn't know files are ready
5. Timeline unclear

**New Way:**
1. Colorist creates "Asset Delivery" ticket
2. Fills in:
   - Title: "Final color graded files - Scenes 1-10"
   - Description: "Files uploaded to /final/color/scenes_1-10/"
   - From: Color Grading
   - To: Editing
   - Tags: final-delivery, ready-for-edit
3. Adds production manager and director as watchers

**What Happens:**
- ✅ Editing team notified immediately
- ✅ Production manager sees in analytics
- ✅ Director can review if needed
- ✅ Everyone knows timeline is on track
- ✅ Tracked in project metrics

### Scenario 3: Following Up on Pending Requests

**Old Way:**
1. Production manager has to ask everyone individually
2. "Did you get the files you needed?"
3. "Is the VFX work done?"
4. Time-consuming and manual

**New Way:**
1. Open the Tickets page
2. See all open tickets at a glance
3. Filter by department, priority, status
4. Click any ticket to see full conversation
5. Set reminders for follow-ups

**The Dashboard Shows:**
- ✅ 5 tickets open
- ✅ 3 in progress
- ✅ 2 waiting for response
- ✅ Average response time: 2.5 hours
- ✅ 1 overdue ticket (needs attention!)

## Using the Components

### 1. TicketWidget (Small, Embeddable)
Perfect for dashboards and overview pages:

```tsx
<TicketWidget 
  projectId={1}
  compact={true}  // Smaller version
  onCreateTicket={() => handleCreate()}
  onViewTickets={() => router.push('/tickets')}
/>
```

Shows:
- Quick ticket counts
- Urgent and overdue badges
- Create and view buttons

### 2. TicketList (Full List View)
Complete ticket management:

```tsx
<TicketList projectId={1} />
```

Features:
- Search tickets
- Filter by status, priority, category, type
- Click to view details
- Create new tickets
- Visual indicators for status and priority

### 3. TicketDialog (Create Ticket)
Modal for creating tickets:

```tsx
const [showDialog, setShowDialog] = useState(false);

<Button onClick={() => setShowDialog(true)}>
  New Ticket
</Button>

<TicketDialog
  projectId={1}
  taskId={5}  // Optional: link to a task
  open={showDialog}
  onClose={() => setShowDialog(false)}
  onSuccess={() => {
    setShowDialog(false);
    toast.success('Ticket created!');
  }}
/>
```

### 4. TicketDetailsDialog (View/Edit Ticket)
Full ticket details with tabs:

```tsx
<TicketDetailsDialog
  ticket={selectedTicket}
  open={showDetails}
  onClose={() => setShowDetails(false)}
  onUpdate={() => refreshTickets()}
/>
```

Tabs:
- Comments: Add comments, mention users
- Reminders: Set follow-up reminders
- Activity: See complete history

### 5. TicketDashboard (Analytics)
Visual analytics and metrics:

```tsx
<TicketDashboard projectId={1} />
```

Shows:
- Status distribution chart
- Priority breakdown
- Department activity
- Performance metrics
- Resolution rates

## Best Practices

### 1. Use Clear Titles
❌ Bad: "Need files"
✅ Good: "Request raw 4K footage for Scene 15 explosion sequence"

### 2. Set Appropriate Priorities
- **Low**: Can wait a few days
- **Medium**: Normal workflow (default)
- **High**: Blocking other work
- **Urgent**: Critical, immediate attention needed

Don't overuse "Urgent" - keep it for true emergencies.

### 3. Add Watchers
Always include:
- The person who needs to act (assignee)
- The production manager
- Anyone else who should be informed

### 4. Set Realistic Due Dates
- Don't leave it blank
- Consider the other person's workload
- Add buffer time for reviews

### 5. Comment Frequently
Keep everyone updated:
- "Started working on this"
- "Files uploaded to shared drive"
- "Need clarification on X"
- "Completed and ready for review"

### 6. Close Resolved Tickets
When work is complete and verified:
- Change status to "Resolved"
- Add final comment
- Then close the ticket

### 7. Use Reminders
Set reminders for:
- Following up if no response
- Checking if work is complete
- Deadlines approaching

### 8. Review Analytics Weekly
Production managers should:
- Check the dashboard weekly
- Look for bottlenecks (which department has most open tickets?)
- Track response times
- Identify overdue tickets

## Ticket Types Explained

### 1. File Request
**When to use:** You need files from another department
**Example:** VFX needs raw footage from Editing

### 2. Feedback
**When to use:** Providing comments or requesting changes
**Example:** Director gives notes on VFX work

### 3. Issue
**When to use:** Something is wrong and needs fixing
**Example:** Color graded files are the wrong resolution

### 4. Question
**When to use:** Need clarification or information
**Example:** Sound designer asking about desired audio treatment

### 5. Asset Delivery
**When to use:** Notifying that files are ready
**Example:** Colorist finished and files are uploaded

## Common Questions

**Q: Who can see tickets?**
A: Anyone with access to the project can see tickets. Use the "internal note" feature for production-only comments.

**Q: Can I edit or delete tickets?**
A: You can edit tickets anytime. You can delete tickets you created (or if you're a superuser).

**Q: What happens when I mention someone?**
A: They get a notification with a link to the ticket.

**Q: Can I get email notifications?**
A: Email notifications are supported in the backend. They need to be configured in your email settings.

**Q: How do I know if someone responded?**
A: You get an in-app notification. You can also set reminders to follow up.

**Q: Can I link tickets to tasks?**
A: Yes! When creating a ticket from a task view, it's automatically linked.

## Keyboard Shortcuts (Future Enhancement)

These could be added:
- `N` - New ticket
- `/` - Focus search
- `Esc` - Close dialog
- `Ctrl+Enter` - Submit comment

## Mobile Support

The components are responsive and work on mobile devices. Team members can:
- View tickets on their phones
- Add comments while on set
- Check status updates
- Get notifications

## Next Steps

1. **Try it out**: Create a test ticket in your project
2. **Integrate**: Add TicketWidget to your project dashboard
3. **Train team**: Show department heads how to use it
4. **Monitor**: Check analytics weekly for insights
5. **Iterate**: Gather feedback and adjust workflow

## Support

- Backend API docs: `http://localhost:8000/docs`
- Full documentation: See `TICKETING_SYSTEM_GUIDE.md`
- Implementation details: See `TICKETING_IMPLEMENTATION_README.md`

## Success Metrics to Track

After implementing, monitor:
- ✅ Reduction in missed deadlines
- ✅ Faster response times between departments
- ✅ Fewer "lost" requests
- ✅ Better visibility for production managers
- ✅ Improved team accountability
- ✅ Time saved in status meetings (just check the dashboard!)

---

**Remember:** The goal is transparency and preventing delays. Every ticket creates a clear record of who needs what, when, and why. This keeps everyone informed and projects on track.
