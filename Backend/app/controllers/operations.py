"""
Production Operations Controller
Handles rentals, hotels, purchases, actor availability, catering, transportation, and junior artists
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.config.database import get_db
from app.models import (
    RentalItem, Purchase, HotelBooking, ActorAvailability, 
    FoodCatering, Transportation, JuniorArtist, JuniorArtistAttendance,
    User, Project, Actor, Scene
)
from app.utils.auth import get_current_user

router = APIRouter()


# ============= Pydantic Models =============

# Rental Models
class RentalItemCreate(BaseModel):
    project_id: int
    item_name: str
    item_type: str
    category: Optional[str] = None
    description: Optional[str] = None
    quantity: int = 1
    vendor_name: str
    vendor_contact: Optional[str] = None
    vendor_email: Optional[str] = None
    vendor_address: Optional[str] = None
    rental_start_date: datetime
    rental_end_date: datetime
    daily_rate: float = 0.0
    security_deposit: float = 0.0
    assigned_to: Optional[int] = None
    department: Optional[str] = None
    notes: Optional[str] = None

class RentalItemUpdate(BaseModel):
    item_name: Optional[str] = None
    status: Optional[str] = None
    actual_return_date: Optional[datetime] = None
    condition_on_return: Optional[str] = None
    penalty_charges: Optional[float] = None
    notes: Optional[str] = None


# Purchase Models
class PurchaseCreate(BaseModel):
    project_id: int
    item_name: str
    category: str
    description: Optional[str] = None
    quantity: int = 1
    unit: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_contact: Optional[str] = None
    unit_price: float = 0.0
    total_amount: float
    tax_amount: float = 0.0
    discount: float = 0.0
    final_amount: float
    payment_method: Optional[str] = None
    payment_status: str = "pending"
    purchase_date: datetime
    department: Optional[str] = None
    purpose: Optional[str] = None
    scene_id: Optional[int] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

class PurchaseUpdate(BaseModel):
    payment_status: Optional[str] = None
    reimbursement_status: Optional[str] = None
    approved_by: Optional[int] = None
    approval_status: Optional[str] = None
    notes: Optional[str] = None


# Hotel Models
class HotelBookingCreate(BaseModel):
    project_id: int
    hotel_name: str
    hotel_address: Optional[str] = None
    hotel_contact: Optional[str] = None
    room_type: str
    number_of_rooms: int = 1
    guest_name: str
    guest_role: Optional[str] = None
    guest_contact: Optional[str] = None
    actor_id: Optional[int] = None
    user_id: Optional[int] = None
    check_in_date: datetime
    check_out_date: datetime
    room_rate_per_night: float
    meals_included: bool = False
    meal_plan: Optional[str] = None
    shooting_location: Optional[str] = None
    scene_ids: Optional[List[int]] = None
    notes: Optional[str] = None

class HotelBookingUpdate(BaseModel):
    booking_status: Optional[str] = None
    actual_check_in: Optional[datetime] = None
    actual_check_out: Optional[datetime] = None
    payment_status: Optional[str] = None
    advance_paid: Optional[float] = None
    notes: Optional[str] = None


# Actor Availability Models
class ActorAvailabilityCreate(BaseModel):
    actor_id: int
    project_id: int
    start_date: datetime
    end_date: datetime
    availability_status: str = "available"
    scene_ids: Optional[List[int]] = None
    shoot_location: Optional[str] = None
    call_time: Optional[str] = None
    role_character: Optional[str] = None
    requires_travel: bool = False
    accommodation_needed: bool = False
    notes: Optional[str] = None

class ActorAvailabilityUpdate(BaseModel):
    availability_status: Optional[str] = None
    confirmed_by_actor: Optional[bool] = None
    scene_ids: Optional[List[int]] = None
    notes: Optional[str] = None


# Food Catering Models
class FoodCateringCreate(BaseModel):
    project_id: int
    catering_date: datetime
    meal_type: str
    shoot_location: Optional[str] = None
    total_people: int
    actors_count: int = 0
    crew_count: int = 0
    junior_artists_count: int = 0
    vendor_name: str
    vendor_contact: Optional[str] = None
    menu_details: Optional[List[dict]] = None
    vegetarian_count: int = 0
    non_vegetarian_count: int = 0
    per_person_cost: float = 0.0
    total_cost: float
    delivery_time: Optional[str] = None
    scene_ids: Optional[List[int]] = None
    notes: Optional[str] = None

class FoodCateringUpdate(BaseModel):
    status: Optional[str] = None
    actual_delivery_time: Optional[str] = None
    payment_status: Optional[str] = None
    quality_rating: Optional[int] = None
    feedback: Optional[str] = None


# Transportation Models
class TransportationCreate(BaseModel):
    project_id: int
    vehicle_type: str
    vehicle_number: Optional[str] = None
    ownership: str
    driver_name: Optional[str] = None
    driver_contact: Optional[str] = None
    usage_date: datetime
    purpose: str
    from_location: str
    to_location: str
    distance_km: Optional[float] = None
    fuel_type: Optional[str] = None
    fuel_quantity_liters: Optional[float] = None
    fuel_cost: Optional[float] = None
    toll_charges: float = 0.0
    parking_charges: float = 0.0
    rental_charges: float = 0.0
    assigned_to: Optional[int] = None
    department: Optional[str] = None
    scene_ids: Optional[List[int]] = None
    notes: Optional[str] = None

class TransportationUpdate(BaseModel):
    status: Optional[str] = None
    end_odometer: Optional[float] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


# Junior Artist Models
class JuniorArtistCreate(BaseModel):
    project_id: int
    name: str
    contact_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    daily_rate: float
    special_skills: Optional[List[str]] = None
    agency_name: Optional[str] = None
    agency_contact: Optional[str] = None
    notes: Optional[str] = None

class JuniorArtistAttendanceCreate(BaseModel):
    junior_artist_id: int
    project_id: int
    attendance_date: datetime
    scene_ids: Optional[List[int]] = None
    shoot_location: Optional[str] = None
    role_description: Optional[str] = None
    call_time: Optional[str] = None
    attendance_status: str = "scheduled"
    payment_amount: Optional[float] = None
    notes: Optional[str] = None


# ============= RENTAL ITEMS ENDPOINTS =============

@router.post("/rentals")
async def create_rental_item(
    rental: RentalItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new rental item tracking"""
    
    # Calculate total cost
    days = (rental.rental_end_date - rental.rental_start_date).days + 1
    total_cost = rental.daily_rate * days
    
    db_rental = RentalItem(
        **rental.dict(),
        total_cost=total_cost,
        created_by=current_user.id
    )
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    
    return {"message": "Rental item created successfully", "rental": db_rental}


@router.get("/rentals/{project_id}")
async def get_project_rentals(
    project_id: int,
    status: Optional[str] = None,
    item_type: Optional[str] = None,
    overdue_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all rental items for a project with filters"""
    
    query = db.query(RentalItem).filter(RentalItem.project_id == project_id)
    
    if status:
        query = query.filter(RentalItem.status == status)
    
    if item_type:
        query = query.filter(RentalItem.item_type == item_type)
    
    if overdue_only:
        today = datetime.now()
        query = query.filter(
            and_(
                RentalItem.rental_end_date < today,
                RentalItem.actual_return_date.is_(None),
                RentalItem.status != "returned"
            )
        )
    
    rentals = query.order_by(RentalItem.rental_end_date).all()
    
    return {"rentals": rentals, "count": len(rentals)}


@router.put("/rentals/{rental_id}")
async def update_rental_item(
    rental_id: int,
    rental_update: RentalItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update rental item (e.g., mark as returned)"""
    
    rental = db.query(RentalItem).filter(RentalItem.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental item not found")
    
    update_data = rental_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rental, key, value)
    
    # Calculate penalty if overdue
    if rental.actual_return_date and rental.actual_return_date > rental.rental_end_date:
        overdue_days = (rental.actual_return_date - rental.rental_end_date).days
        if rental.penalty_charges is None or rental.penalty_charges == 0:
            rental.penalty_charges = overdue_days * rental.daily_rate * 0.5  # 50% penalty
    
    db.commit()
    db.refresh(rental)
    
    return {"message": "Rental updated successfully", "rental": rental}


@router.delete("/rentals/{rental_id}")
async def delete_rental_item(
    rental_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a rental item"""
    
    rental = db.query(RentalItem).filter(RentalItem.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Rental item not found")
    
    db.delete(rental)
    db.commit()
    
    return {"message": "Rental deleted successfully"}


@router.get("/rentals/overdue/{project_id}")
async def get_overdue_rentals(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all overdue rental items that need to be returned"""
    
    today = datetime.now()
    overdue = db.query(RentalItem).filter(
        and_(
            RentalItem.project_id == project_id,
            RentalItem.rental_end_date < today,
            RentalItem.actual_return_date.is_(None),
            RentalItem.status.in_(["picked_up", "in_use"])
        )
    ).all()
    
    return {"overdue_rentals": overdue, "count": len(overdue)}


# ============= PURCHASES ENDPOINTS =============

@router.post("/purchases")
async def create_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a new purchase"""
    
    db_purchase = Purchase(
        **purchase.dict(),
        requested_by=current_user.id,
        paid_by=current_user.id
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    
    return {"message": "Purchase recorded successfully", "purchase": db_purchase}


@router.get("/purchases/{project_id}")
async def get_project_purchases(
    project_id: int,
    category: Optional[str] = None,
    payment_status: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all purchases for a project with filters"""
    
    query = db.query(Purchase).filter(Purchase.project_id == project_id)
    
    if category:
        query = query.filter(Purchase.category == category)
    
    if payment_status:
        query = query.filter(Purchase.payment_status == payment_status)
    
    if start_date:
        query = query.filter(Purchase.purchase_date >= start_date)
    
    if end_date:
        query = query.filter(Purchase.purchase_date <= end_date)
    
    purchases = query.order_by(Purchase.purchase_date.desc()).all()
    
    # Calculate totals
    total_spent = sum(p.final_amount for p in purchases)
    
    return {
        "purchases": purchases,
        "count": len(purchases),
        "total_spent": total_spent
    }


@router.put("/purchases/{purchase_id}")
async def update_purchase(
    purchase_id: int,
    purchase_update: PurchaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update purchase details"""
    
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    update_data = purchase_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(purchase, key, value)
    
    db.commit()
    db.refresh(purchase)
    
    return {"message": "Purchase updated successfully", "purchase": purchase}


# ============= HOTEL BOOKINGS ENDPOINTS =============

@router.post("/hotels")
async def create_hotel_booking(
    booking: HotelBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a hotel booking"""
    
    # Calculate costs
    nights = (booking.check_out_date - booking.check_in_date).days
    total_cost = booking.room_rate_per_night * nights * booking.number_of_rooms
    
    # Generate booking reference
    booking_ref = f"HB-{booking.project_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    db_booking = HotelBooking(
        **booking.dict(),
        total_nights=nights,
        total_cost=total_cost,
        balance_amount=total_cost,
        booking_reference=booking_ref,
        booked_by=current_user.id
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    return {"message": "Hotel booking created successfully", "booking": db_booking}


@router.get("/hotels/{project_id}")
async def get_project_hotels(
    project_id: int,
    status: Optional[str] = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all hotel bookings for a project"""
    
    query = db.query(HotelBooking).filter(HotelBooking.project_id == project_id)
    
    if status:
        query = query.filter(HotelBooking.booking_status == status)
    
    if upcoming_only:
        today = datetime.now()
        query = query.filter(HotelBooking.check_in_date >= today)
    
    bookings = query.order_by(HotelBooking.check_in_date).all()
    
    return {"bookings": bookings, "count": len(bookings)}


@router.put("/hotels/{booking_id}")
async def update_hotel_booking(
    booking_id: int,
    booking_update: HotelBookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update hotel booking (check-in, check-out, payment)"""
    
    booking = db.query(HotelBooking).filter(HotelBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = booking_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(booking, key, value)
    
    # Update balance if advance paid
    if booking_update.advance_paid is not None:
        booking.balance_amount = booking.total_cost - booking.advance_paid
    
    db.commit()
    db.refresh(booking)
    
    return {"message": "Booking updated successfully", "booking": booking}


# ============= ACTOR AVAILABILITY ENDPOINTS =============

@router.post("/actor-availability")
async def create_actor_availability(
    availability: ActorAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create or update actor availability"""
    
    db_availability = ActorAvailability(
        **availability.dict(),
        created_by=current_user.id
    )
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    
    return {"message": "Actor availability created", "availability": db_availability}


@router.get("/actor-availability/{project_id}")
async def get_actor_availability(
    project_id: int,
    actor_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get actor availability for a project"""
    
    query = db.query(ActorAvailability).filter(ActorAvailability.project_id == project_id)
    
    if actor_id:
        query = query.filter(ActorAvailability.actor_id == actor_id)
    
    if start_date:
        query = query.filter(ActorAvailability.end_date >= start_date)
    
    if end_date:
        query = query.filter(ActorAvailability.start_date <= end_date)
    
    if status:
        query = query.filter(ActorAvailability.availability_status == status)
    
    availabilities = query.order_by(ActorAvailability.start_date).all()
    
    return {"availabilities": availabilities, "count": len(availabilities)}


@router.put("/actor-availability/{availability_id}")
async def update_actor_availability(
    availability_id: int,
    availability_update: ActorAvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update actor availability"""
    
    availability = db.query(ActorAvailability).filter(
        ActorAvailability.id == availability_id
    ).first()
    
    if not availability:
        raise HTTPException(status_code=404, detail="Availability record not found")
    
    update_data = availability_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(availability, key, value)
    
    if availability_update.confirmed_by_actor:
        availability.confirmation_date = datetime.now()
    
    db.commit()
    db.refresh(availability)
    
    return {"message": "Availability updated", "availability": availability}


# ============= FOOD CATERING ENDPOINTS =============

@router.post("/catering")
async def create_catering_order(
    catering: FoodCateringCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a food catering order"""
    
    db_catering = FoodCatering(
        **catering.dict(),
        ordered_by=current_user.id
    )
    db.add(db_catering)
    db.commit()
    db.refresh(db_catering)
    
    return {"message": "Catering order created", "catering": db_catering}


@router.get("/catering/{project_id}")
async def get_project_catering(
    project_id: int,
    date: Optional[datetime] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get catering orders for a project"""
    
    query = db.query(FoodCatering).filter(FoodCatering.project_id == project_id)
    
    if date:
        query = query.filter(func.date(FoodCatering.catering_date) == date.date())
    
    if status:
        query = query.filter(FoodCatering.status == status)
    
    orders = query.order_by(FoodCatering.catering_date.desc()).all()
    
    total_cost = sum(o.total_cost for o in orders)
    
    return {"catering_orders": orders, "count": len(orders), "total_cost": total_cost}


@router.put("/catering/{catering_id}")
async def update_catering_order(
    catering_id: int,
    catering_update: FoodCateringUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update catering order"""
    
    catering = db.query(FoodCatering).filter(FoodCatering.id == catering_id).first()
    if not catering:
        raise HTTPException(status_code=404, detail="Catering order not found")
    
    update_data = catering_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(catering, key, value)
    
    db.commit()
    db.refresh(catering)
    
    return {"message": "Catering order updated", "catering": catering}


# ============= TRANSPORTATION ENDPOINTS =============

@router.post("/transportation")
async def create_transportation_record(
    transport: TransportationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a transportation/fuel record"""
    
    # Calculate total cost
    total_cost = (
        (transport.fuel_cost or 0) +
        transport.toll_charges +
        transport.parking_charges +
        transport.rental_charges
    )
    
    db_transport = Transportation(
        **transport.dict(),
        total_cost=total_cost,
        created_by=current_user.id
    )
    db.add(db_transport)
    db.commit()
    db.refresh(db_transport)
    
    return {"message": "Transportation record created", "transport": db_transport}


@router.get("/transportation/{project_id}")
async def get_project_transportation(
    project_id: int,
    vehicle_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transportation records for a project"""
    
    query = db.query(Transportation).filter(Transportation.project_id == project_id)
    
    if vehicle_type:
        query = query.filter(Transportation.vehicle_type == vehicle_type)
    
    if start_date:
        query = query.filter(Transportation.usage_date >= start_date)
    
    if end_date:
        query = query.filter(Transportation.usage_date <= end_date)
    
    records = query.order_by(Transportation.usage_date.desc()).all()
    
    # Calculate totals
    total_fuel_cost = sum(r.fuel_cost or 0 for r in records)
    total_distance = sum(r.distance_km or 0 for r in records)
    total_cost = sum(r.total_cost or 0 for r in records)
    
    return {
        "transportation_records": records,
        "count": len(records),
        "total_fuel_cost": total_fuel_cost,
        "total_distance_km": total_distance,
        "total_cost": total_cost
    }


@router.put("/transportation/{transport_id}")
async def update_transportation_record(
    transport_id: int,
    transport_update: TransportationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update transportation record"""
    
    transport = db.query(Transportation).filter(Transportation.id == transport_id).first()
    if not transport:
        raise HTTPException(status_code=404, detail="Transportation record not found")
    
    update_data = transport_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(transport, key, value)
    
    # Recalculate distance if odometer readings updated
    if transport_update.end_odometer and transport.start_odometer:
        transport.distance_km = transport.end_odometer - transport.start_odometer
    
    db.commit()
    db.refresh(transport)
    
    return {"message": "Transportation record updated", "transport": transport}


# ============= JUNIOR ARTISTS ENDPOINTS =============

@router.post("/junior-artists")
async def create_junior_artist(
    artist: JuniorArtistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a junior artist to the project"""
    
    db_artist = JuniorArtist(**artist.dict())
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    
    return {"message": "Junior artist added", "artist": db_artist}


@router.get("/junior-artists/{project_id}")
async def get_project_junior_artists(
    project_id: int,
    available_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all junior artists for a project"""
    
    query = db.query(JuniorArtist).filter(JuniorArtist.project_id == project_id)
    
    if available_only:
        query = query.filter(JuniorArtist.is_available == True)
    
    artists = query.all()
    
    return {"junior_artists": artists, "count": len(artists)}


@router.post("/junior-artists/attendance")
async def mark_junior_artist_attendance(
    attendance: JuniorArtistAttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark attendance for a junior artist"""
    
    # Get artist's daily rate if payment not specified
    if not attendance.payment_amount:
        artist = db.query(JuniorArtist).filter(
            JuniorArtist.id == attendance.junior_artist_id
        ).first()
        if artist:
            attendance.payment_amount = artist.daily_rate
    
    db_attendance = JuniorArtistAttendance(
        **attendance.dict(),
        total_payment=attendance.payment_amount or 0,
        marked_by=current_user.id
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    return {"message": "Attendance marked", "attendance": db_attendance}


@router.get("/junior-artists/attendance/{project_id}")
async def get_junior_artist_attendance(
    project_id: int,
    date: Optional[datetime] = None,
    artist_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get junior artist attendance records"""
    
    query = db.query(JuniorArtistAttendance).filter(
        JuniorArtistAttendance.project_id == project_id
    )
    
    if date:
        query = query.filter(func.date(JuniorArtistAttendance.attendance_date) == date.date())
    
    if artist_id:
        query = query.filter(JuniorArtistAttendance.junior_artist_id == artist_id)
    
    records = query.order_by(JuniorArtistAttendance.attendance_date.desc()).all()
    
    total_payment = sum(r.total_payment or 0 for r in records)
    
    return {
        "attendance_records": records,
        "count": len(records),
        "total_payment": total_payment
    }


# ============= DASHBOARD & ANALYTICS =============

@router.get("/dashboard/{project_id}")
async def get_operations_dashboard(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get comprehensive operations dashboard for a project"""
    
    today = datetime.now()
    
    # Overdue rentals
    overdue_rentals = db.query(RentalItem).filter(
        and_(
            RentalItem.project_id == project_id,
            RentalItem.rental_end_date < today,
            RentalItem.actual_return_date.is_(None),
            RentalItem.status.in_(["picked_up", "in_use"])
        )
    ).count()
    
    # Upcoming check-ins (next 7 days)
    upcoming_checkins = db.query(HotelBooking).filter(
        and_(
            HotelBooking.project_id == project_id,
            HotelBooking.check_in_date >= today,
            HotelBooking.check_in_date <= today + timedelta(days=7),
            HotelBooking.booking_status.in_(["confirmed", "pending"])
        )
    ).count()
    
    # Pending payments
    pending_purchases = db.query(Purchase).filter(
        and_(
            Purchase.project_id == project_id,
            Purchase.payment_status == "pending"
        )
    ).count()
    
    # Today's catering
    todays_catering = db.query(FoodCatering).filter(
        and_(
            FoodCatering.project_id == project_id,
            func.date(FoodCatering.catering_date) == today.date()
        )
    ).all()
    
    # Actor availability today
    actors_available_today = db.query(ActorAvailability).filter(
        and_(
            ActorAvailability.project_id == project_id,
            ActorAvailability.start_date <= today,
            ActorAvailability.end_date >= today,
            ActorAvailability.availability_status == "available"
        )
    ).count()
    
    # Monthly transportation costs
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    transport_cost = db.query(func.sum(Transportation.total_cost)).filter(
        and_(
            Transportation.project_id == project_id,
            Transportation.usage_date >= month_start
        )
    ).scalar() or 0
    
    # Junior artists for today
    todays_artists = db.query(JuniorArtistAttendance).filter(
        and_(
            JuniorArtistAttendance.project_id == project_id,
            func.date(JuniorArtistAttendance.attendance_date) == today.date()
        )
    ).count()
    
    return {
        "alerts": {
            "overdue_rentals": overdue_rentals,
            "upcoming_checkins": upcoming_checkins,
            "pending_payments": pending_purchases
        },
        "today": {
            "catering_orders": len(todays_catering),
            "catering_people": sum(c.total_people for c in todays_catering),
            "actors_available": actors_available_today,
            "junior_artists": todays_artists
        },
        "monthly": {
            "transportation_cost": float(transport_cost)
        }
    }
