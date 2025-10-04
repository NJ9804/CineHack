"use client"

import Layout from '@/components/layout/Layout';
import { ApiStatusPanel } from '@/components/ui/ApiStatusPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Server, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* API Configuration */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Server className="w-5 h-5" />
              API Configuration
            </h2>
            <ApiStatusPanel />
          </div>

          {/* Application Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Application Info
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <Badge variant="outline">Development</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <Badge variant="outline">1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Framework</span>
                  <Badge variant="outline">Next.js 15.5.4</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Local Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Local preferences and temporary data are stored in your browser.
                </p>
                <div className="text-xs bg-muted/50 p-2 rounded">
                  <strong>Mock Data:</strong> When enabled, the application uses 
                  sample data for demonstration and development purposes.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Features Status</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Implementation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projects Management</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Scene Creation</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Global Search</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Notifications</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quick Actions</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Fallback</span>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}