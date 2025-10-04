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
import { ShoppingCart, Plus } from 'lucide-react';

export default function PurchasesManager({ projectId }: { projectId: number }) {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'art_supplies',
    description: '',
    quantity: 1,
    unit_price: 0,
    total_amount: 0,
    final_amount: 0,
    vendor_name: '',
    purchase_date: '',
    payment_method: 'cash',
    department: '',
    notes: '',
  });

  useEffect(() => {
    fetchPurchases();
  }, [projectId]);

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/api/operations/purchases/${projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/api/operations/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, project_id: projectId }),
      });
      setIsDialogOpen(false);
      fetchPurchases();
    } catch (error) {
      console.error('Error creating purchase:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent-secondary">🛒 Purchase Tracking</h2>
          <p className="text-text-secondary">Track all production purchases and expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-primary-bg transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />🛒 Add Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-secondary-bg/95 border-2 border-accent-brown/70 shadow-2xl backdrop-blur-md">
            <DialogHeader className="bg-primary-bg/90 -m-6 mb-4 p-6 rounded-t-lg border-b border-accent-brown/30">
              <DialogTitle className="text-accent-secondary text-xl font-semibold">🛒 Record New Purchase</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 bg-primary-bg/95 p-6 rounded-lg border border-accent-brown/30">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-accent-secondary font-medium">Item Name *</Label>
                  <Input 
                    value={formData.item_name} 
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} 
                    required
                    className="bg-secondary-bg/90 border-accent-brown/40 text-text-primary placeholder:text-text-secondary/60 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50"
                  />
                </div>
                <div>
                  <Label className="text-accent-secondary font-medium">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art_supplies">Art Supplies</SelectItem>
                      <SelectItem value="props">Props</SelectItem>
                      <SelectItem value="costumes">Costumes</SelectItem>
                      <SelectItem value="consumables">Consumables</SelectItem>
                      <SelectItem value="stationary">Stationary</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} min="1" />
                </div>
                <div>
                  <Label>Unit Price (₹)</Label>
                  <Input type="number" value={formData.unit_price} onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })} min="0" />
                </div>
                <div>
                  <Label>Total Amount (₹) *</Label>
                  <Input type="number" value={formData.total_amount} onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value), final_amount: parseFloat(e.target.value) })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <Input value={formData.vendor_name} onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })} />
                </div>
                <div>
                  <Label>Purchase Date *</Label>
                  <Input type="datetime-local" value={formData.purchase_date} onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="Art, Costume, Props" />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-accent-brown/30 text-text-secondary hover:bg-accent-brown/20">
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent-primary text-primary-bg hover:bg-accent-primary/90">
                  🛒 Record Purchase
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id} className="bg-gradient-to-br from-secondary-bg to-accent-brown/10 border-accent-brown shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent-primary/20 rounded-lg group-hover:bg-accent-primary/30 transition-colors">
                      <ShoppingCart className="h-5 w-5 text-accent-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-accent-secondary">🛒 {purchase.item_name}</h3>
                    <Badge className="bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30">
                      {purchase.category}
                    </Badge>
                    <Badge className={`${
                      purchase.payment_status === 'paid' ? 'bg-accent-primary/20 text-accent-primary border-accent-primary/30' :
                      'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {purchase.payment_status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-medium">{purchase.quantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vendor</p>
                      <p className="font-medium">{purchase.vendor_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-medium">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-medium">₹{purchase.final_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
