'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const OnetimeRegisterPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Se l'utente è già loggato, reindirizza direttamente a app
    if (!isLoading && user) {
      router.push('/app');
    }
  }, [user, isLoading, router]);

  // Mostra messaggio di simulazione
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-2xl w-full border border-white/20 text-center">
        <h1 className="text-4xl font-bold text-white mb-6">
          🎯 Simulazione Acquisto One-Time
        </h1>
        
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-6 mb-8">
          <p className="text-yellow-200 text-lg mb-4">
            In produzione, qui ci sarebbe il flusso di pagamento reale con Stripe/PayPal.
          </p>
          <p className="text-yellow-300 font-bold text-xl">
            Per il test: registrati normalmente e riceverai automaticamente 4000 crediti!
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 text-left">
            <h3 className="text-white font-bold mb-2">📋 Come funziona il test:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Clicca su "Vai alla Registrazione"</li>
              <li>Registrati con email e password</li>
              <li>Riceverai automaticamente <span className="text-yellow-400 font-bold">4000 crediti</span> invece di 120</li>
              <li>Avrai accesso alle ricariche senza abbonamento</li>
            </ol>
          </div>

          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4">
            <p className="text-green-300">
              ✅ Questo simula un utente che ha pagato €49 per l'accesso One-Time
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            // Salva flag nel sessionStorage per indicare registrazione onetime
            sessionStorage.setItem('registrationType', 'onetime_payment');
            // Reindirizza alla registrazione normale
            window.location.href = '/app';
          }}
          className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-4 px-8 rounded-2xl text-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl w-full"
        >
          🚀 Vai alla Registrazione One-Time
        </button>

        <p className="text-gray-400 text-sm mt-4">
          Nota: Questa è solo una simulazione per testing in localhost
        </p>
      </div>
    </div>
  );
};

export default OnetimeRegisterPage;