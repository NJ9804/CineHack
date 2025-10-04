from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.config.database import get_db
from app.services.youtube_service import youtube_service
from app.models import Promotion
import json

router = APIRouter(prefix="/promotions", tags=["promotions"])

class PromotionCreate(BaseModel):
    film: str
    project_id: int | None = None

@router.post("")
async def create_promotion(payload: PromotionCreate, db: Session = Depends(get_db)):
    try:
        report = youtube_service.film_report(payload.film)
        if report.get("message") == "No videos found":
            raise HTTPException(status_code=404, detail="No videos found for the provided film")

        # Save to DB if project_id provided
        promo = Promotion(
            project_id=payload.project_id,
            film=report.get("film"),
            total_views=report.get("total_views", 0),
            total_likes=report.get("total_likes", 0),
            total_comments=report.get("total_comments", 0),
            videos=report.get("videos"),
            industry_progress=report.get("industry_progress")
        )
        db.add(promo)
        db.commit()
        db.refresh(promo)

        return {"success": True, "promotion_id": promo.id, "report": report}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
async def list_promotions(db: Session = Depends(get_db)):
    promos = db.query(Promotion).order_by(Promotion.created_at.desc()).all()
    return {"promotions": [
        {
            "id": p.id,
            "project_id": p.project_id,
            "film": p.film,
            "total_views": p.total_views,
            "total_likes": p.total_likes,
            "total_comments": p.total_comments,
            "videos": p.videos,
            "industry_progress": p.industry_progress,
            "created_at": p.created_at.isoformat() if p.created_at else None
        } for p in promos
    ]}

@router.get("/{promotion_id}")
async def get_promotion(promotion_id: int, db: Session = Depends(get_db)):
    p = db.query(Promotion).filter(Promotion.id == promotion_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {
        "id": p.id,
        "project_id": p.project_id,
        "film": p.film,
        "total_views": p.total_views,
        "total_likes": p.total_likes,
        "total_comments": p.total_comments,
        "videos": p.videos,
        "industry_progress": p.industry_progress,
        "created_at": p.created_at.isoformat() if p.created_at else None
    }

@router.get("/projects/{project_id}")
async def get_project_promotions(project_id: int, db: Session = Depends(get_db)):
    promos = db.query(Promotion).filter(Promotion.project_id == project_id).order_by(Promotion.created_at.desc()).all()
    return {"project_id": project_id, "promotions": [
        {
            "id": p.id,
            "film": p.film,
            "total_views": p.total_views,
            "total_likes": p.total_likes,
            "total_comments": p.total_comments,
            "videos": p.videos,
            "industry_progress": p.industry_progress,
            "created_at": p.created_at.isoformat() if p.created_at else None
        } for p in promos
    ]}
