from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.config.database import Base


# ============= Authentication & User Management =============

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    avatar_url = Column(String)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime)
    
    # Relationships
    project_members = relationship("ProjectMember", back_populates="user", foreign_keys="ProjectMember.user_id")
    comments = relationship("Comment", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    assigned_tasks = relationship("ProductionTask", back_populates="assigned_user", foreign_keys="ProductionTask.assigned_to")


class ProjectMember(Base):
    __tablename__ = "project_members"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(String, nullable=False)  # owner, director, producer, shareholder, crew, viewer
    permissions = Column(JSON)  # Custom permissions array
    
    # Role definitions:
    # - owner: Full access to everything
    # - director: Can edit all creative aspects, view budget
    # - producer: Can edit budget, schedules, view everything
    # - shareholder: Read-only access to budget and reports
    # - crew: Can edit assigned tasks, view relevant scenes
    # - viewer: Read-only access to project
    
    joined_at = Column(DateTime, server_default=func.now())
    invited_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_members", foreign_keys=[user_id])
    inviter = relationship("User", foreign_keys=[invited_by])


class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    # Polymorphic - can comment on different entities
    entity_type = Column(String, nullable=False)  # scene, task, project, budget_line
    entity_id = Column(Integer, nullable=False)
    
    parent_comment_id = Column(Integer, ForeignKey("comments.id"))  # For threaded comments
    
    is_resolved = Column(Boolean, default=False)
    is_edited = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="comments")
    replies = relationship("Comment", backref="parent", remote_side=[id])


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String)  # assignment, comment, mention, deadline, update
    
    # Link to related entity
    entity_type = Column(String)  # project, scene, task, comment
    entity_id = Column(Integer)
    
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    
    action_url = Column(String)  # Frontend URL to navigate to
    
    created_at = Column(DateTime, server_default=func.now())
    read_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="notifications")


# ============= Project Management =============

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
    
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    scenes = relationship("Scene", back_populates="project", cascade="all, delete-orphan")
    actors = relationship("ProjectActor", back_populates="project", cascade="all, delete-orphan")
    budget_lines = relationship("BudgetLine", back_populates="project", cascade="all, delete-orphan")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])


class Scene(Base):
    __tablename__ = "scenes"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
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
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="scenes")
    assigned_user = relationship("User", foreign_keys=[assigned_to])


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


class ProductionStage(Base):
    __tablename__ = "production_stages"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String, nullable=False)  # Development, Pre-Production, Production, Post-Production, Distribution
    description = Column(Text)
    order = Column(Integer, nullable=False)  # Display order
    status = Column(String, default="not_started")  # not_started, in_progress, completed, on_hold
    progress = Column(Integer, default=0)  # 0-100 percentage
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    estimated_duration_days = Column(Integer)
    actual_duration_days = Column(Integer)
    budget_allocated = Column(Float, default=0.0)
    budget_spent = Column(Float, default=0.0)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    sub_stages = relationship("ProductionSubStage", back_populates="stage", cascade="all, delete-orphan")
    tasks = relationship("ProductionTask", back_populates="stage", cascade="all, delete-orphan")


class ProductionSubStage(Base):
    __tablename__ = "production_substages"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("production_stages.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer, nullable=False)
    status = Column(String, default="not_started")  # not_started, in_progress, completed, blocked
    progress = Column(Integer, default=0)  # 0-100 percentage
    priority = Column(String, default="medium")  # low, medium, high, critical
    assigned_to = Column(String)  # Team member or department
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    estimated_hours = Column(Integer)
    actual_hours = Column(Integer)
    dependencies = Column(JSON)  # Array of substage IDs that must be completed first
    deliverables = Column(JSON)  # Array of expected deliverables
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    stage = relationship("ProductionStage", back_populates="sub_stages")
    tasks = relationship("ProductionTask", back_populates="sub_stage", cascade="all, delete-orphan")


class ProductionTask(Base):
    __tablename__ = "production_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("production_stages.id"))
    sub_stage_id = Column(Integer, ForeignKey("production_substages.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="todo")  # todo, in_progress, review, completed, blocked
    priority = Column(String, default="medium")  # low, medium, high, critical
    assigned_to = Column(Integer, ForeignKey("users.id"))  # Changed to Integer FK
    due_date = Column(DateTime)
    completed_date = Column(DateTime)
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    tags = Column(JSON)  # Array of tags
    checklist = Column(JSON)  # Array of checklist items {item: str, completed: bool}
    attachments = Column(JSON)  # Array of file references
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    stage = relationship("ProductionStage", back_populates="tasks")
    sub_stage = relationship("ProductionSubStage", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks")