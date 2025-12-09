import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

export async function POST(req: NextRequest) {
  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = process.env.MAGIC_LINK_API_KEY;
    
    if (!expectedApiKey) {
      console.error('❌ MAGIC_LINK_API_KEY environment variable not set');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('❌ Invalid or missing API key for magic link creation');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Missing or invalid email in request body' 
      }, { status: 400 });
    }

    // Normalize email (trim + lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail.includes('@')) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Generate secure random token (32 characters hex)
    const token = crypto.randomBytes(16).toString('hex');
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    console.log(`🔗 Creating magic link for email: ${normalizedEmail}`);
    console.log(`🔑 Generated token: ${token.substring(0, 8)}...`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);

    // Create magic link entry in database
    const { data, error } = await supabaseAdmin
      .from('magic_links')
      .insert({
        token,
        email: normalizedEmail,
        credits_to_grant: 4000,
        plan_type: 'one_time',
        expires_at: expiresAt.toISOString()
      })
      .select('token')
      .single();

    if (error) {
      console.error('❌ Failed to create magic link in database:', error);
      return NextResponse.json({ 
        error: 'Failed to create magic link' 
      }, { status: 500 });
    }

    // Build claim URL
    const baseUrl = req.headers.get('host')?.includes('localhost') 
      ? `http://${req.headers.get('host')}`
      : 'https://studius.becoolpro.com';
    
    const claimUrl = `${baseUrl}/attiva?token=${token}`;

    console.log(`✅ Magic link created successfully`);
    console.log(`🔗 Claim URL: ${claimUrl}`);

    // Return success response
    return NextResponse.json({
      success: true,
      token: data.token,
      claimUrl
    });

  } catch (error) {
    console.error('❌ Unexpected error in magic link creation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}