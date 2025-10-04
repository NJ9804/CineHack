'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Package, 
  Hotel, 
  ShoppingCart, 
  Calendar, 
  Utensils, 
  Car, 
  Users,
  LayoutDashboard,
  Loader2,
  Activity
} from 'lucide-react';
import OperationsDashboard from '@/components/project/OperationsDashboard';
import RentalsManager from '@/components/project/operations/RentalsManager';
import HotelsManager from '@/components/project/operations/HotelsManager';
import PurchasesManager from '@/components/project/operations/PurchasesManager';
import ActorAvailabilityManager from '@/components/project/operations/ActorAvailabilityManager';
import CateringManager from '@/components/project/operations/CateringManager';
import TransportationManager from '@/components/project/operations/TransportationManager';
import JuniorArtistsManager from '@/components/project/operations/JuniorArtistsManager';

export default function OperationsPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [projectId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/dashboard/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '📊' },
    { id: 'rentals', label: 'Rentals', icon: Package, emoji: '📦' },
    { id: 'hotels', label: 'Hotels', icon: Hotel, emoji: '🏨' },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart, emoji: '🛒' },
    { id: 'actors', label: 'Actor Availability', icon: Calendar, emoji: '🎭' },
    { id: 'catering', label: 'Catering', icon: Utensils, emoji: '🍽️' },
    { id: 'transport', label: 'Transportation', icon: Car, emoji: '🚐' },
    { id: 'junior-artists', label: 'Junior Artists', icon: Users, emoji: '👥' },
  ];

  if (loading) {
    return (
      <Layout title="🎬 Production Operations" subtitle="Loading operational data...">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 max-w-md shadow-2xl backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-accent-primary animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-accent-secondary mb-2">🎬 Loading Operations...</h3>
              <p className="text-text-secondary">Setting up production management</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="🎬 Production Operations" subtitle="Manage all operational aspects of your production">
      <div className="space-y-8">
        {/* Enhanced Welcome Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-accent-secondary mb-2">
            🎬 Production Operations Hub
          </h1>
          <p className="text-text-secondary text-lg">
            Streamline your film production logistics and operations
          </p>
        </div>

        {/* Operations Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: '📊 Active Operations', value: '8', icon: Activity, color: 'from-accent-primary/20 to-accent-secondary/20' },
            { label: '📦 Equipment Rentals', value: '24', icon: Package, color: 'from-accent-secondary/20 to-accent-primary/20' },
            { label: '🎭 Cast Members', value: '15', icon: Users, color: 'from-accent-brown/20 to-accent-secondary/20' },
            { label: '🏨 Accommodations', value: '6', icon: Hotel, color: 'from-accent-secondary/20 to-accent-brown/20' }
          ].map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-sm font-medium text-accent-secondary">{stat.label}</CardTitle>
                  <p className="text-xs text-text-secondary mt-1">Current count</p>
                </div>
                <div className="p-3 bg-accent-primary/20 rounded-full group-hover:bg-accent-primary/30 transition-colors">
                  <stat.icon className="w-5 h-5 text-accent-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent-primary mb-1">{stat.value}</div>
                <p className="text-xs text-text-secondary">Operations managed</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Single Tabs Component with Enhanced Navigation and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          {/* Enhanced Navigation Tabs */}
          <Card className="bg-gradient-to-r from-secondary-bg/60 to-primary-bg/40 border-accent-brown/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 bg-primary-bg/50 p-2 rounded-xl border border-accent-brown/20 h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-2 p-3 h-auto rounded-lg border border-transparent data-[state=active]:border-accent-primary data-[state=active]:bg-accent-primary/10 data-[state=active]:text-accent-primary hover:bg-accent-brown/20 transition-all duration-300 group"
                  >
                    <div className="text-xl md:text-2xl group-hover:scale-110 transition-transform">{tab.emoji}</div>
                    <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                      <tab.icon className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* Tab Content with Enhanced Styling */}
          <TabsContent value="dashboard">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <LayoutDashboard className="w-6 h-6 text-accent-primary" />
                  </div>
                  📊 Operations Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {dashboardData ? (
                  <OperationsDashboard
                    projectId={projectId}
                    dashboardData={dashboardData}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-bold text-accent-secondary mb-2">Loading Dashboard...</h3>
                    <p className="text-text-secondary">Gathering operational insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rentals">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <Package className="w-6 h-6 text-accent-primary" />
                  </div>
                  📦 Equipment Rentals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RentalsManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotels">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <Hotel className="w-6 h-6 text-accent-primary" />
                  </div>
                  🏨 Accommodations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <HotelsManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-accent-primary" />
                  </div>
                  🛒 Purchases & Supplies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PurchasesManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actors">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-accent-primary" />
                  </div>
                  🎭 Actor Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ActorAvailabilityManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="catering">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <Utensils className="w-6 h-6 text-accent-primary" />
                  </div>
                  🍽️ Catering Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CateringManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transport">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <Car className="w-6 h-6 text-accent-primary" />
                  </div>
                  🚐 Transportation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TransportationManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="junior-artists">
            <Card className="bg-gradient-to-br from-secondary-bg/80 to-primary-bg/60 border-accent-brown/30 shadow-xl backdrop-blur-sm">
              <CardHeader className="border-b border-accent-brown/20">
                <CardTitle className="text-xl font-bold text-accent-secondary flex items-center gap-3">
                  <div className="p-2 bg-accent-primary/20 rounded-lg">
                    <Users className="w-6 h-6 text-accent-primary" />
                  </div>
                  👥 Junior Artists
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <JuniorArtistsManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
