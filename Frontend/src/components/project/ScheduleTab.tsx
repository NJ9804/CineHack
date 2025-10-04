"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, AlertTriangle, MapPin } from 'lucide-react';
import { Scene, ScheduleItem, Alert } from '@/lib/types';
import CompactSceneCard from './CompactSceneCard';

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