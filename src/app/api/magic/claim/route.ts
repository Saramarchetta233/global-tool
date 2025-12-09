import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuth } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';

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
    return `${localPart[0]}*****@${domain}`;
  }
  
  const firstLetter = localPart[0];
  const lastLetter = localPart[localPart.length - 1];
  const maskedMiddle = '*'.repeat(Math.max(5, localPart.length - 2));
  
  return `${firstLetter}${maskedMiddle}${lastLetter}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication using existing verifyAuth function
    let authenticatedUser;
    try {
      authenticatedUser = await verifyAuth(req);
    } catch (error) {
      console.error('❌ User not authenticated for magic link claim');
      return NextResponse.json({ 
        error: 'not_authenticated' 
      }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { token } = body;
    
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ 
        error: 'Missing or invalid token in request body' 
      }, { status: 400 });
    }

    console.log(`🔗 Claiming magic link for user: ${authenticatedUser.email}`);
    console.log(`🔑 Token: ${token.substring(0, 8)}...`);

    // Look up magic link in database
    const { data: magicLink, error } = await supabaseAdmin
      .from('magic_links')
      .select('id, email, credits_to_grant, plan_type, is_used, expires_at')
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

    // Get user email and normalize both emails for comparison
    const userEmail = authenticatedUser.email.trim().toLowerCase();
    const magicLinkEmail = magicLink.email.trim().toLowerCase();

    console.log(`👤 User email: ${userEmail}`);
    console.log(`🎫 Magic link email: ${magicLinkEmail}`);

    // Check if emails match
    if (userEmail !== magicLinkEmail) {
      console.error('❌ Email mismatch');
      return NextResponse.json({ 
        error: 'email_mismatch',
        expectedEmail: maskEmail(magicLink.email)
      }, { status: 400 });
    }

    // Get current user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, plan_type')
      .eq('user_id', authenticatedUser.id)
      .single();

    if (profileError) {
      console.error('❌ Failed to get user profile:', profileError);
      return NextResponse.json({ 
        error: 'Failed to get user profile' 
      }, { status: 500 });
    }

    const currentCredits = profile?.credits || 0;
    const newCredits = currentCredits + magicLink.credits_to_grant;

    console.log(`💰 Current credits: ${currentCredits}`);
    console.log(`💰 Adding credits: ${magicLink.credits_to_grant}`);
    console.log(`💰 New total: ${newCredits}`);

    // Add credits using the existing RPC function
    const { data: creditResult, error: creditError } = await supabase
      .rpc('add_credits', {
        p_user_id: authenticatedUser.id,
        p_amount: magicLink.credits_to_grant,
        p_description: 'BeCoolPro magic link activation',
        p_operation: 'add'
      });

    if (creditError) {
      console.error('❌ Failed to add credits:', creditError);
      return NextResponse.json({ 
        error: 'Failed to add credits' 
      }, { status: 500 });
    }

    // Update user plan type to one_time (if not already set)
    const { error: planError } = await supabase
      .from('profiles')
      .update({ 
        plan_type: magicLink.plan_type 
      })
      .eq('user_id', authenticatedUser.id);

    if (planError) {
      console.error('❌ Failed to update plan type:', planError);
      // Don't fail the request for this, just log the error
    }

    // Mark magic link as used
    const { error: markUsedError } = await supabaseAdmin
      .from('magic_links')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by_user_id: authenticatedUser.id
      })
      .eq('id', magicLink.id);

    if (markUsedError) {
      console.error('❌ Failed to mark magic link as used:', markUsedError);
      // Don't fail the request for this, just log the error
    }

    console.log(`✅ Magic link claimed successfully!`);
    console.log(`💰 Credits added: ${magicLink.credits_to_grant}`);
    console.log(`💰 New balance: ${creditResult.new_balance}`);

    // Return success response
    return NextResponse.json({
      success: true,
      creditsAdded: magicLink.credits_to_grant,
      newBalance: creditResult.new_balance,
      planType: magicLink.plan_type
    });

  } catch (error) {
    console.error('❌ Unexpected error in magic link claim:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}