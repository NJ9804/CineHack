"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Scene, ScheduleItem } from '@/lib/types';

interface ScheduleSceneModalProps {
  open: boolean;
  onClose: () => void;
  scene: Scene;
  existingSchedule?: ScheduleItem;
  onSave: (scheduleData: Partial<ScheduleItem>) => void;
}

export default function ScheduleSceneModal({
  open,
  onClose,
  scene,
  existingSchedule,
  onSave
}: ScheduleSceneModalProps) {
  const [scheduledDate, setScheduledDate] = useState(
    existingSchedule?.scheduled_date || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(existingSchedule?.start_time || '09:00');
  const [endTime, setEndTime] = useState(existingSchedule?.end_time || '17:00');
  const [status, setStatus] = useState(existingSchedule?.status || 'planned');
  const [notes, setNotes] = useState(existingSchedule?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    
    const scheduleData: Partial<ScheduleItem> = {
      sceneId: scene.id,
      scene_number: `Scene ${scene.number}`,
      scene_heading: scene.name,
      location_name: scene.location,
      scheduled_date: scheduledDate,
      start_time: startTime,
      end_time: endTime,
      status,
      notes,
      conflicts: [],
      actors_involved: (scene.characters || []).map(charId => ({ id: charId, name: `Character ${charId}` })),
      estimated_duration: scene.estimatedBudget ? `${Math.ceil(scene.estimatedBudget / 100000)} hours` : '4 hours'
    };

    await onSave(scheduleData);
    setIsSubmitting(false);
    onClose();
  };

  const getConflictWarnings = () => {
    const warnings = [];
    
    // Check if it's weekend
    const date = new Date(scheduledDate);
    if (date.getDay() === 0 || date.getDay() === 6) {
      warnings.push('Weekend shooting may incur overtime costs');
    }

    // Check if outdoor scene
    if (scene.location.toLowerCase().includes('outdoor') || scene.location.toLowerCase().includes('highway')) {
      warnings.push('Weather dependent - consider backup plans');
    }

    // Check time conflicts
    if (startTime >= endTime) {
      warnings.push('End time must be after start time');
    }

    return warnings;
  };

  const conflicts = getConflictWarnings();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Calendar className="w-5 h-5 mr-2 text-amber-400" />
            Schedule Scene {scene.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scene Info */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">{scene.name}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {scene.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Est. Budget: ₹{(scene.estimatedBudget / 100000).toFixed(1)}L
              </div>
            </div>
          </div>

          {/* Scheduling Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Scheduled Date</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes for this shoot..."
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
            />
          </div>

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center text-yellow-400 mb-2">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="font-medium">Scheduling Warnings</span>
              </div>
              <ul className="text-sm text-yellow-300 space-y-1">
                {conflicts.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Characters Involved */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h5 className="font-medium text-white mb-2">Characters Involved</h5>
            <div className="flex flex-wrap gap-2">
              {(scene.characters || []).map((charId) => (
                <span
                  key={charId}
                  className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm"
                >
                  Character {charId}
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="cinematic" 
            onClick={handleSave} 
            disabled={isSubmitting || conflicts.some(c => c.includes('must be after'))}
          >
            {isSubmitting ? 'Saving...' : existingSchedule ? 'Update Schedule' : 'Schedule Scene'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}