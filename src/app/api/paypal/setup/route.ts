import { NextRequest, NextResponse } from 'next/server';

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
    console.log('🚀 Inizializzazione setup PayPal...');
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // STEP 1: Crea Prodotto PayPal
    console.log('📦 Creazione prodotto PayPal...');
    const productData = {
      name: "StudiusAI Abbonamento",
      description: "Accesso completo a StudiusAI",
      type: "SERVICE",
      category: "SOFTWARE",
      id: `STUDIUSAI-${Date.now()}` // ID univoco
    };

    const productResponse = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `product-${Date.now()}`,
      },
      body: JSON.stringify(productData),
    });

    if (!productResponse.ok) {
      const error = await productResponse.text();
      console.error('❌ Errore creazione prodotto:', error);
      throw new Error('Errore creazione prodotto PayPal');
    }

    const product = await productResponse.json();
    console.log(`✅ Prodotto creato con ID: ${product.id}`);

    // STEP 2: Crea Piano Mensile
    console.log('📋 Creazione piano mensile...');
    const planData = {
      product_id: product.id,
      name: "StudiusAI Mensile",
      description: "Abbonamento mensile a StudiusAI - 2000 crediti/mese",
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: "MONTH",
            interval_count: 1
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = infinito
          pricing_scheme: {
            fixed_price: {
              value: "19.99",
              currency_code: "EUR"
            }
          }
        }
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "EUR"
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3
      },
      taxes: {
        percentage: "0",
        inclusive: false
      }
    };

    const planResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `plan-${Date.now()}`,
      },
      body: JSON.stringify(planData),
    });

    if (!planResponse.ok) {
      const error = await planResponse.text();
      console.error('❌ Errore creazione piano:', error);
      throw new Error('Errore creazione piano PayPal');
    }

    const plan = await planResponse.json();
    console.log(`✅ Piano mensile creato con ID: ${plan.id}`);

    // Ritorna gli ID creati
    const result = {
      success: true,
      product: {
        id: product.id,
        name: product.name
      },
      plan: {
        id: plan.id,
        name: plan.name,
        price: "€19.99/mese"
      },
      instructions: "Salva questi ID nel tuo .env.local:",
      env_vars: {
        PAYPAL_PRODUCT_ID: product.id,
        PAYPAL_MONTHLY_PLAN_ID: plan.id
      }
    };

    console.log('✅ Setup PayPal completato:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Errore setup PayPal:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante setup PayPal',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      }, 
      { status: 500 }
    );
  }
}

// GET per verificare configurazione esistente
export async function GET(req: NextRequest) {
  try {
    const accessToken = await getPayPalAccessToken();
    
    // Lista prodotti esistenti
    const productsResponse = await fetch(`${PAYPAL_BASE_URL}/v1/catalogs/products?page_size=20&page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const products = await productsResponse.json();
    
    // Lista piani esistenti
    const plansResponse = await fetch(`${PAYPAL_BASE_URL}/v1/billing/plans?page_size=20&page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const plans = await plansResponse.json();

    return NextResponse.json({
      environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'SANDBOX',
      products: products.products || [],
      plans: plans.plans || [],
    });

  } catch (error) {
    console.error('❌ Errore verifica PayPal:', error);
    return NextResponse.json(
      { error: 'Errore durante verifica configurazione PayPal' }, 
      { status: 500 }
    );
  }
}