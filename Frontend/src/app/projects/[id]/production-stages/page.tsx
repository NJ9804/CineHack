"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  CheckCircle2,
  Circle,
  Pause,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { apiClient } from '@/services/api/client';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  checklist: any[];
  tags: string[];
}

interface SubStage {
  id: number;
  name: string;
  description: string;
  order: number;
  status: string;
  progress: number;
  priority: string;
  assigned_to: string | null;
  start_date: string | null;
  end_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  deliverables: string[];
  tasks: Task[];
}

interface ProductionStage {
  id: number;
  name: string;
  description: string;
  order: number;
  status: string;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  estimated_duration_days: number | null;
  budget_allocated: number;
  budget_spent: number;
  sub_stages: SubStage[];
  tasks: Task[];
}

interface ProjectOverview {
  project_name: string;
  overall_progress: number;
  stages: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
  };
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    blocked: number;
    completion_rate: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    utilization_rate: number;
  };
  current_stage: string | null;
}

export default function ProductionStagesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  const [expandedSubStages, setExpandedSubStages] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadProductionData();
  }, [projectId]);

  const loadProductionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load stages
      const stagesData = await apiClient.getProductionStages(projectId);
      
      // If no stages exist, initialize them
      if (!stagesData || stagesData.length === 0) {
        await apiClient.initializeProductionStages(projectId);
        const newStagesData = await apiClient.getProductionStages(projectId);
        setStages(newStagesData);
      } else {
        setStages(stagesData);
      }

      // Load overview
      const overviewData = await apiClient.getProductionOverview(projectId);
      setOverview(overviewData);

      // Expand in-progress stages by default
      const inProgressStageIds = stagesData
        .filter((s: ProductionStage) => s.status === 'in_progress')
        .map((s: ProductionStage) => s.id);
      setExpandedStages(new Set(inProgressStageIds));

    } catch (err: any) {
      console.error('Error loading production data:', err);
      setError(err.message || 'Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const toggleStage = (stageId: number) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const toggleSubStage = (subStageId: number) => {
    const newExpanded = new Set(expandedSubStages);
    if (newExpanded.has(subStageId)) {
      newExpanded.delete(subStageId);
    } else {
      newExpanded.add(subStageId);
    }
    setExpandedSubStages(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'on_hold':
        return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: 'default',
      in_progress: 'secondary',
      not_started: 'outline',
      on_hold: 'outline',
      blocked: 'destructive',
      todo: 'outline',
      review: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-green-500/10 text-green-500 border-green-500/20'
    };

    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority}
      </Badge>
    );
  };

  const updateStageStatus = async (stageId: number, status: string) => {
    try {
      await apiClient.updateProductionStage(stageId, { status });
      loadProductionData();
    } catch (err: any) {
      console.error('Error updating stage:', err);
    }
  };

  const updateSubStageStatus = async (subStageId: number, status: string) => {
    try {
      await apiClient.updateProductionSubStage(subStageId, { status });
      loadProductionData();
    } catch (err: any) {
      console.error('Error updating sub-stage:', err);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await apiClient.updateProductionTask(taskId, { status });
      loadProductionData();
    } catch (err: any) {
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading production stages...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Production Stages</h3>
                <p className="text-text-secondary mb-4">{error}</p>
                <Button onClick={loadProductionData}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Production Timeline</h1>
            <p className="text-text-secondary">
              {overview?.project_name} - Manage all stages of your film production
            </p>
          </div>
          <Button onClick={() => router.push(`/projects/${projectId}`)}>
            Back to Project
          </Button>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Progress */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold text-white">
                    {overview.overall_progress}%
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Overall Progress</p>
                <div className="mt-3 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${overview.overall_progress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stages Summary */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="w-8 h-8 text-purple-500" />
                  <span className="text-2xl font-bold text-white">
                    {overview.stages.completed}/{overview.stages.total}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Stages Completed</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-green-500">{overview.stages.completed} done</span>
                  <span className="text-blue-500">{overview.stages.in_progress} active</span>
                  <span className="text-gray-500">{overview.stages.not_started} pending</span>
                </div>
              </CardContent>
            </Card>

            {/* Tasks Summary */}
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold text-white">
                    {overview.tasks.completion_rate}%
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Tasks Completed</p>
                <div className="mt-3 text-xs text-text-secondary">
                  {overview.tasks.completed} of {overview.tasks.total} tasks done
                </div>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-amber-500" />
                  <span className="text-2xl font-bold text-white">
                    {overview.budget.utilization_rate}%
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Budget Utilized</p>
                <div className="mt-3 text-xs text-text-secondary">
                  ${overview.budget.spent.toLocaleString()} / ${overview.budget.allocated.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Production Stages */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <Card
              key={stage.id}
              className="border-gray-700 hover:border-gray-600 transition-all"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleStage(stage.id)}
                      className="hover:bg-gray-700 rounded p-1"
                    >
                      {expandedStages.has(stage.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-primary/20 text-accent-primary font-bold">
                        {index + 1}
                      </div>
                      {getStatusIcon(stage.status)}
                      <div>
                        <h3 className="text-xl font-bold text-white">{stage.name}</h3>
                        <p className="text-sm text-text-secondary">{stage.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(stage.status)}
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{stage.progress}%</div>
                      <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-accent-primary h-2 rounded-full transition-all"
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                    </div>

                    {stage.budget_allocated > 0 && (
                      <div className="text-right">
                        <div className="text-xs text-text-secondary">Budget</div>
                        <div className="text-sm font-semibold text-white">
                          ${stage.budget_spent.toLocaleString()} / ${stage.budget_allocated.toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <select
                        value={stage.status}
                        onChange={(e) => updateStageStatus(stage.id, e.target.value)}
                        className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedStages.has(stage.id) && (
                <CardContent>
                  <div className="space-y-3">
                    {/* Sub-stages */}
                    {stage.sub_stages.map((subStage) => (
                      <div
                        key={subStage.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleSubStage(subStage.id)}
                              className="hover:bg-gray-700 rounded p-1"
                            >
                              {expandedSubStages.has(subStage.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            
                            {getStatusIcon(subStage.status)}
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{subStage.name}</h4>
                              {subStage.description && (
                                <p className="text-sm text-text-secondary">{subStage.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getPriorityBadge(subStage.priority)}
                            {getStatusBadge(subStage.status)}
                            
                            <div className="text-right">
                              <div className="text-xs text-text-secondary">Progress</div>
                              <div className="text-sm font-semibold text-white">{subStage.progress}%</div>
                            </div>

                            <select
                              value={subStage.status}
                              onChange={(e) => updateSubStageStatus(subStage.id, e.target.value)}
                              className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm"
                            >
                              <option value="not_started">Not Started</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>
                        </div>

                        {/* Deliverables */}
                        {subStage.deliverables && subStage.deliverables.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-text-secondary mb-2">Deliverables:</p>
                            <div className="flex flex-wrap gap-2">
                              {subStage.deliverables.map((deliverable, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-700 text-xs rounded"
                                >
                                  {deliverable}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sub-stage Tasks */}
                        {expandedSubStages.has(subStage.id) && subStage.tasks && subStage.tasks.length > 0 && (
                          <div className="space-y-2 mt-3 pl-8">
                            {subStage.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {getStatusIcon(task.status)}
                                  <div>
                                    <p className="text-sm font-medium text-white">{task.title}</p>
                                    {task.description && (
                                      <p className="text-xs text-text-secondary">{task.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {task.assigned_to && (
                                    <span className="text-xs text-text-secondary flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {task.assigned_to}
                                    </span>
                                  )}
                                  {getPriorityBadge(task.priority)}
                                  {getStatusBadge(task.status)}
                                  
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                    className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-xs"
                                  >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="completed">Completed</option>
                                    <option value="blocked">Blocked</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Stage-level Tasks (not assigned to sub-stages) */}
                    {stage.tasks && stage.tasks.length > 0 && (
                      <div className="space-y-2 mt-3">
                        <h5 className="text-sm font-semibold text-text-secondary">Additional Tasks</h5>
                        {stage.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-700"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getStatusIcon(task.status)}
                              <div>
                                <p className="text-sm font-medium text-white">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-text-secondary">{task.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {task.assigned_to && (
                                <span className="text-xs text-text-secondary flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {task.assigned_to}
                                </span>
                              )}
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                              
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-xs"
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="completed">Completed</option>
                                <option value="blocked">Blocked</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
