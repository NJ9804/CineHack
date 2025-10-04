# Production Operations Management System

## Overview

A comprehensive production operations management system that helps film production teams track and manage all operational aspects of their production. This system eliminates the risk of missed returns, overspending, and operational chaos by providing a centralized platform for managing:

- **Rentals** - Equipment, costumes, props, art production items
- **Hotels** - Accommodation management for cast and crew
- **Purchases** - All production purchases and expenses
- **Actor Availability** - Schedule and availability tracking
- **Food & Catering** - Daily meal planning and vendor management
- **Transportation** - Vehicle and fuel tracking
- **Junior Artists** - Extras and junior artists management

## Features

### 1. Rental Management

**Purpose**: Track all rented items to avoid late returns and penalty charges.

**Features**:
- Track equipment, costumes, props, art production items, and vehicles
- Vendor management with contact details
- Automatic penalty calculation for overdue items
- Return reminders and alerts
- Cost tracking with daily rates and security deposits
- Condition tracking (on pickup and return)
- Department-wise categorization

**Workflow**:
1. Add rental item with start/end dates
2. System calculates total cost based on daily rate
3. Track status: Reserved → Picked Up → In Use → Returned
4. Get alerts for items approaching return date
5. Mark as returned and system calculates penalties if overdue

### 2. Hotel Bookings

**Purpose**: Manage accommodations for cast and crew without confusion.

**Features**:
- Hotel booking management with check-in/check-out tracking
- Guest management (actors, directors, crew)
- Room type and rate tracking
- Meal plan management
- Payment tracking (advance, balance)
- Location-based grouping for shoots
- Check-in/check-out reminders

**Workflow**:
1. Create booking with guest details and dates
2. System generates unique booking reference
3. Calculates total cost based on nights and rooms
4. Track status: Pending → Confirmed → Checked In → Checked Out
5. Payment tracking throughout the stay

### 3. Purchase Tracking

**Purpose**: Track all production purchases and prevent budget overruns.

**Features**:
- Categorized purchase tracking (art supplies, props, costumes, consumables, etc.)
- Vendor management
- Payment method tracking
- Reimbursement workflow
- Invoice and receipt management
- Department-wise expense tracking
- Scene-based cost allocation
- Approval workflow

**Workflow**:
1. Record purchase with all details
2. Upload invoice/receipt
3. Track payment status
4. Handle reimbursement requests
5. Generate expense reports by category/department

### 4. Actor Availability

**Purpose**: Know exactly when actors are available for shoots.

**Features**:
- Availability calendar for all actors
- Scene-based scheduling
- Conflict detection
- Call time management
- Location assignment
- Travel and accommodation tracking
- Confirmation tracking
- Reminders and notifications

**Workflow**:
1. Add actor availability for date range
2. Set status: Available / Tentative / Booked / Unavailable
3. Assign to specific scenes
4. Track confirmation from actor
5. Link to hotel bookings if needed
6. Send reminders before shoot dates

### 5. Food & Catering

**Purpose**: Never miss a meal for your team.

**Features**:
- Daily meal planning
- Headcount management (actors, crew, junior artists)
- Vendor management
- Menu planning
- Dietary requirement tracking (veg/non-veg)
- Delivery time scheduling
- Cost per person tracking
- Quality feedback
- Payment tracking

**Workflow**:
1. Plan meals for shoot dates
2. Record headcount breakdown
3. Select vendor and menu
4. Set delivery time and location
5. Track order status: Planned → Ordered → Delivered → Completed
6. Record feedback and ratings

### 6. Transportation & Fuel

**Purpose**: Track all transportation costs and fuel usage.

**Features**:
- Vehicle management (owned/rented/personal)
- Driver details
- Route tracking
- Distance and odometer readings
- Fuel tracking by type and quantity
- Toll and parking charges
- Purpose categorization
- Department-wise allocation
- Monthly cost analytics

**Workflow**:
1. Record vehicle usage details
2. Track route (from/to locations)
3. Record fuel purchases with receipts
4. Add toll, parking, rental charges
5. System calculates total cost
6. Generate monthly reports

### 7. Junior Artists Management

**Purpose**: Manage extras and junior artists efficiently.

**Features**:
- Artist database with contact details
- Physical attributes and skills tracking
- Agency management
- Daily rate tracking
- Attendance management
- Role assignment per shoot day
- Payment tracking
- Performance ratings
- Costume and makeup requirements

**Workflow**:
1. Register junior artists in database
2. Mark availability
3. Create attendance for shoot days
4. Assign roles and costumes
5. Track call time and actual arrival
6. Calculate daily payment including overtime
7. Track meal and transport provisions

## API Endpoints

### Dashboard
```
GET /api/operations/dashboard/{project_id}
```
Returns comprehensive dashboard with alerts and today's overview.

### Rentals
```
POST   /api/operations/rentals
GET    /api/operations/rentals/{project_id}
PUT    /api/operations/rentals/{rental_id}
GET    /api/operations/rentals/overdue/{project_id}
```

### Hotels
```
POST   /api/operations/hotels
GET    /api/operations/hotels/{project_id}
PUT    /api/operations/hotels/{booking_id}
```

### Purchases
```
POST   /api/operations/purchases
GET    /api/operations/purchases/{project_id}
PUT    /api/operations/purchases/{purchase_id}
```

### Actor Availability
```
POST   /api/operations/actor-availability
GET    /api/operations/actor-availability/{project_id}
PUT    /api/operations/actor-availability/{availability_id}
```

### Catering
```
POST   /api/operations/catering
GET    /api/operations/catering/{project_id}
PUT    /api/operations/catering/{catering_id}
```

### Transportation
```
POST   /api/operations/transportation
GET    /api/operations/transportation/{project_id}
PUT    /api/operations/transportation/{transport_id}
```

### Junior Artists
```
POST   /api/operations/junior-artists
GET    /api/operations/junior-artists/{project_id}
POST   /api/operations/junior-artists/attendance
GET    /api/operations/junior-artists/attendance/{project_id}
```

## Frontend Routes

Access the operations page at:
```
/projects/{project_id}/operations
```

The page includes tabs for:
- Dashboard (overview and alerts)
- Rentals
- Hotels
- Purchases
- Actor Availability
- Catering
- Transportation
- Junior Artists

## Database Models

All models are in `Backend/app/models/__init__.py`:
- `RentalItem` - Rental tracking
- `HotelBooking` - Hotel accommodations
- `Purchase` - Purchase records
- `ActorAvailability` - Actor schedules
- `FoodCatering` - Catering orders
- `Transportation` - Transport records
- `JuniorArtist` - Artist database
- `JuniorArtistAttendance` - Daily attendance

## Usage Examples

### Example 1: Renting Camera Equipment
```
1. Go to Operations → Rentals
2. Click "Add Rental"
3. Fill in:
   - Item: RED Camera Kit
   - Type: Equipment
   - Category: Camera
   - Vendor: CineGear Rentals
   - Start Date: Jan 15, 2025
   - End Date: Jan 25, 2025
   - Daily Rate: ₹15,000
   - Security Deposit: ₹50,000
4. System calculates total: ₹165,000 (11 days × ₹15,000)
5. Track throughout production
6. Mark as returned on actual return
7. System checks for penalties if overdue
```

### Example 2: Managing Hotel for Lead Actor
```
1. Go to Operations → Hotels
2. Click "New Booking"
3. Fill in:
   - Guest: John Doe (Lead Actor)
   - Hotel: Grand Plaza
   - Room Type: Suite
   - Check-in: Feb 1, 2025
   - Check-out: Feb 10, 2025
   - Rate: ₹8,000/night
4. System calculates: ₹72,000 (9 nights)
5. Generate booking reference
6. Mark check-in on arrival
7. Mark check-out on departure
```

### Example 3: Daily Catering for 50 People
```
1. Go to Operations → Catering
2. Click "New Order"
3. Fill in:
   - Date: Tomorrow
   - Meal: Lunch
   - Total People: 50
   - Breakdown: 10 actors, 30 crew, 10 junior artists
   - Vendor: Fresh Meals Catering
   - Veg: 35, Non-Veg: 15
   - Cost: ₹200/person = ₹10,000
4. Set delivery time and location
5. Track order status
6. Record feedback after delivery
```

## Benefits

1. **No More Missed Returns**: Automatic alerts for rental items approaching due date
2. **Budget Control**: Real-time tracking of all expenses by category
3. **Simplified Operations**: All operational data in one place
4. **Better Planning**: Know exactly who's available when
5. **Cost Transparency**: Detailed breakdowns of all costs
6. **Audit Trail**: Complete history of all transactions
7. **Vendor Management**: Centralized vendor contact database
8. **Payment Tracking**: Never lose track of pending payments
9. **Team Coordination**: Everyone knows the plan for the day
10. **Data-Driven Decisions**: Analytics help optimize costs

## Quick Start

1. **Navigate to Operations**:
   ```
   Projects → [Your Project] → Operations
   ```

2. **Start with Dashboard**:
   - View alerts for overdue items
   - Check today's schedule
   - Review monthly costs

3. **Add Your First Records**:
   - Start with upcoming rentals
   - Add hotel bookings for next week
   - Plan tomorrow's catering

4. **Set Up Your Team**:
   - Add junior artists to database
   - Set actor availability
   - Record regular vendors

5. **Track Daily**:
   - Mark attendance
   - Record purchases
   - Update transportation

## Best Practices

1. **Daily Updates**: Update the system daily for accurate tracking
2. **Photos**: Take photos of rented items on pickup and return
3. **Receipts**: Always upload receipts for purchases and fuel
4. **Advance Planning**: Book hotels and plan catering in advance
5. **Regular Reviews**: Weekly review of pending payments and overdue items
6. **Vendor Relationships**: Maintain good vendor contacts for emergencies
7. **Cost Alerts**: Set budget limits and get alerts when approaching
8. **Team Training**: Ensure all department heads know how to use the system

## Support

For issues or questions:
1. Check the dashboard for alerts
2. Review this documentation
3. Contact your production manager
4. Refer to the API documentation for technical details

---

**Remember**: This system is designed to make your production smooth and efficient. Use it daily, keep it updated, and it will save you time, money, and headaches!
