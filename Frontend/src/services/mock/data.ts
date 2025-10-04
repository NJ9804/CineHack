import { GlobalCost, Actor, Property, Project, Character, Scene, Alert, ScheduleItem, BudgetItem } from '../../lib/types';

// Mock Global Costs
export const mockGlobalCosts: GlobalCost[] = [
  { 
    id: 1, 
    name: 'Mohanlal', 
    category: 'actor', 
    billing_cycle: 'monthly', 
    cost: 5000000,
    description: 'Lead actor with national acclaim',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: 2, 
    name: 'Mammootty', 
    category: 'actor', 
    billing_cycle: 'monthly', 
    cost: 4500000,
    description: 'Veteran Malayalam cinema actor',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: 3, 
    name: 'Prithviraj', 
    category: 'actor', 
    billing_cycle: 'monthly', 
    cost: 3000000,
    description: 'Popular contemporary actor',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: 4, 
    name: 'Porsche 911', 
    category: 'property', 
    billing_cycle: 'daily', 
    cost: 150000,
    description: 'Luxury sports car for shooting',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: 5, 
    name: 'Toyota Innova', 
    category: 'property', 
    billing_cycle: 'daily', 
    cost: 25000,
    description: 'Multi-purpose vehicle for crew transport',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: 6, 
    name: 'Film Studio A', 
    category: 'location', 
    billing_cycle: 'daily', 
    cost: 200000,
    description: 'Professional indoor shooting studio',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  { 
    id: 7, 
    name: 'Beach Location', 
    category: 'location', 
    billing_cycle: 'daily', 
    cost: 50000,
    description: 'Scenic coastal location with permit',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Actors
export const mockActors: Actor[] = [
  { id: '1', name: 'Mohanlal', salary: 5000000, availability: ['2025-10-01', '2025-10-15'] },
  { id: '2', name: 'Mammootty', salary: 4500000, availability: ['2025-10-10', '2025-10-25'] },
  { id: '3', name: 'Prithviraj', salary: 3000000, availability: ['2025-10-05', '2025-10-20'] },
  { id: '4', name: 'Manju Warrier', salary: 2500000, availability: ['2025-10-03', '2025-10-18'] },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Drishyam 3',
    year: 2025,
    status: 'in-progress',
    estimatedBudget: 50000000,
    spentBudget: 15000000,
    createdAt: '2025-09-01'
  },
  {
    id: '2', 
    title: 'Lucifer 2',
    year: 2025,
    status: 'planning',
    estimatedBudget: 80000000,
    spentBudget: 0,
    createdAt: '2025-09-15'
  }
];

// Mock Characters for Drishyam 3
export const mockCharacters: Character[] = [
  { id: '1', name: 'Georgekutty', actorId: '1', actorName: 'Mohanlal', scenes: ['1', '2', '5'] },
  { id: '2', name: 'Rani', actorId: '4', actorName: 'Manju Warrier', scenes: ['1', '3', '5'] },
  { id: '3', name: 'Inspector Geetha Prabhakar', scenes: ['2', '4'] },
];

// Mock Scenes for Drishyam 3
export const mockScenes: Scene[] = [
  {
    id: '1',
    number: 1,
    name: 'Family Breakfast Scene',
    location: 'Georgekutty\'s House - Kitchen',
    characters: ['1', '2'],
    estimatedBudget: 150000,
    properties: ['9', '10'],
    equipment: ['Camera', 'Lighting Setup'],
    status: 'completed'
  },
  {
    id: '2',
    number: 2,
    name: 'Police Station Investigation',
    location: 'Rajakkad Police Station',
    characters: ['1', '3'],
    estimatedBudget: 250000,
    properties: [],
    equipment: ['Camera', 'Lighting Setup', 'Audio Equipment'],
    status: 'in-progress',
    alerts: [
      {
        id: 'alert1',
        type: 'equipment',
        severity: 'medium',
        message: 'Audio equipment maintenance scheduled',
        sceneId: '2'
      }
    ]
  },
  {
    id: '3',
    number: 3,
    name: 'Car Chase Sequence',
    location: 'Kochi-Madurai Highway',
    characters: ['2'],
    estimatedBudget: 800000,
    properties: ['6', '7'],
    equipment: ['Multiple Cameras', 'Drone', 'Safety Equipment'],
    status: 'planned',
    alerts: [
      {
        id: 'alert2',
        type: 'weather',
        severity: 'high',
        message: 'Heavy rain expected on shoot date',
        sceneId: '3'
      }
    ]
  }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert1',
    type: 'equipment',
    severity: 'medium',
    message: 'Audio equipment maintenance scheduled for Oct 5th'
  },
  {
    id: 'alert2',
    type: 'weather',
    severity: 'high',
    message: 'Heavy rain expected during outdoor shoot (Scene 3)'
  },
  {
    id: 'alert3',
    type: 'budget',
    severity: 'medium',
    message: 'Equipment rental costs 15% over budget'
  },
  {
    id: 'alert4',
    type: 'scheduling',
    severity: 'low',
    message: 'Actor availability conflict for Scene 5'
  }
];

// Mock Schedule
export const mockSchedule: ScheduleItem[] = [
  { id: '1', sceneId: '1', date: '2025-10-01', status: 'completed' },
  { id: '2', sceneId: '2', date: '2025-10-05', status: 'in-progress' },
  { id: '3', sceneId: '3', date: '2025-10-10', status: 'planned', conflicts: ['Weather Alert'] },
];

// Mock Budget
export const mockBudget: BudgetItem[] = [
  { id: '1', category: 'Actors', allocated: 15000000, spent: 8000000, remaining: 7000000 },
  { id: '2', category: 'Equipment', allocated: 5000000, spent: 2500000, remaining: 2500000 },
  { id: '3', category: 'Locations', allocated: 3000000, spent: 1000000, remaining: 2000000 },
  { id: '4', category: 'Catering', allocated: 2000000, spent: 500000, remaining: 1500000 },
  { id: '5', category: 'Transport', allocated: 1500000, spent: 800000, remaining: 700000 },
  { id: '6', category: 'VFX', allocated: 8000000, spent: 1000000, remaining: 7000000 },
  { id: '7', category: 'Marketing', allocated: 5000000, spent: 0, remaining: 5000000 },
];