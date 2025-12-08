'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EmailConfirmationHandler() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have auth params in URL hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token') && hash.includes('type=signup')) {
        // Email confirmed! Show success message
        setShowConfirmation(true);
        
        // Clean the URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // After 5 seconds, redirect to app
        setTimeout(() => {
          router.push('/app');
        }, 5000);
      }
    }
  }, [router]);

  if (!showConfirmation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-3xl border border-green-500/30 shadow-2xl p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce" />
            
            <h2 className="text-2xl font-bold text-white mb-2">
              ✅ Email Verificata con Successo!
            </h2>
            
            <p className="text-gray-200 mb-6">
              Il tuo account è stato attivato. Tra 5 secondi verrai reindirizzato a Studius AI dove potrai accedere con le tue credenziali.
            </p>
            
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-300">
                Ricorda di usare l'email e la password che hai inserito durante la registrazione.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Reindirizzamento in corso...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}