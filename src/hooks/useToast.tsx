'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomToast from '@/components/CustomToast';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  autoClose?: boolean;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', options?: { autoClose?: boolean; duration?: number }) => void;
  showSuccess: (message: string, options?: { autoClose?: boolean; duration?: number }) => void;
  showError: (message: string, options?: { autoClose?: boolean; duration?: number }) => void;
  showInfo: (message: string, options?: { autoClose?: boolean; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'success', 
    options?: { autoClose?: boolean; duration?: number }
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 5000,
    };
    
    setToasts(prev => [...prev, newToast]);
  };

  const showSuccess = (message: string, options?: { autoClose?: boolean; duration?: number }) => {
    showToast(message, 'success', options);
  };

  const showError = (message: string, options?: { autoClose?: boolean; duration?: number }) => {
    showToast(message, 'error', options);
  };

  const showInfo = (message: string, options?: { autoClose?: boolean; duration?: number }) => {
    showToast(message, 'info', options);
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {/* Render toasts */}
      {toasts.map(toast => (
        <CustomToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          autoClose={toast.autoClose}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Replacement function for global alert()
export const customAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // This will be called from components that have access to the toast context
  if (typeof window !== 'undefined') {
    // Fallback to browser alert if toast context is not available
    window.alert(message);
  }
};