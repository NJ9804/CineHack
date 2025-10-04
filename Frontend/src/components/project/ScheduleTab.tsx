"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle, MapPin } from 'lucide-react';
import { Scene, ScheduleItem, Alert } from '@/lib/types';

interface ScheduleTabProps {
  projectId: string;
  scenes: Scene[];
  schedule: ScheduleItem[];
  alerts: Alert[];
}

export default function ScheduleTab({ projectId, scenes, schedule, alerts }: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group scenes by status for Kanban view
  const groupedScenes = {
    planned: scenes.filter(s => s.status === 'planned'),
    'in-progress': scenes.filter(s => s.status === 'in-progress'),
    completed: scenes.filter(s => s.status === 'completed')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const SceneCard = ({ scene }: { scene: Scene }) => {
    const sceneAlerts = alerts.filter(alert => alert.sceneId === scene.id);
    
    return (
      <Card className="bg-gray-800/50 border-gray-600 mb-3 cursor-move hover:border-amber-500/50 transition-colors">
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-white text-sm">
              Scene {scene.number}: {scene.name}
            </h4>
            {sceneAlerts.length > 0 && (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
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

          {sceneAlerts.length > 0 && (
            <div className="mt-2 p-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
              {sceneAlerts[0].message}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{scenes.length}</div>
            <div className="text-sm text-gray-400">Total Scenes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {groupedScenes.planned.length}
            </div>
            <div className="text-sm text-gray-400">Planned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {groupedScenes['in-progress'].length}
            </div>
            <div className="text-sm text-gray-400">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {groupedScenes.completed.length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Planned Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              Planned ({groupedScenes.planned.length})
            </h3>
          </div>
          <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 min-h-[400px]">
            {groupedScenes.planned.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
            {groupedScenes.planned.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No planned scenes</p>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
              In Progress ({groupedScenes['in-progress'].length})
            </h3>
          </div>
          <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 min-h-[400px]">
            {groupedScenes['in-progress'].map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
            {groupedScenes['in-progress'].length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scenes in progress</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              Completed ({groupedScenes.completed.length})
            </h3>
          </div>
          <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-4 min-h-[400px]">
            {groupedScenes.completed.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
            {groupedScenes.completed.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <div className="w-8 h-8 mx-auto mb-2 opacity-50 flex items-center justify-center">
                  ✓
                </div>
                <p className="text-sm">No completed scenes</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
            <Button variant="cinematic">
              Auto-Schedule Scenes
            </Button>
            <Button variant="outline">
              View Calendar
            </Button>
            <Button variant="outline">
              Actor Availability
            </Button>
            <Button variant="outline">
              Export Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}