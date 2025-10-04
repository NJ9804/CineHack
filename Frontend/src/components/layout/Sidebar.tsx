"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Home, 
  DollarSign, 
  Film, 
  User, 
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Global Costs', href: '/global-costs', icon: DollarSign },
  { name: 'Projects', href: '/projects', icon: Film },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-secondary-bg hover:bg-accent-brown transition-colors border border-accent-brown shadow-lg"
      >
        {isCollapsed ? (
          <Menu className="w-5 h-5 text-accent-primary" />
        ) : (
          <X className="w-5 h-5 text-accent-primary" />
        )}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full backdrop-blur-sm border-r transition-transform duration-300 z-40 shadow-2xl",
        "flex flex-col w-64",
        "bg-secondary-bg border-accent-brown",
        isCollapsed ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-accent-brown mt-12">
          <h1 className="text-2xl font-bold text-accent-primary">
            Celluloid
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsCollapsed(true)}
                className={cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-accent-primary text-primary-bg border border-accent-primary shadow-md'
                    : 'text-accent-secondary hover:bg-accent-brown hover:text-accent-primary'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-accent-brown">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-bg" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                Production Manager
              </p>
              <p className="text-xs text-text-secondary truncate">
                Active Session
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}