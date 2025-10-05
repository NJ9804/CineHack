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
from app.models import Scene, Project, ProductionStage, ActorAvailability, GlobalCost
from app.services.scheduling_service import SchedulingEngine, WeatherService

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
    start_date: datetime
    end_date: datetime
    optimization_mode: str = "balanced"  # cost, speed, balanced, quality
    skip_weekends: bool = True
    auto_cascade: bool = True
    scenes_per_day: Optional[int] = None
    constraints: Optional[dict] = None

class AutoScheduleResponse(BaseModel):
    success: bool
    message: str
    scheduled_count: int
    conflicts: List[ConflictDetail]

@router.get("/projects/{project_id}/schedule/stats")
def get_schedule_stats(
    project_id: int,
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
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

@router.post("/projects/{project_id}/schedule/auto")
def auto_schedule(
    project_id: int,
    request: AutoScheduleRequest,
    db: Session = Depends(get_db)
):
    """
    Advanced AI-powered auto-scheduling
    Considers: actor payment types, weather, location clustering, optimization mode
    """
    # Get project
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
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
    
    # Get actor availability data
    actors = db.query(ActorAvailability).filter(
        ActorAvailability.project_id == project_id
    ).all()
    
    # Get global costs for actor billing information
    global_costs = db.query(GlobalCost).filter(
        GlobalCost.category == 'actor'
    ).all()
    
    # Configure scheduling engine
    config = {
        'skip_weekends': request.skip_weekends,
        'auto_cascade': request.auto_cascade,
        'scenes_per_day': request.scenes_per_day or 5
    }
    
    # Initialize scheduling engine
    engine = SchedulingEngine(
        scenes=unplanned_scenes,
        actors=actors,
        project_config=config,
        global_costs=global_costs
    )
    
    # Run scheduling algorithm
    result = engine.schedule_scenes(
        start_date=request.start_date,
        end_date=request.end_date,
        optimization_mode=request.optimization_mode
    )
    
    # Save scheduled scenes to database
    scheduled_count = 0
    for schedule_item in result['schedule']:
        scene = db.query(Scene).filter(Scene.id == schedule_item['scene_id']).first()
        if scene:
            scene.scheduled_date = schedule_item['scheduled_date']
            scene.status = 'planned'
            
            # Add weather note to scene notes
            if schedule_item.get('weather_note'):
                existing_notes = scene.notes or ''
                scene.notes = f"{existing_notes}\n[Weather]: {schedule_item['weather_note']}".strip()
            
            scheduled_count += 1
    
    db.commit()
    
    # Convert conflicts to ConflictDetail format
    conflicts = [
        ConflictDetail(
            id=idx + 1,
            type=c['type'],
            severity=c.get('severity', 'medium'),
            message=c['message'],
            scenes=[c.get('scene_id', 0)],
            date=c.get('date')
        )
        for idx, c in enumerate(result['conflicts'])
    ]
    
    return {
        "success": True,
        "message": f"Successfully scheduled {scheduled_count} scenes using {request.optimization_mode} mode",
        "scheduled_count": scheduled_count,
        "conflicts": conflicts,
        "total_days": result['total_days'],
        "completion_date": result['completion_date'],
        "optimization_summary": {
            "mode": request.optimization_mode,
            "scenes_per_day": config['scenes_per_day'],
            "skip_weekends": request.skip_weekends
        }
    }

@router.delete("/projects/{project_id}/schedule/items/{scene_id}")
def delete_schedule_item(
    project_id: int,
    scene_id: int,
    db: Session = Depends(get_db)
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


class RescheduleRequest(BaseModel):
    scene_id: int
    new_date: datetime
    reason: Optional[str] = None
    auto_cascade: bool = True


@router.post("/projects/{project_id}/schedule/reschedule")
def reschedule_scene(
    project_id: int,
    request: RescheduleRequest,
    db: Session = Depends(get_db)
):
    """
    Reschedule a single scene with optional auto-cascade
    Auto-cascade will reschedule dependent scenes
    """
    # Get the scene
    scene = db.query(Scene).filter(
        Scene.id == request.scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    old_date = scene.scheduled_date
    
    # Get all scenes for the project (for cascade)
    all_scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    # Get actors for the project
    actors = db.query(ActorAvailability).filter(
        ActorAvailability.project_id == project_id
    ).all()
    
    # Get global costs for actor billing
    global_costs = db.query(GlobalCost).filter(
        GlobalCost.category == 'actor'
    ).all()
    
    # Create current schedule representation
    current_schedule = []
    for s in all_scenes:
        if s.scheduled_date:
            current_schedule.append({
                'scene_id': s.id,
                'scene_number': s.scene_number,
                'scheduled_date': s.scheduled_date,
                'location': s.location_name
            })
    
    # Initialize scheduling engine for cascade
    config = {'auto_cascade': request.auto_cascade}
    engine = SchedulingEngine(
        scenes=all_scenes,
        actors=actors,
        project_config=config,
        global_costs=global_costs
    )
    
    # Perform reschedule with cascade
    result = engine.reschedule_scene(
        scene_id=request.scene_id,
        new_date=request.new_date,
        current_schedule=current_schedule
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    # Update database with new schedule
    for schedule_item in result['updated_schedule']:
        db_scene = db.query(Scene).filter(Scene.id == schedule_item['scene_id']).first()
        if db_scene:
            db_scene.scheduled_date = schedule_item['scheduled_date']
            
            # Add reason to notes if provided
            if request.reason and db_scene.id == request.scene_id:
                existing_notes = db_scene.notes or ''
                db_scene.notes = f"{existing_notes}\n[Rescheduled]: {request.reason}".strip()
    
    db.commit()
    
    # Convert conflicts to ConflictDetail format
    conflicts = [
        ConflictDetail(
            id=idx + 1,
            type=c.get('type', 'reschedule_conflict'),
            severity=c.get('severity', 'medium'),
            message=c.get('message', ''),
            scenes=c.get('scenes', []),
            date=c.get('date')
        )
        for idx, c in enumerate(result.get('new_conflicts', []))
    ]
    
    return {
        "success": True,
        "message": result['message'],
        "old_date": old_date,
        "new_date": request.new_date,
        "affected_scenes": result.get('affected_scenes', []),
        "conflicts": conflicts,
        "cascade_enabled": request.auto_cascade
    }


@router.get("/projects/{project_id}/schedule/optimization-preview")
def get_optimization_preview(
    project_id: int,
    mode: str = "balanced",
    db: Session = Depends(get_db)
):
    """
    Preview what auto-schedule would do without applying it
    Shows estimated completion date, cost, and conflicts
    """
    # Get unplanned scenes
    unplanned_scenes = db.query(Scene).filter(
        Scene.project_id == project_id,
        or_(Scene.status == 'unplanned', Scene.status == None)
    ).all()
    
    if not unplanned_scenes:
        return {
            "preview": "No unplanned scenes",
            "estimated_days": 0,
            "mode": mode
        }
    
    # Get actors
    actors = db.query(ActorAvailability).filter(
        ActorAvailability.project_id == project_id
    ).all()
    
    # Get global costs
    global_costs = db.query(GlobalCost).filter(
        GlobalCost.category == 'actor'
    ).all()
    
    # Configure engine
    config = {'skip_weekends': True, 'scenes_per_day': 5}
    engine = SchedulingEngine(unplanned_scenes, actors, config, global_costs)
    
    # Calculate preview (without saving)
    start_date = datetime.now()
    end_date = start_date + timedelta(days=365)  # 1 year max
    
    result = engine.schedule_scenes(start_date, end_date, mode)
    
    return {
        "mode": mode,
        "total_scenes": len(unplanned_scenes),
        "estimated_days": result['total_days'],
        "completion_date": result['completion_date'],
        "potential_conflicts": len(result['conflicts']),
        "conflicts_preview": result['conflicts'][:5]  # First 5 conflicts
    }

