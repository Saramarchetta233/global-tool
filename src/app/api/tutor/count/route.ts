import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    // NUOVA LOGICA: conta messaggi dalla tabella tutor_messages
    if (!supabaseAdmin) {
      console.error('supabaseAdmin not available');
      return NextResponse.json({ 
        messageCount: 0,
        freeMessagesRemaining: CreditCosts.tutorFreeMessages, 
        isWithinFreeLimit: true 
      });
    }

    const { count, error } = await supabaseAdmin
      .from('tutor_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching tutor message count:', error);
      return NextResponse.json({ 
        messageCount: 0,
        freeMessagesRemaining: CreditCosts.tutorFreeMessages, 
        isWithinFreeLimit: true 
      });
    }

    const messageCount = count ?? 0;
    const isWithinFreeLimit = messageCount < CreditCosts.tutorFreeMessages;
    const freeMessagesRemaining = isWithinFreeLimit 
      ? CreditCosts.tutorFreeMessages - messageCount 
      : 0;

    console.log('📊 Tutor count response:', {
      messageCount,
      freeMessagesRemaining,
      isWithinFreeLimit,
      tutorFreeMessages: CreditCosts.tutorFreeMessages
    });

    return NextResponse.json({
      messageCount,
      freeMessagesRemaining,
      isWithinFreeLimit
    });

  } catch (error) {
    console.error('Tutor count API error:', error);
    return NextResponse.json({ 
      messageCount: 0,
      freeMessagesRemaining: CreditCosts.tutorFreeMessages, 
      isWithinFreeLimit: true 
    });
  }
}