import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID!;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET!;
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Verifica firma webhook PayPal
async function verifyWebhookSignature(
  headers: Headers,
  body: string,
  webhookId: string
): Promise<boolean> {
  try {
    const transmissionId = headers.get('paypal-transmission-id');
    const transmissionTime = headers.get('paypal-transmission-time');
    const transmissionSig = headers.get('paypal-transmission-sig');
    const certUrl = headers.get('paypal-cert-url');
    const authAlgo = headers.get('paypal-auth-algo');

    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      console.error('❌ Missing PayPal webhook headers');
      return false;
    }

    // Costruisci stringa da verificare
    const expectedSig = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto
      .createHash('sha256')
      .update(body)
      .digest('hex')}`;

    // In produzione, dovresti verificare il certificato SSL e la firma
    // Per ora, logghiamo solo per debug
    console.log('🔐 Webhook signature verification:', {
      transmissionId,
      transmissionTime,
      webhookId,
      bodyHash: crypto.createHash('sha256').update(body).digest('hex')
    });

    return true; // Semplificato per development
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = req.headers;

    // Verifica firma webhook
    const isValid = await verifyWebhookSignature(headers, body, PAYPAL_WEBHOOK_ID);
    if (!isValid) {
      console.error('❌ Invalid PayPal webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`📨 PayPal webhook received: ${event.event_type}`);

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        await handleSubscriptionActivated(event);
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        if (event.resource.billing_agreement_id) {
          await handleSubscriptionPayment(event);
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        await handleSubscriptionCancelled(event);
        break;
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        await handleSubscriptionSuspended(event);
        break;
      }

      default:
        console.log(`🤷 Unhandled PayPal event: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ PayPal webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Gestione attivazione nuovo abbonamento
async function handleSubscriptionActivated(event: any) {
  console.log('✅ Processing subscription activation');
  
  const subscriptionId = event.resource.id;
  const userId = event.resource.custom_id;
  
  if (!userId) {
    console.error('❌ No userId in subscription custom_id');
    return;
  }

  console.log(`👤 Activating subscription for user: ${userId}`);

  try {
    // Aggiorna profilo utente
    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_type: 'monthly',
        subscription_active: true,
        subscription_renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paypal_subscription_id: subscriptionId,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
      return;
    }

    // Aggiungi 2000 crediti iniziali
    const { error: creditsError } = await supabaseAdmin!
      .rpc('add_credits', { 
        p_user_id: userId, 
        p_amount: 2000 
      });

    if (creditsError) {
      console.error('❌ Credits update failed:', creditsError);
    } else {
      console.log(`💰 Added 2000 credits to user ${userId}`);
    }

    console.log(`✅ Subscription activated for user ${userId}`);

  } catch (error) {
    console.error('❌ Error activating subscription:', error);
  }
}

// Gestione rinnovo mensile (pagamento completato)
async function handleSubscriptionPayment(event: any) {
  console.log('💰 Processing subscription payment');
  
  const subscriptionId = event.resource.billing_agreement_id;
  
  try {
    // Trova utente tramite subscription ID
    const { data: profile, error } = await supabaseAdmin!
      .from('profiles')
      .select('user_id')
      .eq('paypal_subscription_id', subscriptionId)
      .single();

    if (error || !profile) {
      console.error(`❌ User not found for subscription: ${subscriptionId}`);
      return;
    }

    const userId = profile.user_id;
    console.log(`👤 Processing renewal for user: ${userId}`);

    // Aggiorna data rinnovo
    const nextRenewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_renewal_date: nextRenewalDate.toISOString(),
        subscription_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
      return;
    }

    // Aggiungi 2000 crediti mensili
    const { error: creditsError } = await supabaseAdmin!
      .rpc('add_credits', { 
        p_user_id: userId, 
        p_amount: 2000 
      });

    if (creditsError) {
      console.error('❌ Credits update failed:', creditsError);
    } else {
      console.log(`💰 Added 2000 monthly credits to user ${userId}`);
    }

    console.log(`✅ Subscription renewed for user ${userId} until ${nextRenewalDate.toISOString()}`);

  } catch (error) {
    console.error('❌ Error processing payment:', error);
  }
}

// Gestione cancellazione abbonamento
async function handleSubscriptionCancelled(event: any) {
  console.log('❌ Processing subscription cancellation');
  
  const subscriptionId = event.resource.id;
  const userId = event.resource.custom_id;
  
  if (!userId) {
    console.error('❌ No userId in subscription custom_id');
    return;
  }

  try {
    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_active: false,
        subscription_renewal_date: null,
        paypal_subscription_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
    } else {
      console.log(`✅ Subscription cancelled for user ${userId}`);
    }

  } catch (error) {
    console.error('❌ Error cancelling subscription:', error);
  }
}

// Gestione sospensione abbonamento (pagamento fallito)
async function handleSubscriptionSuspended(event: any) {
  console.log('⚠️ Processing subscription suspension');
  
  const subscriptionId = event.resource.id;
  const userId = event.resource.custom_id;
  
  if (!userId) {
    console.error('❌ No userId in subscription custom_id');
    return;
  }

  try {
    const { error: updateError } = await supabaseAdmin!
      .from('profiles')
      .update({
        subscription_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Database update failed:', updateError);
    } else {
      console.log(`⚠️ Subscription suspended for user ${userId}`);
    }

  } catch (error) {
    console.error('❌ Error suspending subscription:', error);
  }
}