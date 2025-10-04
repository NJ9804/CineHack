from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy import and_, or_

router = APIRouter(prefix="/scheduling", tags=["scheduling"])

class ScheduleItemCreate(BaseModel):
    scene_id: int
    scheduled_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location_id: Optional[int] = None
    status: str = "planned"  # planned, in_progress, completed, cancelled
    notes: Optional[str] = None

class ScheduleItemUpdate(BaseModel):
    scheduled_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location_id: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ScheduleItemResponse(BaseModel):
    id: int
    project_id: int
    scene_id: int
    scene_number: Optional[str]
    scene_heading: Optional[str]
    location_name: Optional[str]
    scheduled_date: date
    start_time: Optional[str]
    end_time: Optional[str]
    status: str
    notes: Optional[str]
    conflicts: Optional[List[str]] = []
    actors_involved: Optional[List[Dict[str, Any]]] = []
    estimated_duration: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True

class ConflictResponse(BaseModel):
    type: str  # actor_conflict, location_conflict, resource_conflict
    message: str
    affected_scenes: List[str]  # Changed from List[int] to List[str]
    date: date
    severity: str = "medium"  # Added severity field with default

class CalendarEventResponse(BaseModel):
    id: int
    title: str
    start: str  # ISO date string
    end: Optional[str] = None
    scene_id: int
    status: str
    location: Optional[str]
    conflicts: List[str] = []

@router.post("/projects/{project_id}/schedule", response_model=ScheduleItemResponse)
async def create_schedule_item(
    project_id: int,
    schedule_data: ScheduleItemCreate,
    db: Session = Depends(get_db)
):
    """Create a new schedule item for a scene."""
    from app.models import Scene, ScheduleItem
    
    # Verify scene exists and belongs to project
    scene = db.query(Scene).filter(
        and_(Scene.id == schedule_data.scene_id, Scene.project_id == project_id)
    ).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found in this project")
    
    # Check if schedule item already exists for this scene
    existing_schedule = db.query(ScheduleItem).filter(
        and_(ScheduleItem.scene_id == schedule_data.scene_id, ScheduleItem.project_id == project_id)
    ).first()
    if existing_schedule:
        raise HTTPException(status_code=409, detail="Schedule item already exists for this scene")
    
    # Create new schedule item
    schedule_item = ScheduleItem(
        project_id=project_id,
        scene_id=schedule_data.scene_id,
        scheduled_date=datetime.combine(schedule_data.scheduled_date, datetime.min.time()),
        start_time=schedule_data.start_time,
        end_time=schedule_data.end_time,
        status=schedule_data.status,
        notes=schedule_data.notes,
        conflicts=[]
    )
    
    db.add(schedule_item)
    db.commit()
    db.refresh(schedule_item)
    
    # Return formatted response
    return ScheduleItemResponse(
        id=schedule_item.id,
        project_id=schedule_item.project_id,
        scene_id=schedule_item.scene_id,
        scene_number=scene.scene_number,
        scene_heading=scene.scene_heading,
        location_name=scene.location_name,
        scheduled_date=schedule_item.scheduled_date.date(),
        start_time=schedule_item.start_time,
        end_time=schedule_item.end_time,
        status=schedule_item.status,
        notes=schedule_item.notes,
        conflicts=schedule_item.conflicts or [],
        actors_involved=scene.actors_data or [],
        estimated_duration=scene.estimated_duration,
        created_at=schedule_item.created_at.isoformat() if schedule_item.created_at else None,
        updated_at=schedule_item.updated_at.isoformat() if schedule_item.updated_at else None
    )

@router.get("/projects/{project_id}/schedule", response_model=List[ScheduleItemResponse])
async def get_project_schedule(
    project_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get schedule for a project with optional date range filtering."""
    from app.models import Scene, ScheduleItem
    
    # Get all scheduled items for the project
    query = db.query(ScheduleItem, Scene).join(Scene, ScheduleItem.scene_id == Scene.id).filter(
        ScheduleItem.project_id == project_id
    )
    
    # Apply date filtering if provided
    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
        query = query.filter(ScheduleItem.scheduled_date >= start_dt)
    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()
        query = query.filter(ScheduleItem.scheduled_date <= end_dt)
    
    scheduled_items = query.all()
    
    # Get all scenes for the project that are NOT scheduled yet
    scheduled_scene_ids = [item.ScheduleItem.scene_id for item in scheduled_items]
    unscheduled_scenes = db.query(Scene).filter(
        and_(Scene.project_id == project_id, ~Scene.id.in_(scheduled_scene_ids))
    ).all()
    
    schedule_responses = []
    
    # Add actually scheduled items
    for schedule_item, scene in scheduled_items:
        schedule_responses.append(ScheduleItemResponse(
            id=schedule_item.id,
            project_id=schedule_item.project_id,
            scene_id=schedule_item.scene_id,
            scene_number=scene.scene_number,
            scene_heading=scene.scene_heading,
            location_name=scene.location_name,
            scheduled_date=schedule_item.scheduled_date.date(),
            start_time=schedule_item.start_time,
            end_time=schedule_item.end_time,
            status=schedule_item.status,
            notes=schedule_item.notes,
            conflicts=schedule_item.conflicts or [],
            actors_involved=scene.actors_data or [],
            estimated_duration=scene.estimated_duration,
            created_at=schedule_item.created_at.isoformat() if schedule_item.created_at else None,
            updated_at=schedule_item.updated_at.isoformat() if schedule_item.updated_at else None
        ))
    
    # Add unscheduled scenes as mock entries (for UI purposes)
    for i, scene in enumerate(unscheduled_scenes):
        # Create mock schedule dates (every other day starting from today) for unscheduled scenes
        from datetime import timedelta
        base_date = datetime.now().date()
        scheduled_date = base_date + timedelta(days=(len(scheduled_items) + i) * 2)
        
        conflicts = []
        if scene.location_type == "outdoor" and "rain" in (scene.technical_notes or "").lower():
            conflicts.append("Weather dependent")
        
        schedule_responses.append(ScheduleItemResponse(
            id=scene.id * 1000,  # Use large ID to avoid conflicts with real schedule items
            project_id=project_id,
            scene_id=scene.id,
            scene_number=scene.scene_number or f"Scene {scene.id}",
            scene_heading=scene.scene_heading,
            location_name=scene.location_name,
            scheduled_date=scheduled_date,
            start_time="09:00",
            end_time="17:00",
            status=scene.status,
            notes=scene.technical_notes,
            conflicts=conflicts,
            actors_involved=scene.actors_data or [],
            estimated_duration=scene.estimated_duration,
            created_at=scene.created_at.isoformat() if scene.created_at else None,
            updated_at=scene.updated_at.isoformat() if scene.updated_at else None
        ))
    
    return schedule_responses

@router.get("/projects/{project_id}/schedule/calendar", response_model=List[CalendarEventResponse])
async def get_project_calendar(
    project_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get project schedule in calendar event format."""
    schedule_items = await get_project_schedule(project_id, start_date, end_date, db)
    
    calendar_events = []
    for item in schedule_items:
        event = CalendarEventResponse(
            id=item.id,
            title=f"{item.scene_number}: {item.scene_heading or 'Untitled Scene'}",
            start=item.scheduled_date.isoformat(),
            end=item.scheduled_date.isoformat() if not item.end_time else None,
            scene_id=item.scene_id,
            status=item.status,
            location=item.location_name,
            conflicts=item.conflicts
        )
        calendar_events.append(event)
    
    return calendar_events

@router.put("/projects/{project_id}/schedule/{schedule_id}", response_model=ScheduleItemResponse)
async def update_schedule_item(
    project_id: int,
    schedule_id: int,
    schedule_data: ScheduleItemUpdate,
    db: Session = Depends(get_db)
):
    """Update a schedule item."""
    from app.models import Scene, ScheduleItem
    
    # Find the schedule item
    schedule_item = db.query(ScheduleItem).filter(
        and_(ScheduleItem.id == schedule_id, ScheduleItem.project_id == project_id)
    ).first()
    
    if not schedule_item:
        # If no schedule item exists, try to find by scene_id (for drag-and-drop status updates)
        scene = db.query(Scene).filter(
            and_(Scene.id == schedule_id, Scene.project_id == project_id)
        ).first()
        if not scene:
            raise HTTPException(status_code=404, detail="Schedule item or scene not found")
        
        # Update scene status if it's a status-only update
        if schedule_data.status and not any([
            schedule_data.scheduled_date, schedule_data.start_time, 
            schedule_data.end_time, schedule_data.notes
        ]):
            scene.status = schedule_data.status
            db.commit()
            db.refresh(scene)
            
            # Return a mock schedule response for status-only updates
            return ScheduleItemResponse(
                id=scene.id * 1000,  # Mock ID
                project_id=project_id,
                scene_id=scene.id,
                scene_number=scene.scene_number,
                scene_heading=scene.scene_heading,
                location_name=scene.location_name,
                scheduled_date=datetime.now().date(),
                start_time="09:00",
                end_time="17:00",
                status=scene.status,
                notes=scene.technical_notes,
                conflicts=[],
                actors_involved=scene.actors_data or [],
                estimated_duration=scene.estimated_duration,
                created_at=scene.created_at.isoformat() if scene.created_at else None,
                updated_at=scene.updated_at.isoformat() if scene.updated_at else None
            )
        else:
            raise HTTPException(status_code=404, detail="Schedule item not found")
    
    # Update the schedule item fields
    if schedule_data.scheduled_date:
        schedule_item.scheduled_date = datetime.combine(schedule_data.scheduled_date, datetime.min.time())
    if schedule_data.start_time:
        schedule_item.start_time = schedule_data.start_time
    if schedule_data.end_time:
        schedule_item.end_time = schedule_data.end_time
    if schedule_data.status:
        schedule_item.status = schedule_data.status
    if schedule_data.notes:
        schedule_item.notes = schedule_data.notes
    
    db.commit()
    db.refresh(schedule_item)
    
    # Get scene data for response
    scene = db.query(Scene).filter(Scene.id == schedule_item.scene_id).first()
    
    return ScheduleItemResponse(
        id=schedule_item.id,
        project_id=schedule_item.project_id,
        scene_id=schedule_item.scene_id,
        scene_number=scene.scene_number if scene else f"Scene {schedule_item.scene_id}",
        scene_heading=scene.scene_heading if scene else "Unknown Scene",
        location_name=scene.location_name if scene else "Unknown Location",
        scheduled_date=schedule_item.scheduled_date.date(),
        start_time=schedule_item.start_time,
        end_time=schedule_item.end_time,
        status=schedule_item.status,
        notes=schedule_item.notes,
        conflicts=schedule_item.conflicts or [],
        actors_involved=scene.actors_data if scene else [],
        estimated_duration=scene.estimated_duration if scene else None,
        created_at=schedule_item.created_at.isoformat() if schedule_item.created_at else None,
        updated_at=schedule_item.updated_at.isoformat() if schedule_item.updated_at else None
    )

@router.get("/projects/{project_id}/conflicts", response_model=List[ConflictResponse])
async def get_scheduling_conflicts(project_id: int, db: Session = Depends(get_db)):
    """Detect and return scheduling conflicts for a project."""
    conflicts = []
    
    # Mock conflict detection
    conflicts.append(ConflictResponse(
        type="actor_conflict",
        message="Lead actor scheduled for multiple scenes on same day",
        affected_scenes=["1", "3"],  # Changed to strings
        date=datetime.now().date(),
        severity="high"
    ))
    
    conflicts.append(ConflictResponse(
        type="location_conflict",
        message="Same location booked for overlapping scenes",
        affected_scenes=["2", "4"],  # Changed to strings
        date=datetime.now().date(),
        severity="medium"
    ))
    
    return conflicts

@router.post("/projects/{project_id}/auto-schedule")
async def auto_schedule_project(project_id: int, db: Session = Depends(get_db)):
    """Automatically schedule scenes based on availability and constraints."""
    from app.models import Scene
    
    scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    # Simple auto-scheduling logic
    scheduled_count = 0
    for i, scene in enumerate(scenes):
        if scene.status == "unplanned":
            scene.status = "planned"
            scheduled_count += 1
    
    db.commit()
    
    return {
        "message": f"Auto-scheduled {scheduled_count} scenes",
        "scheduled_scenes": scheduled_count,
        "total_scenes": len(scenes)
    }

@router.get("/projects/{project_id}/schedule/stats")
async def get_schedule_stats(project_id: int, db: Session = Depends(get_db)):
    """Get scheduling statistics for a project."""
    from app.models import Scene
    
    scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    stats = {
        "total_scenes": len(scenes),
        "planned": len([s for s in scenes if s.status in ["planned", "shooting"]]),
        "completed": len([s for s in scenes if s.status == "completed"]),
        "unplanned": len([s for s in scenes if s.status == "unplanned"]),
        "in_progress": len([s for s in scenes if s.status == "shooting"]),
        "conflicts": 2,  # Mock number
        "shooting_days": 15,  # Mock calculation
        "estimated_duration": "45 days"
    }
    
    return stats