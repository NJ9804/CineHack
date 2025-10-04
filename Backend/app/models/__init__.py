from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base
import enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="planning")  # planning, pre_production, production, post_production, completed
    budget_total = Column(Float, default=0.0)
    budget_used = Column(Float, default=0.0)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    scenes = relationship("Scene", back_populates="project")
    actors = relationship("ProjectActor", back_populates="project")
    budget_lines = relationship("BudgetLine", back_populates="project")


class Scene(Base):
    __tablename__ = "scenes"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    scene_number = Column(String)
    scene_heading = Column(String)
    location_name = Column(String)
    location_type = Column(String)  # indoor/outdoor
    time_of_day = Column(String)
    estimated_duration = Column(String)
    status = Column(String, default="unplanned")  # unplanned, planned, shooting, completed
    
    # JSON fields for flexibility
    actors_data = Column(JSON)  # Array of actor requirements
    props_data = Column(JSON)   # Array of props needed
    location_data = Column(JSON)  # Location details
    crowd_data = Column(JSON)   # Crowd requirements
    time_data = Column(JSON)    # Time/weather requirements
    technical_notes = Column(Text)
    
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="scenes")


class Actor(Base):
    __tablename__ = "actors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    contact_email = Column(String)
    contact_phone = Column(String)
    daily_rate = Column(Float)
    transport_cost = Column(Float, default=0.0)
    accommodation_cost = Column(Float, default=0.0)
    is_available = Column(Boolean, default=True)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ProjectActor(Base):
    __tablename__ = "project_actors"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    actor_id = Column(Integer, ForeignKey("actors.id"))
    character_name = Column(String)
    role_type = Column(String)  # main, supporting, background
    agreed_rate = Column(Float)
    
    # Relationships
    project = relationship("Project", back_populates="actors")
    actor = relationship("Actor")


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    address = Column(Text)
    location_type = Column(String)  # indoor, outdoor
    coordinates = Column(JSON)  # {lat: float, lng: float}
    daily_rate = Column(Float, default=0.0)
    capacity = Column(Integer, default=0)
    amenities = Column(JSON)  # Array of strings
    availability = Column(String, default="available")
    photo_url = Column(String)
    contact_person = Column(String)
    contact_phone = Column(String)
    weather_dependent = Column(Boolean, default=False)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())


class Prop(Base):
    __tablename__ = "props"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    quantity = Column(Integer, default=1)
    unit_cost = Column(Float, default=0.0)
    daily_rate = Column(Float, default=0.0)
    purchase_cost = Column(Float, default=0.0)
    availability = Column(String, default="available")
    vendor_contact = Column(String)
    is_available = Column(Boolean, default=True)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())


class BudgetLine(Base):
    __tablename__ = "budget_lines"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    category = Column(String, nullable=False)  # actors, props, locations, equipment, catering, etc
    item_name = Column(String)
    allocated_amount = Column(Float)
    spent_amount = Column(Float, default=0.0)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="budget_lines")


class ScriptAnalysis(Base):
    __tablename__ = "script_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    filename = Column(String, nullable=False)
    total_scenes = Column(Integer, nullable=False)
    scenes_data = Column(JSON, nullable=False)  # Raw parsed scenes
    processing_info = Column(JSON)
    summary = Column(JSON)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class GlobalCost(Base):
    __tablename__ = "global_costs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # actor/property/location
    billing_cycle = Column(String, nullable=False)  # daily/weekly/monthly
    cost = Column(Integer, nullable=False)
    description = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Invoice Pydantic Models
class InvoiceInput(BaseModel):
    """Model for invoice input data"""
    company_name: str = Field(..., description="Name of the company")
    company_address: str = Field(..., description="Company address")
    company_gstin: str = Field(..., description="Company GST identification number")
    bank_name: str = Field(..., description="Bank name")
    bank_ac: str = Field(..., description="Bank account number")
    bank_ifsc: str = Field(..., description="Bank IFSC code")
    invoice_date: str = Field(..., description="Invoice date")
    actor_name: str = Field(..., description="Actor name")
    actor_pan: str = Field(..., description="Actor PAN number")
    actor_address: str = Field(..., description="Actor address")
    acting_fee: float = Field(..., gt=0, description="Acting fee amount")
    tds_percent: float = Field(..., ge=0, le=100, description="TDS percentage")

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "Film Production House",
                "company_address": "123 Film Street, Mumbai, Maharashtra",
                "company_gstin": "27AAAAA0000A1Z5",
                "bank_name": "HDFC Bank",
                "bank_ac": "12345678901234",
                "bank_ifsc": "HDFC0000123",
                "invoice_date": "2024-01-15",
                "actor_name": "John Doe",
                "actor_pan": "ABCDE1234F",
                "actor_address": "456 Actor Lane, Mumbai, Maharashtra",
                "acting_fee": 100000.0,
                "tds_percent": 10.0
            }
        }


class InvoiceCalculation(BaseModel):
    """Model for invoice calculations"""
    acting_fee: float
    tds_percent: float
    tds_amount: float
    net_amount: float
    invoice_id: str


class InvoiceResponse(BaseModel):
    """Model for invoice generation response"""
    success: bool
    message: str
    invoice_id: str
    filename: Optional[str] = None
    download_url: Optional[str] = None


class ErrorResponse(BaseModel):
    """Model for error responses"""
    success: bool = False
    message: str
    error_code: Optional[str] = None


# Production Stage Models
class ProductionStage(Base):
    __tablename__ = "production_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    stage_order = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="not_started")  # not_started, in_progress, completed, delayed
    progress_percentage = Column(Float, default=0.0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    sub_stages = relationship("ProductionSubStage", back_populates="stage")
    tasks = relationship("ProductionTask", back_populates="stage")


class ProductionSubStage(Base):
    __tablename__ = "production_sub_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("production_stages.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    sub_stage_order = Column(Integer)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="not_started")
    progress_percentage = Column(Float, default=0.0)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    stage = relationship("ProductionStage", back_populates="sub_stages")
    tasks = relationship("ProductionTask", back_populates="sub_stage")


class ProductionTask(Base):
    __tablename__ = "production_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("production_stages.id"))
    sub_stage_id = Column(Integer, ForeignKey("production_sub_stages.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    task_type = Column(String)  # creative, technical, administrative, logistics
    priority = Column(String, default="medium")  # low, medium, high, critical
    status = Column(String, default="todo")  # todo, in_progress, completed, blocked
    assigned_to = Column(String)  # Person/team responsible
    due_date = Column(DateTime)
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    dependencies = Column(JSON)  # Array of task IDs this task depends on
    checklist = Column(JSON)  # Array of checklist items {item: str, completed: bool}
    attachments = Column(JSON)  # Array of file references
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    stage = relationship("ProductionStage", back_populates="tasks")
    sub_stage = relationship("ProductionSubStage", back_populates="tasks")


class Promotion(Base):
    __tablename__ = "promotions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    film = Column(String, nullable=False)
    total_views = Column(Integer, default=0)
    total_likes = Column(Integer, default=0)
    total_comments = Column(Integer, default=0)
    videos = Column(JSON)  # Array of video analytics data
    industry_progress = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
