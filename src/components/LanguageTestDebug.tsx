'use client';

import { useState } from 'react';
import { t, type Language } from '@/lib/i18n';
import { getPriceDisplay, type Currency } from '@/lib/stripe-config';

// Component per testare le traduzioni e valute
export function LanguageTestDebug() {
  const [language, setLanguage] = useState<Language>('it');
  const [currency, setCurrency] = useState<Currency>('EUR');

  const countries = [
    { name: '🇮🇹 Italy', lang: 'it' as Language, curr: 'EUR' as Currency },
    { name: '🇺🇸 USA', lang: 'en' as Language, curr: 'USD' as Currency },
    { name: '🇪🇸 Spain', lang: 'es' as Language, curr: 'EUR' as Currency },
    { name: '🇫🇷 France', lang: 'fr' as Language, curr: 'EUR' as Currency },
    { name: '🇩🇪 Germany', lang: 'de' as Language, curr: 'EUR' as Currency },
    { name: '🇵🇹 Portugal', lang: 'pt' as Language, curr: 'EUR' as Currency },
    { name: '🇬🇧 UK', lang: 'en' as Language, curr: 'GBP' as Currency },
    { name: '🇨🇦 Canada', lang: 'en' as Language, curr: 'CAD' as Currency },
    { name: '🇦🇺 Australia', lang: 'en' as Language, curr: 'AUD' as Currency },
  ];

  const monthlyPrice = getPriceDisplay(currency, 'monthly');
  const lifetimePrice = getPriceDisplay(currency, 'lifetime');
  const onetimePrice = getPriceDisplay(currency, 'onetime');

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-sm mb-3">🧪 Language/Currency Tester</h3>
      
      <div className="mb-3">
        <label className="text-xs font-semibold">Select Country:</label>
        <select 
          className="w-full border rounded px-2 py-1 text-sm mt-1"
          onChange={(e) => {
            const selected = countries[parseInt(e.target.value)];
            setLanguage(selected.lang);
            setCurrency(selected.curr);
          }}
        >
          {countries.map((country, i) => (
            <option key={i} value={i}>{country.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 text-sm">
        <div className="bg-gray-50 p-2 rounded">
          <div><strong>Language:</strong> {language}</div>
          <div><strong>Currency:</strong> {currency}</div>
        </div>

        <div className="space-y-1">
          <div><strong>Title:</strong></div>
          <div className="text-xs bg-blue-50 p-1 rounded">{t('title', language)}</div>
        </div>

        <div className="space-y-1">
          <div><strong>Pricing:</strong></div>
          <div className="text-xs bg-green-50 p-1 rounded">
            • {t('pricing.monthly', language)}: {monthlyPrice.symbol}{monthlyPrice.amount}<br/>
            • {t('pricing.lifetime', language)}: {lifetimePrice.symbol}{lifetimePrice.amount}<br/>
            • {t('pricing.onetime', language)}: {onetimePrice.symbol}{onetimePrice.amount}
          </div>
        </div>

        <div className="space-y-1">
          <div><strong>Buttons:</strong></div>
          <div className="text-xs bg-yellow-50 p-1 rounded">
            • {t('pricing.chooseMonthly', language)}<br/>
            • {t('pricing.chooseLifetime', language)}<br/>
            • {t('pricing.buyNow', language)}
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          // Hide this component
          const elem = document.getElementById('language-test-debug');
          if (elem) elem.style.display = 'none';
        }}
        className="mt-3 text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded w-full"
      >
        Hide Tester
      </button>
    </div>
  );
}