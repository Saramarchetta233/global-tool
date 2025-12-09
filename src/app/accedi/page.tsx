'use client';

import { Eye, EyeOff, Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function AccediPage() {
  const router = useRouter();
  const { user, login, register, isLoading, updateCredits, refreshProfile, forceUpdateSubscriptionType } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claimAttempted, setClaimAttempted] = useState(false);

  // If user is already logged in, redirect to app (unless processing magic token)
  useEffect(() => {
    if (!isLoading && user) {
      // Don't redirect if we have a magic token to process or we're showing success modal
      const hasMagicToken = localStorage.getItem('magic_token');
      if (!hasMagicToken && !showSuccessModal && !claimAttempted) {
        router.replace('/app');
      }
    }
  }, [user, isLoading, router, showSuccessModal, claimAttempted]);

  // Try to claim magic link from localStorage after login
  useEffect(() => {
    // Se già tentato, esci subito
    if (claimAttempted) return;
    if (!user) return;
    
    const savedToken = localStorage.getItem('magic_token');
    if (!savedToken) return;
    
    // Marca come tentato SUBITO per evitare loop
    setClaimAttempted(true);

    const claimSavedMagicToken = async () => {
      console.log('🔗 Attempting to claim magic token from /accedi (one time only)');
      try {
        // Get current session token for API authentication
        const { data: { session } } = await supabase.auth.getSession();
        const authToken = session?.access_token;
        
        if (!authToken) {
          console.error('❌ No auth token available for magic link claim');
          localStorage.removeItem('magic_token');
          return;
        }
        
        const response = await fetch('/api/magic/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          credentials: 'include',
          body: JSON.stringify({ token: savedToken })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.removeItem('magic_token'); // Rimuovi SOLO se successo
          setClaimSuccess(true);
          setShowSuccessModal(true); // Mostra il modal
          
          console.log('✅ Magic link claimed successfully from /accedi');
          console.log('📊 Magic claim data:', data);
          
          // Force update subscription type in context based on magic claim data
          console.log('🔄 Force updating subscription type to one_time based on magic claim...');
          updateCredits(data.newBalance);
          forceUpdateSubscriptionType('one_time');
          
          // Also try database refresh as backup
          setTimeout(async () => {
            if (refreshProfile) {
              console.log('🔄 Refreshing profile to sync from database...');
              await refreshProfile();
              console.log('✅ Profile refreshed from database');
            }
          }, 1000);

          // Redirect dopo 3 secondi
          setTimeout(() => {
            router.push('/app');
          }, 3000);
        } else {
          console.log('❌ Claim failed with status:', response.status);
          // Rimuovi token comunque per evitare loop
          localStorage.removeItem('magic_token');
        }
      } catch (error) {
        console.error('❌ Claim error:', error);
        localStorage.removeItem('magic_token');
      }
    };

    setTimeout(claimSavedMagicToken, 1500);
  }, [user, claimAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation for registration
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Le password non coincidono');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La password deve avere almeno 6 caratteri');
        setLoading(false);
        return;
      }
    }

    try {
      const result = isLogin 
        ? await login(email, password)
        : await register(email, password);

      if (result.success) {
        // Redirect to app on successful auth
        router.push('/app');
      } else {
        // Handle specific errors
        let errorMessage = result.error || 'Errore durante l\'autenticazione';
        
        // User-friendly error messages
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Email o password non corrette';
        } else if (errorMessage.includes('Email already registered')) {
          errorMessage = 'Questa email è già registrata. Prova ad accedere invece.';
        } else if (errorMessage.includes('confirm your email')) {
          errorMessage = 'Controlla la tua email e clicca sul link di conferma prima di accedere.';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Caricamento...</p>
        </div>
      </div>
    );
  }


  return (
    <>
      {/* Style for progress animation */}
      <style jsx>{`
        @keyframes fillProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>

      {/* Success Modal */}
      {showSuccessModal && (() => {
        console.log('🎉 Success modal is being rendered');
        return true;
      })() && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="relative">
              {/* Success icon with animation */}
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Account attivato! 🎉</h2>
              <p className="text-gray-300 text-lg mb-6">
                I tuoi <span className="font-bold text-green-400">4000 crediti</span> sono stati attivati.
              </p>
              
              <div className="space-y-4">
                <p className="text-gray-400">Stai per essere reindirizzato...</p>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-[3000ms] ease-out"
                    style={{
                      width: '0%',
                      animation: 'fillProgress 3s ease-out forwards',
                    }}
                  />
                </div>
                
                {/* Loading spinner */}
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl" />
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* StudiusAI Logo */}
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Accedi a StudiusAI
            </h1>
            <p className="text-gray-300">
              {isLogin ? 'Bentornato! Accedi al tuo account.' : 'Crea il tuo account per iniziare.'}
            </p>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setConfirmPassword('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Accedi
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setConfirmPassword('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Registrati
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@esempio.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Conferma Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Accesso in corso...' : 'Registrazione...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Accedi' : 'Crea Account'}
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link (only for login) */}
          {isLogin && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  // TODO: Implement forgot password functionality if needed
                  alert('Contatta supporto@studiusai.com per recuperare la password');
                }}
                className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
            <p className="text-xs text-gray-400">
              🔒 I tuoi dati sono protetti con crittografia SSL
            </p>
            <p className="text-xs text-gray-500">
              StudiusAI - Il tuo assistente AI per lo studio
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}