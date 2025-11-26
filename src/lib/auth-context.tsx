'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateCredits: (newCredits: number) => void;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileInitPromiseRef = React.useRef<Map<string, Promise<number>>>(new Map());

  // Function to initialize user profile and get credits (con deduplicazione)
  const initUserProfile = async (userId: string): Promise<number> => {
    // Se c'è già una richiesta in corso per questo userId, ritorna quella
    const existingPromise = profileInitPromiseRef.current.get(userId);
    if (existingPromise) {
      console.log('[PROFILE_INIT] Returning existing promise for userId:', userId);
      return existingPromise;
    }

    // Crea una nuova promise e salvala
    const promise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/profile/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.credits || 120;
      } else {
        console.error('Failed to initialize profile');
        return 120;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Profile init request timed out');
      } else {
        console.error('Error initializing profile:', error);
      }
      return 120;
    } finally {
      // Rimuovi la promise dalla mappa dopo che è completata
      profileInitPromiseRef.current.delete(userId);
    }
    })();

    // Salva la promise nella mappa
    profileInitPromiseRef.current.set(userId, promise);
    return promise;
  };

  // Function to create User object from Supabase user with database credits
  const createUserFromSupabase = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Initialize user profile and get credits from profiles table
      const credits = await initUserProfile(supabaseUser.id);

      return {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        credits: credits
      };
    } catch (error) {
      console.error('Error in createUserFromSupabase:', error);
      return { id: supabaseUser.id, email: supabaseUser.email!, credits: 120 };
    }
  };

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout reached, forcing isLoading to false');
      setIsLoading(false);
    }, 10000); // 10 seconds timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            const userObj = await createUserFromSupabase(session.user);
            setUser(userObj);
            setToken(session.access_token);
            localStorage.setItem('user', JSON.stringify(userObj));
          } catch (error) {
            console.error('Error creating user from Supabase:', error);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      }
      
      clearTimeout(timeoutId);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const userObj = await createUserFromSupabase(session.user);
            setUser(userObj);
            setToken(session.access_token);
            localStorage.setItem('user', JSON.stringify(userObj));
          } catch (error) {
            console.error('Error creating user from Supabase on sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('currentTutorSession');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);


  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase login response:', { data: data?.user?.id, error: error?.message });

      if (error) {
        console.error('Supabase login error:', error);
        // Return specific error message from Supabase instead of generic one
        return { success: false, error: error.message || 'Email o password non corrette' };
      }

      if (data.user && data.session) {
        console.log('Login successful, user:', data.user.email);
        try {
          // Force immediate update without waiting for auth state change
          const userObj = await createUserFromSupabase(data.user);
          setUser(userObj);
          setToken(data.session.access_token);
          localStorage.setItem('user', JSON.stringify(userObj));
          return { success: true };
        } catch (error) {
          console.error('Error creating user on login:', error);
          return { success: false, error: 'Errore durante il caricamento del profilo' };
        }
      }

      return { success: false, error: 'Login fallito' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Errore di rete. Riprova più tardi.' };
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Email già registrata' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        // If there's a session, user is auto-confirmed and logged in
        if (data.session) {
          try {
            // Force immediate update without waiting for auth state change
            const userObj = await createUserFromSupabase(data.user);
            setUser(userObj);
            setToken(data.session.access_token);
            localStorage.setItem('user', JSON.stringify(userObj));
            return { success: true };
          } catch (error) {
            console.error('Error creating user on register:', error);
            return { success: false, error: 'Errore durante la creazione del profilo' };
          }
        }
        
        // If no session, email confirmation is required
        return { 
          success: true, 
          error: '🎉 Registrazione completata! Controlla la tua email per confermare l\'account. Clicca sul link nell\'email per attivare il tuo account.' 
        };
      }

      return { success: false, error: 'Registrazione fallita' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Errore di rete. Riprova più tardi.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // User will be cleared via the auth state change listener
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateCredits = (newCredits: number) => {
    if (user) {
      const updatedUser = { ...user, credits: newCredits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Funzione per ricaricare i crediti dal database
  const refreshCredits = async () => {
    if (!user?.id) return;
    
    try {
      // Leggi i crediti dalla tabella profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing credits:', error);
        return;
      }

      if (profile) {
        updateCredits(profile.credits || 0);
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateCredits,
    refreshCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}