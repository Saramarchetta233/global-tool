import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('❌ Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Note: You'll need to set this webhook secret from Stripe dashboard
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log(`✅ Stripe webhook received: ${event.type}`);
  } catch (err) {
    console.error(`❌ Webhook signature verification failed:`, err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }
      
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`❌ Webhook handler error:`, error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`💰 Processing completed checkout: ${session.id}`);
  
  const userId = session.client_reference_id || session.metadata?.userId;
  const planType = session.metadata?.planType;
  const currency = session.metadata?.currency;
  const version = session.metadata?.version || '1';

  if (!userId) {
    console.error('❌ No userId found in checkout session');
    return;
  }

  console.log(`👤 User: ${userId}, Plan: ${planType}, Currency: ${currency}, Version: ${version}`);

  try {
    // Determine subscription settings based on plan type and version
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
      // Monthly subscription
      subscriptionType = 'monthly';
      subscriptionActive = true;
      lifetimeActive = false;
    }

    // Update user profile in database
    const { data, error } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_type: subscriptionType,
        subscription_active: subscriptionActive,
        lifetime_active: lifetimeActive,
        subscription_renewal_date: planType === 'monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
        ...(creditsToAdd > 0 && { credits: supabaseAdmin!.rpc('increment_credits', { user_id: userId, amount: creditsToAdd }) })
      })
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error(`❌ Database update failed:`, error);
      return;
    }

    // If adding credits, do it separately to ensure it works
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

    console.log(`✅ Payment processed successfully for user ${userId}`);

    // TODO: Send confirmation email
    
  } catch (error) {
    console.error(`❌ Error processing payment:`, error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Processing successful invoice payment: ${invoice.id}`);
  
  // Handle recurring subscription payments
  const customerId = invoice.customer as string;
  
  try {
    // Find user by Stripe customer ID
    const { data: profile, error } = await supabaseAdmin!
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error || !profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`);
      return;
    }

    // Update subscription renewal date
    const nextBillingDate = new Date(invoice.period_end * 1000);
    
    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_renewal_date: nextBillingDate.toISOString(),
        subscription_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    if (updateError) {
      console.error(`❌ Failed to update subscription:`, updateError);
    } else {
      console.log(`✅ Subscription renewed for user ${profile.user_id} until ${nextBillingDate}`);
    }

  } catch (error) {
    console.error(`❌ Error processing invoice:`, error);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log(`📝 Processing subscription update: ${subscription.id}`);
  
  const customerId = subscription.customer as string;
  const isActive = subscription.status === 'active';
  
  try {
    const { data: profile, error } = await supabaseAdmin!
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error || !profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`);
      return;
    }

    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_active: isActive,
        subscription_renewal_date: isActive ? new Date(subscription.current_period_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    if (updateError) {
      console.error(`❌ Failed to update subscription status:`, updateError);
    } else {
      console.log(`✅ Subscription status updated for user ${profile.user_id}: ${isActive ? 'active' : 'inactive'}`);
    }

  } catch (error) {
    console.error(`❌ Error processing subscription update:`, error);
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log(`❌ Processing subscription cancellation: ${subscription.id}`);
  
  const customerId = subscription.customer as string;
  
  try {
    const { data: profile, error } = await supabaseAdmin!
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (error || !profile) {
      console.error(`❌ User not found for Stripe customer: ${customerId}`);
      return;
    }

    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_active: false,
        subscription_renewal_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    if (updateError) {
      console.error(`❌ Failed to cancel subscription:`, updateError);
    } else {
      console.log(`✅ Subscription canceled for user ${profile.user_id}`);
    }

  } catch (error) {
    console.error(`❌ Error processing subscription cancellation:`, error);
  }
}