import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_MONTHLY_PLAN_ID = process.env.PAYPAL_MONTHLY_PLAN_ID!;
const PAYPAL_BASE_URL = 'https://api-m.paypal.com'; // Forza LIVE per credenziali Live

// Get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  console.log('🔄 Getting PayPal access token...');
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ PayPal token request failed:', response.status, error);
    throw new Error(`PayPal auth failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('✅ PayPal access token obtained');
  
  if (!data.access_token) {
    console.error('❌ No access token in PayPal response:', data);
    throw new Error('No access token received from PayPal');
  }
  
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    // Generate temporary userId if not provided (for homepage purchases)
    const finalUserId = userId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`🔄 Creating PayPal subscription for user: ${finalUserId}`);
    console.log(`🔧 PayPal Config:`, {
      clientId: PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'MISSING',
      planId: PAYPAL_MONTHLY_PLAN_ID,
      baseUrl: PAYPAL_BASE_URL,
      environment: process.env.NODE_ENV
    });

    // Get PayPal access token
    console.log('🔄 Getting PayPal access token...');
    const accessToken = await getPayPalAccessToken();
    console.log(`✅ Access token obtained: ${accessToken ? 'YES' : 'NO'}`);

    // Create subscription
    const subscriptionData = {
      plan_id: PAYPAL_MONTHLY_PLAN_ID,
      custom_id: finalUserId, // Importante: usiamo questo per identificare l'utente nei webhook
      application_context: {
        brand_name: 'StudiusAI',
        locale: 'it-IT',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${req.headers.get('origin') || 'http://localhost:3000'}/app?subscription=success`,
        cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}/app?subscription=cancelled`
      },
      subscriber: {
        email_address: undefined // L'utente inserirà l'email su PayPal
      }
    };

    console.log('🔄 Sending subscription request to PayPal...');
    console.log('Request data:', JSON.stringify(subscriptionData, null, 2));
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `sub-${finalUserId}-${Date.now()}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData),
    });

    console.log('PayPal Response Status:', response.status);
    console.log('PayPal Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ PayPal subscription creation failed:');
      console.error('Status:', response.status);
      console.error('Response:', error);
      console.error('Request data:', JSON.stringify(subscriptionData, null, 2));
      throw new Error(`PayPal API Error: ${response.status} - ${error}`);
    }

    const subscription = await response.json();
    console.log(`✅ PayPal subscription created: ${subscription.id}`);

    // Trova il link di approvazione
    const approveLink = subscription.links?.find(
      (link: any) => link.rel === 'approve'
    );

    if (!approveLink) {
      throw new Error('No approval link found in PayPal response');
    }

    return NextResponse.json({ 
      subscriptionId: subscription.id,
      approvalUrl: approveLink.href
    });

  } catch (error) {
    console.error('❌ PayPal subscription error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to create PayPal subscription',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

// GET per verificare stato subscription
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const subscriptionId = url.searchParams.get('subscriptionId');
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId parameter' }, 
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to get subscription:', error);
      throw new Error('Failed to get subscription details');
    }

    const subscription = await response.json();
    
    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      custom_id: subscription.custom_id,
      plan_id: subscription.plan_id,
      create_time: subscription.create_time,
      billing_info: subscription.billing_info
    });

  } catch (error) {
    console.error('❌ Error getting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription details' }, 
      { status: 500 }
    );
  }
}