"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Film, 
  Users, 
  MapPin, 
  Package, 
  DollarSign, 
  Calendar,
  Settings,
  BarChart3,
  FileText
} from 'lucide-react';

interface QuickActionsMenuProps {
  projectId?: string;
  isProjectPage?: boolean;
}

export default function QuickActionsMenu({ projectId, isProjectPage = false }: QuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const globalActions = [
    {
      icon: Film,
      label: 'New Project',
      description: 'Start a new film project',
      action: () => router.push('/projects/new'),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: DollarSign,
      label: 'Global Costs',
      description: 'Manage standard rates',
      action: () => router.push('/global-costs'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View production insights',
      action: () => alert('Analytics dashboard coming soon!'),
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'System preferences',
      action: () => alert('Settings panel coming soon!'),
      color: 'from-gray-500 to-gray-600'
    }
  ];

  const projectActions = [
    {
      icon: Users,
      label: 'Add Actor',
      description: 'Add to cast database',
      action: () => router.push(`/projects/${projectId}?tab=catalog&action=add-actor`),
      color: 'from-amber-500 to-yellow-600'
    },
    {
      icon: MapPin,
      label: 'Add Location',
      description: 'Add shooting location',
      action: () => router.push(`/projects/${projectId}?tab=catalog&action=add-location`),
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: Package,
      label: 'Add Props',
      description: 'Add to props inventory',
      action: () => router.push(`/projects/${projectId}?tab=catalog&action=add-prop`),
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Calendar,
      label: 'Schedule Scene',
      description: 'Add to shooting schedule',
      action: () => router.push(`/projects/${projectId}?tab=schedule&action=add-scene`),
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: FileText,
      label: 'Add Expense',
      description: 'Log project expense',
      action: () => router.push(`/projects/${projectId}?tab=budget&action=add-expense`),
      color: 'from-green-500 to-teal-600'
    }
  ];

  const actions = isProjectPage ? projectActions : globalActions;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg z-50"
        size="lg"
      >
        <Plus className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Quick Actions Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm shadow-xl p-4 min-w-[300px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                {isProjectPage ? 'Project Actions' : 'Quick Actions'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white w-6 h-6 p-0"
              >
                ×
              </Button>
            </div>
            
            {actions.map((action, index) => (
              <div
                key={index}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium group-hover:text-amber-400 transition-colors">
                    {action.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {action.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* Close button */}
        <Button
          onClick={() => setIsOpen(false)}
          className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transform rotate-45"
          size="lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
}