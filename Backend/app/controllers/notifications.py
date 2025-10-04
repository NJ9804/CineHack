from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.config.database import get_db
from app.models import Notification, User
from app.utils.auth import get_current_user

router = APIRouter()


# ============= Schemas =============

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    is_read: bool
    is_archived: bool
    action_url: Optional[str]
    created_at: datetime
    read_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    notification_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    action_url: Optional[str] = None


# ============= Routes =============

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    unread_only: bool = False,
    archived: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for the current user"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    if archived:
        query = query.filter(Notification.is_archived == True)
    else:
        query = query.filter(Notification.is_archived == False)
    
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    return notifications


@router.get("/notifications/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
        Notification.is_archived == False
    ).count()
    
    return {"unread_count": count}


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.post("/notifications/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


@router.post("/notifications/{notification_id}/archive")
def archive_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Archive a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_archived = True
    db.commit()
    
    return {"message": "Notification archived"}


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted"}


# Helper function to create notifications (can be used by other controllers)
def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    action_url: Optional[str] = None
):
    """Helper function to create a notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        entity_type=entity_type,
        entity_id=entity_id,
        action_url=action_url
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification
