import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    // Marca che l'utente ha usato la prima sessione orale gratuita
    const { data, error } = await supabase
      .from('profiles')
      .update({ has_done_oral_first_session: true })
      .eq('user_id', user.id)
      .select('has_done_oral_first_session');
    
    if (error) {
      console.error('Error marking oral session as used:', error);
      return NextResponse.json(
        { error: 'Failed to mark oral session as used' },
        { status: 500 }
      );
    }
    
    console.log('✅ Oral first session marked as used for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Oral session marked as used',
      data
    });
    
  } catch (error) {
    console.error('API Error in mark-oral-used:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}