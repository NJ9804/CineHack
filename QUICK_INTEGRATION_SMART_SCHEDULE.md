# Quick Integration Guide - Smart Scheduler

## Add to Existing Schedule Page

### Option 1: Add as Tab in Schedule Page

```tsx
// In your existing schedule page (e.g., /projects/[id]/schedule/page.tsx)

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartScheduler } from "@/components/project/SmartScheduler";
import { Calendar, Zap } from "lucide-react";

export default function SchedulePage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);

  return (
    <div className="p-6">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="smart">
            <Zap className="w-4 h-4 mr-2" />
            Smart Scheduler
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          {/* Your existing calendar view */}
        </TabsContent>

        <TabsContent value="smart">
          <SmartScheduler 
            projectId={projectId}
            onScheduleComplete={() => {
              // Refresh your calendar data
              console.log("Schedule updated!");
            }}
          />
        </TabsContent>

        <TabsContent value="timeline">
          {/* Your timeline view */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Option 2: Add as Dialog/Modal

```tsx
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SmartScheduler } from "@/components/project/SmartScheduler";
import { Zap } from "lucide-react";

export function ScheduleWithSmartButton({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Your existing schedule UI */}
      
      {/* Smart Scheduler Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="fixed bottom-6 right-6">
            <Zap className="w-4 h-4 mr-2" />
            AI Smart Schedule
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SmartScheduler 
            projectId={projectId}
            onScheduleComplete={() => {
              setOpen(false);
              // Refresh schedule
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Option 3: Standalone Page

```tsx
// Create new file: /app/projects/[id]/smart-schedule/page.tsx

"use client";

import { SmartScheduler } from "@/components/project/SmartScheduler";
import { useRouter } from "next/navigation";

export default function SmartSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const projectId = parseInt(params.id);

  return (
    <div className="container mx-auto p-6">
      <SmartScheduler 
        projectId={projectId}
        onScheduleComplete={() => {
          // Redirect to schedule page
          router.push(`/projects/${projectId}/schedule`);
        }}
      />
    </div>
  );
}
```

## Test the API Endpoints

### Test 1: Preview (No Database Changes)

```bash
# Get optimization preview
curl -X GET "http://localhost:8000/projects/1/schedule/optimization-preview?mode=balanced" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected Response:
```json
{
  "mode": "balanced",
  "total_scenes": 45,
  "estimated_days": 9,
  "completion_date": "2025-11-12T00:00:00",
  "potential_conflicts": 2
}
```

### Test 2: Auto-Schedule

```bash
# Run auto-schedule
curl -X POST "http://localhost:8000/projects/1/schedule/auto" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "start_date": "2025-11-01T00:00:00",
    "end_date": "2025-12-31T00:00:00",
    "optimization_mode": "balanced",
    "skip_weekends": true,
    "auto_cascade": true
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Successfully scheduled 45 scenes using balanced mode",
  "scheduled_count": 45,
  "total_days": 9,
  "completion_date": "2025-11-12T00:00:00",
  "conflicts": [],
  "optimization_summary": {
    "mode": "balanced",
    "scenes_per_day": 5,
    "skip_weekends": true
  }
}
```

### Test 3: Reschedule Scene

```bash
# Reschedule a single scene
curl -X POST "http://localhost:8000/projects/1/schedule/reschedule" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "scene_id": 123,
    "new_date": "2025-11-15T00:00:00",
    "reason": "Actor requested change",
    "auto_cascade": true
  }'
```

## Data Setup Required

### 1. Ensure Global Costs Has Actor Billing

```sql
-- Check current global costs for actors
SELECT * FROM global_costs WHERE category = 'actor';

-- Add/Update actors with billing cycles
INSERT INTO global_costs (name, category, billing_cycle, cost, description)
VALUES 
  ('John Doe', 'actor', 'weekly', 50000, 'Lead actor'),
  ('Jane Smith', 'actor', 'daily', 10000, 'Supporting actress'),
  ('Bob Wilson', 'actor', 'monthly', 150000, 'Character actor');
```

### 2. Ensure Scenes Have Actors Data

```sql
-- Check scene structure
SELECT id, scene_number, actors_data, location_type, status 
FROM scenes 
WHERE project_id = 1 
LIMIT 5;

-- Example actors_data structure (JSON):
-- [{"name": "John Doe", "character": "Hero"}, {"name": "Jane Smith", "character": "Heroine"}]
```

### 3. Mark Scenes as Unplanned

```sql
-- Set scenes to unplanned status for auto-scheduling
UPDATE scenes 
SET status = 'unplanned', scheduled_date = NULL 
WHERE project_id = 1 AND status IS NULL;
```

## Quick Start Checklist

- [ ] Import `SmartScheduler` component
- [ ] Add to schedule page (tab/modal/standalone)
- [ ] Ensure Global Costs has actors with billing_cycle
- [ ] Ensure scenes have actors_data JSON
- [ ] Mark scenes as 'unplanned' for scheduling
- [ ] Test preview endpoint
- [ ] Test auto-schedule endpoint
- [ ] Check scheduled scenes in database

## Example: Complete Integration

```tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartScheduler } from "@/components/project/SmartScheduler";
import { Calendar, Zap, List } from "lucide-react";
import { toast } from "sonner";

export default function SchedulePage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchScenes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/projects/${projectId}/scenes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setScenes(data);
    } catch (error) {
      toast.error("Failed to load scenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
  }, [projectId]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Production Schedule</h1>
        <p className="text-muted-foreground">
          Plan and manage your shooting schedule
        </p>
      </div>

      <Tabs defaultValue="smart" className="w-full">
        <TabsList>
          <TabsTrigger value="smart">
            <Zap className="w-4 h-4 mr-2" />
            AI Smart Scheduler
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="w-4 h-4 mr-2" />
            Scene List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smart" className="mt-6">
          <SmartScheduler 
            projectId={projectId}
            onScheduleComplete={() => {
              toast.success("Schedule updated successfully!");
              fetchScenes(); // Refresh scene data
            }}
          />
        </TabsContent>

        <TabsContent value="calendar">
          {/* Your calendar view */}
          <div className="border rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Calendar view coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="list">
          {/* Your scene list */}
          <div className="space-y-2">
            {scenes.map((scene: any) => (
              <div key={scene.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Scene {scene.scene_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {scene.scene_heading}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {scene.scheduled_date
                        ? new Date(scene.scheduled_date).toLocaleDateString()
                        : "Not scheduled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scene.status || "unplanned"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Troubleshooting

**Issue:** "Cannot find module SmartScheduler"
**Fix:** Ensure file path is correct: `/Frontend/src/components/project/SmartScheduler.tsx`

**Issue:** API returns 404
**Fix:** Ensure FastAPI server is running and routes are registered

**Issue:** No scenes to schedule
**Fix:** Check scenes have `status = 'unplanned'` in database

**Issue:** Billing cycle not working
**Fix:** Ensure Global Costs has `category = 'actor'` and `billing_cycle` field

That's it! You're ready to use the Smart Scheduler! 🎬
