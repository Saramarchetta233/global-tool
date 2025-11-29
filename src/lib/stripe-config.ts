// Stripe Configuration with Multi-Currency Support
export const STRIPE_PRICES = {
  // EUROPA (EUR)
  EUR: {
    monthly: 'price_1SYUOX73LSjaccs9kSWrOLTN',
    lifetime: 'price_1SYURs73LSjaccs9VenBYU3S', 
    onetime: 'price_1SYUUH73LSjaccs9umavI9L6'
  },
  // USA (USD)
  USD: {
    monthly: 'price_1SYUOs73LSjaccs96ieUxPKn',
    lifetime: 'price_1SYUSA73LSjaccs9wdXOQSuB',
    onetime: 'price_1SYUUk73LSjaccs9DjGjt9GG'
  },
  // UK (GBP)
  GBP: {
    monthly: 'price_1SYUPk73LSjaccs9wypt1sy6',
    lifetime: 'price_1SYUTC73LSjaccs9vyeconQT',
    onetime: 'price_1SYUVL73LSjaccs9dfa7tnej'
  },
  // CANADA (CAD)
  CAD: {
    monthly: 'price_1SYUQF73LSjaccs9eZ2WE8Jh',
    lifetime: 'price_1SYUSc73LSjaccs9AroDT9gL',
    onetime: 'price_1SYUVe73LSjaccs93XsZG33M'
  },
  // AUSTRALIA (AUD)
  AUD: {
    monthly: 'price_1SYURB73LSjaccs97pSUpDUT',
    lifetime: 'price_1SYUTf73LSjaccs97u0XZEPo',
    onetime: 'price_1SYUVs73LSjaccs9dDOnOyha'
  }
} as const;

// Price display configuration
export const PRICE_DISPLAY = {
  EUR: {
    monthly: { amount: 19.99, symbol: '€', name: 'EUR' },
    lifetime: { amount: 69, symbol: '€', name: 'EUR' },
    onetime: { amount: 49, symbol: '€', name: 'EUR' }
  },
  USD: {
    monthly: { amount: 19.99, symbol: '$', name: 'USD' },
    lifetime: { amount: 79, symbol: '$', name: 'USD' },
    onetime: { amount: 59, symbol: '$', name: 'USD' }
  },
  GBP: {
    monthly: { amount: 17.99, symbol: '£', name: 'GBP' },
    lifetime: { amount: 59, symbol: '£', name: 'GBP' },
    onetime: { amount: 39, symbol: '£', name: 'GBP' }
  },
  CAD: {
    monthly: { amount: 29.99, symbol: 'CAD $', name: 'CAD' },
    lifetime: { amount: 99, symbol: 'CAD $', name: 'CAD' },
    onetime: { amount: 69, symbol: 'CAD $', name: 'CAD' }
  },
  AUD: {
    monthly: { amount: 29.99, symbol: 'AUD $', name: 'AUD' },
    lifetime: { amount: 99, symbol: 'AUD $', name: 'AUD' },
    onetime: { amount: 69, symbol: 'AUD $', name: 'AUD' }
  }
} as const;

// Country to currency mapping
export const COUNTRY_TO_CURRENCY = {
  // Europa
  'IT': 'EUR', 'DE': 'EUR', 'FR': 'EUR', 'ES': 'EUR', 'NL': 'EUR', 
  'BE': 'EUR', 'AT': 'EUR', 'PT': 'EUR', 'IE': 'EUR', 'FI': 'EUR',
  'GR': 'EUR', 'LU': 'EUR', 'MT': 'EUR', 'CY': 'EUR', 'SK': 'EUR',
  'SI': 'EUR', 'EE': 'EUR', 'LV': 'EUR', 'LT': 'EUR',
  
  // USA
  'US': 'USD',
  
  // UK
  'GB': 'GBP',
  
  // Canada
  'CA': 'CAD',
  
  // Australia
  'AU': 'AUD',
  
  // Default fallback
  'DEFAULT': 'EUR'
} as const;

export type Currency = keyof typeof STRIPE_PRICES;
export type PlanType = 'monthly' | 'lifetime' | 'onetime';

// Helper function to get currency from country code
export function getCurrencyFromCountry(countryCode: string): Currency {
  return (COUNTRY_TO_CURRENCY[countryCode as keyof typeof COUNTRY_TO_CURRENCY] || COUNTRY_TO_CURRENCY.DEFAULT) as Currency;
}

// Helper function to get price ID
export function getPriceId(currency: Currency, planType: PlanType): string {
  return STRIPE_PRICES[currency][planType];
}

// Helper function to get price display info
export function getPriceDisplay(currency: Currency, planType: PlanType) {
  return PRICE_DISPLAY[currency][planType];
}