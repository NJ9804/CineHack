"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Cloud, Wrench, DollarSign, Calendar, MapPin, Users } from 'lucide-react';
import { Alert, Scene } from '@/lib/types';
import { useButtonActions } from '@/hooks/useButtonActions';

interface RisksTabProps {
  projectId: string;
  alerts: Alert[];
  scenes: Scene[];
}

export default function RisksTab({ projectId, alerts, scenes }: RisksTabProps) {
  const actions = useButtonActions();
  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.type]) {
      acc[alert.type] = [];
    }
    acc[alert.type].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return Cloud;
      case 'equipment': return Wrench;
      case 'budget': return DollarSign;
      case 'scheduling': return Calendar;
      default: return AlertTriangle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weather': return 'text-blue-400';
      case 'equipment': return 'text-orange-400';
      case 'budget': return 'text-red-400';
      case 'scheduling': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(a => a.severity === 'medium');
  const lowPriorityAlerts = alerts.filter(a => a.severity === 'low');

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-pink-600/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{highPriorityAlerts.length}</div>
            <div className="text-sm text-gray-400">High Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{mediumPriorityAlerts.length}</div>
            <div className="text-sm text-gray-400">Medium Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{lowPriorityAlerts.length}</div>
            <div className="text-sm text-gray-400">Low Priority</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500/10 to-slate-600/10 border-gray-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{alerts.length}</div>
            <div className="text-sm text-gray-400">Total Risks</div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Alerts */}
      {highPriorityAlerts.length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              High Priority Risks ({highPriorityAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriorityAlerts.map((alert) => {
                const Icon = getTypeIcon(alert.type);
                const relatedScene = scenes.find(s => s.id === alert.sceneId);
                
                return (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <Icon className={`w-5 h-5 mt-0.5 ${getTypeColor(alert.type)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white">{alert.message}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 capitalize mb-2">{alert.type} Risk</p>
                      {relatedScene && (
                        <div className="flex items-center text-xs text-gray-400">
                          <MapPin className="w-3 h-3 mr-1" />
                          Scene {relatedScene.number}: {relatedScene.name}
                        </div>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button variant="destructive" size="sm">
                        Resolve
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(groupedAlerts).map(([type, typeAlerts]) => {
          const Icon = getTypeIcon(type);
          
          return (
            <Card key={type} className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center capitalize">
                  <Icon className={`w-5 h-5 mr-2 ${getTypeColor(type)}`} />
                  {type} Risks ({typeAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeAlerts.map((alert) => {
                    const relatedScene = scenes.find(s => s.id === alert.sceneId);
                    
                    return (
                      <div key={alert.id} className="flex items-start justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm text-white mb-1">{alert.message}</p>
                          {relatedScene && (
                            <div className="flex items-center text-xs text-gray-400">
                              <MapPin className="w-3 h-3 mr-1" />
                              Scene {relatedScene.number}: {relatedScene.name}
                            </div>
                          )}
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Assessment Tools */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
            Risk Management Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Analysis */}
            <div>
              <h4 className="text-white font-medium mb-3">Risk Analysis</h4>
              <div className="space-y-3">
                <Button 
                  variant="cinematic" 
                  className="w-full"
                  onClick={() => actions.handleGenerateRiskReport(projectId)}
                >
                  Generate Risk Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => actions.handleWeatherForecast(projectId)}
                >
                  Weather Forecast Analysis
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => actions.handleCheckEquipment(projectId)}
                >
                  Equipment Availability Check
                </Button>
              </div>
            </div>

            {/* Mitigation Actions */}
            <div>
              <h4 className="text-white font-medium mb-3">Mitigation Actions</h4>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => actions.handleCreateContingencyPlan(projectId)}
                >
                  Create Contingency Plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => actions.handleCreateSchedule(projectId)}
                >
                  Schedule Alternative Dates
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => actions.handleGenerateBudgetReport(projectId)}
                >
                  Budget Risk Assessment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">
                  {groupedAlerts.weather?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Weather Risks</div>
              </div>
              <Cloud className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">
                  {groupedAlerts.equipment?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Equipment Issues</div>
              </div>
              <Wrench className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-white">
                  {groupedAlerts.scheduling?.length || 0}
                </div>
                <div className="text-sm text-gray-400">Schedule Conflicts</div>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">✓</div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Active Risks</h3>
            <p className="text-gray-400">Your project is currently running smoothly with no identified risks.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}