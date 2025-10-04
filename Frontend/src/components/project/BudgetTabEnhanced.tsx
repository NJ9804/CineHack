"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, TrendingUp, TrendingDown, AlertCircle, FileText, Receipt } from 'lucide-react';
import api from '@/services/api/client';

interface BudgetLine {
  id: string;
  category: string;
  description: string;
  allocated_amount: number;
  spent_amount: number;
  status: string;
}

interface Expenditure {
  id: string;
  budget_line_id: string;
  amount: number;
  description: string;
  receipt_url?: string;
  date: string;
  vendor: string;
}

interface BudgetTabEnhancedProps {
  projectId: string;
}

const CATEGORIES = [
  'Cast', 'Crew', 'Equipment', 'Locations', 'Props', 'Costumes', 'Catering',
  'Transportation', 'Post-Production', 'Marketing', 'Contingency', 'Other'
];

export default function BudgetTabEnhanced({ projectId }: BudgetTabEnhancedProps) {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BudgetLine | null>(null);

  const [budgetFormData, setBudgetFormData] = useState({
    category: 'Other',
    description: '',
    allocated_amount: 0
  });

  const [expenseFormData, setExpenseFormData] = useState({
    budget_line_id: '',
    amount: 0,
    description: '',
    vendor: '',
    receipt_url: ''
  });

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lines, expenses] = await Promise.all([
        api.getBudgetLines(projectId),
        api.getExpenditures(projectId)
      ]);
      setBudgetLines(lines);
      setExpenditures(expenses);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudgetLine = async () => {
    try {
      await api.createBudgetLine(projectId, budgetFormData);
      setBudgetModalOpen(false);
      setBudgetFormData({ category: 'Other', description: '', allocated_amount: 0 });
      loadData();
    } catch (error) {
      console.error('Failed to add budget line:', error);
      alert('Failed to add budget line');
    }
  };

  const handleAddExpense = async () => {
    try {
      await api.createExpenditure(projectId, expenseFormData);
      setExpenseModalOpen(false);
      setExpenseFormData({
        budget_line_id: '',
        amount: 0,
        description: '',
        vendor: '',
        receipt_url: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert('Failed to add expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAllocated = budgetLines.reduce((sum, line) => sum + line.allocated_amount, 0);
  const totalSpent = budgetLines.reduce((sum, line) => sum + line.spent_amount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLineSpentPercentage = (line: BudgetLine) => {
    return line.allocated_amount > 0 ? (line.spent_amount / line.allocated_amount) * 100 : 0;
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading budget data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Budget Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            Track allocated budget and expenses across categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setBudgetModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Line
          </Button>
          <Button 
            onClick={() => setExpenseModalOpen(true)}
            variant="outline"
            className="border-green-600 text-green-400 hover:bg-green-600/10"
          >
            <Receipt className="w-4 h-4 mr-2" />
            Log Expense
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(totalAllocated)}
                </div>
                <div className="text-sm text-gray-400">Total Budget</div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-600/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="text-sm text-gray-400">Total Spent</div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(totalRemaining)}
                </div>
                <div className="text-sm text-gray-400">Remaining</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(spentPercentage)}%
                </div>
                <div className="text-sm text-gray-400">Budget Used</div>
              </div>
              <AlertCircle className={`w-8 h-8 ${spentPercentage >= 90 ? 'text-red-400' : spentPercentage >= 75 ? 'text-yellow-400' : 'text-green-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Overall Budget Progress</span>
              <span className="text-sm font-medium text-white">{Math.round(spentPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all ${getProgressColor(spentPercentage)}`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Spent: {formatCurrency(totalSpent)}</span>
              <span>Allocated: {formatCurrency(totalAllocated)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Lines */}
      {budgetLines.length === 0 ? (
        <Card className="bg-gray-900/30 border-dashed border-gray-600">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Budget Lines Yet</h3>
            <p className="text-gray-400 mb-6">
              Start by adding budget categories for your production
            </p>
            <Button 
              onClick={() => setBudgetModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Budget Line
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetLines.map((line) => {
            const lineSpent = line.spent_amount;
            const lineRemaining = line.allocated_amount - lineSpent;
            const linePercentage = getLineSpentPercentage(line);
            const lineExpenses = expenditures.filter(e => e.budget_line_id === line.id);

            return (
              <Card key={line.id} className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{line.category}</CardTitle>
                      <p className="text-sm text-gray-400 mt-1">{line.description}</p>
                    </div>
                    <Badge className={
                      linePercentage >= 90 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      linePercentage >= 75 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    }>
                      {Math.round(linePercentage)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressColor(linePercentage)}`}
                        style={{ width: `${Math.min(linePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatCurrency(lineSpent)}</span>
                      <span>{formatCurrency(line.allocated_amount)}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-xs text-gray-500">Allocated</div>
                      <div className="text-sm font-bold text-white">{formatCurrency(line.allocated_amount)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-xs text-gray-500">Spent</div>
                      <div className="text-sm font-bold text-red-400">{formatCurrency(lineSpent)}</div>
                    </div>
                    <div className="bg-gray-800/50 rounded p-2">
                      <div className="text-xs text-gray-500">Remaining</div>
                      <div className="text-sm font-bold text-green-400">{formatCurrency(lineRemaining)}</div>
                    </div>
                  </div>

                  {/* Expenses Count */}
                  <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-400">{lineExpenses.length} expense(s)</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setExpenseFormData({ ...expenseFormData, budget_line_id: line.id });
                        setExpenseModalOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 h-6"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Expense
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Budget Line Modal */}
      <Dialog open={budgetModalOpen} onOpenChange={setBudgetModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add Budget Line</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new budget category for your production
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Category *</Label>
              <select
                value={budgetFormData.category}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-gray-300">Description</Label>
              <Input
                value={budgetFormData.description}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, description: e.target.value })}
                placeholder="e.g., Lead actor fees, Equipment rental"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Allocated Amount (₹) *</Label>
              <Input
                type="number"
                value={budgetFormData.allocated_amount}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, allocated_amount: parseFloat(e.target.value) })}
                min="0"
                step="1000"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddBudgetLine}
              disabled={budgetFormData.allocated_amount <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Budget Line
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Modal */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Log Expense</DialogTitle>
            <DialogDescription className="text-gray-400">
              Record a new expense against a budget line
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Budget Line *</Label>
              <select
                value={expenseFormData.budget_line_id}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, budget_line_id: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                <option value="">Select category...</option>
                {budgetLines.map(line => (
                  <option key={line.id} value={line.id}>
                    {line.category} - {line.description || 'No description'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-gray-300">Amount (₹) *</Label>
              <Input
                type="number"
                value={expenseFormData.amount}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: parseFloat(e.target.value) })}
                min="0"
                step="100"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description *</Label>
              <Input
                value={expenseFormData.description}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                placeholder="What was this expense for?"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Vendor</Label>
              <Input
                value={expenseFormData.vendor}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, vendor: e.target.value })}
                placeholder="Who was paid?"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Receipt URL (optional)</Label>
              <Input
                value={expenseFormData.receipt_url}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, receipt_url: e.target.value })}
                placeholder="https://..."
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddExpense}
              disabled={!expenseFormData.budget_line_id || expenseFormData.amount <= 0 || !expenseFormData.description}
              className="bg-green-600 hover:bg-green-700"
            >
              Log Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
