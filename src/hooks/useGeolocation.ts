import { useEffect,useState } from 'react';

import { type Language,getLanguageFromCountry } from '@/lib/i18n';
import { type Currency,getCurrencyFromCountry } from '@/lib/stripe-config';

interface GeolocationData {
  country: string;
  countryCode: string;
  currency: Currency;
  language: Language;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationData {
  const [data, setData] = useState<GeolocationData>({
    country: 'Italy',
    countryCode: 'IT',
    currency: 'EUR',
    language: 'it',
    loading: true,
    error: null
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try multiple geolocation services for reliability
        const services = [
          'https://ipapi.co/json/',
          'https://ipinfo.io/json',
          'https://api.ipgeolocation.io/ipgeo?apiKey=free'
        ];

        for (const serviceUrl of services) {
          try {
            const response = await fetch(serviceUrl);
            if (!response.ok) continue;
            
            const result = await response.json();
            
            // Handle different API response formats
            const countryCode = result.country_code || result.country || result.countryCode || 'IT';
            const country = result.country_name || result.country || 'Italy';
            const currency = getCurrencyFromCountry(countryCode);
            const language = getLanguageFromCountry(countryCode);

            console.log(`🌍 Detected location: ${country} (${countryCode}) → ${currency}, ${language}`);

            setData({
              country,
              countryCode,
              currency,
              language,
              loading: false,
              error: null
            });
            return; // Success, exit loop
          } catch (serviceError) {
            console.warn(`Geolocation service failed:`, serviceError);
            continue; // Try next service
          }
        }

        // All services failed, use default
        throw new Error('All geolocation services failed');

      } catch (error) {
        console.error('❌ Geolocation detection failed:', error);
        // Fallback to Italy/EUR/Italian
        setData({
          country: 'Italy',
          countryCode: 'IT', 
          currency: 'EUR',
          language: 'it',
          loading: false,
          error: 'Could not detect location, using default'
        });
      }
    };

    detectLocation();
  }, []);

  return data;
}