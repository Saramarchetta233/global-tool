"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Upload, CheckCircle, Trophy, Star, Menu, X, ChevronDown, Mic, Brain, Calendar, Zap, BookOpen, Headphones, CreditCard, HelpCircle, FileText, Clock, Users, Shield, Diamond, Rocket } from "lucide-react";
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/lib/auth-context';

export default function StudiusOnetimePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const { user } = useAuth();

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.98]);

  // Track scroll for sticky button (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setShowStickyButton(scrollPercent > 8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePurchase = () => {
    if (!user) {
      window.location.href = '/onetime-register';
      return;
    }
    setShowPaymentModal(true);
  };

  const features = [
    {
      icon: Mic,
      title: "SIMULAZIONE ESAME ORALE",
      subtitle: "Preparati come se fossi già davanti al prof",
      description: "L'AI ti fa domande come farebbe il professore. Risponde alle tue risposte e ti corregge in tempo reale.",
      isHero: true
    },
    {
      icon: FileText,
      title: "QUIZ E SIMULAZIONI SCRITTE",
      subtitle: "Test personalizzati dal tuo materiale",
      description: "Quiz a risposta multipla e domande aperte con correzione AI. Feedback immediato e spiegazioni.",
      isHero: false
    },
    {
      icon: Brain,
      title: "TUTOR AI PERSONALE",
      subtitle: "Hai dubbi? Chiedi al tuo tutor AI",
      description: "Risponde a qualsiasi domanda sul materiale. Spiega i concetti difficili in modo semplice. Disponibile 24/7.",
      isHero: false
    },
    {
      icon: Calendar,
      title: "PIANO STUDIO INTELLIGENTE",
      subtitle: "Esame tra 5 giorni? Ti organizziamo noi",
      description: "Inserisci la data dell'esame, l'AI crea un piano giorno per giorno. Mai più 'non so da dove iniziare'.",
      isHero: false
    },
    {
      icon: Zap,
      title: "STUDIA IN 1 ORA",
      subtitle: "Per chi ha poco tempo",
      description: "L'AI estrae solo l'essenziale. Perfetto per ripassi last-minute quando il tempo stringe.",
      isHero: false
    },
    {
      icon: BookOpen,
      title: "RIASSUNTI AUTOMATICI",
      subtitle: "Carica il PDF, ricevi il riassunto",
      description: "Diversi livelli di dettaglio, formattati per essere studiati facilmente. Risparmi ore di lavoro.",
      isHero: false
    },
    {
      icon: Headphones,
      title: "AUDIO PODCAST",
      subtitle: "Studia mentre fai altro",
      description: "Trasforma i riassunti in audio. Studia mentre cammini, in palestra, sui mezzi. Voce naturale, non robotica.",
      isHero: false
    },
    {
      icon: CreditCard,
      title: "FLASHCARD INTELLIGENTI",
      subtitle: "Memorizza velocemente",
      description: "Generate automaticamente dal materiale. Sistema di ripetizione spaziata. Tracciamento del progresso.",
      isHero: false
    },
    {
      icon: HelpCircle,
      title: "DOMANDE PROBABILI",
      subtitle: "Ecco cosa ti chiederà il prof",
      description: "L'AI analizza il materiale e prevede le domande più probabili. Studia in modo strategico.",
      isHero: false
    },
    {
      icon: Clock,
      title: "RIPRENDI DOVE AVEVI LASCIATO",
      subtitle: "Non perdere mai il filo",
      description: "Interrompi e riprendi lo studio quando vuoi. L'AI ricorda tutto: progressi, risposte, sessioni di studio.",
      isHero: false
    },
    {
      icon: BookOpen,
      title: "CARICA UNA VOLTA, STUDIA PER SEMPRE",
      subtitle: "Il tuo archivio personale",
      description: "Tutti i tuoi documenti salvati per sempre. Torna a studiare lo stesso materiale anche dopo mesi, senza ricaricare nulla.",
      isHero: false
    }
  ];

  const testimonials = [
    { name: "Marco R.", uni: "Economia - Bocconi", text: "Ho passato Diritto Commerciale al primo colpo. L'esame orale simulato mi ha salvato!", rating: 5 },
    { name: "Giulia S.", uni: "Medicina - Statale Milano", text: "Anatomia in 3 giorni? Sembrava impossibile. StudiusAI mi ha organizzato tutto perfettamente.", rating: 5 },
    { name: "Lorenzo M.", uni: "Ingegneria - Polimi", text: "I riassunti automatici sono incredibili. Ho risparmiato almeno 20 ore per Analisi 2.", rating: 5 },
    { name: "Sara B.", uni: "Psicologia - Padova", text: "Il tutor AI è come avere un assistente personale. Risponde a tutte le mie domande, anche alle 2 di notte!", rating: 5 },
    { name: "Alessandro F.", uni: "Giurisprudenza - Bologna", text: "Le simulazioni d'esame sono identiche a quelle vere. Non ho mai avuto così poca ansia prima di un orale.", rating: 5 },
    { name: "Chiara V.", uni: "Lettere - Roma Tre", text: "La funzione 'Studia in 1 ora' mi ha salvato più volte. Perfetta per noi procrastinatori!", rating: 5 },
    { name: "Davide P.", uni: "Informatica - Sapienza", text: "I podcast audio sono geniali. Studio mentre vado in palestra. Multitasking al massimo!", rating: 5 },
    { name: "Elisa T.", uni: "Architettura - IUAV", text: "Ho passato Storia dell'Arte con 30. Le domande probabili erano ESATTAMENTE quelle dell'esame!", rating: 5 }
  ];

  const faqs = [
    {
      q: "Cosa succede se finisco i 4000 crediti?",
      a: "Puoi acquistare ricariche quando vuoi: 1000 crediti a €9.99, 3000 a €14.99, o 10000 a €39.99. Nessun abbonamento obbligatorio."
    },
    {
      q: "Che PDF posso caricare?",
      a: "Puoi caricare qualsiasi PDF di materiale di studio: slide, dispense, libri, appunti. Il sistema supporta file fino a 50MB e funziona con qualsiasi materia."
    },
    {
      q: "L'esame orale come funziona esattamente?",
      a: "Carichi il tuo materiale e l'AI diventa il professore. Ti fa domande vocali, tu rispondi a voce o scrivendo, e ricevi feedback immediato. È come fare pratica con un prof sempre disponibile."
    },
    {
      q: "Quanto durano i 4000 crediti?",
      a: "Con 4000 crediti puoi processare completamente circa 75-300 documenti (dipende dalle pagine). La maggior parte degli studenti li usa per tutto l'anno accademico."
    },
    {
      q: "È davvero un pagamento unico?",
      a: "Sì! Paghi €49 una volta sola e hai accesso per sempre a StudiusAI con 4000 crediti inclusi. Nessun abbonamento mensile o rinnovo automatico."
    },
    {
      q: "I riassunti sono affidabili?",
      a: "I riassunti mantengono tutti i concetti chiave del materiale originale. Puoi scegliere il livello di dettaglio: ultra-sintetico, normale o dettagliato."
    },
    {
      q: "Funziona anche per le superiori?",
      a: "Assolutamente sì! StudiusAI è perfetto per maturità, verifiche e interrogazioni delle superiori."
    },
    {
      q: "C'è la garanzia di rimborso?",
      a: "Certo! Se nei primi 30 giorni non sei completamente soddisfatto, ti rimborsiamo il 100%. Garanzia totale."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-md bg-gray-950/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                StudiusAI
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-400 transition-colors">Funzionalità</a>
              <a href="#how-it-works" className="hover:text-purple-400 transition-colors">Come Funziona</a>
              <a href="#testimonials" className="hover:text-purple-400 transition-colors">Recensioni</a>
              <button onClick={handlePurchase} className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105">
                Acquista Ora - €49
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 hover:text-purple-400 transition-colors">Funzionalità</a>
              <a href="#how-it-works" className="block py-2 hover:text-purple-400 transition-colors">Come Funziona</a>
              <a href="#testimonials" className="block py-2 hover:text-purple-400 transition-colors">Recensioni</a>
              <button onClick={handlePurchase} className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-full text-center hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                Acquista Ora - €49
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden w-full">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-6xl mx-auto text-center w-full"
        >
          {/* Special Offer Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full mb-6 border border-yellow-500/30"
          >
            <Diamond className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-300">OFFERTA SPECIALE • SOLO €49 INVECE DI €199</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Passa da <span className="text-red-400 line-through">22</span> a{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text">
              30
            </span>
            <br />
            studiando il{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
              75% in meno
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            Carica il PDF, l'AI fa il resto. Riassunti, quiz, simulazioni d'esame orali e scritte. Tutto in automatico!
            <span className="text-purple-300 font-semibold"><br></br> Nessun abbonamento, nessun rinnovo.</span>
          </motion.p>

          {/* Value Props */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Rocket className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-semibold">Attivazione Immediata</p>
              <p className="text-sm text-gray-200">Inizia subito a studiare</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">Garanzia 30 Giorni</p>
              <p className="text-sm text-gray-200">Soddisfatti o rimborsati</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <Diamond className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold">Accesso Lifetime</p>
              <p className="text-sm text-gray-200">Paghi una volta sola</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-purple-500/30 mb-12"
          >
            <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
              €49
            </div>
            <p className="text-xl text-gray-300 mb-2">
              <span className="line-through text-gray-500">€199</span> • Risparmi €150
            </p>
            <p className="text-2xl font-semibold text-purple-300 mb-6">
              4000 crediti inclusi • Accesso per sempre
            </p>

            <button
              onClick={handlePurchase}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 mb-4"
            >
              <span className="relative z-10">🚀 Acquista StudiusAI Premium</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span>💳 Pagamento sicuro</span>
              <span>⚡ Attivazione istantanea</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <a
              href="#demo-video"
              className="px-8 py-4 border border-white/20 rounded-full text-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2 justify-center"
            >
              <Play size={20} />
              Vedi come funziona
            </a>
          </motion.div>

          {/* Hero Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10 mt-12"
          >
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-colors cursor-pointer">
                  <Play size={32} className="ml-1" />
                </div>
                <p className="text-gray-400">Video Demo (16:9) - Placeholder</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Social Proof Bar */}
      <section className="py-8 px-4 bg-purple-900/20 border-y border-purple-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">15.000+</p>
                <p className="text-sm text-gray-200">Esami Superati</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">27,5</p>
                <p className="text-sm text-gray-200">Voto Medio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-gray-200">Promossi al 1° tentativo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">-75%</p>
                <p className="text-sm text-gray-200">Tempo di Studio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perché il 73% degli studenti è in difficoltà</h2>
            <p className="text-xl text-gray-200">Non è colpa tua: stai usando metodi obsoleti</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { icon: Clock, title: "200+ ore per esame", desc: "La maggior parte sprecate in riassunti" },
              { icon: Brain, title: "Panico all'orale", desc: "Zero pratica = massima ansia" },
              { icon: FileText, title: "Non sai cosa studiare", desc: "Tutto sembra importante" },
              { icon: Calendar, title: "Sempre in ritardo", desc: "Studio last-minute inefficace" }
            ].map((problem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 hover:bg-red-500/15 transition-all"
              >
                <problem.icon className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                <p className="text-gray-200 text-sm">{problem.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Solution Transition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-block">
              <ChevronDown className="w-12 h-12 text-purple-400 animate-bounce mb-4" />
              <h2 className="text-5xl font-bold mb-4">
                La Soluzione: <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">StudiusAI Premium</span>
              </h2>
              <p className="text-xl text-gray-300">Un solo investimento per rivoluzionare il tuo modo di studiare</p>
            </div>
          </motion.div>

          {/* Before/After Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-white/10"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4 text-red-400">Prima 😰</h3>
                <div className="bg-gray-800/50 rounded-xl p-6 h-48 flex items-center justify-center">
                  <p className="text-gray-500">Immagine/GIF Before - Placeholder</p>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4 text-green-400">Dopo 🚀</h3>
                <div className="bg-gray-800/50 rounded-xl p-6 h-48 flex items-center justify-center">
                  <p className="text-gray-500">Immagine/GIF After - Placeholder</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is StudiusAI Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              StudiusAI: Il tuo <span className="text-purple-400">tutor personale</span> basato su AI
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Carica qualsiasi materiale di studio (PDF, slide, dispense) e l'intelligenza artificiale
              ti prepara all'esame con simulazioni, riassunti, quiz e un piano di studio personalizzato.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
                <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="font-semibold">Carica PDF</p>
              </div>
              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="font-semibold">AI Analizza</p>
              </div>
              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="font-semibold">Genera Tutto</p>
              </div>
              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/30">
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="font-semibold">Passi l'Esame</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tutto incluso con l'accesso Premium</h2>
            <p className="text-xl text-gray-200">4000 crediti per usare tutte le funzionalità senza limiti</p>
          </motion.div>

          {/* Hero Feature - Oral Exam Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl p-8 md:p-12 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full mb-4">
                    <Star className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-purple-300">FEATURE PRINCIPALE</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3">
                    <Mic className="w-10 h-10 text-purple-400" />
                    SIMULAZIONE ESAME ORALE
                  </h3>
                  <p className="text-xl text-purple-300 mb-4">Preparati come se fossi già davanti al prof</p>
                  <p className="text-gray-300 mb-6">
                    L'AI diventa il tuo professore virtuale. Ti fa domande come farebbe all'esame,
                    ascolta le tue risposte e ti corregge in tempo reale. Niente più ansia,
                    arrivi all'esame già preparato su tutto.
                  </p>
                  <button
                    onClick={handlePurchase}
                    className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                  >
                    <Play size={20} />
                    Attiva subito per €49
                  </button>
                </div>
                <div className="bg-gray-800/50 rounded-2xl p-6 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <Mic className="w-16 h-16 text-purple-400 mb-4 mx-auto" />
                    <p className="text-gray-500">Video Demo Esame Orale - Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.filter(f => !f.isHero).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all hover:bg-gray-900/80"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                      <p className="text-purple-300 text-sm mb-2">{feature.subtitle}</p>
                      <p className="text-gray-200 text-sm">{feature.description}</p>
                    </div>
                  </div>

                  {/* Feature Screenshot Placeholder */}
                  <div className="mt-4 bg-gray-800/50 rounded-lg p-4 aspect-video flex items-center justify-center">
                    <p className="text-gray-600 text-xs">Screenshot/GIF - {feature.title}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* New Features Highlight */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/40 to-blue-900/40">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-full mb-4 border border-green-500/30">
              <Rocket className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-green-300">NOVITÀ 2025</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Le funzioni che cambiano tutto
            </h2>
            <p className="text-xl text-gray-200">Studia come vuoi, quando vuoi, senza limiti</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Riprendi Dove Avevi Lasciato</h3>
                  <p className="text-gray-200 mb-3">
                    Studia 10 minuti in pausa pranzo? Riprendi la sera esattamente dove eri.
                    L'AI ricorda tutto: le tue risposte, i tuoi progressi, le tue sessioni.
                  </p>
                  <p className="text-purple-300 font-semibold text-sm">
                    ✨ Perfetto per chi ha poco tempo continuativo
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-6 border border-green-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <BookOpen className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Carica Una Volta, Studia Per Sempre</h3>
                  <p className="text-gray-200 mb-3">
                    Hai caricato Anatomia 6 mesi fa? È ancora lì!
                    Tutti i tuoi documenti salvati per sempre nel tuo archivio personale.
                  </p>
                  <p className="text-green-300 font-semibold text-sm">
                    ✨ Mai più "dov'è quel PDF che avevo caricato?"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-gray-950 to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Come Funziona</h2>
            <p className="text-xl text-gray-200">Attiva e inizia subito a studiare meglio</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: CreditCard, title: "1. Acquista l'accesso", desc: "Pagamento unico di €49. Attivazione immediata." },
              { icon: Upload, title: "2. Carica i tuoi PDF", desc: "Slide, dispense, libri. Qualsiasi materiale di studio." },
              { icon: Trophy, title: "3. Domina gli esami", desc: "Usa tutti gli strumenti AI per studiare efficacemente." }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronDown className="w-8 h-8 text-purple-400 rotate-[-90deg]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Tutorial Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10"
          >
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-colors cursor-pointer">
                  <Play size={32} className="ml-1" />
                </div>
                <p className="text-gray-400">Video Tutorial (30-60 sec) - Placeholder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Strategy Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Come <span className="text-green-400">superare gli esami</span> in tempo record
            </h2>
            <p className="text-xl text-gray-300">La strategia dei top performer universitari, ora disponibile per tutti</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-red-500/20 rounded-xl p-6 border border-red-500/30 h-full flex flex-col">
                  <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">❌ Studio Tradizionale</h3>
                  <p className="text-white font-semibold mb-4 text-2xl">300+ ore per esame</p>
                  <ul className="text-left text-base text-red-200 space-y-2 flex-grow">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Riassunti manuali (50+ ore)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Studio senza strategia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Ansia da "non so cosa chiedono"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Ripasso inefficace</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-red-500/30">
                    <p className="text-lg text-gray-300">Voto medio:</p>
                    <p className="text-3xl font-bold text-red-400">22</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30 h-full flex flex-col">
                  <Rocket className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3">✅ Con StudiusAI</h3>
                  <p className="text-white font-semibold mb-4 text-2xl">50-80 ore per esame</p>
                  <ul className="text-left text-base text-green-200 space-y-2 flex-grow">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Riassunti AI istantanei</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Piano studio personalizzato</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Simulazioni esame incluse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>Domande probabili previste</span>
                    </li>
                  </ul>
                  <div className="mt-6 pt-4 border-t border-green-500/30">
                    <p className="text-lg text-gray-300">Voto medio:</p>
                    <p className="text-3xl font-bold text-green-400">27+</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl p-6 border border-green-500/30">
              <div className="text-5xl font-black text-green-400 mb-2">75%</div>
              <div className="text-xl font-bold">TEMPO DI STUDIO RISPARMIATO</div>
              <div className="text-gray-300">Più tempo libero, voti più alti, meno stress</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-purple-900/30 rounded-xl p-4 text-center border border-purple-500/30">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="font-bold">15.000+</p>
                <p className="text-sm text-gray-400">Esami superati con 27+</p>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-4 text-center border border-purple-500/30">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="font-bold">89%</p>
                <p className="text-sm text-gray-400">Passa al primo tentativo</p>
              </div>
              <div className="bg-purple-900/30 rounded-xl p-4 text-center border border-purple-500/30">
                <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="font-bold">4.9/5</p>
                <p className="text-sm text-gray-400">Valutazione studenti</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Studenti che hanno già scelto l'accesso lifetime</h2>
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">15.000+</p>
                <p className="text-gray-200">Studenti Premium</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">50.000+</p>
                <p className="text-gray-200">Esami superati</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">98%</p>
                <p className="text-gray-200">Tasso di successo</p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.uni}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic">&ldquo;{testimonial.text}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section id="demo-video" className="py-20 px-4 bg-gradient-to-b from-gray-950 to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Guarda StudiusAI in azione</h2>
            <p className="text-xl text-gray-200">2 minuti per capire perché vale ogni centesimo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10 shadow-2xl"
          >
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-colors cursor-pointer">
                  <Play size={40} className="ml-1" />
                </div>
                <p className="text-gray-300 text-lg">Video Demo Completo (16:9) - Placeholder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-y border-red-500/20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">
            ⚠️ Offerta limitata: solo €49 invece di €199
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Questa offerta speciale potrebbe terminare in qualsiasi momento. Blocca il prezzo ora!
          </p>
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">847</div>
              <div className="text-gray-400">Acquisti oggi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">98%</div>
              <div className="text-gray-400">Soddisfazione</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">30</div>
              <div className="text-gray-400">Giorni garanzia</div>
            </div>
          </div>
          <button
            onClick={handlePurchase}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            🔥 Blocca il prezzo di €49 adesso
          </button>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-purple-950/20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Domande Frequenti</h2>
            <p className="text-xl text-gray-200">Tutto quello che devi sapere sull'accesso lifetime</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-900/80 transition-all"
                >
                  <span className="text-left font-semibold">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform ${openFAQ === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFAQ === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-gray-300">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Un investimento nel tuo <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">futuro accademico</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            €49 oggi per risparmiare migliaia di euro e centinaia di ore nei prossimi anni
          </p>

          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-8 max-w-2xl mx-auto border border-purple-500/30 mb-8">
            <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
              €49
            </div>
            <p className="text-xl text-gray-300 mb-2">
              <span className="line-through text-gray-500">€199</span> • Offerta speciale
            </p>
            <p className="text-2xl font-semibold text-purple-300 mb-6">
              4000 crediti • Accesso lifetime • Garanzia 30 giorni
            </p>

            <button
              onClick={handlePurchase}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 py-4 rounded-full text-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 mb-4"
            >
              🚀 Sì, voglio StudiusAI Premium per sempre
            </button>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mt-6">
              <div className="flex flex-col items-center">
                <Shield className="w-6 h-6 mb-1 text-green-400" />
                <span>Pagamento sicuro</span>
              </div>
              <div className="flex flex-col items-center">
                <Zap className="w-6 h-6 mb-1 text-yellow-400" />
                <span>Attivazione istantanea</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-6 h-6 mb-1 text-purple-400" />
                <span>Garanzia rimborso</span>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-lg">
            Unisciti a <span className="text-purple-400 font-bold">15.000+ studenti</span> che hanno già scelto l'accesso lifetime
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                StudiusAI
              </span>
              <p className="text-sm text-gray-300 mt-1">© 2025 StudiusAI. Tutti i diritti riservati.</p>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Termini di Servizio</a>
              <a href="#" className="hover:text-white transition-colors">Contatti</a>
            </div>

            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-xs">IG</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-xs">FB</span>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-xs">TW</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Purchase Button - Mobile Only */}
      {showStickyButton && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm z-40 md:hidden">
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={handlePurchase}
            className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
          >
            🔓 Accedi Ora - €49
          </motion.button>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        userId={user?.id || ''}
        version="2"
        planType="onetime"
      />
    </div>
  );
}