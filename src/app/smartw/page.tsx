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
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2 text-red-600 font-bold text-lg">
      <Clock className="w-5 h-5" />
      <span>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
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

  const notifications = [
    { name: "Marco da Milano", action: "ha appena acquistato", time: "2 minuti fa" },
    { name: "Andrea da Roma", action: "ha aggiunto al carrello", time: "4 minuti fa" },
    { name: "Giuseppe da Napoli", action: "ha appena acquistato", time: "6 minuti fa" },
    { name: "Alessandro da Torino", action: "sta visualizzando", time: "1 minuto fa" },
  ];

  useEffect(() => {
    const showNotification = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
      setTimeout(() => {
        setCurrentNotification((prev) => (prev + 1) % notifications.length);
      }, 5000);
    };

    const interval = setInterval(showNotification, 8000);
    showNotification(); // Show immediately

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm transition-all duration-300 transform translate-y-0 opacity-100">
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
  const [stock, setStock] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setStock(prev => {
        const change = Math.random() > 0.7 ? -1 : 0;
        return Math.max(4, prev + change);
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

// Main Component
export default function SmartwatchLanding() {
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [reservationTimer, setReservationTimer] = useState({ minutes: 5, seconds: 0 });
  const [formData, setFormData] = useState({
    nome: '',
    telefono: '',
    indirizzo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let reservationInterval: NodeJS.Timeout;
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderClick = () => {
    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrderSubmit = async () => {
    if (!formData.nome || !formData.telefono || !formData.indirizzo) {
      alert('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Simula invio ordine - sostituisci con la tua API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect alla thank you page
      alert('Ordine confermato! Riceverai presto una chiamata per la conferma.');
      setShowOrderPopup(false);
    } catch (error) {
      console.error('Errore:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Social Proof Notification */}
      <SocialProofNotification />

      {/* Header with Urgency Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4">
        <div className="flex items-center justify-center space-x-4 text-sm font-medium">
          <span>🔥 OFFERTA LIMITATA - Scade tra:</span>
          <CountdownTimer />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-8 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Product Image - now first on mobile */}
            <div className="order-1">
              <div className="relative">
                <img
                  src="https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/7a28d35cf0c75b8b8ef7c4a9fdbe59b6.jpg?imageView2/2/w/800/q/70/format/webp"
                  alt="Smartwatch Resistente Pro"
                  className="w-full h-auto rounded-lg shadow-lg"
                />
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -58% OFF
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="order-2 space-y-6">
              {/* Reviews */}
              <div className="flex items-center space-x-2">
                <StarRating rating={5} size="w-5 h-5" />
                <span className="text-yellow-600 font-medium">4.8</span>
                <span className="text-gray-600">(523 recensioni)</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                ⌚ Smartwatch Resistente Pro – Chiamate, Fitness AI, 100+ Sport, Impermeabile IP68
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-gray-700 font-medium">
                <strong>Il compagno perfetto per il tuo stile di vita attivo con tecnologia AI avanzata.</strong>
              </p>

              {/* Benefits */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>📞 <strong>Chiamate wireless</strong> – Rispondi direttamente dal polso</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>🏃 <strong>100+ modalità sport</strong> – Monitora ogni attività</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>💧 <strong>Impermeabile IP68</strong> – Resistente a immersioni profonde</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>🤖 <strong>AI Voice Assistant</strong> – Controllo vocale intelligente</span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    ⌚ Smartwatch Resistente Pro – Tecnologia Avanzata al Polso
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>📞 Chiamate wireless Bluetooth integrate</span>
                      <span className="text-red-600 line-through font-bold">€119,99</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🏃 100+ modalità sportive con monitoraggio AI</span>
                      <span className="text-green-600 font-bold">✔ Incluso</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>💧 Resistenza IP68 - immersioni fino a 50m</span>
                      <span className="text-green-600 font-bold">✔ Incluso</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>🔋 Batteria 7 giorni + ricarica wireless</span>
                      <span className="text-green-600 font-bold">✔ Incluso</span>
                    </div>
                  </div>

                  <div className="bg-green-100 p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <Truck className="w-4 h-4" />
                      <span><strong>Spedizione Gratis</strong> in tutta Italia (3-4 giorni)</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span><strong>Pagamento alla consegna</strong> disponibile (+€2,99)</span>
                    </div>
                  </div>

                  <div className="bg-green-600 text-white p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm">Prezzo di listino:</div>
                      <div className="text-lg line-through text-red-200">€119,99</div>
                      <div className="text-sm">Oggi solo:</div>
                      <div className="text-3xl font-bold">€49,99</div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
                    <div className="text-red-800 font-bold text-sm">
                      ⏳ <strong>Offerta valida solo per pochi giorni!</strong><br />
                      Approfitta prima che torni a prezzo pieno.
                    </div>
                  </div>

                  <StockIndicator />
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleOrderClick}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
              >
                🛒 ORDINA ORA - SPEDIZIONE GRATUITA
              </button>

              {/* Delivery Timeline */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-center text-gray-700 mb-4">
                  Ordina <strong>ORA</strong> e riceverai il tuo pacco tra <strong>venerdì 26 lug e lunedì 29 lug</strong>
                </p>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-1">📦</div>
                    <div className="font-medium">Ordinato</div>
                    <div className="text-gray-500">gio, 25 lug</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🚚</div>
                    <div className="font-medium">Spedito</div>
                    <div className="text-gray-500">ven, 26 lug</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">📍</div>
                    <div className="font-medium">Consegnato</div>
                    <div className="text-gray-500">lun, 29 lug</div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Truck className="w-4 h-4" />
                  <span>Spedizione veloce</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento sicuro</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>30 giorni garanzia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ⌚ Scopri il Smartwatch Resistente Pro – Tecnologia Avanzata al Tuo Polso!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Il <strong>Smartwatch Resistente Pro</strong> è progettato per accompagnarti in ogni momento della giornata, dallo sport al lavoro.
              </p>
              <p className="text-lg text-gray-700">
                Con <strong>100+ modalità sportive</strong> e intelligenza artificiale integrata, monitora la tua salute e prestazioni in tempo reale.
              </p>
            </div>
            <div>
              <img
                src="https://img.kwcdn.com/product/fancy/e7f69b71-a5b7-46c7-b6a8-df5f3d6b3c5f.jpg?imageView2/2/w/800/q/70/format/webp"
                alt="Smartwatch in uso"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://img.kwcdn.com/product/fancy/e14c96b7-f7ca-4c67-8c88-0e98e5b6e9d9.jpg?imageView2/2/w/800/q/70/format/webp"
                alt="Caratteristiche dello smartwatch"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Caratteristiche principali
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Chiamate wireless integrate:</strong> Effettua e ricevi chiamate direttamente dal polso grazie al Bluetooth 5.0 avanzato.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>100+ modalità sportive:</strong> Monitora running, nuoto, ciclismo, yoga e molte altre attività con precisione professionale.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Resistenza IP68:</strong> Completamente impermeabile, resiste a immersioni fino a 50 metri di profondità.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>AI Voice Assistant:</strong> Controllo vocale intelligente per gestire chiamate, messaggi e app senza toccare lo schermo.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Batteria 7 giorni:</strong> Autonomia eccezionale con ricarica wireless rapida inclusa nella confezione.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tecnologia Intelligente per uno Stile di Vita Attivo
            </h2>
            <p className="text-lg text-gray-700">
              Scopri come questo smartwatch rivoluziona la tua routine quotidiana con funzioni avanzate e design resistente.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="https://img.kwcdn.com/product/fancy/46bb9c3f-3c19-45d8-94ba-8efc6c5e5b8c.jpg?imageView2/2/w/800/q/70/format/webp"
                alt="Smartwatch in azione"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4">📞</div>
                  <h3 className="font-bold text-lg mb-2">Chiamate</h3>
                  <p className="text-gray-600">Rispondi alle chiamate direttamente dal polso.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4">🏃</div>
                  <h3 className="font-bold text-lg mb-2">Fitness AI</h3>
                  <p className="text-gray-600">Monitoraggio intelligente per ogni sport.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4">💧</div>
                  <h3 className="font-bold text-lg mb-2">Impermeabile</h3>
                  <p className="text-gray-600">IP68: nuota, immergiti senza preoccupazioni.</p>
                </div>
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="text-4xl mb-4">🔋</div>
                  <h3 className="font-bold text-lg mb-2">Lunga Durata</h3>
                  <p className="text-gray-600">7 giorni di autonomia con una ricarica.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Mobile Optimized */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cosa Rende Unico il Smartwatch Resistente Pro
            </h2>
            <p className="text-lg text-gray-700">
              A differenza della concorrenza, offre chiamate wireless native, AI avanzata e resistenza militare, tutto a un prezzo imbattibile.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-8 overflow-x-auto">
            {/* Mobile-first table layout */}
            <div className="min-w-full">
              {/* Header - Hidden on mobile, shown on larger screens */}
              <div className="hidden md:grid md:grid-cols-3 gap-4 text-center mb-4">
                <div></div>
                <div className="font-bold text-lg">Smartwatch Resistente Pro</div>
                <div className="font-bold text-lg">Altri Smartwatch</div>
              </div>

              {/* Feature rows */}
              {[
                'Chiamate Wireless',
                'Resistenza IP68',
                'AI Voice Assistant',
                '100+ Sport',
                'Prezzo Conveniente'
              ].map((feature, index) => (
                <div key={index} className="border-b border-gray-200 py-4">
                  {/* Mobile layout */}
                  <div className="md:hidden">
                    <div className="font-medium text-lg mb-3">{feature}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="font-medium text-green-600 mb-1">Noi</div>
                        <Check className="w-6 h-6 text-green-600 mx-auto" />
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="font-medium text-red-600 mb-1">Altri</div>
                        <span className="text-red-600 text-xl">✗</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop layout */}
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

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src="https://img.kwcdn.com/product/fancy/75d8e2d3-c6e0-4e8f-ba1b-9c2f3a1d4e5f.jpg?imageView2/2/w/800/q/70/format/webp"
                alt="Risultati fitness"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Trasforma il Tuo Fitness con Risultati Eccezionali
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Miglioramento delle prestazioni sportive</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Monitoraggio salute più accurato</span>
                    <span className="text-sm font-medium">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Comodità nell'uso quotidiano</span>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Risposte alle Tue Domande Frequenti
            </h2>
            <p className="text-lg text-gray-700">
              Chiarezza e supporto per un acquisto sicuro.
            </p>
          </div>

          <div className="space-y-4">
            <FAQ
              question="Come funzionano le chiamate wireless?"
              answer="Lo smartwatch si connette al tuo telefono via Bluetooth 5.0 e ti permette di effettuare e ricevere chiamate direttamente dal polso con audio cristallino."
            />
            <FAQ
              question="È davvero impermeabile IP68?"
              answer="Sì, è certificato IP68 e resiste a immersioni fino a 50 metri. Puoi nuotare, fare la doccia e praticare sport acquatici senza problemi."
            />
            <FAQ
              question="Quanto dura la batteria?"
              answer="La batteria dura fino a 7 giorni con uso normale e fino a 3 giorni con uso intensivo. Include ricarica wireless rapida."
            />
            <FAQ
              question="È compatibile con iPhone e Android?"
              answer="Sì, è compatibile con tutti gli smartphone iOS (iPhone 6 e successivi) e Android (versione 5.0 e successive)."
            />
            <FAQ
              question="Cosa include la confezione?"
              answer="Smartwatch, cinturino in silicone, caricatore wireless, manuale d'uso in italiano e garanzia di 2 anni."
            />
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <StarRating rating={5} size="w-6 h-6" />
              <span className="text-2xl font-bold">4.8/5</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Le opinioni dei clienti sullo smartwatch
            </h2>
            <p className="text-lg text-gray-700">
              Feedback autentici e affidabili
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Marco R.",
                rating: 5,
                review: "Incredibile! 😍 Finalmente posso rispondere al telefono mentre sono in palestra. La qualità audio è cristallina e la batteria dura davvero una settimana!"
              },
              {
                name: "Alessandro T.",
                rating: 5,
                review: "Perfetto per il mio stile di vita attivo. L'ho usato in piscina, in montagna e al lavoro. Resistente e preciso!"
              },
              {
                name: "Giuseppe M.",
                rating: 4,
                review: "Ottimo rapporto qualità-prezzo. Le funzioni fitness sono molto accurate e l'AI voice è comoda da usare."
              },
              {
                name: "Andrea F.",
                rating: 5,
                review: "Mai avuto uno smartwatch così completo! Il monitoraggio del sonno è fantastico e le 100+ modalità sport sono utilissime."
              },
              {
                name: "Roberto L.",
                rating: 5,
                review: "Design elegante e funzioni top. Lo consiglio a tutti gli sportivi e non solo!"
              },
              {
                name: "Davide S.",
                rating: 4,
                review: "Funziona benissimo, molto intuitivo. La resistenza all'acqua è reale, l'ho testato in mare!"
              },
              {
                name: "Matteo P.",
                rating: 5,
                review: "Comodissimo per lavoro. Posso gestire chiamate e messaggi senza tirare fuori il telefono. Perfetto!"
              },
              {
                name: "Luca D.",
                rating: 5,
                review: "La funzione AI è impressionante. Capisce perfettamente i comandi vocali anche in ambienti rumorosi."
              },
              {
                name: "Simone B.",
                rating: 5,
                review: "Dopo 3 mesi di uso intensivo continua a funzionare perfettamente. Qualità costruttiva eccellente!"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 mb-3">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-gray-600">Acquirente Verificato</span>
                </div>
                <p className="text-gray-700 mb-3">{review.review}</p>
                <p className="font-medium text-gray-900">- {review.name}</p>
              </div>
            ))}
          </div>

          {/* Featured Review */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-lg border-l-4 border-yellow-400">
            <div className="flex items-start space-x-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=70&h=70&fit=crop&crop=face"
                alt="Marco R."
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <StarRating rating={5} />
                  <span className="font-medium">Marco R.</span>
                  <span className="text-sm text-gray-600">Acquirente Verificato</span>
                </div>
                <p className="text-gray-700">
                  "Questo smartwatch ha rivoluzionato la mia routine! 😍 Le chiamate wireless sono chiarissime, il monitoraggio fitness è preciso al 100% e la resistenza all'acqua è stata testata in ogni condizione. Non potrei essere più soddisfatto!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Garanzia di Rimborso di 30 Giorni
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Prova lo smartwatch in tutta sicurezza con la nostra garanzia di rimborso di 30 giorni. Sperimenta le funzioni avanzate, la resistenza e la comodità senza rischi.
            </p>
            <p className="text-xl font-bold text-green-600">
              Se non sei completamente soddisfatto, ti rimborsiamo l'intero importo.
            </p>
          </div>
        </div>
      </section>

      {/* Why Buy From Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perché acquistare da noi?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Numero di tracciabilità per ogni ordine</span>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Pagamenti direttamente alla consegna</span>
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
                Spediamo in tutta Italia e se l'ordine viene effettuato prima delle 21:59, l'ordine verrà spedito entro il giorno lavorativo successivo.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Consegnato in 3-4 giorni lavorativi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Compreso il numero di tracciabilità</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Venduto esclusivamente da <strong>TECHWEAR.COM</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            🔥 Non Perdere Questa Offerta Speciale!
          </h2>
          <p className="text-xl mb-8">
            Solo per oggi: <span className="line-through opacity-75">€119,99</span> <span className="text-5xl font-bold">€49,99</span>
          </p>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">4,523+</div>
                <div className="text-sm opacity-90">Clienti Soddisfatti</div>
              </div>
              <div>
                <Package className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">97.8%</div>
                <div className="text-sm opacity-90">Tasso di Soddisfazione</div>
              </div>
              <div>
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">24/7</div>
                <div className="text-sm opacity-90">Supporto Clienti</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleOrderClick}
            className="bg-white text-orange-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg mb-4 w-full md:w-auto"
          >
            🛒 ORDINA ORA - ULTIMI PEZZI DISPONIBILI
          </button>

          <p className="text-sm opacity-90">
            ⚡ Offerta limitata nel tempo • 🚚 Spedizione gratuita • 💯 Garanzia 30 giorni
          </p>
        </div>
      </section>

      {/* Sticky Bottom Bar - Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-orange-600 p-4 z-30">
        <button
          onClick={handleOrderClick}
          className="w-full bg-white text-orange-600 font-bold py-3 px-6 rounded-lg text-lg"
        >
          🛒 ORDINA ORA €49,99
        </button>
      </div>

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

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 pr-8">Compila per ordinare</h3>
            <p className="text-gray-600 mb-4 md:mb-6">Pagamento alla consegna</p>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Riepilogo ordine</h4>
              <div className="flex items-center gap-3">
                <img
                  src="https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/7a28d35cf0c75b8b8ef7c4a9fdbe59b6.jpg?imageView2/2/w/800/q/70/format/webp"
                  alt="Smartwatch Resistente Pro"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base">Smartwatch Resistente Pro</div>
                  <div className="text-xs md:text-sm text-gray-600">Chiamate, Fitness AI, 100+ Sport</div>
                  <div className="text-xs md:text-sm text-green-600">✅ Spedizione gratuita</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-lg md:text-xl text-gray-900">€49,99</div>
                  <div className="text-xs text-gray-500 line-through">€119,99</div>
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
                  Tempo rimanente per completare l'ordine
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleFormChange('nome', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  placeholder="Il tuo nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero di Telefono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleFormChange('telefono', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                  placeholder="Il tuo numero di telefono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Completo</label>
                <textarea
                  value={formData.indirizzo}
                  onChange={(e) => handleFormChange('indirizzo', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20 md:h-20 text-base resize-none"
                  placeholder="Via, numero civico, città, CAP"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4 mt-4 text-gray-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium text-sm md:text-base">Pagamento alla consegna</span>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={!formData.nome || !formData.telefono || !formData.indirizzo || isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg"
            >
              {isSubmitting ? 'ELABORANDO...' : 'CONFERMA ORDINE - €49,99'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}