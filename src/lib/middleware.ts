import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { demoAuth } from './demo-auth';
import { CREDIT_COSTS, CreditOperation } from './prompts';
import {supabase } from './supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  credits: number;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InsufficientCreditsError extends Error {
  constructor(public required: number, public available: number) {
    super(`Insufficient credits. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientCreditsError';
  }
}

// JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function verifyAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Authorization token required');
  }

  const token = authHeader.substring(7);
  
  try {
    // Check if it's a demo token first (always support demo tokens)
    if (token.startsWith('demo-token-')) {
      const user = await demoAuth.verifyToken(token);
      return {
        id: user.id,
        email: user.email,
        credits: user.credits
      };
    }
    
    // Try Supabase authentication first
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (supabaseUser && !authError) {
      // User authenticated with Supabase, get credits from database
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', supabaseUser.id)
          .single();

        const credits = profile?.credits || 120; // Default se non trovato

        return {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          credits: credits
        };
      } catch (e) {
        console.error('Error fetching user credits:', e);
        return {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          credits: 120 // Default fallback
        };
      }
    }
    
    // Fallback to JWT verification (for backward compatibility)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw new AuthError('Invalid token or user not found');
    }

    return {
      id: user.id,
      email: user.email,
      credits: user.credits
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError('Invalid token');
  }
}

export async function checkCredits(
  userId: string,
  operation: CreditOperation
): Promise<{ canProceed: boolean; currentCredits: number; requiredCredits: number }> {
  const requiredCredits = CREDIT_COSTS[operation];
  
  // Check if using demo user (always support demo users)
  if (userId.startsWith('demo-user-')) {
    return await demoAuth.checkCredits(userId, requiredCredits);
  }
  
  // Per utenti Supabase, usa il nuovo sistema crediti
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('Error fetching user credits:', error);
      return {
        canProceed: false,
        currentCredits: 0,
        requiredCredits
      };
    }

    return {
      canProceed: user.credits >= requiredCredits,
      currentCredits: user.credits,
      requiredCredits
    };
  } catch (error) {
    console.error('Error in checkCredits:', error);
    return {
      canProceed: false,
      currentCredits: 0,
      requiredCredits
    };
  }
}

export async function deductCredits(
  userId: string,
  operation: CreditOperation
): Promise<{ newCreditBalance: number }> {
  const requiredCredits = CREDIT_COSTS[operation];
  
  // Check if using demo user (always support demo users)
  if (userId.startsWith('demo-user-')) {
    const result = await demoAuth.deductCredits(userId, requiredCredits, operation);
    return result;
  }
  
  // Per utenti Supabase, usa il nuovo sistema crediti
  try {
    const { data, error } = await supabase
      .rpc('consume_credits', {
        p_user_id: userId,
        p_amount: requiredCredits,
        p_description: `${operation} operation`,
        p_feature_type: operation
      });

    if (error) {
      console.error('Error deducting credits:', error);
      throw new Error('Failed to deduct credits');
    }

    if (!data.success) {
      if (data.error === 'insufficient_credits') {
        throw new InsufficientCreditsError(requiredCredits, data.current_credits || 0);
      }
      throw new Error(data.error || 'Failed to deduct credits');
    }

    return { newCreditBalance: data.new_balance };
  } catch (error) {
    if (error instanceof InsufficientCreditsError) throw error;
    console.error('Error in deductCredits:', error);
    throw new Error('Failed to deduct credits');
  }
}

export function withAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      const user = await verifyAuth(request);
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function withCredits(
  operation: CreditOperation,
  handler: (request: NextRequest, user: AuthenticatedUser, newCreditBalance: number) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const creditCheck = await checkCredits(user.id, operation);
      
      if (!creditCheck.canProceed) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            required: creditCheck.requiredCredits,
            available: creditCheck.currentCredits
          },
          { status: 402 }
        );
      }

      const { newCreditBalance } = await deductCredits(user.id, operation);
      
      return await handler(request, user, newCreditBalance);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            required: error.required,
            available: error.available
          },
          { status: 402 }
        );
      }
      if (error instanceof AuthError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}