import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { verifyAuth } from '@/lib/middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Price IDs per le ricariche crediti
const RECHARGE_PRICE_IDS = {
  '1000': 'price_1SbI8D73LSjaccs9l0eqRrvb',   // €9,99
  '3000': 'price_1SbI9D73LSjaccs9KKhjKrHY',   // €14,99
  '10000': 'price_1SbI9h73LSjaccs9OjyXJcVP',  // €39,99
} as const;

const RECHARGE_CREDITS = {
  '1000': 1000,
  '3000': 3000,
  '10000': 10000,
} as const;

export async function POST(req: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(req);
    
    const { packageType, userId } = await req.json();
    
    if (!packageType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Verifica che il pacchetto sia valido
    if (!RECHARGE_PRICE_IDS[packageType as keyof typeof RECHARGE_PRICE_IDS]) {
      return NextResponse.json(
        { error: 'Invalid recharge package' },
        { status: 400 }
      );
    }

    const priceId = RECHARGE_PRICE_IDS[packageType as keyof typeof RECHARGE_PRICE_IDS];
    const credits = RECHARGE_CREDITS[packageType as keyof typeof RECHARGE_CREDITS];

    console.log(`🔋 Creating recharge checkout: ${packageType} credits, Price ID: ${priceId}`);

    // Create Stripe checkout session per ricarica crediti
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment, non subscription
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/app?recharge=success`,
      cancel_url: `${req.headers.get('origin')}/app?recharge=cancelled`,
      client_reference_id: userId,
      metadata: {
        type: 'recharge',
        userId: userId,
        packageType: packageType,
        credits: credits.toString(),
      },
      customer_email: undefined, // Let user enter email
      locale: 'it', // Italiano
    });

    console.log(`✅ Recharge checkout session created: ${session.id}`);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Recharge checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create recharge checkout session' }, 
      { status: 500 }
    );
  }
}