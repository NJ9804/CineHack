"use client"

import { useDraggable } from '@dnd-kit/core';
import { Scene } from '@/lib/types';
import { MapPin, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SceneKanbanCardProps {
  scene: Scene;
  isDragging?: boolean;
  onClick?: () => void;
}

export default function SceneKanbanCard({ scene, isDragging = false, onClick }: SceneKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingState,
  } = useDraggable({ id: scene.id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const hasAlerts = scene.alerts && scene.alerts.length > 0;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`
          bg-gray-800/80 border-gray-700 hover:border-amber-500/50 
          transition-all duration-200 cursor-grab active:cursor-grabbing
          ${isDragging || isDraggingState ? 'shadow-2xl shadow-amber-500/20 rotate-3 opacity-50' : 'hover:shadow-lg'}
        `}
        onClick={(e) => {
          // Only trigger onClick if not dragging
          if (!isDraggingState && onClick) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Scene Number and Title */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                    Scene {scene.number}
                  </Badge>
                  {hasAlerts && (
                    <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                  )}
                </div>
                <h4 className="text-sm font-medium text-white line-clamp-2 break-words">
                  {scene.name}
                </h4>
              </div>
            </div>

            {/* Scene Details */}
            <div className="space-y-2 text-xs text-gray-400">
              {/* Location */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{scene.location}</span>
              </div>

              {/* Characters */}
              {scene.characters && scene.characters.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {scene.characters.length} character{scene.characters.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Budget */}
              {scene.estimatedBudget > 0 && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 flex-shrink-0" />
                  <span>₹{(scene.estimatedBudget / 100000).toFixed(1)}L</span>
                </div>
              )}
            </div>

            {/* Props/Equipment Tags */}
            {((scene.properties && scene.properties.length > 0) || (scene.equipment && scene.equipment.length > 0)) && (
              <div className="flex flex-wrap gap-1">
                {scene.properties?.slice(0, 2).map((prop, idx) => (
                  <span
                    key={`prop-${idx}`}
                    className="px-1.5 py-0.5 bg-blue-500/10 text-blue-300 rounded text-[10px]"
                  >
                    {prop}
                  </span>
                ))}
                {scene.equipment?.slice(0, 1).map((equip, idx) => (
                  <span
                    key={`equip-${idx}`}
                    className="px-1.5 py-0.5 bg-purple-500/10 text-purple-300 rounded text-[10px]"
                  >
                    {equip}
                  </span>
                ))}
                {(scene.properties?.length || 0) + (scene.equipment?.length || 0) > 3 && (
                  <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px]">
                    +{(scene.properties?.length || 0) + (scene.equipment?.length || 0) - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Alerts */}
            {hasAlerts && (
              <div className="pt-2 border-t border-gray-700">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[10px] text-red-300 line-clamp-2">
                    {scene.alerts![0].message}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
