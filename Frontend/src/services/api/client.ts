/* eslint-disable @typescript-eslint/no-explicit-any */
import { mockApiClient } from './mockClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private isServerAvailable: boolean = true;
  private useMockData: boolean = false;

  constructor() {
    this.baseUrl = API_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      // Check if mock mode is enabled (default to false for real API)
      this.useMockData = localStorage.getItem('useMockData') === 'true';
    } else {
      // Server-side: use real API by default
      this.useMockData = false;
    }
    
    // Log the API URL for debugging
    console.log('API Client initialized with base URL:', this.baseUrl);
    console.log('Using mock data:', this.useMockData);
  }

  // Add a method to check server availability
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      this.isServerAvailable = response.ok;
      return this.isServerAvailable;
    } catch (error) {
      console.warn('Backend server is not available:', error);
      this.isServerAvailable = false;
      return false;
    }
  }

  // Toggle between real API and mock data
  setMockMode(enabled: boolean) {
    this.useMockData = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('useMockData', enabled.toString());
    }
    console.log(`Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if we should use mock data
  private shouldUseMockData(): boolean {
    // For now, always use real API unless explicitly set to mock mode
    return this.useMockData;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Always get fresh token from localStorage
      if (typeof window !== 'undefined') {
        this.token = localStorage.getItem('token');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const url = `${this.baseUrl}${endpoint}`;
      console.log(`🌐 [HTTP] ${options.method || 'GET'} ${url}`);

      // Check if fetch is available
      if (typeof fetch === 'undefined') {
        throw new Error('Fetch is not available. Please ensure you are running in a browser environment.');
      }

      const response = await fetch(url, {
        ...options,
        headers: headers as HeadersInit,
        // Add timeout and other fetch options
        signal: options.signal,
      }).catch((error: Error) => {
        console.error('Fetch error:', error);
        
        // Handle different types of network errors
        if (error.name === 'AbortError') {
          throw new Error('Request was cancelled');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.');
        } else {
          throw new Error(`Request failed: ${error.message}`);
        }
      });

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        console.error(`API Error: ${response.status} ${response.statusText}`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json().catch(() => {
        // If response is not JSON, return empty object
        return {} as T;
      });

      console.log(`API Response: ${options.method || 'GET'} ${url}`, data);
      return data;

    } catch (error) {
      console.error('API Client Error:', error);
      
      // Re-throw the error with additional context
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      } else {
        throw new Error('An unknown error occurred during the API request');
      }
    }
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name: string }) {
    return this.request<{ access_token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  // Projects endpoints
  async getProjects() {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for getProjects');
      return mockApiClient.getProjects();
    }
    
    try {
      return await this.request<any[]>('/api/projects');
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.getProjects();
    }
  }

  async getProject(id: string) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for getProject');
      return mockApiClient.getProject(id);
    }
    
    try {
      return await this.request<any>(`/api/projects/${id}`);
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.getProject(id);
    }
  }

  async createProject(data: any) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for createProject');
      return mockApiClient.createProject(data);
    }
    
    try {
      return await this.request<any>('/api/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.createProject(data);
    }
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request<any>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Scripts endpoints
  async uploadScript(projectId: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      console.log(`Uploading script for project ${projectId}:`, file.name);
      
      const response = await fetch(`${this.baseUrl}/api/projects/${projectId}/scripts`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      return result;
      
    } catch (error) {
      console.error('Error uploading script:', error);
      throw error;
    }
  }

  async getScripts(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/scripts`);
  }

  async getMainCharacters() {
    try {
      return await this.request<any>('/api/scripts/main-characters');
    } catch (error) {
      console.warn('Failed to fetch main characters:', error);
      return { success: false, characters: [] };
    }
  }

  async getParseStatus(projectId: string, scriptId: string) {
    return this.request<any>(`/api/projects/${projectId}/scripts/${scriptId}/status`);
  }

  async getProjectDashboard(projectId: string) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for getProjectDashboard');
      return mockApiClient.getProject(projectId); // Use existing mock for now
    }
    
    try {
      return await this.request<any>(`/api/projects/${projectId}/dashboard`);
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.getProject(projectId);
    }
  }

  // Scenes endpoints
  async getScenes(projectId: string) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for getScenes');
      return mockApiClient.getScenes(projectId);
    }
    
    try {
      console.log(`Fetching scenes from: /api/scenes/projects/${projectId}/scenes`);
      return await this.request<any[]>(`/api/scenes/projects/${projectId}/scenes`);
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.getScenes(projectId);
    }
  }

  async createScene(projectId: string, data: any) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for createScene');
      return mockApiClient.createScene(projectId, data);
    }
    
    try {
      return await this.request<any>(`/api/projects/${projectId}/scenes`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.createScene(projectId, data);
    }
  }

  async updateScene(sceneId: number, data: any) {
    try {
      return await this.request<any>(`/api/scenes/${sceneId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to update scene:', error);
      throw error;
    }
  }

  // Characters endpoints
  async getCharacters(projectId: string) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for getCharacters');
      return mockApiClient.getCharacters(projectId);
    }
    
    try {
      return await this.request<any[]>(`/api/projects/${projectId}/characters`);
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.getCharacters(projectId);
    }
  }

  // Catalog endpoints
  async getCatalogItems(projectId: string, type?: string) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for getCatalogItems');
      return mockApiClient.getCatalogItems(projectId, type);
    }
    
    try {
      // Use the specific catalog endpoints based on type
      let endpoint = '';
      switch (type) {
        case 'actor':
          endpoint = '/api/catalog/actors';
          break;
        case 'prop':
          endpoint = '/api/catalog/props';
          break;
        case 'location':
          endpoint = '/api/catalog/locations';
          break;
        default:
          // If no type specified, get all actors (default for compatibility)
          endpoint = '/api/catalog/actors';
      }
      
      return await this.request<any[]>(endpoint);
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.getCatalogItems(projectId, type);
    }
  }

  async createCatalogItem(projectId: string, data: any) {
    if (this.shouldUseMockData()) {
      console.log('Using mock data for createCatalogItem');
      return mockApiClient.createCatalogItem(projectId, data);
    }
    
    try {
      // Use the specific catalog endpoints based on type
      let endpoint = '';
      switch (data.type) {
        case 'actor':
          endpoint = '/api/catalog/actors';
          break;
        case 'prop':
          endpoint = '/api/catalog/props';
          break;
        case 'location':
          endpoint = '/api/catalog/locations';
          break;
        default:
          throw new Error('Invalid catalog item type');
      }
      
      return await this.request<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('API request failed, falling back to mock data:', error);
      this.isServerAvailable = false;
      return mockApiClient.createCatalogItem(projectId, data);
    }
  }

  async updateCatalogItem(id: string, data: any) {
    try {
      // Use the specific catalog endpoints based on type
      let endpoint = '';
      switch (data.type) {
        case 'actor':
          endpoint = `/api/catalog/actors/${id}`;
          break;
        case 'prop':
          endpoint = `/api/catalog/props/${id}`;
          break;
        case 'location':
          endpoint = `/api/catalog/locations/${id}`;
          break;
        default:
          throw new Error('Invalid catalog item type');
      }
      
      return await this.request<any>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Catalog update failed:', error);
      throw error;
    }
  }

  async deleteCatalogItem(id: string, type: string) {
    try {
      // Use the specific catalog endpoints based on type
      let endpoint = '';
      switch (type) {
        case 'actor':
          endpoint = `/api/catalog/actors/${id}`;
          break;
        case 'prop':
          endpoint = `/api/catalog/props/${id}`;
          break;
        case 'location':
          endpoint = `/api/catalog/locations/${id}`;
          break;
        default:
          throw new Error('Invalid catalog item type');
      }
      
      return await this.request<any>(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Catalog delete failed:', error);
      throw error;
    }
  }

  async getProjectUsedItems(projectId: string) {
    try {
      return await this.request<any>(`/api/catalog/projects/${projectId}/used-items`);
    } catch (error) {
      console.warn('Failed to get project used items:', error);
      return {
        project_id: projectId,
        used_actors: [],
        used_props: [],
        used_locations: [],
        total_scenes: 0
      };
    }
  }

  // Budget endpoints
  async getBudget(projectId: string) {
    return this.request<any>(`/api/projects/${projectId}/budget`);
  }

  async getBudgetLines(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/budget/lines`);
  }

  async createBudgetLine(projectId: string, data: any) {
    return this.request<any>(`/api/projects/${projectId}/budget/lines`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExpenditures(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/budget/expenditures`);
  }

  async createExpenditure(projectId: string, data: any) {
    return this.request<any>(`/api/projects/${projectId}/budget/expenditures`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Schedule endpoints
  async getSchedule(projectId: string, from?: string, to?: string) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    return this.request<any>(`/api/projects/${projectId}/schedule/calendar?${params}`);
  }

  async getScheduleItems(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/schedule/items`);
  }

  async createScheduleItem(projectId: string, sceneId: string, data: any) {
    return this.request<any>(`/api/projects/${projectId}/schedule/items?scene_id=${sceneId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateScheduleItem(projectId: string, sceneId: string, data: any) {
    return this.request<any>(`/api/projects/${projectId}/schedule/items/${sceneId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getScheduleConflicts(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/schedule/conflicts`);
  }

  async getScheduleStats(projectId: string) {
    return this.request<any>(`/api/projects/${projectId}/schedule/stats`);
  }

  async autoSchedule(projectId: string) {
    return this.request<any>(`/api/projects/${projectId}/schedule/auto-schedule`, {
      method: 'POST'
    });
  }

  // VFX endpoints
  async getVFXShots(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/vfx/shots`);
  }

  // Risks endpoints
  async getRisks(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/risks`);
  }

  // Production Stages endpoints
  async initializeProductionStages(projectId: string) {
    return this.request<any>(`/api/projects/${projectId}/production-stages/initialize`, {
      method: 'POST',
    });
  }

  async getProductionStages(projectId: string) {
    return this.request<any[]>(`/api/projects/${projectId}/production-stages`);
  }

  async getProductionOverview(projectId: string) {
    return this.request<any>(`/api/projects/${projectId}/production-overview`);
  }

  async createProductionStage(projectId: string, data: any) {
    return this.request<any>(`/api/projects/${projectId}/production-stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductionStage(stageId: number, data: any) {
    return this.request<any>(`/api/production-stages/${stageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductionStage(stageId: number) {
    return this.request<any>(`/api/production-stages/${stageId}`, {
      method: 'DELETE',
    });
  }

  async createProductionSubStage(stageId: number, data: any) {
    return this.request<any>(`/api/production-stages/${stageId}/sub-stages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductionSubStage(subStageId: number, data: any) {
    return this.request<any>(`/api/production-substages/${subStageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductionSubStage(subStageId: number) {
    return this.request<any>(`/api/production-substages/${subStageId}`, {
      method: 'DELETE',
    });
  }

  async createProductionTask(stageId: number, data: any, subStageId?: number) {
    const url = subStageId
      ? `/api/production-stages/${stageId}/tasks?sub_stage_id=${subStageId}`
      : `/api/production-stages/${stageId}/tasks`;
    
    return this.request<any>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProductionTask(taskId: number, data: any) {
    return this.request<any>(`/api/production-tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProductionTask(taskId: number) {
    return this.request<any>(`/api/production-tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
