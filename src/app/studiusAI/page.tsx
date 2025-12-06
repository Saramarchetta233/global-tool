"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Upload, CheckCircle, Trophy, Star, Menu, X, ChevronDown, Mic, Brain, Calendar, Zap, BookOpen, Headphones, CreditCard, HelpCircle, FileText, Clock, Users } from "lucide-react";

export default function StudiusAILanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 200], [1, 0.98]);

  const features = [
    {
      icon: Mic,
      title: "SIMULAZIONE ESAME ORALE",
      subtitle: "Preparati come se fossi già davanti al prof",
      description: "L'AI ti fa domande come farebbe il professore. Risponde alle tue risposte e ti corregge in tempo reale.",
      isHero: true,
      cta: "Prova l'esame orale gratis"
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
      q: "Come funziona la prova gratuita?",
      a: "Ricevi 120 crediti gratuiti appena ti registri. Puoi usarli per provare tutte le funzionalità: caricare PDF, generare riassunti, fare simulazioni d'esame. Zero carte di credito richieste."
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
      q: "Posso usarlo per qualsiasi materia?",
      a: "Sì! StudiusAI funziona con qualsiasi materia: scientifiche, umanistiche, tecniche. L'AI si adatta al contenuto del tuo PDF."
    },
    {
      q: "I riassunti sono affidabili?",
      a: "I riassunti mantengono tutti i concetti chiave del materiale originale. Puoi scegliere il livello di dettaglio: ultra-sintetico, normale o dettagliato."
    },
    {
      q: "Posso cancellare quando voglio?",
      a: "Certo! L'abbonamento mensile può essere cancellato in qualsiasi momento. Nessun vincolo, nessuna penale."
    },
    {
      q: "Funziona anche per le superiori?",
      a: "Assolutamente sì! StudiusAI è perfetto per maturità, verifiche e interrogazioni delle superiori."
    },
    {
      q: "Il lifetime access cosa include?",
      a: "Include accesso illimitato a tutte le funzionalità attuali e future. Paghi una volta sola 69 € e usi StudiusAI per sempre. Nessun abbonamento, nessun rinnovo."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/10 to-gray-950 text-white">
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
              <a href="#pricing" className="hover:text-purple-400 transition-colors">Prezzi</a>
              <Link href="/app" className="bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105">
                Prova Gratis
              </Link>
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
              <a href="#pricing" className="block py-2 hover:text-purple-400 transition-colors">Prezzi</a>
              <Link href="/app" className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 rounded-full text-center hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                Prova Gratis
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <motion.div
          style={{ opacity, scale }}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full mb-6 border border-purple-500/30"
          >
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm">Usato da 15.000+ studenti</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Smetti di studiare<br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
              come nel 2010
            </span>
            <br />
            Passa gli esami con l'AI.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Carica il PDF, l'AI fa il resto. Riassunti, quiz, simulazioni d'esame orali e scritte.
            <span className="text-purple-400 font-semibold"> Tutto in automatico.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/app"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:scale-105"
            >
              <span className="relative z-10">Prova Gratis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

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
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-white/10"
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
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Il Problema</h2>
            <p className="text-xl text-gray-400">Studiare nel 2024 con metodi del secolo scorso</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { icon: Clock, title: "Ore perse a fare riassunti", desc: "Mentre potresti già studiare" },
              { icon: Brain, title: "Ansia pre-esame orale", desc: "Non sai cosa ti chiederanno" },
              { icon: FileText, title: "Materiale troppo lungo", desc: "500 pagine per un esame?" },
              { icon: Calendar, title: "Tempo troppo poco", desc: "L'esame è domani e sei a pagina 10" }
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
                <p className="text-gray-400 text-sm">{problem.desc}</p>
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
                La Soluzione: <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">StudiusAI</span>
              </h2>
              <p className="text-xl text-gray-300">L'intelligenza artificiale che studia con te</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tutto quello che ti serve per passare gli esami</h2>
            <p className="text-xl text-gray-400">Un arsenale completo di strumenti AI per studiare meglio e più velocemente</p>
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
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105"
                  >
                    <Play size={20} />
                    Prova l'esame orale gratis
                  </Link>
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
                      <p className="text-gray-400 text-sm">{feature.description}</p>
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
            <p className="text-xl text-gray-400">3 semplici step per rivoluzionare il tuo modo di studiare</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: Upload, title: "1. Carica il PDF", desc: "Slide, dispense, libri. Qualsiasi materiale di studio." },
              { icon: CheckCircle, title: "2. Scegli cosa generare", desc: "Riassunti, quiz, simulazioni. Tu decidi cosa ti serve." },
              { icon: Trophy, title: "3. Studia e passa l'esame", desc: "Con gli strumenti giusti, passare diventa più facile." }
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

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Studenti che hanno già cambiato modo di studiare</h2>
            <div className="flex justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">15.000+</p>
                <p className="text-gray-400">Studenti</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">50.000+</p>
                <p className="text-gray-400">Esami superati</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400">200.000+</p>
                <p className="text-gray-400">Ore risparmiate</p>
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
            <p className="text-xl text-gray-400">2 minuti per capire come può cambiarti la vita universitaria</p>
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
                <p className="text-gray-400 text-lg">Video Demo Completo (16:9) - Placeholder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Scegli il piano giusto per te</h2>
            <p className="text-xl text-gray-400">Inizia gratis o risparmia con il lifetime access</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Trial Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="absolute -top-3 left-8 bg-purple-500 text-white text-sm px-4 py-1 rounded-full">
                PIÙ POPOLARE
              </div>
              <h3 className="text-3xl font-bold mb-2">Prova Gratuita</h3>
              <p className="text-gray-400 mb-6">Inizia subito, zero carte di credito</p>

              <div className="mb-6">
                <p className="text-4xl font-bold mb-2">
                  120 crediti <span className="text-lg text-gray-400">gratis</span>
                </p>
                <p className="text-gray-400">Poi 19,99€/mese</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Tutte le funzionalità sbloccate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Simulazioni esame illimitate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Tutor AI sempre disponibile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Cancella quando vuoi</span>
                </li>
              </ul>

              <Link
                href="/app"
                className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 py-4 rounded-full text-center font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105"
              >
                Inizia la Prova Gratuita
              </Link>
            </motion.div>

            {/* Lifetime Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-3xl p-8 border border-purple-500/30 hover:border-purple-500/50 transition-all"
            >
              <div className="absolute -top-3 left-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm px-4 py-1 rounded-full">
                MIGLIOR VALORE
              </div>
              <h3 className="text-3xl font-bold mb-2">Lifetime Access</h3>
              <p className="text-gray-400 mb-6">Paghi una volta, usi per sempre</p>

              <div className="mb-6">
                <p className="text-4xl font-bold mb-2">
                  69€ <span className="text-lg text-gray-400 line-through">199€</span>
                </p>
                <p className="text-purple-400 font-semibold">Offerta limitata -75%</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Accesso a vita a tutto</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Aggiornamenti futuri inclusi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Nessun abbonamento mensile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Supporto prioritario</span>
                </li>
              </ul>

              <Link
                href="/app"
                className="block w-full bg-white text-gray-900 py-4 rounded-full text-center font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Compra Ora
              </Link>
              <p className="text-center text-sm text-gray-400 mt-3">Pagamento sicuro, garanzia 30 giorni</p>
            </motion.div>
          </div>
        </div>
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
            <p className="text-xl text-gray-400">Tutto quello che devi sapere su StudiusAI</p>
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
                    <p className="text-gray-400">{faq.a}</p>
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
            Il prossimo esame lo passi con <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">StudiusAI</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Unisciti a 15.000+ studenti che hanno già cambiato modo di studiare
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/25 transition-all transform hover:scale-105"
            >
              Prova Gratis
            </Link>
            <Link
              href="/app"
              className="px-8 py-4 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              Compra Lifetime
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>15.000+ studenti</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>50.000+ esami superati</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>200.000+ ore risparmiate</span>
            </div>
          </div>
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
              <p className="text-sm text-gray-400 mt-1">© 2024 StudiusAI. Tutti i diritti riservati.</p>
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
    </div>
  );
}