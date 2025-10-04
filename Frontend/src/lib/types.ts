// Global Types
export interface GlobalCost {
  id: string;
  name: string;
  category: 'actors' | 'actresses' | 'properties';
  cost: number;
}

export interface Actor {
  id: string;
  name: string;
  salary: number;
  availability?: string[];
}

export interface Property {
  id: string;
  name: string;
  cost: number;
  available: boolean;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  year: number;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  poster?: string;
  estimatedBudget: number;
  spentBudget: number;
  createdAt: string;
  synopsis?: string;
  script?: string;
}

export interface Character {
  id: string;
  name: string;
  actorId?: string;
  actorName?: string;
  scenes: string[];
}

export interface Scene {
  id: string;
  number: number;
  name: string;
  location: string;
  characters: string[];
  estimatedBudget: number;
  properties: string[];
  equipment: string[];
  status: 'planned' | 'in-progress' | 'completed';
  alerts?: Alert[];
}

export interface Alert {
  id: string;
  type: 'weather' | 'equipment' | 'budget' | 'scheduling';
  severity: 'low' | 'medium' | 'high';
  message: string;
  sceneId?: string;
}

export interface ScheduleItem {
  id: string;
  sceneId: string;
  date: string;
  status: 'planned' | 'in-progress' | 'completed';
  conflicts?: string[];
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}