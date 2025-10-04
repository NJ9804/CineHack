// Global Types
export interface GlobalCost {
  id: number;
  name: string;
  category: 'actor' | 'property' | 'location';
  billing_cycle: 'daily' | 'weekly' | 'monthly';
  cost: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalCostCreate {
  name: string;
  category: 'actor' | 'property' | 'location';
  billing_cycle: 'daily' | 'weekly' | 'monthly';
  cost: number;
  description?: string;
}

export interface GlobalCostUpdate {
  cost?: number;
  billing_cycle?: 'daily' | 'weekly' | 'monthly';
  description?: string;
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

// Promotions & Analytics Types
export interface VideoAnalytics {
  video_title: string;
  url: string;
  views: number;
  likes: number;
  comments_count: number;
  video_description?: string;
  top_comments?: string[];
}

export interface SentimentAnalysis {
  overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  positive_percentage: number;
  average_score: number;
  sentiment_summary: string;
  comments_analysis?: Array<{
    comment: string;
    sentiment: string;
    score: number;
  }>;
  total_analyzed: number;
  total_comments: number;
}

export interface Promotion {
  id: number;
  project_id: number;
  film: string;
  total_views: number;
  total_likes: number;
  total_comments: number;
  videos: VideoAnalytics[];
  industry_progress: string;
  sentiment_analysis?: SentimentAnalysis;
  created_at: string;
}
