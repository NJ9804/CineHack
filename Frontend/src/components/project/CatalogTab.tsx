"use client"

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import CatalogActors from './CatalogActors';
import CatalogProps from './CatalogProps';
import CatalogLocations from './CatalogLocations';
import { apiClient } from '@/services/api/client';

interface CatalogTabProps {
  projectId: string;
}

export default function CatalogTab({ projectId }: CatalogTabProps) {
  const [projectUsage, setProjectUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectUsage();
  }, [projectId]);

  const loadProjectUsage = async () => {
    try {
      setLoading(true);
      const usage = await apiClient.getProjectUsedItems(projectId);
      setProjectUsage(usage);
    } catch (error) {
      console.error('Failed to load project usage:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Used Actors</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '-' : projectUsage?.used_actors?.length || 0}
            </div>
            <p className="text-xs text-gray-400">in {projectUsage?.total_scenes || 0} scenes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Used Props</CardTitle>
            <Package className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '-' : projectUsage?.used_props?.length || 0}
            </div>
            <p className="text-xs text-gray-400">required for scenes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Used Locations</CardTitle>
            <MapPin className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? '-' : projectUsage?.used_locations?.length || 0}
            </div>
            <p className="text-xs text-gray-400">shooting locations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-white">
              {loading ? 'Loading...' : 
               projectUsage?.total_scenes > 0 ? 'Ready' : 'No Data'}
            </div>
            <p className="text-xs text-gray-400">script analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Requirements */}
      {!loading && projectUsage && (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-400" />
              Project Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Required Actors */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Actors Needed</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projectUsage.used_actors?.length > 0 ? (
                    projectUsage.used_actors.map((actor: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {actor}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No actors identified from script</p>
                  )}
                </div>
              </div>

              {/* Required Props */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Props Needed</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projectUsage.used_props?.length > 0 ? (
                    projectUsage.used_props.map((prop: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                        {prop}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No props identified from script</p>
                  )}
                </div>
              </div>

              {/* Required Locations */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Locations Needed</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projectUsage.used_locations?.length > 0 ? (
                    projectUsage.used_locations.map((location: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        {location}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No locations identified from script</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="actors" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-700">
          <TabsTrigger 
            value="actors" 
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            Actors
          </TabsTrigger>
          <TabsTrigger 
            value="props" 
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            Props
          </TabsTrigger>
          <TabsTrigger 
            value="locations" 
            className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            Locations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actors" className="mt-6">
          <CatalogActors projectId={projectId} />
        </TabsContent>

        <TabsContent value="props" className="mt-6">
          <CatalogProps projectId={projectId} />
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <CatalogLocations projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
