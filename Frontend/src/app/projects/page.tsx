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
    'planning': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-green-500/20 text-green-400 border-green-500/30',
    'completed': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'on-hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  };

  return (
    <Layout title="Projects" subtitle="All film projects and their current status">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-red-500/10 border-red-500/20 max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Enhanced Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by title, status, or budget..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              )}
            </div>

            {/* Enhanced Status Filter */}
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
              
              {/* Quick Filter Buttons */}
              <Button
                variant={statusFilter === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === 'in-progress' ? 'all' : 'in-progress')}
                className="whitespace-nowrap"
              >
                Active Only
              </Button>
            </div>
          </div>

          <Link href="/projects/new">
            <Button variant="cinematic" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Projects Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: projects.length, color: 'blue' },
            { label: 'In Progress', value: projects.filter(p => p.status === 'in-progress').length, color: 'green' },
            { label: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: 'yellow' },
            { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: 'gray' }
          ].map((stat, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-gray-900/50 border-gray-700 hover:border-amber-500/50 transition-all duration-200 group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white group-hover:text-amber-400 transition-colors">
                      {project.title}
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">Year: {project.year}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs border ${statusColors[project.status]}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Budget Information */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-white font-semibold">{formatCurrency(project.estimatedBudget)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Spent:</span>
                      <span className="text-white font-semibold">{formatCurrency(project.spentBudget)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((project.spentBudget / project.estimatedBudget) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 text-right">
                      {((project.spentBudget / project.estimatedBudget) * 100).toFixed(1)}% used
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-lg font-bold text-amber-400">--</div>
                      <div className="text-xs text-gray-400">Scenes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">--</div>
                      <div className="text-xs text-gray-400">Days</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}/scenes`}>
                      <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                        Scenes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by creating your first film project.'}
              </p>
              <Link href="/projects/new">
                <Button variant="cinematic">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </Layout>
  );
}