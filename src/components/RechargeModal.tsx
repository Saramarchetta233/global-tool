'use client';

import { Coins, X, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { useAuth } from '@/lib/auth-context';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const { user, refreshProfile, token } = useAuth();

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

  const handleStripeRecharge = async (option: typeof rechargeOptions[0]) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/credits/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageType: option.packageType,
          userId: user.id
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella creazione del checkout');
      }
    } catch (error) {
      console.error('Errore Stripe checkout:', error);
      alert('Errore durante la creazione del checkout Stripe. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalRecharge = async (option: typeof rechargeOptions[0]) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/paypal/recharge-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageType: option.packageType,
          userId: user.id
        })
      });

      if (response.ok) {
        const { approvalUrl, orderId } = await response.json();
        
        if (approvalUrl && orderId) {
          // Salva orderId per il capture al ritorno
          sessionStorage.setItem('paypal_order_id', orderId);
          window.location.href = approvalUrl;
        } else {
          throw new Error('No approval URL or order ID received');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella creazione dell\'ordine PayPal');
      }
    } catch (error) {
      console.error('Errore PayPal order:', error);
      alert('Errore durante la creazione dell\'ordine PayPal. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecharge = (option: typeof rechargeOptions[0]) => {
    if (!user?.id) return;
    
    // Check if user can purchase recharges - include BeCoolPro and lifetime users
    const canRecharge = user.canPurchaseRecharge || 
                       user.subscription?.type === 'lifetime' || 
                       user.subscription?.type === 'becoolpro';
    
    if (!canRecharge) {
      alert('⚠️ Ricariche disponibili solo con abbonamento attivo!\n\nAttiva un piano Mensile o Lifetime per sbloccare le ricariche.');
      onClose();
      return;
    }

    if (paymentMethod === 'stripe') {
      handleStripeRecharge(option);
    } else {
      handlePayPalRecharge(option);
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
            user?.canPurchaseRecharge || user?.subscription?.type === 'lifetime' || user?.subscription?.type === 'becoolpro'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <Coins className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Ricarica Crediti</h2>
          {user?.canPurchaseRecharge || user?.subscription?.type === 'lifetime' || user?.subscription?.type === 'becoolpro' ? (
            <p className="text-gray-300 text-sm">Scegli il pacchetto che fa per te</p>
          ) : (
            <p className="text-yellow-400 text-sm font-medium">⚠️ Ricariche disponibili solo con abbonamento attivo</p>
          )}
        </div>

        {/* Payment Method Selector */}
        {(user?.canPurchaseRecharge || user?.subscription?.type === 'lifetime' || user?.subscription?.type === 'becoolpro') && (
          <div className="mb-6">
            <h3 className="text-white text-sm font-medium mb-3">Metodo di pagamento:</h3>
            <div className="flex border border-white/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  paymentMethod === 'stripe' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                💳 Stripe
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  paymentMethod === 'paypal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                🅿️ PayPal
              </button>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {rechargeOptions.map((option) => (
            <div
              key={option.credits}
              className={`relative rounded-xl p-4 border transition-all ${
                (user?.canPurchaseRecharge || user?.subscription?.type === 'lifetime' || user?.subscription?.type === 'becoolpro')
                  ? `bg-white/10 cursor-pointer hover:bg-white/20 ${
                      option.popular 
                        ? 'border-blue-500/50 ring-2 ring-blue-500/30' 
                        : 'border-white/20 hover:border-purple-500/50'
                    }`
                  : 'bg-white/5 border-gray-500/30 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => (user?.canPurchaseRecharge || user?.subscription?.type === 'lifetime' || user?.subscription?.type === 'becoolpro') && handleRecharge(option)}
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
          {!(user?.canPurchaseRecharge || user?.subscription?.type === 'lifetime' || user?.subscription?.type === 'becoolpro') && (
            <div className="mb-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm font-medium">
                📋 Per sbloccare le ricariche è necessario un abbonamento attivo (Mensile o Lifetime)
              </p>
            </div>
          )}
          <p>🔒 Pagamenti sicuri con {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}</p>
          <p>💳 I crediti verranno aggiunti dopo il pagamento</p>
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