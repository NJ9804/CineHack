"""
Add payment_type field to actors table
"""
import asyncio
from sqlalchemy import text
from app.config.database import SessionLocal, engine

async def add_payment_type_field():
    """Add payment_type column to actors table"""
    
    db = SessionLocal()
    
    try:
        # Check if column already exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='actors' AND column_name='payment_type'
        """)
        
        result = db.execute(check_query).fetchone()
        
        if result:
            print("✅ payment_type column already exists")
            return
        
        # Add payment_type column
        alter_query = text("""
            ALTER TABLE actors 
            ADD COLUMN payment_type VARCHAR DEFAULT 'daily'
        """)
        
        db.execute(alter_query)
        db.commit()
        
        print("✅ Added payment_type column to actors table")
        
        # Update existing actors to have default payment type
        update_query = text("""
            UPDATE actors 
            SET payment_type = 'daily' 
            WHERE payment_type IS NULL
        """)
        
        db.execute(update_query)
        db.commit()
        
        print("✅ Updated existing actors with default payment_type")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding payment_type field to actors table...")
    asyncio.run(add_payment_type_field())
    print("✅ Migration complete!")
