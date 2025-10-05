# 🎯 EXACTLY WHAT TO DO - STEP BY STEP

## ✅ WHAT I'VE DONE FOR YOU

I've cleaned up the messy scheduling system and created:
1. ✅ Clean backend controller (`schedule_clean.py`)
2. ✅ Clean frontend component (`SmartScheduler.tsx` - already replaced!)
3. ✅ Clean schedule page (`page_clean.tsx`)

---

## 🔧 WHAT YOU NEED TO DO (5 Minutes)

### STEP 1: Fix Backend (2 min)

**Open VS Code** → Navigate to:
```
Backend/app/controllers/schedule.py
```

**Delete everything in that file**, then **copy ALL content from**:
```
Backend/app/controllers/schedule_clean.py
```

**Paste it into `schedule.py`** and **Save**.

That's it! Backend done ✅

---

### STEP 2: Fix Frontend Page (2 min)

**Find your schedule page** in VS Code:
```
Frontend/src/app/projects/[whatever]/schedule/page.tsx
```
*(The folder might be called `[id]` or `[projectId]` or something similar)*

**Delete everything in that file**, then **copy ALL content from**:
```
Frontend/src/app/projects/[id]/schedule/page_clean.tsx
```

**Paste it into your `page.tsx`** and **Save**.

That's it! Frontend done ✅

---

### STEP 3: Restart Both Servers (1 min)

**Terminal 1** (Backend):
```bash
cd Backend
fastapi dev .\main.py
```

**Terminal 2** (Frontend):
```bash
cd Frontend
npm run dev
```

Wait for both to start ✅

---

### STEP 4: Open and Test (30 sec)

**Open browser:**
```
http://localhost:3000/projects/1/schedule
```

You should see:
- ✅ Stats cards at top
- ✅ Two tabs: "AI Smart Scheduler" and "Scene List"
- ✅ Clean, simple interface

---

## 🎬 USING THE AI SCHEDULER

### Quick Start
1. Click "AI Smart Scheduler" tab
2. Pick start date (e.g., Nov 1, 2025)
3. Pick end date (e.g., Nov 30, 2025)
4. Leave mode as "Balanced"
5. Click "Run Smart Schedule" button
6. Done! Scenes scheduled

### What It Does
- Groups actors by billing cycle (save $$)
- Clusters scenes by location (less travel)
- Considers weather (outdoor vs indoor)
- Checks actor availability
- Detects conflicts

---

## 📋 FILES REFERENCE

### Use These (Clean versions):
```
✅ Backend/app/controllers/schedule_clean.py
✅ Frontend/src/components/project/SmartScheduler.tsx (already done!)
✅ Frontend/src/app/projects/[id]/schedule/page_clean.tsx
```

### Old Files (Backed up, ignore these):
```
🗑️ Backend/app/controllers/schedule_old_backup.py
🗑️ Frontend/src/components/project/SmartScheduler_old_backup.tsx
🗑️ Frontend/src/app/projects/[id]/schedule/page_old_backup.tsx
```

---

## ✨ ENDPOINTS SUMMARY

All these work after you replace the files:

```
GET  /api/projects/{id}/schedule/stats              → Get statistics
GET  /api/projects/{id}/schedule/conflicts          → Get conflicts
POST /api/projects/{id}/schedule/auto               → AI auto-schedule ⭐
POST /api/projects/{id}/schedule/reschedule         → Reschedule scene
GET  /api/projects/{id}/schedule/optimization-preview → Preview results
PUT  /api/projects/{id}/scenes/{id}/schedule        → Update date
DELETE /api/projects/{id}/scenes/{id}/schedule      → Remove from schedule
```

---

## 🎨 UI COMPONENTS

### Tab 1: AI Smart Scheduler
```
┌────────────────────────────┐
│ 📅 Dates                   │
│   Start: [date picker]     │
│   End: [date picker]       │
├────────────────────────────┤
│ ⚙️ Optimization Mode       │
│   [Balanced ▼]             │
├────────────────────────────┤
│ ⚙️ Settings                │
│   Skip Weekends: [✓]       │
│   Auto-Cascade: [✓]        │
│   Scenes/Day: [5]          │
├────────────────────────────┤
│ [👁️ Preview] [▶️ Run]      │
└────────────────────────────┘
```

### Tab 2: Scene List
```
┌────────────────────────────┐
│ Scene 1 | Planned | Nov 5  │
│ Scene 2 | Planned | Nov 5  │
│ Scene 3 | Unplanned | -    │
└────────────────────────────┘
```

---

## 🚨 BEFORE FIRST RUN

Make sure:

1. **Global Costs has actors**
```sql
SELECT * FROM global_costs WHERE category = 'actor';
```
Should show actors with `billing_cycle` = 'daily', 'weekly', or 'monthly'

2. **Scenes are marked unplanned**
```sql
UPDATE scenes SET status = 'unplanned' WHERE project_id = 1;
```

3. **Both servers running**
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

## 🎉 THAT'S IT!

Just:
1. Copy clean backend code to `schedule.py`
2. Copy clean frontend code to `page.tsx`
3. Restart servers
4. Open `/projects/1/schedule`
5. Start scheduling!

**Total time: 5 minutes**
**Effort: Copy-paste**
**Result: Working AI scheduler** 🚀

---

## 📚 FULL DOCS

For detailed info, see:
- `SCHEDULE_READY_TO_USE.md` - Quick guide
- `SCHEDULE_CLEANUP_MIGRATION.md` - Full migration
- `SMART_SCHEDULING_GUIDE.md` - Technical details
- `SMART_SCHEDULING_COMPLETE.md` - Implementation details

But honestly, just follow the 4 steps above and you're good! 👍
