import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    // Conta i messaggi tutor già utilizzati dall'utente
    // Contiamo SOLO le voci con feature_type 'tutor' per un conteggio preciso dei messaggi
    const { data: tutorMessages, error } = await supabase
      .from('credit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_type', 'tutor')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutor message count:', error);
      return NextResponse.json({ freeMessagesRemaining: 5, isWithinFreeLimit: true });
    }

    const messageCount = tutorMessages?.length || 0;
    const isWithinFreeLimit = messageCount < CreditCosts.tutorFreeMessages;
    const freeMessagesRemaining = isWithinFreeLimit 
      ? CreditCosts.tutorFreeMessages - messageCount 
      : 0;

    return NextResponse.json({
      messageCount,
      freeMessagesRemaining,
      isWithinFreeLimit
    });

  } catch (error) {
    console.error('Tutor count API error:', error);
    return NextResponse.json({ freeMessagesRemaining: 5, isWithinFreeLimit: true });
  }
}