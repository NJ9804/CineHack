"""
Complete Database Migration Script
Adds missing columns to existing tables for the authentication and RBAC system
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.database import DATABASE_URL

def run_migrations():
    """Run all necessary database migrations"""
    engine = create_engine(DATABASE_URL)
    
    print("🔧 Starting database migrations...")
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        
        # Migration 1: Add columns to production_stages table if missing
        print("\n📋 Checking production_stages table...")
        if 'production_stages' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('production_stages')}
            
            columns_to_add = {
                'order': 'INTEGER',
            }
            
            for column, col_type in columns_to_add.items():
                if column not in existing_columns:
                    # Quote 'order' because it's a reserved keyword
                    quoted_column = f'"{column}"' if column == 'order' else column
                    print(f"  ✅ Adding column: {column}")
                    conn.execute(text(f'ALTER TABLE production_stages ADD COLUMN {quoted_column} {col_type}'))
                    conn.commit()
                else:
                    print(f"  ⏭️  Column already exists: {column}")
        else:
            print("  ⚠️  production_stages table doesn't exist yet")
        
        # Migration 2: Add columns to production_substages table if missing
        print("\n📋 Checking production_substages table...")
        if 'production_substages' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('production_substages')}
            
            columns_to_add = {
                'order': 'INTEGER',
            }
            
            for column, col_type in columns_to_add.items():
                if column not in existing_columns:
                    quoted_column = f'"{column}"' if column == 'order' else column
                    print(f"  ✅ Adding column: {column}")
                    conn.execute(text(f'ALTER TABLE production_substages ADD COLUMN {quoted_column} {col_type}'))
                    conn.commit()
                else:
                    print(f"  ⏭️  Column already exists: {column}")
        else:
            print("  ⚠️  production_substages table doesn't exist yet")
        
        # Migration 3: Add columns to production_tasks table
        print("\n📋 Checking production_tasks table...")
        if 'production_tasks' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('production_tasks')}
            
            # Check if assigned_to is INTEGER (user_id) or STRING (old format)
            if 'assigned_to' in existing_columns:
                columns_info = inspector.get_columns('production_tasks')
                assigned_to_col = next((col for col in columns_info if col['name'] == 'assigned_to'), None)
                
                if assigned_to_col and 'VARCHAR' in str(assigned_to_col['type']):
                    print("  🔄 Converting assigned_to from VARCHAR to INTEGER...")
                    # Drop old column and add new one
                    conn.execute(text('ALTER TABLE production_tasks DROP COLUMN assigned_to'))
                    conn.execute(text('ALTER TABLE production_tasks ADD COLUMN assigned_to INTEGER REFERENCES users(id)'))
                    conn.commit()
                    print("  ✅ Column converted successfully")
                else:
                    print("  ⏭️  assigned_to already correct type")
        
        # Migration 4: Add columns to scenes table
        print("\n📋 Checking scenes table...")
        if 'scenes' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('scenes')}
            
            if 'assigned_to' not in existing_columns:
                print("  ✅ Adding column: assigned_to")
                conn.execute(text('ALTER TABLE scenes ADD COLUMN assigned_to INTEGER REFERENCES users(id)'))
                conn.commit()
            else:
                print("  ⏭️  Column already exists: assigned_to")
        
        # Migration 5: Add columns to projects table
        print("\n📋 Checking projects table...")
        if 'projects' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('projects')}
            
            if 'created_by' not in existing_columns:
                print("  ✅ Adding column: created_by")
                conn.execute(text('ALTER TABLE projects ADD COLUMN created_by INTEGER REFERENCES users(id)'))
                conn.commit()
            else:
                print("  ⏭️  Column already exists: created_by")
        
        print("\n✅ All migrations completed successfully!")

if __name__ == "__main__":
    try:
        run_migrations()
        print("\n🎉 Database is up to date!")
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
