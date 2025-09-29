'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  Clock,
  Shield,
  Truck,
  Heart,
  Users,
  AlertCircle,
  Package,
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';

// Declare global tracking functions
declare global {
  interface Window {
    fbq: any;
    gtag: any;
    dataLayer: any[];
  }
}

// Tracking utilities
const trackingUtils = {
  // Initialize Facebook Pixel
  initFacebookPixel: () => {
    if (typeof window !== 'undefined') {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', '763716602087140', {}, {
        test_event_code: 'TEST20028'
      });
      window.fbq('track', 'PageView');
    }
  },

  // Initialize Google Ads
  initGoogleAds: () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', 'AW-17553726122');

      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17553726122';
      document.head.appendChild(script);
    }
  },

  // Initialize Google Analytics
  initGoogleAnalytics: () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', 'GA_MEASUREMENT_ID'); // Replace with your GA4 measurement ID

      // Load gtag script for Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID'; // Replace with your GA4 measurement ID
      document.head.appendChild(script);
    }
  },

  // Get traffic source for N8N
  getTrafficSource: (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const fbclid = urlParams.get('fbclid');
    const gclid = urlParams.get('gclid');

    if (gclid || utmSource === 'google') return 'google_ads';
    if (fbclid || utmSource === 'facebook') return 'facebook';
    return utmSource || 'direct';
  },

  // Track Facebook events - CLIENT SIDE + CAPI via N8N
  trackFacebookEvent: async (eventName: string, eventData: any = {}, userFormData: any = null): Promise<void> => {
    // Generate deterministic ID that will be the same on server and client
    const clientEventId = typeof window !== 'undefined' ?
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` :
      `static-${eventName.toLowerCase()}-${Math.floor(Math.random() * 1000)}`;

    // 1. CLIENT-SIDE TRACKING (Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', eventName, eventData, {
          eventID: clientEventId
        });
        console.log(`✅ Facebook ${eventName} tracked (client-side)`);
      } catch (error) {
        console.error(`❌ Facebook ${eventName} client tracking error:`, error);
      }
    }

    // Track in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('event', eventName.toLowerCase(), {
          event_category: 'Facebook',
          event_label: eventName,
          value: eventData.value || 0
        });
      } catch (error) {
        console.error(`❌ Google Analytics ${eventName} tracking error:`, error);
      }
    }

    // 2. SERVER-SIDE TRACKING (CAPI) via N8N - Always track major events
    const majorEvents = ['InitiateCheckout', 'Purchase', 'Lead', 'CompleteRegistration'];
    if (majorEvents.includes(eventName) || userFormData) {
      try {
        console.log(`📡 Sending ${eventName} to N8N webhook...`);

        // Hash dei dati sensibili se abbiamo form data i
        let hashedPhone = null;
        let hashedFirstName = null;
        let hashedLastName = null;

        if (userFormData) {
          hashedPhone = userFormData.telefon ? await trackingUtils.hashData(userFormData.telefon.replace(/\D/g, '')) : null;
          hashedFirstName = userFormData.imie ? await trackingUtils.hashData(userFormData.imie.split(' ')[0]) : null;
          hashedLastName = userFormData.imie && userFormData.imie.split(' ').length > 1 ? await trackingUtils.hashData(userFormData.imie.split(' ').slice(1).join(' ')) : null;
        }

        // Prepara i dati per N8N
        // Calcola timestamp corretto (non più di 7 giorni fa, non nel futuro)
        const now = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;
        const maxPastTime = now - (7 * 24 * 60 * 60); // 7 giorni fa
        const eventTimestamp = Math.max(maxPastTime, now - 10); // Massimo 10 secondi fa

        const capiData = {
          event_name: eventName,
          event_id: clientEventId,
          timestamp: eventTimestamp, // <-- TIMESTAMP CORRETTO
          event_source_url: window.location.href,

          // AGGIUNGI ANCHE QUESTO per maggiore precisione
          action_source: 'website',
          event_time: eventTimestamp, // Doppio controllo

          // Token e Pixel ID dinamici
          token: 'EAAPYtpMdWREBPJH0W7LzwU2MuZA61clyQOfYg5C6E0vo9E5QYgJWl2n5XtO8Ur93YTZANcWYz3qsAbDOadffn10KbQZCOwkRS6DpM8bRjwX25NBn5d1lvVNQhFOCGY9eZARrjyCbJs1OtFk2BOc4ZBbaUjeD7dvkejyxZAZAEQdeb8AQzUKdAQitdhU0jVGywZDZD',
          pixel_id: '763716602087140', // Pixel ID dinamico

          // Dati hashati del form (se disponibili)
          telefono_hash: hashedPhone,
          nome_hash: hashedFirstName,
          cognome_hash: hashedLastName,
          indirizzo: userFormData?.adres || null,

          // Traffic source for analytics
          traffic_source: trackingUtils.getTrafficSource(),

          // Dati tecnici
          user_agent: navigator.userAgent,
          fbp: trackingUtils.getFbBrowserId(),
          fbc: trackingUtils.getFbClickId(),

          // Parametri UTM
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          utm_content: new URLSearchParams(window.location.search).get('utm_content'),
          utm_term: new URLSearchParams(window.location.search).get('utm_term'),

          // Altri dati utili
          page_title: document.title,
          referrer: document.referrer,
          language: navigator.language,
          screen_resolution: `${screen.width}x${screen.height}`,

          // Dati custom per questo prodotto - DINAMICI
          content_name: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca',
          content_category: 'Motorcycle & Safety Gear',
          content_ids: 'roadshield-4seasons-motorcycle-jacket',
          content_type: 'product',
          value: eventData.value || 299.00,
          currency: 'PLN', // Currency dinamica
          quantity: eventData.num_items || 1
        };

        console.log(`📤 Sending to webhook:`, capiData);

        // Invia a N8N webhook
        const response = await fetch('https://primary-production-625c.up.railway.app/webhook/CAPI-Meta', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(capiData)
        });

        const responseText = await response.text();
        console.log(`📥 Webhook response:`, response.status, responseText);

        if (response.ok) {
          console.log(`✅ Facebook ${eventName} CAPI tracked via N8N`);
        } else {
          console.error(`❌ Facebook ${eventName} CAPI error:`, response.status, responseText);
        }
      } catch (error) {
        console.error(`❌ Facebook ${eventName} CAPI tracking error:`, error);
      }
    } else {
      console.log(`ℹ️ ${eventName} not configured for CAPI tracking`);
    }
  },

  // Track Google Ads events
  trackGoogleEvent: (eventName: string, eventData: any = {}): void => {
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        if (eventName !== 'Purchase') {
          window.gtag('event', eventName, eventData);
          console.log(`✅ Google Ads ${eventName} tracked`);
        } else {
          console.log(`ℹ️ Google Ads Purchase skipped - will be tracked in Thank You page`);
        }
      } catch (error) {
        console.error(`❌ Google Ads ${eventName} tracking error:`, error);
      }
    }
  },

  // Utility functions
  getClientIP: async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '';
    }
  },

  getFbClickId: (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    if (fbclid) {
      // Formato corretto per fbc secondo Meta: fb.1.timestamp.fbclid
      // Il timestamp deve essere in SECONDI, non millisecondi
      const timestamp = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;
      return `fb.1.${timestamp}.${fbclid}`;
    }

    // Se non c'è fbclid, prova a recuperare da cookie esistenti
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbc') {
        return decodeURIComponent(value);
      }
    }

    return '';
  },

  // AGGIUNGI QUESTA NUOVA FUNZIONE SUBITO DOPO getFbClickId
  setFbClickId: (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    if (fbclid) {
      const timestamp = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;
      const fbcValue = `fb.1.${timestamp}.${fbclid}`;

      // Salva nei cookie per 90 giorni (standard Facebook)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90);

      document.cookie = `_fbc=${encodeURIComponent(fbcValue)}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}`;

      console.log('✅ Facebook Click ID salvato:', fbcValue);
    }
  },

  getFbBrowserId: (): string => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbp') return value;
    }
    return '';
  },

  // Proper SHA-256 hashing for PII data (Facebook requirement)
  hashData: async (data: string): Promise<string> => {
    if (!data || typeof data !== 'string') return '';

    try {
      // Normalize data (lowercase, trim spaces)
      const normalizedData = data.toLowerCase().trim();

      // Use Web Crypto API for SHA-256 hashing
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(normalizedData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      return hashHex;
    } catch (error) {
      console.error('Error hashing data:', error);
      return '';
    }
  }
};


// Star Rating Component
const StarRating = ({ rating, size = 'w-4 h-4' }: { rating: number; size?: string }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};


// FAQ Component
const FAQ = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
};

// Stock Indicator
const StockIndicator = () => {
  const [stock, setStock] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock(prev => {
        const change = Math.random() > 0.7 ? -1 : 0;
        return Math.max(9, prev + change);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-3 rounded-lg text-center font-bold">
      <div className="flex items-center justify-center space-x-2">
        <AlertCircle className="w-5 h-5" />
        <span>⚡ Tylko {stock} sztuk pozostało w magazynie!</span>
      </div>
    </div>
  );
};

// Results Section with Progress Bars
const ResultsSection = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="/images/Jacket/5.jpg"
              alt="Zadowalające rezultaty"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Przekształć Swoją Jazdę z Wyjątkowym Bezpieczeństwem
            </h2>

            <div className="space-y-8">
              {/* Progress bar 1 */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#16a34a"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${97 * 3.14159} ${100 * 3.14159}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">97%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Stwierdziło znacznie lepsze bezpieczeństwo dzięki ochraniacom CE!</p>
              </div>

              {/* Progress bar 2 */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#16a34a"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${95 * 3.14159} ${100 * 3.14159}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">95%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Zauważyło komfort w każdych warunkach pogodowych!</p>
              </div>

              {/* Progress bar 3 */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#16a34a"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${98 * 3.14159} ${100 * 3.14159}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">98%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Doceniło jakość materiałów i trwałość kurtki!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delivery Tracking Component
const DeliveryTracking = () => {
  const [deliveryDates, setDeliveryDates] = useState({
    orderDate: 'pon, 16 wrz',
    shipDate: 'wt, 17 wrz',
    deliveryStart: 'cz, 19 wrz',
    deliveryEnd: 'pt, 20 wrz',
    deliveryRange: 'cz, 19 wrz a pt, 20 wrz'
  });

  useEffect(() => {
    const formatData = (data: Date): string => {
      const giorni = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
      const mesi = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
      const giornoSettimana = giorni[data.getDay()];
      const giorno = String(data.getDate()).padStart(2, '0');
      const mese = mesi[data.getMonth()];
      return `${giornoSettimana}, ${giorno} ${mese}`;
    };

    const aggiungiGiorniLavorativi = (data: Date, giorni: number): Date => {
      let count = 0;
      const nuovaData = new Date(data);
      while (count < giorni) {
        nuovaData.setDate(nuovaData.getDate() + 1);
        const giorno = nuovaData.getDay();
        if (giorno !== 0 && giorno !== 6) count++; // 0 = niedziela, 6 = sobota
      }
      return nuovaData;
    };

    // Calculate dates only after component mounts
    const oggi = new Date();
    const dataOrdine = oggi;
    const dataSpedizione = aggiungiGiorniLavorativi(dataOrdine, 1);
    const dataConsegnaInizio = aggiungiGiorniLavorativi(dataSpedizione, 2);
    const dataConsegnaFine = aggiungiGiorniLavorativi(dataSpedizione, 3);

    setDeliveryDates({
      orderDate: formatData(dataOrdine),
      shipDate: formatData(dataSpedizione),
      deliveryStart: formatData(dataConsegnaInizio),
      deliveryEnd: formatData(dataConsegnaFine),
      deliveryRange: `${formatData(dataConsegnaInizio)} a ${formatData(dataConsegnaFine)}`
    });
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-center text-gray-700 mb-4">
        Zamów <strong>TERAZ</strong> i otrzymasz swoją paczkę między <strong>{deliveryDates.deliveryRange}</strong>
      </p>
      <div className="flex justify-between items-center text-sm">
        <div className="text-center">
          <div className="text-2xl mb-1">📦</div>
          <div className="font-medium">Zamówione</div>
          <div className="text-gray-500">{deliveryDates.orderDate}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🚚</div>
          <div className="font-medium">Wysłane</div>
          <div className="text-gray-500">{deliveryDates.shipDate}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">📍</div>
          <div className="font-medium">Dostarczone</div>
          <div className="text-gray-500">{deliveryDates.deliveryStart} - {deliveryDates.deliveryEnd}</div>
        </div>
      </div>
    </div>
  );
};

// Footer Component - LINK APRONO IN NUOVA SCHEDA
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Newheras</h3>
            <p className="text-gray-300 text-sm">
              Najwyższej jakości produkty dla bezpiecznej i komfortowej jazdy motocyklowej.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Obsługa Klienta</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white">Kontakt</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="/returns" target="_blank" rel="noopener noreferrer" className="hover:text-white">Zwroty</a></li>
              <li><a href="#" className="hover:text-white">Gwarancja</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informacje Prawne</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white">Regulamin</a></li>
              <li><a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white">Polityka Prywatności</a></li>
              <li><a href="/cookies" target="_blank" rel="noopener noreferrer" className="hover:text-white">Polityka Cookies</a></li>
              <li><a href="/gdpr" target="_blank" rel="noopener noreferrer" className="hover:text-white">Prawa Konsumenta</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Firma</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/about" target="_blank" rel="noopener noreferrer" className="hover:text-white">O Nas</a></li>
              <li><a href="#" className="hover:text-white">Kariera</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Partnerzy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2025 Newheras. Wszystkie prawa zastrzeżone.
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Polityka Prywatności</a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Regulamin</a>
              <a href="/cookies" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Cookies</a>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 max-w-4xl mx-auto">
            <p className="mb-2">
              <strong>Informacje prawne:</strong> Wszystkie ceny zawierają podatek VAT. Prawo do odstąpienia od umowy w ciągu 14 dni zgodnie z prawem konsumenckim.
              Gwarancja 24 miesiące zgodnie z Kodeksem Cywilnym. Sprzedawca: Newheras Sp. z o.o.
            </p>
            <p>
              <strong>Ochrona danych:</strong> Przetwarzamy Twoje dane osobowe zgodnie z RODO. Szczegóły w Polityce Prywatności.
              Używamy plików cookies w celach analitycznych i marketingowych. Więcej informacji w Polityce Cookies.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Componente Carosello per Kurtka Motocyklowa
const ProductCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Le immagini del prodotto RoadShield 4-Seasons Jacket
  const images = [
    "/images/Jacket/1.jpg",
    "/images/Jacket/2.jpg",
    "/images/Jacket/3.jpg",
    "/images/Jacket/4.gif",
    "/images/Jacket/5.jpg"
  ];

  // Auto-slide ogni 8 secondi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [images.length]);

  // Gestione touch per mobile
  const handleTouchStart = (e: any) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: any) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };

  const nextImage = () => {
    setCurrentImage((prev: any) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev: any) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: any) => {
    setCurrentImage(index);
  };

  return (
    <div className="relative">
      {/* Container principale */}
      <div
        className="relative w-full h-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Badge sconto */}
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
          -60% ZNIŻKI
        </div>

        {/* Immagini */}
        <div className="relative min-h-[300px] max-h-[600px]">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`RoadShield™ 4-Seasons – Kurtka Motocyklowa CE - Vista ${index + 1}`}
              className={`w-full h-auto max-h-[600px] object-contain mx-auto transition-opacity duration-500 rounded-lg shadow-lg ${index === currentImage ? 'opacity-100' : 'opacity-0'
                } ${index !== currentImage ? 'absolute top-0 left-0' : ''}`}
            />
          ))}
        </div>

        {/* Frecce desktop */}
        <button
          onClick={prevImage}
          className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextImage}
          className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Dots indicatori */}
      <div className="flex justify-center space-x-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`p-2 transition-all duration-300`}
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImage
                ? 'bg-green-600 w-8'
                : 'bg-gray-300 hover:bg-gray-400'
                }`}
            />
          </button>
        ))}
      </div>

      {/* Thumbnails desktop */}
      <div className="hidden md:flex justify-center space-x-2 mt-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImage
              ? 'border-green-600 opacity-100'
              : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Main Component
export default function JacketLanding() {
  const [mounted, setMounted] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);

  // Global state for model and size (hoisted outside form)
  const [model, setModel] = useState<'Mężczyzna' | 'Kobieta'>('Mężczyzna');
  const [size, setSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL'>('S');

  const [formData, setFormData] = useState({
    imie: '',
    telefon: '',
    adres: '',
    modello: '',
    taglia: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    imie: '',
    telefon: '',
    adres: '',
    modello: '',
    taglia: ''
  });

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize tracking on component mount
  useEffect(() => {
    // AGGIUNGI QUESTA LINEA QUI
    trackingUtils.setFbClickId();
    // Initialize tracking systems
    trackingUtils.initFacebookPixel();
    trackingUtils.initGoogleAds();
    trackingUtils.initGoogleAnalytics();

    // Track PageView for all platforms
    trackingUtils.trackFacebookEvent('PageView');
    trackingUtils.trackGoogleEvent('page_view', {
      page_title: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE - Strona Główna',
      page_location: window.location.href
    });

    // Load fingerprinting script
    const script = document.createElement('script');
    script.src = 'https://offers.supertrendaffiliateprogram.com/forms/tmfp/';
    script.crossOrigin = 'anonymous';
    script.defer = true;
    document.head.appendChild(script);

    // Scroll listener per sticky button
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollY / (documentHeight - windowHeight)) * 100;

      // Mostra il pulsante sticky dopo aver scrollato il 20%
      setShowStickyButton(scrollPercentage > 15);
    };

    window.addEventListener('scroll', handleScroll);

    // Bounce animation ogni 8 secondi per il pulsante sticky
    const bounceInterval = setInterval(() => {
      if (showStickyButton) {
        setBounceAnimation(true);
        setTimeout(() => setBounceAnimation(false), 1000);
      }
    }, 8000);

    return () => {
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Script might already be removed
      }
      window.removeEventListener('scroll', handleScroll);
      clearInterval(bounceInterval);
    };
  }, [showStickyButton]);


  const validateVariantSelection = () => {
    if (!model || !size) {
      alert('Wybierz model i rozmiar.');
      return false;
    }
    return true;
  };

  // Size guide tab switching function
  const showSizeTab = (key: string) => {
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.sizeguide-tabs button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Remove active class from all content
    const contents = document.querySelectorAll('.sizeguide-content');
    contents.forEach(tab => tab.classList.remove('active'));

    // Add active class to target button and content
    const targetButton = document.querySelector(`.sizeguide-tabs button[data-target="${key}"]`);
    const targetContent = document.getElementById(`tab-${key}`);

    if (targetButton) targetButton.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
  };

  // Expose function to window for script access
  React.useEffect(() => {
    (window as any).showSizeTab = showSizeTab;
    return () => {
      delete (window as any).showSizeTab;
    };
  }, []);

  const handleOrderClick = () => {
    console.log('🎯 Order button clicked - tracking InitiateCheckout');

    // Track InitiateCheckout event (inizio processo acquisto)
    trackingUtils.trackFacebookEvent('InitiateCheckout', {
      content_type: 'product',
      content_ids: ['roadshield-4seasons-motorcycle-jacket'],
      content_name: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca',
      value: 299.00,
      currency: 'PLN',
      num_items: 1
    });

    trackingUtils.trackGoogleEvent('view_item', {
      currency: 'PLN',
      value: 299.00,
      items: [{
        item_id: 'roadshield-4seasons-motorcycle-jacket',
        item_name: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca',
        category: 'Motorcycle & Safety Gear',
        quantity: 1,
        price: 299.00
      }]
    });

    // Sync global state with form data when opening popup
    setFormData(prev => ({
      ...prev,
      modello: model,
      taglia: size
    }));

    setShowOrderPopup(true);
    setFormErrors({ imie: '', telefon: '', adres: '', modello: '', taglia: '' });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = { imie: '', telefon: '', adres: '', modello: '', taglia: '' };
    let isValid = true;

    if (!formData.imie.trim()) {
      errors.imie = 'Imię i nazwisko jest wymagane';
      isValid = false;
    } else if (formData.imie.trim().length < 2) {
      errors.imie = 'Imię musi zawierać co najmniej 2 znaki';
      isValid = false;
    }

    if (!formData.telefon.trim()) {
      errors.telefon = 'Numer telefonu jest wymagany';
      isValid = false;
    } else {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(formData.telefon.trim())) {
        errors.telefon = 'Wprowadź prawidłowy numer telefonu';
        isValid = false;
      }
    }

    if (!formData.adres.trim()) {
      errors.adres = 'Adres jest wymagany';
      isValid = false;
    } else if (formData.adres.trim().length < 10) {
      errors.adres = 'Adres musi być bardziej szczegółowy (ulica, numer, miasto, kod pocztowy)';
      isValid = false;
    }

    if (!formData.modello.trim()) {
      errors.modello = 'Wybierz model kurtki';
      isValid = false;
    }

    if (!formData.taglia.trim()) {
      errors.taglia = 'Wybierz rozmiar';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleOrderSubmit = async () => {
    if (isSubmitting) return;

    if (!validateVariantSelection() || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    console.log('🎯 Form submitted with form data:', formData);

    // Send notification to N8N for Telegram (without Facebook tracking)
    try {
      console.log('📡 Sending Purchase notification to N8N webhook...');

      const hashedPhone = formData.telefon ? await trackingUtils.hashData(formData.telefon.replace(/\D/g, '')) : null;
      const hashedFirstName = formData.imie ? await trackingUtils.hashData(formData.imie.split(' ')[0]) : null;
      const hashedLastName = formData.imie && formData.imie.split(' ').length > 1 ? await trackingUtils.hashData(formData.imie.split(' ').slice(1).join(' ')) : null;

      const now = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;
      const eventTimestamp = now - 10;

      const notificationData = {
        event_name: 'Purchase',
        event_id: (() => {
          if (typeof window === 'undefined') return 'static-purchase-ssr';
          const uniqueEventId = `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('fbEventId', uniqueEventId);
          return uniqueEventId;
        })(),
        timestamp: eventTimestamp,
        event_source_url: window.location.href,
        action_source: 'website',
        event_time: eventTimestamp,

        token: 'EAAPYtpMdWREBPJH0W7LzwU2MuZA61clyQOfYg5C6E0vo9E5QYgJWl2n5XtO8Ur93YTZANcWYz3qsAbDOadffn10KbQZCOwkRS6DpM8bRjwX25NBn5d1lvVNQhFOCGY9eZARrjyCbJs1OtFk2BOc4ZBbaUjeD7dvkejyxZAZAEQdeb8AQzUKdAQitdhU0jVGywZDZD',
        pixel_id: '763716602087140',

        telefono_hash: hashedPhone,
        nome_hash: hashedFirstName,
        cognome_hash: hashedLastName,
        indirizzo: formData.adres || null,

        traffic_source: trackingUtils.getTrafficSource(),
        user_agent: navigator.userAgent,
        fbp: trackingUtils.getFbBrowserId(),
        fbc: trackingUtils.getFbClickId(),

        content_name: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca',
        content_category: 'Motorcycle & Safety Gear',
        content_ids: 'roadshield-4seasons-motorcycle-jacket',
        content_type: 'product',
        value: 299.00,
        currency: 'PLN',
        quantity: 1
      };

      const n8nResponse = await fetch('https://primary-production-625c.up.railway.app/webhook/CAPI-Meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (n8nResponse.ok) {
        console.log('✅ Purchase notification sent to N8N successfully');
      } else {
        console.error('❌ N8N notification error:', n8nResponse.status);
      }
    } catch (error) {
      console.error('❌ N8N notification failed:', error);
    }

    try {
      // Ottieni click_id dai parametri URL
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get('click_id');

      // Ottieni il fingerprint TMFP se disponibile
      const tmfpInput = document.querySelector('input[name="tmfp"]') as HTMLInputElement | null;
      const tmfpValue = tmfpInput?.value || '';

      // Prepara i dati per il Cloudflare Worker
      const leadData = {
        // Campi esistenti - preservati
        uid: '01980825-ae5a-7aca-8796-640a3c5ee3da',
        key: 'ad79469b31b0058f6ea72c',
        offer: '463',
        lp: '463',
        name: formData.imie.trim(),
        tel: formData.telefon.trim(),
        'street-address': formData.adres.trim(),
        tmfp: tmfpValue,
        ua: navigator.userAgent,

        // Nuovi campi richiesti
        network_type: 'traffic',
        url_network: 'https://offers.supertrendaffiliateprogram.com/forms/api/',
        click_id: clickId,

        // Dati del prodotto
        product: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca',
        price: 299.00,
        currency: 'PLN',
        modello: model,
        taglia: size,

        // Dati di tracking
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,

        // Parametri UTM
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),

        // Timestamp
        timestamp: typeof window !== 'undefined' ? new Date().toISOString() : '2023-09-16T12:00:00.000Z',

        // Identificatori Facebook
        fbp: trackingUtils.getFbBrowserId(),
        fbc: trackingUtils.getFbClickId(),

        // Altri dati utili
        language: navigator.language,
        screen_resolution: `${screen.width}x${screen.height}`,
        page_title: document.title
      };

      console.log('📡 Sending data to Cloudflare Worker:', leadData);

      const response = await fetch('https://leads-ingest.hidden-rain-9c8e.workers.dev/', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer Y60kgTRvJUTTVEsMytKhcFAo1dxDl6Iom2oL8QqxaRVb7RM1O6jx9D3gJsx1l0A1',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });

      console.log('📥 Response status:', response.status);

      if (response.status === 202) {
        // Successo - il worker ha accettato i dati
        const result = await response.json();
        const orderId = typeof window !== 'undefined' ? `JKT${Date.now()}` : 'JKT1694880000000';

        console.log('✅ Lead successfully sent to Cloudflare Worker:', result);

        const orderData = {
          ...formData,
          orderId,
          product: 'RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca',
          price: 299.00,
          apiResponse: result
        };

        localStorage.setItem('orderData', JSON.stringify(orderData));
        console.log('✅ Order data saved to localStorage:', orderData);

        window.location.href = '/ty-jacket-pl';
      } else if (response.status === 401) {
        console.error('❌ Unauthorized: Invalid token');
        alert('Błąd autoryzacji. Skontaktuj się z obsługą klienta.');
      } else if (response.status === 429) {
        console.error('❌ Rate limit exceeded');
        alert('Zbyt wiele żądań. Spróbuj ponownie za chwilę.');
      } else {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, response.statusText, errorText);
        alert(`Wystąpił błąd podczas wysyłania zamówienia (${response.status}). Spróbuj ponownie później.`);
      }
    } catch (error: unknown) {
      console.error('Network Error:', error);
      alert('Wystąpił błąd połączenia. Sprawdź połączenie internetowe i spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Ładowanie strony...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <input type="hidden" name="tmfp" />


        <div className="bg-red-600 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <span>🔥 OFERTA LIMITOWANA – Zniżka -60% na ostatnie sztuki!</span>
          </div>
        </div>

        <section className="bg-white py-8 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="order-1">
                <ProductCarousel />
              </div>

              <div className="order-2 space-y-6">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-medium">
                    Wodoodporna membrana + ochraniacze CE. Płatność przy odbiorze.
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  🏍️ RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca
                </h1>

                <p className="text-lg text-gray-700 font-medium">
                  <strong>Kurtka 4-sezonowa z ochraniaczyami CE, wodoodporną membraną i systemem wentylacji – bezpieczeństwo i komfort w każdych warunkach.</strong>
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">🛡️ Ochraniacze CE</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">💧 Wodoodporna</span>
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">🌬️ Oddychająca</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">🔥 Podszewka termo</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">✨ Odblaski 360°</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">📏 Rozmiary S-3XL</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">🛡️ <strong>Bezpieczeństwo CE</strong> – Ochraniacze barki/łokcie/plecy poziom 1</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">🌦️ <strong>Komfort w każdą pogodę</strong> – Membrana wodoodporna + oddychająca</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">🌬️ <strong>Wentylacja</strong> – Otwory pod pachami i na plecach z zamkami</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base">🔥 <strong>Podszewka termo</strong> – Wypinana na zimę dla maksymalnego komfortu</span>
                  </div>
                </div>

                {/* MINIMAL BRAND SELECTORS - POLISH */}
                <section
                  aria-labelledby="variantsTitle"
                  style={{
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}
                >
                  <h3
                    id="variantsTitle"
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#111',
                      margin: '0 0 8px',
                      letterSpacing: '0'
                    }}
                  >
                    Wybierz model i rozmiar
                  </h3>

                  {/* Model Selection */}
                  <div style={{ margin: '10px 0' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111',
                      marginBottom: '6px'
                    }}>
                      Model *
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="Model"
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked={model === 'Mężczyzna'}
                        tabIndex={0}
                        onClick={() => setModel('Mężczyzna')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setModel('Mężczyzna');
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '42px',
                          padding: '0 14px',
                          fontSize: '14px',
                          fontWeight: model === 'Mężczyzna' ? '600' : '500',
                          color: '#111',
                          background: model === 'Mężczyzna' ? '#F3F4F6' : '#fff',
                          border: `1px solid ${model === 'Mężczyzna' ? '#111' : '#D1D5DB'}`,
                          borderRadius: '8px',
                          transition: 'background .15s, border-color .15s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (model !== 'Mężczyzna') {
                            (e.target as HTMLElement).style.background = '#F9FAFB';
                            (e.target as HTMLElement).style.borderColor = '#9CA3AF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (model !== 'Mężczyzna') {
                            (e.target as HTMLElement).style.background = '#fff';
                            (e.target as HTMLElement).style.borderColor = '#D1D5DB';
                          }
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLElement).style.outline = '2px solid #111';
                          (e.target as HTMLElement).style.outlineOffset = '1px';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLElement).style.outline = 'none';
                        }}
                      >
                        Mężczyzna
                      </button>

                      <button
                        type="button"
                        role="radio"
                        aria-checked={model === 'Kobieta'}
                        tabIndex={0}
                        onClick={() => setModel('Kobieta')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setModel('Kobieta');
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '42px',
                          padding: '0 14px',
                          fontSize: '14px',
                          fontWeight: model === 'Kobieta' ? '600' : '500',
                          color: '#111',
                          background: model === 'Kobieta' ? '#F3F4F6' : '#fff',
                          border: `1px solid ${model === 'Kobieta' ? '#111' : '#D1D5DB'}`,
                          borderRadius: '8px',
                          transition: 'background .15s, border-color .15s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (model !== 'Kobieta') {
                            (e.target as HTMLElement).style.background = '#F9FAFB';
                            (e.target as HTMLElement).style.borderColor = '#9CA3AF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (model !== 'Kobieta') {
                            (e.target as HTMLElement).style.background = '#fff';
                            (e.target as HTMLElement).style.borderColor = '#D1D5DB';
                          }
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLElement).style.outline = '2px solid #111';
                          (e.target as HTMLElement).style.outlineOffset = '1px';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLElement).style.outline = 'none';
                        }}
                      >
                        Kobieta
                      </button>
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div style={{ margin: '10px 0' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111',
                      marginBottom: '6px'
                    }}>
                      Rozmiar *
                    </div>
                    <div
                      role="radiogroup"
                      aria-label="Rozmiar"
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      {(['S', 'M', 'L', 'XL', 'XXL', '3XL'] as const).map((sizeOption) => (
                        <button
                          key={sizeOption}
                          type="button"
                          role="radio"
                          aria-checked={size === sizeOption}
                          tabIndex={0}
                          onClick={() => setSize(sizeOption)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSize(sizeOption);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '42px',
                            padding: '0 14px',
                            fontSize: '14px',
                            fontWeight: size === sizeOption ? '600' : '500',
                            color: '#111',
                            background: size === sizeOption ? '#F3F4F6' : '#fff',
                            border: `1px solid ${size === sizeOption ? '#111' : '#D1D5DB'}`,
                            borderRadius: '8px',
                            transition: 'background .15s, border-color .15s',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (size !== sizeOption) {
                              (e.target as HTMLElement).style.background = '#F9FAFB';
                              (e.target as HTMLElement).style.borderColor = '#9CA3AF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (size !== sizeOption) {
                              (e.target as HTMLElement).style.background = '#fff';
                              (e.target as HTMLElement).style.borderColor = '#D1D5DB';
                            }
                          }}
                          onFocus={(e) => {
                            (e.target as HTMLElement).style.outline = '2px solid #111';
                            (e.target as HTMLElement).style.outlineOffset = '1px';
                          }}
                          onBlur={(e) => {
                            (e.target as HTMLElement).style.outline = 'none';
                          }}
                        >
                          {sizeOption}
                        </button>
                      ))}
                    </div>

                    {/* Size Guide Link */}
                    <button
                      type="button"
                      onClick={() => {
                        const overlay = document.querySelector('.sizeguide-overlay') as HTMLElement;
                        if (overlay) {
                          overlay.style.display = 'block';
                          const targetTab = model === 'Kobieta' ? 'kobieta' : 'mezczyzna';
                          setTimeout(() => {
                            showSizeTab(targetTab);
                          }, 50);
                        }
                      }}
                      style={{
                        marginTop: '8px',
                        display: 'inline-block',
                        fontSize: '14px',
                        color: '#2563EB',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = '#1D4ED8';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = '#2563EB';
                      }}
                    >
                      Tablica rozmiarów
                    </button>
                  </div>

                  {/* Minimal Choice Summary */}
                  <div style={{
                    marginTop: '8px',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    Twój wybór: <strong>{model}</strong>, <strong>Rozmiar {size}</strong>
                  </div>
                </section>

                {/* NOWY BOX OFERTY */}
                <div style={{
                  fontFamily: 'sans-serif',
                  background: '#fff',
                  padding: '20px',
                  borderRadius: '10px',
                  maxWidth: '650px',
                  margin: 'auto',
                  textAlign: 'left',
                  boxShadow: '0 0 10px rgba(0,0,0,0.05)'
                }}>
                  <h2 style={{
                    color: '#1c1917',
                    fontSize: '20px',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    🏍️ RoadShield™ 4-Seasons – Kurtka Motocyklowa CE, Wodoodporna, Oddychająca
                  </h2>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ flex: '1 1 70%' }}>🛡️ Kurtka z ochraniaczyami CE (barki/łokcie/plecy)</span>
                    <span style={{
                      color: 'red',
                      textDecoration: 'line-through',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>749 zł</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ flex: '1 1 70%' }}>💧 Membrana wodoodporna + oddychająca w każdych warunkach</span>
                    <span style={{
                      color: '#16a34a',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>✔ W zestawie</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ flex: '1 1 70%' }}>🌬️ System wentylacji: Otwory pod pachami i na plecach</span>
                    <span style={{
                      color: '#16a34a',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>✔ W zestawie</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: '16px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ flex: '1 1 70%' }}>🔥 Podszewka termiczna wypinana + odblaski 360°</span>
                    <span style={{
                      color: '#16a34a',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}>✔ W zestawie</span>
                  </div>

                  <div style={{
                    background: '#ecfdf5',
                    borderLeft: '4px solid #10b981',
                    padding: '10px 12px',
                    margin: '10px 0',
                    fontSize: '15px'
                  }}>
                    🚚 <strong>Darmowa dostawa kurierem DPD – 3–4 dni robocze</strong>
                  </div>

                  <div style={{
                    background: '#ecfdf5',
                    borderLeft: '4px solid #10b981',
                    padding: '10px 12px',
                    margin: '10px 0',
                    fontSize: '15px'
                  }}>
                    💶 <strong>Płatność przy odbiorze (gotówka/karta)</strong>
                  </div>

                  <div style={{
                    background: '#f0fdf4',
                    padding: '15px',
                    margin: '20px 0',
                    textAlign: 'center',
                    borderRadius: '8px',
                    fontSize: '22px',
                    color: '#16a34a',
                    fontWeight: 'bold'
                  }}>
                    Cena katalogowa: <span style={{ textDecoration: 'line-through', color: 'red' }}>749 zł</span><br />
                    <div style={{ marginTop: '10px' }}>
                      Dziś tylko: <span style={{ fontSize: '26px' }}>299 zł</span>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    color: '#7f1d1d',
                    fontWeight: '500',
                    background: '#fef2f2',
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '10px',
                    fontSize: '14px'
                  }}>
                    🔥 <strong>Ostatnie sztuki dostępne w magazynie</strong><br />
                    Zamów teraz, aby nie przegapić promocji.
                  </div>

                  <div style={{
                    textAlign: 'center',
                    fontSize: '14px',
                    color: '#dc2626',
                    fontWeight: 'bold',
                    marginTop: '8px'
                  }}>
                    🔥 Ostatnie sztuki dostępne w magazynie – zamów teraz!
                  </div>

                  <div style={{
                    background: 'repeating-linear-gradient(45deg, #facc15, #facc15 10px, #fde68a 10px, #fde68a 20px)',
                    color: '#1f2937',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    padding: '10px',
                    borderRadius: '8px',
                    margin: '10px 0',
                    fontSize: '15px'
                  }}>
                    ⚡ Ostatnie sztuki dostępne w magazynie
                  </div>

                  <p style={{ textAlign: 'center', fontSize: '14px', color: '#555' }}>
                    📦 Śledzenie przesyłki — wyślemy numer SMS/em
                  </p>
                </div>

                <button
                  onClick={handleOrderClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg animate-pulse-button"
                >
                  🔥 ZAMÓW TERAZ - Płatność przy Odbiorze
                </button>

                <DeliveryTracking />

                {/* Recensione evidenziata */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                  {/* Layout con foto centrata verticalmente rispetto al testo */}
                  <div className="flex items-center space-x-4">
                    <img
                      src="images/marcin.jpg"
                      alt="Marcin K."
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-1">
                      {/* Stelle sopra il testo, allineate a sinistra */}
                      <div className="mb-3">
                        <StarRating rating={5} size="w-4 h-4" />
                      </div>

                      <p className="text-gray-800 text-sm leading-relaxed mb-3">
                        "Kupiłem RoadShield 4-Seasons miesiąc temu i jestem zachwycony! 🛡️ Ochraniacze CE dają pełne bezpieczeństwo, membrana wodoodporna trzyma sucho w deszczu. System wentylacji ratuje latem, a podszewka termo świetnie sprawdza się zimą. Najlepsza kurtka motocyklowa jaką miałem!"
                      </p>

                      {/* Nome con checkmark blu */}
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">Marcin K. - Kraków</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  🏍️ RoadShield™ 4-Seasons – Bezpieczeństwo na Każdym Kilometrze!
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  <strong>RoadShield™ 4-Seasons z ochraniaczyami CE</strong> to rewolucyjna kurtka motocyklowa, zaprojektowana dla motocyklistów, którzy wymagają najwyższego poziomu ochrony.
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Ochraniacze CE poziom 1</strong> gwarantują ochronę barków, łokci i pleców, a <strong>wodoodporna membrana</strong> zapewnia komfort w każdych warunkach pogodowych.
                </p>
              </div>
              <div>
                <img
                  src="/images/Jacket/4.gif"
                  alt="Kurtka w użyciu"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <img
                  src="/images/Jacket/3.jpg"
                  alt="Cechy kurtki"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Dlaczego RoadShield™ 4-Seasons?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-lg">
                      <strong>Bezpieczeństwo CE:</strong> Ochraniacze barki/łokcie/plecy poziom 1 – pełna ochrona w razie upadku.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-lg">
                      <strong>Komfort w każdą pogodę:</strong> Membrana wodoodporna + oddychająca – sucho i komfortowo zawsze.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-lg">
                      <strong>Wentylacja:</strong> Otwory pod pachami i na plecach z zamkami – regulacja temperatury.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-lg">
                      <strong>Podszewka termo:</strong> Wypinana na zimę – jedna kurtka na 4 sezony.
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-lg">
                      <strong>Widoczność 360°:</strong> Odblaski na ramionach i plecach – bezpieczeństwo w nocy.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                4 Sezony Wykorzystania – Jedna Kurtka na Cały Rok
              </h2>
              <p className="text-lg text-gray-700">
                RoadShield™ 4-Seasons to jedyna kurtka motocyklowa, która doskonale sprawdza się w każdych warunkach pogodowych.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <img
                  src="/images/Jacket/2.jpg"
                  alt="Kurtka 4 sezony"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <div className="text-4xl mb-4">❄️</div>
                    <h3 className="font-bold text-lg mb-2">ZIMA</h3>
                    <p className="text-gray-600">Z podszewką termo + warstwa bazowa = ciepło i ochrona.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <div className="text-4xl mb-4">🌸</div>
                    <h3 className="font-bold text-lg mb-2">WIOSNA/JESIEŃ</h3>
                    <p className="text-gray-600">Bez podszewki, wentylacja zamknięta = idealny komfort.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <div className="text-4xl mb-4">☀️</div>
                    <h3 className="font-bold text-lg mb-2">LATO</h3>
                    <p className="text-gray-600">Wszystkie wentylacje otwarte, oddychająca membrana.</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <div className="text-4xl mb-4">🌧️</div>
                    <h3 className="font-bold text-lg mb-2">DESZCZ</h3>
                    <p className="text-gray-600">Wodoodporna membrana chroni w każdych warunkach.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Zestaw W Komplecie
              </h2>
              <p className="text-lg text-gray-700">
                Wszystko czego potrzebujesz do bezpiecznej i komfortowej jazdy w każdych warunkach.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">🏍️</div>
                  <h3 className="font-bold text-lg mb-2">Kurtka RoadShield™ 4-Seasons</h3>
                  <p className="text-gray-600">Główna kurtka z membraną wodoodporną i systemem wentylacji</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">🛡️</div>
                  <h3 className="font-bold text-lg mb-2">Komplet Ochraniaczy CE</h3>
                  <p className="text-gray-600">Barki, łokcie i plecy - poziom ochrony 1</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">🔥</div>
                  <h3 className="font-bold text-lg mb-2">Wypinana Podszewka Termiczna</h3>
                  <p className="text-gray-600">Ciepło na zimę, chłód na lato</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="font-bold text-lg mb-2">Instrukcja w Języku Polskim</h3>
                  <p className="text-gray-600">Szczegółowe instrukcje użytkowania i pielęgnacji</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="font-bold text-lg mb-2">Certyfikat CE</h3>
                  <p className="text-gray-600">Potwierdzenie jakości i bezpieczeństwa</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-4">📏</div>
                  <h3 className="font-bold text-lg mb-2">Tabela Rozmiarów</h3>
                  <p className="text-gray-600">S, M, L, XL, XXL, 3XL - idealny rozmiar dla każdego</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Specyfikacja Techniczna
              </h2>
              <p className="text-lg text-gray-700">
                Najważniejsze parametry techniczne kurtki RoadShield™ 4-Seasons
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Materiał:</h4>
                    <p className="text-gray-600">Oxford 600D/900D z wzmocnieniami</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Membrana:</h4>
                    <p className="text-gray-600">Wodoodporna + oddychająca</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Ochraniacze:</h4>
                    <p className="text-gray-600">CE Level 1 (barki, łokcie, plecy)</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Wentylacja:</h4>
                    <p className="text-gray-600">Otwory pod pachami i na plecach z zamkami</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Odblaski:</h4>
                    <p className="text-gray-600">Na ramionach, plecach i mankietach</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Zamki:</h4>
                    <p className="text-gray-600">YKK (główny + kieszenie)</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Podszewka:</h4>
                    <p className="text-gray-600">Termo, wypinana</p>
                  </div>
                  <div className="border-b border-gray-200 pb-3">
                    <h4 className="font-semibold text-gray-800">Rozmiary:</h4>
                    <p className="text-gray-600">S, M, L, XL, XXL, 3XL</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabella Rozmiarów */}
            <div className="mt-12 bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Tabela Rozmiarów</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Rozmiar</th>
                      <th className="px-4 py-3 text-left font-semibold">Klatka Piersiowa</th>
                      <th className="px-4 py-3 text-left font-semibold">Talia</th>
                      <th className="px-4 py-3 text-left font-semibold">Długość Rękawa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-medium">S</td>
                      <td className="px-4 py-3">96-104 cm</td>
                      <td className="px-4 py-3">76-84 cm</td>
                      <td className="px-4 py-3">61 cm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">M</td>
                      <td className="px-4 py-3">104-112 cm</td>
                      <td className="px-4 py-3">84-92 cm</td>
                      <td className="px-4 py-3">63 cm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">L</td>
                      <td className="px-4 py-3">112-120 cm</td>
                      <td className="px-4 py-3">92-100 cm</td>
                      <td className="px-4 py-3">65 cm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">XL</td>
                      <td className="px-4 py-3">120-128 cm</td>
                      <td className="px-4 py-3">100-108 cm</td>
                      <td className="px-4 py-3">67 cm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">XXL</td>
                      <td className="px-4 py-3">128-136 cm</td>
                      <td className="px-4 py-3">108-116 cm</td>
                      <td className="px-4 py-3">69 cm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">3XL</td>
                      <td className="px-4 py-3">136-144 cm</td>
                      <td className="px-4 py-3">116-124 cm</td>
                      <td className="px-4 py-3">71 cm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <ResultsSection />

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Odpowiedzi na Twoje Najczęściej Zadawane Pytania
              </h2>
              <p className="text-lg text-gray-700">
                Jasność i wsparcie dla bezpiecznego zakupu.
              </p>
            </div>

            <div className="space-y-4">
              <FAQ
                question="Czy ochraniacze są certyfikowane CE?"
                answer="Tak, wszystkie ochraniacze (barki, łokcie, plecy) posiadają certyfikat CE poziom 1, co gwarantuje najwyższy standard bezpieczeństwa zgodny z normami europejskimi."
              />
              <FAQ
                question="Jak działa membrana wodoodporna?"
                answer="Membrana jest w 100% wodoodporna i jednocześnie oddychająca. Zapobiega przedostawaniu się wody z zewnątrz, a jednocześnie odprowadza wilgoć z wnętrza kurtki."
              />
              <FAQ
                question="Czy można regulować wentylację?"
                answer="Tak, kurtka posiada otwory wentylacyjne pod pachami i na plecach z zamkami YKK. Możesz je otwierać i zamykać w zależności od warunków pogodowych."
              />
              <FAQ
                question="Jak wybrać odpowiedni rozmiar?"
                answer="Skorzystaj z naszej tabeli rozmiarów. Zmierz obwód klatki piersiowej i talii, a następnie dopasuj do tabeli. W razie wątpliwości wybierz większy rozmiar."
              />
              <FAQ
                question="Jak pielęgnować kurtkę?"
                answer="Kurtkę można prać w pralce w temp. 30°C z delikatnym detergentem. Nie używaj płynu do płukania ani wybielacza. Suszyć w pozycji wiszącej."
              />
              <FAQ
                question="Jakie są czasy dostawy?"
                answer="Standardowa dostawa w Polsce trwa 3-4 dni robocze. Wysyłka następuje w ciągu 24-48h od złożenia zamówienia."
              />
              <FAQ
                question="Czy są zwroty i gwarancja?"
                answer="Oferujemy 30-dniową gwarancję zwrotu pieniędzy oraz 24-miesięczną gwarancję producenta na wszystkie wady fabryczne."
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <StarRating rating={5} size="w-6 h-6" />
                <span className="text-2xl font-bold">4.9/5</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Opinie klientów o kurtce RoadShield™ 4-Seasons
              </h2>
              <p className="text-lg text-gray-700">
                Autentyczne i wiarygodne opinie motocyklistów
              </p>
              <p className="text-sm text-gray-600 mt-2 mb-6">
                <strong>Nota:</strong> Opinie pochodzą z ankiet pozakupowych z ostatnich 12 miesięcy. Na stronie pokazujemy losową próbkę.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Kamil K. - Kraków",
                  rating: 5,
                  review: "Jeżdżę od 3 lat na różnych kurtkach, ale RoadShield to prawdziwa rewolucja! 🛡️ Ochraniacze CE dają pełne bezpieczeństwo, a membrana wodoodporna trzyma sucho nawet w największy deszcz. Polecam każdemu motocykliście!"
                },
                {
                  name: "Ania M. - Warszawa",
                  rating: 5,
                  review: "Wreszcie kurtka na każdą pogodę! 🌦️ Latem otwieramy wentylacje i jest komfortowo, zimą wkładamy podszewkę termo i ciepło. Świetna jakość materiałów i wykonania. Najlepsza inwestycja w bezpieczeństwo!"
                },
                {
                  name: "Marek P. - Wrocław",
                  rating: 5,
                  review: "System wentylacji to strzał w dziesiątkę! 🌬️ Latem, gdy jest upał, otwieram wszystkie otwory i czuję się komfortowo. Odblaski świetnie widać w nocy - bezpieczeństwo na najwyższym poziomie."
                },
                {
                  name: "Kasia L. - Gdańsk",
                  rating: 5,
                  review: "Wodoodporność na poziomie! 💧 Jeździłam w ulewnym deszczu i zostałam kompletnie sucha. Membrana oddycha, więc nie pocę się. Idealna kurtka dla każdego motocyklisty, niezależnie od doświadczenia."
                },
                {
                  name: "Tomek S. - Poznań",
                  rating: 5,
                  review: "Podszewka termo to strzał w dziesiątkę! 🔥 Zimą z nią jest ciepło, latem bez niej jest chłodno. Jedna kurtka na cały rok - to się nazywa praktyczność! Jakość materiałów rewelacyjna."
                },
                {
                  name: "Ewelina K. - Łódź",
                  rating: 5,
                  review: "Odblaski świetnie widać w nocy! ✨ Bezpieczeństwo to podstawa, a ta kurtka ma odblaski na ramionach, plecach i mankietach. Czuję się bezpiecznie jeżdżąc po zmroku. Bardzo polecam!"
                },
                {
                  name: "Paweł J. - Katowice",
                  rating: 5,
                  review: "Materiał 600D/900D jest bardzo trwały! 💪 Używam kurtki od roku, jeżdżę codziennie i nie ma żadnych śladów zużycia. Zamki YKK działają płynnie, ochraniacze świetnie się trzymają."
                },
                {
                  name: "Magda R. - Lublin",
                  rating: 4,
                  review: "Idealnie dopasowana, rozmiar M jak ulał! 📏 Tabela rozmiarów bardzo precyzyjna. Kurtka nie ogranicza ruchów, można swobodnie jeździć. Jedyny minus - mogłaby mieć więcej kieszeni. Poza tym super!"
                }
              ].map((review, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center space-x-2 mb-3">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-600">Zweryfikowany Kupujący</span>
                  </div>
                  <p className="text-gray-700 mb-3">{review.review}</p>
                  <p className="font-medium text-gray-900">- {review.name}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white p-8 rounded-lg shadow-lg border-l-4 border-yellow-400">
              <div className="flex items-start space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=70&h=70&fit=crop&crop=face"
                  alt="Rafał D."
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <StarRating rating={5} />
                    <span className="font-medium">Rafał D. - Szczecin</span>
                    <span className="text-sm text-gray-600">Zweryfikowany Kupujący</span>
                  </div>
                  <p className="text-gray-700">
                    "Fantastyczna kurtka RoadShield 4-Seasons! 🏍️ Ochraniacze CE poziom 1 to prawdziwa ochrona - sprawdziłem już kilka razy w praktyce. Membrana wodoodporna trzyma sucho w każdych warunkach, a system wentylacji ratuje latem. Podszewka termo świetnie sprawdza się zimą. To nie jest zwykła kurtka - to profesjonalny sprzęt dla każdego motocyklisty. Najlepsza kurtka jaką miałem!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <Shield className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                30-Dniowa Gwarancja Zwrotu Pieniędzy
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Wypróbuj kurtkę RoadShield™ 4-Seasons z całkowitym bezpieczeństwem dzięki naszej 30-dniowej gwarancji zwrotu pieniędzy. Doświadcz bezpieczeństwa i komfortu jazdy bez ryzyka.
              </p>
              <p className="text-xl font-bold text-green-600">
                Jeśli nie jesteś całkowicie zadowolony, zwrócimy Ci całą kwotę.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dlaczego kupować od nas?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Numer śledzenia dla każdego zamówienia</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Płatności bezpośrednio przy odbiorze</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pomoc 24 godziny na dobę, 7 dni w tygodniu</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Brak ukrytych kosztów!</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  DOSTAWA
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm"><strong>Dostawa:</strong> Kurier DPD Polska na terenie całego kraju</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm"><strong>Czas dostawy:</strong> 3–4 dni robocze</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm"><strong>Płatność przy odbiorze:</strong> gotówką lub kartą u kuriera</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm"><strong>Śledzenie przesyłki:</strong> numer listu przewozowego wysyłamy SMS/em</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm"><strong>Kontakt z przewoźnikiem:</strong> infolinia DPD: 801 400 373 / 22 577 55 55</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Sprzedawane wyłącznie przez <strong>NEWHERAS</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-orange-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">
              🔥 Nie Przegap Tej Specjalnej Oferty!
            </h2>
            <p className="text-xl mb-8">
              Tylko na dziś: <span className="line-through opacity-75">749 zł</span> <span className="text-5xl font-bold">299 zł</span>
            </p>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">1,847+</div>
                  <div className="text-sm opacity-90">Zadowolonych Motocyklistów</div>
                </div>
                <div>
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">99.2%</div>
                  <div className="text-sm opacity-90">Wskaźnik Zadowolenia</div>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-bold">24/7</div>
                  <div className="text-sm opacity-90">Obsługa Klientów</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleOrderClick}
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg mb-4 w-full md:w-auto"
            >
              🛒 ZAMÓW TERAZ - OSTATNIE SZTUKI DOSTĘPNE
            </button>

            <p className="text-sm opacity-90">
              ⚡ Oferta ograniczona w czasie • 🚚 Darmowa dostawa • 💯 Gwarancja 30 dni
            </p>
          </div>
        </section>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30" style={{
          transform: showStickyButton ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out'
        }}>
          <button
            onClick={handleOrderClick}
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 shadow-lg ${bounceAnimation ? 'animate-bounce' : ''
              }`}
          >
            🔥 ZAMÓW TERAZ - Płatność przy Odbiorze
          </button>
        </div>

        {showOrderPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full relative my-4 md:my-8 min-h-0">
              <button
                onClick={() => setShowOrderPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
              >
                ×
              </button>

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 pr-8">Wypełnij aby zamówić</h3>
              <p className="text-gray-600 mb-4 md:mb-6">Płatność przy odbiorze</p>

              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Podsumowanie zamówienia</h4>
                <div className="flex items-center gap-3">
                  <img
                    src="/images/Jacket/1.jpg"
                    alt="Kurtka motocyklowa"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm md:text-base">🏍️ RoadShield™ 4-Seasons – Kurtka Motocyklowa CE</div>
                    <div className="text-xs md:text-sm text-gray-600">Wodoodporna, Oddychająca, Ochraniacze CE</div>
                    <div className="text-xs md:text-sm text-green-600">✅ Darmowa dostawa</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg md:text-xl text-gray-900">299 zł</div>
                    <div className="text-xs text-gray-500 line-through">749 zł</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 md:mb-6">
                <div className="text-center">
                  <div className="text-sm text-red-600 font-medium">
                    🔥 Ostatnie sztuki dostępne w magazynie – zamów teraz!
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko *</label>
                  <input
                    type="text"
                    value={formData.imie}
                    onChange={(e) => handleFormChange('imie', e.target.value)}
                    className={`w-full px-3 py-3 md:py-2 border rounded-md focus:outline-none focus:ring-2 text-base ${formErrors.imie
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                      }`}
                    placeholder="Twoje pełne imię i nazwisko"
                  />
                  {formErrors.imie && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.imie}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numer Telefonu *</label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => handleFormChange('telefon', e.target.value)}
                    className={`w-full px-3 py-3 md:py-2 border rounded-md focus:outline-none focus:ring-2 text-base ${formErrors.telefon
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                      }`}
                    placeholder="Twój numer telefonu"
                  />
                  {formErrors.telefon && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.telefon}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pełny Adres *</label>
                  <textarea
                    value={formData.adres}
                    onChange={(e) => handleFormChange('adres', e.target.value)}
                    className={`w-full px-3 py-3 md:py-2 border rounded-md focus:outline-none focus:ring-2 h-20 md:h-20 text-base resize-none ${formErrors.adres
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-green-500'
                      }`}
                    placeholder="Ulica, numer domu, miasto, kod pocztowy"
                  />
                  {formErrors.adres && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.adres}</p>
                  )}
                </div>

                {/* Hidden inputs for external selection sync */}
                <input type="hidden" name="model" value={model} />
                <input type="hidden" name="size" value={size} />

                {/* Order Summary - Selected Variants */}
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111',
                    marginBottom: '6px'
                  }}>
                    Twój wybór:
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    <strong>{model}</strong>, <strong>Rozmiar {size}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 mt-4 text-gray-700">
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm md:text-base">Płatność przy odbiorze</span>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg"
              >
                {isSubmitting ? 'PRZETWARZANIE...' : 'POTWIERDŹ ZAMÓWIENIE - 299 zł'}
              </button>
            </div>
          </div>
        )}

        <Footer />

        <style>{`
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
    
    @keyframes pulse-button {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    .animate-pulse-button {
      animation: pulse-button 2s ease-in-out infinite;
    }
  `}</style>

        {/* Polish Size Guide Popup */}
        <div className="sizeguide-overlay" style={{ display: 'none' }} onClick={(e) => {
          if (e.target === e.currentTarget) {
            (e.target as HTMLElement).style.display = 'none';
          }
        }}>
          <div className="sizeguide-box" onClick={(e) => e.stopPropagation()}>
            <span className="sizeguide-close" onClick={() => {
              const overlay = document.querySelector('.sizeguide-overlay') as HTMLElement;
              if (overlay) overlay.style.display = 'none';
            }}>&times;</span>
            <h3 style={{
              textAlign: 'center',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#111',
              letterSpacing: '0'
            }}>Tablica rozmiarów</h3>

            {/* Tab Mężczyzna / Kobieta */}
            <div className="sizeguide-tabs">
              <button className="active" data-target="mezczyzna" onClick={() => showSizeTab('mezczyzna')}>Mężczyzna</button>
              <button data-target="kobieta" onClick={() => showSizeTab('kobieta')}>Kobieta</button>
            </div>

            {/* MĘŻCZYZNA */}
            <div id="tab-mezczyzna" className="sizeguide-content active">
              <table>
                <tr><th>Rozmiar</th><th>Klatka piersiowa (cm)</th><th>Talia (cm)</th><th>Długość rękawa (cm)</th></tr>
                <tr><td>S</td><td>96-104</td><td>76-84</td><td>61</td></tr>
                <tr><td>M</td><td>104-112</td><td>84-92</td><td>63</td></tr>
                <tr><td>L</td><td>112-120</td><td>92-100</td><td>65</td></tr>
                <tr><td>XL</td><td>120-128</td><td>100-108</td><td>67</td></tr>
                <tr><td>XXL</td><td>128-136</td><td>108-116</td><td>69</td></tr>
                <tr><td>3XL</td><td>136-144</td><td>116-124</td><td>71</td></tr>
              </table>
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                Wymiary w cm (obwód klatki piersiowej, talii i długość rękawa).
              </p>
            </div>

            {/* KOBIETA */}
            <div id="tab-kobieta" className="sizeguide-content">
              <table>
                <tr><th>Rozmiar</th><th>Klatka piersiowa (cm)</th><th>Talia (cm)</th><th>Długość rękawa (cm)</th></tr>
                <tr><td>S</td><td>86-94</td><td>66-74</td><td>58</td></tr>
                <tr><td>M</td><td>94-102</td><td>74-82</td><td>60</td></tr>
                <tr><td>L</td><td>102-110</td><td>82-90</td><td>62</td></tr>
                <tr><td>XL</td><td>110-118</td><td>90-98</td><td>64</td></tr>
                <tr><td>XXL</td><td>118-126</td><td>98-106</td><td>66</td></tr>
                <tr><td>3XL</td><td>126-134</td><td>106-114</td><td>68</td></tr>
              </table>
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                Wymiary w cm (obwód klatki piersiowej, talii i długość rękawa).
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .sizeguide-overlay {
            position: fixed;
            z-index: 9999;
            inset: 0;
            background-color: rgba(0,0,0,0.5);
            overflow: auto;
          }
          .sizeguide-box {
            background: #fff;
            width: 95%;
            max-width: 640px;
            margin: 64px auto;
            padding: 20px;
            border-radius: 12px;
            position: relative;
            border: 1px solid #E5E7EB;
          }
          .sizeguide-close {
            position: absolute;
            top: 10px; 
            right: 14px;
            font-size: 20px;
            cursor: pointer;
            font-weight: 600;
            line-height: 1;
            color: #6B7280;
          }
          .sizeguide-close:hover {
            color: #111;
          }
          .sizeguide-tabs {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin: 12px 0 16px;
          }
          .sizeguide-tabs button {
            flex: 1;
            padding: 10px;
            cursor: pointer;
            background: #F3F4F6;
            color: #111;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #D1D5DB;
            border-radius: 8px;
            transition: background .15s, color .15s;
          }
          .sizeguide-tabs button.active {
            background: #111;
            color: #fff;
            border-color: #111;
          }
          .sizeguide-content { 
            display: none; 
          }
          .sizeguide-content.active { 
            display: block; 
          }
          .sizeguide-content table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          .sizeguide-content th, .sizeguide-content td {
            border: 1px solid #E5E7EB;
            padding: 8px;
            font-size: 14px;
            text-align: center;
            color: #111;
          }
          .sizeguide-content th {
            background: #F9FAFB;
            font-weight: 600;
          }
          @media (max-width: 500px) {
            .sizeguide-tabs button { 
              font-size: 13px; 
              padding: 8px; 
            }
            .sizeguide-content th, .sizeguide-content td { 
              font-size: 13px; 
              padding: 6px; 
            }
          }
        `}</style>
      </div>
    </>
  );
}