'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<{
    type: 'stripe' | 'paypal' | 'unknown';
    sessionId?: string;
  }>({ type: 'unknown' });

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    const paypalPayment = searchParams?.get('payment');

    if (sessionId) {
      setPaymentDetails({ type: 'stripe', sessionId });
    } else if (paypalPayment === 'paypal') {
      setPaymentDetails({ type: 'paypal' });
    }
  }, [searchParams]);

  const handleGoToDashboard = () => {
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-2xl w-full border border-white/20 text-center">
        {/* Icona Check Verde */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-green-400/20 border-4 border-green-400 flex items-center justify-center">
            <span className="text-green-400 text-5xl">✓</span>
          </div>
        </div>

        {/* Titolo */}
        <h1 className="text-4xl font-bold text-white mb-6">
          🎉 Pagamento completato!
        </h1>

        {/* Messaggio principale */}
        <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 mb-8">
          <p className="text-green-200 text-lg mb-2">
            Grazie per il tuo acquisto!
          </p>
          <p className="text-green-300 font-semibold text-xl">
            I tuoi crediti sono stati aggiunti al tuo account.
          </p>
        </div>

        {/* Dettagli pagamento */}
        {paymentDetails.type !== 'unknown' && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-gray-300 text-sm">
              {paymentDetails.type === 'stripe' ? (
                <>Pagamento elaborato tramite Stripe</>
              ) : paymentDetails.type === 'paypal' ? (
                <>Pagamento elaborato tramite PayPal</>
              ) : (
                <>Pagamento completato con successo</>
              )}
            </p>
            {paymentDetails.sessionId && (
              <p className="text-gray-400 text-xs mt-1">
                ID: {paymentDetails.sessionId.slice(-12)}...
              </p>
            )}
          </div>
        )}

        {/* Informazioni aggiuntive */}
        <div className="space-y-3 mb-8">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
            <p className="text-blue-200 text-sm">
              ✨ I tuoi crediti sono ora disponibili nella dashboard
            </p>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
            <p className="text-purple-200 text-sm">
              🚀 Inizia subito a utilizzare StudiusAI per i tuoi studi!
            </p>
          </div>
        </div>

        {/* Pulsante Dashboard */}
        <button
          onClick={handleGoToDashboard}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
        >
          🎯 Vai alla Dashboard
        </button>

        {/* Note aggiuntive */}
        <div className="mt-6 space-y-2">
          <p className="text-gray-400 text-sm">
            💡 Riceverai una email di conferma a breve
          </p>
          <p className="text-gray-500 text-xs">
            Per supporto: info@studiusai.com
          </p>
        </div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;