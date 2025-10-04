from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.database_service import SceneService
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/scenes", tags=["scenes"])

class SceneCreate(BaseModel):
    scene_number: str
    scene_heading: Optional[str] = None
    location_name: str
    location_type: Optional[str] = "indoor"
    time_of_day: Optional[str] = "day"
    estimated_duration: Optional[str] = None
    actors_data: Optional[List[Dict[str, Any]]] = []
    props_data: Optional[List[str]] = []
    location_data: Optional[Dict[str, Any]] = {}
    crowd_data: Optional[Dict[str, Any]] = {}
    time_data: Optional[Dict[str, Any]] = {}
    technical_notes: Optional[str] = None

class SceneUpdate(BaseModel):
    scene_heading: Optional[str] = None
    location_name: Optional[str] = None
    location_type: Optional[str] = None
    time_of_day: Optional[str] = None
    status: Optional[str] = None
    estimated_duration: Optional[str] = None
    actors_data: Optional[List[Dict[str, Any]]] = None
    props_data: Optional[List[str]] = None
    technical_notes: Optional[str] = None

class SceneResponse(BaseModel):
    id: int
    project_id: int
    scene_number: str
    scene_heading: Optional[str]
    location_name: str
    location_type: Optional[str]
    time_of_day: Optional[str]
    estimated_duration: Optional[str]
    status: str
    actors_data: Optional[List[Dict[str, Any]]]
    props_data: Optional[List[str]]
    location_data: Optional[Dict[str, Any]]
    crowd_data: Optional[Dict[str, Any]]
    time_data: Optional[Dict[str, Any]]
    technical_notes: Optional[str]
    estimated_cost: Optional[float] = None
    actual_cost: Optional[float] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    estimated_cost: float
    actual_cost: float
    
    class Config:
        from_attributes = True

@router.post("/projects/{project_id}/scenes", response_model=SceneResponse)
async def create_scene(
    project_id: int,
    scene_data: SceneCreate,
    db: Session = Depends(get_db)
):
    """Create a new scene for a project."""
    from app.models import Scene
    
    scene = Scene(
        project_id=project_id,
        **scene_data.dict()
    )
    
    db.add(scene)
    db.commit()
    db.refresh(scene)
    return scene

@router.get("/projects/{project_id}/scenes", response_model=List[SceneResponse])
async def get_project_scenes(project_id: int, db: Session = Depends(get_db)):
    """Get all scenes for a project with full details."""
    service = SceneService(db)
    scenes = service.get_project_scenes(project_id)
    
    # Return full scene details
    return [
        SceneResponse(
            id=scene.id,
            project_id=scene.project_id,
            scene_number=scene.scene_number or f"Scene {scene.id}",
            scene_heading=scene.scene_heading,
            location_name=scene.location_name or "Unknown Location",
            location_type=scene.location_type,
            time_of_day=scene.time_of_day,
            estimated_duration=scene.estimated_duration,
            status=scene.status,
            actors_data=scene.actors_data or [],
            props_data=scene.props_data or [],
            location_data=scene.location_data or {},
            crowd_data=scene.crowd_data or {},
            time_data=scene.time_data or {},
            technical_notes=scene.technical_notes,
            estimated_cost=scene.estimated_cost or 0.0,
            actual_cost=scene.actual_cost or 0.0,
            created_at=scene.created_at.isoformat() if scene.created_at else None,
            updated_at=scene.updated_at.isoformat() if scene.updated_at else None
        ) for scene in scenes
    ]

@router.get("/{scene_id}", response_model=SceneResponse)
async def get_scene(scene_id: int, db: Session = Depends(get_db)):
    """Get scene by ID."""
    from app.models import Scene
    
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    return scene

@router.put("/{scene_id}", response_model=SceneResponse)
async def update_scene(
    scene_id: int,
    scene_data: SceneUpdate,
    db: Session = Depends(get_db)
):
    """Update scene information."""
    from app.models import Scene
    
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Update only provided fields
    for field, value in scene_data.dict(exclude_unset=True).items():
        setattr(scene, field, value)
    
    db.commit()
    db.refresh(scene)
    return scene

@router.delete("/{scene_id}")
async def delete_scene(scene_id: int, db: Session = Depends(get_db)):
    """Delete a scene."""
    from app.models import Scene
    
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    db.delete(scene)
    db.commit()
    return {"message": "Scene deleted successfully"}