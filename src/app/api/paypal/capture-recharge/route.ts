import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Prezzi ricariche per funzione helper
const RECHARGE_PRICES = {
  '1000': 9.99,
  '3000': 14.99,
  '10000': 39.99
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
    const { orderId } = await req.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing order ID' }, 
        { status: 400 }
      );
    }

    console.log(`💰 Capturing PayPal recharge order: ${orderId}`);

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
      console.error('PayPal recharge capture failed:', error);
      throw new Error('PayPal recharge capture failed');
    }

    const captureData = await captureResponse.json();
    console.log(`✅ PayPal recharge payment captured: ${orderId}`);

    // Extract metadata from custom_id
    const customId = captureData.purchase_units[0]?.payments?.captures[0]?.custom_id;
    const [userId, rechargeType, creditsStr, version] = customId?.split('_') || [];

    if (!userId || rechargeType !== 'recharge' || !creditsStr) {
      console.error('❌ Missing or invalid recharge data in PayPal response');
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    const credits = parseInt(creditsStr);
    console.log(`👤 Processing PayPal recharge for user: ${userId}, credits: ${credits}`);

    // Determina il prezzo basato sui crediti
    const packageType = credits.toString() as keyof typeof RECHARGE_PRICES;
    const pricePaid = RECHARGE_PRICES[packageType] || 0;

    try {
      // Aggiungi crediti usando la funzione esistente del database
      const { data: rechargeResult, error: rechargeError } = await supabaseAdmin!
        .rpc('purchase_credit_recharge', {
          p_user_id: userId,
          p_amount: credits,
          p_price_paid: pricePaid,
          p_description: `Ricarica PayPal ${credits} crediti (€${pricePaid})`
        });

      if (rechargeError || !rechargeResult?.success) {
        console.error(`❌ Database recharge failed:`, rechargeError || rechargeResult);
        return NextResponse.json({ 
          error: 'Database recharge failed',
          details: rechargeError?.message || rechargeResult 
        }, { status: 500 });
      }

      console.log(`✅ PayPal recharge completed for user ${userId}: +${credits} credits`);

      return NextResponse.json({ 
        success: true,
        orderId: orderId,
        captureId: captureData.id,
        credits: credits,
        userId: userId,
        price: pricePaid
      });

    } catch (error) {
      console.error(`❌ Error processing PayPal recharge:`, error);
      return NextResponse.json({ 
        error: 'Error processing recharge',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ PayPal recharge capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal recharge payment' }, 
      { status: 500 }
    );
  }
}

// GET per verificare stato ordine
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' }, 
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to get recharge order:', error);
      throw new Error('Failed to get order details');
    }

    const order = await response.json();
    
    return NextResponse.json({
      id: order.id,
      status: order.status,
      custom_id: order.purchase_units?.[0]?.custom_id,
      amount: order.purchase_units?.[0]?.amount,
      create_time: order.create_time
    });

  } catch (error) {
    console.error('❌ Error getting recharge order:', error);
    return NextResponse.json(
      { error: 'Failed to get order details' }, 
      { status: 500 }
    );
  }
}