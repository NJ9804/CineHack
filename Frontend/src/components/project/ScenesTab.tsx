"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, AlertTriangle, Users, DollarSign, Plus } from 'lucide-react';
import { Scene, Alert } from '@/lib/types';
import CreateSceneModal from './CreateSceneModal';
import { scenesService, SceneResponse } from '@/services/api/scenesService';
import { useButtonActions } from '@/hooks/useButtonActions';
import SceneEditModal, { SceneEditData } from './SceneEditModal';
import { sceneToEditData, sceneToCreateRequest } from '@/lib/sceneUtils';

interface ScenesTabProps {
  projectId: string;
  scenes: Scene[];
  alerts: Alert[];
  onScenesUpdate?: () => void;
}

export default function ScenesTab({ projectId, scenes, alerts, onScenesUpdate }: ScenesTabProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState<SceneEditData | null>(null);
  const actions = useButtonActions();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'planned': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Scenes Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{scenes.length}</div>
            <div className="text-sm text-gray-400">Total Scenes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {scenes.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {scenes.filter(s => s.status === 'in-progress').length}
            </div>
            <div className="text-sm text-gray-400">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {scenes.reduce((sum, scene) => sum + scene.estimatedBudget, 0) > 0 
                ? `₹${(scenes.reduce((sum, scene) => sum + scene.estimatedBudget, 0) / 100000).toFixed(1)}L`
                : '₹0'}
            </div>
            <div className="text-sm text-gray-400">Total Budget</div>
          </CardContent>
        </Card>
      </div>

      {/* Scenes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map((scene) => {
          const sceneAlerts = alerts.filter(alert => alert.sceneId === scene.id);
          
          return (
            <Card key={scene.id} className="bg-gray-900/50 border-gray-700 hover:border-amber-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">
                      Scene {scene.number}: {scene.name}
                    </CardTitle>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <MapPin className="w-3 h-3 mr-1" />
                      {scene.location}
                    </div>
                  </div>
                  <Badge className={getStatusColor(scene.status)}>
                    {scene.status.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Budget */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Budget:</span>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(scene.estimatedBudget)}
                    </span>
                  </div>

                  {/* Characters */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Characters:</span>
                      <span className="text-xs text-gray-500">{scene.characters.length}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="text-xs text-gray-300">
                        {scene.characters.slice(0, 2).join(', ')}
                        {scene.characters.length > 2 && ` +${scene.characters.length - 2} more`}
                      </span>
                    </div>
                  </div>

                  {/* Properties & Equipment */}
                  <div>
                    <div className="text-xs text-gray-400 mb-1">
                      Props: {scene.properties.length} • Equipment: {scene.equipment.length}
                    </div>
                  </div>

                  {/* Alerts */}
                  {sceneAlerts.length > 0 && (
                    <div className="flex items-start space-x-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        {sceneAlerts.map((alert, index) => (
                          <div key={alert.id} className="text-xs text-red-300">
                            {alert.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => {
                        // Use utility function to convert Scene to SceneEditData
                        const editData = sceneToEditData(scene);
                        setSelectedScene(editData);
                        setEditModalOpen(true);
                      }}
                    >
                      Edit Scene
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-amber-400 hover:text-amber-300"
                      onClick={() => actions.handleScheduleScene(scene.id, projectId)}
                      title="Schedule Scene"
                    >
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Scene */}
      <Card className="bg-gray-900/30 border-dashed border-gray-600 hover:border-amber-500/50 transition-colors">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Add New Scene</h3>
          <p className="text-gray-400 mb-4">Create additional scenes for your project</p>
          <Button 
            variant="cinematic"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Scene
          </Button>
        </CardContent>
      </Card>

      {/* Create Scene Modal */}
      <CreateSceneModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateScene}
        projectId={projectId}
        sceneNumber={scenes.length + 1}
      />

      {/* Edit Scene Modal */}
      {selectedScene && (
        <SceneEditModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedScene(null);
          }}
          onSave={handleEditScene}
          scene={selectedScene}
        />
      )}
    </div>
  );

  async function handleCreateScene(sceneData: Partial<Scene>) {
    try {
      // Use utility function to convert Scene data to SceneCreateRequest format
      const createRequest = sceneToCreateRequest(sceneData);
      await scenesService.createScene(parseInt(projectId), createRequest);
      if (onScenesUpdate) {
        onScenesUpdate();
      }
    } catch (error) {
      console.error('Failed to create scene:', error);
      throw error;
    }
  }

  async function handleEditScene(updatedScene: SceneEditData) {
    try {
      console.log('Scene updated successfully:', updatedScene);
      if (onScenesUpdate) {
        onScenesUpdate();
      }
    } catch (error) {
      console.error('Failed to update scene:', error);
      throw error;
    }
  }
}