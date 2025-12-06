'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getPriceDisplay, type PlanType } from '@/lib/stripe-config';
import { t } from '@/lib/i18n';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

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
  const { currency, country, language, loading: geoLoading } = useGeolocation();

  if (!isOpen) return null;

  const handleStripePayment = async (selectedPlanType: PlanType) => {
    setLoading(true);
    
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

  const handlePayPalPayment = async (selectedPlanType: PlanType) => {
    try {
      // Per mensile usa subscriptions API
      if (selectedPlanType === 'monthly') {
        const response = await fetch('/api/paypal/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId
          }),
        });

        const data = await response.json();
        if (data.approvalUrl) {
          // Redirect a PayPal per approvare subscription
          window.location.href = data.approvalUrl;
          return null; // Non ritorniamo orderId per subscriptions
        }
        throw new Error('No approval URL received');
      }
      
      // Per lifetime/onetime usa orders API (esistente)
      const response = await fetch('/api/paypal/create-order', {
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

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('PayPal payment error:', error);
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
        // Payment successful, redirect or show success
        window.location.href = `/success?payment=paypal&order=${orderId}`;
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
    <PayPalScriptProvider options={{
      clientId: paypalClientId || 'test',
      currency: currency,
      locale: language === 'it' ? 'it_IT' : language === 'es' ? 'es_ES' : language === 'fr' ? 'fr_FR' : language === 'de' ? 'de_DE' : 'en_US'
    }}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {t(version === '2' ? 'pricing.onetime' : 'pricing.title', language)}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>

        {geoLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('payment.detectingLocation', language)}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 text-center">
              {t('payment.detectedCountry', language, { country, currency })}
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    paymentMethod === 'stripe' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  💳 Stripe
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                    paymentMethod === 'paypal' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  🅿️ PayPal
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {version === '1' ? (
                // Versione 1: Free trial → subscription/lifetime
                <>
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
                      <PayPalButtons
                        style={{ layout: "horizontal", height: 40 }}
                        createOrder={async () => {
                          // Per mensile, gestisce il redirect direttamente
                          const orderId = await handlePayPalPayment('monthly');
                          return orderId || ''; // Ritorna stringa vuota se è subscription
                        }}
                        onApprove={async (data) => {
                          // Non fare nulla per monthly, il webhook gestirà tutto
                          if (data.orderID) {
                            await handlePayPalCapture(data.orderID);
                          }
                        }}
                        onError={(err) => {
                          console.error('💥 PayPal error details:', err);
                          alert(`Errore PayPal: ${JSON.stringify(err)}`);
                        }}
                        onCancel={(data) => {
                          console.log('PayPal payment cancelled:', data);
                        }}
                      />
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
                      <PayPalButtons
                        style={{ layout: "horizontal" }}
                        createOrder={() => handlePayPalPayment('lifetime')}
                        onApprove={(data) => handlePayPalCapture(data.orderID)}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          alert(t('payment.error', language));
                        }}
                      />
                    )}
                  </div>
                </>
              ) : (
                // Versione 2: One-time payment
                <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">StudiusAI</h3>
                    <span className="text-2xl font-bold text-blue-600">
                      {onetimePrice.symbol}{onetimePrice.amount}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {t('pricing.onetimeDesc', language)}
                  </p>
                  {paymentMethod === 'stripe' ? (
                    <button
                      onClick={() => handleStripePayment('onetime')}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? t('payment.processing', language) : t('pricing.buyNow', language)}
                    </button>
                  ) : (
                    <PayPalButtons
                      style={{ layout: "horizontal" }}
                      createOrder={() => handlePayPalPayment('onetime')}
                      onApprove={(data) => handlePayPalCapture(data.orderID)}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        alert(t('payment.error', language));
                      }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
              {t('pricing.securePayment', language)}
            </div>
          </>
        )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}