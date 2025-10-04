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
      case 'project': return 'text-blue-400';
      case 'scene': return 'text-green-400';
      case 'character': return 'text-purple-400';
      case 'actor': return 'text-amber-400';
      case 'location': return 'text-red-400';
      case 'prop': return 'text-cyan-400';
      default: return 'text-gray-400';
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
          <span className="font-medium text-white truncate">{result.title}</span>
          <span className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${getTypeColor(result.type)} border border-gray-600`}>
            {result.type}
          </span>
        </div>
        {result.description && (
          <p className="text-sm text-gray-400 truncate">{result.description}</p>
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
    <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-400">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Enhanced Search */}
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search projects, scenes, actors..." 
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-80 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500"
          />
          
          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border-gray-700 max-h-80 overflow-y-auto z-50 shadow-xl">
              {loading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div>
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
                <div className="p-4 text-center text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
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
          className="relative text-gray-400 hover:text-white transition-colors"
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
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 rounded-lg px-2 py-1 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
            PM
          </div>
          <div className="hidden sm:block">
            <div className="text-sm text-white font-medium">Project Manager</div>
            <div className="text-xs text-gray-400">Celluloid Studios</div>
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