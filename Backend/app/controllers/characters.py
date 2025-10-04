from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.database_service import ActorService
from app.models import ProjectActor, Actor
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/characters", tags=["characters"])

class CharacterCreate(BaseModel):
    actor_id: Optional[int] = None
    character_name: str
    role_type: str = "supporting"  # main, supporting, background
    agreed_rate: Optional[float] = None

class CharacterResponse(BaseModel):
    id: int
    project_id: int
    actor_id: Optional[int]
    character_name: str
    role_type: str
    agreed_rate: Optional[float]
    actor_name: Optional[str] = None
    actor_contact_email: Optional[str] = None
    actor_daily_rate: Optional[float] = None
    
    class Config:
        from_attributes = True

@router.post("/projects/{project_id}/characters", response_model=CharacterResponse)
async def create_character(
    project_id: int,
    character_data: CharacterCreate,
    db: Session = Depends(get_db)
):
    """Assign a character to a project."""
    service = ActorService(db)
    
    if character_data.actor_id:
        # Assign existing actor to character
        project_actor = service.assign_actor_to_project(
            project_id=project_id,
            actor_id=character_data.actor_id,
            character_name=character_data.character_name,
            role_type=character_data.role_type
        )
        if character_data.agreed_rate:
            project_actor.agreed_rate = character_data.agreed_rate
            db.commit()
            db.refresh(project_actor)
        
        # Get actor details for response
        actor = db.query(Actor).filter(Actor.id == character_data.actor_id).first()
        return CharacterResponse(
            id=project_actor.id,
            project_id=project_actor.project_id,
            actor_id=project_actor.actor_id,
            character_name=project_actor.character_name,
            role_type=project_actor.role_type,
            agreed_rate=project_actor.agreed_rate,
            actor_name=actor.name if actor else None,
            actor_contact_email=actor.contact_email if actor else None,
            actor_daily_rate=actor.daily_rate if actor else None
        )
    else:
        # Create character without actor assignment
        project_actor = ProjectActor(
            project_id=project_id,
            character_name=character_data.character_name,
            role_type=character_data.role_type,
            agreed_rate=character_data.agreed_rate
        )
        db.add(project_actor)
        db.commit()
        db.refresh(project_actor)
        
        return CharacterResponse(
            id=project_actor.id,
            project_id=project_actor.project_id,
            actor_id=None,
            character_name=project_actor.character_name,
            role_type=project_actor.role_type,
            agreed_rate=project_actor.agreed_rate
        )

@router.get("/projects/{project_id}/characters", response_model=List[CharacterResponse])
async def get_project_characters(project_id: int, db: Session = Depends(get_db)):
    """Get all characters for a project."""
    project_actors = db.query(ProjectActor).filter(ProjectActor.project_id == project_id).all()
    
    result = []
    for pa in project_actors:
        actor = None
        if pa.actor_id:
            actor = db.query(Actor).filter(Actor.id == pa.actor_id).first()
        
        result.append(CharacterResponse(
            id=pa.id,
            project_id=pa.project_id,
            actor_id=pa.actor_id,
            character_name=pa.character_name,
            role_type=pa.role_type,
            agreed_rate=pa.agreed_rate,
            actor_name=actor.name if actor else None,
            actor_contact_email=actor.contact_email if actor else None,
            actor_daily_rate=actor.daily_rate if actor else None
        ))
    
    return result

@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: int,
    character_data: CharacterCreate,
    db: Session = Depends(get_db)
):
    """Update character information."""
    project_actor = db.query(ProjectActor).filter(ProjectActor.id == character_id).first()
    if not project_actor:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Update fields
    project_actor.actor_id = character_data.actor_id
    project_actor.character_name = character_data.character_name
    project_actor.role_type = character_data.role_type
    project_actor.agreed_rate = character_data.agreed_rate
    
    db.commit()
    db.refresh(project_actor)
    
    # Get actor details for response
    actor = None
    if project_actor.actor_id:
        actor = db.query(Actor).filter(Actor.id == project_actor.actor_id).first()
    
    return CharacterResponse(
        id=project_actor.id,
        project_id=project_actor.project_id,
        actor_id=project_actor.actor_id,
        character_name=project_actor.character_name,
        role_type=project_actor.role_type,
        agreed_rate=project_actor.agreed_rate,
        actor_name=actor.name if actor else None,
        actor_contact_email=actor.contact_email if actor else None,
        actor_daily_rate=actor.daily_rate if actor else None
    )

@router.delete("/{character_id}")
async def delete_character(character_id: int, db: Session = Depends(get_db)):
    """Remove character from project."""
    project_actor = db.query(ProjectActor).filter(ProjectActor.id == character_id).first()
    if not project_actor:
        raise HTTPException(status_code=404, detail="Character not found")
    
    db.delete(project_actor)
    db.commit()
    return {"message": "Character removed from project successfully"}