/**
 * Schedule API Service
 * Handles all schedule-related API calls
 */

import apiClient from './client';

export interface ScheduleItemCreate {
  scene_id: number;
  scheduled_date?: string;
  location?: string;
  crew?: string[];
  notes?: string;
}

export interface ScheduleItemUpdate {
  status?: string;
  scheduled_date?: string;
  location?: string;
  crew?: string[];
  notes?: string;
}

export interface ScheduleStats {
  total_scenes: number;
  scheduled: number;
  completed: number;
  in_progress: number;
  unscheduled: number;
  total_shoot_days: number;
  days_completed: number;
  completion_percentage: number;
}

export interface SchedulingConflict {
  id: number;
  type: string;
  severity: string;
  message: string;
  scenes: number[];
  date?: string;
}

export interface AutoScheduleRequest {
  constraints?: Record<string, any>;
  optimize_for?: 'efficiency' | 'cost' | 'quality';
}

export interface AutoScheduleResponse {
  success: boolean;
  message: string;
  scheduled_count: number;
  conflicts: SchedulingConflict[];
}

/**
 * Get scheduling statistics for a project
 */
export async function getStats(projectId: string): Promise<ScheduleStats> {
  return apiClient.getScheduleStats(projectId);
}

/**
 * Get scheduling conflicts for a project
 */
export async function getConflicts(projectId: string): Promise<SchedulingConflict[]> {
  return apiClient.getScheduleConflicts(projectId);
}

/**
 * Create a schedule item for a scene
 */
export async function createScheduleItem(
  projectId: string,
  sceneId: number | string,
  data: ScheduleItemCreate
): Promise<any> {
  const numericSceneId = typeof sceneId === 'string' ? parseInt(sceneId, 10) : sceneId;
  return apiClient.createScheduleItem(projectId, numericSceneId.toString(), data);
}

/**
 * Update a schedule item
 */
export async function updateScheduleItem(
  projectId: string,
  sceneId: number | string,
  data: ScheduleItemUpdate
): Promise<any> {
  const numericSceneId = typeof sceneId === 'string' ? parseInt(sceneId, 10) : sceneId;
  return apiClient.updateScheduleItem(projectId, numericSceneId.toString(), data);
}

/**
 * Delete a schedule item (unschedule a scene)
 */
export async function deleteScheduleItem(
  projectId: string,
  sceneId: number | string
): Promise<{ message: string; scene_id: number }> {
  const numericSceneId = typeof sceneId === 'string' ? parseInt(sceneId, 10) : sceneId;
  // ApiClient doesn't have a delete method for schedule, we'll need to add it
  // For now, we'll use the update method to set status to unplanned
  return apiClient.updateScheduleItem(projectId, numericSceneId.toString(), { status: 'unplanned' });
}

/**
 * Auto-schedule unplanned scenes
 */
export async function autoSchedule(
  projectId: string,
  request: AutoScheduleRequest = {}
): Promise<AutoScheduleResponse> {
  return apiClient.autoSchedule(projectId);
}

const scheduleApi = {
  getStats,
  getConflicts,
  createScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  autoSchedule,
};

export default scheduleApi;
