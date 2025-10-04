"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { BudgetItem, Project } from '@/lib/types';
import { useButtonActions } from '@/hooks/useButtonActions';

interface BudgetTabProps {
  projectId: string;
  project: Project;
  budget: BudgetItem[];
}

export default function BudgetTab({ projectId, project, budget }: BudgetTabProps) {
  const actions = useButtonActions();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalAllocated = budget.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = budget.reduce((sum, item) => sum + item.remaining, 0);
  const spentPercentage = (totalSpent / totalAllocated) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  ₹{(totalAllocated / 10000000).toFixed(1)}Cr
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
                  ₹{(totalSpent / 10000000).toFixed(1)}Cr
                </div>
                <div className="text-sm text-gray-400">Spent</div>
              </div>
              <TrendingUp className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  ₹{(totalRemaining / 10000000).toFixed(1)}Cr
                </div>
                <div className="text-sm text-gray-400">Remaining</div>
              </div>
              <TrendingDown className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {spentPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">Budget Used</div>
              </div>
              <AlertCircle className={`w-8 h-8 ${
                spentPercentage >= 90 ? 'text-red-400' : 
                spentPercentage >= 75 ? 'text-yellow-400' : 'text-green-400'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Overall Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Budget Utilization</span>
              <span className="text-white font-semibold">{spentPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(spentPercentage)}`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">₹0</span>
              <span className="text-gray-400">{formatCurrency(totalAllocated)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Budget Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budget.map((item) => {
              const itemPercentage = (item.spent / item.allocated) * 100;
              const isOverBudget = item.spent > item.allocated;
              
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{item.category}</h4>
                    <span className={`text-sm font-semibold ${
                      isOverBudget ? 'text-red-400' : 'text-white'
                    }`}>
                      {formatCurrency(item.spent)} / {formatCurrency(item.allocated)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isOverBudget ? 'bg-red-500' : getProgressColor(itemPercentage)
                      }`}
                      style={{ width: `${Math.min(itemPercentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">
                      {itemPercentage.toFixed(1)}% used
                    </span>
                    <span className={`font-medium ${
                      item.remaining >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.remaining >= 0 ? '+' : ''}{formatCurrency(item.remaining)} remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Budget Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="cinematic" 
                className="w-full"
                onClick={() => actions.handleUpdateBudget(projectId)}
              >
                Update Budget Allocation
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => actions.handleAddExpense(projectId)}
              >
                Add Expense Entry
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => actions.handleGenerateBudgetReport(projectId)}
              >
                Generate Budget Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Budget Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Most Expensive Category:</span>
                <span className="text-white font-medium">
                  {budget.sort((a, b) => b.allocated - a.allocated)[0]?.category || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Highest Spending:</span>
                <span className="text-white font-medium">
                  {budget.sort((a, b) => (b.spent/b.allocated) - (a.spent/a.allocated))[0]?.category || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Budget Efficiency:</span>
                <span className={`font-medium ${
                  spentPercentage <= 80 ? 'text-green-400' : 
                  spentPercentage <= 95 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {spentPercentage <= 80 ? 'Good' : 
                   spentPercentage <= 95 ? 'Moderate' : 'Over Budget'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}