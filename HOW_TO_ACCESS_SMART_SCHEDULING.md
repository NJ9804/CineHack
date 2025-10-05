# 🎯 How to Access Smart Scheduling - FIXED!

## ✅ Issue Fixed
The 404 errors were caused by missing `/api` prefix in the frontend URLs. All fixed now!

## 📍 Where to Find Smart Scheduling

### Option 1: Direct URL (Easiest!)
```
http://localhost:3000/projects/1/schedule
```
Replace `1` with your actual project ID.

### Option 2: From Project Page
1. Go to any project: `http://localhost:3000/projects/1`
2. Look for the **"Smart Schedule"** banner (purple background with Zap icon)
3. Click **"Configure Smart Schedule"** button

### Option 3: Navigation Menu
1. Open your project
2. Look in the sidebar or top menu for "Schedule" link
3. Opens the schedule page with Smart Scheduler tab

## 🎬 What You'll See

The schedule page has **3 tabs**:

### 1. AI Smart Scheduler Tab ⚡
- **Date Range Picker**: Select start and end dates
- **Optimization Mode**: Choose from 4 modes
  - 💰 Cost Optimization (minimize actor costs)
  - ⚡ Speed Optimization (fastest completion)
  - ⚙️ Balanced (recommended)
  - 👥 Quality Focus (more prep time)
- **Advanced Settings**:
  - Skip Weekends toggle
  - Auto-Cascade toggle
  - Scenes per day input
- **Preview Button**: See results before applying
- **Run Smart Schedule Button**: Execute the AI scheduling

### 2. Calendar View Tab 📅
- Shows scheduled scenes (coming soon)

### 3. Scene List Tab 📋
- Lists all scenes with their scheduled dates
- Shows scene status
- Displays scene details

## 🚀 Quick Start Guide

### Step 1: Prepare Your Data
```sql
-- Ensure scenes are marked as unplanned
UPDATE scenes 
SET status = 'unplanned', scheduled_date = NULL 
WHERE project_id = 1;

-- Ensure Global Costs has actor billing info
SELECT * FROM global_costs WHERE category = 'actor';
-- Should have: name, category='actor', billing_cycle='daily|weekly|monthly', cost
```

### Step 2: Open Smart Scheduler
1. Navigate to: `http://localhost:3000/projects/1/schedule`
2. Click on **"AI Smart Scheduler"** tab (should be default)

### Step 3: Configure Schedule
1. **Select Dates**:
   - Start Date: When shooting begins
   - End Date: When shooting must end

2. **Choose Optimization Mode**:
   - **Balanced** (recommended for first try)
   - Or choose based on your priority

3. **Set Advanced Options**:
   - ✅ Skip Weekends (usually ON)
   - ✅ Auto-Cascade (usually ON)
   - Scenes per day: Leave blank for auto (5 scenes)

### Step 4: Preview (Optional)
1. Click **"Preview"** button
2. See:
   - Total scenes to schedule
   - Estimated days needed
   - Completion date
   - Potential conflicts
3. No database changes yet!

### Step 5: Run Schedule
1. Click **"Run Smart Schedule"** button
2. Wait for AI to process (usually 2-5 seconds)
3. See success message with:
   - Number of scenes scheduled
   - Total days required
   - Any conflicts detected

### Step 6: Review Results
1. Switch to **"Scene List"** tab
2. See all scenes with their scheduled dates
3. Check if any conflicts need resolution

## 🔍 Troubleshooting

### "No scenes to schedule"
**Problem**: All scenes already scheduled
**Fix**: 
```sql
UPDATE scenes SET status = 'unplanned' WHERE project_id = 1;
```

### "Failed to load preview" or 404 errors
**Problem**: Backend not running or URL incorrect
**Fix**: 
1. Ensure FastAPI is running: `fastapi dev .\main.py`
2. Check console for actual error
3. URLs now have `/api` prefix (already fixed!)

### "Billing cycle not optimizing"
**Problem**: Global Costs doesn't have actor billing info
**Fix**:
```sql
-- Add or update actors in global_costs
INSERT INTO global_costs (name, category, billing_cycle, cost, description)
VALUES 
  ('Lead Actor', 'actor', 'weekly', 50000, 'Main role'),
  ('Supporting Actor', 'actor', 'daily', 10000, 'Supporting');
```

### No conflicts shown but expected
**Problem**: Scenes don't have overlapping resources
**Solution**: This is actually good! Means AI scheduled optimally.

## 📊 Understanding the Results

### Success Message Example:
```
✅ Successfully scheduled 45 scenes using balanced mode
Scheduled 45 scenes in 9 days
```

This means:
- All 45 unplanned scenes now have dates
- Total shooting will take 9 days
- Used balanced optimization (5 scenes/day)

### Conflicts Example:
```
⚠️ 2 potential conflicts detected
Check the schedule page for details
```

Common conflicts:
- **Actor Overload**: Same actor in >3 scenes/day
- **Location Overlap**: Multiple scenes at same place/time
- **Timeline Exceeded**: Not enough days between start/end

## 🎨 UI Components

### Smart Scheduler Card Sections:

1. **Project Timeline Card** (Blue border)
   - Start Date picker
   - End Date picker

2. **Optimization Strategy Card** (Purple accent)
   - Dropdown selector
   - Mode description shown

3. **Advanced Settings Card** (Gray)
   - Toggle switches
   - Number input

4. **Key Factors Card** (Info)
   - Shows what AI considers
   - 4 factor boxes with icons

5. **Action Buttons** (Bottom)
   - Preview button (outline)
   - Run Smart Schedule (primary, large)

## 📱 API Endpoints Being Used

When you click buttons, these APIs are called:

### Preview:
```
GET /api/projects/{id}/schedule/optimization-preview?mode=balanced
```

### Run Schedule:
```
POST /api/projects/{id}/schedule/auto
Body: {
  start_date, end_date, optimization_mode,
  skip_weekends, auto_cascade, scenes_per_day
}
```

### Get Stats:
```
GET /api/projects/{id}/schedule/stats
```

### Get Scenes:
```
GET /api/projects/{id}/scenes
```

## 🎯 Real-World Usage Example

### Scenario: 50-scene film, 30-day window

1. **Open**: `http://localhost:3000/projects/1/schedule`
2. **Dates**: 
   - Start: Nov 1, 2025
   - End: Nov 30, 2025
3. **Mode**: Balanced
4. **Settings**: Skip weekends ✅, Auto-cascade ✅
5. **Click**: "Run Smart Schedule"

**Result**:
```
✅ Scheduled 50 scenes in 10 days
Completion: Nov 12, 2025
0 conflicts
```

**What AI Did**:
- Grouped outdoor scenes in good weather
- Clustered scenes by location
- Grouped weekly-billed actors together
- Skipped weekends
- Scheduled 5 scenes/day

**Cost Savings**:
- Actor with weekly billing: 3 scattered weeks → 1 week = Save ₹100k
- Location clustering: 50% less travel costs
- Weather optimization: Avoided 2 rain delay days

## ✨ Pro Tips

1. **Always Preview First**: See what will happen before committing
2. **Use Balanced Mode**: Works best for most productions
3. **Set Realistic End Dates**: Give AI room to optimize
4. **Check Global Costs**: Ensure actors have billing_cycle set
5. **Review Conflicts**: Even small conflicts can cause issues
6. **Manual Override**: You can always reschedule individual scenes later

## 🔗 Quick Links

- **Schedule Page**: `/projects/{id}/schedule`
- **Project Dashboard**: `/projects/{id}`
- **Operations**: `/projects/{id}/operations`
- **Budget**: `/projects/{id}/budget`

## 📞 Need Help?

Check the documentation:
- `SMART_SCHEDULING_GUIDE.md` - Full technical guide
- `SMART_SCHEDULING_COMPLETE.md` - Implementation details
- `QUICK_INTEGRATION_SMART_SCHEDULE.md` - Integration examples

---

**You're all set! Just navigate to: `http://localhost:3000/projects/1/schedule` and start scheduling! 🎬**
