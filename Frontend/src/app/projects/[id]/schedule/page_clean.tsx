"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SmartSchedulerClean } from "@/components/project/SmartSchedulerClean";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Zap, List, ArrowLeft, Clock, MapPin, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_BASE = "http://localhost:8000/api";

export default function SchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const projectId = parseInt(params.id);
  
  const [scenes, setScenes] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch scenes
      const scenesRes = await fetch(`${API_BASE}/projects/${projectId}/scenes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (scenesRes.ok) {
        const scenesData = await scenesRes.json();
        setScenes(scenesData);
      }
      
      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/projects/${projectId}/schedule/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Fetch conflicts
      const conflictsRes = await fetch(`${API_BASE}/projects/${projectId}/schedule/conflicts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (conflictsRes.ok) {
        const conflictsData = await conflictsRes.json();
        setConflicts(conflictsData);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500",
      "in-progress": "bg-blue-500",
      shooting: "bg-blue-500",
      planned: "bg-yellow-500",
      unplanned: "bg-gray-400",
    };
    return colors[status] || "bg-gray-400";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: "Completed",
      "in-progress": "In Progress",
      shooting: "Shooting",
      planned: "Planned",
      unplanned: "Unplanned",
    };
    return labels[status] || "Unknown";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Production Schedule</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered scheduling for your production
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Scenes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_scenes}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.scheduled}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats.completion_percentage}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conflicts Alert */}
      {conflicts && conflicts.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-5 h-5" />
              {conflicts.length} Scheduling Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.slice(0, 3).map((conflict: any) => (
                <div key={conflict.id} className="text-sm text-orange-800">
                  • {conflict.message}
                </div>
              ))}
              {conflicts.length > 3 && (
                <p className="text-xs text-orange-700 mt-2">
                  +{conflicts.length - 3} more conflicts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="smart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="smart">
            <Zap className="w-4 h-4 mr-2" />
            AI Smart Scheduler
          </TabsTrigger>
          <TabsTrigger value="scenes">
            <List className="w-4 h-4 mr-2" />
            Scene List ({scenes.length})
          </TabsTrigger>
        </TabsList>

        {/* Smart Scheduler Tab */}
        <TabsContent value="smart" className="mt-6">
          <SmartSchedulerClean
            projectId={projectId}
            onScheduleComplete={() => {
              toast.success("Schedule updated!");
              fetchData();
            }}
          />
        </TabsContent>

        {/* Scene List Tab */}
        <TabsContent value="scenes" className="mt-6">
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading scenes...</p>
            ) : scenes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No scenes found. Add scenes to your project first.
                </CardContent>
              </Card>
            ) : (
              scenes.map((scene: any) => (
                <Card key={scene.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">Scene {scene.scene_number}</Badge>
                          <Badge className={getStatusColor(scene.status || "unplanned")}>
                            {getStatusLabel(scene.status || "unplanned")}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold mb-1">{scene.scene_heading}</h3>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {scene.location_name && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {scene.location_name}
                            </div>
                          )}
                          {scene.time_of_day && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {scene.time_of_day}
                            </div>
                          )}
                          {scene.actors_data && scene.actors_data.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {scene.actors_data.length} actors
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        {scene.scheduled_date ? (
                          <>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Calendar className="w-4 h-4" />
                              {new Date(scene.scheduled_date).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(scene.scheduled_date).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </p>
                          </>
                        ) : (
                          <Badge variant="secondary">Not Scheduled</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
