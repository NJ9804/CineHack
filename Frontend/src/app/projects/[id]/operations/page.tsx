'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  Hotel, 
  ShoppingCart, 
  Calendar, 
  Utensils, 
  Car, 
  Users,
  LayoutDashboard
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rentals', label: 'Rentals', icon: Package },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'actors', label: 'Actor Availability', icon: Calendar },
    { id: 'catering', label: 'Catering', icon: Utensils },
    { id: 'transport', label: 'Transportation', icon: Car },
    { id: 'junior-artists', label: 'Junior Artists', icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Operations</h1>
          <p className="text-gray-600 mt-1">
            Manage all operational aspects of your production
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          {dashboardData && (
            <OperationsDashboard
              projectId={projectId}
              dashboardData={dashboardData}
            />
          )}
        </TabsContent>

        <TabsContent value="rentals" className="mt-6">
          <RentalsManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="hotels" className="mt-6">
          <HotelsManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <PurchasesManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="actors" className="mt-6">
          <ActorAvailabilityManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="catering" className="mt-6">
          <CateringManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="transport" className="mt-6">
          <TransportationManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="junior-artists" className="mt-6">
          <JuniorArtistsManager projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
