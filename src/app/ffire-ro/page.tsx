'use client';

declare global {
  interface Window {
    fbq: any;
  }
}

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Shield, Star, Users, TrendingDown, Zap, CreditCard, Truck } from 'lucide-react';

const FatOnFireLanding = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 36, seconds: 32 });
  const [viewersCount, setViewersCount] = useState(847);
  const [remainingStock] = useState(Math.floor(Math.random() * 21) + 10); // Random between 10-30
  const [stockPercentage, setStockPercentage] = useState(75); // Start at 75%
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [reservationTimer, setReservationTimer] = useState({ minutes: 5, seconds: 0 });
  const [formData, setFormData] = useState({
    nume: '',
    telefon: '',
    adresa: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

    const viewersTimer = setInterval(() => {
      setViewersCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    // Stock percentage animation
    const stockTimer = setInterval(() => {
      setStockPercentage(prev => {
        const increase = Math.random() > 0.7; // 30% chance to increase
        if (increase && prev < 95) {
          return Math.min(95, prev + Math.floor(Math.random() * 3) + 1); // Increase by 1-3%
        }
        return prev;
      });
    }, 8000); // Every 8 seconds

    return () => {
      clearInterval(timer);
      clearInterval(viewersTimer);
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

  const scrollToOffer = () => {
    const offerSection = document.getElementById('limited-offer');
    if (offerSection) {
      offerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Funzione per tracciare l'inizio checkout
  const trackInitiateCheckout = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'InitiateCheckout', {
          value: 219.00,
          currency: 'RON',
          content_type: 'product',
          content_name: 'FatOnFire - Pachet Complet de Transformare',
          content_ids: ['fatonfire-complete'],
          num_items: 2
        });
        console.log('✅ InitiateCheckout event tracked');
      } catch (error) {
        console.error('❌ Error tracking InitiateCheckout event:', error);
      }
    }
  };

  const handleOrderClick = () => {
    // Traccia l'evento di inizio checkout
    trackInitiateCheckout();

    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
  };

  // Funzione per ottenere i cookie di Facebook
  const getCookieValue = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // Funzione per creare hash SHA256
  const hashData = async (data: string): Promise<string | null> => {
    if (!data) return null;

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Eroare la hashing:', error);
      return null;
    }
  };

  // Funzione per pulire il numero di telefono
  const cleanPhone = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('40')) return cleaned;
    if (cleaned.startsWith('0')) return '40' + cleaned;
    return cleaned;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrderSubmit = async () => {
    if (!formData.nume || !formData.telefon || !formData.adresa) {
      alert('Te rugăm să completezi toate câmpurile obligatorii.');
      return;
    }

    // Previeni invii multipli
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Prepara i dati per Meta con hashing
      const cleanedPhone = cleanPhone(formData.telefon);
      const firstName = formData.nume.split(' ')[0];
      const lastName = formData.nume.split(' ').length > 1 ? formData.nume.split(' ').slice(1).join(' ') : '';

      const completeData = {
        // Dati del form originali
        ...formData,

        // Dati Meta
        fbp: getCookieValue('_fbp'),
        fbc: getCookieValue('_fbc'),
        user_agent: navigator.userAgent,
        timestamp: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        referrer: document.referrer,
        event_name: 'Lead',
        event_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

        // Dati hashati
        nume_hash: await hashData(firstName),
        telefon_hash: await hashData(cleanedPhone),
        prenume_hash: lastName ? await hashData(lastName) : null,

        // Parametri UTM
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utm_content: new URLSearchParams(window.location.search).get('utm_content'),
        utm_term: new URLSearchParams(window.location.search).get('utm_term'),

        // Altri dati
        page_title: document.title,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,

        // Dati prodotto
        product: 'FatOnFire - Pachet Complet de Transformare',
        price: 199.90,

        // Dati API
        URL: 'https://network.worldfilia.net/manager/inventory/buy/sfn_fatonfire2x1_ro.json?api_key=5b4327289caa289c6117c469d70a13bd',
        source_id: '2da1cfad54d3',
        quantity: 2,
        api_key: '5b4327289caa289c6117c469d70a13bd',
        product_code: 'fatonfire_2x199'
      };

      // Invia dati all'API
      const response = await fetch('https://primary-production-625c.up.railway.app/webhook/0b9ed794-a19e-4914-85fd-e4b3a401a489', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData)
      });

      if (response.ok) {
        // Salva i dati nel localStorage per la thank you page
        localStorage.setItem('orderData', JSON.stringify({
          ...formData,
          orderId: `FAT${Date.now()}`,
          product: 'FatOnFire - Formula Avansată',
          price: 199.90
        }));

        // Redirect alla thank you page
        window.location.href = '/ty-ffire-ro';
      } else {
        throw new Error('Eroare la trimiterea comenzii');
      }
    } catch (error) {
      console.error('Eroare:', error);
      alert('A apărut o eroare. Te rugăm să încerci din nou mai târziu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funzione per i pulsanti CTA che aprono il popup
  const handleDirectOrder = () => {
    // Traccia l'evento di inizio checkout
    trackInitiateCheckout();

    // Apre il popup
    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-semibold">
        <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>ȘTIRI DE ULTIMĂ ORĂ • {viewersCount} persoane citesc acest articol acum
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            MEDICAMENTUL DE 100 MILIARDE CARE A FĂCUT HOLLYWOOD-UL SĂ SLĂBEASCĂ A FOST "COPIAT"
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-6">
            Cercetătorii elvețieni dezvăluie formula secretă din spatele fenomenului Ozempic®:
            <span className="text-red-600 font-semibold"> acum disponibilă ca supliment natural</span>
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>📅 29 Iunie 2025</span>
            <span>👁️ 948.463 vizualizări</span>
            <span>⏱️ 4 min de citit</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4">
        {/* News Article Intro */}
        <section className="mb-8">
          <img
            src="images/oz/azioni.jpg"
            alt="Cercetare științifică suplimente"
            className="w-full h-auto object-contain rounded-lg mb-6"
          />
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-4">
              Este povestea farmaceutică a secolului. <strong>Ozempic®, dezvoltat inițial pentru diabet</strong>, s-a
              transformat în fenomenul cel mai disruptiv din industria pierderii în greutate. Kim Kardashian, Elon Musk,
              Sharon Osbourne: <strong>sute de celebrități au admis că îl folosesc</strong>, declanșând o cursă globală
              care a făcut din Novo Nordisk cea mai valoroasă companie din Europa, cu o valoare de piață de peste 400 miliarde de dolari.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              <strong>Problema:</strong> Ozempic® costă peste 300€ pe lună, poate fi vândut doar cu rețetă medicală, necesită injecții săptămânale și are efecte
              secundare semnificative. Liste de așteptare de luni. Lipsă globală.
              <strong>"Miracolul" era rezervat doar bogaților.</strong>
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Până astăzi. <strong>O echipă de cercetători elvețieni
                ar fi în sfârșit "decifrat" mecanismul molecular din spatele Ozempic®</strong>, făcând astfel să se prăbușească acțiunile la bursă ale companiei farmaceutice. Descoperirea?
              <strong> Este posibil să obții aceleași efecte printr-o combinație specifică de compuși naturali</strong>
              care acționează asupra acelorași receptori GLP-1.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Rezultatul acestei cercetări este <strong>FatOnFire</strong>, primul supliment care replică mecanismul de acțiune
              al Ozempic fără injecții, fără prescripție medicală și la o fracțiune din cost.
              <strong>Se presupune că această revoluție a contribuit la prăbușirea recentă de 70% a acțiunilor Novo Nordisk</strong>,
              după ani de creștere neîntreruptă.
            </p>

            <p className="text-lg leading-relaxed mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <strong>⚠️ ATENȚIE:</strong> Nu vorbim despre obișnuitul "supliment arde-grăsimi" pe care l-ai încercat deja.
              FatOnFire folosește o tehnologie complet diferită, bazată pe modularea hormonilor satietății.
              <strong>Este prima adevărată alternativă științifică la Ozempic®.</strong>
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">De Ce Funcționează Ozempic® (Și De Ce Toată Lumea Îl Vrea)</h3>

            <p className="text-lg leading-relaxed mb-4">
              <strong>Ozempic® nu este un medicament obișnuit pentru slăbit.</strong> Acționează asupra receptorilor GLP-1 din creier,
              "stingând" literalmente foamea. Pacienții raportează că uită să mănânce, că <strong>simt dezgust
                pentru mâncarea nesănătoasă, că se simt sătui după câteva înghițituri.</strong>
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Rezultatele au fost <strong>devastatoare pentru industria fitness:</strong> săli de sport goale, vânzările de
              suplimente tradiționale s-au prăbușit cu 40%.
              <strong>Pentru prima dată în istorie, exista ceva care funcționa cu adevărat.</strong>
            </p>

            <img
              src="/images/fatonfire/vs-oz.jpg"
              alt="Impactul asupra industriei fitness"
              className="w-full h-auto object-contain rounded-lg mb-6"
            />

            <p className="text-lg leading-relaxed mb-6">
              Dar era o problemă: <strong>Ozempic® costă 3.600€ pe an</strong>.
            </p>

            <div className="text-center my-8">
              <button
                onClick={handleDirectOrder}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Începe Tratamentul
              </button>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Schimbarea: Cum FatOnFire Replică "Miracolul"</h3>

            <p className="text-lg leading-relaxed mb-6">
              Cercetătorii elvețieni au identificat o combinație de <strong>7 compuși naturali</strong> care,
              luați împreună în proporția și biodisponibilitatea corectă, <strong>activează aceiași receptori GLP-1 ca Ozempic®.</strong>
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Diferența? <strong>Nicio injecție. Nicio prescripție. Niciun efect secundar grav.</strong>
              Doar capsule de luat înainte de mesele principale. Costul? Mai puțin de 6,7 lei pe zi în loc de 50 lei.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 mb-8">
          <img
            src="/images/fatonfire/glp1_ro.png"
            alt="Formula FatOnFire"
            className="w-full h-auto object-contain rounded-lg mb-6"
          />
          <h3 className="text-3xl font-bold text-center mb-2">De Ce FatOnFire Este Diferit De Tot Ce Ai Încercat Vreodată</h3>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Nu este un alt "arde-grăsimi". Este prima replică naturală a tehnologiei Ozempic®
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🧠</div>
              <h4 className="font-bold text-gray-900 mb-2">Blochează Foamea la Nivel Cerebral</h4>
              <p className="text-gray-600 text-sm">Acționează asupra receptorilor GLP-1 ca Ozempic®, nu asupra termogenicilor obișnuiți</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Rezultate Vizibile în 72 Ore</h4>
              <p className="text-gray-600 text-sm">Reducere imediată a apetitului, nu promisiuni vagi</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🏆</div>
              <h4 className="font-bold text-gray-900 mb-2">Formulă Brevetată 7-în-1</h4>
              <p className="text-gray-600 text-sm">Combinație unică niciodată văzută în comerț</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">💉</div>
              <h4 className="font-bold text-gray-900 mb-2">Zero Injecții</h4>
              <p className="text-gray-600 text-sm">Aceleași mecanisme ca Ozempic® fără ace sau prescripții</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">1/10 din Costul Ozempic®</h4>
              <p className="text-gray-600 text-sm">6,7 lei/zi vs 50 lei/zi pentru medicamentul original</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🔬</div>
              <h4 className="font-bold text-gray-900 mb-2">Testat pe 1.200+ Persoane</h4>
              <p className="text-gray-600 text-sm">94% succes în testele preliminare elvețiene</p>
            </div>
          </div>

          <div className="mt-8 bg-red-100 border border-red-300 rounded-lg p-6">
            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <span>⚠️</span> IMPORTANT: Acesta Nu Este Un Supliment Obișnuit
            </h4>
            <p className="text-red-700">
              <strong>FatOnFire folosește aceeași cale metabolică ca un medicament de miliarde de dolari.</strong>
              Dacă ai încercat alte suplimente fără succes, nu înseamnă că acesta nu va funcționa.
              Este complet diferit de tot ce ai încercat până acum.
            </p>
          </div>
        </section>

        {/* Call to Action Button */}
        <div className="text-center my-8">
          <button
            onClick={handleDirectOrder}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Începe Tratamentul
          </button>
        </div>

        {/* Testimonials */}
        <section className="mb-8">
          <h3 className="text-3xl font-bold text-center mb-2">Rezultatele Vorbesc de la Sine</h3>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Peste 3.500 de europeni au încercat deja FatOnFire în testele preliminare
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="images/donna-1.webp"
                  alt="Maria P."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Maria P., 45 ani</div>
                  <div className="text-gray-500 text-sm">București</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Înainte</div>
                  <div className="font-bold text-red-600">92 kg</div>
                  <div className="text-xs text-gray-500 mt-1">După</div>
                  <div className="font-bold text-green-600">83 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Am aruncat 2.000 lei pe suplimente inutile. FatOnFire este diferit: în 3 zile am încetat să mă gândesc la mâncare continuu. Am slăbit 9 kg în 7 săptămâni fără să sufăr."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Rezultat verificat • Mărturie autentică
              </div>
            </div>

            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="/images/testimonial/marco.webp"
                  alt="Gheorghe T."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Gheorghe T., 52 ani</div>
                  <div className="text-gray-500 text-sm">Cluj</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Înainte</div>
                  <div className="font-bold text-red-600">78 kg</div>
                  <div className="text-xs text-gray-500 mt-1">După</div>
                  <div className="font-bold text-green-600">71 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Soția mea lua Ozempic® dar avea prea multe efecte secundare. FatOnFire i-a dat aceleași rezultate fără greață. Medicul nostru a rămas șocat."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Rezultat verificat • Mărturie autentică
              </div>
            </div>

            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="/images/testimonial/federica.png"
                  alt="Andreea M."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Andreea M., 38 ani</div>
                  <div className="text-gray-500 text-sm">Iași</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Înainte</div>
                  <div className="font-bold text-red-600">85 kg</div>
                  <div className="text-xs text-gray-500 mt-1">După</div>
                  <div className="font-bold text-green-600">76 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Sunt asistentă medicală, cunosc bine Ozempic®. Nu credeam că un supliment poate funcționa așa. Colegii mei mă întreabă ce iau."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Rezultat verificat • Mărturie autentică
              </div>
            </div>

            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="images/donna-2.webp"
                  alt="Laura L."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Laura L., 41 ani</div>
                  <div className="text-gray-500 text-sm">Constanța</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Înainte</div>
                  <div className="font-bold text-red-600">103 kg</div>
                  <div className="text-xs text-gray-500 mt-1">După</div>
                  <div className="font-bold text-green-600">91 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Trebuia să slăbesc din motive de sănătate dar Ozempic® costa prea mult. FatOnFire m-a salvat: -12 kg în 2 luni, glicemia perfectă, niciodată mai mult foame nervoasă."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Rezultat verificat • Mărturie autentică
              </div>
            </div>
          </div>

          <div className="mt-8 text-center bg-blue-50 rounded-lg p-6">
            <h4 className="font-bold text-xl mb-2">📊 Rezultatele Testului Clinic</h4>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">94%</div>
                <div className="text-sm text-gray-600">A slăbit semnificativ</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">87%</div>
                <div className="text-sm text-gray-600">A redus apetitul</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">96%</div>
                <div className="text-sm text-gray-600">L-ar recomanda</div>
              </div>
            </div>
          </div>
        </section>

        {/* Limited Offer */}
        <section id="limited-offer" className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-8 mb-8 text-center">
          <div className="mb-6">
            <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm mb-4">
              🚨 STOCURI LIMITATE
            </div>
            <h3 className="text-3xl font-bold mb-2">ATENȚIE: Stocul Aproape Epuizat</h3>
            <p className="text-red-100 text-lg">
              Din cauza cererii enorme după răspândirea știrii,
              stocurile se epuizează rapid
            </p>
          </div>

          <img
            src="images/fatonfire/product.webp"
            alt="Oferta FatOnFire"
            className="w-full h-auto object-contain rounded-lg mb-6"
          />

          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-5xl font-bold mb-2">219 LEI</div>

                <div className="text-xl">2 Cutii = 2 Luni Complete</div>
                <div className="text-sm text-red-100 mt-2">
                  În loc de 50 lei/zi pentru Ozempic® → Doar 6,7 lei/zi
                </div>
              </div>

              <div>
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="text-xs text-red-100 mb-2">VÂNZĂRILE SE ÎNCHID ÎN:</div>
                  <div className="flex justify-center gap-2 text-3xl font-mono">
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
                  <div className="text-xs text-red-100 mt-2">ore : min : sec</div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    🔥 Rămân doar {remainingStock} cutii
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full animate-pulse shadow-lg transition-all duration-1000 ease-out"
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-red-200">
                    ⚠️ Disponibilitate aproape terminată
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleOrderClick}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-6 px-8 rounded-lg text-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
            >
              COMANDĂ ACUM
            </button>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Garanție 30 Zile
              </div>
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" />
                Livrare Gratuită
              </div>
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Plată la Livrare
              </div>
            </div>

            <div className="text-xs text-red-100 mt-4">
              ⚠️ Odată epuizate stocurile, următoarea producție va fi disponibilă doar peste 4-6 săptămâni
            </div>
          </div>
        </section>

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

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 pr-8">Completează pentru a comanda</h3>
              <p className="text-gray-600 mb-4 md:mb-6">Plată la livrare</p>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Rezumatul comenzii</h4>
                <div className="flex items-center gap-3">
                  <img
                    src="images/fatonfire/product.webp"
                    alt="FatOnFire"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm md:text-base">FatOnFire - Formula Avansată</div>
                    <div className="text-xs md:text-sm text-gray-600">Cantitate: 2 cutii</div>
                    <div className="text-xs md:text-sm text-green-600">✅ Livrare gratuită</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg md:text-xl text-gray-900">219 LEI</div>
                    <div className="text-xs text-gray-500 line-through">549,90 lei</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 md:mb-6">
                <div className="text-center">
                  <div className="text-xs text-red-600 mb-1">🔒 Îți rezervăm comanda</div>
                  <div className="text-xl md:text-2xl font-mono font-bold text-red-700">
                    {reservationTimer.minutes.toString().padStart(2, '0')}:{reservationTimer.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Timp rămas pentru finalizarea comenzii
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nume și Prenume</label>
                  <input
                    type="text"
                    value={formData.nume}
                    onChange={(e) => handleFormChange('nume', e.target.value)}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder="Numele tău complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numărul de Telefon</label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => handleFormChange('telefon', e.target.value)}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder="Numărul tău de telefon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresa Completă</label>
                  <textarea
                    value={formData.adresa}
                    onChange={(e) => handleFormChange('adresa', e.target.value)}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20 md:h-20 text-base resize-none"
                    placeholder="Strada, numărul, orașul, codul poștal"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 mt-4 text-gray-700">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium text-sm md:text-base">Plată la livrare</span>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={!formData.nume || !formData.telefon || !formData.adresa || isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg"
              >
                {isSubmitting ? 'SE PROCESEAZĂ...' : 'CONFIRMĂ COMANDA - 219 LEI'}
              </button>
            </div>
          </div>
        )}

        {/* FAQ */}
        <section className="mb-8">
          <h3 className="text-3xl font-bold text-center mb-6">Întrebările Cele Mai Frecvente</h3>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">FatOnFire funcționează cu adevărat ca Ozempic®?</h4>
              <p className="text-gray-700 leading-relaxed">FatOnFire acționează asupra acelorași receptori GLP-1 ca Ozempic®, dar printr-o cale naturală. Testele preliminare pe 1.200+ persoane arată o reducere a apetitului de 70-80%, comparabilă cu medicamentul original. Diferența principală este metoda de administrare: orală în loc de injecție.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Este sigur? Sunt efecte secundare?</h4>
              <p className="text-gray-700 leading-relaxed">FatOnFire este formulat cu ingrediente naturale certificate și produs în fabrici GMP. Spre deosebire de Ozempic®, nu cauzează greață severă sau probleme gastrointestinale semnificative. Totuși, ca pentru orice supliment, este recomandabil să consulți medicul, mai ales dacă iei alte medicamente.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Cât timp este necesar pentru a vedea rezultatele?</h4>
              <p className="text-gray-700 leading-relaxed">Majoritatea utilizatorilor raportează o reducere a apetitului în 72-96 de ore. Pierderea în greutate vizibilă începe în general din a doua săptămână. Rezultatele optime se obțin cu o utilizare constantă de 8-12 săptămâni.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Ce se întâmplă dacă nu funcționează pentru mine?</h4>
              <p className="text-gray-700 leading-relaxed">Oferim o garanție totală de rambursare în 30 de zile. Dacă nu ești complet mulțumit de rezultate, îți rambursăm întreaga sumă fără întrebări. Rata noastră de succes este de 94%, dar înțelegem că fiecare persoană este diferită.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">⚠️ ULTIMA ȘANSĂ</h3>
            <p className="text-xl mb-6">
              Stocurile se epuizează. Nu aștepta septembrie pentru următoarea producție.
            </p>
            <button onClick={handleOrderClick} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 px-12 rounded-lg text-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl mb-4">
              COMANDĂ ACUM - ULTIMELE CUTII
            </button>
            <div className="text-sm">
              ✅ Garanție 30 zile • ✅ Livrare gratuită • ✅ Plată la livrare
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="bg-gray-50 rounded-lg p-6 text-xs text-gray-600">
          <h4 className="font-semibold mb-3 text-sm">Informații Legale și Disclaimer:</h4>

          <div className="space-y-3">
            <p>
              <strong>Natura Produsului:</strong> FatOnFire este un supliment alimentar notificat la Ministerul Sănătății și nu un medicament.
              Nu este destinat să diagnosticheze, să trateze, să vindece sau să prevină vreo boală. Informațiile conținute în această pagină
              sunt doar în scop informativ și nu înlocuiesc părerile unui medic calificat.
            </p>

            <p>
              <strong>Rezultate Individuale:</strong> Rezultatele pot varia semnificativ de la persoană la persoană în funcție de vârstă,
              sex, condiții de sănătate, stil de viață, dietă și alți factori. Mărturiile raportate sunt experiențe individuale
              autentice dar nu garantează rezultate identice pentru toți utilizatorii.
            </p>

            <p>
              <strong>Referințe la Ozempic®:</strong> Toate referințele la Ozempic® (semaglutidă) sunt folosite exclusiv în
              scop comparativ și informativ. FatOnFire nu este produs, aprobat sau afiliat cu Novo Nordisk. Ozempic® este o marcă
              înregistrată a Novo Nordisk A/S. FatOnFire acționează prin mecanisme similare dar prin ingrediente complet diferite.
            </p>

            <p>
              <strong>Utilizare și Dozaj:</strong> Nu depăși doza zilnică recomandată de 2 capsule. A se păstra departe de accesul
              copiilor sub 3 ani. Produsul nu trebuie considerat un substitut pentru o dietă variată și echilibrată
              și un stil de viață sănătos.
            </p>

            <p>
              <strong>Contraindicații:</strong> Nu utiliza în caz de sarcină, alăptare, diabet tip 1, tulburări
              alimentare grave, sau dacă iei medicamente pentru diabet fără supraveghere medicală. Consultă întotdeauna medicul
              înainte de utilizare dacă ai condiții medicale preexistente sau iei medicamente.
            </p>

            <p>
              <strong>Responsabilitate:</strong> Utilizarea FatOnFire este sub responsabilitatea utilizatorului. Se recomandă cu tărie
              să consulți un medic înainte de utilizare, mai ales în prezența condițiilor medicale preexistente. Nu suntem responsabili
              pentru o utilizare improprie a produsului sau pentru lipsa consultării medicale preliminare.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-300">
            <p className="text-center font-semibold">
              Pentru informații suplimentare: info@fatonfire.ro
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2025 FatOnFire România. Toate drepturile rezervate.</p>
          <div className="mt-4 space-x-4 text-sm">
            <a href="#" className="hover:text-gray-300">Politica de Confidențialitate</a>
            <a href="#" className="hover:text-gray-300">Termeni și Condiții</a>
            <a href="#" className="hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FatOnFireLanding;