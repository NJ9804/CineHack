from sqlalchemy.orm import Session
from app.models import Project, Scene, Actor, ProjectActor, Location, Prop, BudgetLine, ScriptAnalysis
from typing import List, Optional
import json

class ProjectService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_project(self, name: str, description: str = None) -> Project:
        """Create a new project."""
        project = Project(name=name, description=description)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project
    
    def get_project(self, project_id: int) -> Optional[Project]:
        """Get project by ID."""
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def get_all_projects(self) -> List[Project]:
        """Get all projects."""
        return self.db.query(Project).all()
    
    def update_project_budget(self, project_id: int, budget_total: float) -> Project:
        """Update project budget."""
        project = self.get_project(project_id)
        if project:
            project.budget_total = budget_total
            self.db.commit()
            self.db.refresh(project)
        return project


class SceneService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_scenes_from_analysis(self, project_id: int, scenes_data: List[dict]) -> List[Scene]:
        """Create scenes from parsed script analysis."""
        scenes = []
        
        for scene_data in scenes_data:
            scene = Scene(
                project_id=project_id,
                scene_number=scene_data.get("scene_number", ""),
                scene_heading=scene_data.get("scene_heading", ""),
                location_name=scene_data.get("location", {}).get("name", ""),
                location_type=scene_data.get("location", {}).get("type", ""),
                time_of_day=scene_data.get("time", {}).get("time_of_day", ""),
                estimated_duration=scene_data.get("duration_estimate", ""),
                actors_data=scene_data.get("actors", []),
                props_data=scene_data.get("props", []),
                location_data=scene_data.get("location", {}),
                crowd_data=scene_data.get("crowd", {}),
                time_data=scene_data.get("time", {}),
                technical_notes=scene_data.get("technical_notes", "")
            )
            
            self.db.add(scene)
            scenes.append(scene)
        
        self.db.commit()
        return scenes
    
    def get_project_scenes(self, project_id: int) -> List[Scene]:
        """Get all scenes for a project."""
        return self.db.query(Scene).filter(Scene.project_id == project_id).all()
    
    def update_scene_status(self, scene_id: int, status: str) -> Scene:
        """Update scene status (unplanned, planned, shooting, completed)."""
        scene = self.db.query(Scene).filter(Scene.id == scene_id).first()
        if scene:
            scene.status = status
            self.db.commit()
            self.db.refresh(scene)
        return scene


class ActorService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_actor(self, name: str, daily_rate: float = 0, **kwargs) -> Actor:
        """Create a new actor in the catalog."""
        actor = Actor(name=name, daily_rate=daily_rate, **kwargs)
        self.db.add(actor)
        self.db.commit()
        self.db.refresh(actor)
        return actor
    
    def get_all_actors(self) -> List[Actor]:
        """Get all actors from catalog."""
        return self.db.query(Actor).all()
    
    def assign_actor_to_project(self, project_id: int, actor_id: int, character_name: str, role_type: str) -> ProjectActor:
        """Assign an actor to a project."""
        project_actor = ProjectActor(
            project_id=project_id,
            actor_id=actor_id,
            character_name=character_name,
            role_type=role_type
        )
        self.db.add(project_actor)
        self.db.commit()
        self.db.refresh(project_actor)
        return project_actor


class BudgetService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_budget_line(self, project_id: int, category: str, item_name: str, allocated_amount: float) -> BudgetLine:
        """Create a budget line item."""
        budget_line = BudgetLine(
            project_id=project_id,
            category=category,
            item_name=item_name,
            allocated_amount=allocated_amount
        )
        self.db.add(budget_line)
        self.db.commit()
        self.db.refresh(budget_line)
        return budget_line
    
    def get_project_budget(self, project_id: int) -> dict:
        """Get complete budget breakdown for a project."""
        budget_lines = self.db.query(BudgetLine).filter(BudgetLine.project_id == project_id).all()
        
        total_allocated = sum(line.allocated_amount for line in budget_lines)
        total_spent = sum(line.spent_amount for line in budget_lines)
        
        categories = {}
        for line in budget_lines:
            if line.category not in categories:
                categories[line.category] = {"allocated": 0, "spent": 0, "items": []}
            categories[line.category]["allocated"] += line.allocated_amount
            categories[line.category]["spent"] += line.spent_amount
            categories[line.category]["items"].append({
                "name": line.item_name,
                "allocated": line.allocated_amount,
                "spent": line.spent_amount
            })
        
        return {
            "total_allocated": total_allocated,
            "total_spent": total_spent,
            "remaining": total_allocated - total_spent,
            "categories": categories
        }


class ScriptAnalysisService:
    def __init__(self, db: Session):
        self.db = db
    
    def save_analysis(self, filename: str, scenes_data: List[dict], processing_info: dict = None, project_id: int = None) -> ScriptAnalysis:
        """Save script analysis to database."""
        analysis = ScriptAnalysis(
            project_id=project_id,
            filename=filename,
            total_scenes=len(scenes_data),
            scenes_data=scenes_data,
            processing_info=processing_info,
            summary=self._generate_summary(scenes_data)
        )
        
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis
    
    def get_analysis(self, analysis_id: int) -> Optional[ScriptAnalysis]:
        """Get script analysis by ID."""
        return self.db.query(ScriptAnalysis).filter(ScriptAnalysis.id == analysis_id).first()
    
    def get_all_analyses(self) -> List[ScriptAnalysis]:
        """Get all script analyses."""
        return self.db.query(ScriptAnalysis).all()
    
    def get_analyses_by_project(self, project_id: int) -> List[ScriptAnalysis]:
        """Get all script analyses for a specific project."""
        return self.db.query(ScriptAnalysis).filter(ScriptAnalysis.project_id == project_id).all()
    
    def get_project_analyses(self, project_id: int) -> List[ScriptAnalysis]:
        """Get all script analyses for a specific project (alias for get_analyses_by_project)."""
        return self.get_analyses_by_project(project_id)
    
    def _generate_summary(self, scenes_data: List[dict]) -> dict:
        """Generate summary from scenes data."""
        main_characters = set()
        locations = set()
        indoor_count = 0
        outdoor_count = 0
        
        for scene in scenes_data:
            # Extract main characters
            for actor in scene.get("actors", []):
                if actor.get("role") == "main":
                    main_characters.add(actor.get("name", ""))
            
            # Extract locations
            location = scene.get("location", {})
            if location.get("name"):
                locations.add(location["name"])
            
            # Count indoor/outdoor
            if location.get("type") == "indoor":
                indoor_count += 1
            elif location.get("type") == "outdoor":
                outdoor_count += 1
        
        return {
            "total_scenes": len(scenes_data),
            "main_characters": list(main_characters),
            "primary_locations": list(locations),
            "indoor_scenes": indoor_count,
            "outdoor_scenes": outdoor_count
        }


class LocationService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_location(self, **kwargs) -> Location:
        """Create a new location."""
        location = Location(**kwargs)
        self.db.add(location)
        self.db.commit()
        self.db.refresh(location)
        return location
    
    def get_location(self, location_id: int) -> Optional[Location]:
        """Get location by ID."""
        return self.db.query(Location).filter(Location.id == location_id).first()
    
    def get_all_locations(self) -> List[Location]:
        """Get all locations."""
        return self.db.query(Location).all()
    
    def update_location(self, location_id: int, **kwargs) -> Optional[Location]:
        """Update an existing location."""
        location = self.get_location(location_id)
        if location:
            for key, value in kwargs.items():
                setattr(location, key, value)
            self.db.commit()
            self.db.refresh(location)
        return location
    
    def delete_location(self, location_id: int) -> bool:
        """Delete a location."""
        location = self.get_location(location_id)
        if location:
            self.db.delete(location)
            self.db.commit()
            return True
        return False


class PropService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_prop(self, **kwargs) -> Prop:
        """Create a new prop."""
        prop = Prop(**kwargs)
        self.db.add(prop)
        self.db.commit()
        self.db.refresh(prop)
        return prop
    
    def get_prop(self, prop_id: int) -> Optional[Prop]:
        """Get prop by ID."""
        return self.db.query(Prop).filter(Prop.id == prop_id).first()
    
    def get_all_props(self) -> List[Prop]:
        """Get all props."""
        return self.db.query(Prop).all()
    
    def update_prop(self, prop_id: int, **kwargs) -> Optional[Prop]:
        """Update an existing prop."""
        prop = self.get_prop(prop_id)
        if prop:
            for key, value in kwargs.items():
                setattr(prop, key, value)
            self.db.commit()
            self.db.refresh(prop)
        return prop
    
    def delete_prop(self, prop_id: int) -> bool:
        """Delete a prop."""
        prop = self.get_prop(prop_id)
        if prop:
            self.db.delete(prop)
            self.db.commit()
            return True
        return False