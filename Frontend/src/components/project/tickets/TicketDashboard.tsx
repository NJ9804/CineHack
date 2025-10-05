'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api/client';
import type { TicketAnalytics } from '@/services/api/tickets';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface IssueDashboardProps {
  projectId: number;
}

const STATUS_COLORS: Record<string, string> = {
  open: '#3B82F6',
  in_progress: '#F59E0B',
  waiting_response: '#EF4444',
  resolved: '#10B981',
  closed: '#6B7280',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#3B82F6',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#DC2626',
};

export default function IssueDashboard({ projectId }: IssueDashboardProps) {
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [projectId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTicketAnalytics(projectId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">No analytics data available</div>
      </div>
    );
  }

  const statusData = Object.entries(analytics.status_breakdown).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
    color: STATUS_COLORS[name] || '#6B7280',
  }));

  const priorityData = Object.entries(analytics.priority_breakdown).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
    color: PRIORITY_COLORS[name] || '#6B7280',
  }));

  const departmentData = Object.entries(analytics.department_breakdown).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-6 bg-primary-bg min-h-screen p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent-secondary">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{analytics.total_tickets}</div>
            <p className="text-xs text-text-secondary">
              {analytics.open_tickets} open
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent-secondary">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-accent-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{analytics.in_progress_tickets}</div>
            <p className="text-xs text-text-secondary">
              {analytics.total_tickets > 0
                ? ((analytics.in_progress_tickets / analytics.total_tickets) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent-secondary">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-accent-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">{analytics.resolved_tickets}</div>
            <p className="text-xs text-text-secondary">
              {analytics.total_tickets > 0
                ? ((analytics.resolved_tickets / analytics.total_tickets) * 100).toFixed(1)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-accent-secondary">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-accent-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {analytics.avg_response_time_hours.toFixed(1)}h
            </div>
            <p className="text-xs text-text-secondary">
              Resolution: {analytics.avg_resolution_time_hours.toFixed(1)}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="border-b border-accent-brown/20">
            <CardTitle className="text-accent-secondary">Status Distribution</CardTitle>
            <CardDescription className="text-text-secondary">Issues by current status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
          <CardHeader className="border-b border-accent-brown/20">
            <CardTitle className="text-accent-secondary">Priority Distribution</CardTitle>
            <CardDescription className="text-text-secondary">Issues by priority level</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#5A3825/20" />
                <XAxis dataKey="name" stroke="#E5D5B5" />
                <YAxis stroke="#E5D5B5" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #5A3825',
                    borderRadius: '8px',
                    color: '#FFC107'
                  }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Activity */}
        {departmentData.length > 0 && (
          <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-accent-brown/20">
              <CardTitle className="text-accent-secondary">Department Activity</CardTitle>
              <CardDescription className="text-text-secondary">Issues by department</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5A3825/20" />
                  <XAxis dataKey="name" stroke="#E5D5B5" />
                  <YAxis stroke="#E5D5B5" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #5A3825',
                      borderRadius: '8px',
                      color: '#FFC107'
                    }}
                  />
                  <Bar dataKey="value" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {Object.keys(analytics.category_breakdown).length > 0 && (
          <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
            <CardHeader className="border-b border-accent-brown/20">
              <CardTitle className="text-accent-secondary">Category Breakdown</CardTitle>
              <CardDescription className="text-text-secondary">Issues by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {Object.entries(analytics.category_breakdown).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent-primary/20 text-accent-primary border-accent-primary/40">
                        {category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-accent-brown/20 rounded-full h-2">
                        <div
                          className="bg-accent-primary h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.total_tickets) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right text-text-primary">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics */}
      <Card className="bg-secondary-bg/95 border-accent-brown/40 shadow-lg backdrop-blur-sm">
        <CardHeader className="border-b border-accent-brown/20">
          <CardTitle className="text-accent-secondary">Performance Metrics</CardTitle>
          <CardDescription className="text-text-secondary">Issue handling efficiency</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-accent-brown/30 bg-primary-bg/50 rounded-lg">
              <div className="text-3xl font-bold text-accent-primary">
                {analytics.avg_response_time_hours.toFixed(1)}h
              </div>
              <div className="text-sm text-text-secondary mt-1">Average Response Time</div>
            </div>
            <div className="text-center p-4 border border-accent-brown/30 bg-primary-bg/50 rounded-lg">
              <div className="text-3xl font-bold text-accent-secondary">
                {analytics.avg_resolution_time_hours.toFixed(1)}h
              </div>
              <div className="text-sm text-text-secondary mt-1">Average Resolution Time</div>
            </div>
            <div className="text-center p-4 border border-accent-brown/30 bg-primary-bg/50 rounded-lg">
              <div className="text-3xl font-bold text-accent-primary">
                {analytics.total_tickets > 0
                  ? (
                      ((analytics.resolved_tickets + analytics.closed_tickets) /
                        analytics.total_tickets) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-text-secondary mt-1">Resolution Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
