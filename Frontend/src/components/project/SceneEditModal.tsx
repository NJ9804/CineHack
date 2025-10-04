"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface Scene {
  id: string;
  seq: number;
  slugline: string;
  interior: boolean;
  location: string;
  time_of_day: string;
  actors: string[];
  props: string[];
  crowd_estimate: number;
  duration_minutes: number;
  vfx: boolean;
  ai_confidence: number;
  status?: string;
  notes?: string;
}

interface SceneEditModalProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SceneEditModal({ scene, isOpen, onClose, onSave }: SceneEditModalProps) {
  const [formData, setFormData] = useState<Scene>(scene);
  const [saving, setSaving] = useState(false);
  const [newActor, setNewActor] = useState('');
  const [newProp, setNewProp] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save scene');
    } finally {
      setSaving(false);
    }
  };

  const addActor = () => {
    if (newActor.trim() && !formData.actors.includes(newActor.trim())) {
      setFormData({ ...formData, actors: [...formData.actors, newActor.trim()] });
      setNewActor('');
    }
  };

  const removeActor = (actor: string) => {
    setFormData({ ...formData, actors: formData.actors.filter(a => a !== actor) });
  };

  const addProp = () => {
    if (newProp.trim() && !formData.props.includes(newProp.trim())) {
      setFormData({ ...formData, props: [...formData.props, newProp.trim()] });
      setNewProp('');
    }
  };

  const removeProp = (prop: string) => {
    setFormData({ ...formData, props: formData.props.filter(p => p !== prop) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Edit Scene {scene.seq}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Review and modify AI-extracted scene details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Scene Number</Label>
              <Input
                type="number"
                value={formData.seq}
                onChange={(e) => setFormData({ ...formData, seq: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Interior/Exterior</Label>
              <Select
                value={formData.interior ? 'interior' : 'exterior'}
                onValueChange={(value) => setFormData({ ...formData, interior: value === 'interior' })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="interior">Interior (INT.)</SelectItem>
                  <SelectItem value="exterior">Exterior (EXT.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label className="text-gray-300">Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Kuttanad Backwater, Police Station"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Slugline */}
          <div>
            <Label className="text-gray-300">Slugline</Label>
            <Input
              value={formData.slugline}
              onChange={(e) => setFormData({ ...formData, slugline: e.target.value })}
              placeholder="Full scene heading"
              className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
            />
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300">Time of Day</Label>
              <Select
                value={formData.time_of_day}
                onValueChange={(value) => setFormData({ ...formData, time_of_day: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="dawn">Dawn</SelectItem>
                  <SelectItem value="dusk">Dusk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Duration (min)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Crowd Size</Label>
              <Input
                type="number"
                value={formData.crowd_estimate}
                onChange={(e) => setFormData({ ...formData, crowd_estimate: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Actors */}
          <div>
            <Label className="text-gray-300 mb-2 block">Cast / Actors</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newActor}
                onChange={(e) => setNewActor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addActor()}
                placeholder="Add character name..."
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={addActor} type="button" size="sm" className="bg-blue-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.actors.map((actor, idx) => (
                <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {actor}
                  <button
                    onClick={() => removeActor(actor)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Props */}
          <div>
            <Label className="text-gray-300 mb-2 block">Props</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newProp}
                onChange={(e) => setNewProp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addProp()}
                placeholder="Add prop name..."
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={addProp} type="button" size="sm" className="bg-blue-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.props.map((prop, idx) => (
                <Badge key={idx} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {prop}
                  <button
                    onClick={() => removeProp(prop)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* VFX */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="vfx"
              checked={formData.vfx}
              onChange={(e) => setFormData({ ...formData, vfx: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800"
            />
            <Label htmlFor="vfx" className="text-gray-300 cursor-pointer">
              VFX Required
            </Label>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-gray-300">Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this scene..."
              className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
            />
          </div>

          {/* AI Confidence */}
          <div className="bg-gray-800/50 rounded p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">AI Extraction Confidence</span>
              <span className={`font-medium ${scene.ai_confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'}`}>
                {Math.round(scene.ai_confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
