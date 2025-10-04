import { apiClient } from './client';
import { ScheduleItem, CalendarEvent, SchedulingConflict, ScheduleStats } from '@/lib/types';

// Real Schedule API using the backend
export const scheduleApi = {
  async getByProjectId(projectId: string): Promise<ScheduleItem[]> {
    console.log('🚀 [REAL API] Getting schedule items for project:', projectId);
    return apiClient.getScheduleItems(projectId);
  },

  async createScheduleItem(projectId: string, sceneId: string, data: Partial<ScheduleItem>): Promise<ScheduleItem> {
    console.log('🚀 [REAL API] Creating schedule item for scene:', sceneId);
    return apiClient.createScheduleItem(projectId, sceneId, data);
  },

  async updateScheduleItem(projectId: string, scheduleId: string, data: Partial<ScheduleItem>): Promise<ScheduleItem> {
    console.log('🚀 [REAL API] Updating schedule item:', scheduleId);
    return apiClient.updateScheduleItem(projectId, scheduleId, data);
  },

  async getCalendar(projectId: string): Promise<CalendarEvent[]> {
    console.log('🚀 [REAL API] Getting calendar for project:', projectId);
    const scheduleItems = await apiClient.getScheduleItems(projectId);
    return scheduleItems.map(item => ({
      id: item.id,
      title: `${item.scene_number}: ${item.scene_heading || 'Untitled Scene'}`,
      start: item.scheduled_date,
      end: item.scheduled_date,
      scene_id: item.sceneId,
      status: item.status,
      location: item.location_name,
      conflicts: item.conflicts || []
    }));
  },

  async getConflicts(projectId: string): Promise<SchedulingConflict[]> {
    console.log('🚀 [REAL API] Getting conflicts for project:', projectId);
    return apiClient.getScheduleConflicts(projectId);
  },

  async getStats(projectId: string): Promise<ScheduleStats> {
    console.log('🚀 [REAL API] Getting stats for project:', projectId);
    return apiClient.getScheduleStats(projectId);
  },

  async autoSchedule(projectId: string): Promise<{ message: string; scheduled_scenes: number; total_scenes: number }> {
    console.log('🚀 [REAL API] Auto-scheduling project:', projectId);
    return apiClient.autoSchedule(projectId);
  }
};

// Export the API clients
export { apiClient };