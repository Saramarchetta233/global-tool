import { NextRequest, NextResponse } from 'next/server';

import { type PlanType,getCurrencyFromCountry, getPriceDisplay } from '@/lib/stripe-config';

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
    // Verifica variabili ambiente critiche
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error('❌ Missing PayPal credentials:', {
        client_id: !!PAYPAL_CLIENT_ID,
        secret: !!PAYPAL_SECRET,
        env: process.env.NODE_ENV
      });
      return NextResponse.json(
        { error: 'PayPal configuration error' }, 
        { status: 500 }
      );
    }

    const { planType, userId, countryCode, version = '1' } = await req.json();
    
    if (!planType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Get currency and price
    const currency = getCurrencyFromCountry(countryCode || 'DEFAULT');
    const priceInfo = getPriceDisplay(currency, planType as PlanType);
    
    console.log(`💰 PayPal order: ${planType} for ${priceInfo.symbol}${priceInfo.amount} ${currency}`);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create order payload
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: priceInfo.amount.toString(),
          },
          description: `StudiusAI ${planType === 'monthly' ? 'Monthly Plan' : planType === 'lifetime' ? 'Lifetime Access' : 'Credits Package'}`,
          custom_id: `${userId}_${planType}_${version}`, // Store metadata
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'StudiusAI',
            user_action: 'PAY_NOW',
            return_url: `${req.headers.get('origin')}/success?payment=paypal`,
            cancel_url: `${req.headers.get('origin')}/pricing`,
          },
        },
      },
    };

    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${userId}-${Date.now()}`, // Idempotency
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal order creation failed:', error);
      throw new Error('PayPal order creation failed');
    }

    const order = await orderResponse.json();
    console.log(`✅ PayPal order created: ${order.id}`);

    return NextResponse.json({ 
      orderId: order.id,
      links: order.links 
    });

  } catch (error) {
    console.error('❌ PayPal order creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create PayPal order',
        details: error instanceof Error ? error.message : 'Unknown error',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}