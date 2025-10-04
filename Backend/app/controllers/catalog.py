from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.database_service import ActorService, LocationService, PropService
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/catalog", tags=["catalog"])

# Actor models
class ActorCreate(BaseModel):
    name: str
    description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    daily_rate: float = 0.0
    transport_cost: float = 0.0
    accommodation_cost: float = 0.0
    notes: Optional[str] = None

class ActorResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    daily_rate: float
    transport_cost: float
    accommodation_cost: float
    is_available: bool
    notes: Optional[str]
    
    class Config:
        from_attributes = True

# Location models  
class LocationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    location_type: str = "indoor"
    coordinates: Optional[Dict[str, float]] = None
    daily_rate: float = 0.0
    capacity: int = 0
    amenities: List[str] = []
    availability: str = "available"
    photo_url: Optional[str] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    weather_dependent: bool = False
    notes: Optional[str] = None

class LocationResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    address: Optional[str]
    location_type: str
    coordinates: Optional[Dict[str, float]]
    daily_rate: float
    capacity: int
    amenities: List[str]
    availability: str
    photo_url: Optional[str]
    contact_person: Optional[str]
    contact_phone: Optional[str]
    weather_dependent: bool
    notes: Optional[str]
    
    class Config:
        from_attributes = True

# Prop models
class PropCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "Other"
    quantity: int = 1
    unit_cost: float = 0.0
    daily_rate: float = 0.0
    purchase_cost: float = 0.0
    availability: str = "available"
    vendor_contact: Optional[str] = None
    notes: Optional[str] = None

class PropResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: str
    quantity: int
    unit_cost: float
    daily_rate: float
    purchase_cost: float
    availability: str
    vendor_contact: Optional[str]
    is_available: bool
    notes: Optional[str]
    
    class Config:
        from_attributes = True

# ACTOR ENDPOINTS
@router.post("/actors", response_model=ActorResponse)
async def create_actor(actor_data: ActorCreate, db: Session = Depends(get_db)):
    """Create a new actor in the catalog."""
    service = ActorService(db)
    actor = service.create_actor(**actor_data.dict())
    return actor

@router.get("/actors", response_model=List[ActorResponse])
async def get_all_actors(db: Session = Depends(get_db)):
    """Get all actors from catalog."""
    service = ActorService(db)
    actors = service.get_all_actors()
    return actors

@router.get("/actors/{actor_id}", response_model=ActorResponse)
async def get_actor(actor_id: int, db: Session = Depends(get_db)):
    """Get specific actor by ID."""
    service = ActorService(db)
    actor = service.get_actor(actor_id)
    if not actor:
        raise HTTPException(status_code=404, detail="Actor not found")
    return actor

@router.put("/actors/{actor_id}", response_model=ActorResponse)
async def update_actor(actor_id: int, actor_data: ActorCreate, db: Session = Depends(get_db)):
    """Update an existing actor."""
    service = ActorService(db)
    actor = service.update_actor(actor_id, **actor_data.dict())
    if not actor:
        raise HTTPException(status_code=404, detail="Actor not found")
    return actor

@router.delete("/actors/{actor_id}")
async def delete_actor(actor_id: int, db: Session = Depends(get_db)):
    """Delete an actor from catalog."""
    service = ActorService(db)
    success = service.delete_actor(actor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Actor not found")
    return {"message": "Actor deleted successfully"}

# LOCATION ENDPOINTS
@router.post("/locations", response_model=LocationResponse)
async def create_location(location_data: LocationCreate, db: Session = Depends(get_db)):
    """Create a new location in the catalog."""
    service = LocationService(db)
    location = service.create_location(**location_data.dict())
    return location

@router.get("/locations", response_model=List[LocationResponse])
async def get_all_locations(db: Session = Depends(get_db)):
    """Get all locations from catalog."""
    service = LocationService(db)
    locations = service.get_all_locations()
    return locations

@router.get("/locations/{location_id}", response_model=LocationResponse)
async def get_location(location_id: int, db: Session = Depends(get_db)):
    """Get specific location by ID."""
    service = LocationService(db)
    location = service.get_location(location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.put("/locations/{location_id}", response_model=LocationResponse)
async def update_location(location_id: int, location_data: LocationCreate, db: Session = Depends(get_db)):
    """Update an existing location."""
    service = LocationService(db)
    location = service.update_location(location_id, **location_data.dict())
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.delete("/locations/{location_id}")
async def delete_location(location_id: int, db: Session = Depends(get_db)):
    """Delete a location from catalog."""
    service = LocationService(db)
    success = service.delete_location(location_id)
    if not success:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}

# PROP ENDPOINTS
@router.post("/props", response_model=PropResponse)
async def create_prop(prop_data: PropCreate, db: Session = Depends(get_db)):
    """Create a new prop in the catalog."""
    service = PropService(db)
    prop = service.create_prop(**prop_data.dict())
    return prop

@router.get("/props", response_model=List[PropResponse])
async def get_all_props(db: Session = Depends(get_db)):
    """Get all props from catalog."""
    service = PropService(db)
    props = service.get_all_props()
    return props

@router.get("/props/{prop_id}", response_model=PropResponse)
async def get_prop(prop_id: int, db: Session = Depends(get_db)):
    """Get specific prop by ID."""
    service = PropService(db)
    prop = service.get_prop(prop_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Prop not found")
    return prop

@router.put("/props/{prop_id}", response_model=PropResponse)
async def update_prop(prop_id: int, prop_data: PropCreate, db: Session = Depends(get_db)):
    """Update an existing prop."""
    service = PropService(db)
    prop = service.update_prop(prop_id, **prop_data.dict())
    if not prop:
        raise HTTPException(status_code=404, detail="Prop not found")
    return prop

@router.delete("/props/{prop_id}")
async def delete_prop(prop_id: int, db: Session = Depends(get_db)):
    """Delete a prop from catalog."""
    service = PropService(db)
    success = service.delete_prop(prop_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prop not found")
    return {"message": "Prop deleted successfully"}

# PROJECT-SPECIFIC CATALOG ANALYSIS
@router.get("/projects/{project_id}/used-items")
async def get_project_used_items(project_id: int, db: Session = Depends(get_db)):
    """Get all actors, props, and locations used in this project's scenes."""
    from app.services.database_service import SceneService
    
    scene_service = SceneService(db)
    scenes = scene_service.get_project_scenes(project_id)
    
    used_actors = set()
    used_props = set()
    used_locations = set()
    
    for scene in scenes:
        # Extract used actors
        if scene.actors_data:
            for actor in scene.actors_data:
                if actor.get("name"):
                    used_actors.add(actor["name"])
        
        # Extract used props
        if scene.props_data:
            for prop in scene.props_data:
                if isinstance(prop, str):
                    used_props.add(prop)
                elif isinstance(prop, dict) and prop.get("name"):
                    used_props.add(prop["name"])
        
        # Extract used locations
        if scene.location_name:
            used_locations.add(scene.location_name)
    
    return {
        "project_id": project_id,
        "used_actors": list(used_actors),
        "used_props": list(used_props), 
        "used_locations": list(used_locations),
        "total_scenes": len(scenes)
    }