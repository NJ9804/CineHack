from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.config.database import get_db
from app.models import Comment, User, Notification
from app.utils.auth import get_current_user

router = APIRouter()


# ============= Schemas =============

class CommentCreate(BaseModel):
    content: str
    entity_type: str  # scene, task, project, budget_line
    entity_id: int
    parent_comment_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    user_id: int
    entity_type: str
    entity_id: int
    parent_comment_id: Optional[int]
    is_resolved: bool
    is_edited: bool
    created_at: datetime
    updated_at: datetime
    user: dict  # Basic user info
    replies: Optional[List['CommentResponse']] = []
    
    class Config:
        from_attributes = True


# ============= Routes =============

@router.post("/comments")
def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment"""
    # TODO: Verify user has access to the entity being commented on
    
    new_comment = Comment(
        content=comment_data.content,
        user_id=current_user.id,
        entity_type=comment_data.entity_type,
        entity_id=comment_data.entity_id,
        parent_comment_id=comment_data.parent_comment_id
    )
    
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    # If it's a reply, notify the parent comment author
    if comment_data.parent_comment_id:
        parent_comment = db.query(Comment).filter(
            Comment.id == comment_data.parent_comment_id
        ).first()
        
        if parent_comment and parent_comment.user_id != current_user.id:
            notification = Notification(
                user_id=parent_comment.user_id,
                title="New Reply",
                message=f"{current_user.username} replied to your comment",
                notification_type="comment",
                entity_type="comment",
                entity_id=new_comment.id
            )
            db.add(notification)
            db.commit()
    
    return {"message": "Comment created successfully", "comment_id": new_comment.id}


@router.get("/comments/{entity_type}/{entity_id}", response_model=List[CommentResponse])
def get_comments(
    entity_type: str,
    entity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all comments for an entity"""
    # Get top-level comments (not replies)
    comments = db.query(Comment).filter(
        Comment.entity_type == entity_type,
        Comment.entity_id == entity_id,
        Comment.parent_comment_id == None
    ).order_by(Comment.created_at.desc()).all()
    
    # Enrich with user data and replies
    result = []
    for comment in comments:
        user = db.query(User).filter(User.id == comment.user_id).first()
        
        # Get replies
        replies = db.query(Comment).filter(
            Comment.parent_comment_id == comment.id
        ).order_by(Comment.created_at.asc()).all()
        
        reply_list = []
        for reply in replies:
            reply_user = db.query(User).filter(User.id == reply.user_id).first()
            reply_list.append({
                "id": reply.id,
                "content": reply.content,
                "user_id": reply.user_id,
                "entity_type": reply.entity_type,
                "entity_id": reply.entity_id,
                "parent_comment_id": reply.parent_comment_id,
                "is_resolved": reply.is_resolved,
                "is_edited": reply.is_edited,
                "created_at": reply.created_at,
                "updated_at": reply.updated_at,
                "user": {
                    "id": reply_user.id,
                    "username": reply_user.username,
                    "full_name": reply_user.full_name,
                    "avatar_url": reply_user.avatar_url
                },
                "replies": []
            })
        
        comment_dict = {
            "id": comment.id,
            "content": comment.content,
            "user_id": comment.user_id,
            "entity_type": comment.entity_type,
            "entity_id": comment.entity_id,
            "parent_comment_id": comment.parent_comment_id,
            "is_resolved": comment.is_resolved,
            "is_edited": comment.is_edited,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url
            },
            "replies": reply_list
        }
        result.append(comment_dict)
    
    return result


@router.put("/comments/{comment_id}")
def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only author can edit their comment
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="You can only edit your own comments")
    
    comment.content = comment_update.content
    comment.is_edited = True
    
    db.commit()
    
    return {"message": "Comment updated successfully"}


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only author or superuser can delete
    if comment.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="You can only delete your own comments")
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}


@router.post("/comments/{comment_id}/resolve")
def resolve_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a comment as resolved"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_resolved = True
    db.commit()
    
    return {"message": "Comment marked as resolved"}


@router.post("/comments/{comment_id}/unresolve")
def unresolve_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a comment as unresolved"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    comment.is_resolved = False
    db.commit()
    
    return {"message": "Comment marked as unresolved"}
