# 🎯 HOW TO ACCESS SMART SCHEDULING

## Quick Access

### From Project Page
1. Go to your project: `http://localhost:3000/projects/{project_id}`
2. Look for the **⚡ Smart Schedule** banner (yellow/orange gradient)
3. Click **"Auto-Schedule"** button
4. You'll be taken to the Smart Scheduling page

### Direct URL
Navigate directly to:
```
http://localhost:3000/projects/{your_project_id}/schedule
```

Example:
```
http://localhost:3000/projects/1/schedule
```

## What You'll See

### Two Main Tabs:

#### 1. ⚡ AI Smart Scheduler Tab
This is where the magic happens! You'll see:

**Project Timeline Section:**
- Start Date picker
- End Date picker

**Optimization Strategy Dropdown:**
- 💰 Cost Optimization (minimize actor costs)
- ⚡ Speed Optimization (fastest completion)
- ⚙️ Balanced (recommended)
- 👥 Quality Focus (best quality)

**Advanced Settings:**
- ✅ Skip Weekends toggle
- ✅ Auto-Cascade Changes toggle
- Scenes Per Day input (optional)

**Key Factors Display:**
Shows what the AI considers:
- 💰 Actor Billing Cycles (from Global Costs)
- ☁️ Weather Predictions
- 👥 Actor Availability
- 🗺️ Location Clustering

**Buttons:**
- **Preview** - See what will happen without making changes
- **Run Smart Schedule** - Execute the scheduling

#### 2. 📋 Scene List Tab
Shows all your scenes with:
- Scene number and heading
- Current status (unplanned/planned/shooting/completed)
- Scheduled date (if scheduled)
- Location
- Number of actors

## How to Use

### Step 1: Prepare Data

Before using Smart Scheduler, ensure you have:

**1. Actors in Global Costs**
Go to Global Costs and add actors with billing cycles:
- Name: Actor Name
- Category: actor
- Billing Cycle: daily/weekly/monthly
- Cost: Their rate

**2. Scenes with Status**
Your scenes should have `status = 'unplanned'` to be scheduled
- If scenes already have dates, they won't be re-scheduled
- Only unplanned scenes are scheduled

### Step 2: Run Smart Schedule

1. **Select Dates:**
   - Start Date: When you want shooting to begin
   - End Date: Deadline for completion

2. **Choose Optimization:**
   - **Cost**: Minimizes actor costs (groups weekly/monthly billed actors)
   - **Speed**: Fastest completion (7 scenes/day)
   - **Balanced**: Best overall (5 scenes/day) ⭐ RECOMMENDED
   - **Quality**: Better preparation (3 scenes/day)

3. **Configure Settings:**
   - Skip Weekends: ON (don't schedule Sat/Sun)
   - Auto-Cascade: ON (reschedule dependent scenes automatically)
   - Scenes/Day: Leave empty for automatic

4. **Preview (Optional):**
   - Click "Preview" to see estimate
   - Shows: Total scenes, estimated days, completion date, conflicts
   - No database changes

5. **Run Schedule:**
   - Click "Run Smart Schedule"
   - AI schedules all unplanned scenes
   - Shows success message with details
   - Alerts if there are conflicts

### Step 3: Review Results

After scheduling:
- Switch to "Scene List" tab
- See all scenes with scheduled dates
- Check for any conflicts/warnings
- Scenes are now marked as 'planned'

## Features in Action

### 💰 Cost Optimization Example

**Without Smart Scheduler:**
```
Actor A (weekly billing): Scenes on Day 1, Day 10, Day 20
Cost: 3 weeks × ₹50,000 = ₹150,000
```

**With Cost Optimization:**
```
Actor A (weekly billing): All scenes on Days 1-5
Cost: 1 week × ₹50,000 = ₹50,000
SAVED: ₹100,000! 💰
```

### ⚡ Speed Optimization Example

**Balanced Mode:**
```
50 scenes ÷ 5 scenes/day = 10 days
```

**Speed Mode:**
```
50 scenes ÷ 7 scenes/day = 8 days
SAVED: 2 days! ⚡
```

### 🗺️ Location Clustering Example

**Before:**
```
Day 1: Location A - Scene 1
Day 2: Location B - Scene 10
Day 3: Location A - Scene 2
Result: Setup/teardown twice for Location A
```

**After:**
```
Day 1: Location A - Scenes 1, 2, 5
Day 2: Location A - Scenes 7, 9
Day 3: Location B - Scenes 10, 15
Result: Setup once per location 🎬
```

## Manual Rescheduling

After auto-scheduling, you can manually adjust:

**Via API (Backend ready):**
```bash
POST /projects/1/schedule/reschedule
{
  "scene_id": 123,
  "new_date": "2025-11-15T00:00:00",
  "reason": "Actor requested change",
  "auto_cascade": true
}
```

**Auto-Cascade:**
- If enabled, dependent scenes automatically adjust
- Prevents conflicts
- Maintains story continuity

## API Endpoints Available

All accessible from the Smart Scheduler UI:

1. **GET /projects/{id}/schedule/stats**
   - Shows: total scenes, scheduled, completed, progress %

2. **POST /projects/{id}/schedule/auto**
   - Main auto-scheduling endpoint
   - Returns: schedule, completion date, conflicts

3. **GET /projects/{id}/schedule/optimization-preview**
   - Preview without making changes
   - Shows: estimated days, conflicts

4. **POST /projects/{id}/schedule/reschedule**
   - Manual reschedule with cascade
   - Updates dependent scenes

5. **GET /projects/{id}/schedule/conflicts**
   - Detects scheduling conflicts
   - Shows: actor overload, location overlaps

## Troubleshooting

### "No unplanned scenes to schedule"
**Fix:** Mark scenes as unplanned:
```sql
UPDATE scenes SET status = 'unplanned' WHERE project_id = 1;
```

### "Failed to auto-schedule"
**Check:**
- Backend server running? (http://localhost:8000)
- Logged in with valid token?
- Project ID correct?

### Billing cycles not working
**Fix:** Ensure Global Costs has actors:
```sql
SELECT * FROM global_costs WHERE category = 'actor';
```
Should show actors with `billing_cycle` = 'daily'/'weekly'/'monthly'

### Scenes not showing weather notes
**Note:** Weather is currently using mock data
**To enable real weather:**
1. Get OpenWeatherMap API key
2. Add to .env: `WEATHER_API_KEY=your_key`
3. Uncomment API code in `WeatherService`

## Quick Navigation

```
Main Project Page
    ↓
Click "⚡ Smart Schedule" Banner
    ↓
Smart Scheduling Page
    ↓
Tab 1: AI Smart Scheduler (configure & run)
Tab 2: Scene List (view results)
```

## Summary

**You now have access to:**
✅ AI-Powered Smart Scheduling at `/projects/{id}/schedule`
✅ Quick access banner on project page
✅ 4 optimization modes (cost, speed, balanced, quality)
✅ Preview before applying
✅ Automatic conflict detection
✅ Integration with Global Costs billing
✅ Manual override capability

**Start using it:**
1. Go to your project
2. Click yellow "Smart Schedule" banner
3. Set dates, choose mode
4. Click "Run Smart Schedule"
5. Done! ✨

Enjoy your AI-powered scheduling! 🎬🚀
