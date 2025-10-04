"use client"

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useGlobalSearch, SearchResult } from '@/hooks/useGlobalSearch';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationPanel from '@/components/ui/NotificationPanel';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const SearchResultItem = ({ result, onSelect }: { result: SearchResult; onSelect: () => void }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'project': return '🎬';
      case 'scene': return '🎭';
      case 'character': return '👤';
      case 'actor': return '⭐';
      case 'location': return '📍';
      case 'prop': return '📦';
      default: return '🔍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-accent-primary';
      case 'scene': return 'text-accent-secondary';
      case 'character': return 'text-accent-primary';
      case 'actor': return 'text-accent-primary';
      case 'location': return 'text-accent-secondary';
      case 'prop': return 'text-accent-brown';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div 
      onClick={onSelect}
      className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer rounded-md transition-colors"
    >
      <span className="text-lg">{getIcon(result.type)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">{result.title}</span>
          <span className={`text-xs px-2 py-1 rounded-full bg-secondary-bg ${getTypeColor(result.type)} border border-accent-brown`}>
            {result.type}
          </span>
        </div>
        {result.description && (
          <p className="text-sm text-text-secondary truncate">{result.description}</p>
        )}
      </div>
    </div>
  );
};

export default function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { results, loading } = useGlobalSearch(searchQuery);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleResultSelect = (result: SearchResult) => {
    router.push(result.url);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-secondary-bg backdrop-blur-sm border-b border-accent-brown shadow-lg">
      <div className="ml-12">
        <h1 className="text-2xl font-bold text-accent-secondary">{title}</h1>
        {subtitle && (
          <p className="text-sm text-accent-primary">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Enhanced Search */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-accent-primary w-4 h-4" />
          <Input 
            placeholder="Search projects, scenes, actors..." 
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-80 bg-primary-bg border-accent-brown text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-accent-primary"
          />
          
          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute top-full left-0 right-0 mt-2 bg-secondary-bg border-accent-brown max-h-80 overflow-y-auto z-50 shadow-xl">
              {loading ? (
                <div className="p-4 text-center text-darkest">
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result) => (
                    <SearchResultItem 
                      key={`${result.type}-${result.id}`}
                      result={result} 
                      onSelect={() => handleResultSelect(result)}
                    />
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-darkest">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="p-4 text-center text-darkest">
                  Type at least 2 characters to search
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Enhanced Notifications */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleNotificationsClick}
          className="relative text-primary hover:text-secondary transition-colors"
          title="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Enhanced Profile */}
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-medium rounded-lg px-2 py-1 transition-colors">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-darkest font-bold text-sm">
            PM
          </div>
          <div className="hidden sm:block">
            <div className="text-sm text-light font-medium">Project Manager</div>
            <div className="text-xs text-primary">Celluloid Studios</div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDeleteNotification={deleteNotification}
        onClearAll={clearAll}
      />
    </div>
  );
}