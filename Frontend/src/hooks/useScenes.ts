import { useState, useEffect } from 'react';
import { scenesService, SceneResponse } from '@/services/api/scenesService';
import { sceneResponseToScene, sceneResponseToEditData } from '@/lib/sceneUtils';
import { Scene } from '@/lib/types';
import { SceneEditData } from '@/components/project/SceneEditModal';

interface UseScenesOptions {
  projectId: string;
  autoRefresh?: boolean;
}

interface UseScenesReturn {
  scenes: Scene[];
  sceneResponses: SceneResponse[];
  loading: boolean;
  error: string | null;
  refreshScenes: () => Promise<void>;
  updateScene: (sceneId: number, updates: Partial<SceneEditData>) => Promise<SceneResponse>;
  deleteScene: (sceneId: number) => Promise<void>;
}

export function useScenes({ projectId, autoRefresh = false }: UseScenesOptions): UseScenesReturn {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [sceneResponses, setSceneResponses] = useState<SceneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshScenes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const responses = await scenesService.getProjectScenes(parseInt(projectId));
      setSceneResponses(responses);
      
      // Convert to frontend Scene format for compatibility
      const convertedScenes = responses.map(sceneResponseToScene);
      setScenes(convertedScenes);
    } catch (err) {
      console.error('Failed to fetch scenes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch scenes');
    } finally {
      setLoading(false);
    }
  };

  const updateScene = async (sceneId: number, updates: Partial<SceneEditData>): Promise<SceneResponse> => {
    try {
      const updatedScene = await scenesService.updateScene(sceneId, updates);
      
      // Update local state
      setSceneResponses(prev => 
        prev.map(scene => scene.id === sceneId ? updatedScene : scene)
      );
      
      // Update converted scenes as well
      const updatedScenes = await scenesService.getProjectScenes(parseInt(projectId));
      const convertedScenes = updatedScenes.map(sceneResponseToScene);
      setScenes(convertedScenes);
      
      return updatedScene;
    } catch (err) {
      console.error('Failed to update scene:', err);
      throw err;
    }
  };

  const deleteScene = async (sceneId: number): Promise<void> => {
    try {
      await scenesService.deleteScene(sceneId);
      
      // Update local state
      setSceneResponses(prev => prev.filter(scene => scene.id !== sceneId));
      setScenes(prev => prev.filter(scene => parseInt(scene.id) !== sceneId));
    } catch (err) {
      console.error('Failed to delete scene:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (projectId) {
      refreshScenes();
    }
  }, [projectId]);

  useEffect(() => {
    if (autoRefresh && projectId) {
      const interval = setInterval(refreshScenes, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, projectId]);

  return {
    scenes,
    sceneResponses,
    loading,
    error,
    refreshScenes,
    updateScene,
    deleteScene
  };
}