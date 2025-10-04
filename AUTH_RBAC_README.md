# Authentication & Role-Based Access Control (RBAC) System

## Overview
This document describes the comprehensive authentication and authorization system for CineHack, including user management, role-based permissions, comments, and notifications.

## Features Implemented

### 1. **User Authentication**
- User registration with email and username
- Secure login with JWT tokens
- Password hashing using bcrypt
- Token-based session management
- Password change functionality
- User profile management

### 2. **Role-Based Access Control (RBAC)**
Six predefined roles with specific permissions:

#### **Owner**
- Full access to everything
- Can delete project
- Can add/remove members
- Can edit all aspects
- Can manage budget

#### **Director**
- Can edit creative aspects
- View budget (read-only)
- Manage scenes and tasks
- Cannot delete project or manage members

#### **Producer**
- Can edit budget and schedules
- Can add members
- View everything
- Cannot delete project

#### **Shareholder**
- Read-only access to budget and reports
- View project progress
- Cannot edit anything

#### **Crew**
- Can edit assigned tasks
- View relevant scenes
- Create comments
- Cannot edit budget or project settings

#### **Viewer**
- Read-only access to everything
- Can view but not edit

### 3. **Project Member Management**
- Add users to projects with specific roles
- Update member roles and permissions
- Remove members from projects
- Custom permission override per member
- Cannot remove the last owner (safety check)

### 4. **Comments System**
- Comment on any entity (scenes, tasks, projects, budget items)
- Threaded comments (replies)
- Edit and delete own comments
- Mark comments as resolved/unresolved
- Real-time notifications for replies
- User attribution with avatars

### 5. **Notifications/Inbox**
- Real-time notification system
- Types of notifications:
  - Assignment (tasks, scenes)
  - Comments and mentions
  - Project updates
  - Deadline reminders
- Mark as read/unread
- Archive notifications
- Unread count badge
- Action URLs for quick navigation

### 6. **Assignment System**
- Assign tasks to team members
- Assign scenes to users
- Email notifications on assignment
- Track assigned work
- Filter tasks by assignee

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login (get JWT token)
GET    /api/auth/me                - Get current user info
PUT    /api/auth/me                - Update user profile
POST   /api/auth/change-password   - Change password
GET    /api/users/search           - Search users
```

### Project Members
```
GET    /api/projects/{id}/members              - List project members
POST   /api/projects/{id}/members              - Add member to project
PUT    /api/projects/{id}/members/{member_id}  - Update member role
DELETE /api/projects/{id}/members/{member_id}  - Remove member
GET    /api/projects/{id}/members/roles        - Get available roles
```

### Comments
```
POST   /api/comments                          - Create comment
GET    /api/comments/{type}/{id}              - Get comments for entity
PUT    /api/comments/{id}                     - Update comment
DELETE /api/comments/{id}                     - Delete comment
POST   /api/comments/{id}/resolve             - Mark resolved
POST   /api/comments/{id}/unresolve           - Mark unresolved
```

### Notifications
```
GET    /api/notifications                     - Get user notifications
GET    /api/notifications/unread-count        - Get unread count
POST   /api/notifications/{id}/read           - Mark as read
POST   /api/notifications/read-all            - Mark all as read
POST   /api/notifications/{id}/archive        - Archive notification
DELETE /api/notifications/{id}                - Delete notification
```

## Permission System

### Permission Format
Permissions are in the format: `resource.action`

Examples:
- `project.view` - Can view project
- `project.edit` - Can edit project
- `project.delete` - Can delete project
- `budget.view` - Can view budget
- `budget.edit` - Can edit budget
- `scene.create` - Can create scenes
- `task.edit` - Can edit tasks
- `member.add` - Can add members
- `comment.create` - Can create comments

### Custom Permissions
Project owners can grant custom permissions to members beyond their role's default permissions.

## Database Models

### User
```python
- id: int
- email: string (unique)
- username: string (unique)
- hashed_password: string
- full_name: string
- avatar_url: string
- phone: string
- is_active: boolean
- is_superuser: boolean
- created_at: datetime
- last_login: datetime
```

### ProjectMember
```python
- id: int
- project_id: int
- user_id: int
- role: string (owner, director, producer, shareholder, crew, viewer)
- permissions: JSON array (custom permissions)
- joined_at: datetime
- invited_by: int (user_id)
```

### Comment
```python
- id: int
- content: text
- user_id: int
- entity_type: string (scene, task, project, budget_line)
- entity_id: int
- parent_comment_id: int (for threaded comments)
- is_resolved: boolean
- is_edited: boolean
- created_at: datetime
- updated_at: datetime
```

### Notification
```python
- id: int
- user_id: int
- title: string
- message: text
- notification_type: string (assignment, comment, mention, deadline, update)
- entity_type: string
- entity_id: int
- is_read: boolean
- is_archived: boolean
- action_url: string
- created_at: datetime
- read_at: datetime
```

## Frontend Integration Guide

### 1. Authentication Flow
```typescript
// Login
const login = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

// Add token to requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### 2. Permission Checking
```typescript
// Check if user has permission
const hasPermission = (member: ProjectMember, permission: string) => {
  const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
  const customPermissions = member.permissions || [];
  return [...rolePermissions, ...customPermissions].includes(permission);
};

// Conditional rendering
{hasPermission(member, 'budget.edit') && (
  <button>Edit Budget</button>
)}
```

### 3. Notifications
```typescript
// Fetch notifications
const fetchNotifications = async () => {
  const response = await fetch('/api/notifications', { headers });
  return await response.json();
};

// Get unread count
const getUnreadCount = async () => {
  const response = await fetch('/api/notifications/unread-count', { headers });
  const data = await response.json();
  return data.unread_count;
};

// Mark as read
const markAsRead = async (notificationId: number) => {
  await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'POST',
    headers
  });
};
```

### 4. Comments
```typescript
// Fetch comments
const fetchComments = async (entityType: string, entityId: number) => {
  const response = await fetch(
    `/api/comments/${entityType}/${entityId}`,
    { headers }
  );
  return await response.json();
};

// Create comment
const createComment = async (data: CommentCreate) => {
  await fetch('/api/comments', {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
};
```

## Security Considerations

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Never store plain text passwords
   - Enforce strong password policies

2. **Token Security**
   - JWT tokens expire after 7 days
   - Store tokens securely (httpOnly cookies recommended)
   - Validate tokens on every request

3. **Authorization**
   - Always verify user permissions on the backend
   - Never trust frontend permission checks alone
   - Check both role-based and custom permissions

4. **Data Access**
   - Users can only access projects they're members of
   - Superusers have access to everything
   - Sensitive data (budget) respects permissions

## Next Steps for Frontend

1. **Create Auth Context/Provider**
   - Manage authentication state
   - Store user and token
   - Auto-redirect on auth errors

2. **Build Components**
   - Login/Register forms
   - User profile page
   - Project members management UI
   - Comments component (threaded)
   - Notification bell/dropdown
   - Permission-based UI rendering

3. **Add Real-time Updates** (Optional)
   - WebSocket connection for live notifications
   - Real-time comment updates
   - Live collaboration features

4. **Role Management UI**
   - Add member modal
   - Role selection dropdown
   - Custom permissions editor
   - Member list with roles

5. **Notification Center**
   - Dropdown/sidebar for notifications
   - Mark all as read button
   - Filter by type
   - Archive functionality

## Testing

Use these test credentials after setting up:

1. Create superuser via script or registration
2. Test different roles:
   - Create project as owner
   - Add members with different roles
   - Try editing with different accounts
   - Verify permissions are enforced

## Environment Variables

Add to your `.env` file:
```
SECRET_KEY=your-very-long-random-secret-key-here
DATABASE_URL=your-database-url
```

## Installation

1. Install new dependencies:
```bash
pip install python-jose[cryptography] passlib[bcrypt] python-dotenv email-validator
```

2. Run migrations (tables will auto-create):
```bash
# Tables will be created automatically on first run
python main.py
```

3. Create first superuser (optional):
```bash
# Use the registration endpoint with is_superuser=true manually in DB
```
