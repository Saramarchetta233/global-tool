'use client';

import { CheckCircle, ChevronRight, Clock, DollarSign, Rocket, Star, Target, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const GlobalToolFactory = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroTools = [
    { name: "Studius AI", desc: "Trasforma PDF in riassunti e flashcard", color: "bg-blue-500" },
    { name: "ResumePerfect AI", desc: "Ottimizzazione CV con intelligenza artificiale", color: "bg-red-500" },
    { name: "AutoReport AI", desc: "Report automatici delle performance pubblicitarie", color: "bg-purple-500" },
    { name: "ProductTurbo AI", desc: "Descrizioni prodotti ad alta conversione", color: "bg-green-500" },
    { name: "MediaKit Instant", desc: "Media kit professionali per influencer", color: "bg-yellow-500" },
    { name: "RealEstate AutoListing", desc: "Annunci immobiliari da foto", color: "bg-indigo-500" }
  ];

  const allTools = [
    { name: "Studius AI", desc: "Trasforma qualsiasi PDF in riassunti, flashcard e quiz", status: "live" },
    { name: "ResumePerfect AI", desc: "Generatore CV con AI e ottimizzazione ATS", status: "planning" },
    { name: "AutoReport AI", desc: "Report automatici performance Google/Meta Ads", status: "planning" },
    { name: "ProductTurbo AI", desc: "Descrizioni prodotti e-commerce ad alta conversione", status: "planning" },
    { name: "MediaKit Instant", desc: "Media kit professionali per influencer", status: "planning" },
    { name: "RealEstate AutoListing", desc: "Annunci immobiliari da foto e dettagli", status: "planning" },
    { name: "CoachLesson Builder", desc: "Trasforma audio in slide professionali", status: "planning" },
    { name: "SocialPost Generator", desc: "Creatore contenuti social virali", status: "planning" },
    { name: "FitnessPlan AI", desc: "Piani allenamento personalizzati e nutrizione", status: "planning" },
    { name: "MealPrep AI", desc: "Piani pasto personalizzati con liste spesa", status: "planning" },
    { name: "AI Interview Coach", desc: "Colloqui simulati con feedback in tempo reale", status: "planning" },
    { name: "FaceNotes AI", desc: "Note vocali in documenti PDF strutturati", status: "planning" },
    { name: "ParentHelper AI", desc: "Consigli genitoriali e sviluppo bambini", status: "planning" },
    { name: "BioLink AI", desc: "Bio link intelligenti che convertono follower", status: "planning" },
    { name: "ContractBuilder Lite", desc: "Contratti legali semplici per freelancer", status: "planning" },
    { name: "Ecommerce Angle Finder", desc: "Angoli prodotto vincenti e copy pubblicitari", status: "planning" },
    { name: "Thumbnail Wizard", desc: "Generatore thumbnail YouTube ad alto CTR", status: "planning" },
    { name: "JobSearch Accelerator", desc: "Ottimizzazione e tracciamento ricerca lavoro", status: "planning" },
    { name: "CreatorDeals AI", desc: "Ricerca partnership brand per creator", status: "planning" },
    { name: "VAT Helper", desc: "Assistente conformità fiscale internazionale", status: "planning" }
  ];

  const opportunities = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "L'Onda Perfetta",
      desc: "Come il dropshipping nel 2017 - chi entra ora vince tutto"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Tecnologia Pronta",
      desc: "AI tools in 48h con Claude - impossibile 2 anni fa!"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Mercato Globale Affamato",
      desc: "Tutti vogliono AI tools ma nessuno li sa creare velocemente"
    }
  ];

  const marketProof = [
    { stat: "€95,000", desc: "Un creator italiano ha guadagnato vendendo flashcard fatte a mano (senza AI)" },
    { stat: "€25-60k/mese", desc: "Ricavi dei costruttori CV su IndieHackers" },
    { stat: "€18-45k/mese", desc: "Guadagni generatori post AI sui social" },
    { stat: "€35-90k/mese", desc: "Ricavi mensili tool riassunto PDF" }
  ];

  const timeline = [
    {
      month: "Dicembre 2024",
      title: "🚀 Lancio Aggressivo",
      investment: "€300",
      revenue: "€0",
      goals: [
        "Finalizza Studius AI e inizia vendite",
        "Prime 100 vendite con ads Facebook/TikTok",
        "Raccogli feedback e ottimizza il funnel",
        "Investi tutto in ads per crescere"
      ]
    },
    {
      month: "Gennaio 2025",
      title: "🔥 Primo Tool che Converte",
      investment: "€500",
      revenue: "€2.500",
      goals: [
        "Scala Studius AI a 500+ utenti",
        "Lancia ResumePerfect AI",
        "Primo mese positivo: €2k+ entrate",
        "Automation del customer service"
      ]
    },
    {
      month: "Febbraio 2025",
      title: "⚡ Doppio Tool, Doppi Ricavi",
      investment: "€800",
      revenue: "€5.200",
      goals: [
        "Studius AI: €3k/mese + ResumePerfect: €2k/mese",
        "Sviluppa ProductTurbo AI",
        "Primi creator TikTok che promuovono",
        "Assumi primo VA per gestione ordini"
      ]
    },
    {
      month: "Marzo 2025",
      title: "🎯 3 Tool = €10k/mese",
      investment: "€1.200",
      revenue: "€12.500",
      goals: [
        "ProductTurbo AI: €5k/mese aggiuntivi",
        "Primo tool che genera €10k+ al mese",
        "Sistemi di affiliate marketing",
        "Preparazione per Q2"
      ]
    },
    {
      month: "Giugno 2025",
      title: "🌍 Espansione Globale",
      investment: "€2.000",
      revenue: "€25.000",
      goals: [
        "6 tool attivi che generano €20k+/mese",
        "Mercati: USA, UK, Germania, Spagna",
        "Team di 3 persone",
        "Prime acquisizioni corporate"
      ]
    },
    {
      month: "Dicembre 2025",
      title: "👑 Brand Milionario",
      investment: "€5.000",
      revenue: "€50.000+",
      goals: [
        "12 tool attivi, ognuno €3-8k/mese",
        "500k+ utenti totali",
        "Valutazione brand €1M+",
        "Preparazione exit o serie A"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                Global Tool <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Factory™</span>
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-gray-300">
                Strumenti AI che risolvono problemi reali — a livello globale.
              </p>
              <p className="text-lg mb-4 text-blue-300 font-semibold">
                🌍 Tool AI che conquistano il mondo intero
              </p>
              <p className="text-lg mb-8 text-gray-400 italic">
                Il futuro dei tool AI inizia qui. Saremo il riferimento globale.
              </p>

              <div className="flex justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2" onClick={() => window.open('/test', '_blank')}>
                  🚀 Prova Studius AI Live <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {heroTools.map((tool, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <div className={`w-10 h-10 ${tool.color} rounded-lg mb-3 flex items-center justify-center`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
                  <p className="text-xs text-gray-300 leading-tight">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Now Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">I Numeri Che Contano</h2>
            <div className="max-w-6xl mx-auto mb-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">€500</div>
                  <div className="text-sm text-blue-700 font-medium">Investimento Iniziale</div>
                  <div className="text-xs text-blue-600 mt-1">Claude + Tools + Hosting</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">70%</div>
                  <div className="text-sm text-green-700 font-medium">Margine Netto</div>
                  <div className="text-xs text-green-600 mt-1">Zero logistica, zero stock</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">€50k+</div>
                  <div className="text-sm text-purple-700 font-medium">Target 12 Mesi</div>
                  <div className="text-xs text-purple-600 mt-1">Ricavi mensili ricorrenti</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">€1M+</div>
                  <div className="text-sm text-red-700 font-medium">Valutazione Brand</div>
                  <div className="text-xs text-red-600 mt-1">Exit potenziale</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {opportunities.map((opportunity, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center border border-blue-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
                  {opportunity.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{opportunity.title}</h3>
                <p className="text-gray-600">{opportunity.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">🎯 La Formula del Successo</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-green-600 mb-2">500€</div>
                <div className="text-sm text-gray-600">Investimento iniziale</div>
                <div className="text-xs text-gray-500 mt-1">Claude + PDF.co + Hosting + Domini</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">70%</div>
                <div className="text-sm text-gray-600">Margine di profitto</div>
                <div className="text-xs text-gray-500 mt-1">Nessuna logistica, stock o costi fisici</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">Scalabilità globale</div>
                <div className="text-xs text-gray-500 mt-1">Vendi in tutto il mondo senza limiti</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg text-gray-700 leading-relaxed">
                Creiamo tool una volta e li vendiamo infinite volte. <span className="font-bold text-slate-900">È il business perfetto.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Ecosystem */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">🏰 L'Impero dei Tool AI: 12 Macchine da Soldi</h2>
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">💪 La Strategia Vincente</h3>
                <p className="text-lg text-gray-700 mb-2">
                  Ogni tool parte da un <span className="font-bold text-orange-600">input complesso</span> (PDF, foto, audio)
                  e restituisce <span className="font-bold text-red-600">soluzioni immediate</span> che le persone non sanno fare da sole.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl mb-2">🎯</div>
                  <p className="font-semibold text-slate-900">1 Input → Soluzione Completa</p>
                  <p className="text-sm text-gray-600 mt-1">PDF → Tutto per studiare</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl mb-2">🌍</div>
                  <p className="font-semibold text-slate-900">Vendita Globale Automatica</p>
                  <p className="text-sm text-gray-600 mt-1">24/7 in tutte le lingue</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="font-semibold text-slate-900">Ricavi Ricorrenti</p>
                  <p className="text-sm text-gray-600 mt-1">€19-49/mese per tool</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allTools.map((tool, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{tool.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{tool.desc}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.status === 'live'
                      ? 'bg-blue-100 text-blue-800'
                      : tool.status === 'development'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {tool.status === 'live' ? '✅ LIVE' : tool.status === 'development' ? '🚀 In Sviluppo' : '📋 Pianificato'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* StudyFlash AI Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              🔥 Studius AI — Il Nostro Primo Tool di Alto Valore
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="bg-gray-100 rounded-2xl p-8 min-h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <p className="text-gray-600 text-lg font-semibold">Interfaccia Studius AI</p>
                <button
                  onClick={() => window.open('/test', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold mt-4 transition-colors"
                >
                  🚀 Prova il Tool Live
                </button>
              </div>
            </div>

            <div>
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-6">
                  Trasforma qualsiasi PDF in un pacchetto di studio completo con strumenti AI per cui gli studenti vogliono davvero pagare.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Carica PDF → Riassunti Istantanei</h4>
                      <p className="text-gray-600">Riassunti brevi ed estesi generati automaticamente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Generatore Flashcard Intelligenti</h4>
                      <p className="text-gray-600">L'AI crea carte Q&A perfette per la memorizzazione</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Mappe Concettuali & Mentali</h4>
                      <p className="text-gray-600">Apprendimento visuale con organizzazione gerarchica dei concetti</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Modalità Quiz Interattivi</h4>
                      <p className="text-gray-600">Testa le conoscenze con domande a risposta multipla generate dall'AI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Modalità "Studia in 1 Ora"</h4>
                      <p className="text-gray-600">Sessioni di studio ottimizzate per la massima ritenzione</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900">Supporto Multilingue</h4>
                      <p className="text-gray-600">Funziona in italiano, inglese, spagnolo, polacco, rumeno</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 mb-6">
                <h4 className="font-bold text-lg text-slate-900 mb-4">🚀 Perché Studius AI è una macchina da soldi:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Un creator ha fatto €95k in 6 mesi</strong> vendendo flashcard MANUALI - noi le facciamo con AI</li>
                  <li>• <strong>Studenti globali spendono miliardi</strong> per strumenti di studio ogni anno</li>
                  <li>• <strong>Virale su TikTok garantito</strong> - contenuto perfetto per short format</li>
                  <li>• <strong>Input: PDF → Output: Tutto quello che serve per studiare</strong> - valore percepito altissimo</li>
                </ul>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4">Strategia di Prezzo:</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">€19</div>
                      <div className="text-sm opacity-80">Piano Base</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">€99</div>
                      <div className="text-sm opacity-80">Lifetime Deal</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">5k</div>
                      <div className="text-sm opacity-80">crediti/mese</div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <h5 className="font-semibold text-blue-300 mb-2">🎯 Sistema Crediti</h5>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>• 1 Riassunto = 10 crediti</p>
                      <p>• 1 Set Flashcard = 15 crediti</p>
                      <p>• 1 Quiz = 12 crediti</p>
                      <p className="text-yellow-400 font-medium mt-2">Crediti extra: €0.02 cad.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Model */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">La Nostra Strategia di Monetizzazione</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Abbonamenti</h3>
              <div className="space-y-2">
                <div className="text-lg font-semibold">€19/mese</div>
                <div className="text-lg font-semibold">€29/mese</div>
                <div className="text-lg font-semibold">€49/mese</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Offerte a Vita</h3>
              <div className="space-y-2">
                <div className="text-lg font-semibold">€79 a vita</div>
                <div className="text-lg font-semibold">€99 a vita</div>
                <div className="text-lg font-semibold">€149 a vita</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Cross-Selling Intelligente</h3>
              <div className="space-y-3 text-left">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="font-semibold text-purple-700">Studente → ResumePerfect</div>
                  <div className="text-sm text-purple-600">"Ora che hai finito di studiare, ottimizza il tuo CV"</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-semibold text-blue-700">Freelancer → ProductTurbo</div>
                  <div className="text-sm text-blue-600">"Crea descrizioni prodotti per i tuoi clienti"</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-semibold text-green-700">Marketer → AutoReport</div>
                  <div className="text-sm text-green-600">"Report automatici per le tue campagne"</div>
                </div>
                <div className="text-center mt-4">
                  <div className="text-lg font-bold text-purple-600">€10-25 upsell per utente</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Prova Gratuita — 3 Giorni</h3>
            <p className="text-lg opacity-90">Piano gratuito include: 1 riassunto o 1 ottimizzazione CV</p>
          </div>
        </div>
      </section>

      {/* Market Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Esempi Reali — Questo Mercato Sta Già Funzionando</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {marketProof.map((proof, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">{proof.stat}</div>
                <p className="text-gray-700 text-sm leading-tight">{proof.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-2xl p-8 text-center">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4">🗣️ La Verità Cruda</h3>
            </div>
            <div className="space-y-4 text-lg">
              <p className="text-blue-200 font-semibold">
                "Questi mercati esistono GIÀ. La gente paga GIÀ. Noi prendiamo quello che funziona
                e lo automatizziamo con AI."
              </p>
              <p className="text-purple-200 italic">
                Non stiamo inventando - stiamo <span className="font-bold text-white">dominando</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Projection */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Previsioni a 12 Mesi</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-8 border border-blue-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300 mb-2">Dopo 3 Tool</div>
                <div className="text-4xl font-bold mb-4 text-white">€19.200/mese</div>
                <div className="text-gray-300">Entrate Ricorrenti</div>
                <div className="mt-6 h-3 bg-blue-800 rounded-full">
                  <div className="h-full bg-blue-400 rounded-full w-1/3 transition-all duration-1000"></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-8 border border-green-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300 mb-2">Dopo 12 Tool</div>
                <div className="text-4xl font-bold mb-4 text-white">€31.500-58.500/mese</div>
                <div className="text-gray-300">Entrate Ricorrenti</div>
                <div className="mt-6 h-3 bg-green-800 rounded-full">
                  <div className="h-full bg-green-400 rounded-full w-full transition-all duration-1000"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 inline-block">
              <div className="text-2xl font-bold mb-2">Potenziale Fatturato Annuo</div>
              <div className="text-5xl font-bold">€225K - €450K+</div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">🗓️ Piano Preciso: Da 0 a €50k/mese in 12 Mesi</h2>
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Questo non è un sogno. È un <span className="font-bold text-green-600">business plan reale</span> con
                  numeri concreti, investimenti minimi e obiettivi raggiungibili mese per mese.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {timeline.map((period, index) => (
              <div key={index} className="relative">
                <div className="grid lg:grid-cols-4 gap-6">
                  {/* Timeline Header */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-6 text-center">
                      <div className="text-sm opacity-80 mb-2">📅</div>
                      <h3 className="text-xl font-bold mb-2">{period.month}</h3>
                      <div className="text-2xl mb-1">{period.title}</div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="lg:col-span-1">
                    <div className="h-full bg-white rounded-2xl p-6 border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-4 text-center">💰 Finanze</h4>
                      <div className="space-y-3">
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-sm text-red-600">Investimento</div>
                          <div className="font-bold text-red-700">{period.investment}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-sm text-green-600">Entrate</div>
                          <div className="font-bold text-green-700">{period.revenue}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="lg:col-span-2">
                    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        🎯 Obiettivi Concreti
                      </h4>
                      <ul className="space-y-3">
                        {period.goals.map((goal, goalIndex) => (
                          <li key={goalIndex} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {index < timeline.length - 1 && (
                  <div className="flex justify-center my-6">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-purple-400"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-3xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">💎 Il Risultato Finale</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-4xl font-bold mb-2">€50k+</div>
                <div className="opacity-90">Ricavi mensili ricorrenti</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">12</div>
                <div className="opacity-90">Tool AI attivi</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">€1M+</div>
                <div className="opacity-90">Valutazione del brand</div>
              </div>
            </div>
            <p className="mt-6 text-xl opacity-90">
              Un business che può essere venduto o continuare a crescere per sempre.
            </p>
          </div>
        </div>
      </section>

      {/* Team & Future */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Dove Stiamo Andando</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Ora</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Due fondatori</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Costruisci e vendi tool direttamente</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Iterazione e test rapidi</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Feedback diretto dal mercato</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">12 Mesi</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>Sviluppatori che costruiscono tool per noi</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>Media buyer che gestiscono annunci</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>Creator TikTok che creano contenuti</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>12+ tool che generano entrate</span>
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <span>Sistemi di crescita automatizzati</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Global Tool: Il Riferimento Mondiale per i Tool AI</h2>
          <p className="text-xl mb-8 text-gray-300 leading-relaxed">
            Non stiamo solo creando tool. Stiamo costruendo <span className="text-blue-400 font-bold">IL BRAND</span> che ogni persona
            al mondo conoscerà quando avrà bisogno di un tool AI. Come Amazon per l'ecommerce,
            come Google per la ricerca. <span className="text-purple-400 font-bold">Global Tool per l'AI.</span>
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-3">🌍 Brand Globale</h3>
              <p className="text-gray-300 text-sm">
                Ogni tool che lanciamo rinforza il nostro brand. Tra 2 anni saremo il punto di riferimento.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-3">🔥 Business Scalabile</h3>
              <p className="text-gray-300 text-sm">
                12 tool che generano ognuno €3-8k/mese = €50k+ mensili ricorrenti.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-3">💎 Exit Milionario</h3>
              <p className="text-gray-300 text-sm">
                Un portafoglio di tool con questi ricavi vale minimo €1M+. E possiamo venderlo.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => window.open('/test', '_blank')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-12 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center gap-3"
            >
              <Rocket className="w-6 h-6" />
              🚀 Costruiamo il Brand del Futuro
            </button>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open('/test', '_blank')}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                🔥 Prova Studius AI Ora
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                📊 Vedi i Numeri Completi
              </button>
            </div>
          </div>
          <p className="mt-6 text-gray-400 text-lg">
            Il primo milione è solo l'inizio. <span className="text-blue-400 font-semibold">Puntiamo a diventare il brand da 100M€.</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-2xl font-bold text-white mb-4">Global Tool Factory™</div>
          <p>Costruiamo il futuro degli strumenti AI, una soluzione alla volta.</p>
          <p className="mt-2 text-blue-400 font-semibold">🌍 Global Tool Factory • Il Futuro è Qui</p>
          <div className="mt-6 text-sm">
            <span>© 2024 Global Tool Factory. Tutti i diritti riservati.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GlobalToolFactory;