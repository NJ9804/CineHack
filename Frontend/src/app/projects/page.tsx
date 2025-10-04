"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Plus, Calendar, DollarSign, Filter, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api/client';
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load projects from API
  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const data = await apiClient.getProjects();
        
        // Map backend fields to frontend Project type
        const mappedProjects = data.map((p: any) => ({
          id: p.id.toString(),
          title: p.name, // Backend returns 'name', frontend expects 'title'
          year: p.created_at ? new Date(p.created_at).getFullYear() : new Date().getFullYear(),
          estimatedBudget: p.budget_total || 0,
          spentBudget: p.budget_used || 0,
          status: (p.status === 'planning' ? 'planning' : 
                  p.status === 'in-progress' ? 'in-progress' : 
                  p.status === 'completed' ? 'completed' : 'on-hold') as 'planning' | 'in-progress' | 'completed' | 'on-hold',
          createdAt: p.created_at || new Date().toISOString(),
        }));
        
        setProjects(mappedProjects);
        setError(null);
      } catch (err: any) {
        console.error('Error loading projects:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    'planning': 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30',
    'in-progress': 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30',
    'completed': 'bg-accent-brown/20 text-accent-secondary border border-accent-brown/30',
    'on-hold': 'bg-accent-brown/30 text-accent-primary border border-accent-brown/40'
  };

  const getStatusEmoji = (status: string) => {
    switch(status) {
      case 'planning': return '📋';
      case 'in-progress': return '🎬';
      case 'completed': return '✅';
      case 'on-hold': return '⏸️';
      default: return '📽️';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  };

  return (
    <Layout title="🎬 Film Projects" subtitle="All film projects and their current status">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 max-w-md shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-accent-primary animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-accent-secondary mb-2">Loading Projects...</h3>
              <p className="text-text-secondary">Gathering your film productions</p>
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-2xl backdrop-blur-sm max-w-md">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎭</div>
              <h3 className="text-lg font-bold text-accent-primary mb-2">Connection Issue</h3>
              <p className="text-text-secondary mb-4">{error}</p>
              <Button 
                variant="cinematic" 
                onClick={() => window.location.reload()}
              >
                🎬 Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-accent-secondary mb-2">
            🎬 Your Film Portfolio
          </h1>
          <p className="text-text-secondary text-lg">
            Managing {projects.length} productions worth ₹{(projects.reduce((sum, p) => sum + p.estimatedBudget, 0) / 10000000).toFixed(1)}Cr
          </p>
        </div>

        {/* Enhanced Header Actions */}
        <Card className="bg-gradient-to-r from-secondary-bg/60 to-primary-bg/40 border-accent-brown/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Enhanced Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-primary w-5 h-5" />
                  <Input 
                    placeholder="🔍 Search projects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 bg-primary-bg/50 border-accent-brown/30 text-accent-secondary placeholder-text-secondary/50 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 h-12"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-text-secondary hover:text-accent-primary"
                    >
                      ×
                    </Button>
                  )}
                </div>

                {/* Enhanced Status Filter */}
                <div className="flex gap-3">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-primary-bg/50 border border-accent-brown/30 rounded-lg text-accent-secondary text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30"
                  >
                    <option value="all">🎭 All Status</option>
                    <option value="planning">📋 Planning</option>
                    <option value="in-progress">🎬 Filming</option>
                    <option value="completed">✅ Completed</option>
                    <option value="on-hold">⏸️ On Hold</option>
                  </select>
                  
                  {/* Quick Filter Button */}
                  <Button
                    variant={statusFilter === 'in-progress' ? 'cinematic' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(statusFilter === 'in-progress' ? 'all' : 'in-progress')}
                    className="whitespace-nowrap border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg"
                  >
                    🎥 Active Only
                  </Button>
                </div>
              </div>

              <Link href="/projects/new">
                <Button variant="cinematic" size="lg" className="hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 mr-2" />
                  🎬 New Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: '🎭 Total Projects', value: projects.length, icon: '🎬', color: 'from-accent-primary/20 to-accent-secondary/20' },
            { label: '🎥 Currently Filming', value: projects.filter(p => p.status === 'in-progress').length, icon: '🎬', color: 'from-accent-secondary/20 to-accent-primary/20' },
            { label: '📋 In Planning', value: projects.filter(p => p.status === 'planning').length, icon: '📝', color: 'from-accent-brown/20 to-accent-secondary/20' },
            { label: '✅ Completed', value: projects.filter(p => p.status === 'completed').length, icon: '🏆', color: 'from-accent-secondary/20 to-accent-brown/20' }
          ].map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-medium text-accent-secondary">{stat.label}</CardTitle>
                  <p className="text-xs text-text-secondary mt-1">Production count</p>
                </div>
                <div className="p-3 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors">
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent-primary mb-1">{stat.value}</div>
                <div className="flex items-center text-sm text-text-secondary">
                  <span className="mr-2">📊</span>
                  {stat.value === 0 ? 'None currently' : 
                   stat.value === 1 ? '1 project' : 
                   `${stat.value} projects`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-accent-secondary flex items-center">
                🎭 Project Portfolio
                <span className="ml-3 px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm font-medium">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </h2>
              <p className="text-text-secondary mt-1">Your film productions and their current status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const progressPercent = (project.spentBudget / project.estimatedBudget) * 100;
              
              return (
                <Card key={project.id} className="bg-secondary-bg border-accent-brown hover:border-accent-primary transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-accent-secondary text-lg group-hover:text-accent-primary transition-colors flex items-center">
                          {getStatusEmoji(project.status)}
                          <span className="ml-2">{project.title}</span>
                        </CardTitle>
                        <p className="text-sm text-text-secondary mt-2">🗓️ {project.year} Production</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                        {getStatusEmoji(project.status)} {project.status === 'in-progress' ? 'Filming' :
                         project.status === 'planning' ? 'Planning' :
                         project.status === 'completed' ? 'Complete' :
                         project.status === 'on-hold' ? 'On Hold' : project.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Budget Information */}
                      <div className="bg-primary-bg/50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm flex items-center">
                            💰 Total Budget:
                          </span>
                          <span className="text-accent-primary font-bold">{formatCurrency(project.estimatedBudget)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm flex items-center">
                            💸 Money Spent:
                          </span>
                          <span className="text-accent-secondary font-bold">{formatCurrency(project.spentBudget)}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-text-secondary">Budget Usage</span>
                            <span className="text-accent-primary font-medium">{progressPercent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-primary-bg rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-accent-primary to-accent-secondary h-3 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-text-secondary">
                            {progressPercent < 50 ? '🟢 Budget on track' :
                             progressPercent < 80 ? '🟡 Monitor spending' :
                             progressPercent < 100 ? '🟠 Near budget limit' :
                             '🔴 Over budget'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-accent-brown/30">
                        <div className="text-center">
                          <div className="text-lg font-bold text-accent-primary">--</div>
                          <div className="text-xs text-text-secondary">🎬 Scenes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-accent-secondary">--</div>
                          <div className="text-xs text-text-secondary">📅 Days</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/projects/${project.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-all duration-300">
                            🎯 View Details
                          </Button>
                        </Link>
                        <Link href={`/projects/${project.id}/scenes`}>
                          <Button variant="ghost" size="sm" className="text-accent-secondary hover:text-accent-primary">
                            🎬 Scenes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Enhanced Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">
                {searchTerm || statusFilter !== 'all' ? '🔍' : '🎬'}
              </div>
              <h3 className="text-2xl font-bold text-accent-secondary mb-3">
                {searchTerm || statusFilter !== 'all' ? 'No Matching Projects' : 'Ready to Create Magic?'}
              </h3>
              <p className="text-text-secondary mb-6 text-lg max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search terms or filters to find your projects.' 
                  : 'Start your filmmaking journey by creating your first cinematic masterpiece!'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(searchTerm || statusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="border-accent-secondary text-accent-secondary hover:bg-accent-secondary hover:text-primary-bg"
                  >
                    🔄 Clear Filters
                  </Button>
                )}
                <Link href="/projects/new">
                  <Button variant="cinematic" size="lg" className="hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5 mr-2" />
                    🎬 Create New Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </Layout>
  );
}