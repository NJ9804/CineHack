"""
Migration script to add schedule-related columns to scenes table
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
    
    print("🔧 Adding schedule columns to scenes table...")
    
    # Connect to the database
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    try:
        # Check and add missing columns
        columns_to_add = [
            ("scheduled_date", "TIMESTAMP"),
            ("location", "VARCHAR(500)"),
            ("notes", "TEXT"),
        ]
        
        for column_name, column_type in columns_to_add:
            # Check if column exists
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'scenes' AND column_name = %s
            """, (column_name,))
            
            if cur.fetchone():
                print(f"⏭️  Column exists: {column_name}")
            else:
                # Add the column
                cur.execute(sql.SQL("ALTER TABLE scenes ADD COLUMN {} {}").format(
                    sql.Identifier(column_name),
                    sql.SQL(column_type)
                ))
                print(f"✅ Adding column: {column_name} ({column_type})")
        
        conn.commit()
        print("✅ Scenes table updated for scheduling!")
        
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
