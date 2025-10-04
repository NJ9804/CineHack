from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.config.database import get_db
from app.models import GlobalCost
from pydantic import BaseModel

router = APIRouter()

class GlobalCostResponse(BaseModel):
    id: int
    name: str
    category: str
    billing_cycle: str
    cost: int
    description: str = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GlobalCostCreate(BaseModel):
    name: str
    category: str
    billing_cycle: str
    cost: int
    description: str = None

class GlobalCostUpdate(BaseModel):
    cost: int = None
    billing_cycle: str = None
    description: str = None

@router.get("/global-costs", response_model=List[GlobalCostResponse])
def get_all_global_costs(db: Session = Depends(get_db)):
    """
    Get all global costs
    """
    try:
        global_costs = db.query(GlobalCost).all()
        return global_costs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving global costs: {str(e)}")

@router.post("/global-costs", response_model=GlobalCostResponse)
def create_global_cost(global_cost: GlobalCostCreate, db: Session = Depends(get_db)):
    """
    Create a new global cost
    """
    try:
        db_global_cost = GlobalCost(**global_cost.dict())
        db.add(db_global_cost)
        db.commit()
        db.refresh(db_global_cost)
        return db_global_cost
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating global cost: {str(e)}")

@router.get("/global-costs/{cost_id}", response_model=GlobalCostResponse)
def get_global_cost_by_id(cost_id: int, db: Session = Depends(get_db)):
    """
    Get a specific global cost by ID
    """
    try:
        global_cost = db.query(GlobalCost).filter(GlobalCost.id == cost_id).first()
        if not global_cost:
            raise HTTPException(status_code=404, detail="Global cost not found")
        return global_cost
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving global cost: {str(e)}")

@router.get("/global-costs/category/{category}", response_model=List[GlobalCostResponse])
def get_global_costs_by_category(category: str, db: Session = Depends(get_db)):
    """
    Get all global costs filtered by category (actor/property/location)
    """
    try:
        # Validate category
        valid_categories = ["actor", "property", "location"]
        if category.lower() not in valid_categories:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
            )
        
        global_costs = db.query(GlobalCost).filter(
            GlobalCost.category.ilike(category)
        ).all()
        
        return global_costs
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving global costs by category: {str(e)}")

@router.delete("/global-costs/{cost_id}")
def delete_global_cost(cost_id: int, db: Session = Depends(get_db)):
    """
    Delete a global cost by ID
    """
    try:
        # Find the global cost
        global_cost = db.query(GlobalCost).filter(GlobalCost.id == cost_id).first()
        if not global_cost:
            raise HTTPException(status_code=404, detail="Global cost not found")
        
        # Delete the global cost
        db.delete(global_cost)
        db.commit()
        
        return {"message": f"Global cost with ID {cost_id} has been deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting global cost: {str(e)}")

@router.patch("/global-costs/{cost_id}", response_model=GlobalCostResponse)
def update_global_cost(cost_id: int, global_cost_update: GlobalCostUpdate, db: Session = Depends(get_db)):
    """
    Update cost, billing cycle, and/or description for a specific global cost by ID
    """
    try:
        # Find the global cost
        global_cost = db.query(GlobalCost).filter(GlobalCost.id == cost_id).first()
        if not global_cost:
            raise HTTPException(status_code=404, detail="Global cost not found")
        
        # Validate and update cost if provided
        if global_cost_update.cost is not None:
            if global_cost_update.cost < 0:
                raise HTTPException(
                    status_code=400, 
                    detail="Cost must be a positive integer"
                )
            global_cost.cost = global_cost_update.cost
        
        # Validate and update billing cycle if provided
        if global_cost_update.billing_cycle is not None:
            valid_billing_cycles = ["daily", "weekly", "monthly"]
            if global_cost_update.billing_cycle.lower() not in valid_billing_cycles:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid billing cycle. Must be one of: {', '.join(valid_billing_cycles)}"
                )
            global_cost.billing_cycle = global_cost_update.billing_cycle.lower()
        
        # Update description if provided
        if global_cost_update.description is not None:
            global_cost.description = global_cost_update.description
        
        db.commit()
        db.refresh(global_cost)
        
        return global_cost
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating global cost: {str(e)}")