"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Clock, MapPin, Users } from 'lucide-react';
import { Scene } from '@/lib/types';
import { useToastNotification } from '@/providers/ToastProvider';

interface CreateSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sceneData: Partial<Scene>) => Promise<void>;
  projectId: string;
  sceneNumber: number;
}

export default function CreateSceneModal({ isOpen, onClose, onSave, projectId, sceneNumber }: CreateSceneModalProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToastNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    time_of_day: 'Day',
    duration_minutes: 30,
    characters: [] as string[],
    equipment: [] as string[],
    props: [] as string[],
    notes: ''
  });
  const [newCharacter, setNewCharacter] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newProp, setNewProp] = useState('');

  const timeOfDayOptions = ['Day', 'Night', 'Dawn', 'Dusk', 'Interior Day', 'Interior Night'];

  const addCharacter = () => {
    if (newCharacter.trim() && !formData.characters.includes(newCharacter.trim())) {
      setFormData(prev => ({
        ...prev,
        characters: [...prev.characters, newCharacter.trim()]
      }));
      setNewCharacter('');
    }
  };

  const removeCharacter = (character: string) => {
    setFormData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c !== character)
    }));
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !formData.equipment.includes(newEquipment.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== equipment)
    }));
  };

  const addProp = () => {
    if (newProp.trim() && !formData.props.includes(newProp.trim())) {
      setFormData(prev => ({
        ...prev,
        props: [...prev.props, newProp.trim()]
      }));
      setNewProp('');
    }
  };

  const removeProp = (prop: string) => {
    setFormData(prev => ({
      ...prev,
      props: prev.props.filter(p => p !== prop)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const sceneData: Partial<Scene> = {
        number: sceneNumber,
        name: formData.title || `Scene ${sceneNumber}`,
        location: formData.location,
        characters: formData.characters,
        equipment: formData.equipment,
        properties: formData.props,
        status: 'planned',
        estimatedBudget: 0
      };

      await onSave(sceneData);
      
      // Show success message
      toast.success(
        'Scene Created Successfully!', 
        `Scene ${sceneNumber}: ${formData.title || `Scene ${sceneNumber}`} has been added to the project.`
      );
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        time_of_day: 'Day',
        duration_minutes: 30,
        characters: [],
        equipment: [],
        props: [],
        notes: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create scene:', error);
      toast.error(
        'Failed to Create Scene', 
        'There was an error creating the scene. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      time_of_day: 'Day',
      duration_minutes: 30,
      characters: [],
      equipment: [],
      props: [],
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Scene</DialogTitle>
          <DialogDescription className="text-gray-400">
            Scene {sceneNumber} - Add details for this new scene
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Scene Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={`Scene ${sceneNumber}`}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Beach, Office, Car"
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of what happens in this scene..."
              className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
            />
          </div>

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Time of Day</Label>
              <select
                value={formData.time_of_day}
                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                {timeOfDayOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Duration (minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                  min="1"
                  max="300"
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Characters */}
          <div>
            <Label className="text-gray-300">Characters in this scene</Label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={newCharacter}
                  onChange={(e) => setNewCharacter(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCharacter()}
                  placeholder="Character name..."
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button onClick={addCharacter} type="button" size="sm" className="bg-blue-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.characters.map((character, idx) => (
                <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {character}
                  <button
                    onClick={() => removeCharacter(character)}
                    className="ml-2 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <Label className="text-gray-300">Required Equipment</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                placeholder="Equipment name..."
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={addEquipment} type="button" size="sm" className="bg-green-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((equipment, idx) => (
                <Badge key={idx} className="bg-green-500/20 text-green-400 border-green-500/30">
                  {equipment}
                  <button
                    onClick={() => removeEquipment(equipment)}
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
            <Label className="text-gray-300">Required Props</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newProp}
                onChange={(e) => setNewProp(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addProp()}
                placeholder="Prop name..."
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={addProp} type="button" size="sm" className="bg-purple-600">
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

          {/* Notes */}
          <div>
            <Label className="text-gray-300">Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special requirements, notes, etc..."
              className="bg-gray-800 border-gray-700 text-white min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.location}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {loading ? 'Creating...' : 'Create Scene'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}