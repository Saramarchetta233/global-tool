'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle, Shield, Truck, Heart, Star, ArrowRight, Menu, X } from 'lucide-react';

export default function SandaliLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });

  // Countdown timer
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

    return () => clearInterval(timer);
  }, []);

  const benefits = [
    {
      icon: '🦶',
      title: 'Corregge la Postura',
      description: 'Allineamento naturale del piede in pochi giorni'
    },
    {
      icon: '💧',
      title: 'Tecnologia FreshGel',
      description: 'Gel ammortizzante che riduce la pressione sui talloni'
    },
    {
      icon: '🌬️',
      title: 'Anti-Sudore',
      description: 'Materiali traspiranti che neutralizzano odori e umidità'
    },
    {
      icon: '🏥',
      title: 'Adatto ai Diabetici',
      description: 'Design medico approvato per piedi sensibili'
    }
  ];

  const problems = [
    {
      icon: '😣',
      title: 'Niente più piedi gonfi',
      description: 'Calzata larga e regolabile con materiali flessibili',
      image: '/api/placeholder/300/200'
    },
    {
      icon: '🦵',
      title: 'Sollievo per le gambe',
      description: 'Alleviano pressione e pesantezza alle gambe',
      image: '/api/placeholder/300/200'
    },
    {
      icon: '⚡',
      title: 'Basta dolori ai piedi',
      description: 'Supporto mirato all\'arco plantare e protezione del tallone',
      image: '/api/placeholder/300/200'
    },
    {
      icon: '👍',
      title: 'Miglioramento alluce',
      description: 'Punta larga che non comprime con design ergonomico',
      image: '/api/placeholder/300/200'
    }
  ];

  const testimonials = [
    {
      name: 'Maria Rossi',
      age: 52,
      text: 'Dopo anni di dolori ai piedi, finalmente posso camminare senza problemi. Li consiglio a tutti!',
      rating: 5
    },
    {
      name: 'Giuseppe Bianchi',
      age: 67,
      text: 'Perfetti per chi ha problemi di diabete. Comfort eccezionale e qualità italiana.',
      rating: 5
    },
    {
      name: 'Anna Verdi',
      age: 45,
      text: 'Li uso tutto il giorno al lavoro. I miei piedi non si gonfiano più e non sento dolore.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              FreshStep™
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#benefici" className="text-gray-700 hover:text-blue-600 transition-colors">Benefici</a>
              <a href="#testimonianze" className="text-gray-700 hover:text-blue-600 transition-colors">Reviews</a>
              <a href="#garanzia" className="text-gray-700 hover:text-blue-600 transition-colors">Garanzia</a>
            </nav>
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-4 py-4 space-y-4">
              <a href="#benefici" className="block text-gray-700">Benefici</a>
              <a href="#testimonianze" className="block text-gray-700">Reviews</a>
              <a href="#garanzia" className="block text-gray-700">Garanzia</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                🇮🇹 100% Made in Italy
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  FreshStep™
                </span>
                <br />
                Sandali Ortopedici Estivi
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Dì addio ai dolori ai piedi grazie al supporto ergonomico che trasforma
                ogni passo in un piacere. Comfort garantito tutto il giorno.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-lg p-4 hover:bg-white/80 transition-all duration-300">
                    <span className="text-2xl">{benefit.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Countdown Timer */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-6">
                <p className="text-sm font-medium mb-2">⏰ OFFERTA LIMITATA - Approfitta prima che torni a prezzo pieno</p>
                <div className="flex space-x-4 text-2xl font-bold">
                  <div className="text-center">
                    <div>{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs">ORE</div>
                  </div>
                  <div>:</div>
                  <div className="text-center">
                    <div>{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs">MIN</div>
                  </div>
                  <div>:</div>
                  <div className="text-center">
                    <div>{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs">SEC</div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-4 px-8 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl">
                  <span className="flex items-center justify-center space-x-2">
                    <span>ORDINA ORA - Spedizione in 24/48h</span>
                    <ArrowRight size={20} />
                  </span>
                </button>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Truck size={16} />
                    <span>Consegna 2-3 giorni</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield size={16} />
                    <span>30 giorni soddisfatti o rimborsati</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-green-400/20 rounded-full blur-3xl transform -rotate-6"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform hover:rotate-1 transition-transform duration-500">
                <img
                  src="/api/placeholder/500/400"
                  alt="Sandali Ortopedici FreshStep"
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm transform rotate-12">
                  SCONTO 50%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Solutions */}
      <section id="benefici" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Rivoluziona il Comfort dei Tuoi Piedi
            </h2>
            <p className="text-xl text-gray-600">
              Scopri come i nostri sandali risolvono i problemi più comuni dei piedi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600 mb-4">{problem.description}</p>
                <div className="w-full h-32 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Tecnologia <span className="text-blue-600">FreshGel</span> Avanzata
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="text-green-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Gel Ammortizzante</h3>
                    <p className="text-gray-600">Allevia la pressione sui talloni e riduce il dolore ai piedi</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="text-green-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Suola Antiscivolo</h3>
                    <p className="text-gray-600">Garantisce aderenza su ogni superficie ed evita scivolamenti</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="text-green-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Materiali Traspiranti</h3>
                    <p className="text-gray-600">Mantengono i piedi asciutti e freschi tutto il giorno</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="text-green-500 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Design Ergonomico</h3>
                    <p className="text-gray-600">Supporto mirato all'arco plantare e protezione del tallone</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8">
              <img
                src="/api/placeholder/600/400"
                alt="Tecnologia FreshGel"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonianze" className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quello che Dicono i Nostri Clienti
            </h2>
            <p className="text-xl text-gray-600">
              Migliaia di persone hanno già trasformato il comfort dei loro piedi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.age} anni</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Domande Frequenti
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Sono adatti per camminate lunghe?",
                a: "Sì, grazie alla talloniera ammortizzante e alla suola ergonomica, offrono comfort anche per lunghe camminate."
              },
              {
                q: "Posso usarli per lavorare in piedi?",
                a: "Assolutamente! Offrono supporto continuo, riducendo il dolore anche dopo ore in piedi."
              },
              {
                q: "Come scelgo la misura giusta?",
                a: "Consigliamo di ordinare la tua misura abituale. Se sei indecisa, scegli una taglia più grande per maggiore comfort."
              },
              {
                q: "Sono adatti per piedi larghi?",
                a: "Sì, la forma ampia e flessibile garantisce spazio e comfort anche per piedi larghi."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section id="garanzia" className="py-16 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Shield size={64} className="mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              Garanzia Soddisfatti o Rimborsati
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Prova i Sandali FreshStep™ senza rischi con la nostra garanzia di rimborso entro 30 giorni.
              Se non sei completamente soddisfatta, restituiscili per un rimborso totale.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="font-semibold mb-2">Prova 30 Giorni</h3>
                <p className="opacity-90">Tempo sufficiente per testare il comfort</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">↩️</span>
                </div>
                <h3 className="font-semibold mb-2">Reso Facile</h3>
                <p className="opacity-90">Processo di reso semplice e veloce</p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold mb-2">Rimborso Completo</h3>
                <p className="opacity-90">100% del denaro restituito</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Non Aspettare, i Tuoi Piedi Ti Ringrazieranno
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Unisciti a migliaia di persone che hanno già scelto il comfort FreshStep™
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:scale-105 transform transition-all duration-300 shadow-xl">
              ORDINA ORA - Spedizione Gratuita
            </button>

            <div className="flex items-center justify-center space-x-6 text-sm opacity-90">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Spedizione in 24/48h</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart size={16} />
                <span>Made in Italy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FreshStep™</h3>
              <p className="text-gray-400">
                Il comfort ortopedico Made in Italy per i tuoi piedi.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Prodotto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Caratteristiche</li>
                <li>Tecnologia FreshGel</li>
                <li>Taglie disponibili</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Supporto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>FAQ</li>
                <li>Spedizioni</li>
                <li>Resi e rimborsi</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contatti</h4>
              <ul className="space-y-2 text-gray-400">
                <li>info@freshstep.it</li>
                <li>+39 02 1234 5678</li>
                <li>Lun-Ven 9:00-18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FreshStep™. Tutti i diritti riservati. Made with ❤️ in Italy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}