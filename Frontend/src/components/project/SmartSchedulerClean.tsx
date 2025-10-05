"use client";

import { useState } from "react";
import { Calendar, Zap, DollarSign, Cloud, Users, Settings2, Play, RotateCcw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SmartSchedulerProps {
  projectId: number;
  onScheduleComplete?: () => void;
}

const API_BASE = "http://localhost:8000/api";

export function SmartSchedulerClean({ projectId, onScheduleComplete }: SmartSchedulerProps) {
  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [optimizationMode, setOptimizationMode] = useState("balanced");
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [autoCascade, setAutoCascade] = useState(true);
  const [scenesPerDay, setScenesPerDay] = useState<string>("");
  
  // UI state
  const [isScheduling, setIsScheduling] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const optimizationModes = [
    { value: "cost", label: "💰 Cost", desc: "Minimize costs via billing optimization" },
    { value: "speed", label: "⚡ Speed", desc: "Fastest completion (7 scenes/day)" },
    { value: "balanced", label: "⚙️ Balanced", desc: "Best overall (5 scenes/day)" },
    { value: "quality", label: "👥 Quality", desc: "Max prep time (3 scenes/day)" },
  ];

  const loadPreview = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE}/projects/${projectId}/schedule/optimization-preview?mode=${optimizationMode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to load preview");

      const data = await response.json();
      setPreview(data);
      setShowPreview(true);
      toast.success("Preview loaded!");
    } catch (error) {
      toast.error("Failed to load preview");
      console.error(error);
    }
  };

  const handleAutoSchedule = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsScheduling(true);

    try {
      const token = localStorage.getItem("token");
      const requestBody = {
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        optimization_mode: optimizationMode,
        skip_weekends: skipWeekends,
        auto_cascade: autoCascade,
        scenes_per_day: scenesPerDay ? parseInt(scenesPerDay) : null,
      };

      const response = await fetch(
        `${API_BASE}/projects/${projectId}/schedule/auto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to auto-schedule");
      }

      const result = await response.json();

      toast.success(`✅ ${result.message}`, {
        description: `${result.scheduled_count} scenes in ${result.total_days} days`,
      });

      if (result.conflicts && result.conflicts.length > 0) {
        toast.warning(`⚠️ ${result.conflicts.length} conflicts detected`);
      }

      onScheduleComplete?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to auto-schedule");
      console.error(error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          AI Smart Scheduler
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Intelligent scheduling with actor billing, weather, and location optimization
        </p>
      </div>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Shooting Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Start Date</Label>
              <input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end">End Date</Label>
              <input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Strategy</CardTitle>
          <CardDescription>Choose your priority</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={optimizationMode} onValueChange={setOptimizationMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {optimizationModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="p-3 bg-muted rounded-lg text-sm">
            {optimizationModes.find((m) => m.value === optimizationMode)?.desc}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Skip Weekends</Label>
              <p className="text-xs text-muted-foreground">No shoots on Sat/Sun</p>
            </div>
            <Switch checked={skipWeekends} onCheckedChange={setSkipWeekends} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Cascade</Label>
              <p className="text-xs text-muted-foreground">Auto-reschedule dependent scenes</p>
            </div>
            <Switch checked={autoCascade} onCheckedChange={setAutoCascade} />
          </div>

          <div>
            <Label htmlFor="scenes">Scenes Per Day (Optional)</Label>
            <input
              id="scenes"
              type="number"
              min="1"
              max="10"
              value={scenesPerDay}
              onChange={(e) => setScenesPerDay(e.target.value)}
              placeholder="Auto (5 scenes)"
              className="w-full px-3 py-2 border rounded-md mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Result */}
      {showPreview && preview && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Preview Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-900">{preview.total_scenes}</p>
                <p className="text-xs text-blue-700">Scenes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{preview.estimated_days}</p>
                <p className="text-xs text-blue-700">Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{preview.potential_conflicts}</p>
                <p className="text-xs text-blue-700">Conflicts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Factors Info */}
      <Card>
        <CardHeader>
          <CardTitle>AI Considers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm">Actor billing cycles</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Weather predictions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Actor availability</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm">Location clustering</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={loadPreview}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        
        <Button
          onClick={handleAutoSchedule}
          disabled={isScheduling || !startDate || !endDate}
          className="flex-1"
          size="lg"
        >
          {isScheduling ? (
            <>
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Smart Schedule
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
