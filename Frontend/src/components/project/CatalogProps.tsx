"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/api/client';

interface Prop {
  id: string;
  name: string;
  type: 'prop';
  description: string;
  quantity: number;
  unit_cost: number;
  availability: string;
  category: string;
  notes?: string;
}

interface PropFormData {
  name: string;
  description: string;
  quantity: number;
  unit_cost: number;
  availability: string;
  category: string;
  notes: string;
}

interface CatalogPropsProps {
  projectId: string;
}

const CATEGORIES = [
  'Weapons', 'Furniture', 'Vehicles', 'Electronics', 'Costumes', 
  'Food & Beverages', 'Documents', 'Art & Decor', 'Tools', 'Other'
];

export default function CatalogProps({ projectId }: CatalogPropsProps) {
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Prop | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState<PropFormData>({
    name: '',
    description: '',
    quantity: 1,
    unit_cost: 0,
    availability: 'available',
    category: 'Other',
    notes: ''
  });

  useEffect(() => {
    loadProps();
  }, [projectId]);

  const loadProps = async () => {
    try {
      setLoading(true);
      const data = await api.getCatalogItems(projectId, 'prop');
      setProps(data);
    } catch (error) {
      console.error('Failed to load props:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        type: 'prop',
        description: formData.description,
        quantity: formData.quantity,
        unit_cost: formData.unit_cost,
        availability: formData.availability,
        category: formData.category,
        notes: formData.notes
      };

      if (editingProp) {
        await fetch(`http://localhost:8000/api/catalog/${editingProp.id}`, {
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
      loadProps();
    } catch (error) {
      console.error('Failed to save prop:', error);
      alert('Failed to save prop');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prop?')) return;

    try {
      await api.deleteCatalogItem(id, 'prop');
      loadProps();
    } catch (error) {
      console.error('Failed to delete prop:', error);
      alert('Failed to delete prop');
    }
  };

  const handleEdit = (prop: Prop) => {
    setEditingProp(prop);
    setFormData({
      name: prop.name,
      description: prop.description,
      quantity: prop.quantity,
      unit_cost: prop.unit_cost,
      availability: prop.availability,
      category: prop.category,
      notes: prop.notes || ''
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProp(null);
    setFormData({
      name: '',
      description: '',
      quantity: 1,
      unit_cost: 0,
      availability: 'available',
      category: 'Other',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProps = filterCategory === 'all' 
    ? props 
    : props.filter(p => p.category === filterCategory);

  const totalValue = props.reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0);
  const totalItems = props.reduce((sum, p) => sum + p.quantity, 0);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading props...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            Props Inventory
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage props, set pieces, and production items
          </p>
        </div>
        <Button 
          onClick={() => setModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prop
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{props.length}</div>
            <div className="text-sm text-gray-400">Prop Types</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{totalItems}</div>
            <div className="text-sm text-gray-400">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {props.filter(p => p.availability === 'available').length}
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="text-lg font-bold text-white">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-gray-400">Total Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCategory('all')}
        >
          All ({props.length})
        </Button>
        {CATEGORIES.map(category => {
          const count = props.filter(p => p.category === category).length;
          if (count === 0) return null;
          return (
            <Button
              key={category}
              variant={filterCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(category)}
            >
              {category} ({count})
            </Button>
          );
        })}
      </div>

      {/* Props Grid */}
      {filteredProps.length === 0 ? (
        <Card className="bg-gray-900/30 border-dashed border-gray-600">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filterCategory === 'all' ? 'No Props Yet' : `No ${filterCategory} Props`}
            </h3>
            <p className="text-gray-400 mb-6">
              Start building your props inventory for production planning
            </p>
            <Button 
              onClick={() => setModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Prop
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProps.map((prop) => (
            <Card key={prop.id} className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{prop.name}</h3>
                    <Badge variant="secondary" className="text-xs">{prop.category}</Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{prop.description}</p>

                {/* Quantity & Cost */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-gray-500">Quantity</div>
                    <div className="text-lg font-bold text-white">{prop.quantity}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded p-2">
                    <div className="text-xs text-gray-500">Unit Cost</div>
                    <div className="text-sm font-bold text-green-400">{formatCurrency(prop.unit_cost)}</div>
                  </div>
                </div>

                {/* Total Value */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Total Value</span>
                    <span className="text-sm font-bold text-purple-400">
                      {formatCurrency(prop.quantity * prop.unit_cost)}
                    </span>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-4">
                  {prop.availability === 'available' ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      In Use
                    </Badge>
                  )}
                </div>

                {/* Notes */}
                {prop.notes && (
                  <p className="text-xs text-gray-500 mb-3 italic">"{prop.notes}"</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-800">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(prop)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(prop.id)}
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
        <DialogContent className="sm:max-w-[550px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingProp ? 'Edit Prop' : 'Add New Prop'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingProp ? 'Update prop details' : 'Add a new prop to your inventory'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Prop Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Vintage Typewriter, Police Badge"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Category *</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the prop..."
                className="bg-gray-800 border-gray-700 text-white min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Quantity *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="1"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Unit Cost (₹) *</Label>
                <Input
                  type="number"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                  min="0"
                  step="100"
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
                <option value="in-use">In Use</option>
                <option value="damaged">Damaged</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-300">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes (storage location, condition, etc.)"
                className="bg-gray-800 border-gray-700 text-white min-h-[60px]"
              />
            </div>

            {/* Total Value Preview */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Value</span>
                <span className="text-lg font-bold text-purple-400">
                  {formatCurrency(formData.quantity * formData.unit_cost)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || formData.quantity < 1}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {editingProp ? 'Update' : 'Add'} Prop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
