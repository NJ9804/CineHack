"""
Fix Production Stages Table - Add all missing columns
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config.database import DATABASE_URL

def fix_production_stages():
    """Add all missing columns to production_stages and related tables"""
    engine = create_engine(DATABASE_URL)
    
    print("🔧 Fixing production_stages tables...")
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        
        # Define all columns needed for production_stages
        production_stages_columns = {
            'order': ('INTEGER', '0'),
            'progress': ('INTEGER', '0'),
            'start_date': ('TIMESTAMP', 'NULL'),
            'end_date': ('TIMESTAMP', 'NULL'),
            'estimated_duration_days': ('INTEGER', 'NULL'),
            'actual_duration_days': ('INTEGER', 'NULL'),
            'budget_allocated': ('DOUBLE PRECISION', '0.0'),
            'budget_spent': ('DOUBLE PRECISION', '0.0'),
            'notes': ('TEXT', 'NULL'),
        }
        
        if 'production_stages' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('production_stages')}
            
            for column, (col_type, default_val) in production_stages_columns.items():
                if column not in existing_columns:
                    quoted_column = f'"{column}"' if column in ['order'] else column
                    
                    if default_val == 'NULL':
                        sql = f'ALTER TABLE production_stages ADD COLUMN {quoted_column} {col_type}'
                    else:
                        sql = f'ALTER TABLE production_stages ADD COLUMN {quoted_column} {col_type} DEFAULT {default_val}'
                    
                    print(f"  ✅ Adding column: {column} ({col_type})")
                    conn.execute(text(sql))
                    conn.commit()
                else:
                    print(f"  ⏭️  Column exists: {column}")
        
        # Define all columns needed for production_substages
        production_substages_columns = {
            'order': ('INTEGER', '0'),
            'progress': ('INTEGER', '0'),
            'priority': ('VARCHAR', "'medium'"),
            'assigned_to': ('VARCHAR', 'NULL'),
            'start_date': ('TIMESTAMP', 'NULL'),
            'end_date': ('TIMESTAMP', 'NULL'),
            'estimated_hours': ('INTEGER', 'NULL'),
            'actual_hours': ('INTEGER', 'NULL'),
            'dependencies': ('JSON', 'NULL'),
            'deliverables': ('JSON', 'NULL'),
            'notes': ('TEXT', 'NULL'),
        }
        
        if 'production_substages' in inspector.get_table_names():
            existing_columns = {col['name'] for col in inspector.get_columns('production_substages')}
            
            for column, (col_type, default_val) in production_substages_columns.items():
                if column not in existing_columns:
                    quoted_column = f'"{column}"' if column in ['order'] else column
                    
                    if default_val == 'NULL':
                        sql = f'ALTER TABLE production_substages ADD COLUMN {quoted_column} {col_type}'
                    else:
                        sql = f'ALTER TABLE production_substages ADD COLUMN {quoted_column} {col_type} DEFAULT {default_val}'
                    
                    print(f"  ✅ Adding production_substages column: {column} ({col_type})")
                    conn.execute(text(sql))
                    conn.commit()
                else:
                    print(f"  ⏭️  production_substages column exists: {column}")
        
        print("\n✅ Production stages tables fixed!")

if __name__ == "__main__":
    try:
        fix_production_stages()
        print("\n🎉 Database updated successfully!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
