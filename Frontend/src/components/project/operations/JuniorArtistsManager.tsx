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
          <h2 className="text-2xl font-bold text-accent-secondary">👥 Junior Artists Management</h2>
          <p className="text-text-secondary">Manage extras and junior artists</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isArtistDialogOpen} onOpenChange={setIsArtistDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent-brown/30 text-accent-secondary hover:bg-accent-brown/20">
                <Plus className="h-4 w-4 mr-2" />👥 Add Artist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
              <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b border-accent-brown/30">
                <DialogTitle className="text-accent-secondary text-xl font-semibold">👥 Add Junior Artist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleArtistSubmit} className="space-y-6 bg-primary-bg/95 p-6 rounded-lg border border-accent-brown/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-accent-secondary font-medium">Name *</Label>
                    <Input 
                      value={artistForm.name} 
                      onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })} 
                      required
                      className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                    />
                  </div>
                  <div>
                    <Label className="text-accent-secondary font-medium">Contact</Label>
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
              <Button className="bg-accent-primary text-primary-bg hover:bg-accent-primary/90">
                <UserCheck className="h-4 w-4 mr-2" />📋 Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
              <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b border-accent-brown/30">
                <DialogTitle className="text-accent-secondary text-xl font-semibold">📋 Mark Attendance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAttendanceSubmit} className="space-y-6 bg-primary-bg/95 p-6 rounded-lg border border-accent-brown/30">
                <div>
                  <Label className="text-accent-secondary font-medium">Select Artist *</Label>
                  <Select value={attendanceForm.junior_artist_id.toString()} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, junior_artist_id: parseInt(value) })}>
                    <SelectTrigger className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50">
                      <SelectValue placeholder="Choose artist" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg/95 border-accent-brown/50 backdrop-blur-sm">
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id.toString()} className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">{artist.name}</SelectItem>
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
        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-accent-secondary">👥 Registered Artists ({artists.length})</h3>
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

        <Card className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-accent-secondary">📋 Recent Attendance ({attendance.length})</h3>
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
