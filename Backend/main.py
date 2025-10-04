from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from app.config.database import get_db, create_tables
from app.controllers import projects
from app.controllers import scripts
from app.controllers import catalog
from app.controllers import budget
from app.controllers import scenes
from app.controllers import characters
from app.controllers import production_stages
from app.controllers import auth
from app.controllers import members
from app.controllers import comments
from app.controllers import notifications
from app.controllers import schedule

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    yield
    # Shutdown (if needed)

app = FastAPI(title="Cinehack Celluloid API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(projects.router, prefix="/api", tags=["projects"])
app.include_router(scripts.router, prefix="/api", tags=["scripts"])
app.include_router(catalog.router, prefix="/api", tags=["catalog"])
app.include_router(budget.router, prefix="/api", tags=["budget"])
app.include_router(scenes.router, prefix="/api", tags=["scenes"])
app.include_router(characters.router, prefix="/api", tags=["characters"])
app.include_router(production_stages.router, prefix="/api", tags=["production-stages"])
app.include_router(members.router, prefix="/api", tags=["members"])
app.include_router(comments.router, prefix="/api", tags=["comments"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])
app.include_router(schedule.router, prefix="/api", tags=["schedule"])

@app.get("/")
def root():
    return {"message": "Cinehack Celluloid - Film Production ERP API", "status": "running"}

@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        # Test database connection
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        
        # Test if tables exist
        from app.models import Project, Scene, ScriptAnalysis
        project_count = db.query(Project).count()
        scene_count = db.query(Scene).count()
        analysis_count = db.query(ScriptAnalysis).count()
        
        return {
            "status": "healthy", 
            "database": "connected",
            "stats": {
                "projects": project_count,
                "scenes": scene_count,
                "script_analyses": analysis_count
            }
        }
    except Exception as e:
        return {"status": "healthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
