import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    // Controlla se l'utente ha già usato l'orale
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_used_oral_once')
      .eq('user_id', user.id)
      .single();
    
    const isFirstTime = !profile?.has_used_oral_once;
    
    return NextResponse.json({
      isFirstTime,
      cost: isFirstTime ? 0 : 10
    });

  } catch (error) {
    console.error('Check first time oral exam error:', error);
    return NextResponse.json(
      { error: 'Failed to check oral exam status' },
      { status: 500 }
    );
  }
}