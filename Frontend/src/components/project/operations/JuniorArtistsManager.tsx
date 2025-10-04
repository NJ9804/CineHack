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
import { Users, Plus, UserCheck } from 'lucide-react';

export default function JuniorArtistsManager({ projectId }: { projectId: number }) {
  const [artists, setArtists] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  
  const [artistForm, setArtistForm] = useState({
    name: '',
    contact_number: '',
    age: 0,
    gender: 'male',
    daily_rate: 0,
    agency_name: '',
    notes: '',
  });

  const [attendanceForm, setAttendanceForm] = useState({
    junior_artist_id: 0,
    attendance_date: '',
    shoot_location: '',
    role_description: '',
    call_time: '',
    attendance_status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    fetchArtists();
    fetchAttendance();
  }, [projectId]);

  const fetchArtists = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/junior-artists/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setArtists(data.junior_artists);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/junior-artists/attendance/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance_records);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/operations/junior-artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...artistForm, project_id: projectId }),
      });
      setIsArtistDialogOpen(false);
      fetchArtists();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/operations/junior-artists/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...attendanceForm, project_id: projectId }),
      });
      setIsAttendanceDialogOpen(false);
      fetchAttendance();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Junior Artists Management</h2>
          <p className="text-gray-600">Manage extras and junior artists</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isArtistDialogOpen} onOpenChange={setIsArtistDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Add Artist</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Junior Artist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleArtistSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input value={artistForm.name} onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <Input value={artistForm.contact_number} onChange={(e) => setArtistForm({ ...artistForm, contact_number: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Age</Label>
                    <Input type="number" value={artistForm.age} onChange={(e) => setArtistForm({ ...artistForm, age: parseInt(e.target.value) })} min="0" />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={artistForm.gender} onValueChange={(value) => setArtistForm({ ...artistForm, gender: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Daily Rate (₹) *</Label>
                    <Input type="number" value={artistForm.daily_rate} onChange={(e) => setArtistForm({ ...artistForm, daily_rate: parseFloat(e.target.value) })} required min="0" />
                  </div>
                </div>
                <div>
                  <Label>Agency (if any)</Label>
                  <Input value={artistForm.agency_name} onChange={(e) => setArtistForm({ ...artistForm, agency_name: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsArtistDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Artist</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserCheck className="h-4 w-4 mr-2" />Mark Attendance</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div>
                  <Label>Select Artist *</Label>
                  <Select value={attendanceForm.junior_artist_id.toString()} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, junior_artist_id: parseInt(value) })}>
                    <SelectTrigger><SelectValue placeholder="Choose artist" /></SelectTrigger>
                    <SelectContent>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id.toString()}>{artist.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Input type="datetime-local" value={attendanceForm.attendance_date} onChange={(e) => setAttendanceForm({ ...attendanceForm, attendance_date: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Call Time</Label>
                    <Input value={attendanceForm.call_time} onChange={(e) => setAttendanceForm({ ...attendanceForm, call_time: e.target.value })} placeholder="e.g., 6:00 AM" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input value={attendanceForm.shoot_location} onChange={(e) => setAttendanceForm({ ...attendanceForm, shoot_location: e.target.value })} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={attendanceForm.attendance_status} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, attendance_status: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Role Description</Label>
                  <Input value={attendanceForm.role_description} onChange={(e) => setAttendanceForm({ ...attendanceForm, role_description: e.target.value })} placeholder="e.g., Crowd member, Party guest" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Mark Attendance</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Registered Artists ({artists.length})</h3>
            <div className="space-y-3">
              {artists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{artist.name}</p>
                    <p className="text-sm text-gray-600">{artist.gender} • {artist.age} yrs • ₹{artist.daily_rate}/day</p>
                  </div>
                  <Badge variant={artist.is_available ? 'default' : 'secondary'}>
                    {artist.is_available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Attendance ({attendance.length})</h3>
            <div className="space-y-3">
              {attendance.slice(0, 10).map((record) => (
                <div key={record.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Artist #{record.junior_artist_id}</p>
                    <Badge>{record.attendance_status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(record.attendance_date).toLocaleDateString()} • {record.shoot_location || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
