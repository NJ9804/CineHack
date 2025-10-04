// Project Members API Service

import type {
  ProjectMember,
  ProjectMemberCreate,
  ProjectMemberUpdate,
  RolesResponse
} from '@/types/auth';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class MembersService {
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

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/members`,
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<ProjectMember[]>(response);
  }

  async addProjectMember(
    projectId: number,
    data: ProjectMemberCreate
  ): Promise<{ message: string; member_id: number }> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/members`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    return this.handleResponse<{ message: string; member_id: number }>(response);
  }

  async updateProjectMember(
    projectId: number,
    memberId: number,
    data: ProjectMemberUpdate
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/members/${memberId}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async removeProjectMember(
    projectId: number,
    memberId: number
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/${projectId}/members/${memberId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<{ message: string }>(response);
  }

  async getAvailableRoles(): Promise<RolesResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/projects/1/members/roles`, // Project ID doesn't matter for this endpoint
      {
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse<RolesResponse>(response);
  }
}

export const membersService = new MembersService();
