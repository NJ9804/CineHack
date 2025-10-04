"use client"

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Edit3, Plus, Loader2, Trash2 } from 'lucide-react';
import { GlobalCost, GlobalCostUpdate, GlobalCostCreate } from '@/lib/types';
import { apiClient } from '@/services/api/apiConfig';

export default function GlobalCostsPage() {
  const [costs, setCosts] = useState<GlobalCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [editingBillingCycle, setEditingBillingCycle] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<GlobalCostCreate>({
    name: '',
    category: 'actor',
    billing_cycle: 'daily',
    cost: 0,
    description: ''
  });

  // Fetch costs from API
  useEffect(() => {
    const fetchCosts = async () => {
      try {
        setLoading(true);
        const data = await apiClient.globalCosts.getAll();
        setCosts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch global costs');
        console.error('Error fetching global costs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCosts();
  }, []);

  const handleEdit = (cost: GlobalCost) => {
    setEditingId(cost.id);
    setEditingValue(cost.cost.toString());
    setEditingBillingCycle(cost.billing_cycle);
  };

  const handleSave = async (id: number) => {
    try {
      const newCost = parseInt(editingValue);
      const updateData: GlobalCostUpdate = { 
        cost: newCost,
        billing_cycle: editingBillingCycle
      };
      
      const updatedCost = await apiClient.globalCosts.update(id, updateData);
      setCosts(costs.map(cost => 
        cost.id === id ? updatedCost : cost
      ));
      setEditingId(null);
      setEditingValue('');
      setEditingBillingCycle('daily');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cost');
      console.error('Error updating cost:', err);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue('');
    setEditingBillingCycle('daily');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCost = await apiClient.globalCosts.create(createForm);
      setCosts([...costs, newCost]);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        category: 'actor',
        billing_cycle: 'daily',
        cost: 0,
        description: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cost');
      console.error('Error creating cost:', err);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await apiClient.globalCosts.delete(id);
        setCosts(costs.filter(cost => cost.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete cost');
        console.error('Error deleting cost:', err);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const groupedCosts = costs.reduce((acc, cost) => {
    if (!acc[cost.category]) {
      acc[cost.category] = [];
    }
    acc[cost.category].push(cost);
    return acc;
  }, {} as Record<string, GlobalCost[]>);

  const categoryTitles = {
    actor: 'Actors',
    property: 'Properties & Equipment',
    location: 'Locations'
  };

  if (loading) {
    return (
      <Layout title="Global Costs" subtitle="Manage standard rates for actors, properties, and locations">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="ml-2 text-white">Loading global costs...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Global Costs" subtitle="Manage standard rates for actors, properties, and locations">
        <div className="max-w-4xl space-y-6">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-red-400 font-medium mb-1">Error Loading Data</h4>
                  <p className="text-sm text-gray-300">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Global Costs" subtitle="Manage standard rates for actors, properties, and locations">
      <div className="max-w-6xl space-y-8">
        {/* Add New Cost Button */}
        <div className="flex justify-between items-center mt-8">
          <h2 className="text-2xl font-bold text-white">Cost Items by Category</h2>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button variant="cinematic" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Add New Cost Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Global Cost</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter name (e.g., Actor Name, Equipment)"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select value={createForm.category} onValueChange={(value: 'actor' | 'property' | 'location') => 
                    setCreateForm({ ...createForm, category: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="actor" className="text-white">Actor</SelectItem>
                      <SelectItem value="property" className="text-white">Property</SelectItem>
                      <SelectItem value="location" className="text-white">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billing_cycle" className="text-white">Billing Cycle</Label>
                  <Select value={createForm.billing_cycle} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setCreateForm({ ...createForm, billing_cycle: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="daily" className="text-white">Daily</SelectItem>
                      <SelectItem value="weekly" className="text-white">Weekly</SelectItem>
                      <SelectItem value="monthly" className="text-white">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost" className="text-white">Cost (₹)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={createForm.cost}
                    onChange={(e) => setCreateForm({ ...createForm, cost: parseInt(e.target.value) || 0 })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter cost amount"
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    Create Cost
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category-wise Cost Cards */}
        {Object.entries(groupedCosts).map(([category, items]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-white capitalize">
                {categoryTitles[category as keyof typeof categoryTitles]}
              </h3>
              <div className="h-px bg-gray-600 flex-1"></div>
              <span className="text-sm text-gray-400">{items.length} items</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((cost) => (
                <Card key={cost.id} className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">{cost.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full capitalize">
                            {cost.category}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full capitalize">
                            {cost.billing_cycle}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(cost)}
                          className="text-amber-400 hover:text-amber-300 p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(cost.id, cost.name)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Cost Display/Edit */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Cost & Billing:</span>
                        {editingId === cost.id ? (
                          <div className="flex flex-col space-y-2 w-full max-w-xs">
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="w-24 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                                placeholder="Cost"
                              />
                              <Select value={editingBillingCycle} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                                setEditingBillingCycle(value)}>
                                <SelectTrigger className="w-20 h-8 bg-gray-700 border-gray-600 text-white text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  <SelectItem value="daily" className="text-white text-xs">Daily</SelectItem>
                                  <SelectItem value="weekly" className="text-white text-xs">Weekly</SelectItem>
                                  <SelectItem value="monthly" className="text-white text-xs">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleSave(cost.id)}
                                className="h-8 px-3 text-xs"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleCancel}
                                className="h-8 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {formatCurrency(cost.cost)}
                            </div>
                            <div className="text-xs text-gray-400">per {cost.billing_cycle}</div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {cost.description && (
                        <div className="border-t border-gray-700 pt-3">
                          <span className="text-sm text-gray-400">Description:</span>
                          <p className="text-sm text-gray-300 mt-1">{cost.description}</p>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="border-t border-gray-700 pt-3 space-y-1">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(cost.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(cost.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {costs.length === 0 && !loading && (
          <Card className="bg-gray-800/30 border-gray-700 border-dashed">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Global Costs Found</h3>
              <p className="text-gray-400 mb-4">
                Start by adding your first cost item to manage standard rates.
              </p>
              <Button variant="cinematic" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Cost Item
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">How to use Global Costs</h4>
                <p className="text-sm text-gray-300">
                  These standard rates will be automatically applied when creating project budgets and schedules. 
                  Click the edit icon on any card to update costs. Costs can be billed daily, weekly, or monthly based on the billing cycle.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}