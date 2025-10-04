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
  status: 'unplanned' | 'planned' | 'in-progress' | 'shooting' | 'completed';
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
  scene_number?: string;
  scene_heading?: string;
  location_name?: string;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  conflicts?: string[];
  actors_involved?: any[];
  estimated_duration?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  scene_id: string;
  status: string;
  location?: string;
  conflicts: string[];
}

export interface SchedulingConflict {
  type: 'actor_conflict' | 'location_conflict' | 'resource_conflict' | 'weather';
  message: string;
  affected_scenes: string[];
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ScheduleStats {
  total_scenes: number;
  planned: number;
  completed: number;
  unplanned: number;
  in_progress: number;
  conflicts: number;
  shooting_days: number;
  estimated_duration: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}