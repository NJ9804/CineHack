// Real API Client for Backend Integration
import { 
  GlobalCost,
  GlobalCostCreate,
  GlobalCostUpdate,
  Project, 
  Character, 
  Scene, 
  Alert, 
  ScheduleItem, 
  BudgetItem 
} from '../../lib/types';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Projects API
const projects = {
  async getAll(): Promise<Project[]> {
    const backendProjects = await apiRequest<any[]>('/projects/');
    
    return backendProjects.map(p => ({
      id: p.id.toString(),
      title: p.name,
      year: new Date(p.created_at).getFullYear(),
      status: p.status as Project['status'],
      estimatedBudget: p.budget_total || 0,
      spentBudget: p.budget_used || 0,
      createdAt: p.created_at,
      poster: undefined
    }));
  },

  async getById(id: string): Promise<Project | null> {
    try {
      const project = await apiRequest<any>(`/projects/${id}`);
      return {
        id: project.id.toString(),
        title: project.name,
        year: new Date(project.created_at).getFullYear(),
        status: project.status as Project['status'],
        estimatedBudget: project.budget_total || 0,
        spentBudget: project.budget_used || 0,
        createdAt: project.created_at,
        poster: undefined
      };
    } catch (error) {
      return null;
    }
  },

  async create(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    const backendProject = await apiRequest<any>('/projects/', {
      method: 'POST',
      body: JSON.stringify({
        name: project.title,
        description: `Project created in ${project.year}`
      })
    });

    return {
      id: backendProject.id.toString(),
      title: backendProject.name,
      year: new Date(backendProject.created_at).getFullYear(),
      status: backendProject.status as Project['status'],
      estimatedBudget: backendProject.budget_total || 0,
      spentBudget: backendProject.budget_used || 0,
      createdAt: backendProject.created_at,
      poster: undefined
    };
  },

  async uploadScript(projectId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);

    const response = await fetch(`${API_BASE_URL}/scripts/analyze`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Script upload failed');
    }

    return response.json();
  }
};

// Characters API
const characters = {
  async getByProjectId(projectId: string): Promise<Character[]> {
    try {
      const charactersData = await apiRequest<any[]>(`/characters/projects/${projectId}/characters`);
      
      return charactersData.map(c => ({
        id: c.id.toString(),
        name: c.character_name,
        actorId: c.actor_id?.toString(),
        actorName: c.actor_name,
        scenes: []
      }));
    } catch (error) {
      return [];
    }
  }
};

// Scenes API
const scenes = {
  async getByProjectId(projectId: string): Promise<Scene[]> {
    try {
      // Use the correct endpoint from backend API docs
      const scenesData = await apiRequest<any[]>(`/projects/${projectId}/scenes`);
      
      return scenesData.map(s => ({
        id: s.id.toString(),
        number: parseInt(s.scene_number) || 0,
        name: s.scene_heading || `Scene ${s.scene_number}`,
        location: s.location_name || '',
        characters: s.actors_data?.map((a: any) => a.name) || [],
        estimatedBudget: s.estimated_cost || 0,
        properties: s.props_data || [],
        equipment: [],
        status: s.status === 'completed' ? 'completed' : 
                s.status === 'shooting' ? 'in-progress' : 'planned',
        alerts: []
      }));
    } catch (error) {
      return [];
    }
  }
};

// Budget API
const budget = {
  async getByProjectId(projectId: string): Promise<BudgetItem[]> {
    try {
      const budgetData = await apiRequest<any>(`/budget/projects/${projectId}`);
      
      const items: BudgetItem[] = [];
      
      if (budgetData.categories) {
        Object.entries(budgetData.categories).forEach(([category, data]: [string, any]) => {
          items.push({
            id: category,
            category: category,
            allocated: data.allocated,
            spent: data.spent,
            remaining: data.allocated - data.spent
          });
        });
      }
      
      return items;
    } catch (error) {
      return [];
    }
  }
};

// Global Costs API
const globalCosts = {
  async getAll(): Promise<GlobalCost[]> {
    return await apiRequest<GlobalCost[]>('/global-costs');
  },

  async getByCategory(category: 'actor' | 'property' | 'location'): Promise<GlobalCost[]> {
    return await apiRequest<GlobalCost[]>(`/global-costs/category/${category}`);
  },

  async create(data: GlobalCostCreate): Promise<GlobalCost> {
    return await apiRequest<GlobalCost>('/global-costs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: GlobalCostUpdate): Promise<GlobalCost> {
    return await apiRequest<GlobalCost>(`/global-costs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<{ message: string }> {
    return await apiRequest<{ message: string }>(`/global-costs/${id}`, {
      method: 'DELETE',
    });
  },

  async getById(id: number): Promise<GlobalCost> {
    return await apiRequest<GlobalCost>(`/global-costs/${id}`);
  }
};

// Unified API client
export const apiClient = {
  getProjects: projects.getAll,
  getProject: projects.getById,
  createProject: projects.create,
  uploadScript: projects.uploadScript,
  getScenes: scenes.getByProjectId,
  getCharacters: characters.getByProjectId,
  getBudget: budget.getByProjectId,
  getSchedule: async (projectId: string) => [],
  getAlerts: async (projectId: string) => [],
  globalCosts
};

// Named exports for backward compatibility
export const projectsApi = projects;
export const charactersApi = characters;
export const scenesApi = scenes;
export const budgetApi = budget;
export const globalCostsApi = globalCosts;