from typing import List
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models import User, ProjectMember, Project
from app.utils.auth import get_current_user

# Permission definitions by role
ROLE_PERMISSIONS = {
    "owner": [
        "project.delete",
        "project.edit",
        "project.view",
        "budget.edit",
        "budget.view",
        "scene.create",
        "scene.edit",
        "scene.delete",
        "scene.view",
        "task.create",
        "task.edit",
        "task.delete",
        "task.view",
        "member.add",
        "member.remove",
        "member.edit",
        "comment.create",
        "comment.edit",
        "comment.delete",
        "comment.view"
    ],
    "director": [
        "project.edit",
        "project.view",
        "budget.view",
        "scene.create",
        "scene.edit",
        "scene.delete",
        "scene.view",
        "task.create",
        "task.edit",
        "task.view",
        "comment.create",
        "comment.edit",
        "comment.view"
    ],
    "producer": [
        "project.edit",
        "project.view",
        "budget.edit",
        "budget.view",
        "scene.view",
        "task.create",
        "task.edit",
        "task.view",
        "member.add",
        "comment.create",
        "comment.view"
    ],
    "shareholder": [
        "project.view",
        "budget.view",
        "scene.view",
        "task.view"
    ],
    "crew": [
        "project.view",
        "scene.view",
        "task.edit",  # Only their assigned tasks
        "task.view",
        "comment.create",
        "comment.view"
    ],
    "viewer": [
        "project.view",
        "scene.view",
        "task.view",
        "comment.view"
    ]
}


async def get_project_member(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ProjectMember:
    """Get the current user's project membership"""
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not member and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project"
        )
    
    return member


def check_permission(member: ProjectMember, permission: str) -> bool:
    """Check if a user has a specific permission"""
    if not member:
        return False
    
    # Get base permissions for role
    base_permissions = ROLE_PERMISSIONS.get(member.role, [])
    
    # Add custom permissions if any
    custom_permissions = member.permissions or []
    
    all_permissions = base_permissions + custom_permissions
    
    return permission in all_permissions


def require_permission(permission: str):
    """Decorator to require a specific permission"""
    async def permission_checker(
        project_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # Superusers have all permissions
        if current_user.is_superuser:
            return current_user
        
        member = await get_project_member(project_id, current_user, db)
        
        if not check_permission(member, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You don't have permission to {permission}"
            )
        
        return member
    
    return permission_checker


async def get_user_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[Project]:
    """Get all projects the user has access to"""
    if current_user.is_superuser:
        return db.query(Project).all()
    
    # Get projects where user is a member
    memberships = db.query(ProjectMember).filter(
        ProjectMember.user_id == current_user.id
    ).all()
    
    project_ids = [m.project_id for m in memberships]
    
    return db.query(Project).filter(Project.id.in_(project_ids)).all()


async def verify_project_access(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Project:
    """Verify user has access to a project and return it"""
    if current_user.is_superuser:
        project = db.query(Project).filter(Project.id == project_id).first()
    else:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this project"
            )
        
        project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return project
