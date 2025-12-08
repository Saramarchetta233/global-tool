import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_BASE_URL = 'https://api-m.paypal.com'; // Forza LIVE per credenziali Live

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID' }, 
        { status: 400 }
      );
    }

    console.log(`💰 Capturing PayPal order: ${orderId}`);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      console.error('PayPal capture failed:', error);
      throw new Error('PayPal capture failed');
    }

    const captureData = await captureResponse.json();
    console.log(`✅ PayPal payment captured: ${orderId}`);

    // Extract metadata from custom_id
    const customId = captureData.purchase_units[0]?.payments?.captures[0]?.custom_id;
    const [userId, planType, version] = customId?.split('_') || [];

    if (!userId || !planType) {
      console.error('❌ Missing user data in PayPal response');
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    console.log(`👤 Processing PayPal payment for user: ${userId}, plan: ${planType}, version: ${version}`);

    // Update user profile based on plan
    let subscriptionType = null;
    let subscriptionActive = false;
    let lifetimeActive = false;
    let creditsToAdd = 0;

    if (version === '2' && planType === 'onetime') {
      // Version 2: One-time payment with 4000 credits
      creditsToAdd = 4000;
      subscriptionType = 'onetime_4000';
      subscriptionActive = false;
      lifetimeActive = false;
    } else if (planType === 'lifetime') {
      // Lifetime access
      lifetimeActive = true;
      subscriptionType = 'lifetime';
      subscriptionActive = false;
    } else if (planType === 'monthly') {
      // Monthly subscription (Note: PayPal monthly needs recurring setup)
      subscriptionType = 'monthly';
      subscriptionActive = true;
      lifetimeActive = false;
    }

    // Update user profile in database
    const updateData: any = {
      subscription_type: subscriptionType,
      subscription_active: subscriptionActive,
      lifetime_active: lifetimeActive,
      subscription_renewal_date: planType === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    };

    // Set registration_type for onetime users
    if (version === '2' && planType === 'onetime') {
      updateData.registration_type = 'onetime_payment';
    }

    const { data, error } = await supabaseAdmin!
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error(`❌ Database update failed:`, error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    // If adding credits, do it separately
    if (creditsToAdd > 0) {
      const { error: creditsError } = await supabaseAdmin!
        .rpc('add_credits', { 
          p_user_id: userId, 
          p_amount: creditsToAdd 
        });

      if (creditsError) {
        console.error(`❌ Credits update failed:`, creditsError);
      } else {
        console.log(`💰 Added ${creditsToAdd} credits to user ${userId}`);
      }
    }

    console.log(`✅ PayPal payment processed successfully for user ${userId}`);

    return NextResponse.json({ 
      success: true,
      orderId: orderId,
      captureId: captureData.id 
    });

  } catch (error) {
    console.error('❌ PayPal capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal payment' }, 
      { status: 500 }
    );
  }
}