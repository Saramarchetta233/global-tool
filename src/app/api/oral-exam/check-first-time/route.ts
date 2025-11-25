import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    console.log('🔍 check-first-time: Using session counting for user:', user.id);
    
    // USA LA STESSA LOGICA DELL'API PRINCIPALE: conta le sessioni esistenti
    try {
      if (!supabaseAdmin) {
        console.log('📝 check-first-time: supabaseAdmin not available, assuming first exam');
        return NextResponse.json({
          isFirstTime: true,
          cost: 0,
          oralExamCount: 0
        });
      }
      
      const { count: oralExamCount, error: countError } = await supabaseAdmin
        .from('oral_exam_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.log('📝 check-first-time: oral_exam_sessions table not found, assuming first exam');
        // Se la tabella non esiste, è sicuramente il primo esame
        return NextResponse.json({
          isFirstTime: true,
          cost: 0,
          oralExamCount: 0
        });
      }

      const sessionCount = oralExamCount || 0;
      const isFirstTime = sessionCount === 0;
      
      console.log('🔍 check-first-time result:', {
        userId: user.id,
        sessionCount,
        isFirstTime,
        cost: isFirstTime ? 0 : 25
      });
      
      return NextResponse.json({
        isFirstTime,
        cost: isFirstTime ? 0 : 25,
        oralExamCount: sessionCount
      });
      
    } catch (sessionCountError) {
      // Fallback: se oral_exam_sessions non esiste, usa la logica vecchia
      console.log('📝 check-first-time: Fallback to profile flags due to error:', sessionCountError);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('oral_exam_uses, has_used_oral_once')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ check-first-time: Error with both approaches:', profileError);
        // In caso di errore totale, considera come primo esame per sicurezza
        return NextResponse.json({
          isFirstTime: true,
          cost: 0,
          oralExamCount: 0
        });
      }
      
      let oralUses = profile?.oral_exam_uses;
      if (oralUses === null || oralUses === undefined) {
        oralUses = profile?.has_used_oral_once ? 1 : 0;
      }
      
      const isFirstTime = (oralUses === 0);
      
      return NextResponse.json({
        isFirstTime,
        cost: isFirstTime ? 0 : 25,
        oralExamCount: oralUses
      });
    }

  } catch (error) {
    console.error('Check first time oral exam error:', error);
    return NextResponse.json(
      { error: 'Failed to check oral exam status' },
      { status: 500 }
    );
  }
}