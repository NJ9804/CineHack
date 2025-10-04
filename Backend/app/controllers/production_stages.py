from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.config.database import get_db
from app.models import ProductionStage, ProductionSubStage, ProductionTask, Project

router = APIRouter()

# Pydantic models for request/response
class ProductionTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    tags: Optional[List[str]] = None
    checklist: Optional[List[dict]] = None
    notes: Optional[str] = None

class ProductionTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    tags: Optional[List[str]] = None
    checklist: Optional[List[dict]] = None
    notes: Optional[str] = None

class ProductionSubStageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    order: int
    priority: str = "medium"
    assigned_to: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[int] = None
    dependencies: Optional[List[int]] = None
    deliverables: Optional[List[str]] = None
    notes: Optional[str] = None

class ProductionSubStageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None
    dependencies: Optional[List[int]] = None
    deliverables: Optional[List[str]] = None
    notes: Optional[str] = None

class ProductionStageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    order: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_duration_days: Optional[int] = None
    budget_allocated: Optional[float] = 0.0
    notes: Optional[str] = None

class ProductionStageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_duration_days: Optional[int] = None
    actual_duration_days: Optional[int] = None
    budget_allocated: Optional[float] = None
    budget_spent: Optional[float] = None
    notes: Optional[str] = None


# Default film production stages template
DEFAULT_PRODUCTION_STAGES = [
    {
        "name": "Development",
        "description": "Script development, concept refinement, and initial planning",
        "order": 1,
        "sub_stages": [
            {"name": "Concept Development", "order": 1, "deliverables": ["Concept document", "Pitch deck"]},
            {"name": "Script Writing", "order": 2, "deliverables": ["First draft", "Final script"]},
            {"name": "Script Analysis", "order": 3, "deliverables": ["Scene breakdown", "Character analysis"]},
            {"name": "Budget Estimation", "order": 4, "deliverables": ["Preliminary budget", "Funding plan"]},
            {"name": "Rights & Legal", "order": 5, "deliverables": ["Option agreements", "Chain of title"]},
        ]
    },
    {
        "name": "Pre-Production",
        "description": "Detailed planning and preparation before filming begins",
        "order": 2,
        "sub_stages": [
            {"name": "Casting", "order": 1, "deliverables": ["Cast list", "Signed contracts"]},
            {"name": "Location Scouting", "order": 2, "deliverables": ["Location photos", "Permits"]},
            {"name": "Production Design", "order": 3, "deliverables": ["Set designs", "Props list"]},
            {"name": "Storyboarding", "order": 4, "deliverables": ["Storyboards", "Shot list"]},
            {"name": "Scheduling", "order": 5, "deliverables": ["Shooting schedule", "Call sheets"]},
            {"name": "Crew Hiring", "order": 6, "deliverables": ["Crew list", "Department heads"]},
            {"name": "Equipment Rental", "order": 7, "deliverables": ["Equipment list", "Rental agreements"]},
            {"name": "Rehearsals", "order": 8, "deliverables": ["Rehearsal notes", "Scene blocking"]},
        ]
    },
    {
        "name": "Production",
        "description": "Principal photography and filming",
        "order": 3,
        "sub_stages": [
            {"name": "Principal Photography", "order": 1, "deliverables": ["Daily footage", "Script supervisor notes"]},
            {"name": "B-Roll & Inserts", "order": 2, "deliverables": ["Additional footage", "Cutaways"]},
            {"name": "Sound Recording", "order": 3, "deliverables": ["Production audio", "ADR list"]},
            {"name": "Daily Rushes", "order": 4, "deliverables": ["Dailies review", "Notes"]},
            {"name": "Continuity", "order": 5, "deliverables": ["Continuity photos", "Reports"]},
        ]
    },
    {
        "name": "Post-Production",
        "description": "Editing, VFX, sound design, and final output",
        "order": 4,
        "sub_stages": [
            {"name": "Footage Organization", "order": 1, "deliverables": ["Organized media", "Backups"]},
            {"name": "Rough Cut", "order": 2, "deliverables": ["Assembly edit", "Rough cut"]},
            {"name": "Fine Cut", "order": 3, "deliverables": ["Fine cut", "Director's cut"]},
            {"name": "VFX & CGI", "order": 4, "deliverables": ["VFX shots", "Composited scenes"]},
            {"name": "Color Grading", "order": 5, "deliverables": ["Color-graded footage", "LUTs"]},
            {"name": "Sound Design", "order": 6, "deliverables": ["Sound effects", "Foley"]},
            {"name": "Music Composition", "order": 7, "deliverables": ["Score", "Music cues"]},
            {"name": "Sound Mixing", "order": 8, "deliverables": ["Mixed audio", "Stems"]},
            {"name": "Final Master", "order": 9, "deliverables": ["DCP", "Digital master"]},
        ]
    },
    {
        "name": "Distribution",
        "description": "Marketing, distribution, and release",
        "order": 5,
        "sub_stages": [
            {"name": "Marketing Strategy", "order": 1, "deliverables": ["Marketing plan", "Promotional materials"]},
            {"name": "Festival Submissions", "order": 2, "deliverables": ["Festival packages", "Screeners"]},
            {"name": "Distribution Deals", "order": 3, "deliverables": ["Distribution agreements", "Release schedule"]},
            {"name": "Premiere & Screenings", "order": 4, "deliverables": ["Premiere event", "Press coverage"]},
            {"name": "Digital Release", "order": 5, "deliverables": ["Platform uploads", "Metadata"]},
        ]
    }
]


@router.post("/projects/{project_id}/production-stages/initialize")
def initialize_production_stages(project_id: int, db: Session = Depends(get_db)):
    """Initialize default production stages for a project"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if stages already exist
    existing_stages = db.query(ProductionStage).filter(ProductionStage.project_id == project_id).count()
    if existing_stages > 0:
        raise HTTPException(status_code=400, detail="Production stages already initialized for this project")
    
    # Create stages and substages
    created_stages = []
    for stage_template in DEFAULT_PRODUCTION_STAGES:
        stage = ProductionStage(
            project_id=project_id,
            name=stage_template["name"],
            description=stage_template["description"],
            order=stage_template["order"],
            status="not_started",
            progress=0
        )
        db.add(stage)
        db.flush()  # Get the stage ID
        
        # Create sub-stages
        for sub_template in stage_template.get("sub_stages", []):
            sub_stage = ProductionSubStage(
                stage_id=stage.id,
                name=sub_template["name"],
                order=sub_template["order"],
                status="not_started",
                progress=0,
                deliverables=sub_template.get("deliverables", [])
            )
            db.add(sub_stage)
        
        created_stages.append(stage)
    
    db.commit()
    
    return {"message": "Production stages initialized successfully", "stages_count": len(created_stages)}


@router.get("/projects/{project_id}/production-stages")
def get_production_stages(project_id: int, db: Session = Depends(get_db)):
    """Get all production stages for a project with sub-stages and tasks"""
    
    stages = db.query(ProductionStage).filter(
        ProductionStage.project_id == project_id
    ).order_by(ProductionStage.order).all()
    
    result = []
    for stage in stages:
        # Get sub-stages
        sub_stages = db.query(ProductionSubStage).filter(
            ProductionSubStage.stage_id == stage.id
        ).order_by(ProductionSubStage.order).all()
        
        # Get tasks
        tasks = db.query(ProductionTask).filter(
            ProductionTask.stage_id == stage.id
        ).all()
        
        stage_dict = {
            "id": stage.id,
            "project_id": stage.project_id,
            "name": stage.name,
            "description": stage.description,
            "order": stage.order,
            "status": stage.status,
            "progress": stage.progress,
            "start_date": stage.start_date,
            "end_date": stage.end_date,
            "estimated_duration_days": stage.estimated_duration_days,
            "actual_duration_days": stage.actual_duration_days,
            "budget_allocated": stage.budget_allocated,
            "budget_spent": stage.budget_spent,
            "notes": stage.notes,
            "created_at": stage.created_at,
            "updated_at": stage.updated_at,
            "sub_stages": [
                {
                    "id": ss.id,
                    "stage_id": ss.stage_id,
                    "name": ss.name,
                    "description": ss.description,
                    "order": ss.order,
                    "status": ss.status,
                    "progress": ss.progress,
                    "priority": ss.priority,
                    "assigned_to": ss.assigned_to,
                    "start_date": ss.start_date,
                    "end_date": ss.end_date,
                    "estimated_hours": ss.estimated_hours,
                    "actual_hours": ss.actual_hours,
                    "dependencies": ss.dependencies,
                    "deliverables": ss.deliverables,
                    "notes": ss.notes,
                    "created_at": ss.created_at,
                    "updated_at": ss.updated_at,
                    "tasks": [
                        {
                            "id": t.id,
                            "title": t.title,
                            "description": t.description,
                            "status": t.status,
                            "priority": t.priority,
                            "assigned_to": t.assigned_to,
                            "due_date": t.due_date,
                            "completed_date": t.completed_date,
                            "estimated_hours": t.estimated_hours,
                            "actual_hours": t.actual_hours,
                            "tags": t.tags,
                            "checklist": t.checklist,
                            "notes": t.notes,
                        }
                        for t in db.query(ProductionTask).filter(
                            ProductionTask.sub_stage_id == ss.id
                        ).all()
                    ]
                }
                for ss in sub_stages
            ],
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "status": t.status,
                    "priority": t.priority,
                    "assigned_to": t.assigned_to,
                    "due_date": t.due_date,
                    "completed_date": t.completed_date,
                    "estimated_hours": t.estimated_hours,
                    "actual_hours": t.actual_hours,
                    "tags": t.tags,
                    "checklist": t.checklist,
                    "notes": t.notes,
                }
                for t in tasks if t.sub_stage_id is None
            ]
        }
        
        result.append(stage_dict)
    
    return result


@router.post("/projects/{project_id}/production-stages")
def create_production_stage(
    project_id: int,
    stage_data: ProductionStageCreate,
    db: Session = Depends(get_db)
):
    """Create a new production stage"""
    
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    stage = ProductionStage(
        project_id=project_id,
        **stage_data.model_dump()
    )
    
    db.add(stage)
    db.commit()
    db.refresh(stage)
    
    return stage


@router.put("/production-stages/{stage_id}")
def update_production_stage(
    stage_id: int,
    stage_data: ProductionStageUpdate,
    db: Session = Depends(get_db)
):
    """Update a production stage"""
    
    stage = db.query(ProductionStage).filter(ProductionStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Production stage not found")
    
    update_data = stage_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(stage, key, value)
    
    db.commit()
    db.refresh(stage)
    
    return stage


@router.delete("/production-stages/{stage_id}")
def delete_production_stage(stage_id: int, db: Session = Depends(get_db)):
    """Delete a production stage"""
    
    stage = db.query(ProductionStage).filter(ProductionStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Production stage not found")
    
    db.delete(stage)
    db.commit()
    
    return {"message": "Production stage deleted successfully"}


@router.post("/production-stages/{stage_id}/sub-stages")
def create_sub_stage(
    stage_id: int,
    sub_stage_data: ProductionSubStageCreate,
    db: Session = Depends(get_db)
):
    """Create a new sub-stage"""
    
    # Check if stage exists
    stage = db.query(ProductionStage).filter(ProductionStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Production stage not found")
    
    sub_stage = ProductionSubStage(
        stage_id=stage_id,
        **sub_stage_data.model_dump()
    )
    
    db.add(sub_stage)
    db.commit()
    db.refresh(sub_stage)
    
    return sub_stage


@router.put("/production-substages/{substage_id}")
def update_sub_stage(
    substage_id: int,
    sub_stage_data: ProductionSubStageUpdate,
    db: Session = Depends(get_db)
):
    """Update a sub-stage"""
    
    sub_stage = db.query(ProductionSubStage).filter(ProductionSubStage.id == substage_id).first()
    if not sub_stage:
        raise HTTPException(status_code=404, detail="Sub-stage not found")
    
    update_data = sub_stage_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(sub_stage, key, value)
    
    db.commit()
    db.refresh(sub_stage)
    
    return sub_stage


@router.delete("/production-substages/{substage_id}")
def delete_sub_stage(substage_id: int, db: Session = Depends(get_db)):
    """Delete a sub-stage"""
    
    sub_stage = db.query(ProductionSubStage).filter(ProductionSubStage.id == substage_id).first()
    if not sub_stage:
        raise HTTPException(status_code=404, detail="Sub-stage not found")
    
    db.delete(sub_stage)
    db.commit()
    
    return {"message": "Sub-stage deleted successfully"}


@router.post("/production-stages/{stage_id}/tasks")
def create_task(
    stage_id: int,
    task_data: ProductionTaskCreate,
    sub_stage_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Create a new task for a stage or sub-stage"""
    
    # Check if stage exists
    stage = db.query(ProductionStage).filter(ProductionStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail="Production stage not found")
    
    if sub_stage_id:
        # Verify sub-stage exists and belongs to this stage
        sub_stage = db.query(ProductionSubStage).filter(
            ProductionSubStage.id == sub_stage_id,
            ProductionSubStage.stage_id == stage_id
        ).first()
        if not sub_stage:
            raise HTTPException(status_code=404, detail="Sub-stage not found or doesn't belong to this stage")
    
    task = ProductionTask(
        stage_id=stage_id,
        sub_stage_id=sub_stage_id,
        **task_data.model_dump()
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task


@router.put("/production-tasks/{task_id}")
def update_task(
    task_id: int,
    task_data: ProductionTaskUpdate,
    db: Session = Depends(get_db)
):
    """Update a task"""
    
    task = db.query(ProductionTask).filter(ProductionTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_data.model_dump(exclude_unset=True)
    
    # Auto-set completed_date if status is being set to completed
    if update_data.get("status") == "completed" and not task.completed_date:
        update_data["completed_date"] = datetime.now()
    
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/production-tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    
    task = db.query(ProductionTask).filter(ProductionTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}


@router.get("/projects/{project_id}/production-overview")
def get_production_overview(project_id: int, db: Session = Depends(get_db)):
    """Get a high-level overview of production progress"""
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    stages = db.query(ProductionStage).filter(
        ProductionStage.project_id == project_id
    ).order_by(ProductionStage.order).all()
    
    total_stages = len(stages)
    completed_stages = sum(1 for s in stages if s.status == "completed")
    in_progress_stages = sum(1 for s in stages if s.status == "in_progress")
    overall_progress = sum(s.progress for s in stages) / total_stages if total_stages > 0 else 0
    
    # Calculate budget overview
    total_budget_allocated = sum(s.budget_allocated or 0 for s in stages)
    total_budget_spent = sum(s.budget_spent or 0 for s in stages)
    
    # Get all tasks
    all_tasks = db.query(ProductionTask).join(ProductionStage).filter(
        ProductionStage.project_id == project_id
    ).all()
    
    total_tasks = len(all_tasks)
    completed_tasks = sum(1 for t in all_tasks if t.status == "completed")
    blocked_tasks = sum(1 for t in all_tasks if t.status == "blocked")
    
    return {
        "project_id": project_id,
        "project_name": project.name,
        "overall_progress": round(overall_progress, 1),
        "stages": {
            "total": total_stages,
            "completed": completed_stages,
            "in_progress": in_progress_stages,
            "not_started": total_stages - completed_stages - in_progress_stages
        },
        "tasks": {
            "total": total_tasks,
            "completed": completed_tasks,
            "in_progress": sum(1 for t in all_tasks if t.status == "in_progress"),
            "blocked": blocked_tasks,
            "completion_rate": round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1)
        },
        "budget": {
            "allocated": total_budget_allocated,
            "spent": total_budget_spent,
            "remaining": total_budget_allocated - total_budget_spent,
            "utilization_rate": round((total_budget_spent / total_budget_allocated * 100) if total_budget_allocated > 0 else 0, 1)
        },
        "current_stage": next((s.name for s in stages if s.status == "in_progress"), None)
    }
