from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.config.database import get_db
from app.models import ProjectMember, User, Project, Notification
from app.utils.auth import get_current_user
from app.utils.permissions import verify_project_access, check_permission, ROLE_PERMISSIONS

router = APIRouter()


# ============= Schemas =============

class ProjectMemberCreate(BaseModel):
    user_id: int
    role: str
    permissions: Optional[List[str]] = None


class ProjectMemberUpdate(BaseModel):
    role: Optional[str] = None
    permissions: Optional[List[str]] = None


class ProjectMemberResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    role: str
    permissions: Optional[List[str]]
    joined_at: datetime
    user: dict  # Will contain basic user info
    
    class Config:
        from_attributes = True


# ============= Routes =============

@router.get("/projects/{project_id}/members", response_model=List[ProjectMemberResponse])
def get_project_members(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all members of a project"""
    # Verify access
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access
    if not current_user.is_superuser:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not member:
            raise HTTPException(status_code=403, detail="Access denied")
    
    members = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()
    
    # Enrich with user data
    result = []
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        member_dict = {
            "id": member.id,
            "project_id": member.project_id,
            "user_id": member.user_id,
            "role": member.role,
            "permissions": member.permissions,
            "joined_at": member.joined_at,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url
            }
        }
        result.append(member_dict)
    
    return result


@router.post("/projects/{project_id}/members")
def add_project_member(
    project_id: int,
    member_data: ProjectMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a member to a project"""
    # Verify project exists and user has permission
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if current user has permission to add members
    if not current_user.is_superuser:
        current_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not current_member or not check_permission(current_member, "member.add"):
            raise HTTPException(status_code=403, detail="You don't have permission to add members")
    
    # Check if user to add exists
    user_to_add = db.query(User).filter(User.id == member_data.user_id).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_data.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member")
    
    # Validate role
    if member_data.role not in ROLE_PERMISSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid role: {member_data.role}")
    
    # Create member
    new_member = ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id,
        role=member_data.role,
        permissions=member_data.permissions,
        invited_by=current_user.id
    )
    
    db.add(new_member)
    
    # Create notification for the new member
    notification = Notification(
        user_id=member_data.user_id,
        title="Added to Project",
        message=f"You have been added to the project '{project.name}' as {member_data.role}",
        notification_type="assignment",
        entity_type="project",
        entity_id=project_id,
        action_url=f"/projects/{project_id}"
    )
    
    db.add(notification)
    db.commit()
    db.refresh(new_member)
    
    return {"message": "Member added successfully", "member_id": new_member.id}


@router.put("/projects/{project_id}/members/{member_id}")
def update_project_member(
    project_id: int,
    member_id: int,
    member_update: ProjectMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a project member's role or permissions"""
    # Check permission
    if not current_user.is_superuser:
        current_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not current_member or not check_permission(current_member, "member.edit"):
            raise HTTPException(status_code=403, detail="You don't have permission to edit members")
    
    # Get member to update
    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Update fields
    if member_update.role is not None:
        if member_update.role not in ROLE_PERMISSIONS:
            raise HTTPException(status_code=400, detail=f"Invalid role: {member_update.role}")
        member.role = member_update.role
    
    if member_update.permissions is not None:
        member.permissions = member_update.permissions
    
    db.commit()
    
    return {"message": "Member updated successfully"}


@router.delete("/projects/{project_id}/members/{member_id}")
def remove_project_member(
    project_id: int,
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from a project"""
    # Check permission
    if not current_user.is_superuser:
        current_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not current_member or not check_permission(current_member, "member.remove"):
            raise HTTPException(status_code=403, detail="You don't have permission to remove members")
    
    # Get member to remove
    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Don't allow removing the only owner
    if member.role == "owner":
        owner_count = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.role == "owner"
        ).count()
        
        if owner_count <= 1:
            raise HTTPException(
                status_code=400,
                detail="Cannot remove the only owner. Transfer ownership first."
            )
    
    db.delete(member)
    db.commit()
    
    return {"message": "Member removed successfully"}


@router.get("/projects/{project_id}/members/roles")
def get_available_roles():
    """Get all available roles and their permissions"""
    return {
        "roles": {
            role: {
                "name": role,
                "permissions": perms
            }
            for role, perms in ROLE_PERMISSIONS.items()
        }
    }
