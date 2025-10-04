"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScenesTabEnhanced from '@/components/project/ScenesTabEnhanced';
import CatalogTab from '@/components/project/CatalogTab';
import ScheduleTab from '@/components/project/ScheduleTab';
import BudgetTabEnhanced from '@/components/project/BudgetTabEnhanced';
import CharactersTab from '@/components/project/CharactersTab';
import RisksTab from '@/components/project/RisksTab';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Film, 
  MapPin,
  Clock,
  Target,
  Shield,
  Loader2
} from 'lucide-react';
import { mockCharacters, mockScenes, mockBudget, mockAlerts, mockActors } from '@/services/mock/data';
import { apiClient } from '@/services/api/client';
import { Project } from '@/lib/types';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);

  useEffect(() => {
    async function loadProjectData() {
      try {
        setLoading(true);
        
        // Load project details
        const projectData = await apiClient.getProject(projectId);
        
        // Map backend fields to frontend Project type
        const mappedProject: Project = {
          id: projectData.id,
          title: projectData.name || projectData.title,
          year: projectData.start_date ? new Date(projectData.start_date).getFullYear() : new Date().getFullYear(),
          estimatedBudget: projectData.budget_total || 0,
          spentBudget: projectData.budget_used || 0,
          status: projectData.status === 'planning' ? 'planning' : 
                  projectData.status === 'pre_production' ? 'in-progress' : 
                  projectData.status === 'completed' ? 'completed' : 'planning',
          synopsis: projectData.description || projectData.synopsis,
          createdAt: projectData.created_at || new Date().toISOString()
        };
        
        setProject(mappedProject);
        
        // Try to load dashboard data (which includes scenes and script info)
        try {
          const dashboardData = await apiClient.getProjectDashboard(projectId);
          setDashboard(dashboardData);
          setScenes(dashboardData.scenes || []);
          
          // Extract characters from scenes
          const allCharacters = new Set();
          dashboardData.scenes?.forEach((scene: any) => {
            if (scene.actors_data) {
              scene.actors_data.forEach((actor: any) => {
                if (actor.name) {
                  allCharacters.add(actor.name);
                }
              });
            }
          });
          setCharacters(Array.from(allCharacters).map((name, index) => ({
            id: index + 1,
            name,
            actorId: null,
            role: 'main'
          })));
        } catch (dashboardError) {
          console.warn('Could not load dashboard data:', dashboardError);
          // Fallback to loading scenes separately
          try {
            const scenesData = await apiClient.getScenes(projectId);
            setScenes(scenesData || []);
          } catch (scenesError) {
            console.warn('Could not load scenes:', scenesError);
          }
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error loading project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    
    loadProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout title="Project Not Found">
        <div className="text-center py-12">
          <Card className="bg-red-500/10 border-red-500/20 max-w-md mx-auto">
            <CardContent className="p-6">
              <h2 className="text-xl text-white mb-2">Project not found</h2>
              <p className="text-gray-400 mb-4">{error || 'The project you are looking for does not exist.'}</p>
              <Link href="/projects">
                <Button variant="outline">Back to Projects</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  };

  const completedScenes = scenes.filter(s => s.status === 'completed').length;
  const budgetUsed = project?.spentBudget || 0;
  const budgetTotal = project?.estimatedBudget || 0;
  const budgetPercentage = budgetTotal > 0 ? ((budgetUsed / budgetTotal) * 100).toFixed(1) : '0.0';
  
  // Calculate alerts based on real data
  const alerts = [];
  if (scenes.length === 0) {
    alerts.push({ id: '1', type: 'scheduling' as const, severity: 'medium' as const, message: 'No scenes found. Upload a script to get started.' });
  }
  if (characters.length === 0) {
    alerts.push({ id: '2', type: 'scheduling' as const, severity: 'low' as const, message: 'No characters extracted yet.' });
  }
  if (budgetTotal === 0) {
    alerts.push({ id: '3', type: 'budget' as const, severity: 'medium' as const, message: 'Budget not set for this project.' });
  }

  return (
    <Layout title={project.title} subtitle={`${project.year} • ${project.status.replace('-', ' ')}`}>
      <div className="space-y-6">
        {/* Project Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Total Scenes</CardTitle>
              <Film className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboard?.summary?.total_scenes || scenes.length}</div>
              <p className="text-xs text-gray-400">{completedScenes} completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Budget Used</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{budgetPercentage}%</div>
              <p className="text-xs text-gray-400">{formatCurrency(budgetUsed)} of {formatCurrency(budgetTotal)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">Characters</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboard?.summary?.characters?.length || characters.length}</div>
              <p className="text-xs text-gray-400">{characters.filter(c => c.actorId).length} cast</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-400">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dashboard?.summary?.locations?.length || 0}</div>
              <p className="text-xs text-gray-400">unique locations</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gray-900 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="scenes" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Scenes
            </TabsTrigger>
            <TabsTrigger value="catalog" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Catalog
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Schedule
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Budget
            </TabsTrigger>
            <TabsTrigger value="characters" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Characters
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Risks
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Project Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Script Analysis Status */}
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Film className="w-5 h-5 mr-2 text-blue-400" />
                    Script Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.summary?.has_script ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{dashboard.summary.total_scenes}</div>
                      <p className="text-xs text-gray-400">Total Scenes</p>
                      <div className="flex gap-4 text-xs">
                        <span className="text-blue-400">{dashboard.summary.indoor_scenes} Indoor</span>
                        <span className="text-green-400">{dashboard.summary.outdoor_scenes} Outdoor</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-lg text-gray-400 mb-2">No Script Uploaded</div>
                      <p className="text-xs text-gray-500">Upload a PDF script to begin analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Locations Summary */}
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-400" />
                    Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.summary?.locations?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{dashboard.summary.locations.length}</div>
                      <p className="text-xs text-gray-400">Unique Locations</p>
                      <div className="text-xs text-gray-300 max-h-12 overflow-hidden">
                        {dashboard.summary.locations.slice(0, 2).join(', ')}
                        {dashboard.summary.locations.length > 2 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-lg text-gray-400 mb-2">0</div>
                      <p className="text-xs text-gray-500">No locations identified</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Characters Summary */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-400" />
                    Characters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.summary?.characters?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">{dashboard.summary.characters.length}</div>
                      <p className="text-xs text-gray-400">Characters Found</p>
                      <div className="text-xs text-gray-300 max-h-12 overflow-hidden">
                        {dashboard.summary.characters.slice(0, 3).join(', ')}
                        {dashboard.summary.characters.length > 3 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-lg text-gray-400 mb-2">0</div>
                      <p className="text-xs text-gray-500">No characters extracted</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Script Files */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Film className="w-5 h-5 mr-2 text-amber-400" />
                    Script Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.scripts?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.scripts.map((script: any) => (
                        <div key={script.id} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium truncate">{script.filename}</p>
                            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                              {script.total_scenes} scenes
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Uploaded: {new Date(script.created_at).toLocaleDateString()}
                          </p>
                          {script.summary && typeof script.summary === 'object' && (
                            <div className="text-xs text-gray-300 mt-2">
                              <div className="flex gap-4">
                                <span>{script.summary.total_scenes} scenes</span>
                                <span>{script.summary.main_characters?.length || 0} characters</span>
                                <span>{script.summary.primary_locations?.length || 0} locations</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-2">No scripts uploaded</p>
                      <p className="text-sm text-gray-500">Upload a PDF script to get started with scene analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Scenes */}
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-amber-400" />
                    Recent Scenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.scenes?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.scenes.slice(0, 5).map((scene: any) => (
                        <div key={scene.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              Scene {scene.scene_number}: {scene.scene_heading}
                            </p>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{scene.location_name}</span>
                              {scene.time_of_day && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{scene.time_of_day}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-3 flex flex-col items-end">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              scene.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              scene.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {scene.status?.replace('_', ' ')}
                            </span>
                            {scene.estimated_cost > 0 && (
                              <span className="text-xs text-amber-400 mt-1">
                                ₹{(scene.estimated_cost / 100000).toFixed(1)}L
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View All Scenes
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-2">No scenes found</p>
                      <p className="text-sm text-gray-500">Upload a script to extract scenes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Budget Summary */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-amber-400" />
                  Budget Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.estimatedBudget > 0 || project.spentBudget > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{formatCurrency(project.estimatedBudget)}</div>
                        <p className="text-sm text-gray-400">Total Budget</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(budgetUsed)}</div>
                        <p className="text-sm text-gray-400">Spent</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-400">{formatCurrency(budgetTotal - budgetUsed)}</div>
                        <p className="text-sm text-gray-400">Remaining</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 mt-4">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full"
                        style={{ width: `${budgetTotal > 0 ? (budgetUsed / budgetTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    {dashboard?.scenes && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Estimated Scene Costs:</p>
                        <div className="text-xs text-gray-300">
                          Total from scenes: ₹{(dashboard.scenes.reduce((sum: number, scene: any) => sum + (scene.estimated_cost || 0), 0) / 100000).toFixed(1)}L
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-2">No budget information</p>
                    <p className="text-sm text-gray-500">Set a budget for this project to track expenses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Functional Tabs */}
          <TabsContent value="scenes" className="mt-6">
            <ScenesTabEnhanced projectId={projectId} />
          </TabsContent>

          <TabsContent value="catalog" className="mt-6">
            <CatalogTab projectId={projectId} />
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <ScheduleTab projectId={projectId} scenes={scenes} schedule={[]} alerts={alerts} />
          </TabsContent>

          <TabsContent value="budget" className="mt-6">
            <BudgetTabEnhanced projectId={projectId} />
          </TabsContent>

          <TabsContent value="characters" className="mt-6">
            <CharactersTab projectId={projectId} characters={characters} />
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <RisksTab projectId={projectId} alerts={alerts} scenes={scenes} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}