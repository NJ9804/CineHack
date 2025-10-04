import { 
  mockGlobalCosts, 
  mockProjects, 
  mockCharacters, 
  mockScenes, 
  mockAlerts, 
  mockSchedule, 
  mockBudget 
} from '../mock/data';
import { 
  GlobalCost,
  GlobalCostCreate,
  GlobalCostUpdate,
  Project, 
  Character, 
  Scene, 
  Alert, 
  ScheduleItem, 
  BudgetItem,
  SchedulingConflict,
  ScheduleStats,
  CalendarEvent
} from '../../lib/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Global Costs API
export const globalCostsApi = {
  async getAll(): Promise<GlobalCost[]> {
    await delay(500);
    return mockGlobalCosts;
  },

  async getByCategory(category: 'actor' | 'property' | 'location'): Promise<GlobalCost[]> {
    await delay(300);
    return mockGlobalCosts.filter(c => c.category === category);
  },

  async create(data: GlobalCostCreate): Promise<GlobalCost> {
    await delay(300);
    const newCost: GlobalCost = {
      ...data,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockGlobalCosts.push(newCost);
    return newCost;
  },

  async update(id: number, data: GlobalCostUpdate): Promise<GlobalCost> {
    await delay(300);
    const costIndex = mockGlobalCosts.findIndex(c => c.id === id);
    if (costIndex === -1) throw new Error('Cost not found');
    
    const updatedCost = {
      ...mockGlobalCosts[costIndex],
      ...data,
      updated_at: new Date().toISOString()
    };
    mockGlobalCosts[costIndex] = updatedCost;
    return updatedCost;
  },

  async delete(id: number): Promise<{ message: string }> {
    await delay(300);
    const costIndex = mockGlobalCosts.findIndex(c => c.id === id);
    if (costIndex === -1) throw new Error('Cost not found');
    
    mockGlobalCosts.splice(costIndex, 1);
    return { message: `Global cost with ID ${id} has been deleted successfully` };
  },

  async getById(id: number): Promise<GlobalCost> {
    await delay(300);
    const cost = mockGlobalCosts.find(c => c.id === id);
    if (!cost) throw new Error('Cost not found');
    return cost;
  }
};

// Projects API
export const projectsApi = {
  async getAll(): Promise<Project[]> {
    await delay(500);
    return mockProjects;
  },

  async getById(id: string): Promise<Project | null> {
    await delay(300);
    return mockProjects.find(p => p.id === id) || null;
  },

  async create(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    await delay(800); // Simulate "script breaking" process
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      spentBudget: 0
    };
    mockProjects.push(newProject);
    return newProject;
  }
};

// Characters API
export const charactersApi = {
  async getByProjectId(projectId: string): Promise<Character[]> {
    await delay(300);
    return mockCharacters; // In real app, filter by projectId
  }
};

// Scenes API
export const scenesApi = {
  async getByProjectId(projectId: string): Promise<Scene[]> {
    await delay(400);
    return mockScenes; // In real app, filter by projectId
  },

  async updateScene(sceneId: string, updates: Partial<Scene>): Promise<Scene> {
    await delay(300);
    const scene = mockScenes.find(s => s.id === sceneId);
    if (!scene) throw new Error('Scene not found');
    Object.assign(scene, updates);
    return scene;
  }
};

// Schedule API
export const scheduleApi = {
  async getByProjectId(projectId: string): Promise<ScheduleItem[]> {
    await delay(300);
    return mockSchedule; // In real app, filter by projectId
  },

  async createScheduleItem(projectId: string, sceneId: string, data: Partial<ScheduleItem>): Promise<ScheduleItem> {
    await delay(300);
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      sceneId,
      scene_number: `Scene ${sceneId}`,
      scene_heading: 'New Scene',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      start_time: data.start_time || '09:00',
      end_time: data.end_time || '17:00',
      status: data.status || 'planned',
      conflicts: [],
      actors_involved: [],
      ...data
    };
    mockSchedule.push(newItem);
    return newItem;
  },

  async updateScheduleItem(projectId: string, scheduleId: string, data: Partial<ScheduleItem>): Promise<ScheduleItem> {
    await delay(300);
    const item = mockSchedule.find(s => s.id === scheduleId);
    if (!item) throw new Error('Schedule item not found');
    Object.assign(item, data);
    return item;
  },

  async getCalendar(projectId: string): Promise<CalendarEvent[]> {
    await delay(300);
    return mockSchedule.map(item => ({
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
    await delay(300);
    return [
      {
        type: 'actor_conflict',
        message: 'Lead actor scheduled for multiple scenes on same day',
        affected_scenes: ['1', '3'],
        date: '2025-10-10',
        severity: 'high'
      },
      {
        type: 'weather',
        message: 'Heavy rain expected for outdoor shoot',
        affected_scenes: ['3'],
        date: '2025-10-12',
        severity: 'medium'
      }
    ];
  },

  async getStats(projectId: string): Promise<ScheduleStats> {
    await delay(300);
    const scenes = mockScenes;
    return {
      total_scenes: scenes.length,
      planned: scenes.filter(s => s.status === 'planned').length,
      completed: scenes.filter(s => s.status === 'completed').length,
      unplanned: scenes.filter(s => !s.status || s.status === 'planned').length,
      in_progress: scenes.filter(s => s.status === 'in-progress').length,
      conflicts: 2,
      shooting_days: 15,
      estimated_duration: "45 days"
    };
  },

  async autoSchedule(projectId: string): Promise<{ message: string; scheduled_scenes: number; total_scenes: number }> {
    await delay(1000);
    const scenes = mockScenes;
    const unscheduled = scenes.filter(s => !s.status || s.status === 'planned');
    
    // Simulate auto-scheduling
    unscheduled.forEach(scene => {
      scene.status = 'planned';
    });

    return {
      message: `Auto-scheduled ${unscheduled.length} scenes`,
      scheduled_scenes: unscheduled.length,
      total_scenes: scenes.length
    };
  }
};

// Budget API
export const budgetApi = {
  async getByProjectId(projectId: string): Promise<BudgetItem[]> {
    await delay(300);
    return mockBudget; // In real app, filter by projectId
  }
};

// Alerts API
export const alertsApi = {
  async getByProjectId(projectId: string): Promise<Alert[]> {
    await delay(300);
    return mockAlerts; // In real app, filter by projectId
  }
};

// Unified API client for mock data
export const apiClient = {
  getProjects: projectsApi.getAll,
  getProject: projectsApi.getById,
  createProject: projectsApi.create,
  getScenes: scenesApi.getByProjectId,
  getCharacters: charactersApi.getByProjectId,
  getBudget: budgetApi.getByProjectId,
  getSchedule: scheduleApi.getByProjectId,
  getScheduleCalendar: scheduleApi.getCalendar,
  getScheduleConflicts: scheduleApi.getConflicts,
  getScheduleStats: scheduleApi.getStats,
  createScheduleItem: scheduleApi.createScheduleItem,
  updateScheduleItem: scheduleApi.updateScheduleItem,
  autoSchedule: scheduleApi.autoSchedule,
  getAlerts: alertsApi.getByProjectId,
  globalCosts: globalCostsApi,
  uploadScript: async (projectId: string, file: File) => {
    await delay(2000); // Simulate script processing
    return {
      analysis_id: Date.now(),
      filename: file.name,
      total_scenes: Math.floor(Math.random() * 20) + 5,
      scenes: [],
      summary: { message: 'Script analyzed successfully (mock)' },
      project_id: projectId
    };
  }
};