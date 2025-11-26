import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('♾️ Processing lifetime subscription:', {
      userId: user.id
    });

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Attiva abbonamento lifetime con la nuova funzione (include anche i crediti)
    const { data: activationResult, error: activationError } = await supabaseAdmin
      .rpc('activate_lifetime_subscription', {
        p_user_id: user.id
      });

    if (activationError || !activationResult?.success) {
      console.error('❌ Error activating lifetime subscription:', activationError || activationResult);
      return NextResponse.json(
        { error: activationResult?.error || 'Failed to activate lifetime subscription' },
        { status: 500 }
      );
    }

    console.log('✅ Lifetime subscription activated:', activationResult);

    return NextResponse.json({
      success: true,
      subscription: {
        type: 'lifetime',
        active: true,
        isLifetime: true,
        noExpiration: true
      },
      credits: {
        assigned: 6000,
        newBalance: activationResult.new_balance
      },
      message: 'Abbonamento Lifetime attivato con successo! 6.000 crediti aggiunti.'
    });

  } catch (error) {
    console.error('Lifetime subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}