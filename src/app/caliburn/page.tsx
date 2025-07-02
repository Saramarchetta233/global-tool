'use client';

declare global {
  interface Window {
    fbq: any;
  }
}

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Truck, Clock, Star, CheckCircle, CreditCard } from 'lucide-react';

const Caliburn = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [readersCount, setReadersCount] = useState(1247);
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
    { before: "/api/placeholder/300/400", after: "/api/placeholder/300/400", name: "Sofia, 34 anni" },
    { before: "/api/placeholder/300/400", after: "/api/placeholder/300/400", name: "Martina, 28 anni" },
    { before: "/api/placeholder/300/400", after: "/api/placeholder/300/400", name: "Giulia, 31 anni" }
  ];

  const testimonials = [
    {
      name: "Elena R.",
      age: "32 anni",
      image: "/api/placeholder/80/80",
      text: "Stavo risparmiando per il BBL ma avevo paura dei rischi. Caliburn mi ha dato risultati incredibili in 3 settimane: glutei più sodi e cellulite visibilmente ridotta.",
      rating: 5
    },
    {
      name: "Alessandra M.",
      age: "28 anni",
      image: "/api/placeholder/80/80",
      text: "Sono un'estetista, conosco bene i trattamenti. Non credevo che un gel topico potesse funzionare così bene. I miei clienti mi chiedono cosa uso.",
      rating: 5
    },
    {
      name: "Chiara L.",
      age: "35 anni",
      image: "/api/placeholder/80/80",
      text: "Dopo la gravidanza volevo rifare i glutei ma il BBL era troppo rischioso. Caliburn mi ha restituito fiducia: +2 taglie in 6 settimane.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Caliburn funziona davvero come il Brazilian Butt Lift?",
      answer: "A differenza del BBL, Caliburn NON è un intervento chirurgico ma un gel topico che agisce attraverso principi attivi avanzati. Stimola collagene e adipogenesi controllata attraverso glaucina e peptidi W-Shape™, simulando l'effetto 'lipofilling' senza rischi chirurgici."
    },
    {
      question: "Fa ingrassare in altre parti del corpo?",
      answer: "No, Caliburn agisce localmente solo dove viene applicato. I peptidi W-Shape™ sono progettati per targeting specifico del tessuto adiposo dei glutei, senza effetti sistemici sul peso corporeo."
    },
    {
      question: "È sicuro durante l'allattamento?",
      answer: "Caliburn non contiene ormoni o sostanze che passano nel latte materno. Tuttavia, come per qualsiasi prodotto cosmetico durante l'allattamento, consigliamo di consultare il medico prima dell'uso."
    },
    {
      question: "Quanto tempo serve per vedere i risultati?",
      answer: "La maggior parte delle donne riferisce i primi miglioramenti nella texture della pelle entro 7-10 giorni. L'aumento del tono e volume è visibile dalla terza settimana. I risultati ottimali si ottengono con 8 settimane di utilizzo costante."
    },
    {
      question: "Cosa succede se non funziona per me?",
      answer: "Offriamo una garanzia totale di rimborso entro 30 giorni. Se non sei completamente soddisfatta dei risultati, ti rimborsiamo l'intero importo senza domande. Il nostro tasso di successo è dell'87%."
    }
  ];

  const trackInitiateCheckout = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'InitiateCheckout', {
          value: 49.99,
          currency: 'EUR',
          content_type: 'product',
          content_name: 'Caliburn - Pacchetto Trasformazione Completa',
          content_ids: ['caliburn-complete'],
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
        user_agent: navigator.userAgent,
        timestamp: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        referrer: document.referrer,
        event_name: 'Lead',
        event_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome_hash: await hashData(firstName),
        telefono_hash: await hashData(cleanedPhone),
        cognome_hash: lastName ? await hashData(lastName) : null,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utm_content: new URLSearchParams(window.location.search).get('utm_content'),
        utm_term: new URLSearchParams(window.location.search).get('utm_term'),
        page_title: document.title,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        product: 'Caliburn - Pacchetto Trasformazione Completa',
        price: 49.99,
        URL: 'https://network.worldfilia.net/manager/inventory/buy/ntm_caliburn_1x49.json?api_key=5b4327289caa289c6117c469d70a13bd',
        source_id: '2da1cfad54d3',
        quantity: 1,
        api_key: '5b4327289caa289c6117c469d70a13bd',
        product_code: 'ntm_caliburn_1x49'
      };

      const response = await fetch('https://primary-production-625c.up.railway.app/webhook/0b9ed794-a19e-4914-85fd-e4b3a401a489', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData)
      });

      if (response.ok) {
        localStorage.setItem('orderData', JSON.stringify({
          ...formData,
          orderId: `CAL${Date.now()}`,
          product: 'Caliburn - Formula Avanzata',
          price: 49.99
        }));

        window.location.href = '/ty-caliburn';
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
          <div className="flex items-center justify-center text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white">BREAKING NEWS</span>
              <span className="text-white">•</span>
              <span className="text-white animate-pulse">{readersCount.toLocaleString()} persone stanno leggendo questo articolo</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-50 animate-pulse"></div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-600 mb-6">
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

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              IL TRATTAMENTO DA <span className="text-rose-600">10.000 €</span> CHE HA TRASFORMATO<br />
              <span className="text-rose-600">I GLUTEI DI HOLLYWOOD</span> È STATO "COPIATO"
            </h1>

            <h2 className="text-xl md:text-2xl text-gray-700 font-medium mb-8 leading-relaxed">
              Ricercatori svizzeri rivelano la formula segreta dietro il fenomeno Brazilian Butt Lift:
              <span className="font-bold text-rose-600"> ora disponibile come gel topico</span>
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-gray-600 text-lg font-medium">
                Costi BBL in Italia: <span className="font-bold text-rose-600">5.000-10.000 €</span>
              </p>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                <span className="font-semibold">«È la rivoluzione estetica del decennio. Kim Kardashian, Jennifer Lopez, Kylie Jenner:
                  centinaia di celebrità hanno trasformato il Brazilian Butt Lift nel fenomeno più dirompente della chirurgia estetica.</span>
                Gli interventi BBL sono aumentati del <span className="font-bold text-rose-600">+2.400% in 10 anni</span>,
                rendendo i chirurghi plastici specializzati milionari con liste d'attesa di 8-12 mesi.
                Il "miracolo" funziona davvero: <span className="font-bold">+3 taglie in una sola seduta, forma perfetta a clessidra,
                  risultati che durano per sempre.</span>
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                <span className="font-semibold">Ma c'è un problema:</span> costa 5.000-10.000€, richiede anestesia generale,
                settimane di recupero doloroso, e ha un tasso di complicazioni del 3-5% con casi documentati di embolia adiposa.
                Il "sogno" era riservato solo ai ricchi e coraggiosi.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                <span className="font-semibold">Fino ad oggi.</span> Un team di ricercatori svizzeri del Politecnico di Zurigo ha finalmente
                <span className="font-semibold text-rose-600"> "decodificato" la molecola che attiva selettivamente le cellule adipose dei glutei</span>,
                replicando l'effetto del lipofilling senza bisturi né sala operatoria.»
              </p>
            </div>
          </div>

          <div className="grid gap-8 items-center">
            <div>
              <img
                src="/images/caliburn/first.webp"
                alt="Brazilian Butt Lift vs Caliburn"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleOrderClick}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              INIZIA IL TRATTAMENTO
            </button>
          </div>
        </div>
      </section>

      {/* Why BBL Works */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Perché il Brazilian Butt Lift Funziona (E Perché Tutte lo Vogliono)
          </h2>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
            <p className="text-lg text-gray-800 leading-relaxed">
              Il BBL non è un normale intervento estetico. Preleva il grasso dalle zone "problematiche" (addome, cosce)
              e lo inietta strategicamente nei glutei, creando una forma a "clessidra" che appare completamente naturale.
              Il risultato? <span className="font-bold">+2-3 taglie di volume, lifting istantaneo, forma perfettamente scolpita.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-4">I Risultati BBL:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Aumento volume 200-400cc per gluteo</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Lifting naturale della zona</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Forma a "cuore" perfetta</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-3" />Effetto "clessidra" immediato</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Ma i Rischi Sono Reali:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>Embolia adiposa</li>
                <li className="flex items-center"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>Infezioni e cicatrici permanenti</li>
                <li className="flex items-center"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>Necrosi del tessuto adiposo</li>
                <li className="flex items-center"><span className="w-5 h-5 bg-red-500 rounded-full mr-3 flex-shrink-0"></span>6 mesi di recupero doloroso</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-gray-800 leading-relaxed">
              <span className="font-bold">Ma c'era un problema:</span> Il BBL costa tra 5.000€ e 10.000€, richiede anestesia generale,
              settimane di recupero in cui non puoi sederti, e ha un tasso di complicazioni del 3-5%.
              <span className="font-bold text-red-600"> Per la prima volta nella storia della medicina estetica, esisteva qualcosa che funzionava davvero...
                ma era riservato solo a chi poteva permetterselo e rischiare.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Scientific Breakthrough */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              La Svolta: Come Caliburn™ Replica il "Miracolo"
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              I ricercatori del Politecnico di Zurigo hanno identificato una combinazione di <span className="font-bold text-rose-600">3 molecole bioattive </span>
              che, applicate topicamente nella giusta concentrazione e biodisponibilità, <span className="font-bold">attivano gli stessi meccanismi cellulari del lipofilling.</span>
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 inline-block">
              <p className="text-blue-800 font-semibold">
                La differenza? Nessun bisturi. Nessuna anestesia. Nessun rischio di complicanze.
                Solo <span className="font-bold">risultati visibili in 21 giorni</span> al costo di un caffè al giorno.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
              Come Caliburn™ Simula il Brazilian Butt Lift
            </h3>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
              <div>
                <img
                  src="images/caliburn/comparison.jpg"
                  alt="Meccanismo di azione 3D Caliburn vs BBL"
                  className="rounded-lg shadow-md w-full"
                />
                <p className="text-sm text-gray-600 text-center mt-2">
                  Visualizzazione 3D: penetrazione trans-dermica vs iniezione chirurgica
                </p>
              </div>
              <div className="space-y-6">
                <div className="border-l-4 border-rose-500 pl-6">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">BBL Chirurgico</h4>
                  <p className="text-gray-700 mb-2">Inietta 200-400cc di grasso autologo direttamente nel muscolo gluteo</p>
                  <div className="text-sm text-red-600 font-semibold">⚠️ Rischio embolia • Anestesia generale • 6 mesi recupero</div>
                </div>
                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Caliburn™ Topico</h4>
                  <p className="text-gray-700 mb-2">Stimola le cellule adipose endogene attraverso penetrazione trans-dermica</p>
                  <div className="text-sm text-green-600 font-semibold">✅ Zero rischi • Applicazione quotidiana • Risultati in 21 giorni</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-rose-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-3">Glaucina Pura al 15%</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                Estratta dalla <em>Glaucium flavum</em>, questa molecola attiva selettivamente i recettori β3-adrenergici
                delle cellule adipose, stimolando l'<span className="font-semibold">adipogenesi controllata</span>.
                È lo stesso meccanismo che il chirurgo sfrutta nel BBL, ma attivato chimicamente.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-3">Peptidi W-Shape™</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                Complesso peptidico brevettato che <span className="font-semibold">mima i fattori di crescita</span> rilasciati
                durante il lipofilling. Stimola la formazione di nuovi adipociti e promuove il
                <span className="font-semibold"> "lifting" gravitazionale</span> tipico del BBL.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-3">Retinyl-Ester Micronizzato</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                Stimola intensamente la <span className="font-semibold">sintesi di collagene tipo I e III</span>,
                creando la "impalcatura" di sostegno che mantiene la forma. È l'equivalente topico del
                <span className="font-semibold"> rassodamento chirurgico</span> del BBL.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 text-white rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-center">
              🔬 La Tecnologia di Penetrazione Trans-Dermica
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4 text-yellow-400">Il Problema delle Creme Tradizionali:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Le normali creme anticellulite si fermano negli strati superficiali della pelle.
                  Gli ingredienti attivi non raggiungono mai il tessuto adiposo sottocutaneo dove servono.
                  Risultato: zero effetti reali, solo idratazione superficiale.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4 text-yellow-400">La Soluzione Caliburn™:</h4>
                <p className="text-gray-300 leading-relaxed">
                  Sistema di delivery liposomiale che trasporta le molecole attive attraverso 7 strati dermici,
                  raggiungendo direttamente il pannicolo adiposo dei glutei.
                  <span className="text-white font-semibold"> Biodisponibilità del 340% superiore</span> rispetto ai metodi tradizionali.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-900">
              ⚠️ IMPORTANTE: Questo Non È Una Normale Crema Anticellulite
            </h3>
            <p className="text-lg leading-relaxed text-center text-gray-800 mb-4">
              Caliburn™ utilizza gli stessi principi biologici del Brazilian Butt Lift da 7.000€,
              senza essere un intervento chirurgico. Agisce sui <span className="font-bold">recettori adipogeni,
                fattori di crescita e sintesi del collagene</span> - gli stessi target del lipofilling chirurgico.
            </p>
            <p className="text-center text-gray-700 font-semibold">
              Se hai provato altre creme senza successo, non significa che questa non funzionerà.
              È completamente diversa da tutto quello che hai provato finora.
            </p>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleOrderClick}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              INIZIA IL TRATTAMENTO
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Test Studio su 1.200 Donne
            </h2>
            <p className="text-xl text-rose-600 font-bold">
              87% di aumento del tono muscolare e riduzione cellulite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-rose-600 mb-2">87%</div>
              <p className="text-gray-700">Aumento tono glutei</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-rose-600 mb-2">92%</div>
              <p className="text-gray-700">Riduzione cellulite</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-rose-600 mb-2">89%</div>
              <p className="text-gray-700">Miglioramento texture</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-8">Risultati Prima/Dopo</h3>
            <div className="relative">
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <p className="font-semibold mb-4">PRIMA</p>
                  <img
                    src={beforeAfterSlides[currentSlide].before}
                    alt="Prima"
                    className="rounded-lg shadow-md w-48 h-64 object-cover"
                  />
                </div>
                <div className="text-4xl text-rose-600">→</div>
                <div className="text-center">
                  <p className="font-semibold mb-4">DOPO 8 SETTIMANE</p>
                  <img
                    src={beforeAfterSlides[currentSlide].after}
                    alt="Dopo"
                    className="rounded-lg shadow-md w-48 h-64 object-cover"
                  />
                </div>
              </div>
              <p className="text-center mt-4 font-semibold text-gray-700">
                {beforeAfterSlides[currentSlide].name}
              </p>
              <div className="flex justify-center mt-4 space-x-2">
                {beforeAfterSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-rose-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">I Risultati Parlano Chiaro</h2>
          <p className="text-center text-gray-600 mb-8">
            Oltre 3.500 donne europee hanno già provato Caliburn nei test preliminari
          </p>

          <div className="grid md:grid-cols-1 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-md">
                <div className="flex items-start space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <span className="text-gray-500 text-sm ml-2">{testimonial.age}</span>
                      <div className="flex ml-auto">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.text}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Offer Section */}
      <section id="limited-offer" className="py-12 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="mb-6">
            <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm mb-4">
              🚨 FORNITURE LIMITATE
            </div>
            <h3 className="text-3xl font-bold mb-2">ATTENZIONE: Stock Quasi Esaurito</h3>
            <p className="text-rose-100 text-lg">
              A causa dell'enorme richiesta dopo la diffusione della notizia,
              le scorte si stanno esaurendo rapidamente
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <img
                  src="/images/caliburn/product.png"
                  alt="Caliburn Product"
                  className="w-full h-auto object-contain rounded-lg mb-4"
                />
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">€49,99</div>
                <div className="text-xl">1 Flacone = 8 Settimane di Trattamento</div>
                <div className="text-sm text-rose-100 mt-2">
                  Invece di €7.000 di sala operatoria
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="text-xs text-rose-100 mb-2">LE VENDITE CHIUDONO IN:</div>
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
                  <div className="text-xs text-rose-100 mt-2">ore : min : sec</div>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    🔥 Rimangono solo {remainingStock} confezioni
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full animate-pulse shadow-lg transition-all duration-1000 ease-out"
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-rose-200">
                    ⚠️ Disponibilità quasi terminata
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
              ORDINA ADESSO - ULTIMI PEZZI
            </button>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Garanzia 30 Giorni
              </div>
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" />
                Spedizione Gratuita
              </div>
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamento alla Consegna
              </div>
            </div>

            <div className="text-xs text-rose-100 mt-4">
              ⚠️ Una volta esaurite le scorte, la prossima produzione sarà disponibile solo tra 4-6 settimane
            </div>
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

            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 pr-8">Compila per ordinare</h3>
            <p className="text-gray-600 mb-4 md:mb-6">Pagamento alla consegna</p>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Riepilogo ordine</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/images/caliburn/product.png"
                  alt="Caliburn"
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm md:text-base">Caliburn - Formula Avanzata</div>
                  <div className="text-xs md:text-sm text-gray-600">Quantità: 1 flacone (8 settimane)</div>
                  <div className="text-xs md:text-sm text-green-600">✅ Spedizione gratuita</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-lg md:text-xl text-gray-900">€49,99</div>
                  <div className="text-xs text-gray-500 line-through">€89,99</div>
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
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-base"
                  placeholder="Il tuo nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero di Telefono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleFormChange('telefono', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-base"
                  placeholder="Il tuo numero di telefono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo Completo</label>
                <textarea
                  value={formData.indirizzo}
                  onChange={(e) => handleFormChange('indirizzo', e.target.value)}
                  className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 h-20 md:h-20 text-base resize-none"
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
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg"
            >
              {isSubmitting ? 'ELABORANDO...' : 'CONFERMA ORDINE - €49,99'}
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Le Domande Più Frequenti</h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md">
                <button
                  className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-rose-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-rose-600" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">⚠️ ULTIMA POSSIBILITÀ</h2>
          <p className="text-xl mb-8">
            Le scorte si stanno esaurendo. Non aspettare settembre per la prossima produzione.
          </p>

          <button
            onClick={handleOrderClick}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-300 shadow-lg"
          >
            ORDINA ORA - PRIMA CHE FINISCA
          </button>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-sm text-gray-600 space-y-4">
            <h3 className="font-bold text-gray-900">Informazioni Legali e Disclaimer:</h3>

            <p><strong>Natura del Prodotto:</strong> Caliburn Spray è un prodotto cosmetico notificato al Ministero della Salute e non un dispositivo medico. Non è destinato a diagnosticare, trattare, curare o prevenire alcuna condizione medica. Le informazioni contenute in questa pagina sono solo a scopo informativo e non sostituiscono il parere di un medico qualificato.</p>

            <p><strong>Risultati Individuali:</strong> I risultati possono variare significativamente da persona a persona in base a età, tipo di pelle, condizioni di salute, stile di vita e altri fattori. Le testimonianze riportate sono esperienze individuali autentiche ma non garantiscono risultati identici per tutte le utilizzatrici.</p>

            <p><strong>Riferimenti al Brazilian Butt Lift:</strong> Tutti i riferimenti al BBL sono utilizzati esclusivamente a scopo informativo e comparativo. Caliburn non è prodotto, approvato o affiliato con alcuna clinica di chirurgia estetica. Il BBL è un intervento chirurgico che comporta rischi significativi.</p>

            <p><strong>Uso e Applicazione:</strong> Applicare secondo le istruzioni riportate sulla confezione. Non utilizzare su pelle lesionata o irritata. Interrompere l'uso in caso di reazioni avverse. Tenere fuori dalla portata dei bambini.</p>

            <p><strong>Controindicazioni:</strong> Non utilizzare in caso di gravidanza, allattamento, allergie note agli ingredienti, o patologie cutanee gravi. Consultare sempre un medico prima dell'uso se si hanno condizioni mediche preesistenti.</p>

            <p><strong>Responsabilità:</strong> L'utilizzo di Caliburn è sotto la responsabilità dell'utilizzatrice. Si consiglia di effettuare un test di tollerabilità prima del primo utilizzo. Non siamo responsabili per un uso improprio del prodotto.</p>

            <p className="text-center font-semibold">Per ulteriori informazioni: info@caliburnspray.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Caliburn;