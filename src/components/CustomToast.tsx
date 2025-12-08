'use client';

import { AlertCircle, CheckCircle, X,XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const CustomToast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setIsVisible(true);

    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for fade-out animation before calling onClose
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'info':
      default:
        return <AlertCircle className="w-6 h-6 text-blue-400" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Successo!';
      case 'error':
        return 'Errore';
      case 'info':
      default:
        return 'Informazione';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-purple-400/50';
      case 'error':
        return 'border-purple-400/50';
      case 'info':
      default:
        return 'border-purple-400/50';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-purple-900/40 to-green-900/40';
      case 'error':
        return 'from-purple-900/40 to-red-900/40';
      case 'info':
      default:
        return 'from-purple-900/40 to-indigo-900/40';
    }
  };

  // Parse message for title and details
  const parseMessage = (msg: string) => {
    if (msg.includes('\n')) {
      const lines = msg.split('\n');
      const title = lines[0].replace(/[🎯🎉📄🔊❌⚠️✅]/g, '').trim();
      const details = lines.slice(1).join('\n').trim();
      return { title, details };
    }
    return { 
      title: msg.replace(/[🎯🎉📄🔊❌⚠️✅]/g, '').trim(), 
      details: '' 
    };
  };

  const { title, details } = parseMessage(message);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Toast Modal */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
          isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <div 
          className={`relative bg-gradient-to-br ${getGradient()} backdrop-blur-xl rounded-2xl border ${getBorderColor()} shadow-2xl max-w-md w-full mx-4 p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>

          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 mt-1">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {title || getTitle()}
              </h3>
              {details && (
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {details}
                </p>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomToast;