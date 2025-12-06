'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const PricingPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedPlanForPayPal, setSelectedPlanForPayPal] = useState<'monthly' | 'lifetime' | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  // PayPal SDK configuration
  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'EUR',
    intent: 'capture',
    "disable-funding": 'credit,card'
  };

  useEffect(() => {
    // Debug PayPal configuration
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    console.log('🅿️ PayPal Config:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
      environment: process.env.NODE_ENV,
      hasValidId: clientId && clientId.startsWith('A')
    });
    
    // Only set ready if we have a valid client ID
    if (clientId && clientId.startsWith('A')) {
      setPaypalReady(true);
    } else {
      console.error('❌ PayPal Client ID non valido o mancante');
      setPaypalReady(true); // Still show the page, but PayPal won't work
    }
  }, []);

  const handlePlanSelection = async (planType: 'monthly' | 'lifetime') => {
    setLoading(planType);
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: planType,
          userId: 'guest-user', // Per utenti non loggati
          countryCode: 'IT',
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
      alert('Errore durante il pagamento. Riprova.');
    } finally {
      setLoading(null);
    }
  };

  const handleBackToHome = () => {
    router.push('/app');
  };

  // Funzione per catturare pagamenti lifetime PayPal

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
      alert('Errore durante il pagamento PayPal. Riprova.');
    }
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Piano Mensile',
      price: '19.99',
      period: '/mese',
      description: 'Accesso completo a tutte le funzionalità',
      features: [
        '2.000 crediti al mese',
        'Accesso a tutte le funzionalità AI',
        'Supporto prioritario',
        'Cancellazione in qualsiasi momento'
      ],
      color: 'from-purple-500 to-blue-500',
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Accesso Lifetime',
      price: '69',
      period: 'una tantum',
      description: 'Paghi una volta, usi per sempre',
      features: [
        '6.000 crediti inclusi',
        'Accesso a vita a StudiusAI',
        'Tutte le funzionalità incluse',
        'Aggiornamenti futuri gratuiti',
        'Possibilità di ricaricare crediti'
      ],
      color: 'from-yellow-500 to-orange-500',
      popular: false
    }
  ];

  if (!paypalReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-4 border-yellow-400 flex items-center justify-center">
              <span className="text-yellow-400 text-3xl">!</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Non hai completato l'acquisto
          </h1>
          
          <p className="text-xl text-gray-300 mb-2">
            Nessun problema! Puoi riprovare quando vuoi.
          </p>
          
          <p className="text-gray-400">
            Scegli il piano più adatto alle tue esigenze di studio
          </p>
        </div>

        {/* Piani di abbonamento */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 ${
                plan.popular ? 'transform scale-105 border-purple-400/50' : ''
              }`}
            >
              {/* Badge popolare */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    🔥 Più popolare
                  </span>
                </div>
              )}

              <div className="text-center">
                {/* Nome e prezzo */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">€{plan.price}</span>
                  <span className="text-gray-300 ml-2">{plan.period}</span>
                </div>
                
                <p className="text-gray-300 mb-6">
                  {plan.description}
                </p>

                {/* Caratteristiche */}
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">✓</span>
                      <span className="text-gray-200 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Pulsanti Pagamento */}
                <div className="space-y-3">
                  {/* Pulsante Stripe */}
                  <button
                    onClick={() => handlePlanSelection(plan.id as 'monthly' | 'lifetime')}
                    disabled={loading === plan.id}
                    className={`w-full bg-gradient-to-r ${plan.color} text-white font-bold py-4 px-6 rounded-2xl text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none`}
                  >
                    {loading === plan.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Caricamento...
                      </div>
                    ) : (
                      <>
                        💳 Paga con Carta
                      </>
                    )}
                  </button>

                  {/* Pulsante PayPal */}
                  <div className="relative">
                    {selectedPlanForPayPal === plan.id ? (
                      <div className="bg-white rounded-2xl p-2">
                        {plan.id === 'monthly' ? (
                          // MENSILE: USA SUBSCRIPTIONS
                          <PayPalButtons
                            style={{ 
                              layout: 'horizontal',
                              label: 'subscribe',
                              height: 48
                            }}
                            createSubscription={async (data, actions) => {
                              try {
                                console.log('🔄 Creazione subscription PayPal...');
                                const response = await fetch('/api/paypal/subscriptions', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    userId: 'guest-user'
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
                                console.error('❌ Subscription creation error:', error);
                                alert('Errore durante la creazione dell\'abbonamento. Riprova.');
                                throw error;
                              }
                            }}
                            onApprove={async (data) => {
                              console.log('✅ Subscription approved:', data.subscriptionID);
                              window.location.href = `/success?payment=paypal&subscription=${data.subscriptionID}`;
                            }}
                            onError={(err) => {
                              console.error('❌ PayPal subscription error:', err);
                              alert('Errore durante la creazione dell\'abbonamento PayPal.');
                              setSelectedPlanForPayPal(null); // Reset to allow retry
                            }}
                            onCancel={(data) => {
                              console.log('❌ PayPal subscription cancelled:', data);
                              setSelectedPlanForPayPal(null); // Reset button
                            }}
                          />
                        ) : (
                          // LIFETIME: USA ORDERS
                          <PayPalButtons
                            style={{ 
                              layout: 'horizontal',
                              label: 'paypal',
                              height: 48
                            }}
                            createOrder={async () => {
                              try {
                                console.log('🔄 Creazione order PayPal...');
                                const response = await fetch('/api/paypal/create-order', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    planType: plan.id,
                                    userId: 'guest-user',
                                    countryCode: 'IT',
                                    version: '1'
                                  }),
                                });

                                if (!response.ok) {
                                  const errorText = await response.text();
                                  console.error('❌ Errore API order:', errorText);
                                  throw new Error(`HTTP ${response.status}: ${errorText}`);
                                }

                                const responseData = await response.json();
                                console.log('✅ Order response:', responseData);
                                
                                if (!responseData.orderId) {
                                  throw new Error('No order ID received');
                                }

                                return responseData.orderId;
                              } catch (error) {
                                console.error('❌ Order creation error:', error);
                                alert('Errore durante la creazione dell\'ordine. Riprova.');
                                throw error;
                              }
                            }}
                            onApprove={async (data) => {
                              try {
                                console.log('✅ Order approved, capturing...');
                                await handlePayPalCapture(data.orderID);
                              } catch (error) {
                                console.error('❌ Capture error:', error);
                                alert('Errore durante il completamento del pagamento.');
                                setSelectedPlanForPayPal(null); // Reset to allow retry
                              }
                            }}
                            onError={(err) => {
                              console.error('❌ PayPal order error:', err);
                              alert('Errore durante la creazione dell\'ordine PayPal.');
                              setSelectedPlanForPayPal(null); // Reset to allow retry
                            }}
                            onCancel={(data) => {
                              console.log('❌ PayPal order cancelled:', data);
                              setSelectedPlanForPayPal(null); // Reset button
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedPlanForPayPal(plan.id as 'monthly' | 'lifetime')}
                        className="w-full bg-[#FFC439] hover:bg-[#FFB300] text-[#003087] font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <span className="flex items-center justify-center">
                          PayPal
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Note pagamento sicuro */}
                  <p className="text-center text-xs text-gray-400 mt-2">
                    🔒 Pagamento sicuro con SSL
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sezione info aggiuntive */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              💡 Perché scegliere StudiusAI?
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-500/20 rounded-xl p-4">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-blue-200 text-sm font-semibold">Studio Personalizzato</p>
              </div>
              
              <div className="bg-purple-500/20 rounded-xl p-4">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-purple-200 text-sm font-semibold">AI Avanzata</p>
              </div>
              
              <div className="bg-green-500/20 rounded-xl p-4">
                <div className="text-2xl mb-2">📚</div>
                <p className="text-green-200 text-sm font-semibold">Risultati Garantiti</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pulsante torna alla home */}
        <div className="text-center">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center bg-white/10 backdrop-blur-lg text-white font-semibold py-3 px-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <span className="mr-2">←</span>
            Torna alla Home
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Hai domande? Contattaci: info@studiusai.com
          </p>
        </div>
      </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PricingPage;