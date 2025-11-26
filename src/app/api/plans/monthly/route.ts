import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('📅 Attivazione piano mensile per utente:', user.id);

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Usa la funzione SQL dedicata per attivare il piano mensile
    const { data: result, error } = await supabaseAdmin
      .rpc('grant_monthly_plan', {
        p_user_id: user.id
      });

    if (error) {
      console.error('❌ Errore attivazione piano mensile:', error);
      return NextResponse.json(
        { error: 'Failed to activate monthly plan' },
        { status: 500 }
      );
    }

    if (!result?.success) {
      console.error('❌ Piano mensile non attivato:', result);
      return NextResponse.json(
        { error: result?.error || 'Failed to activate monthly plan' },
        { status: 400 }
      );
    }

    console.log('✅ Piano mensile attivato:', result);

    return NextResponse.json({
      success: true,
      plan: {
        type: 'monthly',
        price: '19.99',
        currency: 'EUR',
        credits_added: 2000,
        new_balance: result.new_balance,
        started_at: result.plan_started_at,
        renews_at: result.plan_renews_at
      }
    });

  } catch (error) {
    console.error('Monthly plan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}