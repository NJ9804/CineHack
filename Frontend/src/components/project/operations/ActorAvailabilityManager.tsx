'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, CheckCircle } from 'lucide-react';

export default function ActorAvailabilityManager({ projectId }: { projectId: number }) {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [actors, setActors] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    actor_id: 0,
    start_date: '',
    end_date: '',
    availability_status: 'available',
    shoot_location: '',
    call_time: '',
    notes: '',
  });

  useEffect(() => {
    fetchAvailabilities();
    fetchActors();
  }, [projectId]);

  const fetchAvailabilities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/actor-availability/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setAvailabilities(data.availabilities);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchActors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/catalog/actors/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setActors(data.actors || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/operations/actor-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, project_id: projectId }),
      });
      setIsDialogOpen(false);
      fetchAvailabilities();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent-secondary">🎭 Actor Availability</h2>
          <p className="text-text-secondary">Manage actor schedules and availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />🎭 Add Availability
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
            <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b border-accent-brown/30">
              <DialogTitle className="text-accent-secondary text-xl font-semibold">🎭 Add Actor Availability</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 bg-primary-bg/95 p-6 rounded-lg border border-accent-brown/30">
              <div>
                <Label className="text-accent-secondary font-medium">Actor *</Label>
                <Select value={formData.actor_id.toString()} onValueChange={(value) => setFormData({ ...formData, actor_id: parseInt(value) })}>
                  <SelectTrigger className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50">
                    <SelectValue placeholder="Select actor" />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary-bg/95 border-accent-brown/50 backdrop-blur-sm">
                    {actors.map((actor) => (
                      <SelectItem key={actor.id} value={actor.id.toString()} className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">{actor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-accent-secondary font-medium">Start Date *</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.start_date} 
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} 
                    required 
                    className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                  />
                </div>
                <div>
                  <Label className="text-accent-secondary font-medium">End Date *</Label>
                  <Input 
                    type="datetime-local" 
                    value={formData.end_date} 
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} 
                    required 
                    className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-accent-secondary font-medium">Status</Label>
                  <Select value={formData.availability_status} onValueChange={(value) => setFormData({ ...formData, availability_status: value })}>
                    <SelectTrigger className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg/95 border-accent-brown/50 backdrop-blur-sm">
                      <SelectItem value="available" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Available</SelectItem>
                      <SelectItem value="tentative" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Tentative</SelectItem>
                      <SelectItem value="booked" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Booked</SelectItem>
                      <SelectItem value="unavailable" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-accent-secondary font-medium">Call Time</Label>
                  <Input 
                    value={formData.call_time} 
                    onChange={(e) => setFormData({ ...formData, call_time: e.target.value })} 
                    placeholder="e.g., 6:00 AM" 
                    className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-accent-secondary font-medium">Shoot Location</Label>
                <Input 
                  value={formData.shoot_location} 
                  onChange={(e) => setFormData({ ...formData, shoot_location: e.target.value })} 
                  className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-accent-brown/30 text-text-secondary hover:bg-accent-brown/20">
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent-primary text-primary-bg hover:bg-accent-primary/90">
                  🎭 Add Availability
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {availabilities.map((avail) => (
          <Card key={avail.id} className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-accent-primary/20 rounded-lg group-hover:bg-accent-primary/30 transition-colors">
                  <Calendar className="h-5 w-5 text-accent-primary" />
                </div>
                <h3 className="text-lg font-semibold text-accent-secondary">🎭 Actor #{avail.actor_id}</h3>
                <Badge className={`${
                  avail.availability_status === 'available' ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' :
                  avail.availability_status === 'booked' ? 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30' :
                  avail.availability_status === 'tentative' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {avail.availability_status}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-text-secondary font-medium mb-1">📅 Period</p>
                  <p className="text-accent-secondary font-semibold">
                    {new Date(avail.start_date).toLocaleDateString()} - {new Date(avail.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium mb-1">📍 Location</p>
                  <p className="text-accent-secondary font-semibold">{avail.shoot_location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-text-secondary font-medium mb-1">⏰ Call Time</p>
                  <p className="text-accent-secondary font-semibold">{avail.call_time || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
