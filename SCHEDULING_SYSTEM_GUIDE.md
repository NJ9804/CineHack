# Scheduling System - Complete Guide

## Overview
The scheduling system provides a production-ready interface for managing film shooting schedules with drag-and-drop Kanban boards, day-wise breakdowns, and AI-assisted auto-scheduling.

## Architecture

### Backend (`Backend/app/controllers/schedule.py`)

#### Endpoints

1. **GET `/api/projects/{project_id}/schedule/stats`**
   - Returns statistics about the schedule
   - Response:
     ```json
     {
       "total_scenes": 40,
       "unplanned": 10,
       "planned": 20,
       "in_progress": 5,
       "completed": 5,
       "total_shoot_days": 8,
       "estimated_duration_days": 10
     }
     ```

2. **GET `/api/projects/{project_id}/schedule/conflicts`**
   - Detects scheduling conflicts
   - Types: location conflicts, actor conflicts
   - Response:
     ```json
     [
       {
         "id": "conflict_1",
         "type": "location",
         "severity": "medium",
         "message": "15 scenes planned at Highway Location",
         "affected_scenes": [1, 2, 3, ...]
       }
     ]
     ```

3. **POST `/api/projects/{project_id}/schedule/auto-schedule`**
   - Automatically organizes unplanned scenes
   - Groups by location for efficiency
   - Returns count of scheduled scenes

4. **GET `/api/projects/{project_id}/schedule/day-view`**
   - Returns day-wise breakdown of shooting schedule
   - Groups scenes by location and day
   - Calculates daily requirements

### Frontend Components

#### 1. ScheduleTab (`Frontend/src/components/project/ScheduleTab.tsx`)
Main container with tabs for different views:
- Kanban view
- Day-wise view
- Statistics panel
- Auto-schedule button

#### 2. KanbanBoard (`Frontend/src/components/project/KanbanBoard.tsx`)
Drag-and-drop Kanban board with 4 columns:
- **Unplanned**: Scenes not yet scheduled
- **Planned**: Scenes ready to shoot
- **In Progress**: Currently shooting
- **Completed**: Finished scenes

Features:
- Smooth drag-and-drop using `@dnd-kit/core`
- Real-time updates to backend
- Visual feedback during dragging
- Scene count badges
- Color-coded status indicators

#### 3. DayWiseSchedule (`Frontend/src/components/project/DayWiseSchedule.tsx`)
Detailed day-by-day schedule view showing:
- Date and day number
- Location for the day
- List of scenes to shoot
- Total scenes and estimated hours
- Actors needed
- Scene details (number, heading, status)

## How It Works

### Drag-and-Drop Flow

1. **User drags a scene card** from one column to another
2. **`handleDragEnd` triggered** in KanbanBoard
3. **Status extracted** from the drop zone ID
4. **API call made** to `/api/scenes/{id}` with new status
5. **Backend updates** the scene status in database
6. **Frontend updates** local state optimistically
7. **Stats refreshed** to show updated counts

### Auto-Schedule Flow

1. **User clicks "Auto Schedule"** button
2. **API call** to `/api/projects/{id}/schedule/auto-schedule`
3. **Backend logic**:
   - Fetches all unplanned scenes
   - Groups by location
   - Assigns to days (5 scenes per day)
   - Updates status to 'planned'
4. **Response** shows count of scheduled scenes
5. **Frontend refreshes** scenes and stats

### Day-Wise View Flow

1. **User switches to "Day View"** tab
2. **API call** to `/api/projects/{id}/schedule/day-view`
3. **Backend calculates**:
   - Groups scenes by location
   - Divides into shooting days
   - Calculates time requirements
   - Lists required actors
4. **Frontend renders** day cards with all details

## Database Schema

### Scene Model Fields Used for Scheduling
```python
class Scene(Base):
    id: Integer
    project_id: Integer
    scene_number: String
    scene_heading: String
    location_name: String
    location_type: String (indoor/outdoor)
    time_of_day: String
    status: String  # unplanned, planned, in-progress, shooting, completed
    estimated_duration: String
    actors_data: JSON
    props_data: JSON
    technical_notes: Text
    estimated_cost: Float
    actual_cost: Float
    created_at: DateTime
    updated_at: DateTime
```

## Status Values

| Status | Description | Color | Meaning |
|--------|-------------|-------|---------|
| `unplanned` | Not scheduled | Gray | Scene needs scheduling |
| `planned` | Ready to shoot | Yellow | Scene is scheduled |
| `in-progress` or `shooting` | Currently shooting | Blue | Scene being filmed |
| `completed` | Finished | Green | Scene wrapped |

## UI Features

### Statistics Panel
Shows real-time counts:
- Total scenes
- Unplanned scenes (need scheduling)
- Planned scenes (ready)
- In progress (shooting)
- Completed

### Conflict Detection
Automatically identifies:
- **Location conflicts**: Too many scenes at same location
- **Actor conflicts**: Same actor in many scenes
- Visual warning badges
- Clickable to show affected scenes

### Auto-Schedule Button
- Icon: Sparkles ✨
- Disables while processing
- Shows success notification
- Updates all views automatically

## API Client Methods

```typescript
// Get schedule statistics
await apiClient.getScheduleStats(projectId)

// Get scheduling conflicts
await apiClient.getScheduleConflicts(projectId)

// Auto-schedule unplanned scenes
await apiClient.autoSchedule(projectId)

// Update scene status (for drag-and-drop)
await apiClient.updateScene(sceneId, { status: newStatus })
```

## Installation & Setup

### Backend Dependencies
```bash
cd Backend
pip install fastapi sqlalchemy psycopg2-binary python-dotenv
```

### Frontend Dependencies
```bash
cd Frontend
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Database Migration
Ensure scenes table has `status` column:
```sql
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'unplanned';
```

## Usage Guide

### For Production Managers

1. **Upload Script**: Parse script to create scenes
2. **Review Scenes**: Check all scenes are imported correctly
3. **Auto-Schedule**: Click "Auto Schedule" to organize by location
4. **Review Schedule**: Check day-wise view for daily breakdown
5. **Manual Adjustments**: Drag scenes to adjust schedule
6. **Check Conflicts**: Review conflict warnings
7. **Mark Progress**: Update scenes to "In Progress" during shoot
8. **Complete Scenes**: Move to "Completed" when wrapped

### For Directors

1. **Day View**: See what's shooting each day
2. **Scene Details**: Review scene requirements
3. **Actor Availability**: Check which actors needed when
4. **Location Planning**: See location-grouped schedule

## Troubleshooting

### Drag-and-Drop Not Working

**Issue**: Scenes don't move between columns

**Solutions**:
1. Check browser console for errors
2. Verify `@dnd-kit/core` is installed
3. Ensure scene IDs are unique
4. Check backend is running (scene update endpoint)

### Stats Not Loading

**Issue**: Statistics panel shows no data

**Solutions**:
1. Check network tab for 404 errors
2. Verify backend route: `/api/projects/{id}/schedule/stats`
3. Ensure schedule router is registered in `main.py`
4. Check database has scenes for the project

### Auto-Schedule Fails

**Issue**: Auto-schedule doesn't work

**Solutions**:
1. Verify scenes exist with `unplanned` status
2. Check backend logs for errors
3. Ensure `location_name` field is populated
4. Confirm POST endpoint is accessible

## Performance Considerations

- **Optimistic Updates**: UI updates immediately, reverts on error
- **Debounced Refreshes**: Stats refresh after successful updates
- **Grouped API Calls**: Batch operations where possible
- **Local State**: Minimizes unnecessary re-renders

## Future Enhancements

- [ ] Calendar view with date picker
- [ ] Weather-based scheduling
- [ ] Actor availability integration
- [ ] Equipment booking
- [ ] Call sheet generation
- [ ] Budget-aware scheduling
- [ ] Timeline Gantt chart
- [ ] Export to Excel/PDF
- [ ] Mobile-responsive design
- [ ] Real-time collaboration

## Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs
3. Verify API endpoints in Swagger UI: `http://localhost:8000/docs`
4. Check this documentation

## API Documentation

Full API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
