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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Crediti Insufficienti</h2>
                <p className="text-gray-300 text-sm">Non puoi completare questa azione</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Credit Details */}
          <div className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Crediti attuali:</span>
              <span className="text-white font-semibold">{current}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Crediti richiesti:</span>
              <span className="text-red-400 font-semibold">{required}</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Ti mancano:</span>
              <span className="text-orange-400 font-bold">{missing} crediti</span>
            </div>
            {costDescription && (
              <div className="mt-2 text-xs text-gray-400">
                Operazione: {costDescription}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onRecharge?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Ricarica Crediti
            </button>
            
            <button
              onClick={() => {
                onSubscribe?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Abbonati (€19.99/mese)
            </button>
            
            <button
              onClick={() => {
                onLifetime?.();
                onClose();
              }}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Lifetime (€69 una tantum)
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              I crediti ti permettono di utilizzare tutte le funzioni AI di Studius
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;