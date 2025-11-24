import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

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

    // 1. Aggiorna lo status della subscription a lifetime
    const { data: subscriptionUpdate, error: subError } = await supabaseAdmin
      .rpc('update_subscription', {
        p_user_id: user.id,
        p_subscription_type: 'lifetime',
        p_duration_months: null // Lifetime non ha scadenza
      });

    if (subError || !subscriptionUpdate?.success) {
      console.error('❌ Error updating lifetime subscription:', subError || subscriptionUpdate);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    console.log('✅ Lifetime subscription updated:', subscriptionUpdate);

    // 2. Assegna 6.000 crediti per l'abbonamento lifetime
    const creditAmount = 6000;
    const { data: creditResult, error: creditError } = await supabaseAdmin
      .rpc('assign_credits', {
        p_user_id: user.id,
        p_amount: creditAmount,
        p_transaction_type: 'lifetime_purchase',
        p_description: `Abbonamento Lifetime - ${creditAmount} crediti`,
        p_subscription_type: 'lifetime'
      });

    if (creditError || !creditResult?.success) {
      console.error('❌ Error assigning lifetime credits:', creditError || creditResult);
      return NextResponse.json(
        { error: 'Failed to assign lifetime credits' },
        { status: 500 }
      );
    }

    console.log('✅ Lifetime credits assigned:', creditResult);

    return NextResponse.json({
      success: true,
      subscription: {
        type: 'lifetime',
        startDate: subscriptionUpdate.start_date,
        endDate: null, // Lifetime non scade mai
        isLifetime: true
      },
      credits: {
        assigned: creditAmount,
        newBalance: creditResult.new_balance
      },
      transactionId: creditResult.transaction_id
    });

  } catch (error) {
    console.error('Lifetime subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}