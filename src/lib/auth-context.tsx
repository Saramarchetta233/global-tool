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

  // Function to initialize user profile and get credits
  const initUserProfile = async (userId: string): Promise<number> => {
    try {
      const response = await fetch('/api/profile/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.credits || 120;
      } else {
        console.error('Failed to initialize profile');
        return 120;
      }
    } catch (error) {
      console.error('Error initializing profile:', error);
      return 120;
    }
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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          const userObj = await createUserFromSupabase(session.user);
          setUser(userObj);
          setToken(session.access_token);
          localStorage.setItem('user', JSON.stringify(userObj));
        } catch (error) {
          console.error('Error creating user from Supabase:', error);
          setIsLoading(false);
        }
      }
      
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

    return () => subscription.unsubscribe();
  }, []);


  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error);
        return { success: false, error: 'Email o password non corrette' };
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