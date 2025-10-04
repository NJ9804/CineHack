from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.database_service import ProjectService, SceneService
from app.services.llm_service import LLMService
from app.models import Project
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/projects", tags=["projects"])

# Pydantic models for request/response
class ProjectCreate(BaseModel):
    title: str
    synopsis: str = None
    start_date: str = None
    end_date: str = None
    budget_total: float = 0.0
    currency: str = "INR"
    language: str = "en"
    genre: str = "Drama"

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str = None
    status: str
    budget_total: float
    budget_used: float
    created_at: str
    
    class Config:
        from_attributes = True

@router.post("", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    service = ProjectService(db)
    project = service.create_project(
        name=project_data.title,
        description=project_data.synopsis
    )
    # Update budget if provided
    if project_data.budget_total > 0:
        project.budget_total = project_data.budget_total
        db.commit()
        db.refresh(project)
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        budget_total=project.budget_total,
        budget_used=project.budget_used,
        created_at=project.created_at.isoformat()
    )

@router.get("", response_model=List[ProjectResponse])
async def get_all_projects(db: Session = Depends(get_db)):
    """Get all projects."""
    service = ProjectService(db)
    projects = service.get_all_projects()
    return [
        ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            status=p.status,
            budget_total=p.budget_total,
            budget_used=p.budget_used,
            created_at=p.created_at.isoformat()
        ) for p in projects
    ]

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get project by ID."""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        budget_total=project.budget_total,
        budget_used=project.budget_used,
        created_at=project.created_at.isoformat()
    )

@router.post("/{project_id}/scripts")
async def upload_project_script(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload and analyze a script for a project."""
    try:
        # Check if project exists
        service = ProjectService(db)
        project = service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.txt', '.doc', '.docx')):
            raise HTTPException(status_code=400, detail="Only PDF, TXT, DOC, and DOCX files are supported")
        
        # Use the existing script analysis logic
        from app.controllers.scripts import analyze_script
        result = await analyze_script(file, project_id, db)
        
        # Update project status to indicate script has been uploaded
        project.status = "pre_production"
        db.commit()
        
        return {
            "success": True,
            "message": "Script uploaded and analyzed successfully",
            "project_id": project_id,
            "analysis": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading script: {str(e)}")

@router.get("/{project_id}/scripts")
async def get_project_scripts(project_id: int, db: Session = Depends(get_db)):
    """Get all scripts and their analysis status for a project."""
    try:
        # Check if project exists
        service = ProjectService(db)
        project = service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get script analyses for this project
        from app.services.database_service import ScriptAnalysisService
        analysis_service = ScriptAnalysisService(db)
        analyses = analysis_service.get_project_analyses(project_id)
        
        return {
            "project_id": project_id,
            "scripts": [
                {
                    "id": analysis.id,
                    "filename": analysis.filename,
                    "total_scenes": analysis.total_scenes,
                    "status": "completed" if analysis.scenes_data else "processing",
                    "created_at": analysis.created_at.isoformat(),
                    "summary": analysis.summary
                } for analysis in analyses
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching scripts: {str(e)}")

@router.get("/{project_id}/scripts/{script_id}/status")
async def get_script_parse_status(project_id: int, script_id: int, db: Session = Depends(get_db)):
    """Get the parsing status of a specific script."""
    try:
        # Check if project exists
        service = ProjectService(db)
        project = service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get specific script analysis
        from app.services.database_service import ScriptAnalysisService
        analysis_service = ScriptAnalysisService(db)
        analysis = analysis_service.get_analysis(script_id)
        
        if not analysis or analysis.project_id != project_id:
            raise HTTPException(status_code=404, detail="Script not found")
        
        return {
            "script_id": script_id,
            "project_id": project_id,
            "filename": analysis.filename,
            "status": "completed" if analysis.scenes_data else "processing",
            "total_scenes": analysis.total_scenes,
            "processing_info": analysis.processing_info,
            "created_at": analysis.created_at.isoformat(),
            "scenes": analysis.scenes_data if analysis.scenes_data else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching script status: {str(e)}")

@router.get("/{project_id}/dashboard")
async def get_project_dashboard(project_id: int, db: Session = Depends(get_db)):
    """Get project dashboard data with script analysis, scenes, and summary."""
    try:
        # Check if project exists
        service = ProjectService(db)
        project = service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get script analyses
        from app.services.database_service import ScriptAnalysisService, SceneService
        analysis_service = ScriptAnalysisService(db)
        scene_service = SceneService(db)
        
        analyses = analysis_service.get_project_analyses(project_id)
        scenes = scene_service.get_project_scenes(project_id)
        
        # Calculate summary statistics
        total_scenes = len(scenes)
        indoor_scenes = len([s for s in scenes if s.location_type == "indoor"])
        outdoor_scenes = len([s for s in scenes if s.location_type == "outdoor"])
        
        # Get unique locations and characters
        locations = list(set([s.location_name for s in scenes if s.location_name]))
        all_actors = []
        for scene in scenes:
            if scene.actors_data:
                for actor in scene.actors_data:
                    if actor.get("name"):
                        all_actors.append(actor["name"])
        unique_characters = list(set(all_actors))
        
        return {
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "status": project.status,
                "budget_total": project.budget_total,
                "budget_used": project.budget_used,
                "created_at": project.created_at.isoformat()
            },
            "scripts": [
                {
                    "id": analysis.id,
                    "filename": analysis.filename,
                    "total_scenes": analysis.total_scenes,
                    "created_at": analysis.created_at.isoformat(),
                    "summary": analysis.summary
                } for analysis in analyses
            ],
            "summary": {
                "total_scenes": total_scenes,
                "indoor_scenes": indoor_scenes,
                "outdoor_scenes": outdoor_scenes,
                "locations": locations,
                "characters": unique_characters,
                "has_script": len(analyses) > 0
            },
            "scenes": [
                {
                    "id": scene.id,
                    "scene_number": scene.scene_number,
                    "scene_heading": scene.scene_heading,
                    "location_name": scene.location_name,
                    "location_type": scene.location_type,
                    "time_of_day": scene.time_of_day,
                    "status": scene.status,
                    "estimated_cost": scene.estimated_cost
                } for scene in scenes[:10]  # Limit to first 10 scenes for dashboard
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching project dashboard: {str(e)}")

@router.get("/{project_id}/scenes")
async def get_project_scenes(project_id: int, db: Session = Depends(get_db)):
    """Get all scenes for a project."""
    service = SceneService(db)
    scenes = service.get_project_scenes(project_id)
    
    return [
        {
            "id": scene.id,
            "scene_number": scene.scene_number,
            "scene_heading": scene.scene_heading,
            "location_name": scene.location_name,
            "location_type": scene.location_type,
            "time_of_day": scene.time_of_day,
            "estimated_duration": scene.estimated_duration,
            "status": scene.status,
            "actors_data": scene.actors_data or [],
            "props_data": scene.props_data or [],
            "location_data": scene.location_data or {},
            "crowd_data": scene.crowd_data or {},
            "time_data": scene.time_data or {},
            "technical_notes": scene.technical_notes,
            "estimated_cost": scene.estimated_cost,
            "actual_cost": scene.actual_cost,
            "created_at": scene.created_at.isoformat() if scene.created_at else None
        } for scene in scenes
    ]