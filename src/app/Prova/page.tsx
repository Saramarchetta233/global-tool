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
      window.gtag('config', 'AW-17086993346');

      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17086993346';
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
    const clientEventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

        // Hash dei dati sensibili se abbiamo form data
        let hashedPhone: string | null = null;
        let hashedFirstName: string | null = null;
        let hashedLastName: string | null = null;

        if (userFormData) {
          hashedPhone = userFormData.telefon ? await trackingUtils.hashData(userFormData.telefon.replace(/\D/g, '')) : null;
          hashedFirstName = userFormData.imie ? await trackingUtils.hashData(userFormData.imie.split(' ')[0]) : null;
          hashedLastName = userFormData.imie && userFormData.imie.split(' ').length > 1 ? await trackingUtils.hashData(userFormData.imie.split(' ').slice(1).join(' ')) : null;
        }

        // Prepara i dati per N8N
        // Calcola timestamp corretto (non più di 7 giorni fa, non nel futuro)
        const now = Math.floor(Date.now() / 1000);
        const maxPastTime = now - (7 * 24 * 60 * 60); // 7 giorni fa
        const eventTimestamp = Math.max(maxPastTime, now - 10); // Massimo 10 secondi fa

        const capiData = {
          event_name: 'Purchase', // o 'InitiateCheckout'
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
          content_name: 'Drone EyeSky Snap X con Telecamera HD',
          content_category: 'Drones',
          content_ids: 'drone-eyesky-snap-x-camera',
          content_type: 'product',
          value: eventData.value || 299.00,
          currency: 'EUR', // Currency dinamica
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
      const timestamp = Math.floor(Date.now() / 1000);
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
      const timestamp = Math.floor(Date.now() / 1000);
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

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const difference = midnight.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-red-600 font-bold text-lg">
      {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </span>
  );
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

// Social Proof Notification
const SocialProofNotification = () => {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const notifications = [
    { name: "Anna da Roma", action: "ha appena acquistato", time: "2 minuti fa" },
    { name: "Giulia da Milano", action: "ha aggiunto al carrello", time: "4 minuti fa" },
    { name: "Marco da Napoli", action: "ha appena acquistato", time: "6 minuti fa" },
    { name: "Sofia da Torino", action: "sta visualizzando ora", time: "1 minuto fa" },
  ];

  useEffect(() => {
    // Aspetta 10 secondi prima di iniziare a mostrare le notifiche
    const initialDelay = setTimeout(() => {
      setHasStarted(true);
    }, 10000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const showNotification = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
      setTimeout(() => {
        setCurrentNotification((prev) => (prev + 1) % notifications.length);
      }, 5000);
    };

    const interval = setInterval(showNotification, 8000);
    showNotification();

    return () => clearInterval(interval);
  }, [hasStarted]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm animate-slide-up">
      <div className="flex items-center space-x-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notifications[currentNotification].name}
          </p>
          <p className="text-xs text-gray-600">
            {notifications[currentNotification].action} • {notifications[currentNotification].time}
          </p>
        </div>
      </div>
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
  const [stock, setStock] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock(prev => {
        const change = Math.random() > 0.7 ? -1 : 0;
        return Math.max(8, prev + change);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-3 rounded-lg text-center font-bold">
      <div className="flex items-center justify-center space-x-2">
        <AlertCircle className="w-5 h-5" />
        <span>⚡ Solo {stock} pezzi rimasti in magazzino!</span>
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
              src="/images/drone/img_body_3.png"
              alt="Drone EyeSky Snap X in volo con risultati professionali"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Trasforma la Tua Passione per la Fotografia Aerea
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
                <p className="text-sm font-medium text-gray-700">Ha migliorato le proprie capacità di ripresa aerea!</p>
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
                      strokeDasharray={`${98 * 3.14159} ${100 * 3.14159}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">98%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Ha creato contenuti più creativi e coinvolgenti!</p>
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
                      strokeDasharray={`${96 * 3.14159} ${100 * 3.14159}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">96%</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Ha risparmiato tempo con le funzioni automatiche!</p>
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
    orderDate: '',
    shipDate: '',
    deliveryStart: '',
    deliveryEnd: '',
    deliveryRange: ''
  });

  useEffect(() => {
    const formatData = (data: Date): string => {
      const giorni = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
      const mesi = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
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
        Ordina <strong>SUBITO</strong> e riceverai il tuo pacco tra <strong>{deliveryDates.deliveryRange}</strong>
      </p>
      <div className="flex justify-between items-center text-sm">
        <div className="text-center">
          <div className="text-2xl mb-1">📦</div>
          <div className="font-medium">Ordinato</div>
          <div className="text-gray-500">{deliveryDates.orderDate}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🚚</div>
          <div className="font-medium">Spedito</div>
          <div className="text-gray-500">{deliveryDates.shipDate}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">📍</div>
          <div className="font-medium">Consegnato</div>
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
              Droni di alta qualità per la tua creatività aerea.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Assistenza Clienti</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white">Contatti</a></li>
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="/returns" target="_blank" rel="noopener noreferrer" className="hover:text-white">Resi</a></li>
              <li><a href="#" className="hover:text-white">Garanzia</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informazioni Legali</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white">Termini e Condizioni</a></li>
              <li><a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/cookies" target="_blank" rel="noopener noreferrer" className="hover:text-white">Cookie Policy</a></li>
              <li><a href="/gdpr" target="_blank" rel="noopener noreferrer" className="hover:text-white">Diritti del Consumatore</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Attività commerciale</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/about" target="_blank" rel="noopener noreferrer" className="hover:text-white">Chi siamo</a></li>
              <li><a href="#" className="hover:text-white">La nostra storia</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Partner</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2025 Newheras. Tutti i diritti riservati.
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Termini e Condizioni</a>
              <a href="/cookies" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm">Cookies</a>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 max-w-4xl mx-auto">
            <p className="mb-2">
              <strong>Informazioni legali:</strong> Tutti i prezzi includono IVA. Diritto di recesso entro 14 giorni secondo la normativa dei consumatori.
              Garanzia 24 mesi secondo il Codice Civile. Venditore: Newheras S.r.l.
            </p>
            <p>
              <strong>Protezione dati:</strong> Trattiamo i tuoi dati personali in conformità al GDPR. Dettagli nella Politica sulla Privacy.
              Utilizziamo cookies per scopi analitici e di marketing. Maggiori informazioni nella Politica sui Cookies.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Component
export default function DroneLanding() {
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [reservationTimer, setReservationTimer] = useState({ minutes: 5, seconds: 0 });
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);
  const [formData, setFormData] = useState({
    imie: '',
    telefon: '',
    adres: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    imie: '',
    telefon: '',
    adres: ''
  });

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
      page_title: 'Drone EyeSky Snap X con Telecamera HD - Pagina Principale',
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

  useEffect(() => {
    let reservationInterval: NodeJS.Timeout | undefined;
    if (showOrderPopup) {
      reservationInterval = setInterval(() => {
        setReservationTimer(prev => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { minutes: prev.minutes - 1, seconds: 59 };
          }
          return { minutes: 0, seconds: 0 };
        });
      }, 1000);
    }

    return () => {
      if (reservationInterval) clearInterval(reservationInterval);
    };
  }, [showOrderPopup]);

  const handleOrderClick = () => {
    console.log('🎯 Order button clicked - tracking InitiateCheckout');

    // Track InitiateCheckout event (inizio processo acquisto)
    trackingUtils.trackFacebookEvent('InitiateCheckout', {
      content_type: 'product',
      content_ids: ['drone-eyesky-snap-x-camera'],
      content_name: 'Drone EyeSky Snap X con Telecamera HD',
      value: 299.00,
      currency: 'EUR',
      num_items: 1
    });

    trackingUtils.trackGoogleEvent('view_item', {
      currency: 'EUR',
      value: 299.00,
      items: [{
        item_id: 'drone-eyesky-snap-x-camera',
        item_name: 'Drone EyeSky Snap X con Telecamera HD',
        category: 'Drones',
        quantity: 1,
        price: 299.00
      }]
    });

    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
    setFormErrors({ imie: '', telefon: '', adres: '' });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = { imie: '', telefon: '', adres: '' };
    let isValid = true;

    if (!formData.imie.trim()) {
      errors.imie = 'Nome e cognome sono obbligatori';
      isValid = false;
    } else if (formData.imie.trim().length < 2) {
      errors.imie = 'Il nome deve contenere almeno 2 caratteri';
      isValid = false;
    }

    if (!formData.telefon.trim()) {
      errors.telefon = 'Il numero di telefono è obbligatorio';
      isValid = false;
    } else {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,15}$/;
      if (!phoneRegex.test(formData.telefon.trim())) {
        errors.telefon = 'Inserisci un numero di telefono valido';
        isValid = false;
      }
    }

    if (!formData.adres.trim()) {
      errors.adres = 'L\'indirizzo è obbligatorio';
      isValid = false;
    } else if (formData.adres.trim().length < 10) {
      errors.adres = 'L\'indirizzo deve essere più dettagliato (via, numero, città, codice postale)';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleOrderSubmit = async () => {
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    console.log('🎯 Form submitted, tracking Purchase with form data:', formData);

    // 🚨 ESSENTIAL: Track Purchase event con CAPI PRIMA dell'invio API
    // Questo garantisce che i dati arrivino sempre a N8N
    try {
      await trackingUtils.trackFacebookEvent('Purchase', {
        content_type: 'product',
        content_ids: ['drone-eyesky-snap-x-camera'],
        content_name: 'Drone EyeSky Snap X con Telecamera HD',
        value: 299.00,
        currency: 'EUR',
        num_items: 1
      }, formData);
      console.log('✅ Purchase tracking completato con successo');
    } catch (trackingError) {
      console.error('❌ Purchase tracking fallito, ma continuiamo:', trackingError);
    }

    try {
      const apiFormData = new FormData();

      apiFormData.append('uid', '01980825-ae5a-7aca-8796-640a3c5ee3da');
      apiFormData.append('key', 'ad79469b31b0058f6ea72c');
      apiFormData.append('offer', '232');
      apiFormData.append('lp', '232');
      apiFormData.append('name', formData.imie.trim());
      apiFormData.append('tel', formData.telefon.trim());
      apiFormData.append('street-address', formData.adres.trim());

      const tmfpInput = document.querySelector('input[name="tmfp"]') as HTMLInputElement | null;
      if (!tmfpInput || !tmfpInput.value) {
        apiFormData.append('ua', navigator.userAgent);
      }

      const response = await fetch('https://offers.supertrendaffiliateprogram.com/forms/api/', {
        method: 'POST',
        body: apiFormData,
      });

      if (response.ok) {
        const responseData = await response.text();
        const orderId = `MSK${Date.now()}`;

        console.log('✅ API response OK, order ID:', orderId);

        const orderData = {
          ...formData,
          orderId,
          product: 'Drone EyeSky Snap X con Telecamera HD',
          price: 299.00,
          apiResponse: responseData
        };

        localStorage.setItem('orderData', JSON.stringify(orderData));
        console.log('✅ Order data saved to localStorage:', orderData);

        window.location.href = '/ty-pl';
      } else {
        console.error('API Error:', response.status, response.statusText);
        alert('Si è verificato un errore durante l\'invio dell\'ordine. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Errore di connessione. Controlla la connessione internet e riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <input type="hidden" name="tmfp" />



      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white text-center py-2 px-4">
        <div className="flex items-center justify-center space-x-4 text-sm font-medium">
          <span>🔥 OFFERTA LIMITATA - Solo oggi a prezzo speciale!</span>
        </div>
      </div>

      <section className="bg-white py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-1">
              <div className="relative">
                <img
                  src="/images/drone/img_princ.png"
                  alt="Drone EyeSky Snap X con Telecamera 4K"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  SCONTO 50%
                </div>
              </div>
            </div>

            <div className="order-2 space-y-6">
              <div className="flex items-center space-x-2">
                <StarRating rating={5} size="w-5 h-5" />
                <span className="text-yellow-600 font-medium">4.9</span>
                <span className="text-gray-600">(1.254 recensioni)</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                🚁 Drone EyeSky Snap X - Telecamera HD 4K Ultra
              </h1>

              <p className="text-lg text-gray-700 font-medium">
                <strong>Il drone più avanzato per riprese aeree spettacolari: telecamera 4K stabilizzata, controllo remoto intelligente e volo autonomo per catturare momenti indimenticabili.</strong>
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base">📹 <strong>Telecamera 4K Ultra HD</strong> – Video e foto professionali dall'alto</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base">🔄 <strong>Stabilizzazione Gimbal</strong> – Video fluidi senza vibrazioni</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base">🛫 <strong>90 Minuti di Volo</strong> – 2 Batterie potenti per lunghe sessioni aeree</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base">📱 <strong>App Smart Control</strong> – Controllo avanzato tramite smartphone</span>
                </div>
              </div>

              {/* RIQUADRO OFFERTA COLORATO */}
              <div style={{
                fontFamily: 'sans-serif',
                background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
                padding: '25px',
                borderRadius: '20px',
                maxWidth: '650px',
                margin: 'auto',
                textAlign: 'left',
                boxShadow: '0 20px 40px rgba(30, 64, 175, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Elemento decorativo */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  zIndex: 1
                }}></div>
                
                <h2 style={{
                  color: '#ffffff',
                  fontSize: '22px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  zIndex: 2,
                  position: 'relative'
                }}>
                  🚁 Drone EyeSky Snap X - Telecamera 4K Ultra HD - Compatto e Professionale
                </h2>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '16px',
                  flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <span style={{ flex: '1 1 70%', color: '#ffffff', fontWeight: '500' }}>📹 Telecamera 4K Ultra HD: Foto e video ad alta risoluzione con stabilizzazione avanzata</span>
                  <span style={{
                    color: '#ff4444',
                    textDecoration: 'line-through',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>899,99 €</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '16px',
                  flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <span style={{ flex: '1 1 70%', color: '#ffffff', fontWeight: '500' }}>✨ Controllo gestuale e vocale: Pilotaggio intuitivo con comandi semplici</span>
                  <span style={{
                    color: '#90EE90',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>✔ Incluso</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '16px',
                  flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <span style={{ flex: '1 1 70%', color: '#ffffff', fontWeight: '500' }}>📱 App GPS intelligente: Modalità follow-me e ritorno automatico alla base</span>
                  <span style={{
                    color: '#90EE90',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>✔ Incluso</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  borderBottom: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '16px',
                  flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  marginBottom: '10px'
                }}>
                  <span style={{ flex: '1 1 70%', color: '#ffffff', fontWeight: '500' }}>🎮 Kit completo incluso: Valigia professionale, batterie extra, eliche di ricambio</span>
                  <span style={{
                    color: '#90EE90',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>✔ Incluso</span>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderLeft: '4px solid #90EE90',
                  padding: '12px 15px',
                  margin: '15px 0',
                  fontSize: '15px',
                  color: '#ffffff',
                  borderRadius: '5px',
                  fontWeight: '500'
                }}>
                  🚚 <strong>Spedizione gratuita</strong> in tutta Italia (consegna in 3-4 giorni lavorativi)
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderLeft: '4px solid #90EE90',
                  padding: '12px 15px',
                  margin: '15px 0',
                  fontSize: '15px',
                  color: '#ffffff',
                  borderRadius: '5px',
                  fontWeight: '500'
                }}>
                  💶 <strong>Pagamento alla consegna</strong> disponibile
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
                  padding: '20px',
                  margin: '25px 0',
                  textAlign: 'center',
                  borderRadius: '12px',
                  fontSize: '22px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  border: '2px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 8px 16px rgba(34, 197, 94, 0.2)'
                }}>
                  Prezzo di listino: <span style={{ textDecoration: 'line-through', color: '#ff6b6b' }}>899,99 €</span><br />
                  <div style={{ marginTop: '15px' }}>
                    Solo oggi: <span style={{ fontSize: '28px', color: '#00ff88', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>299,00 €</span>
                  </div>
                </div>

                <div style={{
                  textAlign: 'center',
                  color: '#ffffff',
                  fontWeight: '500',
                  background: 'rgba(255,99,99,0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  ⏳ <strong>Offerta valida solo per pochi giorni!</strong><br />
                  Approfitta prima che torni al prezzo pieno.
                </div>

                <div style={{
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '15px',
                  background: 'rgba(255,255,255,0.9)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    color: '#333333',
                    fontSize: '14px',
                    marginBottom: '5px'
                  }}>⏰ Tempo rimasto per l'offerta:</div>
                  <div style={{
                    color: '#dc2626',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    <CountdownTimer />
                  </div>
                </div>

                <div style={{
                  background: 'repeating-linear-gradient(45deg, rgba(255,215,0,0.3), rgba(255,215,0,0.3) 10px, rgba(255,235,59,0.2) 10px, rgba(255,235,59,0.2) 20px)',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  padding: '12px',
                  borderRadius: '10px',
                  margin: '15px 0',
                  fontSize: '15px',
                  border: '2px solid rgba(255,215,0,0.4)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                  ⚡ Ultimi pezzi disponibili in magazzino
                </div>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#ffffff', fontWeight: '400', opacity: '0.9' }}>
                  📦 Spedizione in 24/48h – Consegna garantita in 3-4 giorni
                </p>
              </div>

              <button
                onClick={handleOrderClick}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 shadow-lg transform hover:scale-105 animate-pulse-button"
              >
                🔥 ORDINA ADESSO - Pagamento alla Consegna
              </button>

              <DeliveryTracking />

              {/* Recensione evidenziata */}
              <div className="mt-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                {/* Layout con foto centrata verticalmente rispetto al testo */}
                <div className="flex items-center space-x-4">
                  <img
                    src="images/testim2.jpg"
                    alt="Marco R."
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1">
                    {/* Stelle sopra il testo, allineate a sinistra */}
                    <div className="mb-3">
                      <StarRating rating={5} size="w-4 h-4" />
                    </div>

                    <p className="text-gray-800 text-sm leading-relaxed mb-3">
                      "Ho acquistato questo drone 3 settimane fa e sono rimasto stupefatto! 🌟 La stabilizzazione è incredibile - niente più video mossi! Ho già girato diversi video per Instagram e YouTube. La qualità 4K è cinematografica e l'app di controllo è molto intuitiva. Miglior acquisto dell'anno!"
                    </p>

                    {/* Nome con checkmark blu */}
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                      <span className="font-bold text-gray-900 text-sm">Marco R.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ✨ Drone EyeSky Snap X – Tecnologia Avanzata per Riprese Aeree Spettacolari!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                <strong>Il Drone EyeSky Snap X</strong> combina tecnologia all'avanguardia con facilità d'uso per offrirti un'esperienza di volo unica e riprese di qualità professionale.
              </p>
              <p className="text-lg text-gray-700">
                Dotato di <strong>telecamera 4K Ultra HD stabilizzata</strong> e sistemi di controllo intelligenti, è perfetto per catturare momenti speciali, creare contenuti social e realizzare video mozzafiato.
              </p>
            </div>
            <div>
              <img
                src="/images/drone/drone_gif.gif"
                alt="Drone EyeSky Snap X in azione durante le riprese"
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
                src="/images/drone/img_body_1.png"
                alt="Caratteristiche avanzate del Drone EyeSky Snap X"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Caratteristiche Principali
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-lg">
                    <strong>Telecamera 4K Ultra HD:</strong> Cattura video e foto in risoluzione Ultra HD 4K con dettagli cristallini, perfetta per content creator e appassionati di fotografia aerea.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-lg">
                    <strong>Stabilizzazione Avanzata:</strong> Sistema gimbal elettronico che garantisce riprese fluide e stabili eliminando vibrazioni e oscillazioni durante il volo.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-lg">
                    <strong>App Smart Control:</strong> Controllo completo tramite smartphone con GPS integrato, modalità follow-me, waypoint navigation e ritorno automatico.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-lg">
                    <strong>Kit Accessori Completo:</strong> Valigia da trasporto resistente, 2 batterie ricaricabili, set eliche di ricambio, caricatore USB e manuale d'uso illustrato.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-lg">
                    <strong>Assistenza Completa:</strong> Supporto tecnico gratuito via chat, email e telefono, plus video tutorial online per imparare tecniche di volo avanzate.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Volo Intuitivo e Risultati Professionali
            </h2>
            <p className="text-lg text-gray-700">
              Scopri come il Drone EyeSky Snap X trasforma le tue idee creative in riprese aeree spettacolari con tecnologia all'avanguardia e controlli semplificati.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="/images/drone/img_body_2.png"
                alt="Drone EyeSky Snap X durante il volo"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">📹</div>
                  <h3 className="font-bold text-lg mb-2">Precisione</h3>
                  <p className="text-gray-600">GPS avanzato per voli precisi e manovre fluide.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4 bg-gradient-to-r from-slate-600 to-blue-600 bg-clip-text text-transparent">🚁</div>
                  <h3 className="font-bold text-lg mb-2">Versatilità</h3>
                  <p className="text-gray-600">Multiple modalità di volo per principianti ed esperti.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">🕒</div>
                  <h3 className="font-bold text-lg mb-2">Facile Setup</h3>
                  <p className="text-gray-600">Pronto al volo in meno di 2 minuti dall'accensione.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">📚</div>
                  <h3 className="font-bold text-lg mb-2">Supporto</h3>
                  <p className="text-gray-600">Assistenza tecnica dedicata e community online.</p>
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
              Perché il Drone EyeSky Snap X è Superiore alla Concorrenza
            </h2>
            <p className="text-lg text-gray-700">
              A differenza di altri droni, offre tecnologia 4K professionale, controlli intelligenti e supporto completo, garantendo un'esperienza di volo superiore e risultati eccezionali.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-8 overflow-x-auto">
            <div className="min-w-full">
              <div className="hidden md:grid md:grid-cols-3 gap-4 text-center mb-4">
                <div></div>
                <div className="font-bold text-lg">Drone EyeSky Snap X</div>
                <div className="font-bold text-lg">Altri Droni</div>
              </div>

              {[
                'Qualità 4K',
                'Stabilizzazione',
                'GPS Avanzato',
                'Assistenza',
                'Rapporto Qualità/Prezzo'
              ].map((feature, index) => (
                <div key={index} className="border-b border-gray-200 py-4">
                  <div className="md:hidden">
                    <div className="font-medium text-lg mb-3">{feature}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="font-medium text-green-600 mb-1">EyeSky Snap X</div>
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="font-medium text-red-600 mb-1">Altri</div>
                        <span className="text-red-600 text-xl">✗</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-3 gap-4 py-3">
                    <div className="font-medium">{feature}</div>
                    <div className="text-center">
                      <Check className="w-6 h-6 text-green-600 mx-auto" />
                    </div>
                    <div className="text-center">
                      <span className="text-red-600 text-xl">✗</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ResultsSection />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Domande Frequenti sul Drone EyeSky Snap X
            </h2>
            <p className="text-lg text-gray-700">
              Tutte le risposte che cerchi per un acquisto sicuro e consapevole.
            </p>
          </div>

          <div className="space-y-4">
            <FAQ
              question="Quanto è facile da pilotare per un principiante?"
              answer="Il Drone EyeSky Snap X è dotato di modalità principiante con controlli semplificati, stabilizzazione automatica e funzioni di sicurezza che rendono il volo intuitivo anche per chi inizia."
            />
            <FAQ
              question="Cosa include il kit completo?"
              answer="Il kit include: drone EyeSky Snap X, radiocomando, 2 batterie ricaricabili, caricatore USB, set eliche di ricambio, valigia da trasporto e manuale d'uso illustrato."
            />
            <FAQ
              question="Che autonomia ha la batteria?"
              answer="Ogni batteria garantisce fino a 45 minuti di volo continuo. Con le 2 batterie incluse puoi volare per 90 minuti totali, ideale per lunghe sessioni di ripresa."
            />
            <FAQ
              question="Come funziona l'assistenza tecnica?"
              answer="Offriamo supporto tecnico gratuito via email, chat e telefono, plus una libreria di video tutorial online e una community dedicata per consigli e trucchi di volo."
            />
            <FAQ
              question="Il drone è resistente al vento?"
              answer="Sì, il sistema di stabilizzazione avanzato e i motori potenti permettono voli stabili anche con venti moderati fino a 25 km/h, garantendo riprese fluide in diverse condizioni."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <StarRating rating={5} size="w-6 h-6" />
              <span className="text-2xl font-bold">4.9/5</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Recensioni Verificate dei Nostri Clienti
            </h2>
            <p className="text-lg text-gray-700">
              Opinioni autentiche di chi ha già scelto il Drone EyeSky Snap X
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Marco R.",
                rating: 5,
                review: "Questo drone ha trasformato la mia passione per la fotografia! 🚁 La qualità video 4K è incredibile e i controlli sono così intuitivi. Perfetto per i miei viaggi e le riprese social!"
              },
              {
                name: "Giulia T.",
                rating: 4,
                review: "Facile da usare anche per chi inizia. La modalità principiante è perfetta per imparare senza stress. Ottimo rapporto qualità-prezzo!"
              },
              {
                name: "Alessandro M.",
                rating: 5,
                review: "Incredibile stabilità di volo! Ho girato video professionali per il mio canale YouTube. La batteria dura davvero 45 minuti per sessione."
              },
              {
                name: "Sofia B.",
                rating: 4,
                review: "Le funzioni GPS e follow-me sono fantastiche per i video di sport. Consiglio vivamente questo drone!"
              },
              {
                name: "Luca V.",
                rating: 5,
                review: "Drone fantastico, ma il servizio clienti è ancora migliore. Mi hanno aiutato con ogni domanda e dubbio."
              },
              {
                name: "Francesca D.",
                rating: 5,
                review: "Acquisto perfetto per content creator! La qualità delle riprese aeree è cinematografica, ideale per ogni progetto creativo!"
              },
              {
                name: "Davide S.",
                rating: 4,
                review: "Davvero utile per le mie escursioni! Ho ripreso paesaggi mozzafiato che non avrei mai potuto catturare prima. La valigia è molto pratica."
              },
              {
                name: "Chiara L.",
                rating: 5,
                review: "Non posso più farne a meno! La funzione ritorno automatico mi ha salvato più volte quando perdevo l'orientamento."
              },
              {
                name: "Andrea P.",
                rating: 5,
                review: "Perfetto per chi ama catturare momenti unici dall'alto. Dopo mesi di uso intensivo funziona ancora perfettamente, qualità top!"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 mb-3">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-gray-600">Acquisto Verificato</span>
                </div>
                <p className="text-gray-700 mb-3">{review.review}</p>
                <p className="font-medium text-gray-900">- {review.name}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg border-l-4 border-yellow-400">
            <div className="flex items-start space-x-4">
              <img
                src="https://cosedicase.com/cdn/shop/files/e76d708b-f0b3-4c06-a0db-d2f9f235e260.webp?v=1749027133&width=70"
                alt="Anna K."
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <StarRating rating={5} />
                  <span className="font-medium">Marco R.</span>
                  <span className="text-sm text-gray-600">Acquisto Verificato</span>
                </div>
                <p className="text-gray-700">
                  "Questo drone ha completamente trasformato la mia passione per la fotografia! 🚁 La qualità video 4K è semplicemente incredibile e cattura dettagli che non avrei mai immaginato. I controlli sono così intuitivi che anche mia moglie è riuscita a pilotarlo al primo tentativo. Il supporto clienti è sempre disponibile e competente. Non potrei essere più soddisfatto del mio acquisto!"
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
              Garanzia Soddisfatti o Rimborsati 30 Giorni
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Prova il Drone EyeSky Snap X in completa sicurezza con la nostra garanzia di rimborso di 30 giorni. Sperimenta la qualità delle riprese aeree senza rischi e scopri come può trasformare la tua creatività.
            </p>
            <p className="text-xl font-bold text-green-600">
              Se non sei completamente soddisfatto, ti rimborsiamo l'intero importo.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perché Scegliere Noi?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Codice di tracciamento per ogni ordine</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Pagamento direttamente alla consegna</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Assistenza 24 ore su 24, 7 giorni su 7</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Nessun costo nascosto!</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-4">SPEDIZIONE</h3>
              <p className="text-gray-700 mb-4">
                Spediamo in tutta Italia e se l'ordine viene effettuato entro le 21:59, verrà spedito il giorno lavorativo successivo.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Consegnato in 3-4 giorni lavorativi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Codice di tracciamento incluso</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Venduto esclusivamente da <strong>Newheras</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            🔥 Non Perdere Questa Offerta Speciale!
          </h2>
          <p className="text-xl mb-8">
            Solo oggi: <span className="line-through opacity-75 text-red-500">899,99 €</span> <span className="text-5xl font-bold text-green-500">299,00 €</span>
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/20 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">2,847+</div>
                <div className="text-sm opacity-90">Clienti Soddisfatti</div>
              </div>
              <div>
                <Package className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">98.7%</div>
                <div className="text-sm opacity-90">Indice di Soddisfazione</div>
              </div>
              <div>
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">24/7</div>
                <div className="text-sm opacity-90">Assistenza Clienti</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleOrderClick}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 shadow-xl transform hover:scale-105 mb-4 w-full md:w-auto"
          >
            🛒 ORDINA ORA - ULTIMI PEZZI DISPONIBILI
          </button>

          <p className="text-sm opacity-90">
            ⚡ Offerta limitata nel tempo • 🚚 Spedizione gratuita • 💯 Garanzia 30 giorni
          </p>
        </div>
      </section>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30" style={{
        transform: showStickyButton ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <button
          onClick={handleOrderClick}
          className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 shadow-lg transform hover:scale-105 ${bounceAnimation ? 'animate-bounce' : ''
            }`}
        >
          🔥 ORDINA ORA - Pagamento alla Consegna
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

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 pr-8">Compila per Ordinare</h3>
            <p className="text-gray-600 mb-4 md:mb-6">Pagamento alla consegna</p>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Riepilogo ordine</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/images/drone/img_princ.png"
                  alt="Maszyna do Szycia"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base">Drone EyeSky Snap X con Telecamera 4K</div>
                  <div className="text-xs md:text-sm text-gray-600">Compatto, Potente, Facilissimo da Usare</div>
                  <div className="text-xs md:text-sm text-green-600">✅ Spedizione gratuita</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-lg md:text-xl text-green-600">299,00 €</div>
                  <div className="text-xs text-red-500 line-through">899,99 €</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 md:mb-6">
              <div className="text-center">
                <div className="text-xs text-red-600 mb-1">🔒 Stiamo riservando il tuo ordine</div>
                <div className="text-xl md:text-2xl font-mono font-bold text-red-700">
                  {reservationTimer.minutes.toString().padStart(2, '0')}:{reservationTimer.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  Tempo rimasto per completare l'ordine
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome *</label>
                <input
                  type="text"
                  value={formData.imie}
                  onChange={(e) => handleFormChange('imie', e.target.value)}
                  className={`w-full px-3 py-3 md:py-2 border rounded-md focus:outline-none focus:ring-2 text-base ${formErrors.imie
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                    }`}
                  placeholder="Il tuo nome e cognome completo"
                />
                {formErrors.imie && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.imie}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero di Telefono *</label>
                <input
                  type="tel"
                  value={formData.telefon}
                  onChange={(e) => handleFormChange('telefon', e.target.value)}
                  className={`w-full px-3 py-3 md:py-2 border rounded-md focus:outline-none focus:ring-2 text-base ${formErrors.telefon
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                    }`}
                  placeholder="Il tuo numero di telefono"
                />
                {formErrors.telefon && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.telefon}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Completo *</label>
                <textarea
                  value={formData.adres}
                  onChange={(e) => handleFormChange('adres', e.target.value)}
                  className={`w-full px-3 py-3 md:py-2 border rounded-md focus:outline-none focus:ring-2 h-20 md:h-20 text-base resize-none ${formErrors.adres
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                    }`}
                  placeholder="Via, numero civico, città, codice postale"
                />
                {formErrors.adres && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.adres}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4 mt-4 text-gray-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium text-sm md:text-base">Pagamento alla consegna</span>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg transform hover:scale-105"
            >
              {isSubmitting ? 'ELABORAZIONE...' : 'CONFERMA ORDINE - 299,00 €'}
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
    </div>
  );
}