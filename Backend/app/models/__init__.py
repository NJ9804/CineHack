from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Float, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, Field
from typing import Optional
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
    
    # Schedule fields
    scheduled_date = Column(DateTime)
    location = Column(String(500))
    notes = Column(Text)
    
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
    assigned_to = Column(Integer, ForeignKey("users.id"))  # Changed to Integer FK
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
    assigned_user = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to])


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
    sentiment_analysis = Column(JSON)  # Sentiment analysis data
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")


# ============= Ticketing System for Post-Production =============

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    task_id = Column(Integer, ForeignKey("production_tasks.id"), nullable=True)
    stage_id = Column(Integer, ForeignKey("production_stages.id"), nullable=True)
    
    ticket_number = Column(String, unique=True, nullable=False)  # Auto-generated: TICK-001, TICK-002
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # Categorization
    ticket_type = Column(String, nullable=False)  # file_request, feedback, issue, question, asset_delivery
    priority = Column(String, default="medium")  # low, medium, high, urgent
    category = Column(String)  # editing, vfx, color_grading, sound, music, graphics
    
    # Status tracking
    status = Column(String, default="open")  # open, in_progress, waiting_response, resolved, closed
    
    # Assignment
    created_by = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    watchers = Column(JSON)  # Array of user IDs who should be notified
    
    # Collaboration
    source_department = Column(String)  # editing, vfx, color, etc.
    target_department = Column(String)  # The department this ticket is directed to
    
    # Files and assets
    attachments = Column(JSON)  # Array of file references {name: str, url: str, type: str}
    related_files = Column(JSON)  # Files that need to be shared/requested
    
    # Timing
    due_date = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Metrics
    response_time = Column(Float)  # Hours taken for first response
    resolution_time = Column(Float)  # Hours taken to resolve
    
    # Tags and metadata
    tags = Column(JSON)  # Array of tags for better organization
    ticket_metadata = Column(JSON)  # Additional custom fields (renamed from metadata to avoid conflict)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    task = relationship("ProductionTask")
    stage = relationship("ProductionStage")
    creator = relationship("User", foreign_keys=[created_by])
    assignee = relationship("User", foreign_keys=[assigned_to])
    comments = relationship("TicketComment", back_populates="ticket", cascade="all, delete-orphan")
    reminders = relationship("TicketReminder", back_populates="ticket", cascade="all, delete-orphan")
    activities = relationship("TicketActivity", back_populates="ticket", cascade="all, delete-orphan")


class TicketComment(Base):
    __tablename__ = "ticket_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    content = Column(Text, nullable=False)
    comment_type = Column(String, default="comment")  # comment, status_change, internal_note
    
    # For file sharing in comments
    attachments = Column(JSON)  # Array of file references
    
    # Mentions
    mentions = Column(JSON)  # Array of user IDs mentioned in the comment
    
    is_internal = Column(Boolean, default=False)  # Internal notes only visible to production team
    is_edited = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    ticket = relationship("Ticket", back_populates="comments")
    user = relationship("User")


class TicketReminder(Base):
    __tablename__ = "ticket_reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    reminder_type = Column(String, nullable=False)  # due_date, follow_up, custom
    reminder_time = Column(DateTime, nullable=False)
    message = Column(Text)
    
    # Recurrence
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String)  # daily, weekly, custom
    recurrence_end = Column(DateTime)
    
    # Status
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Notification channels
    notify_email = Column(Boolean, default=False)
    notify_in_app = Column(Boolean, default=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    ticket = relationship("Ticket", back_populates="reminders")
    user = relationship("User")


class TicketActivity(Base):
    __tablename__ = "ticket_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    activity_type = Column(String, nullable=False)  # created, updated, assigned, status_changed, commented, closed
    description = Column(Text)
    
    # Store what changed
    field_name = Column(String)  # Which field was changed
    old_value = Column(String)
    new_value = Column(String)
    
    activity_metadata = Column(JSON)  # Additional activity metadata (renamed from metadata to avoid conflict)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    ticket = relationship("Ticket", back_populates="activities")
    user = relationship("User")


# ============= Production Operations Management =============

class RentalItem(Base):
    """Tracks rented equipment, costumes, props, and art production items"""
    __tablename__ = "rental_items"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Item details
    item_name = Column(String, nullable=False)
    item_type = Column(String, nullable=False)  # equipment, costume, prop, art_production, vehicle
    category = Column(String)  # camera, lighting, wardrobe, set_design, etc.
    description = Column(Text)
    quantity = Column(Integer, default=1)
    
    # Vendor information
    vendor_name = Column(String, nullable=False)
    vendor_contact = Column(String)
    vendor_email = Column(String)
    vendor_address = Column(Text)
    
    # Rental details
    rental_start_date = Column(DateTime, nullable=False)
    rental_end_date = Column(DateTime, nullable=False)
    actual_return_date = Column(DateTime)
    
    # Costs
    daily_rate = Column(Float, default=0.0)
    security_deposit = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    penalty_charges = Column(Float, default=0.0)
    
    # Status tracking
    status = Column(String, default="reserved")  # reserved, picked_up, in_use, returned, overdue, damaged
    condition_on_pickup = Column(String, default="good")  # good, fair, damaged
    condition_on_return = Column(String)
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"))
    department = Column(String)  # art, camera, costume, etc.
    
    # Reminders and alerts
    return_reminder_sent = Column(Boolean, default=False)
    overdue_alert_sent = Column(Boolean, default=False)
    
    # Documentation
    rental_agreement_url = Column(String)
    pickup_photos = Column(JSON)  # Array of photo URLs
    return_photos = Column(JSON)
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])


class Purchase(Base):
    """Tracks all purchases for production"""
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Purchase details
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # art_supplies, props, costumes, consumables, stationary, etc.
    description = Column(Text)
    quantity = Column(Integer, default=1)
    unit = Column(String)  # pcs, kg, liters, etc.
    
    # Vendor information
    vendor_name = Column(String)
    vendor_contact = Column(String)
    purchase_location = Column(String)
    
    # Financial details
    unit_price = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)
    
    # Payment tracking
    payment_method = Column(String)  # cash, card, upi, bank_transfer, petty_cash
    payment_status = Column(String, default="pending")  # pending, paid, partially_paid, reimbursement_pending
    paid_by = Column(Integer, ForeignKey("users.id"))
    reimbursement_status = Column(String)  # pending, approved, paid
    
    # Documentation
    invoice_number = Column(String)
    invoice_url = Column(String)
    receipt_url = Column(String)
    purchase_date = Column(DateTime, nullable=False)
    
    # Department and purpose
    department = Column(String)  # art, costume, props, food, etc.
    purpose = Column(Text)
    scene_id = Column(Integer, ForeignKey("scenes.id"))
    
    # Approval workflow
    requested_by = Column(Integer, ForeignKey("users.id"))
    approved_by = Column(Integer, ForeignKey("users.id"))
    approval_status = Column(String, default="approved")  # pending, approved, rejected
    
    notes = Column(Text)
    tags = Column(JSON)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    scene = relationship("Scene")
    paid_by_user = relationship("User", foreign_keys=[paid_by])
    requested_by_user = relationship("User", foreign_keys=[requested_by])
    approved_by_user = relationship("User", foreign_keys=[approved_by])


class HotelBooking(Base):
    """Manages hotel accommodations for cast and crew"""
    __tablename__ = "hotel_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Hotel details
    hotel_name = Column(String, nullable=False)
    hotel_address = Column(Text)
    hotel_contact = Column(String)
    hotel_email = Column(String)
    star_rating = Column(Integer)
    
    # Room details
    room_number = Column(String)
    room_type = Column(String)  # single, double, suite, dormitory
    number_of_rooms = Column(Integer, default=1)
    
    # Guest details
    guest_name = Column(String, nullable=False)
    guest_role = Column(String)  # actor, director, crew, etc.
    guest_contact = Column(String)
    actor_id = Column(Integer, ForeignKey("actors.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Booking details
    check_in_date = Column(DateTime, nullable=False)
    check_out_date = Column(DateTime, nullable=False)
    actual_check_in = Column(DateTime)
    actual_check_out = Column(DateTime)
    
    # Costs
    room_rate_per_night = Column(Float, nullable=False)
    total_nights = Column(Integer)
    total_cost = Column(Float)
    advance_paid = Column(Float, default=0.0)
    balance_amount = Column(Float, default=0.0)
    
    # Status
    booking_status = Column(String, default="confirmed")  # pending, confirmed, checked_in, checked_out, cancelled
    payment_status = Column(String, default="pending")  # pending, advance_paid, fully_paid
    
    # Additional services
    meals_included = Column(Boolean, default=False)
    meal_plan = Column(String)  # breakfast, half_board, full_board
    transportation_arranged = Column(Boolean, default=False)
    
    # Documentation
    booking_reference = Column(String, unique=True)
    confirmation_email_url = Column(String)
    
    # Reminders
    check_in_reminder_sent = Column(Boolean, default=False)
    check_out_reminder_sent = Column(Boolean, default=False)
    
    # Location and scene mapping
    shooting_location = Column(String)
    scene_ids = Column(JSON)  # Array of scene IDs this booking is for
    
    notes = Column(Text)
    special_requests = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    booked_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project")
    actor = relationship("Actor")
    user = relationship("User", foreign_keys=[user_id])
    booked_by_user = relationship("User", foreign_keys=[booked_by])


class ActorAvailability(Base):
    """Tracks actor availability and schedules"""
    __tablename__ = "actor_availability"
    
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("actors.id", ondelete="CASCADE"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Availability period
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    
    # Status
    availability_status = Column(String, default="available")  # available, tentative, booked, unavailable
    
    # Booking details (if booked)
    scene_ids = Column(JSON)  # Array of scene IDs actor is scheduled for
    shoot_location = Column(String)
    call_time = Column(String)
    role_character = Column(String)
    
    # Conflicts and notes
    conflict_reason = Column(String)  # other_project, personal, medical, travel
    conflicting_project = Column(String)
    
    # Travel and logistics
    requires_travel = Column(Boolean, default=False)
    travel_from = Column(String)
    travel_to = Column(String)
    accommodation_needed = Column(Boolean, default=False)
    hotel_booking_id = Column(Integer, ForeignKey("hotel_bookings.id"))
    
    # Reminders
    reminder_sent = Column(Boolean, default=False)
    confirmed_by_actor = Column(Boolean, default=False)
    confirmation_date = Column(DateTime)
    
    notes = Column(Text)
    special_requirements = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    actor = relationship("Actor")
    project = relationship("Project")
    hotel_booking = relationship("HotelBooking")
    creator = relationship("User", foreign_keys=[created_by])


class FoodCatering(Base):
    """Manages daily food and catering for production"""
    __tablename__ = "food_catering"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Date and meal details
    catering_date = Column(DateTime, nullable=False)
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner, snacks, tea
    
    # Location details
    shoot_location = Column(String)
    delivery_location = Column(String)
    scene_ids = Column(JSON)  # Related scenes
    
    # Headcount
    total_people = Column(Integer, nullable=False)
    actors_count = Column(Integer, default=0)
    crew_count = Column(Integer, default=0)
    junior_artists_count = Column(Integer, default=0)
    
    # Vendor details
    vendor_name = Column(String, nullable=False)
    vendor_contact = Column(String)
    vendor_type = Column(String)  # catering_service, restaurant, homemade
    
    # Menu and dietary
    menu_details = Column(JSON)  # Array of menu items
    vegetarian_count = Column(Integer, default=0)
    non_vegetarian_count = Column(Integer, default=0)
    special_dietary_requirements = Column(Text)
    
    # Costs
    per_person_cost = Column(Float, default=0.0)
    total_cost = Column(Float, nullable=False)
    advance_paid = Column(Float, default=0.0)
    
    # Timing
    delivery_time = Column(String)
    actual_delivery_time = Column(String)
    
    # Status
    status = Column(String, default="planned")  # planned, ordered, delivered, completed, cancelled
    payment_status = Column(String, default="pending")  # pending, paid, advance_paid
    
    # Quality tracking
    quality_rating = Column(Integer)  # 1-5 stars
    feedback = Column(Text)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    ordered_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project")
    ordered_by_user = relationship("User", foreign_keys=[ordered_by])


class Transportation(Base):
    """Tracks vehicles, fuel, and transportation logistics"""
    __tablename__ = "transportation"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Vehicle details
    vehicle_type = Column(String, nullable=False)  # car, van, truck, bus, bike, rental
    vehicle_number = Column(String)
    vehicle_model = Column(String)
    ownership = Column(String)  # owned, rented, personal_reimbursement
    
    # Driver details
    driver_name = Column(String)
    driver_contact = Column(String)
    driver_license = Column(String)
    
    # Usage details
    usage_date = Column(DateTime, nullable=False)
    purpose = Column(String)  # cast_transport, equipment_transport, location_recce, daily_commute
    from_location = Column(String)
    to_location = Column(String)
    distance_km = Column(Float)
    
    # Fuel tracking
    fuel_type = Column(String)  # petrol, diesel, cng, electric
    fuel_quantity_liters = Column(Float)
    fuel_cost = Column(Float)
    fuel_receipt_url = Column(String)
    
    # Other costs
    toll_charges = Column(Float, default=0.0)
    parking_charges = Column(Float, default=0.0)
    driver_allowance = Column(Float, default=0.0)
    rental_charges = Column(Float, default=0.0)
    total_cost = Column(Float)
    
    # Odometer readings
    start_odometer = Column(Float)
    end_odometer = Column(Float)
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"))
    department = Column(String)
    scene_ids = Column(JSON)
    
    # Status
    status = Column(String, default="scheduled")  # scheduled, in_progress, completed, cancelled
    payment_status = Column(String, default="pending")
    
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    project = relationship("Project")
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    creator = relationship("User", foreign_keys=[created_by])


class JuniorArtist(Base):
    """Manages junior artists/extras for production"""
    __tablename__ = "junior_artists"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Personal details
    name = Column(String, nullable=False)
    contact_number = Column(String)
    emergency_contact = Column(String)
    age = Column(Integer)
    gender = Column(String)
    
    # Physical attributes
    height = Column(String)
    build = Column(String)  # slim, average, athletic, heavy
    
    # Professional details
    experience_level = Column(String)  # fresher, experienced
    special_skills = Column(JSON)  # dancing, horse_riding, martial_arts, etc.
    languages_known = Column(JSON)
    
    # Availability
    is_available = Column(Boolean, default=True)
    availability_dates = Column(JSON)  # Array of date ranges
    
    # Daily rate and payment
    daily_rate = Column(Float, nullable=False)
    payment_status = Column(String, default="pending")  # pending, paid, partially_paid
    
    # Documents
    id_proof_type = Column(String)
    id_proof_url = Column(String)
    photo_url = Column(String)
    
    # Agency details (if through an agency)
    agency_name = Column(String)
    agency_contact = Column(String)
    agency_commission = Column(Float, default=0.0)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    attendance_records = relationship("JuniorArtistAttendance", back_populates="junior_artist", cascade="all, delete-orphan")


class JuniorArtistAttendance(Base):
    """Tracks daily attendance and assignments for junior artists"""
    __tablename__ = "junior_artist_attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    junior_artist_id = Column(Integer, ForeignKey("junior_artists.id", ondelete="CASCADE"))
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Date and scene details
    attendance_date = Column(DateTime, nullable=False)
    scene_ids = Column(JSON)  # Array of scene IDs
    shoot_location = Column(String)
    
    # Role assignment
    role_description = Column(String)  # crowd_member, party_guest, soldier, etc.
    costume_details = Column(String)
    makeup_required = Column(Boolean, default=False)
    
    # Timing
    call_time = Column(String)
    actual_arrival_time = Column(String)
    wrap_time = Column(String)
    total_hours = Column(Float)
    
    # Status
    attendance_status = Column(String, default="scheduled")  # scheduled, present, absent, late, left_early
    
    # Payment for the day
    payment_amount = Column(Float)
    overtime_hours = Column(Float, default=0.0)
    overtime_amount = Column(Float, default=0.0)
    total_payment = Column(Float)
    payment_status = Column(String, default="pending")
    
    # Meals and facilities
    meals_provided = Column(Boolean, default=True)
    transport_provided = Column(Boolean, default=False)
    transport_cost = Column(Float, default=0.0)
    
    # Performance and notes
    performance_rating = Column(Integer)  # 1-5 stars
    notes = Column(Text)
    issues = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    marked_by = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    junior_artist = relationship("JuniorArtist", back_populates="attendance_records")
    project = relationship("Project")
    marked_by_user = relationship("User", foreign_keys=[marked_by])


# ============= Invoice Upload & Processing System =============

class UploadedInvoice(Base):
    """Tracks uploaded invoices with AI-extracted details and approval workflow"""
    __tablename__ = "uploaded_invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Invoice identification
    invoice_number = Column(String, unique=True, nullable=False)  # Auto-generated or extracted
    invoice_type = Column(String, default="expense")  # expense, purchase, rental, service
    
    # File storage
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Local storage path for the image
    file_size = Column(Integer)  # File size in bytes
    mime_type = Column(String)  # image/jpeg, image/png, application/pdf
    
    # AI-extracted details (from Gemini)
    vendor_name = Column(String)
    vendor_address = Column(Text)
    vendor_contact = Column(String)
    vendor_gstin = Column(String)
    invoice_date = Column(DateTime)
    due_date = Column(DateTime)
    
    # Financial details extracted by AI
    subtotal = Column(Float)
    tax_amount = Column(Float)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    
    # Line items extracted (JSON array)
    line_items = Column(JSON)  # [{description: str, quantity: int, unit_price: float, amount: float}]
    
    # AI processing metadata
    ai_extraction_status = Column(String, default="pending")  # pending, processing, completed, failed
    ai_confidence_score = Column(Float)  # 0.0 to 1.0
    ai_raw_response = Column(JSON)  # Full AI response for debugging
    extraction_timestamp = Column(DateTime)
    
    # Categorization
    category = Column(String)  # props, equipment, catering, transport, accommodation, etc.
    department = Column(String)  # art, camera, costume, production, etc.
    purpose = Column(Text)
    scene_ids = Column(JSON)  # Related scene IDs if applicable
    
    # Approval workflow
    approval_required = Column(Boolean, default=False)  # True if amount exceeds threshold
    approval_threshold = Column(Float)  # The threshold amount that triggered approval
    approval_status = Column(String, default="pending")  # pending, approved, rejected, auto_approved
    
    # Approval chain
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by = Column(Integer, ForeignKey("users.id"))
    approval_date = Column(DateTime)
    rejection_reason = Column(Text)
    
    # Payment tracking
    payment_status = Column(String, default="pending")  # pending, processing, paid, failed
    payment_method = Column(String)  # cash, card, bank_transfer, upi
    payment_date = Column(DateTime)
    payment_reference = Column(String)
    paid_by = Column(Integer, ForeignKey("users.id"))
    
    # Verification and audit
    is_verified = Column(Boolean, default=False)  # Manual verification flag
    verified_by = Column(Integer, ForeignKey("users.id"))
    verification_date = Column(DateTime)
    verification_notes = Column(Text)
    
    # Status and flags
    status = Column(String, default="uploaded")  # uploaded, processing, approved, paid, archived, disputed
    is_duplicate = Column(Boolean, default=False)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String)  # monthly, quarterly, etc.
    
    # Budget linkage
    budget_line_id = Column(Integer, ForeignKey("budget_lines.id"))
    
    # Notes and attachments
    notes = Column(Text)
    internal_notes = Column(Text)  # Only visible to finance/production team
    additional_attachments = Column(JSON)  # Array of additional file paths
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
    budget_line = relationship("BudgetLine")
    submitter = relationship("User", foreign_keys=[submitted_by])
    approver = relationship("User", foreign_keys=[approved_by])
    verifier = relationship("User", foreign_keys=[verified_by])
    payer = relationship("User", foreign_keys=[paid_by])
    approval_history = relationship("InvoiceApprovalHistory", back_populates="invoice", cascade="all, delete-orphan")
    comments = relationship("InvoiceComment", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceApprovalHistory(Base):
    """Tracks the approval history and workflow for invoices"""
    __tablename__ = "invoice_approval_history"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("uploaded_invoices.id", ondelete="CASCADE"))
    
    # Approval action details
    action = Column(String, nullable=False)  # submitted, approved, rejected, revised, escalated
    action_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_date = Column(DateTime, server_default=func.now())
    
    # Role and level
    approver_role = Column(String)  # production_manager, finance_head, producer, director
    approval_level = Column(Integer, default=1)  # For multi-level approvals
    
    # Details
    comments = Column(Text)
    previous_status = Column(String)
    new_status = Column(String)
    
    # Metadata
    ip_address = Column(String)
    user_agent = Column(String)
    
    # Relationships
    invoice = relationship("UploadedInvoice", back_populates="approval_history")
    user = relationship("User")


class InvoiceComment(Base):
    """Comments and discussions on uploaded invoices"""
    __tablename__ = "invoice_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("uploaded_invoices.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    
    content = Column(Text, nullable=False)
    comment_type = Column(String, default="general")  # general, query, clarification, approval_note
    
    is_internal = Column(Boolean, default=False)  # Only visible to team
    mentions = Column(JSON)  # Array of user IDs mentioned
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_edited = Column(Boolean, default=False)
    
    # Relationships
    invoice = relationship("UploadedInvoice", back_populates="comments")
    user = relationship("User")


class InvoiceApprovalSettings(Base):
    """Configurable approval thresholds and workflow settings"""
    __tablename__ = "invoice_approval_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    
    # Threshold settings
    auto_approve_threshold = Column(Float, default=5000.0)  # Auto-approve if amount is below this
    manager_approval_threshold = Column(Float, default=25000.0)  # Requires manager approval
    director_approval_threshold = Column(Float, default=100000.0)  # Requires director approval
    
    # Category-specific thresholds (JSON)
    category_thresholds = Column(JSON)  # {catering: 10000, equipment: 50000, etc.}
    
    # Approval workflow
    require_dual_approval = Column(Boolean, default=False)  # Require two approvers for high amounts
    dual_approval_threshold = Column(Float, default=200000.0)
    
    # Notification settings
    notify_on_submission = Column(Boolean, default=True)
    notify_approvers = Column(JSON)  # Array of user IDs to notify
    escalation_hours = Column(Integer, default=48)  # Hours before escalation
    
    # Payment settings
    payment_terms_days = Column(Integer, default=30)  # Default payment terms
    require_verification = Column(Boolean, default=True)  # Require manual verification
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project")
