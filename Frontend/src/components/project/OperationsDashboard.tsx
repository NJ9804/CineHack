import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Package,
  Hotel,
  ShoppingCart,
  Calendar,
  Utensils,
  Car,
  Users
} from 'lucide-react';

interface OperationsDashboardProps {
  projectId: number;
  dashboardData: {
    alerts: {
      overdue_rentals: number;
      upcoming_checkins: number;
      pending_payments: number;
    };
    today: {
      catering_orders: number;
      catering_people: number;
      actors_available: number;
      junior_artists: number;
    };
    monthly: {
      transportation_cost: number;
    };
  };
}

export default function OperationsDashboard({ projectId, dashboardData }: OperationsDashboardProps) {
  const { alerts, today, monthly } = dashboardData;

  const alertCards = [
    {
      title: '📦 Overdue Rentals',
      value: alerts.overdue_rentals,
      icon: AlertTriangle,
      color: alerts.overdue_rentals > 0 ? 'text-red-400' : 'text-accent-primary',
      bgColor: alerts.overdue_rentals > 0 ? 'bg-red-900/20 border-red-500/30' : 'bg-accent-primary/10 border-accent-primary/30',
      emoji: '⚠️',
    },
    {
      title: '🏨 Upcoming Check-ins',
      value: alerts.upcoming_checkins,
      icon: Hotel,
      color: 'text-accent-secondary',
      bgColor: 'bg-accent-secondary/10 border-accent-secondary/30',
      emoji: '🔔',
    },
    {
      title: '💰 Pending Payments',
      value: alerts.pending_payments,
      icon: Clock,
      color: alerts.pending_payments > 0 ? 'text-orange-400' : 'text-accent-primary',
      bgColor: alerts.pending_payments > 0 ? 'bg-orange-900/20 border-orange-500/30' : 'bg-accent-primary/10 border-accent-primary/30',
      emoji: '⏰',
    },
  ];

  const todayCards = [
    {
      title: '🍽️ Catering Orders',
      value: today.catering_orders,
      subtitle: `${today.catering_people} crew members`,
      icon: Utensils,
      color: 'text-accent-primary',
      emoji: '🍽️',
    },
    {
      title: '🎭 Actors Available',
      value: today.actors_available,
      icon: Calendar,
      color: 'text-accent-secondary',
      emoji: '🎭',
    },
    {
      title: '👥 Junior Artists',
      value: today.junior_artists,
      icon: Users,
      color: 'text-accent-brown',
      emoji: '👥',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Operations Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rentals Overview */}
        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-accent-primary/20 rounded-lg">
                <Package className="h-5 w-5 text-accent-primary" />
              </div>
              <div className="text-2xl">📦</div>
            </div>
            <h4 className="text-sm font-medium text-accent-secondary mb-1">Equipment Rentals</h4>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-accent-primary">Active</span>
              {alerts.overdue_rentals > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {alerts.overdue_rentals} overdue
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hotels Overview */}
        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-accent-secondary/20 rounded-lg">
                <Hotel className="h-5 w-5 text-accent-secondary" />
              </div>
              <div className="text-2xl">🏨</div>
            </div>
            <h4 className="text-sm font-medium text-accent-secondary mb-1">Accommodations</h4>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-accent-secondary">Booked</span>
              {alerts.upcoming_checkins > 0 && (
                <Badge variant="secondary" className="text-xs bg-accent-secondary/20 text-accent-secondary">
                  {alerts.upcoming_checkins} check-ins
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Catering Overview */}
        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-accent-primary/20 rounded-lg">
                <Utensils className="h-5 w-5 text-accent-primary" />
              </div>
              <div className="text-2xl">🍽️</div>
            </div>
            <h4 className="text-sm font-medium text-accent-secondary mb-1">Catering Today</h4>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-accent-primary">{today.catering_orders}</span>
              <span className="text-xs text-text-secondary">{today.catering_people} people</span>
            </div>
          </CardContent>
        </Card>

        {/* Transportation Overview */}
        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-accent-brown/20 rounded-lg">
                <Car className="h-5 w-5 text-accent-secondary" />
              </div>
              <div className="text-2xl">🚐</div>
            </div>
            <h4 className="text-sm font-medium text-accent-secondary mb-1">Transport Budget</h4>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-accent-primary">₹{(monthly.transportation_cost / 1000).toFixed(0)}K</span>
              <span className="text-xs text-text-secondary">this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew & Cast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-accent-secondary flex items-center gap-2">
              <div className="p-1 bg-accent-primary/20 rounded">
                <Calendar className="h-4 w-4 text-accent-primary" />
              </div>
              🎭 Cast Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent-primary">{today.actors_available}</p>
                <p className="text-sm text-text-secondary">Actors available today</p>
              </div>
              <div>
                <p className="text-xl font-bold text-accent-secondary">{today.junior_artists}</p>
                <p className="text-sm text-text-secondary">Junior artists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-accent-secondary flex items-center gap-2">
              <div className="p-1 bg-red-500/20 rounded">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              ⚠️ Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {alerts.overdue_rentals > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Overdue rentals</span>
                  <Badge variant="destructive" className="text-xs">{alerts.overdue_rentals}</Badge>
                </div>
              )}
              {alerts.pending_payments > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Pending payments</span>
                  <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400">{alerts.pending_payments}</Badge>
                </div>
              )}
              {alerts.upcoming_checkins > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Upcoming check-ins</span>
                  <Badge variant="secondary" className="text-xs bg-accent-secondary/20 text-accent-secondary">{alerts.upcoming_checkins}</Badge>
                </div>
              )}
              {alerts.overdue_rentals === 0 && alerts.pending_payments === 0 && alerts.upcoming_checkins === 0 && (
                <p className="text-sm text-accent-primary flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  All operations up to date ✅
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
