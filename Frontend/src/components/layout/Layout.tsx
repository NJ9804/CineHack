"use client"

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import HeaderEnhanced from './HeaderEnhanced';
import QuickActionsMenu from './QuickActionsMenu';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Determine if we're on a project page and extract project ID
  const isProjectPage = pathname?.startsWith('/projects/') && pathname !== '/projects' && pathname !== '/projects/new';
  const projectId = isProjectPage ? pathname?.split('/')[2] : undefined;

  return (
    <div className="min-h-screen bg-primary-bg">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <HeaderEnhanced title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 pt-20 bg-primary-bg">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Quick Actions Menu */}
      <QuickActionsMenu 
        projectId={projectId} 
        isProjectPage={isProjectPage} 
      />
    </div>
  );
}