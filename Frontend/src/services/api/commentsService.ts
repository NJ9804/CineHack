// Comments API Service

import type {
  Comment,
  CommentCreate,
  CommentUpdate,
  CommentEntityType
} from '@/types/auth';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class CommentsService {
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

  async createComment(data: CommentCreate): Promise<{ message: string; comment_id: number }> {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string; comment_id: number }>(response);
  }

  async getComments(entityType: CommentEntityType, entityId: number): Promise<Comment[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/comments/${entityType}/${entityId}`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<Comment[]>(response);
  }

  async updateComment(commentId: number, data: CommentUpdate): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async deleteComment(commentId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async resolveComment(commentId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/resolve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }

  async unresolveComment(commentId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/unresolve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ message: string }>(response);
  }
}

export const commentsService = new CommentsService();
