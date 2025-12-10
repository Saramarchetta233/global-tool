import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/middleware';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_BASE_URL = 'https://api-m.paypal.com'; // Forza LIVE per credenziali Live 

// Prezzi ricariche crediti
const RECHARGE_PRICES = {
  '1000': { credits: 1000, price: '9.99' },
  '3000': { credits: 3000, price: '14.99' },
  '10000': { credits: 10000, price: '39.99' }
} as const;

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
    // Verifica autenticazione
    const user = await verifyAuth(req);
    
    const { userId, packageType } = await req.json();
    
    if (!userId || !packageType) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Verifica che il pacchetto sia valido
    if (!RECHARGE_PRICES[packageType as keyof typeof RECHARGE_PRICES]) {
      return NextResponse.json(
        { error: 'Invalid package type' },
        { status: 400 }
      );
    }

    const packageInfo = RECHARGE_PRICES[packageType as keyof typeof RECHARGE_PRICES];
    
    console.log(`🔋 Creating PayPal recharge order: ${packageInfo.credits} credits for €${packageInfo.price}`);

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Create order payload
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: packageInfo.price,
          },
          description: `StudiusAI - Ricarica ${packageInfo.credits} crediti`,
          custom_id: `${userId}_recharge_${packageInfo.credits}_v1`, // Store metadata
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'StudiusAI',
            user_action: 'PAY_NOW',
            return_url: `${req.headers.get('origin')}/app?recharge=success&method=paypal&package=${packageType}`,
            cancel_url: `${req.headers.get('origin')}/app?recharge=cancelled`,
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
        'PayPal-Request-Id': `recharge-${userId}-${Date.now()}`, // Idempotency
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal recharge order creation failed:', error);
      throw new Error('PayPal recharge order creation failed');
    }

    const order = await orderResponse.json();
    console.log(`✅ PayPal recharge order created: ${order.id}`);

    // Trova il link di approvazione
    const approveLink = order.links?.find(
      (link: any) => link.rel === 'approve'
    );

    if (!approveLink) {
      throw new Error('No approval link found in PayPal response');
    }

    return NextResponse.json({ 
      orderId: order.id,
      approvalUrl: approveLink.href,
      credits: packageInfo.credits,
      price: packageInfo.price
    });

  } catch (error) {
    console.error('❌ PayPal recharge order error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal recharge order' }, 
      { status: 500 }
    );
  }
}

// GET per verificare prezzi disponibili
export async function GET(req: NextRequest) {
  return NextResponse.json({
    packages: RECHARGE_PRICES,
    currency: 'EUR',
    environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX'
  });
}