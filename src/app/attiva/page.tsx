'use client';

import { Eye, EyeOff, Loader2, Mail, Lock, Crown, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

import { useAuth } from '@/lib/auth-context';

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white">Caricamento...</p>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function AttivaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, register, login, updateCredits } = useAuth();
  
  const [token, setToken] = useState<string | null>(null);
  const [magicLinkData, setMagicLinkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  // Form states
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Get token from URL on mount
  useEffect(() => {
    const urlToken = searchParams.get('token');
    
    if (!urlToken) {
      // No token, redirect to homepage
      router.replace('/');
      return;
    }
    
    setToken(urlToken);
  }, [searchParams, router]);

  // Preview magic link when token is available
  useEffect(() => {
    if (!token) return;

    const previewMagicLink = async () => {
      try {
        const response = await fetch(`/api/magic/preview?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'invalid_token') {
            setError('Questo link non è valido. Se pensi sia un errore, contatta supporto@studiusai.com');
          } else if (data.error === 'already_used') {
            setError('Questo link è già stato utilizzato. Se non sei stato tu, contatta il supporto.');
          } else if (data.error === 'expired') {
            setError('Questo link è scaduto. Contatta il supporto per assistenza.');
          } else {
            setError('Errore nel caricamento del link. Contatta il supporto.');
          }
          return;
        }

        setMagicLinkData(data);
        setEmail(data.email); // Pre-fill email
        
      } catch (error) {
        console.error('Error previewing magic link:', error);
        setError('Errore di connessione. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    previewMagicLink();
  }, [token]);

  // If user is logged in, try to claim the magic link automatically
  useEffect(() => {
    if (!token || !user || !magicLinkData || claimSuccess) return;

    const claimMagicLink = async () => {
      try {
        const response = await fetch('/api/magic/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === 'invalid_token') {
            setError('Questo link non è valido. Se pensi sia un errore, contatta supporto@studiusai.com');
          } else if (data.error === 'already_used') {
            setError('Questo link è già stato utilizzato. Se non sei stato tu, contatta il supporto.');
          } else if (data.error === 'expired') {
            setError('Questo link è scaduto. Contatta il supporto per assistenza.');
          } else if (data.error === 'email_mismatch') {
            setError(`Per attivare i crediti devi accedere con l'email: ${data.expectedEmail}. Esci e registrati con quella email.`);
          } else {
            setError('Errore nell\'attivazione. Contatta il supporto.');
          }
          return;
        }

        // Success! Credits activated
        setClaimSuccess(true);
        
        // Update credits context
        if (updateCredits) {
          updateCredits(data.newBalance);
        }

        // Show success and redirect after 3 seconds
        setTimeout(() => {
          // Remove token from URL
          const url = new URL(window.location.href);
          url.searchParams.delete('token');
          window.history.replaceState({}, '', url.pathname);
          
          // Redirect to app
          router.push('/app');
        }, 3000);

      } catch (error) {
        console.error('Error claiming magic link:', error);
        setError('Errore di connessione. Riprova più tardi.');
      }
    };

    claimMagicLink();
  }, [token, user, magicLinkData, claimSuccess, updateCredits, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!isLogin && password !== confirmPassword) {
      setFormError('Le password non coincidono');
      setFormLoading(false);
      return;
    }

    try {
      const result = isLogin 
        ? await login(email, password)
        : await register(email, password);

      if (result.success) {
        // Authentication successful - the useEffect above will handle claiming
        setFormError(null);
      } else {
        setFormError(result.error || 'Errore durante l\'autenticazione');
      }
    } catch (error) {
      setFormError('Errore di connessione. Riprova più tardi.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Errore</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            Torna alla Homepage
          </button>
        </div>
      </div>
    );
  }

  if (claimSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Perfetto! 🎉</h2>
          <p className="text-gray-300 mb-6">
            {magicLinkData?.creditsToGrant || 4000} crediti attivati sul tuo account!
          </p>
          <div className="animate-pulse">
            <p className="text-purple-300 text-sm">Reindirizzamento all'app...</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    // User is logged in but claim hasn't succeeded yet - show loading
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Attivazione crediti in corso...</p>
        </div>
      </div>
    );
  }

  // User not logged in - show registration/login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl" />
        
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              🎓 Attiva il tuo accesso StudiusAI
            </h1>
            <p className="text-gray-300 text-sm mb-4">
              {isLogin ? 'Accedi per attivare i crediti' : 'Registrati per ricevere i tuoi 4000 crediti inclusi nell\'acquisto'}
            </p>
            {magicLinkData && (
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                <p className="text-purple-200 text-sm">
                  Usa l'email: <span className="font-mono font-medium">{magicLinkData.maskedEmail}</span>
                </p>
              </div>
            )}
          </div>

          {/* Auth Toggle */}
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Registrati
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Accedi
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuth} className="space-y-4">
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
            {formError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{formError}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {formLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Accesso...' : 'Registrazione...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Accedi e Attiva Crediti' : 'Registrati e Attiva Crediti'}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-400">
            🔒 I tuoi dati sono al sicuro con crittografia SSL
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function AttivaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AttivaContent />
    </Suspense>
  );
}