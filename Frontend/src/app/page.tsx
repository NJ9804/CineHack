"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Film, Plus, Calendar, DollarSign, AlertTriangle, Loader2, WifiOff } from 'lucide-react';
import { mockProjects, mockAlerts } from '@/services/mock/data';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects] = useState(mockProjects);
  const [alerts] = useState(mockAlerts);

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const totalBudget = projects.reduce((sum, project) => sum + project.estimatedBudget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spentBudget, 0);
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;

  return (
    <Layout title="Production Dashboard" subtitle="Overview of all film projects and operations">
      <div className="space-y-6">
        {/* Data Mode Indicator */}
        {typeof window !== 'undefined' && localStorage.getItem('useMockData') === 'true' && (
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
              <WifiOff className="w-3 h-3 mr-1" />
              Demo Mode - Using Sample Data
            </Badge>
          </div>
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-400">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{(totalBudget / 10000000).toFixed(1)}Cr</div>
              <p className="text-xs text-gray-400">Across all projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{(totalSpent / 10000000).toFixed(1)}Cr</div>
              <p className="text-xs text-gray-400">{((totalSpent / totalBudget) * 100).toFixed(1)}% of total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Active Projects</CardTitle>
              <Film className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeProjects}</div>
              <p className="text-xs text-gray-400">Currently in production</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-pink-600/10 border-red-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{alerts.length}</div>
              <p className="text-xs text-gray-400">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/projects/new">
            <Button variant="cinematic" size="lg" className="w-full sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Start New Project / Movie
            </Button>
          </Link>
          <Link href="/global-costs">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <DollarSign className="w-5 h-5 mr-2" />
              Manage Global Costs
            </Button>
          </Link>
        </div>

        {/* Enhanced Analytics */}
        <DashboardAnalytics projects={projects} alerts={alerts} />

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
            <Link href="/projects">
              <Button variant="ghost" className="text-amber-400 hover:text-amber-300">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <Card key={project.id} className="bg-gray-900/50 border-gray-700 hover:border-amber-500/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{project.title}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'in-progress' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'planning' ? 'bg-blue-500/20 text-blue-400' :
                      project.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Year: {project.year}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-white">₹{(project.estimatedBudget / 10000000).toFixed(1)}Cr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Spent:</span>
                      <span className="text-white">₹{(project.spentBudget / 10000000).toFixed(1)}Cr</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-yellow-600 h-2 rounded-full"
                        style={{ width: `${(project.spentBudget / project.estimatedBudget) * 100}%` }}
                      ></div>
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        View Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <Card key={alert.id} className={`bg-gray-900/50 border-l-4 ${
                alert.severity === 'high' ? 'border-l-red-500' :
                alert.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        alert.severity === 'high' ? 'text-red-400' :
                        alert.severity === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <div>
                        <p className="text-white font-medium">{alert.message}</p>
                        <p className="text-xs text-gray-400 capitalize">{alert.type} Alert</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      alert.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}