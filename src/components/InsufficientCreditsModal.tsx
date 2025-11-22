'use client';

import React from 'react';
import { X, Coins, CreditCard, Crown, Zap } from 'lucide-react';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  required: number;
  current: number;
  costDescription?: string;
  onRecharge?: () => void;
  onSubscribe?: () => void;
  onLifetime?: () => void;
}

const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({ 
  isOpen, 
  onClose, 
  required, 
  current,
  costDescription,
  onRecharge,
  onSubscribe,
  onLifetime
}) => {
  if (!isOpen) return null;

  const missing = required - current;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-3xl blur-xl" />
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-xl text-white font-semibold">
              Non hai abbastanza crediti per questa azione.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onRecharge?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
            >
              Ricarica
            </button>
            
            <button
              onClick={() => {
                onSubscribe?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300"
            >
              Abbonati
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 border border-white/20"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;