"""
Migration script for Production Operations Management System
Adds tables for rentals, hotels, purchases, actor availability, catering, transportation, and junior artists
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.database import engine, Base
from app.models import (
    RentalItem,
    Purchase,
    HotelBooking,
    ActorAvailability,
    FoodCatering,
    Transportation,
    JuniorArtist,
    JuniorArtistAttendance
)

def migrate_operations_tables():
    """Create all operations management tables"""
    print("🚀 Starting Production Operations Migration...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ Successfully created the following tables:")
        print("   - rental_items")
        print("   - purchases")
        print("   - hotel_bookings")
        print("   - actor_availability")
        print("   - food_catering")
        print("   - transportation")
        print("   - junior_artists")
        print("   - junior_artist_attendance")
        
        print("\n📊 Operations Management System is ready!")
        print("\nYou can now:")
        print("  • Track rentals and avoid late returns")
        print("  • Manage hotel bookings for cast and crew")
        print("  • Record all production purchases")
        print("  • Manage actor availability")
        print("  • Plan daily catering")
        print("  • Track transportation and fuel costs")
        print("  • Manage junior artists and attendance")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = migrate_operations_tables()
    if success:
        print("\n✨ Migration completed successfully!")
    else:
        print("\n⚠️  Migration failed. Please check the errors above.")
        sys.exit(1)
