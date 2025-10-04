"""
Migration script to add ticketing system tables to the database.
This adds tables for Ticket, TicketComment, TicketReminder, and TicketActivity.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.database import Base, DATABASE_URL
from app.models import (
    Ticket, TicketComment, TicketReminder, TicketActivity,
    User, Project, ProductionTask, ProductionStage
)

def migrate_ticket_system():
    """Add ticketing system tables to the database"""
    print("Starting ticketing system migration...")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Create all tables defined in Base
    # This will only create new tables and won't affect existing ones
    print("Creating ticket-related tables...")
    Base.metadata.create_all(bind=engine, tables=[
        Ticket.__table__,
        TicketComment.__table__,
        TicketReminder.__table__,
        TicketActivity.__table__
    ])
    
    print("✓ Ticket system tables created successfully!")
    print("\nCreated tables:")
    print("  - tickets")
    print("  - ticket_comments")
    print("  - ticket_reminders")
    print("  - ticket_activities")
    
    # Verify tables were created
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Test query
        ticket_count = db.query(Ticket).count()
        print(f"\n✓ Verification successful. Current tickets: {ticket_count}")
    except Exception as e:
        print(f"\n⚠ Warning during verification: {e}")
    finally:
        db.close()
    
    print("\nTicketing system migration completed!")
    print("\nNext steps:")
    print("1. Restart your FastAPI server")
    print("2. Check the API documentation at http://localhost:8000/docs")
    print("3. Look for the 'tickets' endpoints")

if __name__ == "__main__":
    migrate_ticket_system()
