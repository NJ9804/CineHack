"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, DollarSign, Edit3, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Scene } from '@/lib/types';

interface DayWiseScheduleProps {
  scenes: Scene[];
  onEditSchedule?: (scene: Scene, day: number) => void;
}

interface ScheduledDay {
  date: Date;
  dayNumber: number;
  scenes: Scene[];
  totalBudget: number;
  locations: string[];
  characters: Set<string>;
  estimatedHours: number;
}

export default function DayWiseSchedule({ scenes, onEditSchedule }: DayWiseScheduleProps) {
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // Group scenes by planned shooting days
  const generateSchedule = (): ScheduledDay[] => {
    // Get only planned and in-progress scenes
    const scheduledScenes = scenes.filter(s => 
      s.status === 'planned' || s.status === 'in-progress' || s.status === 'shooting'
    );

    // Group by location to optimize shooting schedule
    const scenesByLocation = scheduledScenes.reduce((acc, scene) => {
      const location = scene.location || 'Unknown';
      if (!acc[location]) acc[location] = [];
      acc[location].push(scene);
      return acc;
    }, {} as Record<string, Scene[]>);

    // Create day-wise schedule (max 5 scenes per day)
    const days: ScheduledDay[] = [];
    let dayNumber = 1;
    const startDate = new Date();
    
    // Schedule scenes location by location to minimize location changes
    Object.entries(scenesByLocation).forEach(([location, locationScenes]) => {
      let currentDayScenes: Scene[] = [];
      
      locationScenes.forEach((scene) => {
        currentDayScenes.push(scene);
        
        // If we have 5 scenes or it's a high-budget scene, start a new day
        const shouldBreak = currentDayScenes.length >= 5 || scene.estimatedBudget > 5000000;
        
        if (shouldBreak) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + (dayNumber - 1));
          
          // Skip weekends
          while (date.getDay() === 0 || date.getDay() === 6) {
            date.setDate(date.getDate() + 1);
            dayNumber++;
          }
          
          const characters = new Set<string>();
          currentDayScenes.forEach(s => {
            s.characters?.forEach(c => characters.add(c));
          });
          
          days.push({
            date,
            dayNumber,
            scenes: [...currentDayScenes],
            totalBudget: currentDayScenes.reduce((sum, s) => sum + s.estimatedBudget, 0),
            locations: [location],
            characters,
            estimatedHours: currentDayScenes.length * 2.5, // Rough estimate
          });
          
          currentDayScenes = [];
          dayNumber++;
        }
      });
      
      // Add remaining scenes as a day
      if (currentDayScenes.length > 0) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (dayNumber - 1));
        
        while (date.getDay() === 0 || date.getDay() === 6) {
          date.setDate(date.getDate() + 1);
          dayNumber++;
        }
        
        const characters = new Set<string>();
        currentDayScenes.forEach(s => {
          s.characters?.forEach(c => characters.add(c));
        });
        
        days.push({
          date,
          dayNumber,
          scenes: currentDayScenes,
          totalBudget: currentDayScenes.reduce((sum, s) => sum + s.estimatedBudget, 0),
          locations: [location],
          characters,
          estimatedHours: currentDayScenes.length * 2.5,
        });
        dayNumber++;
      }
    });
    
    return days;
  };

  const schedule = generateSchedule();
  const daysPerWeek = 5; // Work days
  const totalWeeks = Math.ceil(schedule.length / daysPerWeek);
  const weekDays = schedule.slice(currentWeek * daysPerWeek, (currentWeek + 1) * daysPerWeek);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayStatus = (day: ScheduledDay) => {
    const allCompleted = day.scenes.every(s => s.status === 'completed');
    const someInProgress = day.scenes.some(s => s.status === 'in-progress' || s.status === 'shooting');
    
    if (allCompleted) return { label: 'Completed', color: 'green' };
    if (someInProgress) return { label: 'In Progress', color: 'blue' };
    return { label: 'Planned', color: 'yellow' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Day-Wise Shooting Schedule</h3>
          <p className="text-gray-400 text-sm mt-1">
            {schedule.length} shooting days planned • {totalWeeks} weeks
          </p>
        </div>
        
        {/* Week Navigation */}
        {totalWeeks > 1 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              disabled={currentWeek === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-white text-sm">
              Week {currentWeek + 1} of {totalWeeks}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(Math.min(totalWeeks - 1, currentWeek + 1))}
              disabled={currentWeek === totalWeeks - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <Card className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-700/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">This Week</div>
              <div className="text-white font-medium">{weekDays.length} days</div>
            </div>
            <div>
              <div className="text-gray-400">Total Scenes</div>
              <div className="text-white font-medium">
                {weekDays.reduce((sum, day) => sum + day.scenes.length, 0)}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Locations</div>
              <div className="text-white font-medium">
                {new Set(weekDays.flatMap(day => day.locations)).size}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Est. Budget</div>
              <div className="text-white font-medium">
                ₹{(weekDays.reduce((sum, day) => sum + day.totalBudget, 0) / 10000000).toFixed(1)}Cr
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Cards */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const status = getDayStatus(day);
          
          return (
            <Card key={day.dayNumber} className="bg-gray-900/50 border-gray-700 hover:border-amber-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center bg-amber-500/10 rounded-lg px-3 py-2 min-w-[60px]">
                      <div className="text-2xl font-bold text-amber-400">Day</div>
                      <div className="text-xl font-bold text-white">{day.dayNumber}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-medium">{formatDate(day.date)}</span>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${status.color === 'green' ? 'bg-green-500/10 text-green-400 border-green-500/30' : ''}
                            ${status.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : ''}
                            ${status.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : ''}
                          `}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {day.estimatedHours.toFixed(1)}h
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {day.locations.join(', ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ₹{(day.totalBudget / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.log('Edit day', day.dayNumber)}
                    className="hover:bg-amber-500/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Scenes for this day */}
                <div className="space-y-2">
                  {day.scenes.map((scene, idx) => (
                    <Card 
                      key={scene.id}
                      className="bg-gray-800/50 border-gray-700 hover:border-amber-500/30 transition-colors cursor-pointer"
                      onClick={() => onEditSchedule?.(scene, day.dayNumber)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs shrink-0">
                                Scene {scene.number}
                              </Badge>
                              <span className="text-white text-sm font-medium truncate">
                                {scene.name}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {scene.location}
                              </div>
                              {scene.characters && scene.characters.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {scene.characters.length} chars
                                </div>
                              )}
                              {scene.estimatedBudget > 0 && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ₹{(scene.estimatedBudget / 100000).toFixed(1)}L
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-gray-500 text-xs shrink-0">
                            #{idx + 1}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Characters for this day */}
                {day.characters.size > 0 && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Characters needed:</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(day.characters).slice(0, 10).map((char) => (
                        <Badge 
                          key={char}
                          variant="outline" 
                          className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs"
                        >
                          {char}
                        </Badge>
                      ))}
                      {day.characters.size > 10 && (
                        <Badge 
                          variant="outline" 
                          className="bg-gray-700/50 text-gray-400 border-gray-600 text-xs"
                        >
                          +{day.characters.size - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {day.scenes.length > 5 && (
                  <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-300">
                      Heavy day: {day.scenes.length} scenes scheduled. Consider splitting.
                    </p>
                  </div>
                )}
                {day.totalBudget > 10000000 && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300">
                      High budget day: ₹{(day.totalBudget / 10000000).toFixed(1)}Cr. Requires careful planning.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {weekDays.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No Schedule for This Week</h3>
            <p className="text-gray-400 text-sm">
              Plan scenes or use Auto Schedule to generate a shooting schedule.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
