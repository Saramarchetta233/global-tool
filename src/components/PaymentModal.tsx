'use client';

import { PayPalButtons,PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Crown,X } from 'lucide-react';
import { useEffect,useState } from 'react';

import { t } from '@/lib/i18n';
import { type PlanType,getPriceDisplay } from '@/lib/stripe-config';
import { useGeolocation } from '@/hooks/useGeolocation';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  version?: '1' | '2';
  planType?: PlanType;
}

export function PaymentModal({ isOpen, onClose, userId, version = '1', planType = 'monthly' }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const { currency, country, language, loading: geoLoading } = useGeolocation();

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          return 15 * 60; // Reset to 15 minutes
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Simplified scroll management - only prevent background scroll
  useEffect(() => {
    if (isOpen) {
      // Simply prevent background scroll without position changes
      document.body.style.overflow = 'hidden';
    } else {
      // Restore background scroll without changing position
      document.body.style.overflow = '';
    }

    // Cleanup quando il componente viene smontato
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStripePayment = async (selectedPlanType: PlanType) => {
    setLoading(true);
    
    console.log('handleStripePayment called with:', {
      selectedPlanType,
      userId,
      currency,
      version
    });
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlanType,
          userId,
          countryCode: currency === 'EUR' ? 'IT' : currency === 'USD' ? 'US' : currency === 'GBP' ? 'GB' : currency === 'CAD' ? 'CA' : 'AU',
          version
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      console.log('Stripe API response:', data);
      
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
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

  // PayPal capture handler per orders (lifetime/onetime)

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
        // Payment successful, redirect based on version
        if (version === '2') {
          window.location.href = `/onetime-register?payment=paypal&order=${orderId}`;
        } else {
          window.location.href = `/success?payment=paypal&order=${orderId}`;
        }
      } else {
        throw new Error('PayPal capture failed');
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      alert(t('payment.error', language));
    }
  };

  const monthlyPrice = getPriceDisplay(currency, 'monthly');
  const lifetimePrice = getPriceDisplay(currency, 'lifetime');
  const onetimePrice = getPriceDisplay(currency, 'onetime');

  // Debug PayPal config
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  console.log('🅿️ PayPal Config Debug:', {
    clientId: paypalClientId ? 'SET' : 'MISSING',
    currency,
    language
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
      <div className={`bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-4 md:p-6 w-full border border-purple-500/30 relative my-4 ${
        version === '2' 
          ? 'max-w-md max-h-[90vh] overflow-y-auto' 
          : 'max-w-2xl max-h-[90vh] overflow-y-auto'
      }`} style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Sticky Close Button - always visible */}
        <button
          onClick={onClose}
          className="sticky top-2 right-2 md:top-4 md:right-4 float-right text-gray-400 hover:text-white transition-colors z-30 p-2 bg-black/40 rounded-full backdrop-blur-sm border border-white/20"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Header - Mobile optimized */}
        <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {version === '2' ? 'StudiusAI Premium' : t('pricing.title', language)}
          </h2>
          <p className="text-gray-300 text-sm md:text-base">
            {version === '2' ? 'Accesso a vita per €49' : 'Sblocca tutto il potenziale di StudiusAI'}
          </p>
        </div>

        {geoLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-300">Caricamento...</p>
          </div>
        ) : (
          <>
            {version === '1' ? (
              // Versione 1: Original pricing modal
              <>
                {/* Payment Method Selector */}
                <div className="mb-6">
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                        paymentMethod === 'stripe'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-transparent text-gray-300 border border-white/20 hover:border-purple-500/50'
                      }`}
                    >
                      💳 Carta di Credito
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                        paymentMethod === 'paypal'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-transparent text-gray-300 border border-white/20 hover:border-purple-500/50'
                      }`}
                    >
                      🅿️ PayPal
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Piano Mensile</h3>
                      <span className="text-2xl font-bold text-blue-600">
                        {monthlyPrice.symbol}{monthlyPrice.amount}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {t('pricing.monthlyDesc', language)}
                    </p>
                    {paymentMethod === 'stripe' ? (
                      <button
                        onClick={() => handleStripePayment('monthly')}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? t('payment.processing', language) : t('pricing.chooseMonthly', language)}
                      </button>
                    ) : (
                      <PayPalScriptProvider options={{
                        clientId: paypalClientId || 'test',
                        currency: currency,
                        locale: language === 'it' ? 'it_IT' : language === 'es' ? 'es_ES' : language === 'fr' ? 'fr_FR' : language === 'de' ? 'de_DE' : 'en_US',
                        vault: true,
                        intent: 'subscription'
                      }}>
                        <PayPalButtons
                          style={{ layout: "horizontal", height: 40, label: "subscribe" }}
                          createSubscription={async () => {
                            try {
                              const response = await fetch('/api/paypal/subscriptions', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  userId
                                }),
                              });

                              if (!response.ok) {
                                throw new Error(`HTTP ${response.status}`);
                              }

                              const data = await response.json();
                              if (!data.subscriptionId) {
                                throw new Error('No subscription ID received');
                              }

                              return data.subscriptionId;
                            } catch (error) {
                              console.error('Subscription creation error:', error);
                              throw error;
                            }
                          }}
                          onApprove={async (data) => {
                            console.log('✅ Subscription approved:', data.subscriptionID);
                            window.location.href = `/app?subscription=success`;
                          }}
                          onError={(err) => {
                            console.error('PayPal subscription error:', err);
                            alert('Errore durante la creazione dell\'abbonamento PayPal.');
                          }}
                          onCancel={(data) => {
                            console.log('PayPal subscription cancelled:', data);
                          }}
                        />
                      </PayPalScriptProvider>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 hover:border-green-500 transition-colors border-green-200 bg-green-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold flex items-center">
                        Accesso a Vita 
                        <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded">MIGLIORE</span>
                      </h3>
                      <span className="text-2xl font-bold text-green-600">
                        {lifetimePrice.symbol}{lifetimePrice.amount}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {t('pricing.lifetimeDesc', language)}
                    </p>
                    {paymentMethod === 'stripe' ? (
                      <button
                        onClick={() => handleStripePayment('lifetime')}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {loading ? t('payment.processing', language) : t('pricing.chooseLifetime', language)}
                      </button>
                    ) : (
                      <PayPalScriptProvider options={{
                        clientId: paypalClientId || 'test',
                        currency: currency,
                        locale: language === 'it' ? 'it_IT' : language === 'es' ? 'es_ES' : language === 'fr' ? 'fr_FR' : language === 'de' ? 'de_DE' : 'en_US'
                      }}>
                        <PayPalButtons
                          style={{ layout: "horizontal" }}
                          createOrder={async () => {
                            try {
                              const response = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  planType: 'lifetime',
                                  userId,
                                  countryCode: currency === 'EUR' ? 'IT' : currency === 'USD' ? 'US' : currency === 'GBP' ? 'GB' : currency === 'CAD' ? 'CA' : 'AU',
                                  version
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
                              console.error('Order creation error:', error);
                              throw error;
                            }
                          }}
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
                      </PayPalScriptProvider>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                  🔒 Pagamento sicuro con crittografia SSL
                </div>
              </>
            ) : (
              // Versione 2: PROFESSIONAL CONVERSION-OPTIMIZED DESIGN
              <>
                {/* 1. URGENZA - Timer Countdown - Mobile optimized */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-3 md:mb-4 px-3 md:px-4 py-2 md:py-3 rounded-t-2xl">
                  <div className="text-center text-white font-bold text-xs sm:text-sm">
                    ⏰ Offerta scade tra: <span className="text-sm sm:text-lg md:text-xl font-mono">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                {/* 2. HEADER PRODOTTO - Mobile optimized */}
                <div className="text-center mb-3 md:mb-4">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2">StudiusAI Premium</h2>
                  <div className="flex items-center justify-center gap-1 md:gap-2 lg:gap-3 mb-2 flex-wrap">
                    <span className="text-sm md:text-lg lg:text-xl text-gray-400 line-through">{onetimePrice.symbol}199</span>
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-400">{onetimePrice.symbol}{onetimePrice.amount}</span>
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 md:px-2 py-1 rounded-lg text-xs font-bold">
                      −75%
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs md:text-sm">Pagamento unico • Accesso a vita</p>
                </div>

                {/* 3. BENEFICI (3 righe compatte) - Mobile optimized */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-3 md:mb-4 border border-white/10">
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-green-400 text-sm md:text-lg">✓</span>
                      <span className="text-white font-medium text-sm md:text-base">4.000 crediti inclusi</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-green-400 text-sm md:text-lg">✓</span>
                      <span className="text-white font-medium text-sm md:text-base">Tutte le funzionalità AI</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="text-green-400 text-sm md:text-lg">✓</span>
                      <span className="text-white font-medium text-sm md:text-base">Ricariche sempre disponibili</span>
                    </div>
                  </div>
                </div>

                {/* 4. FORM EMAIL (simplified) */}
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">
                    📧 Inserisci la tua email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@esempio.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* 5. METODO PAGAMENTO (tabs orizzontali) */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentMethod('stripe')}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'stripe'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      💳 Carta di Credito
                    </button>
                    <button
                      onClick={() => setPaymentMethod('paypal')}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'paypal'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                          : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      🅿️ PayPal
                    </button>
                  </div>
                </div>

                {/* 6. PULSANTE CTA (grande, prominente) */}
                <div className="mb-4">
                  {paymentMethod === 'stripe' ? (
                    <button
                      onClick={() => handleStripePayment(planType || 'onetime')}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl text-base sm:text-lg transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                          Elaborazione...
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">🔓 OTTIENI ACCESSO - {onetimePrice.symbol}{onetimePrice.amount}</span>
                          <span className="sm:hidden">🔓 ACQUISTA - {onetimePrice.symbol}{onetimePrice.amount}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full bg-gradient-to-r from-green-400 to-green-500 p-1 rounded-xl">
                      <PayPalScriptProvider 
                        options={{
                          "client-id": paypalClientId || '',
                          currency: currency || 'EUR'
                        }}
                      >
                        <PayPalButtons
                          style={{ 
                            layout: 'horizontal',
                            label: 'pay',
                            height: 55,
                            color: 'gold'
                          }}
                          createOrder={async () => {
                            try {
                              const response = await fetch('/api/paypal/create-order', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  planType: planType || 'onetime',
                                  userId,
                                  countryCode: currency === 'EUR' ? 'IT' : currency === 'USD' ? 'US' : currency === 'GBP' ? 'GB' : currency === 'CAD' ? 'CA' : 'AU',
                                  version
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
                              console.error('Order creation error:', error);
                              throw error;
                            }
                          }}
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
                      </PayPalScriptProvider>
                    </div>
                  )}
                </div>

                {/* 7. GARANZIA (box evidenziato) */}
                <div className="mb-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                  <div className="text-center">
                    <div className="text-green-400 text-2xl mb-2">🛡️</div>
                    <p className="text-white font-bold mb-1">Garanzia 30 giorni</p>
                    <p className="text-gray-300 text-sm">
                      Non soddisfatto? Rimborso completo, nessuna domanda.
                    </p>
                  </div>
                </div>

                {/* 8. TRUST ELEMENTS (footer) */}
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">
                    🔒 Pagamento 100% sicuro
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-3">
                    <span>Stripe</span>
                    <span>•</span>
                    <span>PayPal</span>
                    <span>•</span>
                    <span>Visa</span>
                    <span>•</span>
                    <span>Mastercard</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-yellow-400 text-sm font-medium">
                      ⭐⭐⭐⭐⭐ "Ho passato con 30!" - Marco R.
                    </p>
                  </div>
                </div>

                {/* PayPal Helper Message */}
                {paymentMethod === 'paypal' && (
                  <div className="text-center mt-2">
                    <p className="text-yellow-300 text-xs">
                      💡 Se PayPal non appare, ricarica la pagina
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}