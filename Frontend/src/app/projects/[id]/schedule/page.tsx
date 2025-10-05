"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartScheduler } from "@/components/project/SmartScheduler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Zap, List, ArrowLeft, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function SchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const projectId = parseInt(params.id);
  const [scenes, setScenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchScenes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/scenes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch scenes");
      
      const data = await response.json();
      setScenes(data);
    } catch (error) {
      console.error("Error fetching scenes:", error);
      toast.error("Failed to load scenes");
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/schedule/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
    fetchStats();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'shooting':
      case 'in-progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/projects/${projectId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Production Schedule</h1>
              <p className="text-muted-foreground">
                AI-powered intelligent scheduling with cost optimization
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Scenes</p>
                  <p className="text-2xl font-bold">{stats.total_scenes}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Scheduled</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Progress</p>
                  <p className="text-2xl font-bold">{stats.completion_percentage}%</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs defaultValue="smart" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="smart">
              <Zap className="w-4 h-4 mr-2" />
              AI Smart Scheduler
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="w-4 h-4 mr-2" />
              Scene List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="mt-6">
            <SmartScheduler 
              projectId={projectId}
              onScheduleComplete={() => {
                toast.success("Schedule updated successfully!");
                fetchScenes();
                fetchStats();
              }}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Scenes</CardTitle>
                <CardDescription>
                  {scenes.length} scenes in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading scenes...</p>
                  </div>
                ) : scenes.length === 0 ? (
                  <div className="text-center py-8">
                    <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No scenes found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {scenes.map((scene: any) => (
                      <div
                        key={scene.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">Scene {scene.scene_number}</h3>
                              <Badge
                                className={`${getStatusColor(scene.status)} text-white`}
                              >
                                {scene.status || 'unplanned'}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {scene.scene_heading || 'No heading'}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm">
                              {scene.scheduled_date && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {new Date(scene.scheduled_date).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                              
                              {scene.location_name && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{scene.location_name}</span>
                                </div>
                              )}
                              
                              {scene.actors_data && scene.actors_data.length > 0 && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>{scene.actors_data.length} actors</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right ml-4">
                            {scene.location_type && (
                              <Badge variant="outline">
                                {scene.location_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
