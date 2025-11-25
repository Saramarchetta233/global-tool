import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('🔍 check-cost: Checking probable questions cost for user:', user.id);
    
    // USA LA STESSA LOGICA DELL'API PRINCIPALE: conta le sessioni esistenti
    try {
      if (!supabaseAdmin) {
        console.log('📝 check-cost: supabaseAdmin not available, assuming first time');
        return NextResponse.json({
          isFirstTime: true,
          cost: 0,
          probableCount: 0
        });
      }
      
      const { count: probableCount, error: countError } = await supabaseAdmin
        .from('probable_question_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.log('📝 check-cost: probable_question_sessions table not found, assuming first time');
        // Se la tabella non esiste, è sicuramente la prima volta
        return NextResponse.json({
          isFirstTime: true,
          cost: 0,
          probableCount: 0
        });
      }

      const sessionCount = probableCount ?? 0;
      const isFirstTime = sessionCount === 0;
      const cost = isFirstTime ? 0 : 5;
      
      console.log('🔍 check-cost result:', {
        userId: user.id,
        sessionCount,
        isFirstTime,
        cost
      });
      
      return NextResponse.json({
        isFirstTime,
        cost,
        probableCount: sessionCount
      });
      
    } catch (sessionCountError) {
      // Fallback: se probable_question_sessions non esiste, è la prima volta
      console.log('📝 check-cost: Fallback due to error:', sessionCountError);
      
      return NextResponse.json({
        isFirstTime: true,
        cost: 0,
        probableCount: 0
      });
    }

  } catch (error) {
    console.error('Check cost probable questions error:', error);
    return NextResponse.json(
      { error: 'Failed to check probable questions cost' },
      { status: 500 }
    );
  }
}