"use client"

import { useState, useEffect } from 'react';
import { Notification } from '@/components/ui/NotificationPanel';

// Mock notifications data - in a real app, this would come from an API
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'budget_alert',
    severity: 'high',
    title: 'Budget Exceeded',
    message: 'The Great Adventure project has exceeded 85% of allocated budget. Immediate review required.',
    projectId: '1',
    projectName: 'The Great Adventure',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    actionUrl: '/projects/1?tab=budget'
  },
  {
    id: '2',
    type: 'schedule_conflict',
    severity: 'medium',
    title: 'Scheduling Conflict',
    message: 'Lead actor availability conflict detected for Scene 15 scheduled tomorrow.',
    projectId: '2',
    projectName: 'Mystery Thriller',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: false,
    actionUrl: '/projects/2?tab=schedule'
  },
  {
    id: '3',
    type: 'weather_warning',
    severity: 'medium',
    title: 'Weather Alert',
    message: 'Heavy rain predicted for outdoor shoot location tomorrow. Consider rescheduling.',
    projectId: '1',
    projectName: 'The Great Adventure',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: true,
    actionUrl: '/projects/1?tab=schedule'
  },
  {
    id: '4',
    type: 'cast_update',
    severity: 'low',
    title: 'New Actor Added',
    message: 'Priya Sharma has been added to the cast database with daily rate ₹50,000.',
    projectId: '3',
    projectName: 'Drama Film',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    read: true,
    actionUrl: '/projects/3?tab=catalog'
  },
  {
    id: '5',
    type: 'equipment_issue',
    severity: 'high',
    title: 'Equipment Malfunction',
    message: 'Camera 2 reported faulty. Backup equipment requested for tomorrow\'s shoot.',
    projectId: '2',
    projectName: 'Mystery Thriller',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    read: false,
    actionUrl: '/projects/2?tab=scenes'
  },
  {
    id: '6',
    type: 'general',
    severity: 'low',
    title: 'System Update',
    message: 'Celluloid system will undergo maintenance tonight from 2 AM to 4 AM IST.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a new notification (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'general',
          severity: 'low',
          title: 'Real-time Update',
          message: 'This is a simulated real-time notification to demonstrate the system.',
          timestamp: new Date().toISOString(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification
  };
}