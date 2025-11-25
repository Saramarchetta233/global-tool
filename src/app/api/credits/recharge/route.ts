import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Pacchetti di ricarica disponibili
const RECHARGE_PACKAGES = {
  '1000': { credits: 1000, price: 9.99 },
  '3000': { credits: 3000, price: 14.99 },
  '10000': { credits: 10000, price: 39.99 }
} as const;

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const body = await request.json();
    const { packageType } = body; // '1000', '3000', '10000'
    
    console.log('🔋 Processing credit recharge:', {
      userId: user.id,
      packageType: packageType
    });

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Verifica che il pacchetto sia valido
    if (!RECHARGE_PACKAGES[packageType as keyof typeof RECHARGE_PACKAGES]) {
      return NextResponse.json(
        { error: 'Invalid recharge package' },
        { status: 400 }
      );
    }

    // 1. CONTROLLO FONDAMENTALE: Verifica che l'utente possa acquistare ricariche
    const { data: canRecharge, error: rechargeCheckError } = await supabaseAdmin
      .rpc('can_purchase_recharge', {
        p_user_id: user.id
      });

    if (rechargeCheckError) {
      console.error('❌ Error checking recharge eligibility:', rechargeCheckError);
      return NextResponse.json(
        { error: 'Failed to verify recharge eligibility' },
        { status: 500 }
      );
    }

    // Se l'utente non può ricaricare (no subscription attivo)
    if (!canRecharge) {
      console.log('❌ User cannot purchase recharge - no active subscription');
      return NextResponse.json(
        { 
          error: 'subscription_required',
          message: 'È necessario un abbonamento attivo (Mensile o Lifetime) per acquistare ricariche crediti.'
        },
        { status: 403 }
      );
    }

    console.log('✅ User eligible for recharge');

    // 2. Processa la ricarica
    const rechargePackage = RECHARGE_PACKAGES[packageType as keyof typeof RECHARGE_PACKAGES];
    
    const { data: creditResult, error: creditError } = await supabaseAdmin
      .rpc('assign_credits', {
        p_user_id: user.id,
        p_amount: rechargePackage.credits,
        p_transaction_type: 'credit_recharge',
        p_description: `Ricarica ${rechargePackage.credits} crediti (€${rechargePackage.price})`,
        p_subscription_type: null // Le ricariche non sono legate a subscription type specifico
      });

    if (creditError || !creditResult?.success) {
      console.error('❌ Error processing credit recharge:', creditError || creditResult);
      return NextResponse.json(
        { error: 'Failed to process credit recharge' },
        { status: 500 }
      );
    }

    console.log('✅ Credit recharge processed:', creditResult);

    return NextResponse.json({
      success: true,
      recharge: {
        package: packageType,
        creditsAdded: rechargePackage.credits,
        price: rechargePackage.price
      },
      credits: {
        assigned: rechargePackage.credits,
        newBalance: creditResult.new_balance
      },
      transactionId: creditResult.transaction_id
    });

  } catch (error) {
    console.error('Credit recharge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Endpoint per verificare se l'utente può acquistare ricariche
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Verifica se l'utente può acquistare ricariche
    const { data: canRecharge, error: rechargeCheckError } = await supabaseAdmin
      .rpc('can_purchase_recharge', {
        p_user_id: user.id
      });

    if (rechargeCheckError) {
      console.error('❌ Error checking recharge eligibility:', rechargeCheckError);
      return NextResponse.json(
        { error: 'Failed to verify recharge eligibility' },
        { status: 500 }
      );
    }

    // Recupera anche info sulla subscription corrente
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_type, subscription_end_date')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      canPurchaseRecharge: canRecharge,
      subscription: {
        type: profile.subscription_type,
        endDate: profile.subscription_end_date
      },
      availablePackages: canRecharge ? RECHARGE_PACKAGES : null
    });

  } catch (error) {
    console.error('Recharge check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}