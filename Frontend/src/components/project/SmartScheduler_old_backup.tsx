"use client";

import { useState } from "react";
import { Calendar, Zap, DollarSign, Cloud, Users, AlertTriangle, Settings2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SmartSchedulerProps {
  projectId: number;
  onScheduleComplete?: () => void;
}

export function SmartScheduler({ projectId, onScheduleComplete }: SmartSchedulerProps) {
  const [optimizationMode, setOptimizationMode] = useState("balanced");
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [autoCascade, setAutoCascade] = useState(true);
  const [scenesPerDay, setScenesPerDay] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const optimizationModes = [
    {
      value: "cost",
      label: "Cost Optimization",
      description: "Minimize costs by grouping actors with weekly/monthly billing",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      value: "speed",
      label: "Speed Optimization",
      description: "Complete shoot fastest (7 scenes/day, parallel locations)",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      value: "balanced",
      label: "Balanced",
      description: "Balance cost, time, and quality (recommended)",
      icon: Settings2,
      color: "text-blue-500",
    },
    {
      value: "quality",
      label: "Quality Focus",
      description: "Fewer scenes per day, better preparation time",
      icon: Users,
      color: "text-purple-500",
    },
  ];

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/schedule/optimization-preview?mode=${optimizationMode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load preview");

      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to load preview");
    } finally {
      setIsLoadingPreview(false);
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
        scenes_per_day: scenesPerDay,
      };

      const response = await fetch(
        `http://localhost:8000/api/projects/${projectId}/schedule/auto`,
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

      toast.success(
        `✅ ${result.message}`,
        {
          description: `Scheduled ${result.scheduled_count} scenes in ${result.total_days} days`,
          duration: 5000,
        }
      );

      if (result.conflicts && result.conflicts.length > 0) {
        toast.warning(
          `⚠️ ${result.conflicts.length} potential conflicts detected`,
          {
            description: "Check the schedule page for details",
          }
        );
      }

      onScheduleComplete?.();
    } catch (error: any) {
      console.error("Auto-schedule error:", error);
      toast.error(error.message || "Failed to auto-schedule scenes");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Smart Scheduling</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligent scheduling considering actor billing, weather, and location optimization
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={loadPreview} disabled={isLoadingPreview}>
              <Zap className="w-4 h-4 mr-2" />
              {isLoadingPreview ? "Loading..." : "Preview"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scheduling Preview</DialogTitle>
              <DialogDescription>
                What the AI scheduler will do with current settings
              </DialogDescription>
            </DialogHeader>
            {preview && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Scenes</p>
                    <p className="text-2xl font-bold">{preview.total_scenes}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimated Days</p>
                    <p className="text-2xl font-bold">{preview.estimated_days}</p>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completion Date</p>
                  <p className="font-medium">
                    {preview.completion_date
                      ? new Date(preview.completion_date).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                {preview.potential_conflicts > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        {preview.potential_conflicts} potential conflicts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Project Timeline
          </CardTitle>
          <CardDescription>
            Select the shoot start and end dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Strategy</CardTitle>
          <CardDescription>
            Choose how the AI should prioritize scheduling decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={optimizationMode} onValueChange={setOptimizationMode}>
            <SelectTrigger>
              <SelectValue placeholder="Select optimization mode" />
            </SelectTrigger>
            <SelectContent>
              {optimizationModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${mode.color}`} />
                      <span>{mode.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {/* Display selected mode description */}
          {optimizationModes.find((m) => m.value === optimizationMode) && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                {optimizationModes.find((m) => m.value === optimizationMode)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>
            Fine-tune the scheduling algorithm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Skip Weekends</Label>
              <p className="text-sm text-muted-foreground">
                Don't schedule shoots on Saturdays and Sundays
              </p>
            </div>
            <Switch checked={skipWeekends} onCheckedChange={setSkipWeekends} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Cascade Changes</Label>
              <p className="text-sm text-muted-foreground">
                Automatically reschedule dependent scenes when changes occur
              </p>
            </div>
            <Switch checked={autoCascade} onCheckedChange={setAutoCascade} />
          </div>

          <div>
            <Label htmlFor="scenes-per-day">Scenes Per Day (Optional)</Label>
            <input
              id="scenes-per-day"
              type="number"
              min="1"
              max="10"
              value={scenesPerDay || ""}
              onChange={(e) => setScenesPerDay(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Auto (5 scenes/day)"
              className="w-full px-3 py-2 border rounded-md mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for automatic adjustment based on optimization mode
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Factors */}
      <Card>
        <CardHeader>
          <CardTitle>AI Considers These Factors</CardTitle>
          <CardDescription>
            Intelligent decision-making for optimal scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Actor Billing Cycles</p>
                <p className="text-sm text-muted-foreground">
                  Groups actors with weekly/monthly billing to minimize costs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cloud className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Weather Predictions</p>
                <p className="text-sm text-muted-foreground">
                  Schedules outdoor scenes during suitable weather conditions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium">Actor Availability</p>
                <p className="text-sm text-muted-foreground">
                  Respects actor schedules and availability windows
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Settings2 className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Location Clustering</p>
                <p className="text-sm text-muted-foreground">
                  Minimizes travel by grouping scenes at same location
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAutoSchedule}
          disabled={isScheduling || !startDate || !endDate}
          size="lg"
          className="flex-1"
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
