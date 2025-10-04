"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Home,
  Sun,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Scene, Alert } from '@/lib/types';
import SceneDetailModal from './SceneDetailModal';

interface CompactSceneCardProps {
  scene: Scene;
  alerts: Alert[];
}

export default function CompactSceneCard({ scene, alerts }: CompactSceneCardProps) {
  const sceneAlerts = alerts.filter(alert => alert.sceneId === scene.id);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-accent-primary" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-accent-secondary" />;
      default: return <XCircle className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30';
      case 'in-progress': return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30';
      default: return 'bg-accent-brown/20 text-text-secondary border-accent-brown/30';
    }
  };

  const getTimeOfDay = () => {
    // Mock data - in real app this would come from scene data
    const times = ['Day', 'Night', 'Morning', 'Evening'];
    return times[Math.floor(Math.random() * times.length)];
  };

  const getShortDescription = () => {
    // Mock short description - in real app this would be truncated from full description
    return `${scene.characters.length} characters engage in dialogue. Key emotional beats and plot development with specific camera angles required.`;
  };

  return (
    <Card className="bg-secondary-bg border-accent-brown hover:border-accent-primary/50 transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-4">
        {/* Header: Scene Number + Day + Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h4 className="font-bold text-accent-secondary text-lg">
              Scene {scene.number}
            </h4>
            <Badge className="bg-accent-secondary/20 text-accent-secondary text-xs px-2 py-1">
              {getTimeOfDay()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {sceneAlerts.length > 0 && (
              <Badge className="bg-accent-brown text-accent-primary text-xs px-2 py-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alert
              </Badge>
            )}
            <Badge className={`text-xs px-2 py-1 ${getStatusColor(scene.status)}`}>
              {scene.status === 'completed' ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div className="mb-3">
          <h5 className="text-text-primary font-semibold text-base line-clamp-1">
            {scene.name}
          </h5>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-accent-primary flex-shrink-0" />
          <span className="text-text-primary text-sm font-medium">
            {scene.location}
          </span>
        </div>

        {/* Short Description */}
        <div className="mb-4">
          <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed">
            {getShortDescription()}
          </p>
        </div>

        {/* Alert Details (if any) */}
        {sceneAlerts.length > 0 && (
          <div className="mb-4 p-3 bg-accent-brown/10 border border-accent-brown/30 rounded">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-accent-primary font-semibold block">
                  {sceneAlerts[0].severity.toUpperCase()} PRIORITY ALERT
                </span>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {sceneAlerts[0].message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Scene Button */}
        <SceneDetailModal scene={scene} alerts={alerts}>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-accent-primary border-accent-primary/30 hover:bg-accent-primary hover:text-primary-bg transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Scene
          </Button>
        </SceneDetailModal>
      </CardContent>
    </Card>
  );
}