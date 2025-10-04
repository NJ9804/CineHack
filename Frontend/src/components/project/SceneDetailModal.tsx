"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  MapPin, 
  Clock, 
  Users, 
  AlertTriangle, 
  Home,
  Sun,
  Cloud,
  Edit,
  Calendar,
  Package,
  Camera,
  UserCheck,
  Thermometer,
  CheckCircle
} from 'lucide-react';
import { Scene, Alert } from '@/lib/types';

interface SceneDetailModalProps {
  scene: Scene;
  alerts: Alert[];
  children: React.ReactNode;
}

export default function SceneDetailModal({ scene, alerts, children }: SceneDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sceneAlerts = alerts.filter(alert => alert.sceneId === scene.id);
  
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-accent-brown text-accent-primary border-accent-brown';
      case 'medium': return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary';
      case 'low': return 'bg-secondary-bg text-text-secondary border-accent-brown';
      default: return 'bg-secondary-bg text-text-secondary border-accent-brown';
    }
  };

  const getWeatherIcon = (alert: Alert) => {
    if (alert.message.toLowerCase().includes('rain')) return <Cloud className="w-4 h-4" />;
    if (alert.message.toLowerCase().includes('heat')) return <Sun className="w-4 h-4" />;
    if (alert.message.toLowerCase().includes('cold')) return <Thermometer className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-secondary-bg border-accent-brown">
        <DialogHeader>
          <DialogTitle className="text-2xl text-accent-secondary flex items-center gap-2">
            <span>Scene {scene.number}: {scene.name}</span>
            {sceneAlerts.length > 0 && (
              <Badge className="bg-accent-brown text-accent-primary">
                {sceneAlerts.length} Alert{sceneAlerts.length > 1 ? 's' : ''}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-primary-bg">
            <TabsTrigger value="details" className="text-text-secondary data-[state=active]:text-accent-primary">Scene Details</TabsTrigger>
            <TabsTrigger value="weather" className="text-text-secondary data-[state=active]:text-accent-primary">Weather & Alerts</TabsTrigger>
            <TabsTrigger value="schedule" className="text-text-secondary data-[state=active]:text-accent-primary">Schedule & Edit</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Detailed Description */}
            <Card className="bg-primary-bg border-accent-brown">
              <CardHeader>
                <CardTitle className="text-accent-secondary">Scene Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-primary leading-relaxed mb-4">
                  This scene takes place in {scene.location} during the morning hours. The lighting should be natural and soft, creating an intimate atmosphere. The characters engage in dialogue that drives the plot forward while revealing key character motivations. Special attention should be paid to the positioning of actors to ensure optimal camera angles for the emotional beats of the scene.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-primary" />
                    <div>
                      <div className="text-text-secondary text-sm">Location</div>
                      <div className="text-text-primary font-medium">{scene.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-accent-secondary" />
                    <div>
                      <div className="text-text-secondary text-sm">Setting</div>
                      <div className="text-text-primary font-medium">Indoor</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-accent-primary" />
                    <div>
                      <div className="text-text-secondary text-sm">Time</div>
                      <div className="text-text-primary font-medium">Morning</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Properties & Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-primary-bg border-accent-brown">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Props Required ({scene.properties.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scene.properties.map((prop, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary-bg rounded">
                        <span className="text-text-primary">{prop}</span>
                        <Badge className="bg-accent-primary/20 text-accent-primary text-xs">Available</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary-bg border-accent-brown">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Equipment ({scene.equipment.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scene.equipment.map((equipment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary-bg rounded">
                        <span className="text-text-primary">{equipment}</span>
                        <Badge className="bg-accent-secondary/20 text-accent-secondary text-xs">Reserved</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crowd Requirements */}
            <Card className="bg-primary-bg border-accent-brown">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Characters & Crowd Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-text-primary font-medium mb-3">Main Characters ({scene.characters.length})</h4>
                    <div className="space-y-2">
                      {scene.characters.map((character, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-secondary-bg rounded">
                          <UserCheck className="w-4 h-4 text-accent-primary" />
                          <span className="text-text-primary">{character}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-text-primary font-medium mb-3">Crowd Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Crowd Type:</span>
                        <span className="text-text-primary">Background extras</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">People Needed:</span>
                        <span className="text-accent-primary font-bold">15-20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Age Range:</span>
                        <span className="text-text-primary">25-45 years</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather" className="space-y-4">
            {/* Weather Forecast */}
            <Card className="bg-primary-bg border-accent-brown">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Weather Forecast & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary-bg rounded-lg">
                    <Sun className="w-8 h-8 text-accent-primary mx-auto mb-2" />
                    <div className="text-text-primary font-bold text-lg">28°C</div>
                    <div className="text-text-secondary text-sm">Sunny</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-bg rounded-lg">
                    <Cloud className="w-8 h-8 text-accent-secondary mx-auto mb-2" />
                    <div className="text-text-primary font-bold text-lg">15%</div>
                    <div className="text-text-secondary text-sm">Rain Chance</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-bg rounded-lg">
                    <div className="w-8 h-8 flex items-center justify-center text-accent-primary text-xl mx-auto mb-2">💨</div>
                    <div className="text-text-primary font-bold text-lg">12 km/h</div>
                    <div className="text-text-secondary text-sm">Wind Speed</div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-accent-primary/10 border border-accent-primary/30 rounded">
                  <h4 className="text-accent-primary font-medium mb-2">Weather Impact Assessment</h4>
                  <p className="text-text-secondary text-sm">
                    Excellent conditions for outdoor filming. Clear skies provide natural lighting. Light wind will not affect audio recording.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Alerts */}
            {sceneAlerts.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-accent-secondary font-semibold text-lg">Active Alerts</h3>
                {sceneAlerts.map((alert) => (
                  <Card key={alert.id} className={`border-2 ${
                    alert.severity === 'high' ? 'border-accent-brown bg-accent-brown/10' :
                    alert.severity === 'medium' ? 'border-accent-secondary bg-accent-secondary/10' :
                    'border-accent-brown bg-secondary-bg'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          alert.severity === 'high' ? 'bg-accent-brown' :
                          alert.severity === 'medium' ? 'bg-accent-secondary' :
                          'bg-accent-brown'
                        }`}>
                          {alert.type === 'weather' ? getWeatherIcon(alert) : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getAlertColor(alert.severity)}>
                              {alert.severity.toUpperCase()} PRIORITY
                            </Badge>
                            <Badge className="bg-secondary-bg text-text-secondary">
                              {alert.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-text-primary font-medium mb-1">{alert.message}</p>
                          <p className="text-text-secondary text-sm">
                            Requires immediate attention from production team. Consider backup plans and alternative scheduling.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-primary-bg border-accent-brown">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-accent-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-accent-secondary mb-2">No Active Alerts</h3>
                  <p className="text-text-secondary">This scene has no weather warnings or production alerts.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            {/* Schedule Information */}
            <Card className="bg-primary-bg border-accent-brown">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-text-secondary text-sm block mb-1">Scheduled Date</label>
                    <p className="text-text-primary font-medium">Not scheduled yet</p>
                  </div>
                  <div>
                    <label className="text-text-secondary text-sm block mb-1">Estimated Duration</label>
                    <p className="text-text-primary font-medium">4-6 hours</p>
                  </div>
                  <div>
                    <label className="text-text-secondary text-sm block mb-1">Priority Level</label>
                    <Badge className="bg-accent-secondary/20 text-accent-secondary">Medium</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="cinematic">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Scene
                  </Button>
                  <Button variant="outline">
                    Check Actor Availability
                  </Button>
                  <Button variant="outline">
                    Location Booking
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Budget Information */}
            <Card className="bg-primary-bg border-accent-brown">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center text-accent-primary">₹</div>
                  Budget Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Cast & Crew:</span>
                      <span className="text-text-primary font-medium">₹{((scene.estimatedBudget * 0.6) / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Equipment:</span>
                      <span className="text-text-primary font-medium">₹{((scene.estimatedBudget * 0.25) / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Location & Props:</span>
                      <span className="text-text-primary font-medium">₹{((scene.estimatedBudget * 0.15) / 100000).toFixed(1)}L</span>
                    </div>
                    <div className="flex justify-between border-t border-accent-brown pt-2">
                      <span className="text-accent-secondary font-semibold">Total Budget:</span>
                      <span className="text-accent-primary font-bold">₹{(scene.estimatedBudget / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Budget
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      View Detailed Breakdown
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Options */}
            <Card className="bg-primary-bg border-accent-brown">
              <CardHeader>
                <CardTitle className="text-accent-secondary flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Scene Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Users className="w-3 h-3 mr-2" />
                    Manage Cast
                  </Button>
                  <Button variant="outline" size="sm">
                    <Package className="w-3 h-3 mr-2" />
                    Edit Props
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="w-3 h-3 mr-2" />
                    Equipment
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-3 h-3 mr-2" />
                    Location
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="w-3 h-3 mr-2" />
                    Update Status
                  </Button>
                </div>
                <p className="text-text-secondary text-sm">
                  Changes to scene details will be automatically saved and synced across all project views.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}