"""
Migration script to add sentiment_analysis column to promotions table
"""
from sqlalchemy import create_engine, text
from app.config.database import DATABASE_URL
import os

def migrate_add_sentiment_analysis():
    """Add sentiment_analysis JSON column to promotions table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # Check if column already exists
        check_query = text("""
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = 'promotions' 
            AND column_name = 'sentiment_analysis'
        """)
        
        result = connection.execute(check_query)
        column_exists = result.scalar() > 0
        
        if column_exists:
            print("✓ sentiment_analysis column already exists in promotions table")
            return
        
        # Add the column
        alter_query = text("""
            ALTER TABLE promotions 
            ADD COLUMN sentiment_analysis JSON
        """)
        
        connection.execute(alter_query)
        connection.commit()
        
        print("✓ Successfully added sentiment_analysis column to promotions table")

if __name__ == "__main__":
    print("Starting migration to add sentiment_analysis column...")
    migrate_add_sentiment_analysis()
    print("Migration completed!")
