"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Film, Plus, Calendar, DollarSign, AlertTriangle, Loader2, WifiOff } from 'lucide-react';
import { mockProjects, mockAlerts } from '@/services/mock/data';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects] = useState(mockProjects);
  const [alerts] = useState(mockAlerts);
  const [lottieLoaded, setLottieLoaded] = useState(false);

  // Check authentication and load lottie player
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load lottie-player dynamically on client side
      import('@lottiefiles/lottie-player').then(() => {
        setLottieLoaded(true);
        console.log('Lottie player loaded successfully');
      }).catch((error) => {
        console.error('Failed to load lottie player:', error);
      });

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      } else {
        // Add a minimum loading time to show the panda animation
        setTimeout(() => {
          setLoading(false);
        }, 6000); // Show loading screen for 6 seconds to enjoy the panda
      }
    }
  }, [router]);

  // 🎥 Loading with Enhanced Panda Animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-bg via-secondary-bg to-primary-bg flex items-center justify-center relative overflow-hidden">
        {/* Background film strip pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-8 bg-accent-brown transform -rotate-12"></div>
          <div className="absolute bottom-0 right-0 w-full h-8 bg-accent-brown transform rotate-12"></div>
        </div>
        
        <div className="text-center relative z-10">
          {/* Main Panda Animation Container */}
          <div className="mb-12">
            {lottieLoaded ? (
              <div className="relative">
                {/* Cinematic Background */}
                <div className="absolute -inset-16 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/15 to-accent-brown/10 rounded-full blur-3xl animate-pulse"></div>
                
                {/* Panda Box Container */}
                <div className="relative bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 rounded-3xl p-8 backdrop-blur-sm border-2 border-accent-brown/30 shadow-2xl">
                  {/* Panda Animation */}
                  <div className="text-center">
                    {React.createElement('lottie-player', {
                      autoplay: true,
                      loop: true,
                      src: "/assets/panda.json",
                      style: { 
                        width: "500px", 
                        height: "500px",
                        filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.4))"
                      },
                      onLoad: () => console.log('🐼 Panda is ready with popcorn!'),
                      onError: (e) => console.error('Panda animation error:', e)
                    })}
                  </div>
                  
                  {/* Floating popcorn emojis inside the box */}
                  <div className="absolute top-12 left-12 text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🍿</div>
                  <div className="absolute top-20 right-16 text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍿</div>
                  <div className="absolute bottom-24 left-20 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🍿</div>
                  <div className="absolute bottom-16 right-12 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🍿</div>
                  
                  {/* Text at the bottom of the box */}
                  <div className="mt-4 text-center">
                    <p className="text-xl text-accent-primary animate-pulse font-semibold">
                      🐼 Please wait until panda finishes the popcorn...
                    </p>
                  </div>
                  
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-accent-primary rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-accent-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-accent-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-accent-primary rounded-br-lg"></div>
                </div>
              </div>
            ) : (
              /* Fallback Film Reel Animation while Lottie loads */
              <div className="relative">
                <div className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 rounded-3xl p-16 backdrop-blur-sm border border-accent-brown/20 shadow-2xl">
                  <div className="relative w-40 h-40 mx-auto">
                    {/* Outer film reel */}
                    <div className="absolute inset-0 border-4 border-accent-brown rounded-full animate-spin-slow"></div>
                    {/* Inner film reel */}
                    <div className="absolute inset-6 border-2 border-accent-secondary rounded-full animate-spin"></div>
                    {/* Center hub */}
                    <div className="absolute inset-16 bg-accent-primary rounded-full flex items-center justify-center">
                      <div className="text-3xl">🎬</div>
                    </div>
                    {/* Film perforations */}
                    <div className="absolute top-2 left-1/2 w-2 h-2 bg-accent-primary rounded-full transform -translate-x-1/2"></div>
                    <div className="absolute bottom-2 left-1/2 w-2 h-2 bg-accent-primary rounded-full transform -translate-x-1/2"></div>
                    <div className="absolute left-2 top-1/2 w-2 h-2 bg-accent-primary rounded-full transform -translate-y-1/2"></div>
                    <div className="absolute right-2 top-1/2 w-2 h-2 bg-accent-primary rounded-full transform -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          
            
            {/* Progress indicator */}
            <div className="flex justify-center items-center space-x-2">
              <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-accent-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-accent-brown rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
    
    );
  }

  const totalBudget = projects.reduce((sum, project) => sum + project.estimatedBudget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spentBudget, 0);
  const activeProjects = projects.filter(p => p.status === 'in-progress').length;

  // Helper for severity styles
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high":
        return { color: "text-accent-primary", border: "border-accent-brown" };
      case "medium":
        return { color: "text-accent-secondary", border: "border-accent-secondary" };
      default:
        return { color: "text-accent-primary", border: "border-accent-primary" };
    }
  };

  return (
    <Layout title="🎬 Production Command Center" subtitle="Your complete overview of film projects, budgets, and operations">
      <div className="space-y-8">
        {/* Welcome Message with Animation */}
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-accent-secondary mb-2">
            Welcome to Your Film Empire 🎬
          </h1>
          <p className="text-text-secondary text-lg">
            Managing {projects.length} projects worth ₹{(totalBudget / 10000000).toFixed(1)}Cr in production value
          </p>
        </div>

        {/* Data Mode Indicator */}
        {typeof window !== 'undefined' && localStorage.getItem('useMockData') === 'true' && (
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 px-6 py-3 rounded-full border border-accent-primary/30">
              <Badge variant="secondary" className="bg-transparent text-accent-primary border-none text-base">
                <WifiOff className="w-4 h-4 mr-2" />
                🎭 Demo Mode - Showcasing Sample Productions
              </Badge>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Budget Card */}
          <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">💰 Total Investment</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Your film empire value</p>
              </div>
              <div className="p-3 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors">
                <DollarSign className="h-6 w-6 text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-primary mb-1">₹{(totalBudget / 10000000).toFixed(1)}Cr</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">📊</span>
                Across {projects.length} productions
              </div>
            </CardContent>
          </Card>

          {/* Spent Budget Card */}
          <Card className="bg-gradient-to-br from-secondary-bg to-accent-secondary/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">💸 Money in Action</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Currently invested</p>
              </div>
              <div className="p-3 bg-accent-secondary/20 rounded-full group-hover:bg-accent-secondary/30 transition-colors">
                <DollarSign className="h-6 w-6 text-accent-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-secondary mb-1">₹{(totalSpent / 10000000).toFixed(1)}Cr</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">📈</span>
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget utilized
              </div>
            </CardContent>
          </Card>

          {/* Active Projects Card */}
          <Card className="bg-gradient-to-br from-secondary-bg to-accent-primary/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">🎬 Live Productions</CardTitle>
                <p className="text-xs text-text-secondary mt-1">Currently filming</p>
              </div>
              <div className="p-3 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors">
                <Film className="h-6 w-6 text-accent-primary animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent-primary mb-1">{activeProjects}</div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">🎥</span>
                {activeProjects === 0 ? 'Ready to start filming!' : 
                 activeProjects === 1 ? 'One project in production' : 
                 `${activeProjects} projects rolling cameras`}
              </div>
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card className={`bg-gradient-to-br from-secondary-bg ${alerts.length > 0 ? 'to-accent-brown/20 border-accent-brown' : 'to-accent-primary/10 border-accent-primary/30'} shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-sm font-medium text-accent-secondary">
                  {alerts.length > 0 ? '⚠️ Action Required' : '✅ All Clear'}
                </CardTitle>
                <p className="text-xs text-text-secondary mt-1">
                  {alerts.length > 0 ? 'Issues need attention' : 'Everything running smooth'}
                </p>
              </div>
              <div className={`p-3 ${alerts.length > 0 ? 'bg-accent-brown/20' : 'bg-accent-primary/20'} rounded-full group-hover:bg-opacity-40 transition-colors`}>
                {alerts.length > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-accent-primary animate-bounce" />
                ) : (
                  <div className="h-6 w-6 text-accent-primary text-2xl">✨</div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-1 text-accent-primary`}>
                {alerts.length}
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <span className="mr-2">{alerts.length > 0 ? '🚨' : '🎉'}</span>
                {alerts.length === 0 ? 'No issues detected' : 
                 alerts.length === 1 ? '1 alert requiring review' : 
                 `${alerts.length} alerts need your attention`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-accent-brown/10 to-accent-secondary/10 p-6 rounded-2xl border border-accent-brown/30">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-accent-secondary mb-2">🚀 Ready to Create Magic?</h3>
            <p className="text-text-secondary">Launch your next blockbuster or manage existing productions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects/new">
              <Button variant="cinematic" size="lg" className="w-full sm:w-auto text-lg px-8 py-3 hover:scale-105 transition-transform">
                <Plus className="w-6 h-6 mr-3" />
                � Create New Movie Project
              </Button>
            </Link>
            <Link href="/global-costs">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-3 hover:scale-105 transition-transform border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg">
                <DollarSign className="w-6 h-6 mr-3" />
                � Manage Production Costs
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced Analytics */}
        <DashboardAnalytics projects={projects} alerts={alerts} />

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-accent-secondary flex items-center">
                🎭 Your Film Portfolio
                <Badge className="ml-3 bg-accent-primary/20 text-accent-primary">
                  {projects.length} Projects
                </Badge>
              </h2>
              <p className="text-text-secondary mt-1">Your latest productions and their progress</p>
            </div>
            <Link href="/projects">
              <Button variant="ghost" className="text-accent-primary hover:text-accent-secondary hover:bg-accent-primary/10 px-6 py-2">
                View All Projects →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => {
              const progressPercent = (project.spentBudget / project.estimatedBudget) * 100;
              const getStatusEmoji = (status: string) => {
                switch(status) {
                  case 'in-progress': return '🎬';
                  case 'planning': return '📋';
                  case 'completed': return '✅';
                  default: return '📽️';
                }
              };
              
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
                      <Badge className={`px-3 py-1 text-xs font-medium ${
                        project.status === 'in-progress' ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' :
                        project.status === 'planning' ? 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30' :
                        project.status === 'completed' ? 'bg-accent-brown/20 text-accent-secondary border border-accent-brown/30' :
                        'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                      }`}>
                        {project.status === 'in-progress' ? '🎬 Filming' :
                         project.status === 'planning' ? '📋 Planning' :
                         project.status === 'completed' ? '✅ Complete' :
                         '📽️ ' + project.status}
                      </Badge>
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
                          <span className="text-accent-primary font-bold">₹{(project.estimatedBudget / 10000000).toFixed(1)}Cr</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary text-sm flex items-center">
                            💸 Money Spent:
                          </span>
                          <span className="text-accent-secondary font-bold">₹{(project.spentBudget / 10000000).toFixed(1)}Cr</span>
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
                      
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm" className="w-full mt-4 border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-all duration-300">
                          🎯 Manage Project
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-accent-secondary flex items-center">
                {alerts.length > 0 ? '🚨 Production Alerts' : '✅ All Systems Green'}
                {alerts.length > 0 && (
                  <Badge className="ml-3 bg-accent-brown/20 text-accent-primary animate-pulse">
                    {alerts.length} Active
                  </Badge>
                )}
              </h2>
              <p className="text-text-secondary mt-1">
                {alerts.length > 0 
                  ? 'Issues that need your immediate attention'
                  : 'No alerts - your productions are running smoothly!'
                }
              </p>
            </div>
          </div>
          
          {alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.slice(0, 4).map((alert) => {
                const config = getSeverityConfig(alert.severity);
                const getSeverityIcon = (severity: string) => {
                  switch(severity) {
                    case 'high': return '🔥';
                    case 'medium': return '⚠️';
                    default: return 'ℹ️';
                  }
                };
                
                return (
                  <Card key={alert.id} className={`bg-gradient-to-r from-secondary-bg to-accent-brown/10 border-l-4 ${config.border} hover:shadow-lg transition-all duration-300 hover:scale-[1.02]`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="text-2xl">{getSeverityIcon(alert.severity)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={`bg-accent-primary/30 text-accent-primary font-semibold text-xs px-3 py-1`}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize border-accent-brown text-text-secondary">
                                📋 {alert.type} Alert
                              </Badge>
                            </div>
                            <p className={`font-semibold text-base ${config.color} mb-1`}>
                              {alert.message}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {alert.severity === 'high' ? '🚀 Requires immediate action to prevent delays' :
                               alert.severity === 'medium' ? '📝 Should be addressed within 24 hours' :
                               '💡 For your information and planning'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4 hover:bg-accent-primary hover:text-primary-bg">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-accent-secondary mb-2">
                  Fantastic! Everything is Running Smoothly
                </h3>
                <p className="text-text-secondary">
                  No production issues detected. Your film projects are on track and ready for success!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
