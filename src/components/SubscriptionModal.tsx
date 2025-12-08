'use client';

import { PayPalButtons,PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Calendar, CreditCard, Crown, Shield,Star, X } from 'lucide-react';
import React, { useEffect,useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { t } from '@/lib/i18n';
import { useGeolocation } from '@/hooks/useGeolocation';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currency, country, language, loading: geoLoading } = useGeolocation();

  // Reset stati quando modal si chiude
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlan(null);
      setPaymentMethod('stripe');
    }
  }, [isOpen]);

  // Fix scroll mobile: blocca scroll pagina quando modal è aperto
  useEffect(() => {
    if (isOpen) {
      // Salva la posizione attuale dello scroll
      const scrollY = window.scrollY;
      // Blocca lo scroll della pagina
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Ripristina lo scroll quando il modal si chiude
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    // Cleanup quando il componente viene smontato
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

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

  const handleSelectPlan = (planType: 'monthly' | 'lifetime') => {
    if (!user?.id) return;
    setSelectedPlan(planType);
    
    // Scroll automatico alla sezione pagamento dopo 300ms
    setTimeout(() => {
      const paymentSection = document.getElementById('payment-method-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 300);
  };

  const handleStripePayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan,
          userId: user?.id,
          countryCode: currency === 'EUR' ? 'IT' : currency === 'USD' ? 'US' : currency === 'GBP' ? 'GB' : currency === 'CAD' ? 'CA' : 'AU',
          version: '1'
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(t('payment.error', language));
    } finally {
      setLoading(false);
    }
  };

  // Funzione per creare subscription PayPal (mensile)
  const handlePayPalSubscription = async (data, actions) => {
    if (!selectedPlan || selectedPlan !== 'monthly') {
      throw new Error('Plan not selected or not monthly');
    }
    
    try {
      const response = await fetch('/api/paypal/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Errore API subscription:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Subscription response:', responseData);
      
      if (!responseData.subscriptionId) {
        throw new Error('No subscription ID received');
      }

      return responseData.subscriptionId;
    } catch (error) {
      console.error('❌ PayPal subscription creation error:', error);
      throw error;
    }
  };

  // Funzione per creare order PayPal (lifetime)
  const handlePayPalOrder = async () => {
    if (!selectedPlan || selectedPlan !== 'lifetime') return;
    
    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan,
          userId: user?.id,
          countryCode: currency === 'EUR' ? 'IT' : currency === 'USD' ? 'US' : currency === 'GBP' ? 'GB' : currency === 'CAD' ? 'CA' : 'AU',
          version: '1'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.orderId) {
        throw new Error('No order ID received');
      }

      return data.orderId;
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw error;
    }
  };

  const handlePayPalCapture = async (orderId: string) => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = `/success?payment=paypal&order=${orderId}`;
      } else {
        throw new Error('PayPal capture failed');
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      alert(t('payment.error', language));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30 relative max-h-[90vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
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

        {/* Step Indicator */}
        {!selectedPlan && (
          <p className="text-center text-gray-400 text-sm mb-4 animate-pulse">
            👆 Clicca sul piano che preferisci per continuare
          </p>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white/10 rounded-xl p-6 border-2 cursor-pointer transition-all transform hover:scale-[1.02] ${
                  selectedPlan === plan.id
                    ? 'border-green-400 bg-white/20 shadow-xl shadow-green-400/20'
                    : plan.popular 
                      ? 'border-yellow-500/50 ring-2 ring-yellow-500/30 hover:border-yellow-500/70' 
                      : 'border-white/20 hover:border-purple-500/50 hover:bg-white/15'
                }`}
                onClick={() => handleSelectPlan(plan.id as 'monthly' | 'lifetime')}
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

                {/* Selection Indicator */}
                {selectedPlan === plan.id && (
                  <div className="text-center mb-4">
                    <div className="w-full py-2 px-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 font-medium text-sm">
                      ✓ Piano selezionato
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Payment Method Selection - Shows when plan is selected */}
        {selectedPlan && (
          <div id="payment-method-section" className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300 relative">
            {/* Pulse effect for focus */}
            <div className="absolute inset-0 bg-purple-400/20 rounded-lg animate-pulse pointer-events-none" style={{ animationIterationCount: '3' }} />
            <div className="border-t border-white/20 pt-6 relative">
              <h3 className="text-lg font-semibold text-white mb-4 text-center">Come vuoi pagare?</h3>
              

              {/* Payment Method Toggle */}
              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    paymentMethod === 'stripe'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-transparent text-gray-300 border border-white/20 hover:border-purple-500/50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Carta di Credito
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    paymentMethod === 'paypal'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-transparent text-gray-300 border border-white/20 hover:border-purple-500/50'
                  }`}
                >
                  <div className="text-xl">🅿️</div>
                  PayPal
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Riepilogo ordine
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Piano selezionato:</span>
                    <span className="text-white font-medium">
                      {selectedPlan === 'monthly' ? 'Piano Mensile' : 'Piano Lifetime'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Prezzo:</span>
                    <span className="text-white font-medium">
                      {selectedPlan === 'monthly' ? '19,99€/mese' : '69€ una tantum'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Crediti inclusi:</span>
                    <span className="text-white font-medium">
                      {selectedPlan === 'monthly' ? '2.000/mese' : '6.000 subito'}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/20">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <Shield className="w-4 h-4" />
                      Pagamento sicuro con {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Powered by Stripe Badge */}
              {paymentMethod === 'stripe' && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
                    <svg className="h-5 w-auto" viewBox="0 0 60 25" fill="none">
                      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#6772E5"/>
                    </svg>
                    <span className="text-xs text-gray-400">
                      Pagamento gestito da Stripe - Leader mondiale nei pagamenti sicuri
                    </span>
                  </div>
                </div>
              )}

              {/* Social Proof */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-300">
                  👥 Oltre <span className="font-semibold text-white">15.000 studenti</span> hanno già scelto StudiusAI
                </p>
              </div>

              {/* Guarantee Box */}
              <div className="mb-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center justify-center gap-3">
                  <Shield className="w-8 h-8 text-green-400 flex-shrink-0" />
                  <div className="text-center">
                    <p className="text-white font-semibold mb-1">Garanzia 30 giorni</p>
                    <p className="text-sm text-gray-300">
                      Se non ti trovi, ti rimborsiamo. Nessuna domanda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <div className="text-center">
                {paymentMethod === 'stripe' ? (
                  <button
                    onClick={handleStripePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Elaborazione...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Procedi al Pagamento Sicuro →
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full">
                    {geoLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent mx-auto" />
                        <p className="text-gray-400 mt-2">Caricamento PayPal...</p>
                      </div>
                    ) : (
                      <PayPalScriptProvider 
                        options={{
                          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                          currency: currency || 'EUR'
                          // Nessun intent specifico - PayPal gestisce automaticamente
                        }}
                      >
                        {selectedPlan === 'monthly' ? (
                          <PayPalButtons
                            style={{ 
                              layout: 'horizontal',
                              label: 'subscribe',
                              height: 48
                            }}
                            createSubscription={handlePayPalSubscription}
                            onApprove={async (data) => {
                              console.log('✅ Subscription approved:', data.subscriptionID);
                              window.location.href = `/app?subscription=success`;
                            }}
                            onError={(err) => {
                              console.error('PayPal subscription error:', err);
                              alert('Errore durante la creazione dell\'abbonamento PayPal.');
                            }}
                          />
                        ) : (
                          <PayPalButtons
                            style={{ 
                              layout: 'horizontal',
                              label: 'paypal',
                              height: 48
                            }}
                            createOrder={handlePayPalOrder}
                            onApprove={async (data) => {
                              try {
                                await handlePayPalCapture(data.orderID);
                              } catch (error) {
                                console.error('Capture error:', error);
                                alert('Errore durante il completamento del pagamento.');
                              }
                            }}
                            onError={(err) => {
                              console.error('PayPal order error:', err);
                              alert('Errore durante la creazione dell\'ordine PayPal.');
                            }}
                          />
                        )}
                      </PayPalScriptProvider>
                    )}
                  </div>
                )}
                
                {/* Card logos under payment button - only for Stripe */}
                {paymentMethod === 'stripe' && (
                  <div className="mt-3 text-center">
                    <div className="inline-block bg-white/95 p-2 rounded-lg">
                      <img 
                        src="/images/carte-di-credito.png" 
                        alt="Carte di credito accettate" 
                        className="h-12 mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs space-y-1 mt-4">
          {/* Messaggio helper PayPal */}
          {selectedPlan && paymentMethod === 'paypal' && (
            <p className="text-yellow-300 mb-2">
              💡 Se PayPal non appare, non funziona o mostra il piano sbagliato (es. mensile invece di lifetime), ricarica la pagina
            </p>
          )}
          <p>🔒 Pagamenti sicuri con crittografia SSL</p>
          {!selectedPlan && <p>👆 Seleziona un piano per continuare</p>}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;