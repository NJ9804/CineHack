"""
Migration script to add missing columns to production_tasks table
"""
import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import sql

# Load environment variables
load_dotenv()

def main():
    # Get database URL from environment
    db_url = os.getenv("DATABASE_URL")
    
    if not db_url:
        print("❌ DATABASE_URL not found in environment variables")
        return
    
    print("🔧 Fixing production_tasks table...")
    
    # Connect to the database
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        # Check and add missing columns
        columns_to_add = [
            ("completed_date", "TIMESTAMP"),
            ("estimated_hours", "DOUBLE PRECISION"),
            ("actual_hours", "DOUBLE PRECISION"),
            ("tags", "JSONB"),
            ("checklist", "JSONB"),
            ("attachments", "JSONB"),
            ("notes", "TEXT"),
        ]
        
        for column_name, column_type in columns_to_add:
            # Check if column exists
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'production_tasks' AND column_name = %s
            """, (column_name,))
            
            if cur.fetchone():
                print(f"⏭️  Column exists: {column_name}")
            else:
                # Add the column
                cur.execute(sql.SQL("ALTER TABLE production_tasks ADD COLUMN {} {}").format(
                    sql.Identifier(column_name),
                    sql.SQL(column_type)
                ))
                print(f"✅ Adding column: {column_name} ({column_type})")
        
        conn.commit()
        print("✅ Production tasks table fixed!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()
    
    print("🎉 Database updated successfully!")

if __name__ == "__main__":
    main()
