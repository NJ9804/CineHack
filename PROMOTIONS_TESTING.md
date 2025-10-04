# 🎬 CineHack Promotions - Testing Commands

## Quick Start Commands

### 1. Start the Backend Server
```powershell
# Navigate to Backend directory
cd Backend

# Start the FastAPI server
python -m uvicorn main:app --reload

# Server will start at: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

### 2. Start the Frontend Server
```powershell
# Navigate to Frontend directory
cd Frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev

# Server will start at: http://localhost:3000
```

---

## Testing the Promotions Feature

### Test Case 1: Create Promotion from Project
```powershell
# 1. Open browser
Start-Process "http://localhost:3000/projects"

# 2. Click on any project
# 3. Click on "Promotions" tab
# 4. Enter film name: "mukundan unni associates"
# 5. Click "Analyze Trends"
# 6. Wait 10-30 seconds for results
```

### Test Case 2: View Global Promotions
```powershell
# Open the global promotions page
Start-Process "http://localhost:3000/promotions"
```

### Test Case 3: API Health Check
```powershell
# Check if backend is running
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy"}
```

---

## API Testing with cURL

### Create a New Promotion
```powershell
# Create promotion for project ID 1
curl -X POST http://localhost:8000/api/promotions `
  -H "Content-Type: application/json" `
  -d '{"film": "mukundan unni associates", "project_id": 1}'
```

### Get All Promotions
```powershell
curl http://localhost:8000/api/promotions
```

### Get Promotions for Specific Project
```powershell
# Replace {project_id} with actual project ID
curl http://localhost:8000/api/promotions/projects/1
```

### Get Specific Promotion
```powershell
# Replace {promotion_id} with actual promotion ID
curl http://localhost:8000/api/promotions/2
```

---

## API Testing with Invoke-RestMethod (PowerShell)

### Create Promotion
```powershell
$body = @{
    film = "mukundan unni associates"
    project_id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/promotions" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Get All Promotions
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/promotions" -Method GET
```

### Get Project Promotions
```powershell
$projectId = 1
Invoke-RestMethod -Uri "http://localhost:8000/api/promotions/projects/$projectId" -Method GET
```

---

## Browser Testing Checklist

### Project Promotions Tab
- [ ] Navigate to `/projects`
- [ ] Select a project
- [ ] Click "Promotions" tab
- [ ] Verify empty state displays
- [ ] Enter film name in input
- [ ] Click "Analyze Trends"
- [ ] Verify loading spinner shows
- [ ] Wait for analysis to complete
- [ ] Verify overview stats display
- [ ] Verify industry analysis shows
- [ ] Verify video cards display
- [ ] Click YouTube link - opens in new tab
- [ ] Verify top comments display
- [ ] Verify engagement rate calculated
- [ ] Verify comparison chart displays
- [ ] Click "Refresh" button
- [ ] Verify data reloads

### Global Promotions Page
- [ ] Navigate to `/promotions`
- [ ] Verify aggregate stats at top
- [ ] Verify promotions grid displays
- [ ] Click "View Project" button
- [ ] Verify navigates to project page
- [ ] Verify "View Details" link works
- [ ] Test with multiple promotions
- [ ] Verify empty state if no data

---

## Sample Film Names for Testing

### High Engagement Films
```
mukundan unni associates
RRR
KGF Chapter 2
Pushpa
Bahubali
Drishyam
```

### Moderate Engagement
```
Jawan
Pathaan
Kantara
Vikram
Ponniyin Selvan
```

### Low/No Engagement (Testing Empty States)
```
unknown film name xyz
test movie 12345
```

---

## Debugging Commands

### Check Backend Logs
```powershell
# Backend logs are printed to console
# Look for:
# - "Fetching YouTube data for: {film_name}"
# - "Found {count} videos"
# - "Analysis complete"
```

### Check Frontend Console
```javascript
// Open browser DevTools (F12)
// Check Console tab for:
console.log('🌐 [HTTP] POST http://localhost:8000/api/promotions');
console.log('API Response:', data);
console.log('Loaded promotions:', promotions);
```

### Check Network Requests
```
// Open browser DevTools (F12)
// Go to Network tab
// Filter by: Fetch/XHR
// Look for:
// - POST /api/promotions (when creating)
// - GET /api/promotions/projects/{id} (when loading)
```

---

## Common Issues & Solutions

### Issue: Backend Not Running
```
Error: Failed to fetch
Solution: Start backend with: python -m uvicorn main:app --reload
```

### Issue: Frontend Not Running
```
Error: This site can't be reached
Solution: Start frontend with: npm run dev
```

### Issue: CORS Error
```
Error: CORS policy blocked
Solution: Ensure backend has CORS middleware enabled
Check: main.py should have app.add_middleware(CORSMiddleware)
```

### Issue: No Videos Found
```
Response: { videos: [] }
Possible Causes:
1. Film name misspelled
2. Film has no YouTube content
3. YouTube API rate limit reached
Solution: Try popular film names first
```

### Issue: Analysis Taking Too Long
```
Symptom: Spinner shows for >60 seconds
Possible Causes:
1. Large number of videos to process
2. YouTube API slow response
3. Backend timeout
Solution: Wait or check backend logs
```

---

## Performance Testing

### Measure Analysis Speed
```powershell
# Time the API request
Measure-Command {
    $body = @{
        film = "mukundan unni associates"
        project_id = 1
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:8000/api/promotions" `
      -Method POST -Body $body -ContentType "application/json"
}

# Expected: 10-30 seconds
```

### Test Multiple Analyses
```powershell
# Create multiple promotions
$films = @("RRR", "KGF", "Pushpa", "Bahubali")

foreach ($film in $films) {
    $body = @{
        film = $film
        project_id = 1
    } | ConvertTo-Json
    
    Write-Host "Analyzing: $film"
    Invoke-RestMethod -Uri "http://localhost:8000/api/promotions" `
      -Method POST -Body $body -ContentType "application/json"
}
```

---

## Load Testing

### Concurrent Requests (Use with Caution)
```powershell
# Test multiple simultaneous analyses
$jobs = @()

1..3 | ForEach-Object {
    $jobs += Start-Job -ScriptBlock {
        param($filmName)
        $body = @{
            film = $filmName
            project_id = 1
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "http://localhost:8000/api/promotions" `
          -Method POST -Body $body -ContentType "application/json"
    } -ArgumentList "Test Film $_"
}

# Wait for all jobs to complete
$jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
```

**Warning**: YouTube API has rate limits. Use sparingly!

---

## Database Inspection

### Check Promotions in Database
```powershell
# If using SQLite (check your database.py)
# Install SQLite browser or use command line

# Example with Python
python -c "
import sqlite3
conn = sqlite3.connect('cinehack.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM promotions')
print(cursor.fetchall())
conn.close()
"
```

---

## Cleanup Commands

### Clear Browser Cache
```
1. Press Ctrl + Shift + Delete
2. Select "Cached images and files"
3. Click "Clear data"
```

### Reset Backend Database (If Needed)
```powershell
# Stop backend server first
# Delete database file
Remove-Item cinehack.db

# Restart backend - will recreate DB
python -m uvicorn main:app --reload
```

### Clear npm Cache
```powershell
cd Frontend
npm cache clean --force
Remove-Item -Recurse node_modules
npm install
```

---

## CI/CD Testing

### Run TypeScript Type Check
```powershell
cd Frontend
npm run build
# Should complete without errors
```

### Run ESLint
```powershell
cd Frontend
npm run lint
# Should show minimal warnings
```

### Test Backend Endpoints
```powershell
cd Backend
pytest tests/
# If you have tests set up
```

---

## Monitoring & Analytics

### Watch Backend Logs in Real-Time
```powershell
cd Backend
python -m uvicorn main:app --reload --log-level debug
```

### Watch Frontend Dev Server
```powershell
cd Frontend
npm run dev
# Logs show compilation status and errors
```

### Monitor Network Activity
```
DevTools → Network → Fetch/XHR
Watch for:
- Request timing
- Response size
- Status codes
- Error responses
```

---

## Production Deployment Checklist

### Before Deploying
- [ ] Test all API endpoints work
- [ ] Verify frontend builds without errors
- [ ] Check TypeScript types are correct
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Verify loading states work
- [ ] Verify error states work
- [ ] Check console for errors
- [ ] Test with real film data
- [ ] Verify YouTube links work
- [ ] Check performance metrics
- [ ] Review API rate limits

### Environment Variables
```powershell
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
YOUTUBE_API_KEY=your_youtube_api_key_here
DATABASE_URL=your_database_url
```

---

## Quick Reference

### Important URLs
```
Frontend Dev:     http://localhost:3000
Backend API:      http://localhost:8000
API Docs:         http://localhost:8000/docs
OpenAPI Spec:     http://localhost:8000/openapi.json

Promotions Page:  http://localhost:3000/promotions
Project Example:  http://localhost:3000/projects/1
```

### Key Files
```
Frontend:
- src/components/project/PromotionsTab.tsx
- src/app/promotions/page.tsx
- src/lib/types.ts
- src/services/api/client.ts

Backend:
- app/controllers/promotions.py
- app/services/youtube_service.py
```

### Keyboard Shortcuts
```
DevTools:            F12
Reload Page:         Ctrl + R
Hard Reload:         Ctrl + Shift + R
Console:             Ctrl + Shift + J
Network Tab:         Ctrl + Shift + E
```

---

**Testing Status**: ✅ Ready
**Documentation**: ✅ Complete
**Implementation**: ✅ Production Ready

Happy testing! 🎬🚀
