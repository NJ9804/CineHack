"""
Script to create an initial superuser for the CineHack application
Run this after setting up the database
"""

from sqlalchemy.orm import Session
from app.config.database import SessionLocal, create_tables
from app.models import User
from app.utils.auth import get_password_hash
from datetime import datetime


def create_superuser():
    """Create an initial superuser account"""
    db = SessionLocal()
    
    try:
        # Check if any superuser exists
        existing_superuser = db.query(User).filter(User.is_superuser == True).first()
        
        if existing_superuser:
            print(f"✅ Superuser already exists: {existing_superuser.username}")
            return
        
        # Get input
        print("Creating initial superuser account...")
        email = input("Email: ")
        username = input("Username: ")
        password = input("Password: ")
        full_name = input("Full Name (optional): ")
        
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == email) | (User.username == username)
        ).first()
        
        if existing_user:
            print("❌ User with this email or username already exists!")
            return
        
        # Create superuser
        hashed_password = get_password_hash(password)
        superuser = User(
            email=email,
            username=username,
            hashed_password=hashed_password,
            full_name=full_name if full_name else None,
            is_active=True,
            is_superuser=True,
            last_login=datetime.utcnow()
        )
        
        db.add(superuser)
        db.commit()
        db.refresh(superuser)
        
        print(f"\n✅ Superuser created successfully!")
        print(f"   Email: {superuser.email}")
        print(f"   Username: {superuser.username}")
        print(f"   ID: {superuser.id}")
        
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Ensure tables exist
    create_tables()
    print("Database tables ready.\n")
    
    create_superuser()
