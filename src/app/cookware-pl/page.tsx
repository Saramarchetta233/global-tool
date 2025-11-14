'use client';

import { useState, useEffect } from 'react';
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
  Utensils,
  Flame,
  Thermometer,
  Award,
  Droplets
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

  // Get client IP for tracking
  getClientIP: async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      console.error('Error getting IP:', error);
      return '';
    }
  },

  // Get Facebook Click ID
  getFbClickId: (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    if (fbclid) {
      const timestamp = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;
      return `fb.1.${timestamp}.${fbclid}`;
    }

    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbc') {
        return decodeURIComponent(value);
      }
    }
    return '';
  },

  // Set Facebook Click ID
  setFbClickId: (): void => {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');

    if (fbclid) {
      const timestamp = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;
      const fbcValue = `fb.1.${timestamp}.${fbclid}`;

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90);

      document.cookie = `_fbc=${encodeURIComponent(fbcValue)}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}`;
    }
  },

  // Get Facebook Browser ID
  getFbBrowserId: (): string => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbp') return value;
    }
    return '';
  },

  // Hash data for PII compliance
  hashData: async (data: string): Promise<string> => {
    if (!data || typeof data !== 'string') return '';

    try {
      const normalizedData = data.toLowerCase().trim();

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
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      const difference = midnight.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setTimeout(() => {
      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-red-600 text-white text-center py-3 px-4 font-bold">
      <div className="flex items-center justify-center space-x-1 text-lg">
        <span>⏰ Oferta kończy się za:</span>
        <span className="bg-red-700 px-2 py-1 rounded mx-1">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span>:</span>
        <span className="bg-red-700 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span>:</span>
        <span className="bg-red-700 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

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

const FAQ = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
};

const StockIndicator = () => {
  const [stock, setStock] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock(prev => {
        const change = Math.random() > 0.7 ? -1 : 0;
        const newStock = Math.max(8, Math.min(18, prev + change));
        return newStock;
      });
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-3 rounded-lg text-center font-bold">
      <div className="flex items-center justify-center space-x-2">
        <AlertCircle className="w-5 h-5" />
        <span>Tylko {stock} sztuk pozostało w magazynie!</span>
      </div>
    </div>
  );
};

const ResultsSection = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              Dlaczego warto wybrać ten zestaw?
            </h2>
            
            <div className="space-y-8">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-40"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-60"></div>
                  <div className="absolute inset-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-80"></div>
                  <div className="absolute inset-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Utensils className="w-12 h-12 text-white z-10" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kompletny Zestaw</h3>
                <p className="text-gray-600">
                  12 części - wszystko czego potrzebujesz do gotowania w jednym zestawie
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-20"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-40"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-60"></div>
                  <div className="absolute inset-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full opacity-80"></div>
                  <div className="absolute inset-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Award className="w-12 h-12 text-white z-10" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Jakość</h3>
                <p className="text-gray-600">
                  Stal nierdzewna 18/10 - higieniczna i odporna na korozję przez lata
                </p>
              </div>

              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full opacity-20"></div>
                  <div className="absolute inset-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full opacity-40"></div>
                  <div className="absolute inset-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full opacity-60"></div>
                  <div className="absolute inset-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full opacity-80"></div>
                  <div className="absolute inset-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-12 h-12 text-white z-10" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Uniwersalność</h3>
                <p className="text-gray-600">
                  Kompatybilność z wszystkimi typami kuchenek - gaz, indukcja, ceramika, elektryczna
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-8">
            <img 
              src="/api/placeholder/500/400" 
              alt="Zestaw garnków ProSteel 12 w akcji" 
              className="w-full rounded-lg shadow-lg"
            />
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Gwarancja Satysfakcji</h4>
                  <p className="text-gray-600">30 dni na zwrot - bez pytań</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm">
                Jesteśmy pewni jakości naszych produktów. Jeśli nie będziesz w pełni usatysfakcjonowany, 
                zwrócimy Ci pieniądze w 100%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeliveryTracking = () => {
  const [deliveryDates, setDeliveryDates] = useState({
    orderDate: '',
    shipDate: '',
    deliveryStart: '',
    deliveryEnd: ''
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
        if (giorno !== 0 && giorno !== 6) count++;
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
      deliveryEnd: formatData(dataConsegnaFine)
    });
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-900 mb-4 text-center">📅 Harmonogram Dostawy</h3>
      
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

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ProSteel</h3>
            <p className="text-gray-400 text-sm">
              Wysokiej jakości naczynia kuchenne dla wymagających kucharzów.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Obsługa Klienta</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/contact" className="hover:text-white transition-colors">Kontakt</a></li>
              <li><a href="/shipping" className="hover:text-white transition-colors">Dostawa</a></li>
              <li><a href="/returns" className="hover:text-white transition-colors">Zwroty</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Informacje</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">O nas</a></li>
              <li><a href="/privacy" className="hover:text-white transition-colors">Polityka prywatności</a></li>
              <li><a href="/terms" className="hover:text-white transition-colors">Regulamin</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Śledź nas</h4>
            <div className="flex space-x-4 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 ProSteel. Wszelkie prawa zastrzeżone.
            </p>
            <div className="flex space-x-6">
              <a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Polityka prywatności</a>
              <a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Regulamin</a>
              <a href="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 max-w-4xl mx-auto">
            ProSteel to marka wysokiej jakości naczyń kuchennych ze stali nierdzewnej. 
            Wszystkie produkty objęte są gwarancją jakości i satysfakcji klienta.
          </div>
        </div>
      </div>
    </footer>
  );
};

const ProductCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    "/api/placeholder/600/600",
    "/api/placeholder/600/600", 
    "/api/placeholder/600/600",
    "/api/placeholder/600/600"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextImage = () => {
    setCurrentImage(prev => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage(prev => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImage(index);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl overflow-hidden shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={images[currentImage]}
          alt={`Zestaw garnków ProSteel 12 - widok ${currentImage + 1}`}
          className="w-full h-full object-cover transition-transform duration-300"
        />
        
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          ←
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
        >
          →
        </button>
      </div>
      
      <div className="flex justify-center space-x-2 p-4 bg-gray-50">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentImage ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function CookwareLanding() {
  const [mounted, setMounted] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [reservationTimer, setReservationTimer] = useState({ minutes: 5, seconds: 0 });
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [bounceAnimation, setBounceAnimation] = useState(false);

  const [formData, setFormData] = useState({
    imie: '',
    telefon: '',
    adres: '',
    uid: '',
    key: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({
    imie: '',
    telefon: '',
    adres: ''
  });

  useEffect(() => {
    setMounted(true);

    // Initialize tracking
    trackingUtils.setFbClickId();
    trackingUtils.initFacebookPixel();
    trackingUtils.initGoogleAds();
    trackingUtils.initGoogleAnalytics();

    // Load external script
    const script = document.createElement('script');
    script.src = 'https://cdn.trackingmore.com/js/load.js';
    script.async = true;
    document.head.appendChild(script);

    // Scroll handler for sticky button
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      const scrollPercentage = (scrollY / (documentHeight - windowHeight)) * 100;
      
      setShowStickyButton(scrollPercentage > 20);
    };

    window.addEventListener('scroll', handleScroll);

    // Bounce animation
    const bounceInterval = setInterval(() => {
      setBounceAnimation(true);
      setTimeout(() => setBounceAnimation(false), 1000);
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(bounceInterval);
    };
  }, []);

  useEffect(() => {
    if (!showOrderPopup) return;

    const timer = setInterval(() => {
      setReservationTimer(prev => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          setShowOrderPopup(false);
          return { minutes: 5, seconds: 0 };
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }

        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOrderPopup]);

  const handleOrderClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_ids: ['prosteel-12-cookware-set'],
        content_name: 'ProSteel 12 — 12-częściowy zestaw garnków ze stali nierdzewnej',
        value: 349.00,
        currency: 'PLN',
        num_items: 1
      });
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        event_category: 'ecommerce',
        event_label: 'ProSteel 12',
        value: 349.00
      });
    }

    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
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

    setFormErrors(errors);
    return isValid;
  };

  const handleOrderSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Hash sensitive data
      const hashedPhone = formData.telefon ? await trackingUtils.hashData(formData.telefon.replace(/\D/g, '')) : null;
      const hashedFirstName = formData.imie ? await trackingUtils.hashData(formData.imie.split(' ')[0]) : null;
      const hashedLastName = formData.imie && formData.imie.split(' ').length > 1 ? await trackingUtils.hashData(formData.imie.split(' ').slice(1).join(' ')) : null;

      const now = typeof window !== 'undefined' ? Math.floor(Date.now() / 1000) : 1694880000;

      // Facebook Purchase tracking
      if (typeof window !== 'undefined' && window.fbq) {
        try {
          const uniqueEventId = `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          window.fbq('track', 'Purchase', {
            content_type: 'product',
            content_ids: ['prosteel-12-cookware-set'],
            content_name: 'ProSteel 12 — 12-częściowy zestaw garnków ze stali nierdzewnej',
            value: 349.00,
            currency: 'PLN',
            num_items: 1
          }, {
            eventID: uniqueEventId
          });
        } catch (error) {
          console.error('Facebook tracking error:', error);
        }
      }

      // N8N webhook call
      const n8nResponse = await fetch('https://primary-production-625c.up.railway.app/webhook/CAPI-Meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: 'Purchase',
          event_id: `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: now,
          event_source_url: window.location.href,
          action_source: 'website',
          telefono_hash: hashedPhone,
          nome_hash: hashedFirstName,
          cognome_hash: hashedLastName,
          indirizzo: formData.adres || null,
          traffic_source: trackingUtils.getTrafficSource(),
          user_agent: navigator.userAgent,
          fbp: trackingUtils.getFbBrowserId(),
          fbc: trackingUtils.getFbClickId(),
          product_name: 'ProSteel 12 — 12-częściowy zestaw garnków ze stali nierdzewnej',
          value: 349.00,
          currency: 'PLN'
        })
      });

      // Get click_id for potential affiliate tracking
      const urlParams = new URLSearchParams(window.location.search);
      const clickId = urlParams.get('click_id');

      // Get tmfp value if present
      const tmfpInput = document.querySelector('input[name="tmfp"]') as HTMLInputElement | null;

      // Submit to main order processing endpoint
      const response = await fetch('https://leads-ingest.hidden-rain-9c8e.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.imie.trim(),
          tel: formData.telefon.trim(),
          'street-address': formData.adres.trim(),
          product_name: 'ProSteel 12 — 12-częściowy zestaw garnków ze stali nierdzewnej',
          price: '349,00 PLN',
          click_id: clickId,
          tmfp: tmfpInput?.value || '',
          uid: formData.uid,
          key: formData.key
        })
      });

      if (response.ok) {
        const result = await response.json();
        const orderId = typeof window !== 'undefined' ? `CWR${Date.now()}` : 'CWR1694880000000';

        // Store order data for thank you page
        localStorage.setItem('orderData', JSON.stringify({
          ...formData,
          orderId,
          product_name: 'ProSteel 12 — 12-częściowy zestaw garnków ze stali nierdzewnej',
          price: '349,00 PLN'
        }));

        // Google Ads conversion tracking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'conversion', {
            send_to: 'AW-17553726122/conversion_label',
            value: 349.00,
            currency: 'PLN',
            transaction_id: orderId
          });
        }

        // Redirect to thank you page
        window.location.href = '/ty-cookware-pl';
      } else {
        const errorText = await response.text();
        console.error('Order submission failed:', errorText);
        alert('Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Wystąpił błąd podczas składania zamówienia. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <input type="hidden" name="tmfp" />

        <div className="bg-red-600 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <span>🔥 OFERTA LIMITOWANA – Zniżka tylko dziś!</span>
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
                  <StarRating rating={5} size="w-5 h-5" />
                  <span className="text-yellow-600 font-medium">4.8</span>
                  <span className="text-gray-600">(342 opinii)</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  12-częściowy zestaw garnków ze stali nierdzewnej 18/10
                </h1>

                <p className="text-lg text-gray-700 font-medium">
                  <strong>Profesjonalna jakość do Twojej kuchni – równomierne nagrzewanie, trwałość na lata, elegancki design.</strong>
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">🔧 Stal nierdzewna 18/10</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">🔥 Grube dno kapsułowe</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">⚡ Na wszystkie kuchenki</span>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">👍 Ergonomiczne uchwyty</span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">💧 Łatwe czyszczenie</span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">✨ Elegancki design</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Stal nierdzewna 18/10</strong> – higieniczna, odporna na korozję i trwała przez lata użytkowania</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Grube, kapsułowe dno</strong> – równomierne rozprowadzanie ciepła, bez przypalania potraw</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Na wszystkie kuchenki</strong> – gaz, indukcja, ceramiczna, elektryczna - działa wszędzie</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Pokrywki ze szkła hartowanego</strong> – z odpowietrznikiem, pozwalają kontrolować gotowanie</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Miarki wewnątrz garnków</strong> – wygodne dozowanie płynów bez dodatkowych narzędzi</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Ergonomiczne, nitowane uchwyty</strong> – pewny chwyt i komfort użytkowania</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-base"><strong>Można myć w zmywarce</strong> – łatwe utrzymanie w czystości (patrz FAQ)</span>
                  </div>
                </div>

                {/* Pricing Section */}
                <div style={{
                  textAlign: 'center',
                  margin: '20px 0',
                  padding: '20px',
                  background: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{
                      color: 'red',
                      textDecoration: 'line-through',
                      fontSize: '20px',
                      marginRight: '10px'
                    }}>1 483,97 zł</span>
                  </div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                    marginBottom: '10px'
                  }}>
                    349,00 PLN
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                    Darmowa dostawa • Płatność przy odbiorze
                  </p>

                  <StockIndicator />
                  
                  <button
                    onClick={handleOrderClick}
                    className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg mt-4 ${bounceAnimation ? 'animate-bounce' : ''}`}
                  >
                    🛒 ZAMÓW TERAZ – Płatność przy odbiorze
                  </button>
                  
                  <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Gwarancja 30 dni</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4" />
                      <span>Darmowa dostawa</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <span>Płatność przy odbiorze</span>
                    </div>
                  </div>

                  <DeliveryTracking />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ResultsSection />

        {/* Social Proof Section */}
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Co mówią nasi klienci
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <StarRating rating={5} />
                  <span className="font-medium text-gray-900">Krzysztof P.</span>
                  <span className="text-gray-500 text-sm">Warszawa</span>
                </div>
                <p className="text-gray-700">
                  "Solidne wykonanie i świetna przewodność ciepła. Garnek nagrzewa się równomiernie, nic się nie przypala. Polecam!"
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <StarRating rating={5} />
                  <span className="font-medium text-gray-900">Marcin K.</span>
                  <span className="text-gray-500 text-sm">Kraków</span>
                </div>
                <p className="text-gray-700">
                  "Na indukcji działają bezbłędnie. Łatwe w czyszczeniu, elegancko wyglądają. Dobra inwestycja."
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <StarRating rating={5} />
                  <span className="font-medium text-gray-900">Adam Z.</span>
                  <span className="text-gray-500 text-sm">Gdańsk</span>
                </div>
                <p className="text-gray-700">
                  "Dobre pokrywki i wygodne uchwyty. Cały zestaw wart swojej ceny. Używam już 6 miesięcy."
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">4.8</div>
                  <div className="text-sm text-gray-600">Średnia ocen</div>
                  <StarRating rating={5} size="w-4 h-4" />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-600">Zadowolonych klientów</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">342</div>
                  <div className="text-sm text-gray-600">Opinii</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Zawartość zestawu
              </h2>
              <p className="text-lg text-gray-600">
                Kompletny zestaw do wszystkich potrzeb kuchennych
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">W zestawie znajdziesz:</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>Garnki w różnych rozmiarach z pokrywkami</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>Rondel z pokrywką</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>Patelnia uniwersalna</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>12 części łącznie - kompletny zestaw</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Dlaczego ProSteel?</h3>
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-blue-800 font-medium mb-2">
                      ✨ Jedna inwestycja na lata
                    </p>
                    <p className="text-blue-700 text-sm">
                      Gotowanie, duszenie, smażenie. Od codziennych posiłków po świąteczne menu - 
                      ten zestaw obsłuży wszystkie Twoje kulinarne potrzeby.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Często zadawane pytania
            </h2>

            <div className="space-y-4">
              <FAQ 
                question="Czy garnki nadają się na indukcję?"
                answer="Tak, dno kapsułowe ze stali nierdzewnej 18/10 współpracuje z płytami indukcyjnymi oraz wszystkimi innymi typami kuchenek (gaz, ceramika, elektryczne)."
              />
              <FAQ 
                question="Czy można myć w zmywarce?"
                answer="Tak, wszystkie elementy zestawu można myć w zmywarce. Używaj łagodnych środków myjących i unikaj agresywnych gąbek, aby zachować błyszczącą powierzchnię."
              />
              <FAQ 
                question="Czy można używać w piekarniku?"
                answer="Tak, elementy stalowe są odporne na wysokie temperatury. Sprawdź maksymalną temperaturę dla uchwytów i pokrywek w instrukcji obsługi."
              />
              <FAQ 
                question="Czy garnki mają miarki wewnątrz?"
                answer="Tak, większość garnków ma praktyczne podziałki wewnętrzne, które ułatwiają odmierzanie płynów podczas gotowania."
              />
              <FAQ 
                question="Jaka jest gwarancja?"
                answer="Oferujemy 30-dniową gwarancję satysfakcji - jeśli nie będziesz zadowolony z zakupu, zwrócimy Ci pieniądze bez żadnych pytań."
              />
            </div>
          </div>
        </section>

        {/* Delivery & Returns Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Darmowa dostawa</h3>
                <p className="text-gray-600 text-sm">Wysyłka w 3-4 dni robocze • Bez dodatkowych kosztów • Płatność przy odbiorze</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Wysyłka 24/48h</h3>
                <p className="text-gray-600 text-sm">Ekspresowe przygotowanie • Śledzenie przesyłki SMS • Dostawa door-to-door</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">30 dni na zwrot</h3>
                <p className="text-gray-600 text-sm">Gwarancja satysfakcji • Prosty proces zwrotu • Pełen zwrot kosztów</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Sticky Order Button */}
        {showStickyButton && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleOrderClick}
                className={`w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${bounceAnimation ? 'animate-bounce' : ''}`}
              >
                🛒 ZAMÓW TERAZ - 349,00 PLN
              </button>
            </div>
          </div>
        )}

        {/* Order Popup */}
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
                    src="/api/placeholder/64/64"
                    alt="Zestaw garnków ProSteel 12"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm md:text-base">🍳 ProSteel 12 — 12-częściowy zestaw garnków ze stali nierdzewnej</div>
                    <div className="text-xs md:text-sm text-gray-600">Stal nierdzewna 18/10, Na wszystkie kuchenki</div>
                    <div className="text-xs md:text-sm text-green-600">✅ Darmowa dostawa</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg md:text-xl text-gray-900">349,00 PLN</div>
                    <div className="text-xs text-gray-500 line-through">1 483,97 zł</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 md:mb-6">
                <div className="text-center">
                  <div className="text-xs text-red-600 mb-1">🔒 Rezerwujemy Twoje zamówienie</div>
                  <div className="text-xl md:text-2xl font-mono font-bold text-red-700">
                    {reservationTimer.minutes.toString().padStart(2, '0')}:{reservationTimer.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Pozostały czas na sfinalizowanie zamówienia
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
                {isSubmitting ? 'PRZETWARZANIE...' : 'POTWIERDŹ ZAMÓWIENIE - 349,00 PLN'}
              </button>
            </div>
          </div>
        )}

        <CountdownTimer />
      </div>
    </>
  );
}