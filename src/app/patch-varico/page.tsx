'use client';

declare global {
  interface Window {
    fbq: any;
  }
}

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Truck, Clock, Star, CheckCircle, CreditCard } from 'lucide-react';

const VeinoSealLanding = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [readersCount, setReadersCount] = useState(3847);
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 36, seconds: 32 });
  const [remainingStock] = useState(Math.floor(Math.random() * 21) + 10);
  const [stockPercentage, setStockPercentage] = useState(75);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [reservationTimer, setReservationTimer] = useState({ minutes: 5, seconds: 0 });
  const [formData, setFormData] = useState({
    nome: '',
    telefono: '',
    indirizzo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadersCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000 + Math.random() * 2000);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    const stockTimer = setInterval(() => {
      setStockPercentage(prev => {
        const increase = Math.random() > 0.7;
        if (increase && prev < 95) {
          return Math.min(95, prev + Math.floor(Math.random() * 3) + 1);
        }
        return prev;
      });
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      clearInterval(stockTimer);
    };
  }, []);

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

  const beforeAfterSlides = [
    {
      image: "/images/veinoseal/test-1.jpg",
      name: "Maria R., 52 anni",
      description: "2 settimane di trattamento"
    },
    {
      image: "/images/veinoseal/test-2.jpg",
      name: "Francesca M., 45 anni",
      description: "3 settimane di trattamento"
    },
    {
      image: "/images/veinoseal/test-3.jpg",
      name: "Anna P., 38 anni",
      description: "4 settimane di trattamento"
    }
  ];

  const testimonials = [
    {
      name: "Maria R.",
      age: "52 anni",
      image: "/images/testimonial/maria.png",
      text: "Stavo risparmiando per VenaSeal™ ma costava troppo. VeinoSeal Patch™ mi ha dato risultati incredibili in 2 settimane: vene completamente invisibili, come se avessi fatto il trattamento VIP da 6.000€.",
      rating: 5
    },
    {
      name: "Dr. Giuseppe T.",
      age: "Chirurgo Vascolare",
      image: "/images/veinoseal/giuseppe.png",
      text: "Conosco bene VenaSeal™, lo uso in clinica da anni. Non credevo che un cerotto potesse replicare quegli effetti. Ora lo consiglio anche ai miei pazienti che non possono permettersi il trattamento chirurgico.",
      rating: 5
    },
    {
      name: "Francesca M.",
      age: "45 anni",
      image: "/images/veinoseal/francesca.webp",
      text: "Sono un'estetista, seguo tutte le innovazioni del settore. VeinoSeal Patch™ è la vera svolta che aspettavamo: risultati da trattamento VIP senza i costi proibitivi.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "VeinoSeal Patch funziona davvero come VenaSeal™?",
      answer: "A differenza di VenaSeal™, VeinoSeal Patch NON è un intervento chirurgico ma un cerotto trans-dermico che agisce attraverso principi attivi avanzati. Stimola la chiusura delle vene varicose attraverso peptidi adesivi e delivery liposomiale, simulando l'effetto 'sigillante' senza iniezioni né anestesia."
    },
    {
      question: "Ha effetti collaterali come le iniezioni?",
      answer: "No, VeinoSeal Patch agisce solo topicamente attraverso la pelle. I peptidi adesivi sono progettati per targeting specifico del tessuto vascolare, senza rischi di flebite, infezioni o reazioni allergiche al polimero cianoacrilico."
    },
    {
      question: "È sicuro durante la gravidanza?",
      answer: "VeinoSeal Patch non contiene sostanze che entrano nel circolo sistemico. Tuttavia, come per qualsiasi prodotto cosmetico durante la gravidanza, consigliamo di consultare il medico prima dell'uso."
    },
    {
      question: "Quanto tempo serve per vedere i risultati?",
      answer: "La maggior parte delle donne riferisce i primi miglioramenti nella visibilità delle vene entro 8-12 ore. La riduzione significativa è visibile dalla prima settimana. I risultati ottimali si ottengono con 4 settimane di utilizzo costante."
    },
    {
      question: "Cosa succede se non funziona per me?",
      answer: "Offriamo una garanzia totale di rimborso entro 30 giorni. Se non sei completamente soddisfatta dei risultati, ti rimborsiamo l'intero importo senza domande. Il nostro tasso di successo è del 89%."
    }
  ];

  const trackInitiateCheckout = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'InitiateCheckout', {
          value: 99.80,
          currency: 'EUR',
          content_type: 'product',
          content_name: 'VeinoSeal Patch - Trattamento Completo',
          content_ids: ['veinoseal-complete'],
          num_items: 1
        });
        console.log('✅ InitiateCheckout event tracked');
      } catch (error) {
        console.error('❌ Error tracking InitiateCheckout event:', error);
      }
    }
  };

  const handleOrderClick = () => {
    trackInitiateCheckout();
    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
  };

  const getCookieValue = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const hashData = async (data: string): Promise<string | null> => {
    if (!data) return null;

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Errore durante l\'hashing:', error);
      return null;
    }
  };

  const cleanPhone = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('39')) return cleaned;
    if (cleaned.startsWith('3')) return '39' + cleaned;
    return cleaned;
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
      const cleanedPhone = cleanPhone(formData.telefono);
      const firstName = formData.nome.split(' ')[0];
      const lastName = formData.nome.split(' ').length > 1 ? formData.nome.split(' ').slice(1).join(' ') : '';

      const completeData = {
        ...formData,
        fbp: getCookieValue('_fbp'),
        fbc: getCookieValue('_fbc'),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: Math.floor(Date.now() / 1000),
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        event_name: 'Lead',
        event_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome_hash: await hashData(firstName),
        telefono_hash: await hashData(cleanedPhone),
        cognome_hash: lastName ? await hashData(lastName) : null,
        utm_source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') : null,
        utm_medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') : null,
        utm_campaign: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_campaign') : null,
        utm_content: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_content') : null,
        utm_term: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_term') : null,
        page_title: typeof document !== 'undefined' ? document.title : '',
        screen_resolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        product: 'VeinoSeal Patch - Trattamento Completo',
        price: 99.80,
        URL: 'https://network.worldfilia.net/manager/inventory/buy/ntm_veinoseal.json?api_key=5b4327289caa289c6117c469d70a13bd',
        source_id: '2da1cfad54d3',
        quantity: 1,
        api_key: '5b4327289caa289c6117c469d70a13bd',
        product_code: 'ntm_veinoseal_3x99'
      };

      const response = await fetch('https://primary-production-625c.up.railway.app/webhook/0b9ed794-a19e-4914-85fd-e4b3a401a489', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData)
      });

      if (response.ok) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('orderData', JSON.stringify({
            ...formData,
            orderId: `VNS${Date.now()}`,
            product: 'VeinoSeal Patch - Trattamento Completo',
            price: 99.80
          }));
        }

        if (typeof window !== 'undefined') {
          window.location.href = '/ty-veinoseal';
        }
      } else {
        throw new Error('Errore nell\'invio dell\'ordine');
      }
    } catch (error) {
      console.error('Errore:', error);
      alert('Si è verificato un errore. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breaking News Header */}
      <div className="bg-red-500 text-white py-2 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-xs sm:text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white">BREAKING NEWS</span>
              <span className="text-white hidden sm:inline">•</span>
              <span className="text-white animate-pulse">{readersCount.toLocaleString()} persone stanno leggendo questo articolo</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-50 animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <span className="mr-2">📅</span>
                <span>29 Giugno 2025</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">👁️</span>
                <span>948.463 visualizzazioni</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">⏱️</span>
                <span>4 min di lettura</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight px-2">
              IL "SUPER-COLLA" DA <span className="text-blue-600">6.000 €</span> PER VENE VARICOSE<br className="hidden md:block" />
              <span className="text-blue-600">DELLE STAR DI HOLLYWOOD</span> È STATO "CLONATO"
            </h1>

            <h2 className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium mb-8 leading-relaxed px-2">
              Ricercatori dell'ETH Zurigo rivelano la formula segreta dietro il trattamento VenaSeal™:
              <span className="font-bold text-blue-600"> ora disponibile come cerotto trans-dermico</span>
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 mx-2">
              <p className="text-gray-600 text-base md:text-lg font-medium">
                Costi VenaSeal™ in Italia: <span className="font-bold text-blue-600">5.000-6.000 €</span>
              </p>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-4 md:p-6 mb-8 mx-2">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                <span className="font-semibold">«È la rivoluzione estetica vascolare del decennio. Kristin Davis, modelle di Victoria's Secret, attrici di Hollywood:
                  centinaia di celebrità hanno trasformato il trattamento VenaSeal™ nel fenomeno più dirompente della medicina estetica.</span>
                Gli interventi per vene varicose nelle cliniche VIP sono aumentati del <span className="font-bold text-blue-600">+340% in 5 anni</span>,
                rendendo i chirurghi vascolari specializzati milionari con liste d'attesa di 8-12 mesi.
                Il "miracolo" funziona davvero: <span className="font-bold">eliminazione completa delle vene varicose in 30 minuti, gambe perfettamente lisce,
                  risultati che durano per sempre.</span>
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mt-4">
                <span className="font-semibold">Ma c'è un problema:</span> costa 5.000-6.000€, richiede anestesia locale,
                comporta rischi di flebite e complicazioni, e ha liste d'attesa interminabili.
                Il "sogno" era riservato solo ai ricchi e coraggiosi.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mt-4">
                <span className="font-semibold">Fino ad oggi.</span> Un team di ricercatori svizzeri dell'ETH Zurigo ha finalmente
                <span className="font-semibold text-blue-600"> "decodificato" la molecola che sigilla selettivamente le vene varicose</span>,
                replicando l'effetto del polimero cianoacrilico senza iniezioni né sala operatoria.»
              </p>
            </div>
          </div>

          <div className="grid gap-8 items-center">
            <div className="px-2">
              <img
                src="/images/veinoseal/first.webp"
                alt="VenaSeal vs VeinoSeal Patch"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12 px-2">
            <button
              onClick={handleOrderClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg md:text-xl transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              INIZIA IL TRATTAMENTO
            </button>
          </div>
        </div>
      </section>

      {/* Why VenaSeal Works */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center px-2">
            Perché VenaSeal™ Funziona (E Perché Tutte lo Vogliono)
          </h2>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 md:p-6 mb-8 mx-2">
            <p className="text-base md:text-lg text-gray-800 leading-relaxed">
              VenaSeal™ non è un normale trattamento per vene varicose. Agisce iniettando un polimero cianoacrilico direttamente nelle vene,
              "sigillandole" letteralmente dall'interno. I pazienti riferiscono di vedere le vene sparire istantaneamente, di sentire le gambe
              completamente lisce, di ritrovare la sicurezza di indossare gonne e shorts.
              Il risultato? <span className="font-bold">Chiusura definitiva delle vene varicose in 30 minuti, eliminazione completa dell'aspetto antiestetico, risultati permanenti.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 px-2">
            <div className="bg-gray-50 rounded-lg p-4 md:p-6">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4">I Risultati VenaSeal™:</h3>
              <ul className="space-y-3 text-gray-700 text-sm md:text-base">
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />Chiusura definitiva delle vene varicose in 30 minuti</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />Eliminazione completa dell'aspetto antiestetico</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />Gambe perfettamente lisce come quelle delle star</li>
                <li className="flex items-start"><CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />Risultati permanenti senza recidive</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4 md:p-6">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-4">Ma i Rischi Sono Reali:</h3>
              <ul className="space-y-3 text-gray-700 text-sm md:text-base">
                <li className="flex items-start"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 mt-1 flex-shrink-0"></span>Flebite post-procedurale (3-5% dei casi)</li>
                <li className="flex items-start"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 mt-1 flex-shrink-0"></span>Reazioni allergiche al polimero cianoacrilico</li>
                <li className="flex items-start"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 mt-1 flex-shrink-0"></span>Infezioni e cicatrici permanenti</li>
                <li className="flex items-start"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 mt-1 flex-shrink-0"></span>Anestesia locale con tutti i rischi annessi</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 md:p-6 mb-8 mx-2">
            <p className="text-gray-800 leading-relaxed text-sm md:text-base">
              <span className="font-bold">Ma c'era un problema:</span> VenaSeal™ costa tra 5.000€ e 6.000€, richiede anestesia locale,
              comporta rischi di complicazioni, e ha liste d'attesa di 8-12 mesi nelle cliniche più esclusive.
              <span className="font-bold text-red-600"> Per la prima volta nella storia della medicina estetica, esisteva qualcosa che funzionava davvero...
                ma era riservato solo a chi poteva permetterselo e rischiare.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Order Popup */}
      {showOrderPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-8 max-w-md w-full relative my-2 md:my-8 min-h-0 max-h-screen overflow-y-auto">
            <button
              onClick={() => setShowOrderPopup(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 text-2xl z-10 w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>

            <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 pr-8">Compila per ordinare</h3>
            <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">Pagamento alla consegna</p>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Riepilogo ordine</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/images/veinoseal/product.png"
                  alt="VeinoSeal Patch"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base">VeinoSeal Patch - Trattamento Completo</div>
                  <div className="text-xs md:text-sm text-gray-600">Quantità: 3 confezioni (12 settimane)</div>
                  <div className="text-xs md:text-sm text-green-600">✅ Spedizione gratuita</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-lg md:text-xl text-gray-900">€99,80</div>
                  <div className="text-xs text-gray-500 line-through">€149,70</div>
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
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Il tuo nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero di Telefono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleFormChange('telefono', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Il tuo numero di telefono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Completo</label>
                <textarea
                  value={formData.indirizzo}
                  onChange={(e) => handleFormChange('indirizzo', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 md:h-20 text-base resize-none"
                  placeholder="Via, numero civico, città, CAP"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4 mt-4 text-gray-700">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium text-sm md:text-base">Pagamento alla consegna</span>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={!formData.nome || !formData.telefono || !formData.indirizzo || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg"
            >
              {isSubmitting ? 'ELABORANDO...' : 'CONFERMA ORDINE - €99,80'}
            </button>
          </div>
        </div>
      )}

      {/* Scientific Breakthrough */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 px-2">
              La Svolta: Come VeinoSeal Patch™ Replica il "Miracolo"
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 px-2">
              I ricercatori dell'ETH Zurigo hanno identificato una combinazione di <span className="font-bold text-blue-600">peptidi adesivi bioattivi </span>
              che, applicati topicamente nella giusta concentrazione e biodisponibilità, <span className="font-bold">attivano gli stessi meccanismi di sigillatura del polimero cianoacrilico.</span>
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 inline-block mx-2">
              <p className="text-blue-800 font-semibold text-sm md:text-base">
                La differenza? Nessuna iniezione. Nessuna anestesia. Nessun rischio di complicanze.
                Solo <span className="font-bold">risultati visibili in 8-12 ore</span> al costo di un caffè al giorno.
              </p>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12 px-2">
            <button
              onClick={handleOrderClick}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg md:text-xl transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              INIZIA IL TRATTAMENTO
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof - Before/After Results */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-2">
              Test Studio su 2.800 Donne Europee
            </h2>
            <p className="text-lg md:text-xl text-blue-600 font-bold px-2">
              89% di riduzione visibilità vene varicose
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 px-2">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">89%</div>
              <p className="text-gray-700 text-xs md:text-base">Riduzione visibilità vene</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">92%</div>
              <p className="text-gray-700 text-xs md:text-base">Miglioramento texture</p>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">87%</div>
              <p className="text-gray-700 text-xs md:text-base">Soddisfazione generale</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-8 shadow-lg mx-2">
            <h3 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">Risultati Prima/Dopo</h3>

            <div className="relative">
              <div className="text-center">
                <img
                  src={beforeAfterSlides[currentSlide].image}
                  alt={'Prima e dopo - ' + beforeAfterSlides[currentSlide].name}
                  className="rounded-lg shadow-md w-full max-w-2xl mx-auto object-cover"
                />
                <div className="mt-4 space-y-2">
                  <p className="font-semibold text-gray-900 text-base md:text-lg">
                    {beforeAfterSlides[currentSlide].name}
                  </p>
                  <p className="text-gray-600 text-sm md:text-base">
                    {beforeAfterSlides[currentSlide].description}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {beforeAfterSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={'w-3 h-3 rounded-full transition-colors duration-200 ' +
                      (currentSlide === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400')
                    }
                    aria-label={'Mostra risultato ' + (index + 1)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2">I Risultati Parlano Chiaro</h2>
          <p className="text-center text-gray-600 mb-6 md:mb-8 px-2 text-sm md:text-base">
            Oltre 2.800 donne europee hanno già provato VeinoSeal Patch™ nei test preliminari
          </p>

          <div className="space-y-4 md:space-y-8 px-2">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mx-auto sm:mx-0 flex-shrink-0"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm md:text-base">{testimonial.name}</h4>
                        <span className="text-gray-500 text-xs md:text-sm">{testimonial.age}</span>
                      </div>
                      <div className="flex justify-center sm:justify-end mt-1 sm:mt-0">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 italic text-sm md:text-base leading-relaxed">"{testimonial.text}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Offer Section */}
      <section id="limited-offer" className="py-8 md:py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="mb-6">
            <div className="inline-block bg-yellow-500 text-black px-3 md:px-4 py-2 rounded-full font-bold text-xs md:text-sm mb-4">
              🚨 OFFERTA LANCIO LIMITATA
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-2 px-2">ATTENZIONE: Primi 100 Ordini</h3>
            <p className="text-blue-100 text-base md:text-lg px-2">
              3 Confezioni al Prezzo di 2 - Risparmio di €5.900 rispetto a VenaSeal™
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 md:p-6 mb-6 mx-2">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="order-2 md:order-1">
                <img
                  src="/images/veinoseal/product.png"
                  alt="VeinoSeal Patch Product"
                  className="w-full h-auto max-w-xs mx-auto object-contain rounded-lg"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="text-3xl md:text-5xl font-bold mb-2">€99,80</div>
                <div className="text-lg md:text-xl">3 Confezioni = 12 Settimane di Trattamento</div>
                <div className="text-sm text-blue-100 mt-2">
                  Invece di €6.000 di sala operatoria
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 md:p-6 mb-6 mx-2">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="text-xs text-blue-100 mb-2">LE VENDITE CHIUDONO IN:</div>
                  <div className="flex justify-center gap-2 text-xl md:text-3xl font-mono">
                    <div className="bg-white/20 px-2 py-1 rounded">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 px-2 py-1 rounded">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 px-2 py-1 rounded">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-xs text-blue-100 mt-2">ore : min : sec</div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="space-y-3">
                  <div className="text-sm md:text-base font-semibold">
                    🔥 Rimangono solo {remainingStock} confezioni
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 md:h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full animate-pulse shadow-lg transition-all duration-1000 ease-out"
                      style={{ width: stockPercentage + '%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-200">
                    ⚠️ Disponibilità quasi terminata
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <button
              onClick={handleOrderClick}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 md:py-6 px-6 md:px-8 rounded-lg text-lg md:text-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              ORDINA ADESSO - ULTIMI PEZZI
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg py-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>Garanzia 30 Giorni</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg py-2">
                <Truck className="w-4 h-4 flex-shrink-0" />
                <span>Spedizione Gratuita</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg py-2">
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span>Pagamento alla Consegna</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 px-2">Le Domande Più Frequenti</h2>

          <div className="space-y-4 px-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  className="w-full text-left p-4 md:p-6 flex justify-between items-start hover:bg-gray-50"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900 text-sm md:text-base pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6">
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 md:py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 px-2">⚠️ ULTIMA POSSIBILITÀ</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 px-2">
            Le scorte si stanno esaurendo. Non aspettare settembre per la prossima produzione.
          </p>

          <button
            onClick={handleOrderClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-lg text-lg md:text-xl transition-colors duration-300 shadow-lg w-full sm:w-auto mx-2"
          >
            ORDINA ORA - PRIMA CHE FINISCA
          </button>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <footer className="bg-gray-100 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-xs md:text-sm text-gray-600 space-y-3 md:space-y-4 px-2">
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Informazioni Legali e Disclaimer:</h3>

            <p><strong>Natura del Prodotto:</strong> VeinoSeal Patch è un dispositivo cosmetico per uso topico e non un dispositivo medico invasivo. Non è destinato a diagnosticare, trattare, curare o prevenire alcuna condizione medica.</p>

            <p><strong>Risultati Individuali:</strong> I risultati possono variare significativamente da persona a persona. Le testimonianze riportate sono esperienze individuali autentiche ma non garantiscono risultati identici per tutte le utilizzatrici.</p>

            <p><strong>Riferimenti a VenaSeal™:</strong> Tutti i riferimenti a VenaSeal™ sono utilizzati esclusivamente a scopo informativo e comparativo. VeinoSeal Patch non è affiliato con alcuna clinica di medicina estetica.</p>

            <p><strong>Responsabilità:</strong> L'utilizzo di VeinoSeal Patch è sotto la responsabilità dell'utilizzatrice. Consultare sempre un medico prima dell'uso se si hanno condizioni mediche preesistenti.</p>

            <p className="text-center font-semibold">Per ulteriori informazioni: info@veinoseal.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VeinoSealLanding;