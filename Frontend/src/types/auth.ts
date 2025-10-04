// Authentication and Authorization Types

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

// Project Members
export type ProjectRole = 'owner' | 'director' | 'producer' | 'shareholder' | 'crew' | 'viewer';

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: ProjectRole;
  permissions?: string[];
  joined_at: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ProjectMemberCreate {
  user_id: number;
  role: ProjectRole;
  permissions?: string[];
}

export interface ProjectMemberUpdate {
  role?: ProjectRole;
  permissions?: string[];
}

export interface RoleDefinition {
  name: string;
  permissions: string[];
}

export interface RolesResponse {
  roles: Record<ProjectRole, RoleDefinition>;
}

// Comments
export type CommentEntityType = 'scene' | 'task' | 'project' | 'budget_line';

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  entity_type: CommentEntityType;
  entity_id: number;
  parent_comment_id?: number;
  is_resolved: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  replies: Comment[];
}

export interface CommentCreate {
  content: string;
  entity_type: CommentEntityType;
  entity_id: number;
  parent_comment_id?: number;
}

export interface CommentUpdate {
  content: string;
}

// Notifications
export type NotificationType = 'assignment' | 'comment' | 'mention' | 'deadline' | 'update';
export type NotificationEntityType = 'project' | 'scene' | 'task' | 'comment';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  entity_type?: NotificationEntityType;
  entity_id?: number;
  is_read: boolean;
  is_archived: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationCreate {
  user_id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  entity_type?: NotificationEntityType;
  entity_id?: number;
  action_url?: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

// Permission Helpers
export const ROLE_PERMISSIONS: Record<ProjectRole, string[]> = {
  owner: [
    'project.delete',
    'project.edit',
    'project.view',
    'budget.edit',
    'budget.view',
    'scene.create',
    'scene.edit',
    'scene.delete',
    'scene.view',
    'task.create',
    'task.edit',
    'task.delete',
    'task.view',
    'member.add',
    'member.remove',
    'member.edit',
    'comment.create',
    'comment.edit',
    'comment.delete',
    'comment.view'
  ],
  director: [
    'project.edit',
    'project.view',
    'budget.view',
    'scene.create',
    'scene.edit',
    'scene.delete',
    'scene.view',
    'task.create',
    'task.edit',
    'task.view',
    'comment.create',
    'comment.edit',
    'comment.view'
  ],
  producer: [
    'project.edit',
    'project.view',
    'budget.edit',
    'budget.view',
    'scene.view',
    'task.create',
    'task.edit',
    'task.view',
    'member.add',
    'comment.create',
    'comment.view'
  ],
  shareholder: [
    'project.view',
    'budget.view',
    'scene.view',
    'task.view'
  ],
  crew: [
    'project.view',
    'scene.view',
    'task.edit',
    'task.view',
    'comment.create',
    'comment.view'
  ],
  viewer: [
    'project.view',
    'scene.view',
    'task.view',
    'comment.view'
  ]
};

export const hasPermission = (member: ProjectMember | null, permission: string): boolean => {
  if (!member) return false;
  
  const basePermissions = ROLE_PERMISSIONS[member.role] || [];
  const customPermissions = member.permissions || [];
  
  return [...basePermissions, ...customPermissions].includes(permission);
};

export const getRoleDisplayName = (role: ProjectRole): string => {
  const names: Record<ProjectRole, string> = {
    owner: 'Project Owner',
    director: 'Director',
    producer: 'Producer',
    shareholder: 'Shareholder',
    crew: 'Crew Member',
    viewer: 'Viewer'
  };
  return names[role] || role;
};

export const getRoleDescription = (role: ProjectRole): string => {
  const descriptions: Record<ProjectRole, string> = {
    owner: 'Full access to all project features including member management',
    director: 'Can manage creative aspects and view budget',
    producer: 'Can manage budget, schedules, and add members',
    shareholder: 'Read-only access to budget and reports',
    crew: 'Can edit assigned tasks and view relevant information',
    viewer: 'Read-only access to project'
  };
  return descriptions[role] || '';
};
