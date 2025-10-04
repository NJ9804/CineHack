"""
Script to populate sample sub-stages for existing production stages
"""

import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config.database import DATABASE_URL
from app.models import ProductionStage, ProductionSubStage, ProductionTask

def create_substages():
    """Create sample sub-stages for existing production stages"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get all existing production stages
        stages = db.query(ProductionStage).all()
        print(f"Found {len(stages)} production stages")
        
        # Define sub-stages for each main stage
        substage_templates = {
            "Development": [
                {"name": "Script Writing", "description": "Write initial screenplay and treatment", "order": 1},
                {"name": "Story Development", "description": "Refine plot, characters, and narrative structure", "order": 2},
                {"name": "Script Revision", "description": "Review and revise script based on feedback", "order": 3},
                {"name": "Legal & Rights", "description": "Secure rights and legal clearances", "order": 4}
            ],
            "Pre-Production": [
                {"name": "Casting", "description": "Audition and select actors for all roles", "order": 1},
                {"name": "Location Scouting", "description": "Find and secure filming locations", "order": 2},
                {"name": "Crew Hiring", "description": "Assemble production crew and department heads", "order": 3},
                {"name": "Equipment Planning", "description": "Plan and secure cameras, lighting, and audio equipment", "order": 4},
                {"name": "Storyboarding", "description": "Create visual storyboards for key scenes", "order": 5},
                {"name": "Scheduling", "description": "Create detailed shooting schedule", "order": 6}
            ],
            "Production": [
                {"name": "Principal Photography", "description": "Main filming of all scenes", "order": 1},
                {"name": "Pick-up Shots", "description": "Additional shots and coverage", "order": 2},
                {"name": "B-Roll Filming", "description": "Supplementary footage and cutaways", "order": 3},
                {"name": "Interviews", "description": "Film interviews and talking heads if applicable", "order": 4}
            ],
            "Post-Production": [
                {"name": "Rough Cut", "description": "Initial assembly of footage", "order": 1},
                {"name": "Fine Cut", "description": "Detailed editing and scene refinement", "order": 2},
                {"name": "Visual Effects", "description": "Create and integrate VFX elements", "order": 3},
                {"name": "Color Correction", "description": "Color grading and visual consistency", "order": 4},
                {"name": "Sound Design", "description": "Create and mix audio elements", "order": 5},
                {"name": "Music Composition", "description": "Compose and record musical score", "order": 6},
                {"name": "Final Mix", "description": "Final audio mixing and mastering", "order": 7}
            ],
            "Distribution": [
                {"name": "Marketing Strategy", "description": "Develop marketing and promotional strategy", "order": 1},
                {"name": "Festival Submissions", "description": "Submit to film festivals", "order": 2},
                {"name": "Distribution Deals", "description": "Negotiate distribution agreements", "order": 3},
                {"name": "Release Preparation", "description": "Prepare for theatrical or digital release", "order": 4}
            ]
        }
        
        for stage in stages:
            if stage.name in substage_templates:
                print(f"\nCreating sub-stages for: {stage.name}")
                
                # Check if sub-stages already exist
                existing_substages = db.query(ProductionSubStage).filter(
                    ProductionSubStage.stage_id == stage.id
                ).count()
                
                if existing_substages > 0:
                    print(f"  Sub-stages already exist ({existing_substages}), skipping...")
                    continue
                
                # Create sub-stages
                for template in substage_templates[stage.name]:
                    substage = ProductionSubStage(
                        stage_id=stage.id,
                        name=template["name"],
                        description=template["description"],
                        sub_stage_order=template["order"],
                        status="not_started",
                        progress_percentage=0.0
                    )
                    db.add(substage)
                    print(f"  ✅ Created: {template['name']}")
                
                db.commit()
            else:
                print(f"No template found for stage: {stage.name}")
        
        print(f"\n🎉 Sub-stages creation completed!")
        
        # Show summary
        total_substages = db.query(ProductionSubStage).count()
        print(f"Total sub-stages in database: {total_substages}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_substages()