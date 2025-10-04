"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  MapPin,
  Users,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'budget_alert' | 'schedule_conflict' | 'weather_warning' | 'equipment_issue' | 'cast_update' | 'general';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'budget_alert': return <DollarSign className="w-5 h-5" />;
      case 'schedule_conflict': return <Calendar className="w-5 h-5" />;
      case 'weather_warning': return <AlertTriangle className="w-5 h-5" />;
      case 'equipment_issue': return <AlertTriangle className="w-5 h-5" />;
      case 'cast_update': return <Users className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    if (notification.severity === 'high') {
      return 'border-red-500/30 bg-red-500/5 text-red-400';
    } else if (notification.severity === 'medium') {
      return 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400';
    }
    return 'border-blue-500/30 bg-blue-500/5 text-blue-400';
  };

  const getSeverityBadge = () => {
    const colors = {
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    
    return (
      <Badge className={`text-xs ${colors[notification.severity]}`}>
        {notification.severity}
      </Badge>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`${getColorClasses()} transition-all duration-200 hover:shadow-md ${
      !notification.read ? 'ring-1 ring-amber-500/20' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getColorClasses()}`}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-white text-sm truncate">
                {notification.title}
              </h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getSeverityBadge()}
                {!notification.read && (
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">
              {notification.message}
            </p>
            
            {notification.projectName && (
              <p className="text-xs text-gray-400 mb-2">
                Project: {notification.projectName}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {formatTime(notification.timestamp)}
              </span>
              
              <div className="flex gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-6 px-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Mark Read
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(notification.id)}
                  className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                Mark all read
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedNotifications.length > 0 ? (
            <>
              {sortedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDeleteNotification}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h4 className="text-gray-400 font-medium mb-1">No notifications</h4>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-700 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="w-full text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Notifications
            </Button>
          </div>
        )}
      </div>
    </>
  );
}