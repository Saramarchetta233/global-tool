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
    imie: '',
    telefon: '',
    adres: ''
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

  // Funkcja do śledzenia początku checkout
  const trackInitiateCheckout = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        window.fbq('track', 'InitiateCheckout', {
          value: 219.00,
          currency: 'PLN',
          content_type: 'product',
          content_name: 'FatOnFire - Kompletny Pakiet Transformacji',
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
    // Śledzi wydarzenie początku checkout
    trackInitiateCheckout();

    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
  };

  // Funkcja do pobierania ciasteczek Facebook
  const getCookieValue = (name: string): string | null => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  // Funkcja do tworzenia hash SHA256
  const hashData = async (data: string): Promise<string | null> => {
    if (!data) return null;

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Błąd podczas hashowania:', error);
      return null;
    }
  };

  // Funkcja do czyszczenia numeru telefonu
  const cleanPhone = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('48')) return cleaned;
    if (cleaned.startsWith('0')) return '48' + cleaned.substring(1);
    if (cleaned.length === 9) return '48' + cleaned;
    return cleaned;
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOrderSubmit = async () => {
    if (!formData.imie || !formData.telefon || !formData.adres) {
      alert('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    // Zapobiega wielokrotnym wysyłkom
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Przygotowuje dane dla Meta z hashowaniem
      const cleanedPhone = cleanPhone(formData.telefon);
      const firstName = formData.imie.split(' ')[0];
      const lastName = formData.imie.split(' ').length > 1 ? formData.imie.split(' ').slice(1).join(' ') : '';

      const completeData = {
        // Oryginalne dane z formularza
        ...formData,

        // Dane Meta
        fbp: getCookieValue('_fbp'),
        fbc: getCookieValue('_fbc'),
        user_agent: navigator.userAgent,
        timestamp: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        referrer: document.referrer,
        event_name: 'Lead',
        event_id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

        // Dane hashowane
        imie_hash: await hashData(firstName),
        telefon_hash: await hashData(cleanedPhone),
        nazwisko_hash: lastName ? await hashData(lastName) : null,

        // Parametry UTM
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utm_content: new URLSearchParams(window.location.search).get('utm_content'),
        utm_term: new URLSearchParams(window.location.search).get('utm_term'),

        // Inne dane
        page_title: document.title,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,

        // Dane produktu
        product: 'FatOnFire - Kompletny Pakiet Transformacji',
        price: 219.00,

        // Dane API
        URL: 'https://network.worldfilia.net/manager/inventory/buy/sfn_fatonfire2x1_pl.json?api_key=5b4327289caa289c6117c469d70a13bd',
        source_id: '2da1cfad54d3',
        quantity: 2,
        api_key: '5b4327289caa289c6117c469d70a13bd',
        product_code: 'fatonfire_2x199'
      };

      // Wysyła dane do API
      const response = await fetch('https://primary-production-625c.up.railway.app/webhook/0b9ed794-a19e-4914-85fd-e4b3a401a489', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData)
      });

      if (response.ok) {
        // Zapisuje dane w localStorage dla strony podziękowania
        localStorage.setItem('orderData', JSON.stringify({
          ...formData,
          orderId: `FAT${Date.now()}`,
          product: 'FatOnFire - Zaawansowana Formuła',
          price: 229.00
        }));

        // Przekierowuje na stronę podziękowania
        window.location.href = '/ty-fatonfire';
      } else {
        throw new Error('Błąd przy wysyłaniu zamówienia');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd. Proszę spróbować ponownie później.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funkcja dla przycisków CTA otwierających popup
  const handleDirectOrder = () => {
    // Śledzi wydarzenie początku checkout
    trackInitiateCheckout();

    // Otwiera popup
    setShowOrderPopup(true);
    setReservationTimer({ minutes: 5, seconds: 0 });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breaking News Banner */}
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-semibold">
        <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>PILNE WIADOMOŚCI • {viewersCount} osób czyta ten artykuł teraz
      </div>

      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            LEK ZA 100 MILIARDÓW KTÓRY SPRAWIŁ, ŻE HOLLYWOOD SCHUDŁO ZOSTAŁ "SKOPIOWANY"
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-6">
            Szwajcarscy naukowcy ujawniają tajną formułę stojącą za fenomenem Ozempic®:
            <span className="text-red-600 font-semibold"> teraz dostępna jako naturalny suplement</span>
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>📅 29 Czerwca 2025</span>
            <span>👁️ 948 463 wyświetlenia</span>
            <span>⏱️ 4 min czytania</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4">
        {/* News Article Intro */}
        <section className="mb-8">
          <img
            src="images/oz/azioni.jpg"
            alt="Badania naukowe suplementów"
            className="w-full h-auto object-contain rounded-lg mb-6"
          />
          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-4">
              To farmaceutyczna historia stulecia. <strong>Ozempic®, pierwotnie opracowany na cukrzycę</strong>, przekształcił się
              w najbardziej rewolucyjny fenomen w branży odchudzania. Kim Kardashian, Elon Musk,
              Sharon Osbourne: <strong>setki gwiazd przyznało się do jego używania</strong>, wywołując globalny wyścig
              który uczynił Novo Nordisk najcenniejszą firmą w Europie, o wartości rynkowej ponad 400 miliardów dolarów.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              <strong>Problem:</strong> Ozempic® kosztuje ponad 300€ miesięcznie, może być sprzedawany tylko na receptę, wymaga cotygodniowych zastrzyków i ma
              znaczące skutki uboczne. Miesięczne listy oczekujących. Globalny niedobór.
              <strong>"Cud" był zarezerwowany tylko dla bogatych.</strong>
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Do dziś. <strong>Zespół szwajcarskich naukowców
                w końcu "rozszyfrował" mechanizm molekularny stojący za Ozempic®</strong>, powodując tym samym krach akcji firmy farmaceutycznej na giełdzie. Odkrycie?
              <strong> Możliwe jest osiągnięcie tych samych efektów poprzez specjalną kombinację naturalnych związków</strong>
              które działają na te same receptory GLP-1.
            </p>

            <p className="text-lg leading-relaxed mb-4">
              Wynikiem tych badań jest <strong>FatOnFire</strong>, pierwszy suplement który replikuje mechanizm działania
              Ozempic bez zastrzyków, bez recepty lekarskiej i za ułamek kosztu.
              <strong>Przypuszcza się, że ta rewolucja przyczyniła się do niedawnego 70% krachu akcji Novo Nordisk</strong>,
              po latach nieprzerwanego wzrostu.
            </p>

            <p className="text-lg leading-relaxed mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <strong>⚠️ UWAGA:</strong> Nie mówimy o zwykłym "spalaczu tłuszczu" który już próbowałeś.
              FatOnFire używa całkowicie innej technologii, opartej na modulacji hormonów sytości.
              <strong>To pierwsza prawdziwa naukowa alternatywa dla Ozempic®.</strong>
            </p>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Dlaczego Ozempic® Działa (I Dlaczego Wszyscy Go Chcą)</h3>

            <p className="text-lg leading-relaxed mb-4">
              <strong>Ozempic® to nie zwykły lek na odchudzanie.</strong> Działa na receptory GLP-1 w mózgu,
              dosłownie "wyłączając" głód. Pacjenci zgłaszają, że zapominają o jedzeniu, że <strong>czują wstręt
                do śmieciowego jedzenia, że czują się syci po kilku kęsach.</strong>
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Wyniki były <strong>druzgocące dla branży fitness:</strong> puste siłownie, sprzedaż
              tradycyjnych suplementów spadła o 40%.
              <strong>Po raz pierwszy w historii istniało coś co naprawdę działało.</strong>
            </p>

            <img
              src="/images/fatonfire/vs-oz.jpg"
              alt="Wpływ na branżę fitness"
              className="w-full h-auto object-contain rounded-lg mb-6"
            />

            <p className="text-lg leading-relaxed mb-6">
              Ale był problem: <strong>Ozempic® kosztuje 3600€ rocznie</strong>.
            </p>

            <div className="text-center my-8">
              <button
                onClick={handleDirectOrder}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Rozpocznij Leczenie
              </button>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Przełom: Jak FatOnFire Replikuje "Cud"</h3>

            <p className="text-lg leading-relaxed mb-6">
              Szwajcarscy naukowcy zidentyfikowali kombinację <strong>7 naturalnych związków</strong> które,
              przyjmowane razem we właściwej proporcji i biodostępności, <strong>aktywują te same receptory GLP-1 co Ozempic®.</strong>
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Różnica? <strong>Żadnych zastrzyków. Żadnej recepty. Żadnych poważnych skutków ubocznych.</strong>
              Tylko kapsułki do przyjmowania przed głównymi posiłkami. Koszt? Mniej niż 8,50 zł dziennie zamiast 50 zł.
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 mb-8">
          <img
            src="/images/oz/glp1.webp"
            alt="Formuła FatOnFire"
            className="w-full h-auto object-contain rounded-lg mb-6"
          />
          <h3 className="text-3xl font-bold text-center mb-2">Dlaczego FatOnFire Jest Inny Od Wszystkiego Co Kiedykolwiek Próbowałeś</h3>
          <p className="text-center text-gray-600 mb-8 text-lg">
            To nie jest kolejny "spalacz tłuszczu". To pierwsza naturalna replika technologii Ozempic®
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🧠</div>
              <h4 className="font-bold text-gray-900 mb-2">Blokuje Głód na Poziomie Mózgu</h4>
              <p className="text-gray-600 text-sm">Działa na receptory GLP-1 jak Ozempic®, nie na zwykłe termogeniki</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Widoczne Rezultaty w 72 Godziny</h4>
              <p className="text-gray-600 text-sm">Natychmiastowe zmniejszenie apetytu, nie mgliste obietnice</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🏆</div>
              <h4 className="font-bold text-gray-900 mb-2">Opatentowana Formuła 7-w-1</h4>
              <p className="text-gray-600 text-sm">Unikalna kombinacja nigdy wcześniej nie widziana w handlu</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">💉</div>
              <h4 className="font-bold text-gray-900 mb-2">Zero Zastrzyków</h4>
              <p className="text-gray-600 text-sm">Te same mechanizmy co Ozempic® bez igieł czy recept</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">1/10 Kosztu Ozempic®</h4>
              <p className="text-gray-600 text-sm">8,50 zł/dzień vs 50 zł/dzień oryginalnego leku</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="text-3xl mb-3">🔬</div>
              <h4 className="font-bold text-gray-900 mb-2">Testowany na 1200+ Osobach</h4>
              <p className="text-gray-600 text-sm">94% sukces w testach preliminarnych szwajcarskich</p>
            </div>
          </div>

          <div className="mt-8 bg-red-100 border border-red-300 rounded-lg p-6">
            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
              <span>⚠️</span> WAŻNE: To Nie Jest Zwykły Suplement
            </h4>
            <p className="text-red-700">
              <strong>FatOnFire używa tej samej ścieżki metabolicznej co lek wart miliardy dolarów.</strong>
              Jeśli próbowałeś innych suplementów bez powodzenia, nie oznacza to, że ten nie zadziała.
              Jest kompletnie inny od wszystkiego co próbowałeś dotychczas.
            </p>
          </div>
        </section>

        {/* Call to Action Button */}
        <div className="text-center my-8">
          <button
            onClick={handleDirectOrder}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Rozpocznij Leczenie
          </button>
        </div>

        {/* Testimonials */}
        <section className="mb-8">
          <h3 className="text-3xl font-bold text-center mb-2">Wyniki Mówią Same Za Siebie</h3>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Ponad 3500 Europejczyków już wypróbowało FatOnFire w testach wstępnych
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="images/donna-1.webp"
                  alt="Maria K."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Maria K., 45 lat</div>
                  <div className="text-gray-500 text-sm">Warszawa</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Przed</div>
                  <div className="font-bold text-red-600">92 kg</div>
                  <div className="text-xs text-gray-500 mt-1">Po</div>
                  <div className="font-bold text-green-600">83 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Wyrzuciłam 2000 zł na bezużyteczne suplementy. FatOnFire jest inny: w 3 dni przestałam ciągle myśleć o jedzeniu. Schudłam 9 kg w 7 tygodni bez cierpienia."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Wynik zweryfikowany • Autentyczne świadectwo
              </div>
            </div>

            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="/images/testimonial/marco.webp"
                  alt="Grzegorz N."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Grzegorz N., 52 lata</div>
                  <div className="text-gray-500 text-sm">Kraków</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Przed</div>
                  <div className="font-bold text-red-600">78 kg</div>
                  <div className="text-xs text-gray-500 mt-1">Po</div>
                  <div className="font-bold text-green-600">71 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Moja żona brała Ozempic® ale miała zbyt dużo skutków ubocznych. FatOnFire dał jej te same rezultaty bez nudności. Nasz lekarz był w szoku."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Wynik zweryfikowany • Autentyczne świadectwo
              </div>
            </div>

            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="/images/testimonial/federica.png"
                  alt="Anna M."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Anna M., 38 lat</div>
                  <div className="text-gray-500 text-sm">Gdańsk</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Przed</div>
                  <div className="font-bold text-red-600">85 kg</div>
                  <div className="text-xs text-gray-500 mt-1">Po</div>
                  <div className="font-bold text-green-600">76 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Jestem pielęgniarką, dobrze znam Ozempic®. Nie wierzyłam, że suplement może tak działać. Moi koledzy pytają co biorę."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Wynik zweryfikowany • Autentyczne świadectwo
              </div>
            </div>

            <div className="bg-white border-2 border-blue-100 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="images/donna-2.webp"
                  alt="Katarzyna W."
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1">
                  <div className="font-bold text-gray-900">Katarzyna W., 41 lat</div>
                  <div className="text-gray-500 text-sm">Wrocław</div>
                  <div className="flex mt-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Przed</div>
                  <div className="font-bold text-red-600">103 kg</div>
                  <div className="text-xs text-gray-500 mt-1">Po</div>
                  <div className="font-bold text-green-600">91 kg</div>
                </div>
              </div>
              <p className="text-gray-700 italic">"Musiałam schudnąć ze względów zdrowotnych ale Ozempic® kosztował za dużo. FatOnFire mnie uratował: -12 kg w 2 miesiące, idealna glukoza, nigdy więcej nerwowego głodu."</p>
              <div className="mt-3 text-xs text-gray-500 border-t pt-2">
                ✅ Wynik zweryfikowany • Autentyczne świadectwo
              </div>
            </div>
          </div>

          <div className="mt-8 text-center bg-blue-50 rounded-lg p-6">
            <h4 className="font-bold text-xl mb-2">📊 Wyniki Testu Klinicznego</h4>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">94%</div>
                <div className="text-sm text-gray-600">Schudło znacząco</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">87%</div>
                <div className="text-sm text-gray-600">Zmniejszyło apetyt</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">96%</div>
                <div className="text-sm text-gray-600">Poleciłoby innym</div>
              </div>
            </div>
          </div>
        </section>

        {/* Limited Offer */}
        <section id="limited-offer" className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-8 mb-8 text-center">
          <div className="mb-6">
            <div className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm mb-4">
              🚨 OGRANICZONE ZAPASY
            </div>
            <h3 className="text-3xl font-bold mb-2">UWAGA: Zapasy Prawie Wyczerpane</h3>
            <p className="text-red-100 text-lg">
              Z powodu ogromnego popytu po rozprzestrzenieniu się wiadomości,
              zapasy wyczerpują się szybko
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
                <div className="text-5xl font-bold mb-2">229 zł</div>

                <div className="text-xl">2 Opakowania = 2 Pełne Miesiące</div>
                <div className="text-sm text-red-100 mt-2">
                  Zamiast 50 zł/dzień za Ozempic® → Tylko 6,67 zł/dzień
                </div>
              </div>

              <div>
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <div className="text-xs text-red-100 mb-2">SPRZEDAŻ ZAMYKA SIĘ ZA:</div>
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
                  <div className="text-xs text-red-100 mt-2">godz : min : sek</div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    🔥 Pozostało tylko {remainingStock} opakowań
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full animate-pulse shadow-lg transition-all duration-1000 ease-out"
                      style={{ width: `${stockPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-red-200">
                    ⚠️ Dostępność prawie wyczerpana
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
              ZAMÓW TERAZ
            </button>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Gwarancja 30 Dni
              </div>
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" />
                Darmowa Dostawa
              </div>
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Płatność przy Odbiorze
              </div>
            </div>

            <div className="text-xs text-red-100 mt-4">
              ⚠️ Po wyczerpaniu zapasów następna produkcja będzie dostępna dopiero za 4-6 tygodni
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

              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 pr-8">Wypełnij aby zamówić</h3>
              <p className="text-gray-600 mb-4 md:mb-6">Płatność przy odbiorze</p>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 mb-4">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Podsumowanie zamówienia</h4>
                <div className="flex items-center gap-3">
                  <img
                    src="images/fatonfire/product.webp"
                    alt="FatOnFire"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm md:text-base">FatOnFire - Zaawansowana Formuła</div>
                    <div className="text-xs md:text-sm text-gray-600">Ilość: 2 opakowania</div>
                    <div className="text-xs md:text-sm text-green-600">✅ Darmowa dostawa</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg md:text-xl text-gray-900">229 zł</div>
                    <div className="text-xs text-gray-500 line-through">549,90 zł</div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imię i Nazwisko</label>
                  <input
                    type="text"
                    value={formData.imie}
                    onChange={(e) => handleFormChange('imie', e.target.value)}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder="Twoje pełne imię i nazwisko"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numer Telefonu</label>
                  <input
                    type="tel"
                    value={formData.telefon}
                    onChange={(e) => handleFormChange('telefon', e.target.value)}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
                    placeholder="Twój numer telefonu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pełny Adres</label>
                  <textarea
                    value={formData.adres}
                    onChange={(e) => handleFormChange('adres', e.target.value)}
                    className="w-full px-3 py-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-20 md:h-20 text-base resize-none"
                    placeholder="Ulica, numer, miasto, kod pocztowy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 mt-4 text-gray-700">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium text-sm md:text-base">Płatność przy odbiorze</span>
              </div>

              <button
                onClick={handleOrderSubmit}
                disabled={!formData.imie || !formData.telefon || !formData.adres || isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base md:text-lg"
              >
                {isSubmitting ? 'PRZETWARZANIE...' : 'POTWIERDŹ ZAMÓWIENIE - 229 ZŁ'}
              </button>
            </div>
          </div>
        )}

        {/* FAQ */}
        <section className="mb-8">
          <h3 className="text-3xl font-bold text-center mb-6">Najczęściej Zadawane Pytania</h3>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Czy FatOnFire naprawdę działa jak Ozempic®?</h4>
              <p className="text-gray-700 leading-relaxed">FatOnFire działa na te same receptory GLP-1 co Ozempic®, ale przez naturalną ścieżkę. Testy wstępne na 1200+ osobach pokazują 70-80% zmniejszenie apetytu, porównywalne z oryginalnym lekiem. Główna różnica to metoda podawania: doustnie zamiast przez zastrzyk.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Czy jest bezpieczny? Są skutki uboczne?</h4>
              <p className="text-gray-700 leading-relaxed">FatOnFire jest sformułowany z certyfikowanych naturalnych składników i produkowany w zakładach GMP. W przeciwieństwie do Ozempic®, nie powoduje silnych nudności ani znaczących problemów żołądkowo-jelitowych. Jednak jak w przypadku każdego suplementu, zaleca się konsultację z lekarzem, szczególnie przy przyjmowaniu innych leków.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Ile czasu potrzeba na zobaczenie rezultatów?</h4>
              <p className="text-gray-700 leading-relaxed">Większość użytkowników zgłasza zmniejszenie apetytu w ciągu 72-96 godzin. Widoczna utrata wagi zwykle zaczyna się od drugiego tygodnia. Optymalne rezultaty uzyskuje się przy stałym stosowaniu przez 8-12 tygodni.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-3 text-lg">Co się stanie jeśli nie zadziała na mnie?</h4>
              <p className="text-gray-700 leading-relaxed">Oferujemy pełną gwarancję zwrotu pieniędzy w ciągu 30 dni. Jeśli nie jesteś całkowicie zadowolony z rezultatów, zwracamy całą kwotę bez pytań. Nasza skuteczność wynosi 94%, ale rozumiemy, że każda osoba jest inna.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">⚠️ OSTATNIA SZANSA</h3>
            <p className="text-xl mb-6">
              Zapasy się wyczerpują. Nie czekaj do września na następną produkcję.
            </p>
            <button onClick={handleOrderClick} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 px-12 rounded-lg text-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl mb-4">
              ZAMÓW TERAZ - OSTATNIE OPAKOWANIA
            </button>
            <div className="text-sm">
              ✅ Gwarancja 30 dni • ✅ Darmowa dostawa • ✅ Płatność przy odbiorze
            </div>
          </div>
        </section>

        {/* Legal Disclaimer */}
        <section className="bg-gray-50 rounded-lg p-6 text-xs text-gray-600">
          <h4 className="font-semibold mb-3 text-sm">Informacje Prawne i Zastrzeżenia:</h4>

          <div className="space-y-3">
            <p>
              <strong>Charakter Produktu:</strong> FatOnFire to suplement diety zgłoszony do Ministerstwa Zdrowia, a nie lek.
              Nie jest przeznaczony do diagnozowania, leczenia, uzdrawiania ani zapobiegania żadnej chorobie. Informacje zawarte na tej stronie
              służą wyłącznie celom informacyjnym i nie zastępują opinii wykwalifikowanego lekarza.
            </p>

            <p>
              <strong>Wyniki Indywidualne:</strong> Wyniki mogą się znacznie różnić w zależności od wieku,
              płci, stanu zdrowia, stylu życia, diety i innych czynników. Przedstawione świadectwa to autentyczne
              indywidualne doświadczenia, ale nie gwarantują identycznych wyników dla wszystkich użytkowników.
            </p>

            <p>
              <strong>Odniesienia do Ozempic®:</strong> Wszystkie odniesienia do Ozempic® (semaglutyd) są używane wyłącznie w
              celach porównawczych i informacyjnych. FatOnFire nie jest produkowany, zatwierdzony ani powiązany z Novo Nordisk.
              Ozempic® to zastrzeżony znak towarowy Novo Nordisk A/S. FatOnFire działa przez podobne mechanizmy, ale przez całkowicie inne składniki.
            </p>

            <p>
              <strong>Użycie i Dawkowanie:</strong> Nie przekraczaj zalecanej dawki dziennej wynoszącej 2 kapsułki. Przechowywać w miejscu
              niedostępnym dla dzieci poniżej 3 roku życia. Produkt nie powinien być uważany za zamiennik
              różnorodnej i zrównoważonej diety oraz zdrowego stylu życia.
            </p>

            <p>
              <strong>Przeciwwskazania:</strong> Nie używać w ciąży, karmieniu piersią, cukrzycy typu 1, poważnych zaburzeniach
              odżywiania, lub przy przyjmowaniu leków na cukrzycę bez nadzoru lekarskiego. Zawsze skonsultuj się z lekarzem
              przed użyciem jeśli masz istniejące problemy zdrowotne lub przyjmujesz leki.
            </p>

            <p>
              <strong>Odpowiedzialność:</strong> Używanie FatOnFire jest na odpowiedzialność użytkownika. Zdecydowanie zaleca się
              konsultację z lekarzem przed użyciem, szczególnie przy istniejących problemach zdrowotnych. Nie jesteśmy odpowiedzialni
              za niewłaściwe stosowanie produktu lub brak wstępnej konsultacji lekarskiej.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-300">
            <p className="text-center font-semibold">
              Dodatkowe informacje: info@fatonfire.pl
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm">© 2025 FatOnFire Polska. Wszelkie prawa zastrzeżone.</p>
          <div className="mt-4 space-x-4 text-sm">
            <a href="#" className="hover:text-gray-300">Polityka Prywatności</a>
            <a href="#" className="hover:text-gray-300">Regulamin</a>
            <a href="#" className="hover:text-gray-300">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FatOnFireLanding;