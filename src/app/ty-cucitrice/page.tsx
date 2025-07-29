"use client";

declare global {
  interface Window {
    fbq: any;
    dataLayer: any[];
  }
}

import React, { useState, useEffect } from 'react';
import { CheckCircle, Phone, Clock, Shield, Package, Star, Heart, Award, Truck } from 'lucide-react';

const ThankYouPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pixelFired, setPixelFired] = useState(false);

  const steps = [
    "Ordine Ricevuto",
    "Verifica Dati",
    "Preparazione",
    "Spedizione"
  ];

  useEffect(() => {
    // Timer esistente
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : 0));
    }, 2000);

    // Funzione per tracciare l'evento Purchase con retry
    const trackPurchaseEvent = (retries = 5, delay = 500) => {
      if (pixelFired) return; // Evita duplicati

      if (typeof window !== 'undefined' && window.fbq) {
        try {
          window.fbq('track', 'Purchase', {
            value: 62.98,
            currency: 'EUR',
            content_type: 'product',
            content_name: 'Macchina da Cucire Creativa',
            content_ids: ['sewing-machine-creative'],
            num_items: 1
          });
          setPixelFired(true);
          console.log('✅ Purchase event successfully tracked');
        } catch (error) {
          console.error('❌ Error tracking Purchase event:', error);
          if (retries > 0) {
            setTimeout(() => trackPurchaseEvent(retries - 1, delay * 1.5), delay);
          }
        }
      } else {
        console.log(`⏳ Facebook Pixel not ready, retrying... (${retries} attempts left)`);
        if (retries > 0) {
          setTimeout(() => trackPurchaseEvent(retries - 1, delay * 1.2), delay);
        } else {
          console.error('❌ Facebook Pixel not available after all retries');
        }
      }
    };

    // Avvia il tracking con un delay iniziale
    const pixelTimeout = setTimeout(() => {
      trackPurchaseEvent();
    }, 1000);

    // Listener per quando la pagina è completamente caricata
    const handleLoad = () => {
      if (!pixelFired) {
        setTimeout(() => trackPurchaseEvent(), 500);
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(pixelTimeout);
      window.removeEventListener('load', handleLoad);
    };
  }, [pixelFired]);

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Garanzia 30 Giorni",
      description: "Soddisfatti o rimborsati al 100%"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Spedizione Tracciata",
      description: "Riceverai il tracking via SMS"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Supporto Tecnico a Vita",
      description: "Assistenza per tutta la durata della macchina"
    }
  ];

  const nextSteps = [
    {
      step: "1",
      title: "Chiamata di Verifica",
      description: "Un nostro operatore ti contatterà entro 2 ore per confermare i dati dell'ordine",
      time: "Entro 2 ore"
    },
    {
      step: "2",
      title: "Preparazione Ordine",
      description: "La tua macchina da cucire verrà preparata e imballata con cura nel nostro magazzino",
      time: "24 ore"
    },
    {
      step: "3",
      title: "Spedizione Express",
      description: "Spedizione gratuita con corriere espresso e numero di tracking incluso",
      time: "24-48 ore"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      {/* Header Success */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-bounce mb-4">
            <CheckCircle className="w-20 h-20 mx-auto text-green-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎉 Ordine Confermato!
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            Grazie per aver scelto la Macchina da Cucire Creativa
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Confirmation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-green-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Il Tuo Ordine è Stato Ricevuto
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Phone className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-green-700">
                    Chiamata di Verifica in Arrivo
                  </h3>
                  <p className="text-green-600">
                    Un nostro operatore ti contatterà entro 2 ore
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-300">
                <p className="text-gray-700 text-center">
                  <strong className="text-green-600">📞 Tieni il telefono a portata di mano!</strong><br />
                  L'operatore verificherà i tuoi dati e confermerà la spedizione per garantire una consegna perfetta.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Riepilogo Ordine
            </h3>

            <div className="bg-white rounded-lg p-6 shadow-md border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-4">Prodotto Ordinato:</h4>

              <div className="flex items-center space-x-4">
                <img
                  src="https://cosedicase.com/cdn/shop/files/12_7c7dad15-e9f3-458a-a4b4-4ee69d6424dc.jpg?v=1749044582&width=1000"
                  alt="Macchina da Cucire Creativa"
                  className="w-20 h-20 rounded-lg border-2 border-gray-300 object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-lg">🧵 Macchina da Cucire Creativa</p>
                  <p className="text-sm text-gray-600 mb-2">Compatta, Potente, Facilissima da Usare</p>
                  <p className="text-green-600 font-bold text-xl">€62,98</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-600 font-semibold">💳 Pagamento alla Consegna</p>
                    <p className="text-sm text-green-600 font-semibold">🚚 Spedizione Gratuita</p>
                    <p className="text-sm text-purple-600 font-semibold">🎁 Accessori Inclusi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Cosa Succede Ora?
          </h2>

          <div className="space-y-6">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg">
                  {step.step}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-300">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Reminder */}
        <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-2xl text-white p-8 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 drop-shadow-lg">
            Le Tue Garanzie
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 drop-shadow">{benefit.title}</h3>
                <p className="opacity-90 drop-shadow-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Animation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Stato del Tuo Ordine
          </h3>

          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-lg ${index <= currentStep
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gray-300 text-gray-600'
                  }`}>
                  {index + 1}
                </div>
                <p className={`text-sm mt-2 font-semibold transition-all duration-500 ${index <= currentStep ? 'text-green-600' : 'text-gray-500'
                  }`}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(currentStep + 1) * 25}%` }}
            ></div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            📅 Timeline di Consegna
          </h3>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <p className="text-center text-gray-700 mb-6 text-lg">
              Ordina <strong>ORA</strong> e riceverai il tuo pacco tra <strong>venerdì 1 ago e lunedì 4 ago</strong>
            </p>
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">📦</div>
                <div className="font-medium text-gray-800">Ordinato</div>
                <div className="text-gray-500 text-sm">gio, 31 lug</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">🚚</div>
                <div className="font-medium text-gray-800">Spedito</div>
                <div className="text-gray-500 text-sm">ven, 1 ago</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-4xl mb-2">📍</div>
                <div className="font-medium text-gray-800">Consegnato</div>
                <div className="text-gray-500 text-sm">lun, 4 ago</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Clock className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-yellow-700 mb-2">
                ⚠️ Informazioni Importanti
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>• <strong>Mantieni il telefono acceso</strong> - Ti chiameremo entro 2 ore</li>
                <li>• <strong>Verifica i tuoi dati</strong> - L'operatore confermerà nome, telefono e indirizzo</li>
                <li>• <strong>Nessun pagamento ora</strong> - Pagherai alla consegna</li>
                <li>• <strong>Spedizione gratuita</strong> - Nessun costo aggiuntivo</li>
                <li>• <strong>Accessori inclusi</strong> - Tavolo estensibile, DVD e piedini speciali</li>
              </ul>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-gray-200">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            🎁 Cosa Riceverai nel Pacchetto
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
              <h4 className="font-bold text-lg text-purple-700 mb-4">📦 Macchina da Cucire Creativa</h4>
              <ul className="space-y-2 text-purple-600">
                <li>• 165 punti incorporati</li>
                <li>• Infilatura automatica dell'ago</li>
                <li>• Display LCD retroilluminato</li>
                <li>• Copertura rigida protettiva</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
              <h4 className="font-bold text-lg text-blue-700 mb-4">🛠️ Accessori Inclusi</h4>
              <ul className="space-y-2 text-blue-600">
                <li>• Tavolo estensibile per quilt</li>
                <li>• 8 piedini specializzati</li>
                <li>• DVD istruttivo completo</li>
                <li>• Kit di manutenzione</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current drop-shadow" />
              ))}
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ti Sei Unita a Oltre 2.800 Appassionate di Cucito Soddisfatte
            </h3>

            <p className="text-gray-600 text-lg mb-6">
              Hai fatto la scelta giusta per trasformare la tua passione per il cucito in capolavori unici.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 border-2 border-green-200">
                <div className="text-2xl font-bold text-green-600">97%</div>
                <p className="text-green-700 text-sm">Cucito più semplice e veloce</p>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg p-4 border-2 border-blue-200">
                <div className="text-2xl font-bold text-blue-600">98%</div>
                <p className="text-blue-700 text-sm">Aumento della creatività</p>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border-2 border-purple-200">
                <div className="text-2xl font-bold text-purple-600">96%</div>
                <p className="text-purple-700 text-sm">Lo consiglierebbe ad un'amica</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;