// Notifications API Service

import type {
  Notification,
  UnreadCountResponse
} from '@/types/auth';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class NotificationsService {
  private getHeaders(): HeadersInit {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getNotifications(
    unreadOnly = false,
    archived = false,
    limit = 50
  ): Promise<Notification[]> {
    const params = new URLSearchParams({
      unread_only: String(unreadOnly),
      archived: String(archived),
      limit: String(limit),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/notifications?${params}`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<Notification[]>(response);
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/unread-count`,
      {
        headers: this.getHeaders(),
      }
    );

    const data = await this.handleResponse<UnreadCountResponse>(response);
    return data.unread_count;
  }

  async markAsRead(notificationId: number): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async markAllAsRead(): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/read-all`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async archiveNotification(notificationId: number): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/archive`,
      {
        method: 'POST',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }
}

export const notificationsService = new NotificationsService();
