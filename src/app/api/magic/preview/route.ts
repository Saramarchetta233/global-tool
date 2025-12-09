import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin client (service role) - ONLY for magic_links table
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to mask email address
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    // Very short email, mask differently
    return `${localPart[0]}*****@${domain}`;
  }
  
  // Show first letter, last letter before @, mask the rest
  const firstLetter = localPart[0];
  const lastLetter = localPart[localPart.length - 1];
  const maskedMiddle = '*'.repeat(Math.max(5, localPart.length - 2));
  
  return `${firstLetter}${maskedMiddle}${lastLetter}@${domain}`;
}

export async function GET(req: NextRequest) {
  try {
    // Get token from URL parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ 
        error: 'Missing or invalid token parameter' 
      }, { status: 400 });
    }

    console.log(`🔍 Previewing magic link for token: ${token.substring(0, 8)}...`);

    // Look up magic link in database
    const { data: magicLink, error } = await supabaseAdmin
      .from('magic_links')
      .select('id, email, is_used, expires_at, credits_to_grant')
      .eq('token', token)
      .single();

    if (error || !magicLink) {
      console.error('❌ Token not found in database:', error);
      return NextResponse.json({ 
        error: 'invalid_token' 
      }, { status: 400 });
    }

    // Check if already used
    if (magicLink.is_used) {
      console.error('❌ Magic link already used');
      return NextResponse.json({ 
        error: 'already_used' 
      }, { status: 400 });
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(magicLink.expires_at);
    
    if (expiresAt < now) {
      console.error('❌ Magic link expired');
      return NextResponse.json({ 
        error: 'expired' 
      }, { status: 400 });
    }

    // Generate masked email for privacy
    const maskedEmail = maskEmail(magicLink.email);

    console.log(`✅ Magic link valid for email: ${maskedEmail}`);
    console.log(`💰 Credits to grant: ${magicLink.credits_to_grant}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);

    // Return success with masked email
    return NextResponse.json({
      success: true,
      maskedEmail,
      email: magicLink.email, // Full email for pre-filling forms
      creditsToGrant: magicLink.credits_to_grant,
      expiresAt: magicLink.expires_at
    });

  } catch (error) {
    console.error('❌ Unexpected error in magic link preview:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}