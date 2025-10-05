import { apiClient } from './client';

// Backend Scene response interface to match the API
export interface SceneResponse {
  id: number;
  project_id: number;
  scene_number: string;
  scene_heading?: string;
  location_name: string;
  location_type?: string;
  time_of_day?: string;
  estimated_duration?: string;
  status: string;
  actors_data?: Array<{ [key: string]: any }>;
  props_data?: string[];
  location_data?: { [key: string]: any };
  crowd_data?: { [key: string]: any };
  time_data?: { [key: string]: any };
  technical_notes?: string;
  estimated_cost: number;
  actual_cost: number;
  created_at?: string;
  updated_at?: string;
}

// Scene create request interface
export interface SceneCreateRequest {
  scene_number: string;
  scene_heading?: string;
  location_name: string;
  location_type?: string;
  time_of_day?: string;
  estimated_duration?: string;
  actors_data?: Array<{ [key: string]: any }>;
  props_data?: string[];
  location_data?: { [key: string]: any };
  crowd_data?: { [key: string]: any };
  time_data?: { [key: string]: any };
  technical_notes?: string;
}

// Scene update request interface
export interface SceneUpdateRequest {
  scene_heading?: string;
  location_name?: string;
  location_type?: string;
  time_of_day?: string;
  status?: string;
  estimated_duration?: string;
  actors_data?: Array<{ [key: string]: any }>;
  props_data?: string[];
  technical_notes?: string;
}

export const scenesService = {
  // Get all scenes for a project
  async getProjectScenes(projectId: number): Promise<SceneResponse[]> {
    return await apiClient.getScenes(projectId.toString());
  },

  // Get a specific scene by ID
  async getScene(sceneId: number): Promise<SceneResponse> {
    // Note: apiClient doesn't have getScene method, we'll implement it if needed
    throw new Error('getScene not implemented yet');
  },

  // Create a new scene
  async createScene(projectId: number, sceneData: SceneCreateRequest): Promise<SceneResponse> {
    return await apiClient.createScene(projectId.toString(), sceneData);
  },

  // Update an existing scene
  async updateScene(sceneId: number, updates: SceneUpdateRequest): Promise<SceneResponse> {
    return await apiClient.updateScene(sceneId, updates);
  },

  // Delete a scene
  async deleteScene(sceneId: number): Promise<void> {
    // Note: apiClient doesn't have deleteScene method, we'll implement it if needed
    throw new Error('deleteScene not implemented yet');
  }
};