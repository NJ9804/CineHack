"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle, MapPin, CheckCircle, Play, Target, Sparkles, BarChart3 } from 'lucide-react';
import { Scene, ScheduleItem, Alert } from '@/lib/types';
import KanbanBoard from './KanbanBoard';
import ScheduleSceneModal from './ScheduleSceneModal';
import apiClient from '@/services/api/client';
import type { ScheduleStats, SchedulingConflict } from '@/lib/types';

interface ScheduleTabProps {
  projectId: string;
  scenes: Scene[];
  schedule: ScheduleItem[];
  alerts: Alert[];
}

type ViewMode = 'kanban' | 'timeline' | 'calendar';

export default function ScheduleTab({ projectId, scenes, schedule, alerts }: ScheduleTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats | null>(null);
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([]);
  const [draggedScene, setDraggedScene] = useState<Scene | null>(null);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState(false);

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

    fetchScheduleData();
  }, [projectId]);

  // Group scenes by status for Kanban view
  // Note: Backend uses 'shooting' status, frontend uses 'in-progress'
  // Add null checks to prevent runtime errors
  const safeScenes = scenes || [];
  
  // Debug: Log the scenes to see what we're getting
  console.log('ScheduleTab - Received scenes:', safeScenes);
  console.log('ScheduleTab - Scene statuses:', safeScenes.map(s => ({ id: s.id, name: s.name, status: s.status })));
  
  const groupedScenes = {
    unplanned: safeScenes.filter(s => !s.status || s.status === 'unplanned'),
    planned: safeScenes.filter(s => s.status === 'planned'),
    'in-progress': safeScenes.filter(s => s.status === 'in-progress' || s.status === 'shooting'),
    completed: safeScenes.filter(s => s.status === 'completed')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'unplanned': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Play className="w-4 h-4" />;
      case 'planned': return <Target className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleDragStart = (scene: Scene) => {
    setDraggedScene(scene);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedScene) {
      try {
        await apiClient.updateScheduleItem(projectId, draggedScene.id, { status: newStatus as any });
        draggedScene.status = newStatus as any;
        setDraggedScene(null);
      } catch (error) {
        console.error('Failed to update scene status:', error);
      }
    }
  };

  const handleScheduleScene = (scene: Scene) => {
    setSelectedScene(scene);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (scheduleData: Partial<ScheduleItem>) => {
    try {
      if (selectedScene) {
        await apiClient.createScheduleItem(projectId, selectedScene.id, {
          scene_id: parseInt(selectedScene.id),
          ...scheduleData
        });
        const stats = await apiClient.getScheduleStats(projectId);
        setScheduleStats(stats);
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleAutoSchedule = async () => {
    setIsAutoScheduling(true);
    try {
      const result = await apiClient.autoSchedule(projectId);
      console.log('Auto-schedule result:', result);
      const stats = await apiClient.getScheduleStats(projectId);
      setScheduleStats(stats);
    } catch (error) {
      console.error('Failed to auto-schedule:', error);
    } finally {
      setIsAutoScheduling(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-text-primary">{scenes.length}</div>
            <div className="text-sm text-text-secondary">Total Scenes</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent-secondary">
              {groupedScenes.planned.length}
            </div>
            <div className="text-sm text-text-secondary">Planned</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent-primary">
              {groupedScenes['in-progress'].length}
            </div>
            <div className="text-sm text-text-secondary">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-secondary-bg border-accent-brown">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent-primary">
              {groupedScenes.completed.length}
            </div>
            <div className="text-sm text-text-secondary">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Scenes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Planned Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent-secondary flex items-center">
              <div className="w-3 h-3 bg-accent-brown rounded-full mr-2"></div>
              Planned ({groupedScenes.planned.length})
            </h3>
          </div>
          <div className="bg-primary-bg/50 border border-accent-brown rounded-lg p-4 min-h-[500px] space-y-4">
            {groupedScenes.planned.map((scene) => (
              <CompactSceneCard key={scene.id} scene={scene} alerts={alerts} />
            ))}
            {groupedScenes.planned.length === 0 && (
              <div className="text-center text-text-secondary py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No planned scenes</p>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent-secondary flex items-center">
              <div className="w-3 h-3 bg-accent-secondary rounded-full mr-2"></div>
              In Progress ({groupedScenes['in-progress'].length})
            </h3>
          </div>
          <div className="bg-primary-bg/50 border border-accent-brown rounded-lg p-4 min-h-[500px] space-y-4">
            {groupedScenes['in-progress'].map((scene) => (
              <CompactSceneCard key={scene.id} scene={scene} alerts={alerts} />
            ))}
            {groupedScenes['in-progress'].length === 0 && (
              <div className="text-center text-text-secondary py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scenes in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-accent-secondary flex items-center">
              <div className="w-3 h-3 bg-accent-primary rounded-full mr-2"></div>
              Completed ({groupedScenes.completed.length})
            </h3>
          </div>
          <div className="bg-primary-bg/50 border border-accent-brown rounded-lg p-4 min-h-[500px] space-y-4">
            {groupedScenes.completed.map((scene) => (
              <CompactSceneCard key={scene.id} scene={scene} alerts={alerts} />
            ))}
            {groupedScenes.completed.length === 0 && (
              <div className="text-center text-text-secondary py-8">
                <div className="w-8 h-8 mx-auto mb-2 opacity-50 flex items-center justify-center text-accent-primary text-xl">
                  ✓
                </div>
                <p className="text-sm">No completed scenes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Unplanned Column */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-white">Unplanned</h3>
              <Badge variant="secondary" className="ml-auto">{groupedScenes.unplanned.length}</Badge>
            </div>
            <div className="space-y-2">
              {groupedScenes.unplanned.map(scene => (
                <div key={scene.id} className="bg-gray-800/50 p-3 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                  <div className="text-sm font-medium text-white">{scene.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{scene.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Column */}
          <div className="bg-gray-900/50 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-white">Planned</h3>
              <Badge variant="secondary" className="ml-auto">{groupedScenes.planned.length}</Badge>
            </div>
            <div className="space-y-2">
              {groupedScenes.planned.map(scene => (
                <div key={scene.id} className="bg-yellow-900/20 p-3 rounded border border-yellow-700 hover:border-yellow-600 cursor-pointer">
                  <div className="text-sm font-medium text-white">{scene.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{scene.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-900/50 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white">In Progress</h3>
              <Badge variant="secondary" className="ml-auto">{groupedScenes['in-progress'].length}</Badge>
            </div>
            <div className="space-y-2">
              {groupedScenes['in-progress'].map(scene => (
                <div key={scene.id} className="bg-blue-900/20 p-3 rounded border border-blue-700 hover:border-blue-600 cursor-pointer">
                  <div className="text-sm font-medium text-white">{scene.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{scene.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-gray-900/50 border border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <h3 className="font-semibold text-white">Completed</h3>
              <Badge variant="secondary" className="ml-auto">{groupedScenes.completed.length}</Badge>
            </div>
            <div className="space-y-2">
              {groupedScenes.completed.map(scene => (
                <div key={scene.id} className="bg-green-900/20 p-3 rounded border border-green-700 hover:border-green-600 cursor-pointer">
                  <div className="text-sm font-medium text-white">{scene.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{scene.location}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'timeline' && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">Timeline View</h3>
            <p className="text-gray-400 mb-4">
              Timeline view is under development. This will show a visual timeline of your shoot schedule.
            </p>
            <Button variant="outline">
              Configure Timeline
            </Button>
          </CardContent>
        </Card>
      )}

      {viewMode === 'calendar' && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-white mb-2">Calendar View</h3>
            <p className="text-gray-400 mb-4">
              Calendar integration coming soon. This will show scenes scheduled on specific dates.
            </p>
            <Button variant="outline">
              Set up Calendar Integration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule Actions */}
      <Card className="bg-secondary-bg border-accent-brown">
        <CardHeader>
          <CardTitle className="text-accent-secondary flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-accent-primary" />
            Schedule Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="cinematic"
              onClick={handleAutoSchedule}
              disabled={isAutoScheduling}
            >
              {isAutoScheduling ? 'Auto-Scheduling...' : 'Auto-Schedule Scenes'}
            </Button>
            <Button variant="outline">
              Resolve Conflicts
            </Button>
            <Button variant="outline">
              Actor Availability
            </Button>
            <Button variant="outline">
              Export Schedule
            </Button>
            <Button variant="outline">
              Import Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Scene Modal - Simplified for now */}
      {selectedScene && isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-white">Schedule Scene: {selectedScene.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">
                Scene scheduling modal is under development. Use the kanban board to drag and drop scenes between statuses.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    setSelectedScene(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}