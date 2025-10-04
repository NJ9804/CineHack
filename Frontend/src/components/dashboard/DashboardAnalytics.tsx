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
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {activeProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(0) : 0}%
                </div>
                <div className="text-sm text-gray-400">Completion Rate</div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {budgetEfficiency.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">Budget Used</div>
              </div>
              {budgetEfficiency < 80 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{alerts.length}</div>
                <div className="text-sm text-gray-400">Active Alerts</div>
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
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50">
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map(deadline => {
              const daysLeft = getDaysUntil(deadline.date);
              const isUrgent = daysLeft <= 3;
              
              return (
                <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{deadline.task}</p>
                    <p className="text-xs text-gray-400">{deadline.project}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    isUrgent 
                      ? 'bg-red-500/20 text-red-400' 
                      : daysLeft <= 7 
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                  </div>
                </div>
              );
            })}
            {upcomingDeadlines.length === 0 && (
              <p className="text-gray-400 text-center py-4">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}