"use client"

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Edit3, AlertTriangle } from 'lucide-react';
import { Scene, ScheduleItem, SchedulingConflict } from '@/lib/types';

interface ScheduleTimelineProps {
  scenes: Scene[];
  schedule: ScheduleItem[];
  conflicts: SchedulingConflict[];
  onEditSchedule: (scene: Scene) => void;
}

export default function ScheduleTimeline({ 
  scenes, 
  schedule, 
  conflicts, 
  onEditSchedule 
}: ScheduleTimelineProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);

  // Generate timeline data (mock for now)
  const generateTimelineData = () => {
    const weeks = [];
    const startDate = new Date();
    
    for (let week = 0; week < 8; week++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (week * 7));
      
      const days = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + day);
        
        // Get scenes scheduled for this date
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduledScenes = schedule.filter(s => s.scheduled_date === dateStr);
        const dayConflicts = conflicts.filter(c => c.date === dateStr);
        
        days.push({
          date: new Date(currentDate),
          dateStr,
          scenes: scheduledScenes,
          conflicts: dayConflicts,
          isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
        });
      }
      
      weeks.push({ weekStart, days });
    }
    
    return weeks;
  };

  const timelineData = generateTimelineData();
  const currentWeek = timelineData[selectedWeek];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'planned': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
            disabled={selectedWeek === 0}
          >
            ← Previous Week
          </Button>
          <h3 className="text-lg font-medium text-white">
            Week of {formatDate(currentWeek.weekStart)}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(Math.min(timelineData.length - 1, selectedWeek + 1))}
            disabled={selectedWeek === timelineData.length - 1}
          >
            Next Week →
          </Button>
        </div>
        
        <div className="text-sm text-gray-400">
          Week {selectedWeek + 1} of {timelineData.length}
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="grid grid-cols-7 gap-4">
        {currentWeek.days.map((day, dayIndex) => (
          <div key={dayIndex} className="space-y-2">
            {/* Day Header */}
            <div className={`text-center p-2 rounded-lg ${
              day.isWeekend 
                ? 'bg-gray-700/50 text-gray-400' 
                : 'bg-gray-800/50 text-white'
            }`}>
              <div className="font-medium">{formatDate(day.date)}</div>
              {day.conflicts.length > 0 && (
                <div className="flex justify-center mt-1">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
              )}
            </div>

            {/* Day Content */}
            <div className="space-y-2 min-h-[300px]">
              {day.scenes.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500 text-sm">
                    {day.isWeekend ? 'Weekend' : 'No scenes'}
                  </div>
                </div>
              ) : (
                day.scenes.map((scheduleItem) => {
                  const scene = scenes.find(s => s.id === scheduleItem.sceneId);
                  if (!scene) return null;

                  const sceneConflicts = day.conflicts.filter(c => 
                    c.affected_scenes.includes(scene.id)
                  );

                  return (
                    <Card 
                      key={scheduleItem.id}
                      className="bg-gray-800/50 border-gray-600 hover:border-amber-500/50 transition-colors cursor-pointer"
                      onClick={() => onEditSchedule(scene)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          {/* Scene Header */}
                          <div className="flex items-start justify-between">
                            <h4 className="text-sm font-medium text-white">
                              Scene {scene.number}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {sceneConflicts.length > 0 && (
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              )}
                              <Edit3 className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>

                          {/* Scene Title */}
                          <p className="text-xs text-gray-300 line-clamp-2">
                            {scene.name}
                          </p>

                          {/* Status Badge */}
                          <Badge 
                            className={`text-xs ${getStatusColor(scheduleItem.status)}`}
                            variant="secondary"
                          >
                            {scheduleItem.status}
                          </Badge>

                          {/* Time and Location */}
                          <div className="space-y-1 text-xs text-gray-400">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {scheduleItem.start_time} - {scheduleItem.end_time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate">{scene.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {scene.characters.length} characters
                            </div>
                          </div>

                          {/* Conflicts */}
                          {sceneConflicts.length > 0 && (
                            <div className="mt-2 p-1 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-300">
                              {sceneConflicts[0].message}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Week Summary */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-4">
          <h4 className="text-white font-medium mb-3">Week Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Total Scenes</div>
              <div className="text-white font-medium">
                {currentWeek.days.reduce((sum, day) => sum + day.scenes.length, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Shooting Days</div>
              <div className="text-white font-medium">
                {currentWeek.days.filter(day => day.scenes.length > 0 && !day.isWeekend).length}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Conflicts</div>
              <div className="text-white font-medium">
                {currentWeek.days.reduce((sum, day) => sum + day.conflicts.length, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Weekend Shoots</div>
              <div className="text-white font-medium">
                {currentWeek.days.filter(day => day.scenes.length > 0 && day.isWeekend).length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}