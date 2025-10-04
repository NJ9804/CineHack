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
      title: 'Overdue Rentals',
      value: alerts.overdue_rentals,
      icon: AlertTriangle,
      color: alerts.overdue_rentals > 0 ? 'text-red-500' : 'text-green-500',
      bgColor: alerts.overdue_rentals > 0 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      title: 'Upcoming Check-ins',
      value: alerts.upcoming_checkins,
      icon: Hotel,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Payments',
      value: alerts.pending_payments,
      icon: Clock,
      color: alerts.pending_payments > 0 ? 'text-orange-500' : 'text-green-500',
      bgColor: alerts.pending_payments > 0 ? 'bg-orange-50' : 'bg-green-50',
    },
  ];

  const todayCards = [
    {
      title: 'Catering Orders',
      value: today.catering_orders,
      subtitle: `${today.catering_people} people`,
      icon: Utensils,
      color: 'text-purple-500',
    },
    {
      title: 'Actors Available',
      value: today.actors_available,
      icon: Calendar,
      color: 'text-indigo-500',
    },
    {
      title: 'Junior Artists',
      value: today.junior_artists,
      icon: Users,
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Alert Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Action Required</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alertCards.map((card, index) => (
            <Card key={index} className={card.bgColor}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <card.icon className={`h-10 w-10 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Today's Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Today's Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todayCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    {card.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                    )}
                  </div>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Monthly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Monthly Transportation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fuel & Transport Cost</p>
              <p className="text-3xl font-bold text-green-600">
                ₹{monthly.transportation_cost.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
