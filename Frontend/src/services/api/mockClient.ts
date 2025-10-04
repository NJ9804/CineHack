"use client"

import { Project, Scene, Character, Actor } from '@/lib/types';

// Mock data for when backend is not available
export const mockApiData: {
  projects: Project[];
  scenes: Record<string, Scene[]>;
  characters: Record<string, Character[]>;
  catalogItems: Record<string, any[]>;
} = {
  projects: [
    {
      id: '1',
      title: 'The Great Adventure',
      year: 2024,
      status: 'in-progress' as const,
      estimatedBudget: 50000000,
      spentBudget: 20000000,
      createdAt: '2024-01-15T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'Mystery Thriller',
      year: 2024,
      status: 'planning' as const,
      estimatedBudget: 30000000,
      spentBudget: 5000000,
      createdAt: '2024-02-01T00:00:00.000Z'
    },
    {
      id: '3',
      title: 'Drama Film',
      year: 2024,
      status: 'completed' as const,
      estimatedBudget: 40000000,
      spentBudget: 38000000,
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  ],

  scenes: {
    '1': [
      {
        id: 'scene-1',
        number: 1,
        name: 'Opening Scene',
        location: 'Mountain Peak',
        characters: ['Hero', 'Guide'],
        estimatedBudget: 500000,
        properties: ['Climbing gear', 'Camera equipment'],
        equipment: ['Drone', 'Safety harness'],
        status: 'completed' as const
      },
      {
        id: 'scene-2',
        number: 2,
        name: 'The Discovery',
        location: 'Cave Entrance',
        characters: ['Hero', 'Villain'],
        estimatedBudget: 750000,
        properties: ['Ancient artifact', 'Torches'],
        equipment: ['Lighting rig', 'Fog machine'],
        status: 'in-progress' as const
      }
    ],
    '2': [
      {
        id: 'scene-3',
        number: 1,
        name: 'Dark Alley',
        location: 'City Street',
        characters: ['Detective', 'Suspect'],
        estimatedBudget: 300000,
        properties: ['Police badge', 'Weapon'],
        equipment: ['Street lights', 'Rain machine'],
        status: 'planned' as const
      }
    ],
    '3': [
      {
        id: 'scene-4',
        number: 1,
        name: 'Family Reunion',
        location: 'Living Room',
        characters: ['Father', 'Mother', 'Son'],
        estimatedBudget: 200000,
        properties: ['Family photos', 'Cake'],
        equipment: ['Indoor lighting', 'Multiple cameras'],
        status: 'completed' as const
      }
    ]
  },

  characters: {
    '1': [
      {
        id: 'char-1',
        name: 'Hero',
        actorId: 'actor-1',
        actorName: 'John Smith',
        scenes: ['scene-1', 'scene-2']
      },
      {
        id: 'char-2',
        name: 'Guide',
        scenes: ['scene-1']
      }
    ],
    '2': [
      {
        id: 'char-3',
        name: 'Detective',
        scenes: ['scene-3']
      }
    ],
    '3': [
      {
        id: 'char-4',
        name: 'Father',
        scenes: ['scene-4']
      }
    ]
  },

  catalogItems: {
    '1': [
      {
        id: 'actor-1',
        type: 'actor',
        name: 'John Smith',
        daily_rate: 100000,
        availability: 'available',
        contact_email: 'john@example.com',
        experience: '10 years'
      },
      {
        id: 'loc-1',
        type: 'location',
        name: 'Mountain Studio',
        address: 'Studio City, CA',
        daily_rate: 50000,
        capacity: 50,
        availability: 'available'
      },
      {
        id: 'prop-1',
        type: 'prop',
        name: 'Climbing Gear Set',
        category: 'Equipment',
        quantity: 5,
        unit_cost: 2000,
        availability: 'available'
      }
    ],
    '2': [],
    '3': []
  }
};

export class MockApiClient {
  // Simulate network delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProjects(): Promise<Project[]> {
    await this.delay();
    return mockApiData.projects;
  }

  async getProject(id: string): Promise<Project | null> {
    await this.delay();
    return mockApiData.projects.find(p => p.id === id) || null;
  }

  async createProject(data: any): Promise<Project> {
    await this.delay();
    const newProject: Project = {
      id: Date.now().toString(),
      title: data.title,
      year: new Date().getFullYear(),
      status: 'planning',
      estimatedBudget: data.estimatedBudget || 0,
      spentBudget: 0,
      createdAt: new Date().toISOString()
    };
    mockApiData.projects.push(newProject);
    return newProject;
  }

  async getScenes(projectId: string): Promise<Scene[]> {
    await this.delay();
    return mockApiData.scenes[projectId] || [];
  }

  async createScene(projectId: string, data: any): Promise<Scene> {
    await this.delay();
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      number: data.number || 1,
      name: data.name || 'New Scene',
      location: data.location || '',
      characters: data.characters || [],
      estimatedBudget: data.estimatedBudget || 0,
      properties: data.properties || [],
      equipment: data.equipment || [],
      status: data.status || 'planned'
    };
    
    if (!mockApiData.scenes[projectId]) {
      mockApiData.scenes[projectId] = [];
    }
    mockApiData.scenes[projectId].push(newScene);
    return newScene;
  }

  async getCharacters(projectId: string): Promise<Character[]> {
    await this.delay();
    return mockApiData.characters[projectId] || [];
  }

  async getCatalogItems(projectId: string, type?: string): Promise<any[]> {
    await this.delay();
    const items = mockApiData.catalogItems[projectId] || [];
    return type ? items.filter(item => item.type === type) : items;
  }

  async createCatalogItem(projectId: string, data: any): Promise<any> {
    await this.delay();
    const newItem = {
      id: `item-${Date.now()}`,
      ...data
    };
    
    if (!mockApiData.catalogItems[projectId]) {
      mockApiData.catalogItems[projectId] = [];
    }
    mockApiData.catalogItems[projectId].push(newItem);
    return newItem;
  }

  // Placeholder methods for other API calls
  async login(email: string, password: string) {
    await this.delay();
    return { access_token: 'mock-token', user: { email } };
  }

  async register(data: any) {
    await this.delay();
    return { access_token: 'mock-token', user: data };
  }

  async getCurrentUser() {
    await this.delay();
    return { id: '1', email: 'user@example.com', name: 'Test User' };
  }

  // Add other methods as needed with mock implementations
  async getBudgetLines(projectId: string) {
    await this.delay();
    return [];
  }

  async createBudgetLine(projectId: string, data: any) {
    await this.delay();
    return { id: Date.now().toString(), ...data };
  }

  async getExpenditures(projectId: string) {
    await this.delay();
    return [];
  }

  async createExpenditure(projectId: string, data: any) {
    await this.delay();
    return { id: Date.now().toString(), ...data };
  }

  async getSchedule(projectId: string, from?: string, to?: string) {
    await this.delay();
    return {};
  }

  async getVFXShots(projectId: string) {
    await this.delay();
    return [];
  }

  async getRisks(projectId: string) {
    await this.delay();
    return [];
  }
}

export const mockApiClient = new MockApiClient();