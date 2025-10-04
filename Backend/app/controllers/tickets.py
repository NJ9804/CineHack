from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, desc
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.config.database import get_db
from app.models import (
    Ticket, TicketComment, TicketReminder, TicketActivity,
    User, Project, ProductionTask, ProductionStage, Notification
)
from app.utils.auth import get_current_user

router = APIRouter()

# ============= Pydantic Models =============

class TicketCreate(BaseModel):
    project_id: int
    task_id: Optional[int] = None
    stage_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    ticket_type: str  # file_request, feedback, issue, question, asset_delivery
    priority: str = "medium"
    category: Optional[str] = None
    assigned_to: Optional[int] = None
    watchers: Optional[List[int]] = None
    source_department: Optional[str] = None
    target_department: Optional[str] = None
    attachments: Optional[List[dict]] = None
    related_files: Optional[List[dict]] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    ticket_metadata: Optional[dict] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    ticket_type: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[int] = None
    watchers: Optional[List[int]] = None
    source_department: Optional[str] = None
    target_department: Optional[str] = None
    attachments: Optional[List[dict]] = None
    related_files: Optional[List[dict]] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    ticket_metadata: Optional[dict] = None


class TicketCommentCreate(BaseModel):
    content: str
    comment_type: str = "comment"
    attachments: Optional[List[dict]] = None
    mentions: Optional[List[int]] = None
    is_internal: bool = False


class TicketReminderCreate(BaseModel):
    reminder_type: str
    reminder_time: datetime
    message: Optional[str] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    recurrence_end: Optional[datetime] = None
    notify_email: bool = False
    notify_in_app: bool = True


class TicketFilters(BaseModel):
    project_id: Optional[int] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    ticket_type: Optional[str] = None
    assigned_to: Optional[int] = None
    created_by: Optional[int] = None
    department: Optional[str] = None


# ============= Helper Functions =============

def generate_ticket_number(db: Session, project_id: int) -> str:
    """Generate a unique ticket number for the project"""
    # Get the latest ticket number for this project
    latest_ticket = db.query(Ticket).filter(
        Ticket.project_id == project_id
    ).order_by(desc(Ticket.id)).first()
    
    if latest_ticket and latest_ticket.ticket_number:
        # Extract number and increment
        try:
            parts = latest_ticket.ticket_number.split('-')
            if len(parts) >= 2:
                num = int(parts[-1]) + 1
            else:
                num = 1
        except:
            num = 1
    else:
        num = 1
    
    return f"TICK-{project_id}-{num:04d}"


def log_ticket_activity(
    db: Session,
    ticket_id: int,
    user_id: int,
    activity_type: str,
    description: str,
    field_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    activity_metadata: Optional[dict] = None
):
    """Log activity on a ticket"""
    activity = TicketActivity(
        ticket_id=ticket_id,
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        activity_metadata=activity_metadata
    )
    db.add(activity)
    db.commit()


def notify_ticket_watchers(
    db: Session,
    ticket: Ticket,
    notification_type: str,
    title: str,
    message: str,
    exclude_user_id: Optional[int] = None
):
    """Send notifications to all ticket watchers"""
    watchers = ticket.watchers or []
    
    # Add assignee and creator to watchers
    if ticket.assigned_to and ticket.assigned_to not in watchers:
        watchers.append(ticket.assigned_to)
    if ticket.created_by and ticket.created_by not in watchers:
        watchers.append(ticket.created_by)
    
    for user_id in watchers:
        if user_id == exclude_user_id:
            continue
        
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            entity_type="ticket",
            entity_id=ticket.id,
            action_url=f"/projects/{ticket.project_id}/tickets/{ticket.id}"
        )
        db.add(notification)
    
    db.commit()


# ============= API Endpoints =============

@router.post("/projects/{project_id}/tickets")
def create_ticket(
    project_id: int,
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new ticket"""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate ticket number
    ticket_number = generate_ticket_number(db, project_id)
    
    # Create ticket
    ticket = Ticket(
        project_id=project_id,
        task_id=ticket_data.task_id,
        stage_id=ticket_data.stage_id,
        ticket_number=ticket_number,
        title=ticket_data.title,
        description=ticket_data.description,
        ticket_type=ticket_data.ticket_type,
        priority=ticket_data.priority,
        category=ticket_data.category,
        created_by=current_user.id,
        assigned_to=ticket_data.assigned_to,
        watchers=ticket_data.watchers or [],
        source_department=ticket_data.source_department,
        target_department=ticket_data.target_department,
        attachments=ticket_data.attachments or [],
        related_files=ticket_data.related_files or [],
        due_date=ticket_data.due_date,
        tags=ticket_data.tags or [],
        metadata=ticket_data.ticket_metadata or {}
    )
    
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Log activity
    log_ticket_activity(
        db, ticket.id, current_user.id,
        "created",
        f"Created ticket: {ticket.title}"
    )
    
    # Send notifications
    notify_ticket_watchers(
        db, ticket,
        "ticket_created",
        f"New Ticket: {ticket.ticket_number}",
        f"{current_user.full_name or current_user.username} created a new ticket: {ticket.title}",
        exclude_user_id=current_user.id
    )
    
    return ticket


@router.get("/projects/{project_id}/tickets")
def get_project_tickets(
    project_id: int,
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    ticket_type: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    created_by: Optional[int] = Query(None),
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tickets for a project with filters"""
    query = db.query(Ticket).filter(Ticket.project_id == project_id)
    
    # Apply filters
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
    if category:
        query = query.filter(Ticket.category == category)
    if ticket_type:
        query = query.filter(Ticket.ticket_type == ticket_type)
    if assigned_to:
        query = query.filter(Ticket.assigned_to == assigned_to)
    if created_by:
        query = query.filter(Ticket.created_by == created_by)
    if department:
        query = query.filter(
            or_(
                Ticket.source_department == department,
                Ticket.target_department == department
            )
        )
    if search:
        query = query.filter(
            or_(
                Ticket.title.ilike(f"%{search}%"),
                Ticket.description.ilike(f"%{search}%"),
                Ticket.ticket_number.ilike(f"%{search}%")
            )
        )
    
    # Load relationships
    query = query.options(
        joinedload(Ticket.creator),
        joinedload(Ticket.assignee)
    )
    
    tickets = query.order_by(desc(Ticket.created_at)).all()
    
    return tickets


@router.get("/tickets/{ticket_id}")
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific ticket with all details"""
    ticket = db.query(Ticket).options(
        joinedload(Ticket.creator),
        joinedload(Ticket.assignee),
        joinedload(Ticket.comments).joinedload(TicketComment.user),
        joinedload(Ticket.reminders),
        joinedload(Ticket.activities).joinedload(TicketActivity.user)
    ).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket


@router.put("/tickets/{ticket_id}")
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Track changes for activity log
    changes = []
    
    # Update fields
    update_fields = {
        "title": ticket_data.title,
        "description": ticket_data.description,
        "ticket_type": ticket_data.ticket_type,
        "priority": ticket_data.priority,
        "category": ticket_data.category,
        "status": ticket_data.status,
        "assigned_to": ticket_data.assigned_to,
        "watchers": ticket_data.watchers,
        "source_department": ticket_data.source_department,
        "target_department": ticket_data.target_department,
        "attachments": ticket_data.attachments,
        "related_files": ticket_data.related_files,
        "due_date": ticket_data.due_date,
        "tags": ticket_data.tags,
        "metadata": ticket_data.ticket_metadata
    }
    
    for field, new_value in update_fields.items():
        if new_value is not None:
            old_value = getattr(ticket, field)
            if old_value != new_value:
                changes.append({
                    "field": field,
                    "old": str(old_value) if old_value else None,
                    "new": str(new_value)
                })
                setattr(ticket, field, new_value)
    
    # Handle status changes
    if ticket_data.status == "resolved" and ticket.status != "resolved":
        ticket.resolved_at = datetime.utcnow()
        if ticket.created_at:
            ticket.resolution_time = (datetime.utcnow() - ticket.created_at).total_seconds() / 3600
    elif ticket_data.status == "closed" and ticket.status != "closed":
        ticket.closed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(ticket)
    
    # Log activities for each change
    for change in changes:
        log_ticket_activity(
            db, ticket.id, current_user.id,
            "updated",
            f"Updated {change['field']} from '{change['old']}' to '{change['new']}'",
            field_name=change['field'],
            old_value=change['old'],
            new_value=change['new']
        )
    
    # Send notifications for important changes
    if ticket_data.status and ticket_data.status != ticket.status:
        notify_ticket_watchers(
            db, ticket,
            "ticket_status_changed",
            f"Ticket Status Changed: {ticket.ticket_number}",
            f"Status changed to: {ticket_data.status}",
            exclude_user_id=current_user.id
        )
    
    if ticket_data.assigned_to and ticket_data.assigned_to != ticket.assigned_to:
        notify_ticket_watchers(
            db, ticket,
            "ticket_assigned",
            f"Ticket Assigned: {ticket.ticket_number}",
            f"Ticket assigned to user ID: {ticket_data.assigned_to}",
            exclude_user_id=current_user.id
        )
    
    return ticket


@router.delete("/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Only creator or superuser can delete
    if ticket.created_by != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to delete this ticket")
    
    db.delete(ticket)
    db.commit()
    
    return {"message": "Ticket deleted successfully"}


# ============= Comments =============

@router.post("/tickets/{ticket_id}/comments")
def add_ticket_comment(
    ticket_id: int,
    comment_data: TicketCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    comment = TicketComment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        content=comment_data.content,
        comment_type=comment_data.comment_type,
        attachments=comment_data.attachments or [],
        mentions=comment_data.mentions or [],
        is_internal=comment_data.is_internal
    )
    
    db.add(comment)
    
    # Update response time if this is the first comment
    if not ticket.response_time:
        ticket.response_time = (datetime.utcnow() - ticket.created_at).total_seconds() / 3600
        db.commit()
    
    db.commit()
    db.refresh(comment)
    
    # Log activity
    log_ticket_activity(
        db, ticket.id, current_user.id,
        "commented",
        f"Added a comment: {comment_data.content[:50]}..."
    )
    
    # Notify watchers
    notify_ticket_watchers(
        db, ticket,
        "ticket_comment",
        f"New Comment: {ticket.ticket_number}",
        f"{current_user.full_name or current_user.username} commented: {comment_data.content[:100]}...",
        exclude_user_id=current_user.id
    )
    
    # Notify mentioned users
    if comment_data.mentions:
        for user_id in comment_data.mentions:
            notification = Notification(
                user_id=user_id,
                title=f"Mentioned in Ticket: {ticket.ticket_number}",
                message=f"{current_user.full_name or current_user.username} mentioned you in a comment",
                notification_type="mention",
                entity_type="ticket",
                entity_id=ticket.id,
                action_url=f"/projects/{ticket.project_id}/tickets/{ticket.id}"
            )
            db.add(notification)
        db.commit()
    
    return comment


@router.get("/tickets/{ticket_id}/comments")
def get_ticket_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all comments for a ticket"""
    comments = db.query(TicketComment).options(
        joinedload(TicketComment.user)
    ).filter(TicketComment.ticket_id == ticket_id).order_by(TicketComment.created_at).all()
    
    return comments


@router.put("/tickets/comments/{comment_id}")
def update_ticket_comment(
    comment_id: int,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a ticket comment"""
    comment = db.query(TicketComment).filter(TicketComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")
    
    comment.content = content
    comment.is_edited = True
    db.commit()
    db.refresh(comment)
    
    return comment


@router.delete("/tickets/comments/{comment_id}")
def delete_ticket_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a ticket comment"""
    comment = db.query(TicketComment).filter(TicketComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}


# ============= Reminders =============

@router.post("/tickets/{ticket_id}/reminders")
def create_ticket_reminder(
    ticket_id: int,
    reminder_data: TicketReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a reminder for a ticket"""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    reminder = TicketReminder(
        ticket_id=ticket_id,
        user_id=current_user.id,
        reminder_type=reminder_data.reminder_type,
        reminder_time=reminder_data.reminder_time,
        message=reminder_data.message,
        is_recurring=reminder_data.is_recurring,
        recurrence_pattern=reminder_data.recurrence_pattern,
        recurrence_end=reminder_data.recurrence_end,
        notify_email=reminder_data.notify_email,
        notify_in_app=reminder_data.notify_in_app
    )
    
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    
    return reminder


@router.get("/tickets/{ticket_id}/reminders")
def get_ticket_reminders(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reminders for a ticket"""
    reminders = db.query(TicketReminder).filter(
        TicketReminder.ticket_id == ticket_id,
        TicketReminder.is_active == True
    ).order_by(TicketReminder.reminder_time).all()
    
    return reminders


@router.get("/reminders/pending")
def get_pending_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending reminders for the current user"""
    now = datetime.utcnow()
    
    reminders = db.query(TicketReminder).filter(
        TicketReminder.user_id == current_user.id,
        TicketReminder.is_active == True,
        TicketReminder.is_sent == False,
        TicketReminder.reminder_time <= now
    ).all()
    
    return reminders


@router.put("/reminders/{reminder_id}/mark-sent")
def mark_reminder_sent(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a reminder as sent"""
    reminder = db.query(TicketReminder).filter(TicketReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder.is_sent = True
    reminder.sent_at = datetime.utcnow()
    
    # Handle recurring reminders
    if reminder.is_recurring and reminder.recurrence_pattern:
        # Create next reminder based on pattern
        if reminder.recurrence_pattern == "daily":
            next_time = reminder.reminder_time + timedelta(days=1)
        elif reminder.recurrence_pattern == "weekly":
            next_time = reminder.reminder_time + timedelta(weeks=1)
        else:
            next_time = None
        
        if next_time and (not reminder.recurrence_end or next_time <= reminder.recurrence_end):
            new_reminder = TicketReminder(
                ticket_id=reminder.ticket_id,
                user_id=reminder.user_id,
                reminder_type=reminder.reminder_type,
                reminder_time=next_time,
                message=reminder.message,
                is_recurring=True,
                recurrence_pattern=reminder.recurrence_pattern,
                recurrence_end=reminder.recurrence_end,
                notify_email=reminder.notify_email,
                notify_in_app=reminder.notify_in_app
            )
            db.add(new_reminder)
    
    db.commit()
    return {"message": "Reminder marked as sent"}


@router.delete("/reminders/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a reminder"""
    reminder = db.query(TicketReminder).filter(TicketReminder.id == reminder_id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    if reminder.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reminder")
    
    reminder.is_active = False
    db.commit()
    
    return {"message": "Reminder deleted successfully"}


# ============= Analytics =============

@router.get("/projects/{project_id}/tickets/analytics")
def get_ticket_analytics(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics for tickets in a project"""
    tickets = db.query(Ticket).filter(Ticket.project_id == project_id).all()
    
    total_tickets = len(tickets)
    
    # Status breakdown
    status_counts = {}
    for ticket in tickets:
        status_counts[ticket.status] = status_counts.get(ticket.status, 0) + 1
    
    # Priority breakdown
    priority_counts = {}
    for ticket in tickets:
        priority_counts[ticket.priority] = priority_counts.get(ticket.priority, 0) + 1
    
    # Category breakdown
    category_counts = {}
    for ticket in tickets:
        if ticket.category:
            category_counts[ticket.category] = category_counts.get(ticket.category, 0) + 1
    
    # Average response and resolution times
    response_times = [t.response_time for t in tickets if t.response_time]
    resolution_times = [t.resolution_time for t in tickets if t.resolution_time]
    
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
    
    # Tickets by department
    department_counts = {}
    for ticket in tickets:
        if ticket.source_department:
            dept = ticket.source_department
            department_counts[dept] = department_counts.get(dept, 0) + 1
    
    return {
        "total_tickets": total_tickets,
        "status_breakdown": status_counts,
        "priority_breakdown": priority_counts,
        "category_breakdown": category_counts,
        "department_breakdown": department_counts,
        "avg_response_time_hours": round(avg_response_time, 2),
        "avg_resolution_time_hours": round(avg_resolution_time, 2),
        "open_tickets": status_counts.get("open", 0),
        "in_progress_tickets": status_counts.get("in_progress", 0),
        "resolved_tickets": status_counts.get("resolved", 0),
        "closed_tickets": status_counts.get("closed", 0)
    }


# ============= Bulk Operations =============

@router.post("/tickets/bulk-update")
def bulk_update_tickets(
    ticket_ids: List[int],
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Bulk update multiple tickets"""
    tickets = db.query(Ticket).filter(Ticket.id.in_(ticket_ids)).all()
    
    for ticket in tickets:
        if status:
            ticket.status = status
        if priority:
            ticket.priority = priority
        if assigned_to:
            ticket.assigned_to = assigned_to
    
    db.commit()
    
    return {"message": f"Updated {len(tickets)} tickets successfully"}
