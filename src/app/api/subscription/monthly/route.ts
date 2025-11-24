import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

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

    // 1. Aggiorna lo status della subscription
    const { data: subscriptionUpdate, error: subError } = await supabaseAdmin
      .rpc('update_subscription', {
        p_user_id: user.id,
        p_subscription_type: 'monthly',
        p_duration_months: months
      });

    if (subError || !subscriptionUpdate?.success) {
      console.error('❌ Error updating subscription:', subError || subscriptionUpdate);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    console.log('✅ Subscription updated:', subscriptionUpdate);

    // 2. Assegna 2.000 crediti per l'abbonamento mensile
    const creditAmount = 2000;
    const { data: creditResult, error: creditError } = await supabaseAdmin
      .rpc('assign_credits', {
        p_user_id: user.id,
        p_amount: creditAmount,
        p_transaction_type: 'monthly_subscription',
        p_description: `Abbonamento mensile (${months} ${months === 1 ? 'mese' : 'mesi'}) - ${creditAmount} crediti`,
        p_subscription_type: 'monthly'
      });

    if (creditError || !creditResult?.success) {
      console.error('❌ Error assigning monthly credits:', creditError || creditResult);
      return NextResponse.json(
        { error: 'Failed to assign monthly credits' },
        { status: 500 }
      );
    }

    console.log('✅ Monthly credits assigned:', creditResult);

    return NextResponse.json({
      success: true,
      subscription: {
        type: 'monthly',
        startDate: subscriptionUpdate.start_date,
        endDate: subscriptionUpdate.end_date,
        months: months
      },
      credits: {
        assigned: creditAmount,
        newBalance: creditResult.new_balance
      },
      transactionId: creditResult.transaction_id
    });

  } catch (error) {
    console.error('Monthly subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}