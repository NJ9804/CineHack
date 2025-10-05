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
      <DialogContent className="sm:max-w-[900px] bg-secondary-bg/95 backdrop-blur-sm border-accent-brown shadow-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b border-accent-brown">
          <DialogTitle className="text-accent-primary text-2xl font-bold flex items-center gap-3">
            🎬 Edit Scene {scene.seq}
          </DialogTitle>
          <DialogDescription className="text-white text-base">
            📝 Review and modify AI-extracted scene details
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] py-6">
          <div className="space-y-8">
            {/* Enhanced Basic Info */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-primary text-lg font-semibold mb-4 flex items-center gap-2">
                🎯 Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    🎯 Scene Number
                  </Label>
                  <Input
                    type="number"
                    value={formData.seq}
                    onChange={(e) => setFormData({ ...formData, seq: parseInt(e.target.value) })}
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    🏗️ Interior/Exterior
                  </Label>
                  <Select
                    value={formData.interior ? 'interior' : 'exterior'}
                    onValueChange={(value) => setFormData({ ...formData, interior: value === 'interior' })}
                  >
                    <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg border-accent-brown">
                      <SelectItem value="interior">🏠 Interior (INT.)</SelectItem>
                      <SelectItem value="exterior">🌅 Exterior (EXT.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Enhanced Location */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-secondary text-lg font-semibold mb-4 flex items-center gap-2">
                📍 Location Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    📍 Location
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Kuttanad Backwater, Police Station"
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors placeholder-text-secondary/70"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    🎞️ Slugline
                  </Label>
                  <Input
                    value={formData.slugline}
                    onChange={(e) => setFormData({ ...formData, slugline: e.target.value })}
                    placeholder="Full scene heading"
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary font-mono text-sm focus:border-accent-primary transition-colors placeholder-text-secondary/70"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Time & Duration */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-primary text-lg font-semibold mb-4 flex items-center gap-2">
                ⏱️ Time & Production Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    🕐 Time of Day
                  </Label>
                  <Select
                    value={formData.time_of_day}
                    onValueChange={(value) => setFormData({ ...formData, time_of_day: value })}
                  >
                    <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg border-accent-brown">
                      <SelectItem value="day">☀️ Day</SelectItem>
                      <SelectItem value="night">🌙 Night</SelectItem>
                      <SelectItem value="morning">🌅 Morning</SelectItem>
                      <SelectItem value="evening">🌇 Evening</SelectItem>
                      <SelectItem value="dawn">🌄 Dawn</SelectItem>
                      <SelectItem value="dusk">🌆 Dusk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    ⏱️ Duration (min)
                  </Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    👥 Crowd Size
                  </Label>
                  <Input
                    type="number"
                    value={formData.crowd_estimate}
                    onChange={(e) => setFormData({ ...formData, crowd_estimate: parseInt(e.target.value) })}
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Cast / Actors */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-primary text-lg font-semibold mb-4 flex items-center gap-2">
                🎭 Cast / Actors
              </h3>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addActor()}
                  placeholder="Add character name..."
                  className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors placeholder-text-secondary/70"
                />
                <Button onClick={addActor} type="button" size="sm" className="bg-accent-primary text-primary-bg hover:bg-accent-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.actors.map((actor, idx) => (
                  <Badge key={idx} className="bg-accent-primary/20 text-accent-primary border-accent-primary/50 hover:bg-accent-primary/30 transition-colors">
                    🎭 {actor}
                    <button
                      onClick={() => removeActor(actor)}
                      className="ml-2 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Enhanced Props */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-secondary text-lg font-semibold mb-4 flex items-center gap-2">
                🎪 Props
              </h3>
              <div className="flex gap-2 mb-4">
                <Input
                  value={newProp}
                  onChange={(e) => setNewProp(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addProp()}
                  placeholder="Add prop name..."
                  className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors placeholder-text-secondary/70"
                />
                <Button onClick={addProp} type="button" size="sm" className="bg-accent-secondary text-primary-bg hover:bg-accent-primary transition-colors">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.props.map((prop, idx) => (
                  <Badge key={idx} className="bg-accent-secondary/20 text-accent-secondary border-accent-secondary/50 hover:bg-accent-secondary/30 transition-colors">
                    🎪 {prop}
                    <button
                      onClick={() => removeProp(prop)}
                      className="ml-2 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Enhanced Notes & VFX */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-secondary text-lg font-semibold mb-4 flex items-center gap-2">
                📝 Additional Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    📝 Notes
                  </Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this scene..."
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary min-h-[80px] focus:border-accent-primary transition-colors resize-none placeholder-text-secondary/70"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-accent-brown">
                  <input
                    type="checkbox"
                    id="vfx"
                    checked={formData.vfx}
                    onChange={(e) => setFormData({ ...formData, vfx: e.target.checked })}
                    className="w-5 h-5 rounded border-accent-brown bg-white text-accent-primary focus:border-accent-primary transition-colors"
                  />
                  <Label htmlFor="vfx" className="text-gray-900 font-medium cursor-pointer flex items-center">
                    ✨ VFX Required
                  </Label>
                </div>
              </div>
            </div>

            {/* Enhanced AI Confidence */}
            <div className="bg-primary-bg rounded-lg p-6 border border-accent-brown shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium flex items-center">
                  🤖 AI Extraction Confidence
                </span>
                <span className={`font-bold text-lg ${scene.ai_confidence > 0.8 ? 'text-accent-primary' : 'text-accent-secondary'}`}>
                  {scene.ai_confidence > 0.8 ? '✅' : '⚠️'} {Math.round(scene.ai_confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-accent-brown mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={saving}
            className="border-accent-brown text-white hover:bg-accent-brown hover:text-white transition-colors"
          >
            ❌ Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-gradient-to-r from-accent-primary to-accent-secondary text-primary-bg hover:from-accent-secondary hover:to-accent-primary font-medium transition-all duration-300"
          >
            {saving ? '⏳ Saving...' : '💾 Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
