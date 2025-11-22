'use client';

import React, { useState } from 'react';
import { X, Coins, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateCredits } = useAuth();

  const rechargeOptions = [
    {
      credits: 1000,
      price: '4,99€',
      popular: false
    },
    {
      credits: 3000,
      price: '9,99€',
      popular: true
    },
    {
      credits: 10000,
      price: '24,99€',
      popular: false
    }
  ];

  const handleRecharge = async (credits: number) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          amount: credits
        })
      });

      if (response.ok) {
        const data = await response.json();
        updateCredits(data.newBalance);
        alert(`🎉 Ricarica completata!\nAggiunti ${credits.toLocaleString()} crediti`);
        onClose();
      } else {
        throw new Error('Errore nella ricarica');
      }
    } catch (error) {
      console.error('Errore ricarica:', error);
      alert('Errore durante la ricarica. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ricarica Crediti</h2>
          <p className="text-gray-300 text-sm">Scegli il pacchetto che fa per te</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {rechargeOptions.map((option) => (
            <div
              key={option.credits}
              className={`relative bg-white/10 rounded-xl p-4 border cursor-pointer transition-all hover:bg-white/20 ${
                option.popular 
                  ? 'border-blue-500/50 ring-2 ring-blue-500/30' 
                  : 'border-white/20 hover:border-purple-500/50'
              }`}
              onClick={() => handleRecharge(option.credits)}
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Più popolare
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Coins className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {option.credits.toLocaleString()} crediti
                    </div>
                    <div className="text-gray-300 text-sm">{option.price}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">
                    {(option.credits / parseFloat(option.price.replace(',', '.').replace('€', ''))).toFixed(0)} crediti/€
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs">
          <p>💳 Per ora è simulato - i crediti vengono aggiunti immediatamente</p>
          <p>🔒 Pagamenti sicuri con Stripe (prossimamente)</p>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p>Aggiunta crediti...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargeModal;