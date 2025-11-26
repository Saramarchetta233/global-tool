import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Definizione pacchetti ricarica secondo la "Bibbia dei Crediti"
const TOPUP_PACKAGES = {
  '1000': { credits: 1000, price: '9.99', function: 'grant_topup_1000' },
  '3000': { credits: 3000, price: '14.99', function: 'grant_topup_3000' },
  '10000': { credits: 10000, price: '39.99', function: 'grant_topup_10000' }
} as const;

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const body = await request.json();
    const { package: packageType } = body; // '1000', '3000', '10000'
    
    console.log('🔋 Ricarica crediti richiesta:', {
      userId: user.id,
      packageType
    });

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Verifica che il pacchetto sia valido
    if (!TOPUP_PACKAGES[packageType as keyof typeof TOPUP_PACKAGES]) {
      return NextResponse.json(
        { error: 'Invalid topup package' },
        { status: 400 }
      );
    }

    const topupPackage = TOPUP_PACKAGES[packageType as keyof typeof TOPUP_PACKAGES];
    
    // Usa la funzione SQL specifica per questa ricarica
    const { data: result, error } = await supabaseAdmin
      .rpc(topupPackage.function, {
        p_user_id: user.id
      });

    if (error) {
      console.error('❌ Errore ricarica crediti:', error);
      return NextResponse.json(
        { error: 'Failed to process topup' },
        { status: 500 }
      );
    }

    if (!result?.success) {
      console.error('❌ Ricarica fallita:', result);
      
      // Gestisci caso specifico "no active plan"
      if (result?.error === 'NO_ACTIVE_PLAN') {
        return NextResponse.json(
          { 
            error: 'NO_ACTIVE_PLAN',
            message: 'Ricariche disponibili solo con abbonamento attivo (Mensile o Lifetime)'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: result?.error || 'Failed to process topup' },
        { status: 400 }
      );
    }

    console.log('✅ Ricarica completata:', result);

    return NextResponse.json({
      success: true,
      topup: {
        package: packageType,
        credits_added: topupPackage.credits,
        price: topupPackage.price,
        currency: 'EUR',
        new_balance: result.new_balance
      }
    });

  } catch (error) {
    console.error('Topup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint per verificare disponibilità ricariche
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Verifica se l'utente ha un piano attivo
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('plan_type, has_active_plan, plan_started_at, plan_renews_at')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    const canPurchaseTopup = profile?.has_active_plan === true;

    return NextResponse.json({
      can_purchase: canPurchaseTopup,
      current_plan: {
        type: profile?.plan_type || 'free',
        has_active_plan: profile?.has_active_plan || false,
        started_at: profile?.plan_started_at,
        renews_at: profile?.plan_renews_at
      },
      available_packages: canPurchaseTopup ? TOPUP_PACKAGES : null
    });

  } catch (error) {
    console.error('Topup check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}