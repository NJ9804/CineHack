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
          <h2 className="text-2xl font-bold">Actor Availability</h2>
          <p className="text-gray-600">Manage actor schedules and availability</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Availability</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Actor Availability</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Actor *</Label>
                <Select value={formData.actor_id.toString()} onValueChange={(value) => setFormData({ ...formData, actor_id: parseInt(value) })}>
                  <SelectTrigger><SelectValue placeholder="Select actor" /></SelectTrigger>
                  <SelectContent>
                    {actors.map((actor) => (
                      <SelectItem key={actor.id} value={actor.id.toString()}>{actor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
                </div>
                <div>
                  <Label>End Date *</Label>
                  <Input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={formData.availability_status} onValueChange={(value) => setFormData({ ...formData, availability_status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="tentative">Tentative</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Call Time</Label>
                  <Input value={formData.call_time} onChange={(e) => setFormData({ ...formData, call_time: e.target.value })} placeholder="e.g., 6:00 AM" />
                </div>
              </div>
              <div>
                <Label>Shoot Location</Label>
                <Input value={formData.shoot_location} onChange={(e) => setFormData({ ...formData, shoot_location: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Availability</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {availabilities.map((avail) => (
          <Card key={avail.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Actor #{avail.actor_id}</h3>
                <Badge>{avail.availability_status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-600">Period</p>
                  <p className="font-medium">
                    {new Date(avail.start_date).toLocaleDateString()} - {new Date(avail.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Location</p>
                  <p className="font-medium">{avail.shoot_location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Call Time</p>
                  <p className="font-medium">{avail.call_time || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
