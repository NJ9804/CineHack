"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Calendar, Clock } from 'lucide-react';
import { Project, Alert } from '@/lib/types';

interface DashboardAnalyticsProps {
  projects: Project[];
  alerts: Alert[];
}

export default function DashboardAnalytics({ projects, alerts }: DashboardAnalyticsProps) {
  // Calculate analytics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.estimatedBudget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spentBudget, 0);
  
  // Budget efficiency (lower is better)
  const budgetEfficiency = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  // Recent activity (mock data for now)
  const recentActivities = [
    { 
      id: '1', 
      type: 'project_created', 
      message: 'New project "Mystery Thriller" created',
      time: '2 hours ago',
      icon: '🎬'
    },
    { 
      id: '2', 
      type: 'budget_alert', 
      message: 'Budget warning for "The Great Adventure"',
      time: '4 hours ago',
      icon: '⚠️'
    },
    { 
      id: '3', 
      type: 'scene_completed', 
      message: 'Scene 15 marked as completed in "Drama Film"',
      time: '6 hours ago',
      icon: '✅'
    }
  ];

  // Upcoming deadlines (mock data)
  const upcomingDeadlines = [
    {
      id: '1',
      project: 'The Great Adventure',
      task: 'Principal photography ends',
      date: '2025-10-10',
      daysLeft: 7
    },
    {
      id: '2',
      project: 'Mystery Thriller',
      task: 'Location scouting complete',
      date: '2025-10-15',
      daysLeft: 12
    }
  ];

  const getDaysUntil = (dateString: string) => {
    const target = new Date(dateString);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {activeProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-text-secondary">Completion Rate</div>
              </div>
              <TrendingUp className="w-8 h-8 text-accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {budgetEfficiency.toFixed(0)}%
                </div>
                <div className="text-sm text-text-secondary">Budget Used</div>
              </div>
              {budgetEfficiency < 80 ? (
                <TrendingUp className="w-8 h-8 text-accent-primary" />
              ) : (
                <TrendingDown className="w-8 h-8 text-accent-brown" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">{alerts.length}</div>
                <div className="text-sm text-text-secondary">Active Alerts</div>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-secondary-bg border-accent-brown">
          <CardHeader>
            <CardTitle className="text-accent-secondary flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary-bg/50">
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{activity.message}</p>
                  <p className="text-xs text-text-secondary">{activity.time}</p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-text-secondary text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-secondary-bg border-accent-brown">
          <CardHeader>
            <CardTitle className="text-accent-secondary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map(deadline => {
              const daysLeft = getDaysUntil(deadline.date);
              const isUrgent = daysLeft <= 3;
              
              return (
                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg bg-primary-bg/50">
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">{deadline.task}</p>
                    <p className="text-xs text-text-secondary">{deadline.project}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    isUrgent 
                      ? 'bg-accent-brown text-accent-primary' 
                      : daysLeft <= 7 
                      ? 'bg-accent-secondary text-primary-bg'
                      : 'bg-accent-primary text-primary-bg'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                  </div>
                </div>
              );
            })}
            {upcomingDeadlines.length === 0 && (
              <p className="text-text-secondary text-center py-4">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}