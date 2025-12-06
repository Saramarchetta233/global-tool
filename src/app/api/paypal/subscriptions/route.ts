import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_MONTHLY_PLAN_ID = process.env.PAYPAL_MONTHLY_PLAN_ID!;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

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
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' }, 
        { status: 400 }
      );
    }

    console.log(`🔄 Creating PayPal subscription for user: ${userId}`);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create subscription
    const subscriptionData = {
      plan_id: PAYPAL_MONTHLY_PLAN_ID,
      custom_id: userId, // Importante: usiamo questo per identificare l'utente nei webhook
      application_context: {
        brand_name: 'StudiusAI',
        locale: 'it-IT',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: `${req.headers.get('origin')}/app?subscription=success`,
        cancel_url: `${req.headers.get('origin')}/app?subscription=cancelled`
      },
      subscriber: {
        email_address: undefined // L'utente inserirà l'email su PayPal
      }
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `sub-${userId}-${Date.now()}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ PayPal subscription creation failed:', error);
      throw new Error('Failed to create PayPal subscription');
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
      approvalUrl: approveLink.href,
      status: subscription.status
    });

  } catch (error) {
    console.error('❌ PayPal subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal subscription' }, 
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