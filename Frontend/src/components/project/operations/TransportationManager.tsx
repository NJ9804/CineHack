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
import { Car, Plus, Fuel } from 'lucide-react';

export default function TransportationManager({ projectId }: { projectId: number }) {
  const [records, setRecords] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: 'car',
    vehicle_number: '',
    ownership: 'rented',
    driver_name: '',
    driver_contact: '',
    usage_date: '',
    purpose: 'cast_transport',
    from_location: '',
    to_location: '',
    distance_km: 0,
    fuel_type: 'petrol',
    fuel_quantity_liters: 0,
    fuel_cost: 0,
    toll_charges: 0,
    parking_charges: 0,
    rental_charges: 0,
    department: '',
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [projectId]);

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/transportation/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setRecords(data.transportation_records);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/operations/transportation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, project_id: projectId }),
      });
      setIsDialogOpen(false);
      fetchRecords();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transportation & Fuel</h2>
          <p className="text-gray-600">Track vehicles, fuel, and transportation costs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Record</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Transportation Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Vehicle Type *</Label>
                  <Select value={formData.vehicle_type} onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="bike">Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vehicle Number</Label>
                  <Input value={formData.vehicle_number} onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })} />
                </div>
                <div>
                  <Label>Ownership</Label>
                  <Select value={formData.ownership} onValueChange={(value) => setFormData({ ...formData, ownership: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="personal_reimbursement">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Driver Name</Label>
                  <Input value={formData.driver_name} onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })} />
                </div>
                <div>
                  <Label>Driver Contact</Label>
                  <Input value={formData.driver_contact} onChange={(e) => setFormData({ ...formData, driver_contact: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usage Date *</Label>
                  <Input type="datetime-local" value={formData.usage_date} onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })} required />
                </div>
                <div>
                  <Label>Purpose</Label>
                  <Select value={formData.purpose} onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cast_transport">Cast Transport</SelectItem>
                      <SelectItem value="equipment_transport">Equipment</SelectItem>
                      <SelectItem value="location_recce">Location Recce</SelectItem>
                      <SelectItem value="daily_commute">Daily Commute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Location *</Label>
                  <Input value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} required />
                </div>
                <div>
                  <Label>To Location *</Label>
                  <Input value={formData.to_location} onChange={(e) => setFormData({ ...formData, to_location: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Distance (km)</Label>
                  <Input type="number" value={formData.distance_km} onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Fuel Type</Label>
                  <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">Petrol</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="cng">CNG</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fuel (L)</Label>
                  <Input type="number" value={formData.fuel_quantity_liters} onChange={(e) => setFormData({ ...formData, fuel_quantity_liters: parseFloat(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Fuel Cost (₹)</Label>
                  <Input type="number" value={formData.fuel_cost} onChange={(e) => setFormData({ ...formData, fuel_cost: parseFloat(e.target.value) })} min="0" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Toll (₹)</Label>
                  <Input type="number" value={formData.toll_charges} onChange={(e) => setFormData({ ...formData, toll_charges: parseFloat(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Parking (₹)</Label>
                  <Input type="number" value={formData.parking_charges} onChange={(e) => setFormData({ ...formData, parking_charges: parseFloat(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Rental (₹)</Label>
                  <Input type="number" value={formData.rental_charges} onChange={(e) => setFormData({ ...formData, rental_charges: parseFloat(e.target.value) })} min="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Car className="h-5 w-5" />
                <h3 className="text-lg font-semibold">{record.vehicle_type.toUpperCase()} - {record.vehicle_number || 'N/A'}</h3>
                <Badge>{record.purpose.replace('_', ' ')}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium">{new Date(record.usage_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Route</p>
                  <p className="font-medium">{record.from_location} → {record.to_location}</p>
                </div>
                <div>
                  <p className="text-gray-600">Distance</p>
                  <p className="font-medium">{record.distance_km || 0} km</p>
                </div>
                <div>
                  <p className="text-gray-600">Fuel</p>
                  <p className="font-medium">₹{(record.fuel_cost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Cost</p>
                  <p className="font-medium">₹{(record.total_cost || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
