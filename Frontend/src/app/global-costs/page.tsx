"use client"

import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Edit3, Plus } from 'lucide-react';
import { mockGlobalCosts } from '@/services/mock/data';
import { GlobalCost } from '@/lib/types';

export default function GlobalCostsPage() {
  const [costs, setCosts] = useState<GlobalCost[]>(mockGlobalCosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const handleEdit = (cost: GlobalCost) => {
    setEditingId(cost.id);
    setEditingValue(cost.cost.toString());
  };

  const handleSave = (id: string) => {
    const newCost = parseInt(editingValue);
    setCosts(costs.map(cost => 
      cost.id === id ? { ...cost, cost: newCost } : cost
    ));
    setEditingId(null);
    setEditingValue('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue('');
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
    actors: 'Actors',
    actresses: 'Actresses',
    properties: 'Properties & Equipment'
  };

  return (
    <Layout title="Global Costs" subtitle="Manage standard rates for actors, actresses, and properties">
      <div className="max-w-4xl space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(groupedCosts).map(([category, items]) => {
            const total = items.reduce((sum, item) => sum + item.cost, 0);
            return (
              <Card key={category} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white capitalize">{categoryTitles[category as keyof typeof categoryTitles]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-amber-400">{items.length} items</div>
                    <div className="text-sm text-gray-400">
                      Average: {formatCurrency(total / items.length)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Cost Management */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Cost Categories</CardTitle>
              <Button variant="cinematic" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedCosts).map(([category, items]) => (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-white hover:text-amber-400">
                    {categoryTitles[category as keyof typeof categoryTitles]} ({items.length} items)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {items.map((cost) => (
                        <div key={cost.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{cost.name}</h4>
                            <p className="text-sm text-gray-400 capitalize">{cost.category}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {editingId === cost.id ? (
                              <>
                                <Input
                                  type="number"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="w-32 bg-gray-700 border-gray-600 text-white"
                                  placeholder="Enter cost"
                                />
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleSave(cost.id)}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={handleCancel}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-right">
                                  <div className="text-lg font-semibold text-white">
                                    {formatCurrency(cost.cost)}
                                  </div>
                                  {category === 'properties' && (
                                    <div className="text-xs text-gray-400">per day</div>
                                  )}
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(cost)}
                                  className="text-amber-400 hover:text-amber-300"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <h4 className="text-blue-400 font-medium mb-1">How to use Global Costs</h4>
                <p className="text-sm text-gray-300">
                  These standard rates will be automatically applied when creating project budgets and schedules. 
                  Update them here to reflect current market rates. Property costs are typically calculated per day of usage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}