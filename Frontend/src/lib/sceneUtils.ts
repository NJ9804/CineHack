import { Scene } from '@/lib/types';
import { SceneResponse, SceneCreateRequest, SceneUpdateRequest } from '@/services/api/scenesService';
import { SceneEditData } from '@/components/project/SceneEditModal';

/**
 * Utility functions to convert between different scene representations
 */

// Convert backend SceneResponse to frontend Scene
export function sceneResponseToScene(sceneResponse: SceneResponse): Scene {
  return {
    id: sceneResponse.id.toString(),
    number: parseInt(sceneResponse.scene_number) || sceneResponse.id,
    name: sceneResponse.scene_heading || `Scene ${sceneResponse.scene_number}`,
    location: sceneResponse.location_name,
    characters: sceneResponse.actors_data?.map(actor => 
      typeof actor === 'string' ? actor : actor.name || 'Unknown Actor'
    ) || [],
    estimatedBudget: sceneResponse.estimated_cost || 0,
    properties: sceneResponse.props_data || [],
    equipment: [], // Not available in backend response
    status: sceneResponse.status as Scene['status'],
    alerts: [] // Will be populated separately
  };
}

// Convert backend SceneResponse to SceneEditData
export function sceneResponseToEditData(sceneResponse: SceneResponse): SceneEditData {
  return {
    id: sceneResponse.id,
    scene_number: sceneResponse.scene_number,
    scene_heading: sceneResponse.scene_heading,
    location_name: sceneResponse.location_name,
    location_type: sceneResponse.location_type,
    time_of_day: sceneResponse.time_of_day,
    estimated_duration: sceneResponse.estimated_duration,
    status: sceneResponse.status,
    actors_data: sceneResponse.actors_data,
    props_data: sceneResponse.props_data,
    technical_notes: sceneResponse.technical_notes
  };
}

// Convert frontend Scene to SceneCreateRequest
export function sceneToCreateRequest(scene: Partial<Scene>): SceneCreateRequest {
  return {
    scene_number: scene.number?.toString() || 'New Scene',
    scene_heading: scene.name,
    location_name: scene.location || 'Unknown Location',
    location_type: 'indoor',
    time_of_day: 'day',
    estimated_duration: '60 minutes',
    actors_data: scene.characters?.map(char => ({ name: char })) || [],
    props_data: scene.properties || [],
    technical_notes: ''
  };
}

// Convert SceneEditData to SceneUpdateRequest
export function editDataToUpdateRequest(editData: SceneEditData): SceneUpdateRequest {
  return {
    scene_heading: editData.scene_heading,
    location_name: editData.location_name,
    location_type: editData.location_type,
    time_of_day: editData.time_of_day,
    status: editData.status,
    estimated_duration: editData.estimated_duration,
    actors_data: editData.actors_data,
    props_data: editData.props_data,
    technical_notes: editData.technical_notes
  };
}

// Convert frontend Scene to SceneEditData (for editing)
export function sceneToEditData(scene: Scene): SceneEditData {
  return {
    id: parseInt(scene.id),
    scene_number: scene.number.toString(),
    scene_heading: scene.name,
    location_name: scene.location,
    location_type: 'indoor', // default value
    time_of_day: 'day', // default value  
    estimated_duration: '60 minutes', // default value
    status: scene.status,
    actors_data: scene.characters.map(char => ({ name: char })),
    props_data: scene.properties,
    technical_notes: ''
  };
}