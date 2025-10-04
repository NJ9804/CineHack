'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface RentalItem {
  id: number;
  item_name: string;
  item_type: string;
  category: string;
  vendor_name: string;
  vendor_contact: string;
  rental_start_date: string;
  rental_end_date: string;
  actual_return_date: string | null;
  daily_rate: number;
  total_cost: number;
  penalty_charges: number;
  status: string;
  condition_on_pickup: string;
  condition_on_return: string | null;
  notes: string;
}

export default function RentalsManager({ projectId }: { projectId: number }) {
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  
  const [returnFormData, setReturnFormData] = useState({
    condition_on_return: 'good',
    notes: '',
  });

  const [formData, setFormData] = useState({
    item_name: '',
    item_type: 'equipment',
    category: '',
    description: '',
    quantity: 1,
    vendor_name: '',
    vendor_contact: '',
    vendor_email: '',
    vendor_address: '',
    rental_start_date: '',
    rental_end_date: '',
    daily_rate: 0,
    security_deposit: 0,
    department: '',
    notes: '',
  });

  useEffect(() => {
    fetchRentals();
  }, [projectId, filterStatus, filterType, showOverdueOnly]);

  const fetchRentals = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('item_type', filterType);
      if (showOverdueOnly) params.append('overdue_only', 'true');

      const response = await fetch(
        `http://localhost:8000/api/operations/rentals/${projectId}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRentals(data.rentals);
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      toast.error('Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/operations/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          project_id: projectId,
        }),
      });

      if (response.ok) {
        toast.success('Rental item added successfully');
        setIsDialogOpen(false);
        fetchRentals();
        resetForm();
      } else {
        toast.error('Failed to add rental item');
      }
    } catch (error) {
      console.error('Error adding rental:', error);
      toast.error('An error occurred');
    }
  };

  const openReturnDialog = (rental: RentalItem) => {
    setSelectedRental(rental);
    setReturnFormData({
      condition_on_return: 'good',
      notes: rental.notes || '',
    });
    setIsReturnDialogOpen(true);
  };

  const markAsReturned = async () => {
    if (!selectedRental) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/rentals/${selectedRental.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'returned',
            actual_return_date: new Date().toISOString(),
            condition_on_return: returnFormData.condition_on_return,
            notes: returnFormData.notes,
          }),
        }
      );

      if (response.ok) {
        toast.success('Rental marked as returned successfully!');
        setIsReturnDialogOpen(false);
        fetchRentals();
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to update rental');
      }
    } catch (error) {
      console.error('Error updating rental:', error);
      toast.error('An error occurred while updating');
    }
  };

  const openEditDialog = (rental: RentalItem) => {
    setSelectedRental(rental);
    setFormData({
      item_name: rental.item_name,
      item_type: rental.item_type,
      category: rental.category || '',
      description: '',
      quantity: 1,
      vendor_name: rental.vendor_name,
      vendor_contact: rental.vendor_contact || '',
      vendor_email: '',
      vendor_address: '',
      rental_start_date: rental.rental_start_date.substring(0, 16),
      rental_end_date: rental.rental_end_date.substring(0, 16),
      daily_rate: rental.daily_rate,
      security_deposit: 0,
      department: '',
      notes: rental.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/rentals/${selectedRental.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            item_name: formData.item_name,
            notes: formData.notes,
          }),
        }
      );

      if (response.ok) {
        toast.success('Rental updated successfully!');
        setIsEditDialogOpen(false);
        fetchRentals();
      } else {
        toast.error('Failed to update rental');
      }
    } catch (error) {
      console.error('Error updating rental:', error);
      toast.error('An error occurred');
    }
  };

  const deleteRental = async (rentalId: number) => {
    if (!confirm('Are you sure you want to delete this rental item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/rentals/${rentalId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Rental deleted successfully!');
        fetchRentals();
      } else {
        toast.error('Failed to delete rental');
      }
    } catch (error) {
      console.error('Error deleting rental:', error);
      toast.error('An error occurred');
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      item_type: 'equipment',
      category: '',
      description: '',
      quantity: 1,
      vendor_name: '',
      vendor_contact: '',
      vendor_email: '',
      vendor_address: '',
      rental_start_date: '',
      rental_end_date: '',
      daily_rate: 0,
      security_deposit: 0,
      department: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      reserved: { color: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30', label: 'Reserved' },
      picked_up: { color: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30', label: 'Picked Up' },
      in_use: { color: 'bg-accent-primary/20 text-accent-primary border-accent-primary/30', label: 'In Use' },
      returned: { color: 'bg-accent-brown/20 text-accent-secondary border-accent-brown/30', label: 'Returned' },
      overdue: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Overdue' },
      damaged: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Damaged' },
    };
    const variant = variants[status] || variants.reserved;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const isOverdue = (rental: RentalItem) => {
    if (rental.actual_return_date || rental.status === 'returned') return false;
    return new Date(rental.rental_end_date) < new Date();
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 text-accent-secondary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent-secondary flex items-center gap-2">
            📦 Rental Management
          </h2>
          <p className="text-accent-secondary/70">Track equipment, costumes, props, and art production rentals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent-primary hover:bg-accent-primary/80 text-primary-bg font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Add Rental
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
            <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b-2 border-accent-brown/60">
              <DialogTitle className="text-accent-secondary font-bold text-xl">📦 Add New Rental Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 bg-primary-bg/95 p-6 rounded-lg border-2 border-accent-brown/60 shadow-xl backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Item Name *</Label>
                  <Input
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    required
                    className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <Label className="text-text-secondary text-sm block mb-1 font-medium">Item Type *</Label>
                  <Select
                    value={formData.item_type}
                    onValueChange={(value) => setFormData({ ...formData, item_type: value })}
                  >
                    <SelectTrigger className="bg-secondary-bg/90 border-accent-brown/60 text-text-primary focus:border-accent-primary shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-primary-bg/95 border-accent-brown/60 backdrop-blur-sm">
                      <SelectItem value="equipment" className="text-text-primary hover:bg-secondary-bg/80">Equipment</SelectItem>
                      <SelectItem value="costume" className="text-text-primary hover:bg-secondary-bg/80">Costume</SelectItem>
                      <SelectItem value="prop" className="text-text-primary hover:bg-secondary-bg/80">Prop</SelectItem>
                      <SelectItem value="art_production" className="text-text-primary hover:bg-secondary-bg/80">Art Production</SelectItem>
                      <SelectItem value="vehicle" className="text-text-primary hover:bg-secondary-bg/80">Vehicle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Camera, Lighting, Wardrobe"
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Vendor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vendor Name *</Label>
                    <Input
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Vendor Contact</Label>
                    <Input
                      value={formData.vendor_contact}
                      onChange={(e) => setFormData({ ...formData, vendor_contact: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Rental Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.rental_start_date}
                      onChange={(e) => setFormData({ ...formData, rental_start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.rental_end_date}
                      onChange={(e) => setFormData({ ...formData, rental_end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Daily Rate (₹)</Label>
                  <Input
                    type="number"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label>Security Deposit (₹)</Label>
                  <Input
                    type="number"
                    value={formData.security_deposit}
                    onChange={(e) => setFormData({ ...formData, security_deposit: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Art, Camera, Costume"
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-accent-brown/30 text-accent-secondary hover:bg-accent-brown/10">
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent-primary hover:bg-accent-primary/80 text-primary-bg font-semibold">Add Rental</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-secondary-bg to-accent-brown/5 border-accent-brown/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label>Status Filter</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type Filter</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="costume">Costume</SelectItem>
                  <SelectItem value="prop">Prop</SelectItem>
                  <SelectItem value="art_production">Art Production</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={showOverdueOnly ? 'default' : 'outline'}
                onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                className={showOverdueOnly 
                  ? "bg-accent-primary hover:bg-accent-primary/80 text-primary-bg" 
                  : "border-accent-brown/30 text-accent-secondary hover:bg-accent-brown/10"
                }
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Show Overdue Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rentals List */}
      <div className="grid gap-4">
        {rentals.length === 0 ? (
          <Card className="bg-gradient-to-r from-secondary-bg to-accent-brown/5 border-accent-brown/20">
            <CardContent className="p-8 text-center text-accent-secondary/70">
              No rental items found
            </CardContent>
          </Card>
        ) : (
          rentals.map((rental) => (
            <Card key={rental.id} className={`bg-gradient-to-r from-secondary-bg to-accent-brown/5 border-accent-brown/20 shadow-lg hover:shadow-xl transition-all duration-300 ${isOverdue(rental) ? 'border-red-500/50 bg-gradient-to-r from-red-500/5 to-secondary-bg' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-accent-primary" />
                      <h3 className="text-lg font-semibold text-accent-secondary">{rental.item_name}</h3>
                      {getStatusBadge(rental.status)}
                      {isOverdue(rental) && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-accent-secondary/70">Type</p>
                        <p className="font-medium text-accent-secondary">{rental.item_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-accent-secondary/70">Vendor</p>
                        <p className="font-medium text-accent-secondary">{rental.vendor_name}</p>
                      </div>
                      <div>
                        <p className="text-accent-secondary/70">Rental Period</p>
                        <p className="font-medium text-accent-secondary">
                          {new Date(rental.rental_start_date).toLocaleDateString()} - {new Date(rental.rental_end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-accent-secondary/70">Cost</p>
                        <p className="font-medium text-accent-primary">₹{rental.total_cost.toLocaleString()}</p>
                      </div>
                    </div>
                    {rental.notes && (
                      <p className="mt-3 text-sm text-accent-secondary/70">{rental.notes}</p>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    {rental.status !== 'returned' && (
                      <Button
                        size="sm"
                        onClick={() => openReturnDialog(rental)}
                        className="bg-accent-primary hover:bg-accent-primary/80 text-primary-bg font-medium"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Returned
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(rental)}
                      className="border-accent-brown/30 text-accent-secondary hover:bg-accent-brown/10"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteRental(rental.id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Return Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
          <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b border-accent-brown/30">
            <DialogTitle className="text-accent-secondary text-xl font-semibold">Mark Item as Returned</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-accent-secondary/70 mb-2">
                Item: <strong className="text-accent-secondary">{selectedRental?.item_name}</strong>
              </p>
              <p className="text-sm text-accent-secondary/70">
                Return Date: <strong className="text-accent-primary">{new Date().toLocaleDateString()}</strong>
              </p>
            </div>
            <div>
              <Label className="text-accent-secondary font-medium">Condition on Return *</Label>
              <Select
                value={returnFormData.condition_on_return}
                onValueChange={(value) => setReturnFormData({ ...returnFormData, condition_on_return: value })}
              >
                <SelectTrigger className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-secondary-bg/95 border-accent-brown/50 backdrop-blur-sm">
                  <SelectItem value="good" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Good</SelectItem>
                  <SelectItem value="fair" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Fair</SelectItem>
                  <SelectItem value="damaged" className="text-text-primary hover:bg-accent-brown/20 focus:bg-accent-brown/20">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-accent-secondary font-medium">Return Notes</Label>
              <Textarea
                value={returnFormData.notes}
                onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                placeholder="Any issues or notes about the return..."
                rows={3}
                className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 resize-none"
              />
            </div>
            {selectedRental && isOverdue(selectedRental) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <p className="text-sm text-red-400 font-medium">
                  ⚠️ This item is overdue. Penalty charges may apply.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)} className="border-accent-brown/30 text-accent-secondary hover:bg-accent-brown/10">
              Cancel
            </Button>
            <Button onClick={markAsReturned} className="bg-accent-primary hover:bg-accent-primary/80 text-primary-bg font-semibold">
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
          <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b border-accent-brown/30">
            <DialogTitle className="text-accent-secondary text-xl font-semibold">Edit Rental Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6 bg-primary-bg/95 p-6 rounded-lg border border-accent-brown/30">
            <div>
              <Label className="text-accent-secondary font-medium">Item Name *</Label>
              <Input
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                required
                className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-accent-secondary font-medium">Vendor Name</Label>
                <Input
                  value={formData.vendor_name}
                  onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                  readOnly
                  className="bg-secondary-bg/50 border-accent-brown/30 text-text-secondary cursor-not-allowed"
                />
              </div>
              <div>
                <Label className="text-accent-secondary font-medium">Daily Rate</Label>
                <Input
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
                  className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                />
              </div>
            </div>
            <div>
              <Label className="text-accent-secondary font-medium">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-accent-brown/30 text-accent-secondary hover:bg-accent-brown/10">
                Cancel
              </Button>
              <Button type="submit" className="bg-accent-primary hover:bg-accent-primary/80 text-primary-bg font-semibold">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
