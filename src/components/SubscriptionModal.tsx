'use client';

import React, { useState } from 'react';
import { X, Crown, Calendar, Star, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, refreshProfile } = useAuth();

  const plans = [
    {
      id: 'monthly',
      name: 'Piano Mensile',
      price: '19,99€',
      period: '/mese',
      credits: 2000,
      features: [
        '2.000 crediti al mese',
        'Rinnovo automatico',
        'Sblocca ricariche crediti',
        'Supporto prioritario',
        'Accesso a tutte le funzioni'
      ],
      popular: true,
      icon: Calendar
    },
    {
      id: 'lifetime',
      name: 'Piano Lifetime',
      price: '69€',
      period: 'una tantum',
      credits: 6000,
      features: [
        '6.000 crediti subito',
        'Accesso a vita',
        'Sblocca ricariche crediti',
        'Niente rinnovi',
        'Supporto prioritario',
        'Futuri aggiornamenti inclusi'
      ],
      popular: false,
      icon: Crown
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const endpoint = plan.id === 'monthly' ? '/api/subscription/monthly' : '/api/subscription/lifetime';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Refresh user profile to get updated subscription status
        await refreshProfile();
        
        if (plan.id === 'monthly') {
          alert(`🎉 Abbonamento Mensile attivato!\nAggiunti ${plan.credits.toLocaleString()} crediti\nOra puoi acquistare ricariche crediti!\n\n(Simulazione: non ci sarà rinnovo automatico)`);
        } else {
          alert(`👑 Piano Lifetime attivato!\nAggiunti ${plan.credits.toLocaleString()} crediti\nOra puoi acquistare ricariche crediti!\n\nComplimenti per l'accesso a vita!`);
        }
        
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'attivazione');
      }
    } catch (error) {
      console.error('Errore abbonamento:', error);
      alert('Errore durante l\'attivazione. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Scegli il tuo piano</h2>
          <p className="text-gray-300">Sblocca tutto il potenziale di Studius AI</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white/10 rounded-xl p-6 border cursor-pointer transition-all hover:bg-white/15 ${
                  plan.popular 
                    ? 'border-yellow-500/50 ring-2 ring-yellow-500/30 scale-105' 
                    : 'border-white/20 hover:border-purple-500/50'
                }`}
                onClick={() => handleSubscribe(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Consigliato
                    </span>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {plan.credits.toLocaleString()} crediti
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <div className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  }`}>
                    <Zap className="w-4 h-4" />
                    {plan.id === 'monthly' ? 'Abbonati ora' : 'Acquista a vita'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs space-y-1">
          <p>💳 Per ora è simulato - i crediti vengono aggiunti immediatamente</p>
          <p>🔒 Pagamenti sicuri con Stripe (prossimamente)</p>
          <p>📧 Riceverai conferma via email dopo l'attivazione</p>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
              <p>Attivazione piano...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;