import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`📖 Updating last_used_at for session ${sessionId} by user ${user.id}`);

    // Update last_used_at timestamp for the document
    const { error: updateError } = await supabase
      .from('tutor_sessions')
      .update({ 
        last_used_at: new Date().toISOString() 
      })
      .eq('id', sessionId)
      .eq('user_id', user.id); // Security: only update own documents

    if (updateError) {
      console.error('❌ Error updating document access time:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document access time' },
        { status: 500 }
      );
    }

    console.log(`✅ Document ${sessionId} access time updated`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Document access time updated'
    });

  } catch (error) {
    console.error('Document access API error:', error);
    return NextResponse.json(
      { error: 'Failed to update document access' },
      { status: 500 }
    );
  }
}