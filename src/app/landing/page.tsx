'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    level: 'A2',
    newsletter: false
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      setScrollProgress(scrollPercent)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openModal = () => {
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setShowSuccessScreen(false)
    document.body.style.overflow = 'auto'
  }

  const validateForm = () => {
    const errors: { [key: string]: boolean } = {}
    
    if (!formData.firstName.trim()) {
      errors.firstName = true
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = true
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setShowSuccessScreen(true)
      setIsSubmitting(false)
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Remove error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: false }))
    }
  }

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  const faqItems = [
    {
      question: "Czy ten przewodnik jest dla początkujących?",
      answer: "Przewodnik jest idealny dla osób na poziomie A2-B2, które znają podstawy włoskiego i chcą poznać żywy język używany w kontekście kulturowym."
    },
    {
      question: "Czy to naprawdę darmowe?",
      answer: "Tak! Przewodnik jest całkowicie bezpłatny. Wystarczy podać email, a PDF otrzymasz natychmiast."
    },
    {
      question: "Co dostanę po pobraniu?",
      answer: "Natychmiast po wpisaniu emaila otrzymasz link do pobrania przewodnika w formacie PDF. Dodatkowo zapiszesz się na nasz newsletter z darmowymi lekcjami."
    },
    {
      question: "Czy mogę udostępnić przewodnik znajomym?",
      answer: "Przewodnik jest do użytku osobistego, ale Twoi znajomi mogą go pobrać tutaj za darmo!"
    },
    {
      question: "A co po przewodniku?",
      answer: "Jeśli spodobało Ci się to, co znajdziesz w przewodniku, będę miała dla Ciebie specjalną ofertę na kurs 1:1, gdzie pomogę Ci opanować włoski na poziomie native speakera."
    },
    {
      question: "Jak długo przewodnik będzie dostępny?",
      answer: "To specjalna edycja świąteczna dostępna tylko do końca grudnia 2025."
    }
  ]

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-red-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-green-600 to-red-500 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <a href="#" className="text-2xl font-bold text-green-600 font-serif">
            Studio Dialoghi
          </a>
          <button 
            onClick={openModal}
            className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-all duration-300 hover:scale-105 text-sm"
          >
            POBIERZ BEZPŁATNY PRZEWODNIK
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-white to-gray-50 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-green-50 to-red-50 opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-red-500 uppercase tracking-wider">
                🎄 EDYCJA SPECJALNA BOŻE NARODZENIE 2025
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-green-600 font-serif">
                Te Święta Mów Po Włosku<br />Jak Prawdziwy Włoch
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Pobierz darmowy przewodnik z tradycjami, słownictwem i sekretami kulturowymi, których nie znajdziesz w żadnym podręczniku
              </p>

              <div className="inline-flex items-center bg-gradient-to-r from-orange-50 to-red-50 px-6 py-3 rounded-full border-2 border-orange-100">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Dostępne tylko do końca grudnia
              </div>

              <button 
                onClick={openModal}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-5 rounded-full text-lg font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 inline-flex items-center gap-3"
              >
                POBIERAM DARMOWY PRZEWODNIK
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <ul className="space-y-3 text-green-600 font-medium">
                <li className="flex items-center gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  14 stron pełnej immersji w kulturę
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  Stworzone przez Polkę mieszkającą we Włoszech
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  Natychmiastowy dostęp - PDF do pobrania
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-orange-50 rounded-3xl shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-gray-100 to-gray-200">
                  <button className="w-20 h-20 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-all duration-300 hover:scale-110 backdrop-blur-sm">
                    <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-green-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-16 flex-wrap">
            <div className="flex items-center gap-3 font-semibold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span><span className="text-xl font-bold text-orange-100">2847</span>+ Polaków już pobrało przewodnik</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span><span className="text-xl font-bold text-orange-100">4.9</span>/5 średnia ocena</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Polecane przez Italian Language Academy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-800 font-serif">
            W Tym Przewodniku Odkryjesz...
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {[
              { icon: "🎄", title: "AUTENTYCZNE TRADYCJE", desc: "Od Panettone vs Pandoro po Tombolę - poznaj zwyczaje z każdego regionu Włoch" },
              { icon: "📚", title: "80+ SŁÓW I WYRAŻEŃ", desc: "Słownictwo którego używają prawdziwi Włosi (nie podręcznikowe!)" },
              { icon: "🏠", title: "REGIONALNE RÓŻNICE", desc: "Co jedzą w Neapolu vs Milano? Kiedy się otwiera prezenty?" },
              { icon: "🎬", title: "FILMY I PIOSENKI", desc: "Lista must-watch filmów i świątecznych hitów do nauki języka" },
              { icon: "🎯", title: "QUIZY I ĆWICZENIA", desc: "Interaktywne zadania do utrwalenia wiedzy" },
              { icon: "💬", title: "ZWROTY KONWERSACYJNE", desc: "\"Anche a te e famiglia!\" - naucz się życzyć po włosku jak native" }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-3xl text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group border-2 border-transparent hover:border-orange-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 font-serif">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-800 font-serif">
            Zajrzyj Do Środka...
          </h2>
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-100 aspect-[3/4] rounded-2xl shadow-2xl mb-8 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300">
              <span className="text-2xl text-gray-500 font-medium">Podgląd strony przewodnika</span>
            </div>
            
            <div className="flex justify-center gap-4 mb-12">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-gray-300'} cursor-pointer hover:scale-125 transition-transform duration-200`} />
              ))}
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 font-serif">
                To tylko fragment! Pełny przewodnik zawiera:
              </h3>
              <ul className="space-y-4 text-left max-w-lg mx-auto">
                {[
                  "14 stron kompletnej immersji kulturowej",
                  "Ilustracje i zdjęcia autentycznych tradycji", 
                  "Słowniczek polsko-włoski",
                  "Linki do dodatkowych materiałów"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-4 font-medium">
                    <span className="text-green-600 font-bold text-lg">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-[300px_1fr] gap-16 items-center">
            <div className="mx-auto">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-green-600 to-red-500 flex items-center justify-center text-white text-8xl shadow-2xl">
                👩‍🏫
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 font-serif">
                Cześć, jestem Magda 👋
              </h2>
              <div className="space-y-5 text-lg text-gray-600 leading-relaxed">
                <p>
                  Jestem Polką, która zakochała się we Włoszech i przez lata zgłębiała nie tylko język, ale przede wszystkim kulturę, tradycje i sposób myślenia Włochów.
                </p>
                <p>
                  Jako native speaker polskiego doskonale rozumiem, z jakimi wyzwaniami mierzą się Polacy uczący się włoskiego. Nie chodzi tylko o gramatykę - chodzi o zrozumienie DUSZY tego języka.
                </p>
                <p>
                  Ten przewodnik to efekt lat doświadczenia i pasji do nauczania. Chcę, żebyś mówił po włosku nie tylko poprawnie, ale autentycznie.
                </p>
              </div>
              <button 
                onClick={openModal}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 mt-6"
              >
                Gotowy na pierwszy krok? →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-800 font-serif">
            Często Zadawane Pytania
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <button 
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-8 text-left flex justify-between items-center hover:bg-orange-50 transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-gray-800">{item.question}</span>
                  <span className={`text-2xl text-red-500 transition-transform duration-300 ${activeFAQ === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === index ? 'max-h-48 pb-8' : 'max-h-0'}`}>
                  <p className="px-8 text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-red-500 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 font-serif drop-shadow-lg">
            Zacznij Mówić Po Włosku Jak Włoch<br />Już Od Dzisiaj 🇮🇹
          </h2>
          <p className="text-2xl mb-12 opacity-90">
            Pobierz darmowy przewodnik i zrób pierwszy krok do prawdziwej płynności
          </p>
          <button 
            onClick={openModal}
            className="bg-white text-gray-800 px-12 py-6 rounded-full text-xl font-bold hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 mb-8"
          >
            POBIERAM PRZEWODNIK TERAZ →
          </button>
          <p className="text-lg opacity-80 italic">
            ⏰ Oferta specjalna kończy się 31 grudnia
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-8 mb-6">
            <a href="#" className="hover:text-orange-200 transition-colors duration-200">Polityka Prywatności</a>
            <a href="#" className="hover:text-orange-200 transition-colors duration-200">Kontakt</a>
            <a href="#" className="hover:text-orange-200 transition-colors duration-200">Regulamin</a>
          </div>
          <p>&copy; 2025 Studio Dialoghi. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-3xl text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              ×
            </button>
            
            {!showSuccessScreen ? (
              <>
                <h2 className="text-3xl font-bold mb-4 text-gray-800 font-serif">
                  🎁 Ostatni Krok Do Twojego Darmowego Przewodnika!
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Wpisz swoje dane, a za chwilę otrzymasz przewodnik "Natale all'Italiana" na swojego maila.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="firstName" className="block mb-2 font-semibold text-gray-700">
                      Twoje imię
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Jak masz na imię?"
                      className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-colors duration-200 ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-2">Proszę podaj swoje imię</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">
                      Twój email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="twoj@email.pl"
                      className={`w-full px-4 py-4 border-2 rounded-xl text-lg transition-colors duration-200 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-200 focus:border-green-500'
                      } focus:outline-none`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-2">Proszę podaj prawidłowy adres email</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="level" className="block mb-2 font-semibold text-gray-700">
                      Twój poziom włoskiego
                    </label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-green-500 focus:outline-none transition-colors duration-200"
                    >
                      <option value="A2">Znam podstawy (A2)</option>
                      <option value="B1">Średniozaawansowany (B1)</option>
                      <option value="B2">Zaawansowany (B2)</option>
                      <option value="other">Wolę nie mówić</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600"
                    />
                    <label htmlFor="newsletter" className="text-gray-600">
                      Tak, chcę otrzymywać darmowe lekcje i wskazówki (opcjonalne)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-5 rounded-xl text-lg font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mb-6"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Wysyłanie...
                      </span>
                    ) : (
                      'POBIERZ PRZEWODNIK ZA DARMO →'
                    )}
                  </button>

                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Twoje dane są bezpieczne
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Bez spamu, obiecuję
                    </span>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Natychmiastowy dostęp
                    </span>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-6 animate-bounce">✅</div>
                <h2 className="text-3xl font-bold mb-4 text-gray-800 font-serif">
                  Udało Się! Sprawdź Swoją Skrzynkę 📬
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Twój przewodnik "Natale all'Italiana" czeka w Twojej skrzynce mailowej!
                </p>
                
                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                  <p className="font-semibold mb-2">Nie widzisz maila?</p>
                  <p className="text-gray-600">
                    → Sprawdź folder SPAM<br />
                    → Dodaj nas do kontaktów
                  </p>
                </div>
                
                <button 
                  onClick={closeModal}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-xl text-lg font-bold hover:shadow-lg transition-all duration-300 hover:-translate-y-1 mb-6"
                >
                  ZAMKNIJ
                </button>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl">
                  <p className="text-sm">
                    <strong>💡 Podczas gdy czekasz...</strong> Czy wiesz, że Włosi jedzą Panettone przez cały styczeń? Więcej takich ciekawostek znajdziesz w przewodniku!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}