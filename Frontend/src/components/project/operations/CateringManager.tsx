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
          <h2 className="text-2xl font-bold text-accent-secondary">🍽️ Food & Catering</h2>
          <p className="text-text-secondary">Manage daily meals and catering</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />🍽️ New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
            <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b-2 border-accent-brown/60">
              <DialogTitle className="text-accent-secondary font-bold text-xl">🍽️ Create Catering Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 bg-primary-bg/95 p-6 rounded-lg border-2 border-accent-brown/60 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Date *</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.catering_date} 
                    onChange={(e) => setFormData({ ...formData, catering_date: e.target.value })} 
                    required 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Meal Type *</Label>
                  <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
                    <SelectTrigger className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-primary-bg/95 border-accent-brown/60 backdrop-blur-sm">
                      <SelectItem value="breakfast" className="text-text-primary hover:bg-secondary-bg/80">Breakfast</SelectItem>
                      <SelectItem value="lunch" className="text-text-primary hover:bg-secondary-bg/80">Lunch</SelectItem>
                      <SelectItem value="dinner" className="text-text-primary hover:bg-secondary-bg/80">Dinner</SelectItem>
                      <SelectItem value="snacks" className="text-text-primary hover:bg-secondary-bg/80">Snacks</SelectItem>
                      <SelectItem value="tea" className="text-text-primary hover:bg-secondary-bg/80">Tea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Total People *</Label>
                  <Input 
                    type="number" 
                    value={formData.total_people} 
                    onChange={(e) => setFormData({ ...formData, total_people: parseInt(e.target.value) })} 
                    required 
                    min="1" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Actors</Label>
                  <Input 
                    type="number" 
                    value={formData.actors_count} 
                    onChange={(e) => setFormData({ ...formData, actors_count: parseInt(e.target.value) })} 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Crew</Label>
                  <Input 
                    type="number" 
                    value={formData.crew_count} 
                    onChange={(e) => setFormData({ ...formData, crew_count: parseInt(e.target.value) })} 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Jr. Artists</Label>
                  <Input 
                    type="number" 
                    value={formData.junior_artists_count} 
                    onChange={(e) => setFormData({ ...formData, junior_artists_count: parseInt(e.target.value) })} 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Vendor Name *</Label>
                  <Input 
                    value={formData.vendor_name} 
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} 
                    required 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Vendor Contact</Label>
                  <Input 
                    value={formData.vendor_contact} 
                    onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })} 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Vegetarian</Label>
                  <Input 
                    type="number" 
                    value={formData.vegetarian_count} 
                    onChange={(e) => setFormData({ ...formData, vegetarian_count: parseInt(e.target.value) })} 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Non-Veg</Label>
                  <Input 
                    type="number" 
                    value={formData.non_vegetarian_count} 
                    onChange={(e) => setFormData({ ...formData, non_vegetarian_count: parseInt(e.target.value) })} 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Per Person Cost (₹)</Label>
                  <Input 
                    type="number" 
                    value={formData.per_person_cost} 
                    onChange={(e) => setFormData({ ...formData, per_person_cost: parseFloat(e.target.value) })} 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Total Cost (₹) *</Label>
                  <Input 
                    type="number" 
                    value={formData.total_cost} 
                    onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) })} 
                    required 
                    min="0" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Delivery Time</Label>
                  <Input 
                    value={formData.delivery_time} 
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })} 
                    placeholder="e.g., 1:00 PM" 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors placeholder:text-text-secondary/70 shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Location</Label>
                  <Input 
                    value={formData.shoot_location} 
                    onChange={(e) => setFormData({ ...formData, shoot_location: e.target.value })} 
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t-2 border-accent-brown/60">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-accent-brown/60 text-text-secondary hover:bg-secondary-bg/80 bg-secondary-bg/30 font-medium">
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent-primary text-primary-bg hover:bg-accent-primary/90 font-semibold shadow-xl">
                  🍽️ Create Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="bg-primary-bg border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-primary/20 rounded-lg group-hover:bg-accent-primary/30 transition-colors">
                  <Utensils className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-accent-secondary">🍽️ {order.meal_type.toUpperCase()}</h3>
                <Badge className={`${
                  order.status === 'ordered' ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' :
                  order.status === 'delivered' ? 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30' :
                  'bg-orange-500/20 text-orange-400 border-orange-500/30'
                }`}>
                  {order.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-text-secondary">Date</p>
                  <p className="font-medium text-text-primary">{new Date(order.catering_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-text-secondary">People</p>
                  <p className="font-medium text-text-primary">{order.total_people}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Vendor</p>
                  <p className="font-medium text-text-primary">{order.vendor_name}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Delivery Time</p>
                  <p className="font-medium text-text-primary">{order.delivery_time || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-secondary">Cost</p>
                  <p className="font-medium text-accent-primary">₹{order.total_cost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}