"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BarChart3, AlertTriangle, LayoutGrid, Calendar } from 'lucide-react';
import { Scene, Alert } from '@/lib/types';
import KanbanBoard from './KanbanBoard';
import DayWiseSchedule from './DayWiseSchedule';
import apiClient from '@/services/api/client';
import type { ScheduleStats, SchedulingConflict } from '@/lib/types';

interface ScheduleTabProps {
  projectId: string;
  scenes: Scene[];
  schedule: any[];
  alerts: Alert[];
}

export default function ScheduleTab({ projectId, scenes, schedule, alerts }: ScheduleTabProps) {
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats | null>(null);
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);
  const [localScenes, setLocalScenes] = useState<Scene[]>(scenes);
  const [activeTab, setActiveTab] = useState<'kanban' | 'day-wise'>('kanban');

  // Update local scenes when props change
  useEffect(() => {
    setLocalScenes(scenes);
  }, [scenes]);

  // Fetch schedule data
  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const [stats, conflictsData] = await Promise.all([
          apiClient.getScheduleStats(projectId),
          apiClient.getScheduleConflicts(projectId)
        ]);
        setScheduleStats(stats);
        setConflicts(conflictsData);
      } catch (error) {
        console.error('Failed to fetch schedule data:', error);
      }
    };

    if (projectId) {
      fetchScheduleData();
    }
  }, [projectId]);

  // Handle scene status change from Kanban board
  const handleSceneStatusChange = async (sceneId: string, newStatus: string) => {
    try {
      // Update the scene status via API
      await apiClient.updateScene(parseInt(sceneId), { status: newStatus });
      
      // Update local state optimistically
      setLocalScenes(prev => 
        prev.map(scene => 
          scene.id === sceneId ? { ...scene, status: newStatus as any } : scene
        )
      );

      // Refresh stats
      const stats = await apiClient.getScheduleStats(projectId);
      setScheduleStats(stats);
    } catch (error) {
      console.error('Failed to update scene status:', error);
      // Revert on error
      setLocalScenes(scenes);
    }
  };

  const handleAutoSchedule = async () => {
    setIsAutoScheduling(true);
    try {
      const result = await apiClient.autoSchedule(projectId);
      console.log('Auto-schedule result:', result);
      
      // Refresh stats and scenes
      const stats = await apiClient.getScheduleStats(projectId);
      setScheduleStats(stats);
      
      // Trigger parent to refresh scenes
      window.location.reload(); // Temporary - ideally use state management
    } catch (error) {
      console.error('Failed to auto-schedule:', error);
    } finally {
      setIsAutoScheduling(false);
    }
  };

  // Calculate stats from scenes
  const stats = {
    total: localScenes.length,
    unplanned: localScenes.filter(s => !s.status || s.status === 'unplanned').length,
    planned: localScenes.filter(s => s.status === 'planned').length,
    inProgress: localScenes.filter(s => s.status === 'in-progress' || s.status === 'shooting').length,
    completed: localScenes.filter(s => s.status === 'completed').length,
  };

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Shooting Schedule</h2>
          <p className="text-gray-400 text-sm mt-1">
            Organize and plan your production schedule
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAutoSchedule}
            disabled={isAutoScheduling}
            className="border-amber-500/30 hover:bg-amber-500/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAutoScheduling ? 'Scheduling...' : 'Auto Schedule'}
          </Button>
          <Button variant="outline" className="border-gray-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">Total Scenes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-400">{stats.unplanned}</div>
            <div className="text-xs text-gray-400 mt-1">Unplanned</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-900/20 border-yellow-700/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.planned}</div>
            <div className="text-xs text-yellow-300 mt-1">Planned</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-900/20 border-blue-700/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-xs text-blue-300 mt-1">In Progress</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-900/20 border-green-700/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-green-300 mt-1">
              Completed ({completionPercentage}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="bg-red-900/20 border-red-700/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-red-300 font-medium mb-2">
                  {conflicts.length} Scheduling Conflict{conflicts.length !== 1 ? 's' : ''} Detected
                </h4>
                <div className="space-y-1">
                  {conflicts.slice(0, 3).map((conflict, idx) => (
                    <p key={idx} className="text-sm text-red-200">
                      • {conflict.message}
                    </p>
                  ))}
                  {conflicts.length > 3 && (
                    <p className="text-sm text-red-300 mt-2">
                      +{conflicts.length - 3} more conflicts
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Different Views */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-900/50 border border-gray-700">
          <TabsTrigger value="kanban" className="data-[state=active]:bg-amber-500/20">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="day-wise" className="data-[state=active]:bg-amber-500/20">
            <Calendar className="w-4 h-4 mr-2" />
            Day-Wise Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          {/* Kanban Board */}
          <KanbanBoard
            scenes={localScenes}
            onSceneStatusChange={handleSceneStatusChange}
            onSceneClick={(scene) => {
              console.log('Scene clicked:', scene);
              // TODO: Open scene details modal
            }}
          />
        </TabsContent>

        <TabsContent value="day-wise" className="mt-6">
          {/* Day-Wise Schedule */}
          <DayWiseSchedule 
            scenes={localScenes}
            onEditSchedule={(scene, day) => {
              console.log('Edit schedule for scene:', scene, 'on day:', day);
              // TODO: Open schedule edit modal
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
