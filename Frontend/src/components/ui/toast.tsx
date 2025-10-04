"use client"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastNotificationProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastNotification({ toast, onDismiss }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 50);

    // Auto dismiss
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }, toast.duration);
    }
  }, [toast.duration, toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success': return 'border-green-500/20 bg-green-500/10';
      case 'error': return 'border-red-500/20 bg-red-500/10';
      case 'warning': return 'border-yellow-500/20 bg-yellow-500/10';
      case 'info': return 'border-blue-500/20 bg-blue-500/10';
      default: return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  return (
    <Card 
      className={`${getColorClasses()} backdrop-blur-sm shadow-xl transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-gray-400 text-xs mt-1">{toast.description}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          className="text-gray-400 hover:text-white w-6 h-6 p-0 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, description?: string) => 
    addToast({ type: 'success', title, description });

  const error = (title: string, description?: string) => 
    addToast({ type: 'error', title, description });

  const warning = (title: string, description?: string) => 
    addToast({ type: 'warning', title, description });

  const info = (title: string, description?: string) => 
    addToast({ type: 'info', title, description });

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info
  };
}