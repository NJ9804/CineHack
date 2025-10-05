"""
CLEAN Schedule Controller - Optimized and Simplified
Handles: Schedule stats, auto-scheduling with AI, manual reschedule, conflicts
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from app.config.database import get_db
from app.models import Scene, Project, ProductionStage, ActorAvailability, GlobalCost
from app.services.scheduling_service import SchedulingEngine

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class AutoScheduleRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    optimization_mode: str = "balanced"  # cost, speed, balanced, quality
    skip_weekends: bool = True
    auto_cascade: bool = True
    scenes_per_day: Optional[int] = None

class RescheduleRequest(BaseModel):
    scene_id: int
    new_date: datetime
    reason: Optional[str] = None
    auto_cascade: bool = True

class ScheduleStats(BaseModel):
    total_scenes: int
    scheduled: int
    completed: int
    in_progress: int
    unscheduled: int
    total_shoot_days: int
    days_completed: int
    completion_percentage: float

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/projects/{project_id}/schedule/stats", response_model=ScheduleStats)
def get_schedule_stats(project_id: int, db: Session = Depends(get_db)):
    """Get scheduling statistics for a project"""
    
    scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    total_scenes = len(scenes)
    scheduled = len([s for s in scenes if s.status in ['planned', 'in-progress', 'shooting', 'completed']])
    completed = len([s for s in scenes if s.status == 'completed'])
    in_progress = len([s for s in scenes if s.status in ['in-progress', 'shooting']])
    unscheduled = len([s for s in scenes if not s.status or s.status == 'unplanned'])
    
    # Calculate shoot days
    scheduled_dates = set()
    completed_dates = set()
    
    for scene in scenes:
        if hasattr(scene, 'scheduled_date') and scene.scheduled_date:
            date_val = scene.scheduled_date.date() if isinstance(scene.scheduled_date, datetime) else scene.scheduled_date
            scheduled_dates.add(date_val)
            if scene.status == 'completed':
                completed_dates.add(date_val)
    
    total_shoot_days = len(scheduled_dates) if scheduled_dates else max(1, total_scenes // 5)
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
def get_scheduling_conflicts(project_id: int, db: Session = Depends(get_db)):
    """Detect and return scheduling conflicts"""
    
    conflicts = []
    scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    
    # Group scenes by date
    scenes_by_date = {}
    for scene in scenes:
        if hasattr(scene, 'scheduled_date') and scene.scheduled_date:
            date_key = scene.scheduled_date.date() if isinstance(scene.scheduled_date, datetime) else scene.scheduled_date
            if date_key not in scenes_by_date:
                scenes_by_date[date_key] = []
            scenes_by_date[date_key].append(scene)
    
    # Check for conflicts each day
    for date, day_scenes in scenes_by_date.items():
        # Location conflicts
        location_groups = {}
        for scene in day_scenes:
            loc = scene.location_name if hasattr(scene, 'location_name') and scene.location_name else 'Unknown'
            if loc not in location_groups:
                location_groups[loc] = []
            location_groups[loc].append(scene)
        
        for location, loc_scenes in location_groups.items():
            if len(loc_scenes) > 1:
                conflicts.append({
                    "id": len(conflicts) + 1,
                    "type": "location_overlap",
                    "severity": "medium",
                    "message": f"{len(loc_scenes)} scenes at {location} on {date}",
                    "scenes": [s.id for s in loc_scenes],
                    "date": datetime.combine(date, datetime.min.time())
                })
        
        # Actor overload (same actor in too many scenes)
        if day_scenes:
            actor_scenes = {}
            for scene in day_scenes:
                if hasattr(scene, 'actors_data') and scene.actors_data:
                    for actor_info in scene.actors_data:
                        actor_name = actor_info.get('name', '')
                        if actor_name:
                            if actor_name not in actor_scenes:
                                actor_scenes[actor_name] = []
                            actor_scenes[actor_name].append(scene.id)
            
            for actor, scene_ids in actor_scenes.items():
                if len(scene_ids) > 3:
                    conflicts.append({
                        "id": len(conflicts) + 1,
                        "type": "actor_overload",
                        "severity": "high",
                        "message": f"{actor} in {len(scene_ids)} scenes on {date}",
                        "scenes": scene_ids,
                        "date": datetime.combine(date, datetime.min.time())
                    })
    
    return conflicts


@router.post("/projects/{project_id}/schedule/auto")
def auto_schedule(project_id: int, request: AutoScheduleRequest, db: Session = Depends(get_db)):
    """
    AI-Powered Auto-Schedule
    Optimizes based on: actor billing cycles, weather, location clustering
    """
    
    # Validate project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get unplanned scenes
    unplanned_scenes = db.query(Scene).filter(
        Scene.project_id == project_id,
        or_(Scene.status == 'unplanned', Scene.status == None)
    ).all()
    
    if not unplanned_scenes:
        return {
            "success": True,
            "message": "No unplanned scenes to schedule",
            "scheduled_count": 0,
            "conflicts": []
        }
    
    # Get actor availability
    actors = db.query(ActorAvailability).filter(
        ActorAvailability.project_id == project_id
    ).all()
    
    # Get actor billing info from global costs
    global_costs = db.query(GlobalCost).filter(
        GlobalCost.category == 'actor'
    ).all()
    
    # Configure engine
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
    
    # Save to database
    scheduled_count = 0
    for schedule_item in result['schedule']:
        scene = db.query(Scene).filter(Scene.id == schedule_item['scene_id']).first()
        if scene:
            scene.scheduled_date = schedule_item['scheduled_date']
            scene.status = 'planned'
            
            # Add weather note
            if schedule_item.get('weather_note'):
                existing_notes = scene.notes or ''
                scene.notes = f"{existing_notes}\n[Weather]: {schedule_item['weather_note']}".strip()
            
            scheduled_count += 1
    
    db.commit()
    
    return {
        "success": True,
        "message": f"Successfully scheduled {scheduled_count} scenes using {request.optimization_mode} mode",
        "scheduled_count": scheduled_count,
        "total_days": result['total_days'],
        "completion_date": result['completion_date'],
        "conflicts": result.get('conflicts', []),
        "optimization_summary": {
            "mode": request.optimization_mode,
            "scenes_per_day": config['scenes_per_day'],
            "skip_weekends": request.skip_weekends
        }
    }


@router.post("/projects/{project_id}/schedule/reschedule")
def reschedule_scene(project_id: int, request: RescheduleRequest, db: Session = Depends(get_db)):
    """
    Reschedule a single scene with optional auto-cascade
    """
    
    # Get scene
    scene = db.query(Scene).filter(
        Scene.id == request.scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    old_date = scene.scheduled_date
    
    # Get all scenes for cascade
    all_scenes = db.query(Scene).filter(Scene.project_id == project_id).all()
    actors = db.query(ActorAvailability).filter(ActorAvailability.project_id == project_id).all()
    global_costs = db.query(GlobalCost).filter(GlobalCost.category == 'actor').all()
    
    # Create current schedule
    current_schedule = []
    for s in all_scenes:
        if s.scheduled_date:
            current_schedule.append({
                'scene_id': s.id,
                'scene_number': s.scene_number,
                'scheduled_date': s.scheduled_date,
                'location': s.location_name if hasattr(s, 'location_name') else None
            })
    
    # Initialize engine for cascade
    config = {'auto_cascade': request.auto_cascade}
    engine = SchedulingEngine(all_scenes, actors, config, global_costs)
    
    # Perform reschedule
    result = engine.reschedule_scene(
        scene_id=request.scene_id,
        new_date=request.new_date,
        current_schedule=current_schedule
    )
    
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    
    # Update database
    for schedule_item in result['updated_schedule']:
        db_scene = db.query(Scene).filter(Scene.id == schedule_item['scene_id']).first()
        if db_scene:
            db_scene.scheduled_date = schedule_item['scheduled_date']
            
            # Add reason to notes
            if request.reason and db_scene.id == request.scene_id:
                existing_notes = db_scene.notes or ''
                db_scene.notes = f"{existing_notes}\n[Rescheduled]: {request.reason}".strip()
    
    db.commit()
    
    return {
        "success": True,
        "message": result['message'],
        "old_date": old_date,
        "new_date": request.new_date,
        "affected_scenes": result.get('affected_scenes', []),
        "cascade_enabled": request.auto_cascade
    }


@router.get("/projects/{project_id}/schedule/optimization-preview")
def get_optimization_preview(project_id: int, mode: str = "balanced", db: Session = Depends(get_db)):
    """
    Preview what auto-schedule would do WITHOUT applying changes
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
    
    # Get actors and costs
    actors = db.query(ActorAvailability).filter(ActorAvailability.project_id == project_id).all()
    global_costs = db.query(GlobalCost).filter(GlobalCost.category == 'actor').all()
    
    # Configure engine
    config = {'skip_weekends': True, 'scenes_per_day': 5}
    engine = SchedulingEngine(unplanned_scenes, actors, config, global_costs)
    
    # Calculate preview (no DB changes)
    start_date = datetime.now()
    end_date = start_date + timedelta(days=365)
    
    result = engine.schedule_scenes(start_date, end_date, mode)
    
    return {
        "mode": mode,
        "total_scenes": len(unplanned_scenes),
        "estimated_days": result['total_days'],
        "completion_date": result['completion_date'],
        "potential_conflicts": len(result['conflicts']),
        "conflicts_preview": result['conflicts'][:5]
    }


@router.put("/projects/{project_id}/scenes/{scene_id}/schedule")
def update_scene_schedule(
    project_id: int,
    scene_id: int,
    scheduled_date: datetime,
    db: Session = Depends(get_db)
):
    """Simple endpoint to update a scene's scheduled date"""
    
    scene = db.query(Scene).filter(
        Scene.id == scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene.scheduled_date = scheduled_date
    scene.status = 'planned'
    
    db.commit()
    db.refresh(scene)
    
    return {
        "success": True,
        "scene_id": scene.id,
        "scheduled_date": scene.scheduled_date,
        "status": scene.status
    }


@router.delete("/projects/{project_id}/scenes/{scene_id}/schedule")
def remove_scene_from_schedule(project_id: int, scene_id: int, db: Session = Depends(get_db)):
    """Remove a scene from schedule (mark as unplanned)"""
    
    scene = db.query(Scene).filter(
        Scene.id == scene_id,
        Scene.project_id == project_id
    ).first()
    
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene.status = 'unplanned'
    scene.scheduled_date = None
    
    db.commit()
    
    return {
        "success": True,
        "message": "Scene removed from schedule",
        "scene_id": scene_id
    }
