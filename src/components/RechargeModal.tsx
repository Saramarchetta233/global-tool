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
  const { user, refreshProfile } = useAuth();

  const rechargeOptions = [
    {
      credits: 1000,
      price: '9,99€',
      popular: false,
      packageType: '1000'
    },
    {
      credits: 3000,
      price: '14,99€',
      popular: true,
      packageType: '3000'
    },
    {
      credits: 10000,
      price: '39,99€',
      popular: false,
      packageType: '10000'
    }
  ];

  const handleRecharge = async (option: typeof rechargeOptions[0]) => {
    if (!user?.id) return;
    
    // Check if user can purchase recharges
    if (!user.canPurchaseRecharge) {
      alert('⚠️ Ricariche disponibili solo con abbonamento attivo!\n\nAttiva un piano Mensile o Lifetime per sbloccare le ricariche.');
      onClose();
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/credits/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          packageType: option.packageType
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh user profile to get updated credits
        await refreshProfile();
        
        alert(`🎉 Ricarica completata!\nAggiunti ${option.credits.toLocaleString()} crediti\nNuovo saldo: ${data.credits.newBalance.toLocaleString()} crediti`);
        onClose();
      } else {
        const errorData = await response.json();
        if (errorData.error === 'subscription_required') {
          alert('⚠️ ' + errorData.message);
        } else {
          throw new Error(errorData.error || 'Errore nella ricarica');
        }
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
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            user?.canPurchaseRecharge 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ricarica Crediti</h2>
          {user?.canPurchaseRecharge ? (
            <p className="text-gray-300 text-sm">Scegli il pacchetto che fa per te</p>
          ) : (
            <p className="text-yellow-400 text-sm font-medium">⚠️ Ricariche disponibili solo con abbonamento attivo</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {rechargeOptions.map((option) => (
            <div
              key={option.credits}
              className={`relative rounded-xl p-4 border transition-all ${
                user?.canPurchaseRecharge
                  ? `bg-white/10 cursor-pointer hover:bg-white/20 ${
                      option.popular 
                        ? 'border-blue-500/50 ring-2 ring-blue-500/30' 
                        : 'border-white/20 hover:border-purple-500/50'
                    }`
                  : 'bg-white/5 border-gray-500/30 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => user?.canPurchaseRecharge && handleRecharge(option)}
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
          {!user?.canPurchaseRecharge && (
            <div className="mb-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm font-medium">
                📋 Per sbloccare le ricariche è necessario un abbonamento attivo (Mensile o Lifetime)
              </p>
            </div>
          )}
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