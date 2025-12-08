import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, description, featureType } = body;

    // Validazione input
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid fields', required: ['userId', 'amount'] },
        { status: 400 }
      );
    }

    // Verifica che il profilo utente esista
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Verifica crediti sufficienti
    if (profile.credits < amount) {
      return NextResponse.json(
        { 
          error: 'insufficient_credits',
          currentCredits: profile.credits,
          required: amount,
          missing: amount - profile.credits
        },
        { status: 403 }
      );
    }

    // Consuma crediti usando la function del database
    const { data, error } = await supabase
      .rpc('consume_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description || 'Credit consumption',
        p_feature_type: featureType || 'unknown'
      });

    if (error) {
      console.error('Credit consumption error:', error);
      return NextResponse.json(
        { error: 'Failed to consume credits' },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { 
          error: data.error === 'insufficient_credits' ? 'insufficient_credits' : 'consumption_failed',
          currentCredits: data.current_credits,
          required: amount
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      creditsConsumed: amount,
      newBalance: data.new_balance,
      message: `${amount} crediti consumati con successo`
    });

  } catch (error) {
    console.error('API Error in credits/consume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}