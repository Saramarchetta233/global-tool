import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getPriceId, getCurrencyFromCountry, type Currency, type PlanType } from '@/lib/stripe-config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { planType, userId, countryCode, version = '1' } = await req.json();
    
    if (!planType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Determine currency from country
    const currency = getCurrencyFromCountry(countryCode || 'DEFAULT');
    console.log(`🌍 Checkout request: ${countryCode} → ${currency}, Plan: ${planType}, Version: ${version}`);

    // Get the appropriate price ID
    let priceId: string;
    
    if (version === '2' && planType === 'onetime') {
      // Version 2: One-time payment with 4000 credits
      priceId = getPriceId(currency, 'onetime');
    } else {
      // Version 1: Free trial → subscription/lifetime
      priceId = getPriceId(currency, planType as PlanType);
    }

    console.log(`💰 Using price ID: ${priceId} for ${currency} ${planType}`);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: planType === 'monthly' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: version === '2' 
        ? `${req.headers.get('origin')}/onetime-register?session_id={CHECKOUT_SESSION_ID}`
        : `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: version === '2' 
        ? `${req.headers.get('origin')}/studius-onetime`
        : `${req.headers.get('origin')}/pricing`,
      client_reference_id: userId,
      metadata: {
        userId,
        planType,
        currency,
        version,
        countryCode: countryCode || 'unknown'
      },
      customer_email: undefined, // Let user enter email
      allow_promotion_codes: true, // Allow discount codes
    });

    console.log(`✅ Stripe session created: ${session.id}`);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
}