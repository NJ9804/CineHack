from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.database_service import BudgetService
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/budget", tags=["budget"])

class BudgetLineCreate(BaseModel):
    category: str
    item_name: str
    allocated_amount: float
    notes: Optional[str] = None

class BudgetLineResponse(BaseModel):
    id: int
    category: str
    item_name: str
    allocated_amount: float
    spent_amount: float
    notes: Optional[str]
    
    class Config:
        from_attributes = True

@router.post("/projects/{project_id}/budget-lines", response_model=BudgetLineResponse)
async def create_budget_line(
    project_id: int, 
    budget_data: BudgetLineCreate, 
    db: Session = Depends(get_db)
):
    """Create a budget line item for a project."""
    service = BudgetService(db)
    budget_line = service.create_budget_line(
        project_id=project_id,
        category=budget_data.category,
        item_name=budget_data.item_name,
        allocated_amount=budget_data.allocated_amount
    )
    return budget_line

@router.get("/projects/{project_id}")
async def get_project_budget(project_id: int, db: Session = Depends(get_db)):
    """Get complete budget breakdown for a project."""
    service = BudgetService(db)
    budget = service.get_project_budget(project_id)
    return budget

@router.put("/projects/{project_id}/budget-lines/{line_id}/spend")
async def record_budget_spend(
    project_id: int, 
    line_id: int, 
    spend_amount: float, 
    db: Session = Depends(get_db)
):
    """Record spending against a budget line."""
    # Implementation would go here
    pass