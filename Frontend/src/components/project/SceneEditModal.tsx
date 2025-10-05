"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { scenesService, SceneUpdateRequest } from '@/services/api/scenesService';

// Interface for the scene data passed to this modal
export interface SceneEditData {
  id: number;
  scene_number: string;
  scene_heading?: string;
  location_name: string;
  location_type?: string;
  time_of_day?: string;
  estimated_duration?: string;
  status: string;
  actors_data?: Array<{ name?: string; [key: string]: any }>;
  props_data?: string[];
  technical_notes?: string;
}

interface SceneEditModalProps {
  scene: SceneEditData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedScene: SceneEditData) => void;
}

export default function SceneEditModal({ scene, isOpen, onClose, onSave }: SceneEditModalProps) {
  const [formData, setFormData] = useState<SceneEditData>(scene);
  const [saving, setSaving] = useState(false);
  const [newActor, setNewActor] = useState('');
  const [newProp, setNewProp] = useState('');

  // Update form data when scene prop changes
  useEffect(() => {
    setFormData(scene);
  }, [scene]);

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Starting scene save...', formData);
      
      // Prepare the update request
      const updateRequest: SceneUpdateRequest = {
        scene_heading: formData.scene_heading,
        location_name: formData.location_name,
        location_type: formData.location_type,
        time_of_day: formData.time_of_day,
        status: formData.status,
        estimated_duration: formData.estimated_duration,
        actors_data: formData.actors_data || [],
        props_data: formData.props_data || [],
        technical_notes: formData.technical_notes
      };

      console.log('Update request:', updateRequest);
      console.log('Scene ID:', formData.id);

      // Call the API to update the scene
      const updatedScene = await scenesService.updateScene(formData.id, updateRequest);
      
      console.log('Scene updated successfully:', updatedScene);
      
      // Map the response back to our interface
      const mappedScene: SceneEditData = {
        id: updatedScene.id,
        scene_number: updatedScene.scene_number,
        scene_heading: updatedScene.scene_heading,
        location_name: updatedScene.location_name,
        location_type: updatedScene.location_type,
        time_of_day: updatedScene.time_of_day,
        estimated_duration: updatedScene.estimated_duration,
        status: updatedScene.status,
        actors_data: updatedScene.actors_data,
        props_data: updatedScene.props_data,
        technical_notes: updatedScene.technical_notes
      };

      onSave(mappedScene);
      onClose();
    } catch (error: any) {
      console.error('Save error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      alert(`Failed to save scene: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const addActor = () => {
    if (newActor.trim()) {
      const currentActors = formData.actors_data || [];
      const actorExists = currentActors.some(actor => 
        (typeof actor === 'string' ? actor : actor.name || '') === newActor.trim()
      );
      
      if (!actorExists) {
        const newActorData = { name: newActor.trim() };
        setFormData({ 
          ...formData, 
          actors_data: [...currentActors, newActorData] 
        });
        setNewActor('');
      }
    }
  };

  const removeActor = (actorToRemove: any) => {
    const currentActors = formData.actors_data || [];
    const actorName = typeof actorToRemove === 'string' ? actorToRemove : actorToRemove.name || '';
    setFormData({ 
      ...formData, 
      actors_data: currentActors.filter((actor: any) => {
        const currentActorName = typeof actor === 'string' ? actor : actor.name || '';
        return currentActorName !== actorName;
      })
    });
  };

  const addProp = () => {
    if (newProp.trim()) {
      const currentProps = formData.props_data || [];
      if (!currentProps.includes(newProp.trim())) {
        setFormData({ 
          ...formData, 
          props_data: [...currentProps, newProp.trim()] 
        });
        setNewProp('');
      }
    }
  };

  const removeProp = (prop: string) => {
    const currentProps = formData.props_data || [];
    setFormData({ 
      ...formData, 
      props_data: currentProps.filter((p: string) => p !== prop) 
    });
  };

  // Helper function to get actor display name
  const getActorDisplayName = (actor: any): string => {
    return typeof actor === 'string' ? actor : actor.name || 'Unknown Actor';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-secondary-bg/95 backdrop-blur-sm border-accent-brown shadow-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4 border-b border-accent-brown flex-shrink-0">
          <DialogTitle className="text-accent-primary text-2xl font-bold flex items-center gap-3">
            🎬 Edit Scene {formData.scene_number}
          </DialogTitle>
          <DialogDescription className="text-white text-base">
            📝 Review and modify scene details
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 py-6">
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
                    value={formData.scene_number}
                    onChange={(e) => setFormData({ ...formData, scene_number: e.target.value })}
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    🏗️ Location Type
                  </Label>
                  <Select
                    value={formData.location_type || 'indoor'}
                    onValueChange={(value) => setFormData({ ...formData, location_type: value })}
                  >
                    <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg border-accent-brown">
                      <SelectItem value="indoor">🏠 Indoor (INT.)</SelectItem>
                      <SelectItem value="outdoor">🌅 Outdoor (EXT.)</SelectItem>
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
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    placeholder="e.g., Kuttanad Backwater, Police Station"
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors placeholder-text-secondary/70"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    🎞️ Scene Heading
                  </Label>
                  <Input
                    value={formData.scene_heading || ''}
                    onChange={(e) => setFormData({ ...formData, scene_heading: e.target.value })}
                    placeholder="Scene heading/description"
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
                    value={formData.time_of_day || 'day'}
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
                    ⏱️ Duration
                  </Label>
                  <Input
                    value={formData.estimated_duration || ''}
                    onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                    placeholder="e.g., 30 minutes"
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors"
                  />
                </div>
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    � Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg border-accent-brown">
                      <SelectItem value="unplanned">📋 Unplanned</SelectItem>
                      <SelectItem value="planned">📅 Planned</SelectItem>
                      <SelectItem value="shooting">🎬 Shooting</SelectItem>
                      <SelectItem value="completed">✅ Completed</SelectItem>
                    </SelectContent>
                  </Select>
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
                {(formData.actors_data || []).map((actor: any, idx: number) => (
                  <Badge key={idx} className="bg-accent-primary/20 text-accent-primary border-accent-primary/50 hover:bg-accent-primary/30 transition-colors">
                    🎭 {getActorDisplayName(actor)}
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
                {(formData.props_data || []).map((prop: string, idx: number) => (
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

            {/* Enhanced Notes */}
            <div className="bg-primary-bg border border-accent-brown rounded-lg p-6 shadow-lg">
              <h3 className="text-accent-secondary text-lg font-semibold mb-4 flex items-center gap-2">
                📝 Additional Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium flex items-center mb-2">
                    📝 Technical Notes
                  </Label>
                  <Textarea
                    value={formData.technical_notes || ''}
                    onChange={(e) => setFormData({ ...formData, technical_notes: e.target.value })}
                    placeholder="Additional notes about this scene..."
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary min-h-[80px] focus:border-accent-primary transition-colors resize-none placeholder-text-secondary/70"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-accent-brown mt-6 flex-shrink-0">
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
