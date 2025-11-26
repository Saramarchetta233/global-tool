import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const body = await request.json();
    const { months = 1 } = body; // Default 1 mese
    
    console.log('📅 Processing monthly subscription:', {
      userId: user.id,
      months: months
    });

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Attiva abbonamento mensile con la nuova funzione (include anche i crediti)
    const { data: activationResult, error: activationError } = await supabaseAdmin
      .rpc('activate_monthly_subscription', {
        p_user_id: user.id
      });

    if (activationError || !activationResult?.success) {
      console.error('❌ Error activating monthly subscription:', activationError || activationResult);
      return NextResponse.json(
        { error: activationResult?.error || 'Failed to activate monthly subscription' },
        { status: 500 }
      );
    }

    console.log('✅ Monthly subscription activated:', activationResult);

    return NextResponse.json({
      success: true,
      subscription: {
        type: 'monthly',
        active: true,
        renewalDate: activationResult.renewal_date
      },
      credits: {
        assigned: 2000,
        newBalance: activationResult.new_balance
      },
      message: 'Abbonamento mensile attivato con successo! 2.000 crediti aggiunti.'
    });

  } catch (error) {
    console.error('Monthly subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}