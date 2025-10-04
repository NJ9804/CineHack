"use client"

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
  
  // Determine if we're on a project page and extract project ID
  const isProjectPage = pathname?.startsWith('/projects/') && pathname !== '/projects' && pathname !== '/projects/new';
  const projectId = isProjectPage ? pathname?.split('/')[2] : undefined;

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderEnhanced title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
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