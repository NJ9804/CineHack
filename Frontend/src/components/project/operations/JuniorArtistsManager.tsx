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
          <h2 className="text-2xl font-bold text-accent-primary">🎭 Junior Artists Management</h2>
          <p className="text-text-primary/80">Manage extras and junior artists for your production</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isArtistDialogOpen} onOpenChange={setIsArtistDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-accent-brown text-accent-primary hover:bg-accent-brown/20 hover:text-accent-primary transition-colors">
                <Plus className="h-4 w-4 mr-2" />🎭 Add Artist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-secondary-bg/95 backdrop-blur-sm border-accent-brown shadow-2xl">
              <DialogHeader className="pb-4 border-b border-accent-brown">
                <DialogTitle className="text-accent-primary text-xl font-bold flex items-center gap-2">
                  🎭 Add Junior Artist
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleArtistSubmit} className="space-y-6 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-primary font-medium">🎭 Name *</Label>
                    <Input 
                      value={artistForm.name} 
                      onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })} 
                      required
                      placeholder="Artist name"
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-text-primary font-medium">📞 Contact</Label>
                    <Input 
                      value={artistForm.contact_number} 
                      onChange={(e) => setArtistForm({ ...artistForm, contact_number: e.target.value })} 
                      placeholder="Phone number"
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-text-primary font-medium">🎂 Age</Label>
                    <Input 
                      type="number" 
                      value={artistForm.age} 
                      onChange={(e) => setArtistForm({ ...artistForm, age: parseInt(e.target.value) })} 
                      min="0" 
                      placeholder="Age"
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-text-primary font-medium">👤 Gender</Label>
                    <Select value={artistForm.gender} onValueChange={(value) => setArtistForm({ ...artistForm, gender: value })}>
                      <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary-bg border-accent-brown">
                        <SelectItem value="male" className="text-text-primary hover:bg-accent-brown/20">👨 Male</SelectItem>
                        <SelectItem value="female" className="text-text-primary hover:bg-accent-brown/20">👩 Female</SelectItem>
                        <SelectItem value="other" className="text-text-primary hover:bg-accent-brown/20">⚧ Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-text-primary font-medium">💰 Daily Rate (₹) *</Label>
                    <Input 
                      type="number" 
                      value={artistForm.daily_rate} 
                      onChange={(e) => setArtistForm({ ...artistForm, daily_rate: parseFloat(e.target.value) })} 
                      required 
                      min="0" 
                      placeholder="₹ 0.00"
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-text-primary font-medium">🏢 Agency (if any)</Label>
                  <Input 
                    value={artistForm.agency_name} 
                    onChange={(e) => setArtistForm({ ...artistForm, agency_name: e.target.value })} 
                    placeholder="Talent agency name"
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsArtistDialogOpen(false)}
                    className="border-accent-brown text-text-primary hover:bg-accent-brown/20 transition-colors"
                  >
                    ❌ Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-accent-primary text-primary-bg hover:bg-accent-secondary transition-colors font-medium"
                  >
                    ✅ Add Artist
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent-primary text-primary-bg hover:bg-accent-secondary transition-colors font-medium">
                <UserCheck className="h-4 w-4 mr-2" />📋 Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-secondary-bg/95 backdrop-blur-sm border-accent-brown shadow-2xl">
              <DialogHeader className="pb-4 border-b border-accent-brown">
                <DialogTitle className="text-accent-primary text-xl font-bold flex items-center gap-2">
                  📋 Mark Attendance
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAttendanceSubmit} className="space-y-6 py-6">
                <div>
                  <Label className="text-text-primary font-medium">🎭 Select Artist *</Label>
                  <Select value={attendanceForm.junior_artist_id.toString()} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, junior_artist_id: parseInt(value) })}>
                    <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors">
                      <SelectValue placeholder="Choose artist" />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary-bg border-accent-brown backdrop-blur-sm">
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id.toString()} className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">
                          🎭 {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-primary font-medium">📅 Date *</Label>
                    <Input 
                      type="datetime-local" 
                      value={attendanceForm.attendance_date} 
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, attendance_date: e.target.value })} 
                      required 
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-text-primary font-medium">⏰ Call Time</Label>
                    <Input 
                      value={attendanceForm.call_time} 
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, call_time: e.target.value })} 
                      placeholder="e.g., 6:00 AM" 
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-text-primary font-medium">📍 Location</Label>
                    <Input 
                      value={attendanceForm.shoot_location} 
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, shoot_location: e.target.value })} 
                      placeholder="Shoot location"
                      className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div>
                    <Label className="text-text-primary font-medium">✅ Status</Label>
                    <Select value={attendanceForm.attendance_status} onValueChange={(value) => setAttendanceForm({ ...attendanceForm, attendance_status: value })}>
                      <SelectTrigger className="bg-secondary-bg border-accent-brown/50 text-text-primary focus:border-accent-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-secondary-bg border-accent-brown">
                        <SelectItem value="scheduled" className="text-text-primary hover:bg-accent-brown/20">📅 Scheduled</SelectItem>
                        <SelectItem value="present" className="text-text-primary hover:bg-accent-brown/20">✅ Present</SelectItem>
                        <SelectItem value="absent" className="text-text-primary hover:bg-accent-brown/20">❌ Absent</SelectItem>
                        <SelectItem value="late" className="text-text-primary hover:bg-accent-brown/20">⏰ Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-text-primary font-medium">🎭 Role Description</Label>
                  <Input 
                    value={attendanceForm.role_description} 
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, role_description: e.target.value })} 
                    placeholder="e.g., Crowd member, Party guest" 
                    className="bg-secondary-bg border-accent-brown/50 text-text-primary placeholder:text-text-secondary/70 focus:border-accent-primary transition-colors"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAttendanceDialogOpen(false)}
                    className="border-accent-brown text-text-primary hover:bg-accent-brown/20 transition-colors"
                  >
                    ❌ Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-accent-primary text-primary-bg hover:bg-accent-secondary transition-colors font-medium"
                  >
                    ✅ Mark Attendance
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary-bg/95 backdrop-blur-sm border-accent-brown shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 text-accent-primary flex items-center gap-2">
              🎭 Registered Artists ({artists.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {artists.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <p className="text-lg">🎭 No artists registered yet</p>
                  <p className="text-sm">Add your first junior artist to get started</p>
                </div>
              ) : (
                artists.map((artist) => (
                  <div key={artist.id} className="flex items-center justify-between p-4 bg-primary-bg border border-accent-brown/30 rounded-lg hover:bg-accent-brown/10 transition-colors">
                    <div>
                      <p className="font-semibold text-text-primary">🎭 {artist.name}</p>
                      <p className="text-sm text-text-secondary">
                        {artist.gender === 'male' ? '👨' : artist.gender === 'female' ? '👩' : '⚧'} {artist.gender} • 
                        🎂 {artist.age} yrs • 
                        💰 ₹{artist.daily_rate}/day
                      </p>
                    </div>
                    <Badge 
                      variant={artist.is_available ? 'default' : 'secondary'}
                      className={artist.is_available 
                        ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/50' 
                        : 'bg-accent-brown/20 text-text-secondary border-accent-brown/50'
                      }
                    >
                      {artist.is_available ? '✅ Available' : '❌ Unavailable'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary-bg/95 backdrop-blur-sm border-accent-brown shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 text-accent-primary flex items-center gap-2">
              📋 Recent Attendance ({attendance.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendance.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  <p className="text-lg">📋 No attendance records yet</p>
                  <p className="text-sm">Mark your first attendance to see records here</p>
                </div>
              ) : (
                attendance.slice(0, 10).map((record) => (
                  <div key={record.id} className="p-4 bg-primary-bg border border-accent-brown/30 rounded-lg hover:bg-accent-brown/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-text-primary">🎭 Artist #{record.junior_artist_id}</p>
                      <Badge className={
                        record.attendance_status === 'present' 
                          ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/50'
                          : record.attendance_status === 'absent'
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : record.attendance_status === 'late'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          : 'bg-accent-brown/20 text-text-secondary border-accent-brown/50'
                      }>
                        {record.attendance_status === 'present' && '✅'}
                        {record.attendance_status === 'absent' && '❌'}
                        {record.attendance_status === 'late' && '⏰'}
                        {record.attendance_status === 'scheduled' && '📅'}
                        {' ' + record.attendance_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      📅 {new Date(record.attendance_date).toLocaleDateString()} • 
                      📍 {record.shoot_location || 'Location not specified'}
                    </p>
                    {record.role_description && (
                      <p className="text-xs text-text-secondary/80 mt-1">
                        🎭 {record.role_description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
