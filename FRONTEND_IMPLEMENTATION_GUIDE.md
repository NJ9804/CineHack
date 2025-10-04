# Frontend Implementation Guide - Authentication & RBAC

## Overview
This guide will help you integrate the authentication and RBAC system into your CineHack frontend.

## Prerequisites
- Backend server running with new authentication endpoints
- Install dependencies (if needed): None - all Next.js/React native

## Files Created

### 1. Type Definitions
**File:** `Frontend/src/types/auth.ts`
- User, ProjectMember, Comment, Notification types
- Role definitions and permissions
- Helper functions for permission checking

### 2. API Services
- **`Frontend/src/services/api/authService.ts`** - Authentication
- **`Frontend/src/services/api/membersService.ts`** - Project members
- **`Frontend/src/services/api/commentsService.ts`** - Comments
- **`Frontend/src/services/api/notificationsService.ts`** - Notifications

### 3. React Context
**File:** `Frontend/src/providers/AuthProvider.tsx`
- Authentication state management
- Login/logout/register functions
- Auto-redirect on auth

## Implementation Steps

### Step 1: Update Root Layout
Update `Frontend/src/app/layout.tsx` to include AuthProvider:

```tsx
import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 2: Update Login Page
Your existing login page at `Frontend/src/app/login/page.tsx` needs to be updated to use the new AuthProvider. Replace the current implementation:

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Film, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Your existing UI with updated form handling */}
    </div>
  );
}
```

### Step 3: Create Register Page
Create `Frontend/src/app/register/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    // Similar UI to login page with additional fields
  );
}
```

### Step 4: Create Protected Route Component
Create `Frontend/src/components/ProtectedRoute.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

### Step 5: Protect Your Routes
Wrap protected pages with ProtectedRoute:

```tsx
// In any protected page like projects/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      {/* Your page content */}
    </ProtectedRoute>
  );
}
```

### Step 6: Create Notification Bell Component
Create `Frontend/src/components/layout/NotificationBell.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationsService } from '@/services/api/notificationsService';
import type { Notification } from '@/types/auth';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
      
      const notifs = await notificationsService.getNotifications(true, false, 10);
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No new notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => markAsRead(notif.id)}
              >
                <p className="font-medium">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 7: Create Project Members Management Component
Create `Frontend/src/components/project/ProjectMembers.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { membersService } from '@/services/api/membersService';
import { authService } from '@/services/api/authService';
import type { ProjectMember, ProjectRole } from '@/types/auth';
import { getRoleDisplayName, hasPermission } from '@/types/auth';

interface ProjectMembersProps {
  projectId: number;
  currentMember: ProjectMember | null;
}

export default function ProjectMembers({ projectId, currentMember }: ProjectMembersProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  const loadMembers = async () => {
    try {
      const data = await membersService.getProjectMembers(projectId);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;
    try {
      const results = await authService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const addMember = async (userId: number, role: ProjectRole) => {
    try {
      await membersService.addProjectMember(projectId, {
        user_id: userId,
        role: role,
      });
      loadMembers();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await membersService.removeProjectMember(projectId, memberId);
      loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const canManageMembers = currentMember && hasPermission(currentMember, 'member.add');

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        {canManageMembers && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Member
          </button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {member.user.avatar_url ? (
                  <img src={member.user.avatar_url} alt={member.user.username} className="w-full h-full rounded-full" />
                ) : (
                  <span className="text-lg font-semibold">
                    {member.user.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{member.user.full_name || member.user.username}</p>
                <p className="text-sm text-gray-600">{member.user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {getRoleDisplayName(member.role)}
              </span>
              {canManageMembers && member.role !== 'owner' && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add member modal - implement based on your UI library */}
    </div>
  );
}
```

### Step 8: Create Comments Component
Create `Frontend/src/components/project/Comments.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { commentsService } from '@/services/api/commentsService';
import { useAuth } from '@/providers/AuthProvider';
import type { Comment, CommentEntityType } from '@/types/auth';

interface CommentsProps {
  entityType: CommentEntityType;
  entityId: number;
}

export default function Comments({ entityType, entityId }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    loadComments();
  }, [entityType, entityId]);

  const loadComments = async () => {
    try {
      const data = await commentsService.getComments(entityType, entityId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await commentsService.createComment({
        content: newComment,
        entity_type: entityType,
        entity_id: entityId,
        parent_comment_id: replyTo,
      });
      
      setNewComment('');
      setReplyTo(null);
      loadComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await commentsService.deleteComment(commentId);
      loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Comments</h3>
      
      {/* Comment input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
          className="flex-1 px-4 py-2 border rounded-lg"
          onKeyPress={(e) => e.key === 'Enter' && submitComment()}
        />
        <button
          onClick={submitComment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Post
        </button>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium">{comment.user.username}</p>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Reply
                    </button>
                    {user?.id === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-4 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-sm">{reply.user.username}</p>
                    <p className="text-sm text-gray-600">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Integration Checklist

- [ ] Install backend dependencies: `pip install python-jose[cryptography] passlib[bcrypt] python-dotenv email-validator`
- [ ] Run database migrations (auto on server start)
- [ ] Create superuser using `python Backend/create_superuser.py`
- [ ] Add AuthProvider to root layout
- [ ] Update login page to use AuthProvider
- [ ] Create register page
- [ ] Add ProtectedRoute wrapper to protected pages
- [ ] Add NotificationBell to your header/navbar
- [ ] Add ProjectMembers component to project pages
- [ ] Add Comments component where needed
- [ ] Test all features:
  - [ ] Registration
  - [ ] Login/Logout
  - [ ] Adding members to projects
  - [ ] Changing member roles
  - [ ] Creating comments
  - [ ] Receiving notifications
  - [ ] Permission checks working

## Environment Variables

Add to `Frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Add to `Backend/.env`:
```
SECRET_KEY=your-very-long-random-secret-key-change-in-production
DATABASE_URL=your-database-url
```

## Testing the System

1. **Start Backend:**
   ```bash
   cd Backend
   .\venv\Scripts\activate
   python main.py
   ```

2. **Create Superuser:**
   ```bash
   python create_superuser.py
   ```

3. **Start Frontend:**
   ```bash
   cd Frontend
   npm run dev
   ```

4. **Test Flow:**
   - Register a new user
   - Create a project
   - Add members with different roles
   - Test permissions (try editing with different roles)
   - Add comments to scenes/tasks
   - Check notifications

## Next Steps

1. **Add WebSockets** for real-time notifications (optional)
2. **Email notifications** for important events
3. **Activity logs** to track all changes
4. **Advanced permissions** - custom permission editor UI
5. **Bulk operations** - assign multiple people at once
6. **Mentions** - @mention users in comments

## Support

Refer to `AUTH_RBAC_README.md` for complete API documentation and permission details.
