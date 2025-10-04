"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, Star, Phone, Mail, IndianRupee } from 'lucide-react';
import api from '@/services/api/client';

interface Actor {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  daily_rate: number;
  transport_cost?: number;
  accommodation_cost?: number;
  is_available: boolean;
  notes?: string;
}

interface ActorFormData {
  name: string;
  description: string;
  daily_rate: number;
  phone: string;
  email: string;
  availability: string;
}

interface CatalogActorsProps {
  projectId: string;
}

export default function CatalogActors({ projectId }: CatalogActorsProps) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [formData, setFormData] = useState<ActorFormData>({
    name: '',
    description: '',
    daily_rate: 0,
    phone: '',
    email: '',
    availability: 'available'
  });

  useEffect(() => {
    loadActors();
  }, [projectId]);

  const loadActors = async () => {
    try {
      setLoading(true);
      const data = await api.getCatalogItems(projectId, 'actor');
      setActors(data);
    } catch (error) {
      console.error('Failed to load actors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        daily_rate: formData.daily_rate,
        contact_email: formData.email,
        contact_phone: formData.phone,
        notes: formData.availability
      };

      if (editingActor) {
        await fetch(`http://localhost:8000/api/catalog/${editingActor.id}`, {
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
      loadActors();
    } catch (error) {
      console.error('Failed to save actor:', error);
      alert('Failed to save actor');
    }
  };

    const handleDelete = async (actor: Actor) => {
    if (confirm(`Are you sure you want to delete ${actor.name}?`)) {
      try {
        await api.deleteCatalogItem(actor.id, 'actor');
        loadActors();
      } catch (error) {
        console.error('Failed to delete actor:', error);
      }
    }
  };

  const handleEdit = (actor: Actor) => {
    setEditingActor(actor);
    setFormData({
      name: actor.name,
      description: actor.description || '',
      daily_rate: actor.daily_rate,
      phone: actor.contact_phone || '',
      email: actor.contact_email || '',
      availability: actor.is_available ? 'available' : 'busy'
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingActor(null);
    setFormData({
      name: '',
      description: '',
      daily_rate: 0,
      phone: '',
      email: '',
      availability: 'available'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading actors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Cast & Actors
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage your talent database with rates and availability
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Actor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{actors.length}</div>
            <div className="text-sm text-gray-400">Total Actors</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {actors.filter(a => a.is_available).length}
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              ₹{Math.round(actors.reduce((sum, a) => sum + a.daily_rate, 0) / actors.length || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-sm text-gray-400">Avg. Daily Rate</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {actors.filter(a => a.daily_rate > 0).length}
            </div>
            <div className="text-sm text-gray-400">Top Rated</div>
          </CardContent>
        </Card>
      </div>

      {/* Actors Grid */}
      {actors.length === 0 ? (
        <Card className="bg-gray-900/30 border-dashed border-gray-600">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Actors Yet</h3>
            <p className="text-gray-400 mb-6">
              Start building your talent database by adding actors with their rates and contact info
            </p>
            <Button 
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Actor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actors.map((actor) => (
            <Card key={actor.id} className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{actor.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{actor.description || 'No description available'}</p>
                  </div>
                  {actor.daily_rate > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <IndianRupee className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">{formatCurrency(actor.daily_rate)}</span>
                    </div>
                  )}
                </div>

                {/* Rate */}
                <div className="bg-gray-800/50 rounded p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Daily Rate</span>
                    <span className="text-lg font-bold text-green-400">
                      {formatCurrency(actor.daily_rate)}
                    </span>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  {actor.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-3 h-3" />
                      <span>{actor.contact_phone}</span>
                    </div>
                  )}
                  {actor.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{actor.contact_email}</span>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <Badge className={
                    actor.is_available 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {actor.is_available ? 'Available' : 'Busy'}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(actor)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(actor)}
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
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingActor ? 'Edit Actor' : 'Add New Actor'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingActor ? 'Update actor details' : 'Add a new actor to your talent database'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tovino Thomas"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Lead actor, experienced in action roles"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Daily Rate (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                  placeholder="50000"
                  className="bg-gray-800 border-gray-700 text-white pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="actor@example.com"
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
                <option value="busy">Busy</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.daily_rate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingActor ? 'Update' : 'Add'} Actor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
