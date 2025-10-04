'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, Plus } from 'lucide-react';

export default function CateringManager({ projectId }: { projectId: number }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    catering_date: '',
    meal_type: 'lunch',
    shoot_location: '',
    total_people: 0,
    actors_count: 0,
    crew_count: 0,
    junior_artists_count: 0,
    vendor_name: '',
    vendor_contact: '',
    vegetarian_count: 0,
    non_vegetarian_count: 0,
    per_person_cost: 0,
    total_cost: 0,
    delivery_time: '',
    notes: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [projectId]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/catering/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.catering_orders);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/operations/catering', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, project_id: projectId }),
      });
      setIsDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Food & Catering</h2>
          <p className="text-gray-600">Manage daily meals and catering</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Order</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Catering Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input type="datetime-local" value={formData.catering_date} onChange={(e) => setFormData({ ...formData, catering_date: e.target.value })} required />
                </div>
                <div>
                  <Label>Meal Type *</Label>
                  <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="snacks">Snacks</SelectItem>
                      <SelectItem value="tea">Tea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Total People *</Label>
                  <Input type="number" value={formData.total_people} onChange={(e) => setFormData({ ...formData, total_people: parseInt(e.target.value) })} required min="1" />
                </div>
                <div>
                  <Label>Actors</Label>
                  <Input type="number" value={formData.actors_count} onChange={(e) => setFormData({ ...formData, actors_count: parseInt(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Crew</Label>
                  <Input type="number" value={formData.crew_count} onChange={(e) => setFormData({ ...formData, crew_count: parseInt(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Jr. Artists</Label>
                  <Input type="number" value={formData.junior_artists_count} onChange={(e) => setFormData({ ...formData, junior_artists_count: parseInt(e.target.value) })} min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor Name *</Label>
                  <Input value={formData.vendor_name} onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Vendor Contact</Label>
                  <Input value={formData.vendor_contact} onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Vegetarian</Label>
                  <Input type="number" value={formData.vegetarian_count} onChange={(e) => setFormData({ ...formData, vegetarian_count: parseInt(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Non-Veg</Label>
                  <Input type="number" value={formData.non_vegetarian_count} onChange={(e) => setFormData({ ...formData, non_vegetarian_count: parseInt(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Per Person Cost (₹)</Label>
                  <Input type="number" value={formData.per_person_cost} onChange={(e) => setFormData({ ...formData, per_person_cost: parseFloat(e.target.value) })} min="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Total Cost (₹) *</Label>
                  <Input type="number" value={formData.total_cost} onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) })} required min="0" />
                </div>
                <div>
                  <Label>Delivery Time</Label>
                  <Input value={formData.delivery_time} onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })} placeholder="e.g., 1:00 PM" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={formData.shoot_location} onChange={(e) => setFormData({ ...formData, shoot_location: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Order</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="h-5 w-5" />
                <h3 className="text-lg font-semibold">{order.meal_type.toUpperCase()}</h3>
                <Badge>{order.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium">{new Date(order.catering_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">People</p>
                  <p className="font-medium">{order.total_people}</p>
                </div>
                <div>
                  <p className="text-gray-600">Vendor</p>
                  <p className="font-medium">{order.vendor_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Delivery Time</p>
                  <p className="font-medium">{order.delivery_time || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cost</p>
                  <p className="font-medium">₹{order.total_cost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
