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

    // Processa la ricarica con la nuova funzione protetta
    const rechargePackage = RECHARGE_PACKAGES[packageType as keyof typeof RECHARGE_PACKAGES];
    
    const { data: rechargeResult, error: rechargeError } = await supabaseAdmin
      .rpc('purchase_credit_recharge', {
        p_user_id: user.id,
        p_amount: rechargePackage.credits,
        p_price_paid: rechargePackage.price,
        p_description: `Ricarica ${rechargePackage.credits} crediti (€${rechargePackage.price})`
      });

    if (rechargeError || !rechargeResult?.success) {
      console.error('❌ Error processing credit recharge:', rechargeError || rechargeResult);
      
      // Se l'errore è dovuto alla mancanza di abbonamento
      if (rechargeResult?.error?.includes('abbonamento')) {
        return NextResponse.json(
          { 
            error: 'subscription_required',
            message: 'È necessario un abbonamento attivo (Mensile o Lifetime) per acquistare ricariche crediti.'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: rechargeResult?.error || 'Failed to process credit recharge' },
        { status: 500 }
      );
    }

    console.log('✅ Credit recharge processed:', rechargeResult);

    return NextResponse.json({
      success: true,
      recharge: {
        package: packageType,
        creditsAdded: rechargePackage.credits,
        price: rechargePackage.price
      },
      credits: {
        assigned: rechargePackage.credits,
        newBalance: rechargeResult.new_balance
      },
      transactionId: rechargeResult.transaction_id,
      message: `${rechargePackage.credits} crediti aggiunti con successo!`
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
      .select('registration_type, subscription_type, subscription_active, lifetime_active, subscription_renewal_date, credits')
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
        active: profile.subscription_active,
        lifetime: profile.lifetime_active,
        renewalDate: profile.subscription_renewal_date
      },
      credits: {
        current: profile.credits
      },
      availablePackages: canRecharge ? RECHARGE_PACKAGES : null,
      message: canRecharge 
        ? 'Ricariche disponibili' 
        : 'È necessario un abbonamento attivo per acquistare ricariche.'
    });

  } catch (error) {
    console.error('Recharge check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}