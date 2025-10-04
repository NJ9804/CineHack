import { 
  mockGlobalCosts, 
  mockProjects, 
  mockCharacters, 
  mockScenes, 
  mockAlerts, 
  mockSchedule, 
  mockBudget 
} from '../mock/data';
import { GlobalCost, Project, Character, Scene, Alert, ScheduleItem, BudgetItem } from '../../lib/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Global Costs API
export const globalCostsApi = {
  async getAll(): Promise<GlobalCost[]> {
    await delay(500);
    return mockGlobalCosts;
  },

  async updateCost(id: string, newCost: number): Promise<GlobalCost> {
    await delay(300);
    const cost = mockGlobalCosts.find(c => c.id === id);
    if (!cost) throw new Error('Cost not found');
    cost.cost = newCost;
    return cost;
  },

  async addCost(cost: Omit<GlobalCost, 'id'>): Promise<GlobalCost> {
    await delay(300);
    const newCost = {
      ...cost,
      id: Date.now().toString()
    };
    mockGlobalCosts.push(newCost);
    return newCost;
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
  getAlerts: alertsApi.getByProjectId,
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