# Quick Start Guide - Authentication System

## ✅ What's Been Implemented

### Backend (All Done!)
1. **User Authentication**
   - Registration endpoint: `/api/auth/register`
   - Login endpoint: `/api/auth/login`
   - Get current user: `/api/auth/me`
   - JWT token-based authentication

2. **Role-Based Access Control (RBAC)**
   - 6 roles: owner, director, producer, shareholder, crew, viewer
   - Permission system for each role
   - Project member management

3. **Comments System**
   - Comment on scenes, tasks, projects
   - Threaded comments (replies)
   - Mark as resolved/unresolved

4. **Notifications/Inbox**
   - Real-time notification system
   - Unread count
   - Mark as read/archive

5. **Project Members**
   - Add/remove members
   - Assign roles
   - Custom permissions

### Frontend (All Done!)
1. **Auth Provider** - React context for authentication
2. **Login Page** - Updated to use new auth system
3. **Register Page** - New user registration
4. **Protected Routes** - Automatic redirect if not logged in
5. **API Services** - All services created for auth, members, comments, notifications
6. **TypeScript Types** - Complete type definitions

## 🚀 How to Use

### 1. Start the Backend
```bash
cd Backend
.\venv\Scripts\activate
fastapi dev .\main.py
```

### 2. Start the Frontend
```bash
cd Frontend
npm run dev
```

### 3. First Time Setup

#### Option A: Create Superuser (Recommended)
```bash
cd Backend
.\venv\Scripts\activate
python create_superuser.py
```

Follow the prompts to create an admin account.

#### Option B: Register via Frontend
1. Go to http://localhost:3000
2. You'll be redirected to `/login`
3. Click "Register here"
4. Fill in the form and create your account

### 4. Test the System

1. **Register/Login:**
   - Open http://localhost:3000
   - You should be redirected to `/login`
   - Register a new account or login

2. **Create a Project:**
   - After login, create a new project
   - You'll automatically be the owner

3. **Add Team Members:**
   - Go to project settings
   - Add members with different roles
   - Test permissions

4. **Add Comments:**
   - Go to any scene or task
   - Add comments
   - Try replying to comments

5. **Check Notifications:**
   - Add a notification bell to your header
   - Receive notifications when assigned tasks
   - Get notified on comment replies

## 📝 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/change-password` - Change password

### Project Members
- `GET /api/projects/{id}/members` - List members
- `POST /api/projects/{id}/members` - Add member
- `PUT /api/projects/{id}/members/{member_id}` - Update role
- `DELETE /api/projects/{id}/members/{member_id}` - Remove member

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/{type}/{id}` - Get comments
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Unread count
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## 🎭 Roles & Permissions

### Owner
✅ Full access to everything
✅ Delete project
✅ Manage members
✅ Edit budget

### Director
✅ Edit creative aspects
✅ Manage scenes/tasks
✅ View budget (read-only)
❌ Cannot delete project

### Producer
✅ Edit budget
✅ Manage schedules
✅ Add members
❌ Cannot delete project

### Shareholder
✅ View budget reports
✅ View project
❌ Cannot edit anything

### Crew
✅ Edit assigned tasks
✅ View scenes
✅ Create comments
❌ Cannot edit budget

### Viewer
✅ View-only access
❌ Cannot edit anything

## 🔧 Next Steps to Integrate

### 1. Update Your Header/Navbar
Add the notification bell and user menu:

```tsx
import NotificationBell from '@/components/layout/NotificationBell';
import { useAuth } from '@/providers/AuthProvider';

function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header>
      {/* ...existing code... */}
      <NotificationBell />
      <div>
        <span>{user?.username}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
```

### 2. Add Comments to Scenes
```tsx
import Comments from '@/components/project/Comments';

function SceneDetail({ sceneId }) {
  return (
    <div>
      {/* Scene details */}
      <Comments entityType="scene" entityId={sceneId} />
    </div>
  );
}
```

### 3. Add Member Management to Projects
```tsx
import ProjectMembers from '@/components/project/ProjectMembers';

function ProjectSettings({ projectId, currentMember }) {
  return (
    <div>
      <ProjectMembers 
        projectId={projectId} 
        currentMember={currentMember}
      />
    </div>
  );
}
```

### 4. Protect Your Routes
Wrap any protected page:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      {/* Your content */}
    </ProtectedRoute>
  );
}
```

## 🐛 Troubleshooting

### Backend won't start
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8000 is available
- Verify `.env` file has `SECRET_KEY`

### Frontend shows errors
- Clear browser cache
- Delete `.next` folder and restart: `rm -rf .next; npm run dev`
- Check if backend is running on port 8000

### Login doesn't work
- Check browser console for errors
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

### Database errors
- Tables are auto-created on first run
- If issues persist, check DATABASE_URL in `.env`

## 📚 Documentation Files

- `AUTH_RBAC_README.md` - Complete API documentation
- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Detailed integration guide
- This file - Quick start guide

## 🎉 Success!

Your authentication and RBAC system is now fully functional! Users can:
- ✅ Register and login
- ✅ Get assigned to projects with specific roles
- ✅ Comment on scenes and tasks
- ✅ Receive notifications
- ✅ Have role-based access control
- ✅ Collaborate on film production

Enjoy your new production management system! 🎬🍿
