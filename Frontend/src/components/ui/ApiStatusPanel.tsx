"use client"

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Switch } from '../ui/switch';
import { Switch } from './switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { apiClient } from '@/services/api/client';
import { AlertCircle, CheckCircle, WifiOff, Wifi } from 'lucide-react';

export function ApiStatusPanel() {
  const [mockMode, setMockMode] = useState(false);
  const [serverHealth, setServerHealth] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Get initial mock mode status
    const useMockData = localStorage.getItem('useMockData') === 'true';
    setMockMode(useMockData);
    
    // Check server health
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setChecking(true);
    try {
      const isHealthy = await apiClient.checkServerHealth();
      setServerHealth(isHealthy);
    } catch (error) {
      setServerHealth(false);
    }
    setChecking(false);
  };

  const toggleMockMode = () => {
    const newMockMode = !mockMode;
    setMockMode(newMockMode);
    apiClient.setMockMode(newMockMode);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {serverHealth === null ? (
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
            ) : serverHealth ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            API Status
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Backend Server</span>
            <Badge 
              variant={serverHealth ? 'default' : 'destructive'}
              className="text-xs"
            >
              {checking ? 'Checking...' : serverHealth ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <Button
            onClick={checkHealth}
            disabled={checking}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Wifi className="w-4 h-4 mr-2" />
            Check Connection
          </Button>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="mock-mode"
              checked={mockMode}
              onCheckedChange={toggleMockMode}
            />
            <Label htmlFor="mock-mode" className="text-sm">
              Use Mock Data
            </Label>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {mockMode ? (
              <div className="flex items-center gap-2 text-amber-600">
                <WifiOff className="w-3 h-3" />
                Using offline mock data
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-600">
                <Wifi className="w-3 h-3" />
                Using live API data
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <strong>Note:</strong> When the backend is unavailable, the app will 
          automatically fallback to mock data for testing.
        </div>
      </CardContent>
    </Card>
  );
}