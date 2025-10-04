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
import PromotionsTab from '@/components/project/PromotionsTab';
import { TicketList, TicketDashboard, TicketWidget } from '@/components/project/tickets';
import { 
  Users, 
  DollarSign, 
  Film, 
  MapPin,
  Clock,
  Target,
  Loader2
} from 'lucide-react';
import { mockCharacters, mockScenes, mockAlerts } from '@/services/mock/data';
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
        
        // Try to load dashboard data (which includes summary info)
        try {
          const dashboardData = await apiClient.getProjectDashboard(projectId);
          setDashboard(dashboardData);
          
          // Extract characters from full scenes (we'll load these separately)
          // For now, extract from dashboard scenes, but we'll override with full scenes
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
        }
        
        // Always load full scenes data (dashboard only has 10 scenes, we need all 40)
        try {
          console.log('Loading full scenes data...');
          const scenesData = await apiClient.getScenes(projectId);
          console.log('Loaded scenes count:', scenesData?.length);
          
          // Map backend scene data to frontend Scene interface
          const mappedScenes = scenesData?.map((backendScene: any) => ({
            id: backendScene.id.toString(), // Convert number to string
            number: parseInt(backendScene.scene_number?.replace(/\D/g, '') || '0'), // Extract number from "SCENE 1"
            name: backendScene.scene_heading || backendScene.scene_number || 'Untitled Scene',
            location: backendScene.location_name || 'Unknown Location',
            characters: backendScene.actors_data?.map((actor: any) => actor.name).filter(Boolean) || [],
            estimatedBudget: backendScene.estimated_cost || 0,
            properties: backendScene.props_data || [],
            equipment: [], // Backend doesn't have this field, default to empty
            status: backendScene.status || 'unplanned',
            alerts: [] // Backend doesn't have this field, default to empty
          })) || [];
          
          console.log('Mapped scenes:', mappedScenes.slice(0, 3)); // Log first 3 for debugging
          setScenes(mappedScenes);
        } catch (scenesError) {
          console.warn('Could not load full scenes:', scenesError);
          // Fallback to loading scenes separately
          try {
            const scenesData = await apiClient.getScenes(projectId);
            setScenes(scenesData || []);
          } catch (scenesError) {
            console.warn('Could not load scenes:', scenesError);
            // Fallback to mock data for development
            console.log('Using mock scenes data');
            console.log('Mock scenes:', mockScenes);
            setScenes(mockScenes);
            setCharacters(mockCharacters);
          }
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error loading project:', err);
        
        // Fallback to mock data for development
        console.log('Using fallback mock data due to API error');
        setScenes(mockScenes);
        setCharacters(mockCharacters);
        
        // Create a mock project
        const mockProject: Project = {
          id: projectId,
          title: 'Mukundan Unni Associates',
          year: 2025,
          estimatedBudget: 540000000, // 54 Cr
          spentBudget: 0,
          status: 'in-progress',
          synopsis: 'A thrilling drama project',
          createdAt: new Date().toISOString()
        };
        setProject(mockProject);
        
        setError(null); // Don't show error since we have fallback data
      } finally {
        setLoading(false);
      }
    }
    
    loadProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <Layout title="🎬 Loading Project...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 max-w-md shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-accent-primary animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-accent-secondary mb-2">Loading Project Details...</h3>
              <p className="text-text-secondary">Gathering production information</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout title="🎬 Project Not Found">
        <div className="text-center py-12">
          <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-2xl backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h2 className="text-xl font-bold text-accent-primary mb-2">Project Not Found</h2>
              <p className="text-text-secondary mb-6">{error || 'The project you are looking for does not exist.'}</p>
              <Link href="/projects">
                <Button variant="cinematic">
                  🎬 Back to Projects
                </Button>
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
  
  // If we're using mock data, include mock alerts
  if (scenes === mockScenes) {
    alerts.push(...mockAlerts);
  }
  
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
    <Layout title={`🎬 ${project.title}`} subtitle={`${project.year} • ${project.status.replace('-', ' ')}`}>
      <div className="space-y-8">
        {/* Project Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-accent-secondary mb-2">
            🎭 {project.title}
          </h1>
          <p className="text-text-secondary text-lg">
            {project.year} Production • {project.status === 'in-progress' ? '🎬 Currently Filming' : 
             project.status === 'planning' ? '📋 In Planning' : 
             project.status === 'completed' ? '✅ Completed' : project.status}
          </p>
          {project.synopsis && (
            <p className="text-text-secondary/80 mt-2 max-w-2xl mx-auto">
              {project.synopsis}
            </p>
          )}
        </div>

        {/* Quick Access Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-accent-brown/10 border-accent-primary/30 backdrop-blur-sm">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Target className="w-8 h-8 text-accent-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-accent-secondary">🎯 Production Stages</h3>
                    <p className="text-text-secondary">Track production timeline</p>
                  </div>
                </div>
                <Link href={`/projects/${projectId}/production-stages`}>
                  <Button variant="cinematic" size="lg" className="hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5 mr-2" />
                    View Timeline
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-green-500/30 backdrop-blur-sm">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Film className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold text-accent-secondary">🎬 Operations</h3>
                    <p className="text-text-secondary">Rentals, Hotels, Catering & More</p>
                  </div>
                </div>
                <Link href={`/projects/${projectId}/operations`}>
                  <Button variant="cinematic" size="lg" className="hover:scale-105 transition-transform bg-green-600 hover:bg-green-700">
                    <Target className="w-5 h-5 mr-2" />
                    Manage Operations
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Project Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">🎬 Total Scenes</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Script breakdown</p>
              </div>
              <div className="p-3 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors">
                <Film className="h-6 w-6 text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-primary mb-1">{dashboard?.summary?.total_scenes || scenes.length}</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">✅</span>
                {completedScenes} completed scenes
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-bg to-accent-secondary/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">💰 Budget Usage</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Financial tracking</p>
              </div>
              <div className="p-3 bg-accent-secondary/20 rounded-full group-hover:bg-accent-secondary/30 transition-colors">
                <DollarSign className="h-6 w-6 text-accent-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-secondary mb-1">{budgetPercentage}%</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">💸</span>
                {formatCurrency(budgetUsed)} of {formatCurrency(budgetTotal)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-bg to-accent-primary/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">🎭 Characters</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Cast & crew</p>
              </div>
              <div className="p-3 bg-accent-brown/20 rounded-full group-hover:bg-accent-brown/30 transition-colors">
                <Users className="h-6 w-6 text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-primary mb-1">{dashboard?.summary?.characters?.length || characters.length}</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">🎪</span>
                {characters.filter(c => c.actorId).length} actors cast
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">📍 Locations</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Filming sites</p>
              </div>
              <div className="p-3 bg-accent-secondary/20 rounded-full group-hover:bg-accent-secondary/30 transition-colors">
                <MapPin className="h-6 w-6 text-accent-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-secondary mb-1">{dashboard?.summary?.locations?.length || 0}</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">🗺️</span>
                unique locations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Project Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-9 bg-gray-900 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="scenes" className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium">
              🎬 Scenes
            </TabsTrigger>
            <TabsTrigger value="catalog" className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium">
              📋 Catalog
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium">
              📅 Schedule
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium">
              💰 Budget
            </TabsTrigger>
            <TabsTrigger value="characters" className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium">
              👥 Characters
            </TabsTrigger>
            <TabsTrigger value="promotions" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Promotions
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-accent-primary/30 data-[state=active]:text-accent-primary text-text-secondary font-medium">
              🎫 Tickets
            </TabsTrigger>
            <TabsTrigger value="risks" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
              Risks
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Enhanced Project Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Script Analysis Status */}
              <Card className="bg-gradient-to-br from-secondary-bg to-accent-primary/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center">
                    <Film className="w-6 h-6 mr-3 text-accent-primary" />
                    🎬 Script Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.summary?.has_script ? (
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-accent-primary">{dashboard.summary.total_scenes}</div>
                      <p className="text-sm text-text-secondary">Total Scenes Extracted</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-accent-secondary">🏠 {dashboard.summary.indoor_scenes} Indoor</span>
                        <span className="text-accent-primary">🌅 {dashboard.summary.outdoor_scenes} Outdoor</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-6xl mb-3">📄</div>
                      <div className="text-lg text-accent-primary mb-2">No Script Uploaded</div>
                      <p className="text-sm text-text-secondary">Upload a PDF script to begin analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Locations Summary */}
              <Card className="bg-gradient-to-br from-secondary-bg to-accent-secondary/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-accent-secondary" />
                    📍 Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.summary?.locations?.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-accent-secondary">{dashboard.summary.locations.length}</div>
                      <p className="text-sm text-text-secondary">Unique Filming Locations</p>
                      <div className="text-sm text-accent-primary max-h-12 overflow-hidden">
                        {dashboard.summary.locations.slice(0, 2).join(', ')}
                        {dashboard.summary.locations.length > 2 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-6xl mb-3">🗺️</div>
                      <div className="text-lg text-accent-secondary mb-2">0</div>
                      <p className="text-sm text-text-secondary">No locations identified</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Characters Summary */}
              <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center">
                    <Users className="w-6 h-6 mr-3 text-accent-brown" />
                    🎭 Characters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.summary?.characters?.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-3xl font-bold text-accent-brown">{dashboard.summary.characters.length}</div>
                      <p className="text-sm text-text-secondary">Characters Found</p>
                      <div className="text-sm text-accent-primary max-h-12 overflow-hidden">
                        {dashboard.summary.characters.slice(0, 3).join(', ')}
                        {dashboard.summary.characters.length > 3 && '...'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-6xl mb-3">🎪</div>
                      <div className="text-lg text-accent-brown mb-2">0</div>
                      <p className="text-sm text-text-secondary">No characters extracted</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Script Files */}
              <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center">
                    <Film className="w-6 h-6 mr-3 text-accent-primary" />
                    📄 Script Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.scripts?.length > 0 ? (
                    <div className="space-y-4">
                      {dashboard.scripts.map((script: any) => (
                        <div key={script.id} className="p-4 bg-primary-bg/50 rounded-lg border border-accent-brown/20 hover:border-accent-primary/30 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-accent-secondary font-semibold truncate flex items-center">
                              📄 {script.filename}
                            </p>
                            <span className="text-xs text-accent-primary bg-accent-primary/20 px-3 py-1 rounded-full font-medium">
                              {script.total_scenes} scenes
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary mb-2">
                            📅 Uploaded: {new Date(script.created_at).toLocaleDateString()}
                          </p>
                          {script.summary && typeof script.summary === 'object' && (
                            <div className="text-sm text-accent-primary">
                              <div className="flex gap-4">
                                <span>🎬 {script.summary.total_scenes} scenes</span>
                                <span>🎭 {script.summary.main_characters?.length || 0} characters</span>
                                <span>📍 {script.summary.primary_locations?.length || 0} locations</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-accent-primary mb-2 font-semibold">No scripts uploaded</p>
                      <p className="text-sm text-text-secondary">Upload a PDF script to get started with scene analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Recent Scenes */}
              <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-accent-secondary flex items-center">
                    <Clock className="w-6 h-6 mr-3 text-accent-secondary" />
                    🎬 Recent Scenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboard?.scenes?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboard.scenes.slice(0, 5).map((scene: any) => (
                        <div key={scene.id} className="flex items-center justify-between p-3 bg-primary-bg/50 rounded-lg border border-accent-brown/20 hover:border-accent-primary/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-accent-secondary font-medium truncate">
                              🎬 Scene {scene.scene_number}: {scene.scene_heading}
                            </p>
                            <div className="flex items-center text-sm text-text-secondary mt-1">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-accent-primary" />
                              <span className="truncate">{scene.location_name}</span>
                              {scene.time_of_day && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>🕐 {scene.time_of_day}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-3 flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              scene.status === 'completed' ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' :
                              scene.status === 'in_progress' ? 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30' :
                              'bg-accent-brown/20 text-accent-brown border border-accent-brown/30'
                            }`}>
                              {scene.status === 'completed' ? '✅ Complete' :
                               scene.status === 'in_progress' ? '🎬 Filming' :
                               '📋 Planning'}
                            </span>
                            {scene.estimated_cost > 0 && (
                              <span className="text-sm text-accent-primary mt-1 font-medium">
                                💰 ₹{(scene.estimated_cost / 100000).toFixed(1)}L
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-4 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-all duration-300">
                        🎭 View All Scenes
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-accent-primary mb-2 font-semibold">No scenes found</p>
                      <p className="text-sm text-text-secondary">Upload a script to extract scenes</p>
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

          <TabsContent value="promotions" className="mt-6">
            <PromotionsTab projectId={projectId} projectName={project.title} />
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <div className="space-y-6">
              {/* Ticket Widget Summary */}
              <TicketWidget 
                projectId={parseInt(projectId)}
                compact={false}
              />
              
              {/* Full Ticket List */}
              <TicketList projectId={parseInt(projectId)} />
            </div>
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <RisksTab projectId={projectId} alerts={alerts} scenes={scenes} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}