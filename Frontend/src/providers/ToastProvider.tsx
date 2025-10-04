"use client"

import React, { createContext, useContext } from 'react';
import { useToast, ToastContainer, Toast } from '@/components/ui/toast';
import { Toaster } from 'sonner';

interface ToastContextType {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, dismissToast, success, error, warning, info, addToast } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Toaster position="top-right" richColors />
    </ToastContext.Provider>
  );
}

export function useToastNotification() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastNotification must be used within a ToastProvider');
  }
  return context;
}