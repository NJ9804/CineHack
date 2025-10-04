"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle, MapPin, Target, Play, CheckCircle, Plus, BarChart3, GitCommit } from 'lucide-react';
import { Scene, ScheduleItem, Alert, SchedulingConflict, ScheduleStats, CalendarEvent } from '@/lib/types';
import ScheduleSceneModal from './ScheduleSceneModal';
import ScheduleTimeline from './ScheduleTimeline';
import { apiClient } from '@/services/api';

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
  const groupedScenes = {
    unplanned: scenes.filter(s => !s.status || s.status === 'planned'),
    planned: scenes.filter(s => s.status === 'planned'),
    'in-progress': scenes.filter(s => s.status === 'in-progress'),
    completed: scenes.filter(s => s.status === 'completed')
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
        // Update scene status through API
        await apiClient.updateScheduleItem(projectId, draggedScene.id, { status: newStatus as any });
        // Update local state
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
        await apiClient.createScheduleItem(projectId, selectedScene.id, scheduleData);
        // Refresh data
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
      // Refresh data
      const stats = await apiClient.getScheduleStats(projectId);
      setScheduleStats(stats);
    } catch (error) {
      console.error('Failed to auto-schedule:', error);
    } finally {
      setIsAutoScheduling(false);
    }
  };

  const SceneCard = ({ scene }: { scene: Scene }) => {
    const sceneAlerts = alerts.filter(alert => alert.sceneId === scene.id);
    const sceneConflicts = conflicts.filter(conflict => 
      conflict.affected_scenes.includes(scene.id)
    );
    
    return (
      <Card 
        className="bg-gray-800/50 border-gray-600 mb-3 cursor-move hover:border-amber-500/50 transition-colors group"
        draggable
        onDragStart={() => handleDragStart(scene)}
        onClick={() => handleScheduleScene(scene)}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-white text-sm">
              Scene {scene.number}: {scene.name}
            </h4>
            <div className="flex items-center space-x-1">
              {sceneConflicts.length > 0 && (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              {getStatusIcon(scene.status)}
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScheduleScene(scene);
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {scene.location}
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {scene.characters.length} characters
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Est. Budget: ₹{(scene.estimatedBudget / 100000).toFixed(1)}L
            </div>
          </div>

          {sceneConflicts.length > 0 && (
            <div className="mt-2 space-y-1">
              {sceneConflicts.map((conflict, idx) => (
                <div key={idx} className={`p-1 border rounded text-xs ${
                  conflict.severity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                  conflict.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}>
                  {conflict.message}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const KanbanColumn = ({ 
    title, 
    status, 
    scenes, 
    color, 
    icon 
  }: { 
    title: string;
    status: string;
    scenes: Scene[];
    color: string;
    icon: React.ReactNode;
  }) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <div className={`w-3 h-3 ${color} rounded-full mr-2`}></div>
          {icon}
          <span className="ml-2">{title} ({scenes.length})</span>
        </h3>
      </div>
      <div 
        className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 min-h-[400px]"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {scenes.map((scene) => (
          <SceneCard key={scene.id} scene={scene} />
        ))}
        {scenes.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <div className="w-8 h-8 mx-auto mb-2 opacity-50 flex items-center justify-center">
              {icon}
            </div>
            <p className="text-sm">No {title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      {scheduleStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{scheduleStats.total_scenes}</div>
              <div className="text-sm text-gray-400">Total Scenes</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{scheduleStats.planned}</div>
              <div className="text-sm text-gray-400">Planned</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{scheduleStats.in_progress}</div>
              <div className="text-sm text-gray-400">In Progress</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{scheduleStats.completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400 mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <h3 className="font-medium">Scheduling Conflicts Detected</h3>
            </div>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm text-red-300">
                  {conflict.message} (Scenes: {conflict.affected_scenes.join(', ')})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'kanban' ? 'cinematic' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'cinematic' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            <GitCommit className="w-4 h-4 mr-2" />
            Timeline
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'cinematic' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="cinematic" 
            size="sm"
            onClick={handleAutoSchedule}
            disabled={isAutoScheduling}
          >
            {isAutoScheduling ? 'Scheduling...' : 'Auto-Schedule'}
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KanbanColumn
            title="Unplanned"
            status="unplanned"
            scenes={groupedScenes.unplanned}
            color="bg-gray-400"
            icon={<Clock className="w-4 h-4" />}
          />
          <KanbanColumn
            title="Planned"
            status="planned"
            scenes={groupedScenes.planned}
            color="bg-yellow-400"
            icon={<Target className="w-4 h-4" />}
          />
          <KanbanColumn
            title="In Progress"
            status="in-progress"
            scenes={groupedScenes['in-progress']}
            color="bg-blue-400"
            icon={<Play className="w-4 h-4" />}
          />
          <KanbanColumn
            title="Completed"
            status="completed"
            scenes={groupedScenes.completed}
            color="bg-green-400"
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </div>
      )}

      {viewMode === 'timeline' && (
        <ScheduleTimeline
          scenes={scenes}
          schedule={schedule}
          conflicts={conflicts}
          onEditSchedule={handleScheduleScene}
        />
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
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-amber-400" />
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

      {/* Schedule Scene Modal */}
      {selectedScene && (
        <ScheduleSceneModal
          open={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedScene(null);
          }}
          scene={selectedScene}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
      {/* Schedule Scene Modal */}
      {selectedScene && (
        <ScheduleSceneModal
          open={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setSelectedScene(null);
          }}
          scene={selectedScene}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
}