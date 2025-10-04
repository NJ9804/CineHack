"""
Schedule management endpoints for CineHack
Handles shooting schedules, timeline management, and scheduling conflicts
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.config.database import get_db
from app.models import Scene, Project, ProductionStage
from app.utils.auth import get_current_user
from app.models import User

router = APIRouter()

# Pydantic models for request/response
class ScheduleItemCreate(BaseModel):
    scene_id: int
    scheduled_date: Optional[datetime] = None
    location: Optional[str] = None
    crew: Optional[List[str]] = None
    notes: Optional[str] = None

class ScheduleItemUpdate(BaseModel):
    status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    location: Optional[str] = None
    crew: Optional[List[str]] = None
    notes: Optional[str] = None

class ScheduleStats(BaseModel):
    total_scenes: int
    scheduled: int
    completed: int
    in_progress: int
    unscheduled: int
    total_shoot_days: int
    days_completed: int
    completion_percentage: float

class ConflictDetail(BaseModel):
    id: int
    type: str  # 'location_overlap', 'actor_overlap', 'crew_overlap', 'time_constraint'
    severity: str  # 'high', 'medium', 'low'
    message: str
    scenes: List[int]
    date: Optional[datetime] = None

class AutoScheduleRequest(BaseModel):
    constraints: Optional[dict] = None
    optimize_for: str = "efficiency"  # 'efficiency', 'cost', 'quality'

class AutoScheduleResponse(BaseModel):
    success: bool
    message: str
    scheduled_count: int
    conflicts: List[ConflictDetail]

@router.get("/projects/{project_id}/schedule/stats")
def get_schedule_stats(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get scheduling statistics for a project"""
    # Get all scenes for the project
    scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    total_scenes = len(scenes)
    scheduled = len([s for s in scenes if s.status in ['planned', 'in-progress', 'shooting', 'completed']])
    completed = len([s for s in scenes if s.status == 'completed'])
    in_progress = len([s for s in scenes if s.status in ['in-progress', 'shooting']])
    unscheduled = len([s for s in scenes if not s.status or s.status == 'unplanned'])
    
    # Calculate shoot days (approximate)
    total_shoot_days = 0
    days_completed = 0
    
    # Group scenes by scheduled date (if they have one)
    scheduled_dates = set()
    completed_dates = set()
    
    for scene in scenes:
        if hasattr(scene, 'scheduled_date') and scene.scheduled_date:
            scheduled_dates.add(scene.scheduled_date.date() if isinstance(scene.scheduled_date, datetime) else scene.scheduled_date)
            if scene.status == 'completed':
                completed_dates.add(scene.scheduled_date.date() if isinstance(scene.scheduled_date, datetime) else scene.scheduled_date)
    
    total_shoot_days = len(scheduled_dates) if scheduled_dates else max(1, total_scenes // 5)  # Estimate 5 scenes per day
    days_completed = len(completed_dates)
    
    completion_percentage = (completed / total_scenes * 100) if total_scenes > 0 else 0
    
    return ScheduleStats(
        total_scenes=total_scenes,
        scheduled=scheduled,
        completed=completed,
        in_progress=in_progress,
        unscheduled=unscheduled,
        total_shoot_days=total_shoot_days,
        days_completed=days_completed,
        completion_percentage=round(completion_percentage, 2)
    )

@router.get("/projects/{project_id}/schedule/conflicts")
def get_scheduling_conflicts(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Detect and return scheduling conflicts"""
    conflicts = []
    
    # Get all scenes for the project
    scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    # Group scenes by date
    scenes_by_date = {}
    for scene in scenes:
        if hasattr(scene, 'scheduled_date') and scene.scheduled_date:
            date_key = scene.scheduled_date.date() if isinstance(scene.scheduled_date, datetime) else scene.scheduled_date
            if date_key not in scenes_by_date:
                scenes_by_date[date_key] = []
            scenes_by_date[date_key].append(scene)
    
    # Check for location conflicts (same location, same day, overlapping times)
    for date, day_scenes in scenes_by_date.items():
        location_groups = {}
        for scene in day_scenes:
            loc = scene.location if hasattr(scene, 'location') and scene.location else 'Unknown'
            if loc not in location_groups:
                location_groups[loc] = []
            location_groups[loc].append(scene)
        
        for location, loc_scenes in location_groups.items():
            if len(loc_scenes) > 1:
                conflicts.append(ConflictDetail(
                    id=len(conflicts) + 1,
                    type='location_overlap',
                    severity='medium',
                    message=f"{len(loc_scenes)} scenes scheduled at {location} on {date}",
                    scenes=[s.id for s in loc_scenes],
                    date=datetime.combine(date, datetime.min.time())
                ))
    
    # Check for character conflicts (same actor in multiple scenes same day)
    for date, day_scenes in scenes_by_date.items():
        character_scenes = {}
        for scene in day_scenes:
            if hasattr(scene, 'characters') and scene.characters:
                for char in scene.characters:
                    char_name = char.get('name', 'Unknown') if isinstance(char, dict) else str(char)
                    if char_name not in character_scenes:
                        character_scenes[char_name] = []
                    character_scenes[char_name].append(scene)
        
        for character, char_scenes in character_scenes.items():
            if len(char_scenes) > 3:  # More than 3 scenes in one day might be challenging
                conflicts.append(ConflictDetail(
                    id=len(conflicts) + 1,
                    type='actor_overlap',
                    severity='low',
                    message=f"Character '{character}' appears in {len(char_scenes)} scenes on {date}",
                    scenes=[s.id for s in char_scenes],
                    date=datetime.combine(date, datetime.min.time())
                ))
    
    return conflicts

@router.post("/projects/{project_id}/schedule/items")
def create_schedule_item(
    project_id: int,
    scene_id: int,
    schedule_data: ScheduleItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update a schedule item for a scene"""
    scene = db.query(Scene).filter(
        Scene.id == scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Update scene with schedule information
    if schedule_data.scheduled_date:
        scene.scheduled_date = schedule_data.scheduled_date
    if schedule_data.location:
        scene.location = schedule_data.location
    if schedule_data.notes:
        scene.notes = schedule_data.notes
    
    scene.status = 'planned'
    
    db.commit()
    db.refresh(scene)
    
    return {
        "id": scene.id,
        "scene_id": scene_id,
        "status": scene.status,
        "scheduled_date": scene.scheduled_date,
        "location": scene.location if hasattr(scene, 'location') else None,
        "notes": scene.notes if hasattr(scene, 'notes') else None
    }

@router.put("/projects/{project_id}/schedule/items/{scene_id}")
def update_schedule_item(
    project_id: int,
    scene_id: int,
    update_data: ScheduleItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a schedule item"""
    scene = db.query(Scene).filter(
        Scene.id == scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Update only provided fields
    if update_data.status is not None:
        scene.status = update_data.status
    if update_data.scheduled_date is not None:
        scene.scheduled_date = update_data.scheduled_date
    if update_data.location is not None:
        scene.location = update_data.location
    if update_data.notes is not None:
        scene.notes = update_data.notes
    
    db.commit()
    db.refresh(scene)
    
    return {
        "id": scene.id,
        "status": scene.status,
        "scheduled_date": scene.scheduled_date,
        "location": scene.location if hasattr(scene, 'location') else None
    }

@router.post("/projects/{project_id}/schedule/auto-schedule")
def auto_schedule(
    project_id: int,
    request: AutoScheduleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Auto-schedule unplanned scenes using AI optimization"""
    # Get all unplanned scenes
    unplanned_scenes = db.query(Scene).filter(
        Scene.project_id == project_id,
        or_(Scene.status == 'unplanned', Scene.status == None)
    ).all()
    
    if not unplanned_scenes:
        return AutoScheduleResponse(
            success=True,
            message="No unplanned scenes to schedule",
            scheduled_count=0,
            conflicts=[]
        )
    
    # Get project info for scheduling
    project = db.query(Project).filter(Project.id == project_id).first()
    
    # Simple auto-scheduling logic (can be enhanced with AI)
    # Group scenes by location to minimize location changes
    scenes_by_location = {}
    for scene in unplanned_scenes:
        loc = scene.location if hasattr(scene, 'location') and scene.location else 'Unknown'
        if loc not in scenes_by_location:
            scenes_by_location[loc] = []
        scenes_by_location[loc].append(scene)
    
    # Schedule scenes location by location
    current_date = datetime.now()
    scheduled_count = 0
    
    for location, scenes in scenes_by_location.items():
        for i, scene in enumerate(scenes):
            # Schedule 5 scenes per day
            day_offset = scheduled_count // 5
            scene.scheduled_date = current_date + timedelta(days=day_offset)
            scene.status = 'planned'
            scheduled_count += 1
    
    db.commit()
    
    # Check for conflicts after scheduling
    conflicts_response = get_scheduling_conflicts(project_id, db, current_user)
    
    return AutoScheduleResponse(
        success=True,
        message=f"Successfully scheduled {scheduled_count} scenes",
        scheduled_count=scheduled_count,
        conflicts=conflicts_response
    )

@router.delete("/projects/{project_id}/schedule/items/{scene_id}")
def delete_schedule_item(
    project_id: int,
    scene_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a scene from the schedule (mark as unplanned)"""
    scene = db.query(Scene).filter(
        Scene.id == scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene.status = 'unplanned'
    scene.scheduled_date = None
    
    db.commit()
    
    return {"message": "Scene removed from schedule", "scene_id": scene_id}
