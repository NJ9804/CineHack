'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Hotel, Plus, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';

interface HotelBooking {
  id: number;
  hotel_name: string;
  room_type: string;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  total_cost: number;
  booking_reference: string;
}

export default function HotelsManager({ projectId }: { projectId: number }) {
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    hotel_name: '',
    hotel_address: '',
    hotel_contact: '',
    room_type: 'single',
    number_of_rooms: 1,
    guest_name: '',
    guest_role: '',
    guest_contact: '',
    check_in_date: '',
    check_out_date: '',
    room_rate_per_night: 0,
    meals_included: false,
    notes: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [projectId]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/hotels/${projectId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/operations/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, project_id: projectId }),
      });
      if (response.ok) {
        setIsDialogOpen(false);
        fetchBookings();
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const markCheckIn = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/operations/hotels/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_status: 'checked_in',
          actual_check_in: new Date().toISOString(),
        }),
      });
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hotel Management</h2>
          <p className="text-gray-600">Manage accommodations for cast and crew</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Hotel Booking</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hotel Name *</Label>
                  <Input
                    value={formData.hotel_name}
                    onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Hotel Contact</Label>
                  <Input
                    value={formData.hotel_contact}
                    onChange={(e) => setFormData({ ...formData, hotel_contact: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Hotel Address</Label>
                <Textarea
                  value={formData.hotel_address}
                  onChange={(e) => setFormData({ ...formData, hotel_address: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Guest Name *</Label>
                  <Input
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Guest Role</Label>
                  <Input
                    value={formData.guest_role}
                    onChange={(e) => setFormData({ ...formData, guest_role: e.target.value })}
                    placeholder="e.g., Actor, Director"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Check-in Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Check-out Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Room Type</Label>
                  <Input
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Number of Rooms</Label>
                  <Input
                    type="number"
                    value={formData.number_of_rooms}
                    onChange={(e) => setFormData({ ...formData, number_of_rooms: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Rate per Night (₹)</Label>
                  <Input
                    type="number"
                    value={formData.room_rate_per_night}
                    onChange={(e) => setFormData({ ...formData, room_rate_per_night: parseFloat(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Booking</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Hotel className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">{booking.hotel_name}</h3>
                    <Badge>{booking.booking_status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-600">Guest</p>
                      <p className="font-medium">{booking.guest_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Room Type</p>
                      <p className="font-medium">{booking.room_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dates</p>
                      <p className="font-medium">
                        {new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Cost</p>
                      <p className="font-medium">₹{booking.total_cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                {booking.booking_status === 'confirmed' && (
                  <Button size="sm" onClick={() => markCheckIn(booking.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
