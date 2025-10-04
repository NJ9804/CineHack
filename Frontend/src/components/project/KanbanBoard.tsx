"use client"

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { Scene } from '@/lib/types';
import KanbanColumn from './KanbanColumn';
import SceneKanbanCard from './SceneKanbanCard';

interface KanbanBoardProps {
  scenes: Scene[];
  onSceneStatusChange: (sceneId: string, newStatus: string) => Promise<void>;
  onSceneClick?: (scene: Scene) => void;
}

type SceneStatus = 'unplanned' | 'planned' | 'in-progress' | 'shooting' | 'completed';

const COLUMNS: { id: SceneStatus; title: string; color: string }[] = [
  { id: 'unplanned', title: 'Unplanned', color: 'gray' },
  { id: 'planned', title: 'Planned', color: 'yellow' },
  { id: 'in-progress', title: 'In Progress', color: 'blue' },
  { id: 'completed', title: 'Completed', color: 'green' },
];

export default function KanbanBoard({ scenes, onSceneStatusChange, onSceneClick }: KanbanBoardProps) {
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Group scenes by status
  const groupedScenes = COLUMNS.reduce((acc, column) => {
    acc[column.id] = scenes.filter(scene => {
      // Handle both 'in-progress' and 'shooting' as the same status
      if (column.id === 'in-progress') {
        return scene.status === 'in-progress' || scene.status === 'shooting';
      }
      return scene.status === column.id || (!scene.status && column.id === 'unplanned');
    });
    return acc;
  }, {} as Record<SceneStatus, Scene[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const scene = scenes.find(s => s.id === active.id);
    setActiveScene(scene || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveScene(null);
      return;
    }

    const sceneId = active.id as string;
    const newStatus = over.id as string;

    // Check if dropped on a column (not another scene)
    if (COLUMNS.some(col => col.id === newStatus)) {
      const scene = scenes.find(s => s.id === sceneId);
      if (scene && scene.status !== newStatus) {
        // Map 'in-progress' to 'shooting' for backend
        const backendStatus = newStatus === 'in-progress' ? 'shooting' : newStatus;
        await onSceneStatusChange(sceneId, backendStatus);
      }
    }

    setActiveScene(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            count={groupedScenes[column.id].length}
          >
            <div className="space-y-3">
              {groupedScenes[column.id].map((scene) => (
                <SceneKanbanCard
                  key={scene.id}
                  scene={scene}
                  onClick={() => onSceneClick?.(scene)}
                />
              ))}
              {groupedScenes[column.id].length === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No scenes
                </div>
              )}
            </div>
          </KanbanColumn>
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeScene && (
          <div className="rotate-3 opacity-90">
            <SceneKanbanCard scene={activeScene} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
