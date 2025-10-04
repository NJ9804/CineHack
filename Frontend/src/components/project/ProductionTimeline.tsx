import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Play, Pause, AlertCircle } from 'lucide-react';

interface TimelineItem {
  id: number;
  name: string;
  status: string;
  progress: number;
  order: number;
}

interface ProductionTimelineProps {
  stages: TimelineItem[];
  onStageClick?: (stageId: number) => void;
}

export default function ProductionTimeline({ stages, onStageClick }: ProductionTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'in_progress':
        return <Play className="w-6 h-6 text-blue-500" />;
      case 'on_hold':
        return <Pause className="w-6 h-6 text-yellow-500" />;
      case 'blocked':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>

      {/* Timeline Items */}
      <div className="space-y-8">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'in_progress';
          
          return (
            <div
              key={stage.id}
              className={`relative flex items-start gap-6 ${
                onStageClick ? 'cursor-pointer hover:bg-gray-800/30 p-3 rounded-lg transition-all' : ''
              }`}
              onClick={() => onStageClick?.(stage.id)}
            >
              {/* Timeline Node */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-12 h-12 rounded-full border-4 ${
                  isCompleted ? 'border-green-500 bg-green-500/20' :
                  isActive ? 'border-blue-500 bg-blue-500/20 animate-pulse' :
                  'border-gray-600 bg-gray-800'
                } flex items-center justify-center`}>
                  {getStatusIcon(stage.status)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-semibold ${
                        isActive ? 'text-blue-400' : 'text-white'
                      }`}>
                        {stage.name}
                      </h3>
                      <Badge variant={
                        isCompleted ? 'default' :
                        isActive ? 'secondary' :
                        'outline'
                      }>
                        {stage.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Stage {stage.order} of {stages.length}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{stage.progress}%</div>
                    <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getStatusColor(stage.status)}`}
                        style={{ width: `${stage.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Indicator for Active Stage */}
                {isActive && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Currently in progress
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
