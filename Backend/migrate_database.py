"""
Database migration script to add new authentication-related columns
Run this script to update your existing database with the new auth system columns
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://neondb_owner:npg_SEVJwB4hd0oz@ep-red-rice-a1ybu5go-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

engine = create_engine(DATABASE_URL)

# SQL statements to add new columns and tables
migrations = [
    # Create users table
    """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        username VARCHAR UNIQUE NOT NULL,
        hashed_password VARCHAR NOT NULL,
        full_name VARCHAR,
        avatar_url VARCHAR,
        phone VARCHAR,
        is_active BOOLEAN DEFAULT TRUE,
        is_superuser BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    );
    """,
    
    # Add created_by to projects (if not exists)
    """
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='projects' AND column_name='created_by'
        ) THEN
            ALTER TABLE projects ADD COLUMN created_by INTEGER REFERENCES users(id);
        END IF;
    END $$;
    """,
    
    # Create project_members table
    """
    CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR NOT NULL,
        permissions JSON,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invited_by INTEGER REFERENCES users(id)
    );
    """,
    
    # Create comments table
    """
    CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        entity_type VARCHAR NOT NULL,
        entity_id INTEGER NOT NULL,
        parent_comment_id INTEGER REFERENCES comments(id),
        is_resolved BOOLEAN DEFAULT FALSE,
        is_edited BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    
    # Create notifications table
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR NOT NULL,
        message TEXT NOT NULL,
        notification_type VARCHAR,
        entity_type VARCHAR,
        entity_id INTEGER,
        is_read BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        action_url VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
    );
    """,
    
    # Add assigned_to to scenes (if not exists)
    """
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='scenes' AND column_name='assigned_to'
        ) THEN
            ALTER TABLE scenes ADD COLUMN assigned_to INTEGER REFERENCES users(id);
        END IF;
    END $$;
    """,
    
    # Update production_tasks assigned_to to be INTEGER (if it's VARCHAR)
    """
    DO $$ 
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='production_tasks' AND column_name='assigned_to' 
            AND data_type='character varying'
        ) THEN
            ALTER TABLE production_tasks ALTER COLUMN assigned_to TYPE INTEGER USING NULL;
            ALTER TABLE production_tasks ADD CONSTRAINT fk_tasks_user 
                FOREIGN KEY (assigned_to) REFERENCES users(id);
        ELSIF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='production_tasks' AND column_name='assigned_to'
        ) THEN
            ALTER TABLE production_tasks ADD COLUMN assigned_to INTEGER REFERENCES users(id);
        END IF;
    END $$;
    """,
    
    # Create indexes for better performance
    """
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
    """
]

def run_migrations():
    """Run all migration SQL statements"""
    print("🚀 Starting database migration...")
    
    with engine.connect() as conn:
        for i, migration in enumerate(migrations, 1):
            try:
                print(f"Running migration {i}/{len(migrations)}...")
                conn.execute(text(migration))
                conn.commit()
                print(f"✅ Migration {i} completed successfully")
            except Exception as e:
                print(f"⚠️  Migration {i} warning/error: {e}")
                print("Continuing with next migration...")
                conn.rollback()
    
    print("\n✨ Migration completed!")
    print("You can now start your application.")

if __name__ == "__main__":
    run_migrations()
