# 🎬 CineHack Production Operations System - Complete Guide

## 🚀 Quick Start

### 1. Start the Backend
```powershell
cd Backend
fastapi dev main.py
```

Backend will run on: `http://localhost:8000`

### 2. Start the Frontend
```powershell
cd Frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

### 3. Access the Operations Module

1. Login to your account
2. Go to any project
3. Click on **"Manage Operations"** button on the project page
4. Or navigate directly to: `/projects/{project_id}/operations`

---

## 📋 What Was Built

### **Production Operations Management System**

A comprehensive system to manage ALL operational aspects of film production:

#### 1. **Rental Management** 🎥
- Track equipment, costumes, props, art production items
- Vendor management with full contact details
- Automatic return date tracking and overdue alerts
- Penalty calculation for late returns
- Condition tracking (pickup vs return)
- **Features Added:**
  - ✅ Mark as Returned (with condition notes)
  - ✅ Edit rental details
  - ✅ Delete rentals
  - ✅ Overdue alerts
  - ✅ Filter by status/type

#### 2. **Hotel Bookings** 🏨
- Manage accommodations for cast and crew
- Check-in/Check-out tracking
- Automatic cost calculation
- Payment tracking (advance/balance)
- Booking reference generation
- **Features:**
  - Guest management
  - Room allocation
  - Meal plan tracking
  - Location-based grouping

#### 3. **Purchase Tracking** 🛒
- Record all production purchases
- Category-wise expense tracking
- Vendor management
- Payment method tracking
- Reimbursement workflow
- Invoice/receipt uploads
- **Categories:**
  - Art supplies
  - Props
  - Costumes
  - Consumables
  - Stationary
  - Food

#### 4. **Actor Availability** 📅
- Track when actors are available
- Scene-based scheduling
- Call time management
- Conflict detection
- Travel and accommodation linking
- **Features:**
  - Availability calendar
  - Confirmation tracking
  - Scene assignments
  - Hotel booking integration

#### 5. **Food & Catering** 🍽️
- Daily meal planning
- Headcount management (actors, crew, junior artists)
- Vendor selection
- Menu planning
- Veg/Non-veg tracking
- Delivery scheduling
- **Features:**
  - Cost per person calculation
  - Quality feedback
  - Location-based delivery

#### 6. **Transportation & Fuel** 🚗
- Vehicle tracking (owned/rented/personal)
- Fuel cost tracking
- Route and distance logging
- Toll and parking charges
- Driver management
- **Analytics:**
  - Monthly fuel costs
  - Total distance traveled
  - Department-wise allocation

#### 7. **Junior Artists Management** 👥
- Artist database with skills
- Daily attendance tracking
- Role assignments
- Payment calculation
- Agency management
- **Features:**
  - Costume and makeup tracking
  - Performance ratings
  - Meal and transport provisions

---

## 🗄️ Database Structure

### New Tables Created:
1. `rental_items` - All rental tracking
2. `purchases` - Purchase records
3. `hotel_bookings` - Accommodation management
4. `actor_availability` - Actor schedules
5. `food_catering` - Catering orders
6. `transportation` - Vehicle and fuel records
7. `junior_artists` - Artist database
8. `junior_artist_attendance` - Daily attendance

### Migration Script:
```powershell
cd Backend
python migrate_operations.py
```

---

## 🎯 Key Features

### Dashboard
- **Alerts Section:**
  - Overdue rentals count
  - Upcoming check-ins (next 7 days)
  - Pending payments
  
- **Today's Overview:**
  - Catering orders and people count
  - Actors available today
  - Junior artists scheduled

- **Monthly Stats:**
  - Transportation costs

### Smart Features
1. **Automatic Calculations:**
   - Rental costs based on days
   - Hotel costs based on nights and rooms
   - Penalty charges for overdue items
   - Transportation total costs

2. **Filtering & Search:**
   - Filter by status, type, date range
   - Show overdue items only
   - Category-based filtering

3. **Alerts & Reminders:**
   - Overdue rental items
   - Upcoming check-ins
   - Pending payments

4. **Edit & Delete:**
   - Edit rental details
   - Update notes and conditions
   - Delete records with confirmation

---

## 📱 Frontend Components

### Created Components:
```
Frontend/src/components/project/
├── OperationsDashboard.tsx
└── operations/
    ├── RentalsManager.tsx (with Edit/Delete)
    ├── HotelsManager.tsx
    ├── PurchasesManager.tsx
    ├── ActorAvailabilityManager.tsx
    ├── CateringManager.tsx
    ├── TransportationManager.tsx
    └── JuniorArtistsManager.tsx
```

### Page Structure:
```
Frontend/src/app/projects/[id]/operations/page.tsx
```

Tabs include:
- Dashboard
- Rentals
- Hotels
- Purchases
- Actor Availability
- Catering
- Transportation
- Junior Artists

---

## 🔌 API Endpoints

### Rentals
```
POST   /api/operations/rentals
GET    /api/operations/rentals/{project_id}
PUT    /api/operations/rentals/{rental_id}
DELETE /api/operations/rentals/{rental_id}
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

### Dashboard
```
GET    /api/operations/dashboard/{project_id}
```

---

## 💡 Usage Examples

### Example 1: Rent Camera Equipment
1. Go to Operations → Rentals → Add Rental
2. Fill in:
   - Item: RED Camera Kit
   - Type: Equipment
   - Vendor: CineGear Rentals
   - Dates: Jan 15 - Jan 25
   - Daily Rate: ₹15,000
3. System calculates total automatically
4. Track status throughout production
5. Mark as returned when done
6. System checks for penalties if overdue

### Example 2: Book Hotel for Actor
1. Go to Operations → Hotels → New Booking
2. Fill in guest details and dates
3. System generates booking reference
4. Mark check-in on arrival
5. Track payment status

### Example 3: Daily Catering
1. Go to Operations → Catering → New Order
2. Enter headcount (actors, crew, junior artists)
3. Select vendor and menu
4. Set delivery time
5. Track order status
6. Record feedback

---

## ✨ Recent Enhancements

### Rentals Manager Updates:
- ✅ **Return Dialog**: Proper dialog with condition selection and notes
- ✅ **Edit Functionality**: Edit rental details
- ✅ **Delete Functionality**: Remove rentals with confirmation
- ✅ **Better UI**: Improved card layout with action buttons
- ✅ **Error Handling**: Proper error messages with toast notifications

### Backend Updates:
- ✅ **DELETE endpoint**: Added for all operation types
- ✅ **Better validation**: Improved error handling
- ✅ **Penalty calculation**: Automatic overdue penalty calculation

---

## 🎨 Toast Notifications

Using **Sonner** for beautiful toast notifications:

```tsx
import { toast } from 'sonner';

toast.success('Rental marked as returned!');
toast.error('Failed to update rental');
```

Already configured in `ToastProvider.tsx`

---

## 📊 Benefits

1. **No Missed Returns**: Automatic alerts for rental due dates
2. **Budget Control**: Real-time expense tracking
3. **Simplified Operations**: All data in one place
4. **Better Planning**: Know who's available when
5. **Cost Transparency**: Detailed cost breakdowns
6. **Complete Audit Trail**: Track all transactions
7. **Vendor Management**: Centralized vendor database
8. **Payment Tracking**: Never lose track of payments

---

## 🛠️ Troubleshooting

### Backend not starting?
```powershell
cd Backend
pip install -r requirements.txt
python migrate_operations.py
fastapi dev main.py
```

### Frontend errors?
```powershell
cd Frontend
npm install
npm run dev
```

### Toast notifications not showing?
- Sonner is already installed and configured
- Check browser console for errors
- Ensure ToastProvider is in layout.tsx

### Database errors?
```powershell
cd Backend
python migrate_operations.py
```

---

## 📚 Documentation Files

- `OPERATIONS_MANAGEMENT_GUIDE.md` - Detailed feature guide
- `README_OPERATIONS.md` - This file (complete system guide)
- `Backend/migrate_operations.py` - Database migration script

---

## 🎯 Next Steps

1. **Start the servers** (backend and frontend)
2. **Login to your account**
3. **Go to any project**
4. **Click "Manage Operations"**
5. **Start tracking your production!**

---

## 🎬 You're All Set!

Your production operations management system is now fully functional with:
- ✅ Complete CRUD operations
- ✅ Real-time tracking
- ✅ Automatic calculations
- ✅ Smart alerts
- ✅ Beautiful UI
- ✅ Toast notifications
- ✅ Edit and delete functionality

**Happy Filmmaking! 🎥🍿**
