import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('🔄 Processing monthly subscription renewal:', {
      userId: user.id
    });

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Verifica che l'utente abbia un abbonamento mensile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_type, subscription_end_date, last_monthly_credit_date')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    if (profile.subscription_type !== 'monthly') {
      return NextResponse.json(
        { error: 'User does not have monthly subscription' },
        { status: 400 }
      );
    }

    // 1. Estendi la subscription di un mese
    const { data: subscriptionUpdate, error: subError } = await supabaseAdmin
      .rpc('update_subscription', {
        p_user_id: user.id,
        p_subscription_type: 'monthly',
        p_duration_months: 1
      });

    if (subError || !subscriptionUpdate?.success) {
      console.error('❌ Error updating subscription:', subError || subscriptionUpdate);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    console.log('✅ Subscription renewed:', subscriptionUpdate);

    // 2. Assegna 2.000 crediti per il rinnovo mensile
    const creditAmount = 2000;
    const { data: creditResult, error: creditError } = await supabaseAdmin
      .rpc('assign_credits', {
        p_user_id: user.id,
        p_amount: creditAmount,
        p_transaction_type: 'monthly_subscription',
        p_description: `Rinnovo abbonamento mensile - ${creditAmount} crediti`,
        p_subscription_type: 'monthly'
      });

    if (creditError || !creditResult?.success) {
      console.error('❌ Error assigning renewal credits:', creditError || creditResult);
      return NextResponse.json(
        { error: 'Failed to assign renewal credits' },
        { status: 500 }
      );
    }

    console.log('✅ Monthly renewal credits assigned:', creditResult);

    return NextResponse.json({
      success: true,
      renewal: {
        type: 'monthly',
        startDate: subscriptionUpdate.start_date,
        endDate: subscriptionUpdate.end_date,
        isRenewal: true
      },
      credits: {
        assigned: creditAmount,
        newBalance: creditResult.new_balance
      },
      transactionId: creditResult.transaction_id
    });

  } catch (error) {
    console.error('Monthly renewal API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}