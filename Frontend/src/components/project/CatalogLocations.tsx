"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2, Navigation, Image as ImageIcon, DollarSign } from 'lucide-react';
import api from '@/services/api/client';

interface Location {
  id: string;
  name: string;
  type: 'location';
  description: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  daily_rate: number;
  capacity: number;
  amenities: string[];
  availability: string;
  photo_url?: string;
  contact_person?: string;
  contact_phone?: string;
}

interface LocationFormData {
  name: string;
  description: string;
  address: string;
  lat: string;
  lng: string;
  daily_rate: number;
  capacity: number;
  amenities: string;
  availability: string;
  photo_url: string;
  contact_person: string;
  contact_phone: string;
}

interface CatalogLocationsProps {
  projectId: string;
}

export default function CatalogLocations({ projectId }: CatalogLocationsProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    daily_rate: 0,
    capacity: 0,
    amenities: '',
    availability: 'available',
    photo_url: '',
    contact_person: '',
    contact_phone: ''
  });

  useEffect(() => {
    loadLocations();
  }, [projectId]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await api.getCatalogItems(projectId, 'location');
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const payload = {
        name: formData.name,
        type: 'location',
        description: formData.description,
        address: formData.address,
        coordinates: formData.lat && formData.lng ? {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        } : undefined,
        daily_rate: formData.daily_rate,
        capacity: formData.capacity,
        amenities: amenitiesArray,
        availability: formData.availability,
        photo_url: formData.photo_url,
        contact_person: formData.contact_person,
        contact_phone: formData.contact_phone
      };

      if (editingLocation) {
        await fetch(`http://localhost:8000/api/catalog/${editingLocation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        await api.createCatalogItem(projectId, payload);
      }

      handleCloseModal();
      loadLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await api.deleteCatalogItem(id, 'location');
      loadLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('Failed to delete location');
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description,
      address: location.address,
      lat: location.coordinates?.lat?.toString() || '',
      lng: location.coordinates?.lng?.toString() || '',
      daily_rate: location.daily_rate,
      capacity: location.capacity,
      amenities: location.amenities?.join(', ') || '',
      availability: location.availability,
      photo_url: location.photo_url || '',
      contact_person: location.contact_person || '',
      contact_phone: location.contact_phone || ''
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      lat: '',
      lng: '',
      daily_rate: 0,
      capacity: 0,
      amenities: '',
      availability: 'available',
      photo_url: '',
      contact_person: '',
      contact_phone: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const openInMaps = (coords: { lat: number; lng: number }) => {
    window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading locations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Shooting Locations
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage shooting locations with coordinates and rates
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{locations.length}</div>
            <div className="text-sm text-gray-400">Total Locations</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {locations.filter(l => l.availability === 'available').length}
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {locations.filter(l => l.coordinates).length}
            </div>
            <div className="text-sm text-gray-400">GPS Mapped</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-lg font-bold text-white">
              {formatCurrency(locations.reduce((sum, l) => sum + l.daily_rate, 0) / locations.length || 0)}
            </div>
            <div className="text-sm text-gray-400">Avg. Daily Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <Card className="bg-gray-900/30 border-dashed border-gray-600">
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Locations Yet</h3>
            <p className="text-gray-400 mb-6">
              Start building your location database with addresses, rates, and GPS coordinates
            </p>
            <Button 
              onClick={() => setModalOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Location
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <Card key={location.id} className="bg-gray-900/50 border-gray-700 hover:border-green-500/50 transition-all overflow-hidden">
              {/* Photo */}
              {location.photo_url ? (
                <div className="h-40 bg-gray-800 relative">
                  <img 
                    src={location.photo_url} 
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-600" />
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{location.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{location.address}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{location.description}</p>

                {/* Rate & Capacity */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-gray-500">Daily Rate</div>
                    <div className="text-sm font-bold text-green-400">{formatCurrency(location.daily_rate)}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-gray-500">Capacity</div>
                    <div className="text-sm font-bold text-white">{location.capacity || 'N/A'}</div>
                  </div>
                </div>

                {/* Amenities */}
                {location.amenities && location.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">Amenities</div>
                    <div className="flex flex-wrap gap-1">
                      {location.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {location.amenities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{location.amenities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {location.contact_person && (
                  <div className="mb-3 text-xs text-gray-400">
                    Contact: {location.contact_person}
                    {location.contact_phone && ` • ${location.contact_phone}`}
                  </div>
                )}

                {/* Availability & GPS */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className={
                    location.availability === 'available' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {location.availability === 'available' ? 'Available' : 'Booked'}
                  </Badge>
                  {location.coordinates && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => openInMaps(location.coordinates!)}
                      className="text-blue-400 hover:text-blue-300 h-6 px-2"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      <span className="text-xs">Map</span>
                    </Button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(location)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(location.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingLocation ? 'Update location details' : 'Add a new shooting location'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Location Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Kuttanad Backwaters, Old Church"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Address *</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address with landmarks"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the location, its features, and why it's suitable..."
                className="bg-gray-800 border-gray-700 text-white min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Latitude</Label>
                <Input
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="e.g., 9.5916"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Longitude</Label>
                <Input
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="e.g., 76.5222"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Daily Rate (₹) *</Label>
                <Input
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                  min="0"
                  step="1000"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Capacity (people)</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  min="0"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Amenities (comma-separated)</Label>
              <Input
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="Parking, Power supply, Restrooms, Catering area"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Photo URL</Label>
              <Input
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                placeholder="https://example.com/location.jpg"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Contact Person</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Contact Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Availability</Label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.address}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingLocation ? 'Update' : 'Add'} Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
