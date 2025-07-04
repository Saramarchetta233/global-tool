"use client";

declare global {
  interface Window {
    fbq: any;
  }
}

import React, { useState, useEffect } from 'react';
import { CheckCircle, Phone, Clock, Shield, Package, Star, Heart, Award } from 'lucide-react';

const ThankYouPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pixelFired, setPixelFired] = useState(false);

  const steps = [
    "Zamówienie Otrzymane",
    "Weryfikacja Danych",
    "Przygotowanie",
    "Wysyłka"
  ];

  useEffect(() => {
    // Istniejący timer
    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : 0));
    }, 2000);

    // Funkcja do śledzenia zdarzenia Purchase z retry
    const trackPurchaseEvent = (retries = 5, delay = 500) => {
      if (pixelFired) return; // Unikaj duplikatów

      if (typeof window !== 'undefined' && window.fbq) {
        try {
          window.fbq('track', 'Purchase', {
            value: 229.00,
            currency: 'PLN',
            content_type: 'product',
            content_name: 'Keto Brucia - Pakiet Kompletny',
            content_ids: ['keto-brucia-complete'],
            num_items: 4
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

    // Rozpocznij śledzenie z początkowym opóźnieniem
    const pixelTimeout = setTimeout(() => {
      trackPurchaseEvent();
    }, 1000);

    // Listener dla całkowicie załadowanej strony
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
      title: "Gwarancja 365 Dni",
      description: "Zadowolona lub zwrot pieniędzy 100%"
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: "Przesyłka Śledzona",
      description: "Otrzymasz numer śledzenia przez SMS"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Dedykowane Wsparcie",
      description: "Spersonalizowana pomoc w zestawie"
    }
  ];

  const nextSteps = [
    {
      step: "1",
      title: "Telefon Weryfikacyjny",
      description: "Nasz operator skontaktuje się z Tobą w ciągu 2 godzin, aby potwierdzić dane zamówienia",
      time: "W ciągu 2 godzin"
    },
    {
      step: "2",
      title: "Przygotowanie Zamówienia",
      description: "Twój pakiet Keto Brucia zostanie przygotowany w naszym certyfikowanym laboratorium",
      time: "24 godziny"
    },
    {
      step: "3",
      title: "Wysyłka Express",
      description: "Darmowa wysyłka kurierem express z numerem śledzenia",
      time: "24-48 godzin"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header Success */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-bounce mb-4">
            <CheckCircle className="w-20 h-20 mx-auto text-green-200" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎉 Zamówienie Potwierdzone!
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            Dziękujemy za wybór Keto Brucia
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main Confirmation */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-green-200">
          <div className="text-center mb-8">
            <div className="bg-green-100 rounded-full p-4 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Twoje Zamówienie Zostało Otrzymane
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Phone className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-green-800">
                    Telefon Weryfikacyjny w Drodze
                  </h3>
                  <p className="text-green-700">
                    Nasz operator skontaktuje się z Tobą w ciągu 2 godzin
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-300">
                <p className="text-gray-700 text-center">
                  <strong>📞 Trzymaj telefon pod ręką!</strong><br />
                  Operator zweryfikuje Twoje dane i potwierdzi wysyłkę, aby zagwarantować idealne dostarczenie.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 mb-8 border border-pink-200">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Podsumowanie Zamówienia
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h4 className="font-bold text-gray-900 mb-3">Zamówiony Produkt:</h4>
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">💊</div>
                  <div>
                    <p className="font-semibold">Keto Brucia - Pakiet Kompletny</p>
                    <p className="text-sm text-gray-600">4 Opakowania + Darmowe Bonusy</p>
                    <p className="text-green-600 font-bold">229 zł zamiast 916 zł</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-blue-600 font-semibold">💳 Płatność przy Odbiorze</p>
                      <p className="text-sm text-green-600 font-semibold">🚚 Darmowa Wysyłka</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <h4 className="font-bold text-gray-900 mb-3">Dołączone Bonusy:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Przewodnik Żywieniowy Keto-Friendly</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Plan Treningu Metabolicznego</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Konsultacje WhatsApp 24/7 ze Specjalistą</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Co Dzieje się Teraz?
          </h2>

          <div className="space-y-6">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {step.step}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Reminder */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white p-8 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Twoje Gwarancje
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="opacity-90">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Animation */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Status Twojego Zamówienia
          </h3>

          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${index <= currentStep
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-500'
                  }`}>
                  {index + 1}
                </div>
                <p className={`text-sm mt-2 font-semibold transition-all duration-500 ${index <= currentStep ? 'text-green-600' : 'text-gray-400'
                  }`}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep + 1) * 25}%` }}
            ></div>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Clock className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">
                ⚠️ Ważne Informacje
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>• <strong>Trzymaj telefon włączony</strong> - Zadzwonimy do Ciebie w ciągu 2 godzin</li>
                <li>• <strong>Zweryfikuj swoje dane</strong> - Operator potwierdzi imię, telefon i adres</li>
                <li>• <strong>Brak płatności teraz</strong> - Zapłacisz przy odbiorze</li>
                <li>• <strong>Darmowa wysyłka</strong> - Brak dodatkowych kosztów</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Dołączyłaś do Ponad 2.847 Zadowolonych Kobiet
            </h3>

            <p className="text-gray-600 text-lg mb-6">
              Dokonałaś właściwego wyboru, aby zmienić swoje ciało i odzyskać życiową energię.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">94%</div>
                <p className="text-green-700 text-sm">Utrata wagi w ciągu 2 tygodni</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">87%</div>
                <p className="text-blue-700 text-sm">Redukcja wzdęć w 72 godziny</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">96%</div>
                <p className="text-purple-700 text-sm">Poleciłaby przyjaciółce</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;