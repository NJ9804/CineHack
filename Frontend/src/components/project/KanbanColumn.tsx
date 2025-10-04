"use client"

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { Clock, Target, Play, CheckCircle } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  children: ReactNode;
}

const getColorClasses = (color: string) => {
  switch (color) {
    case 'gray':
      return {
        border: 'border-gray-700',
        bg: 'bg-gray-900/50',
        header: 'bg-gray-800/50',
        text: 'text-gray-400',
        dot: 'bg-gray-500',
      };
    case 'yellow':
      return {
        border: 'border-yellow-700/30',
        bg: 'bg-yellow-900/10',
        header: 'bg-yellow-800/20',
        text: 'text-yellow-400',
        dot: 'bg-yellow-500',
      };
    case 'blue':
      return {
        border: 'border-blue-700/30',
        bg: 'bg-blue-900/10',
        header: 'bg-blue-800/20',
        text: 'text-blue-400',
        dot: 'bg-blue-500',
      };
    case 'green':
      return {
        border: 'border-green-700/30',
        bg: 'bg-green-900/10',
        header: 'bg-green-800/20',
        text: 'text-green-400',
        dot: 'bg-green-500',
      };
    default:
      return {
        border: 'border-gray-700',
        bg: 'bg-gray-900/50',
        header: 'bg-gray-800/50',
        text: 'text-gray-400',
        dot: 'bg-gray-500',
      };
  }
};

const getIcon = (id: string) => {
  switch (id) {
    case 'unplanned':
      return <Clock className="w-4 h-4" />;
    case 'planned':
      return <Target className="w-4 h-4" />;
    case 'in-progress':
      return <Play className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function KanbanColumn({ id, title, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = getColorClasses(color);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col rounded-lg border-2 transition-all duration-200
        ${colors.border} ${colors.bg}
        ${isOver ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-900 scale-102' : ''}
      `}
    >
      {/* Column Header */}
      <div className={`px-4 py-3 rounded-t-lg ${colors.header}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
            <h3 className={`font-semibold text-sm ${colors.text}`}>
              {title}
            </h3>
            {getIcon(id) && (
              <span className={colors.text}>
                {getIcon(id)}
              </span>
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800 ${colors.text}`}>
            {count}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-4 min-h-[500px] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
