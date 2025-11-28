'use client';

import React from 'react';
import { ArrowRight, FileText, Brain, Target, Check, Star, ChevronDown, ChevronUp, Upload, Zap, Crown, Shield, Rocket, Award, TrendingUp, Users, Clock, BookOpen, Calculator, Diamond } from 'lucide-react';

const StudiusOnetimePage = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFakePurchase = async () => {
    setIsProcessing(true);
    
    // Simula processo di pagamento
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      // Dopo 2 secondi, reindirizza alla pagina di registrazione onetime
      setTimeout(() => {
        window.location.href = '/onetime-register';
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Premium */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-black pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-70 animate-pulse delay-1000"></div>
        
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            {/* Premium Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30 text-yellow-400 px-6 py-3 rounded-full text-sm font-bold mb-8 backdrop-blur-sm">
              <Crown className="w-4 h-4 mr-2" />
              STUDIUS AI PREMIUM • ACCESSO ILLIMITATO
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
              Smetti di Studiare.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Inizia a Dominare
              </span>
            </h1>
            
            <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              L'unico strumento di studio AI che trasforma qualsiasi PDF in un sistema di apprendimento automatico. 
              <span className="text-yellow-400 font-bold">4000 crediti inclusi.</span> Nessun abbonamento. Per sempre.
            </p>
            
            {/* Value Props Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <Rocket className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Risultati Immediati</h3>
                <p className="text-gray-300">Da 0 a esperto in 1 ora con l'AI</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Garanzia 30 Giorni</h3>
                <p className="text-gray-300">Soddisfatti o rimborsati al 100%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <Diamond className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Accesso Lifetime</h3>
                <p className="text-gray-300">Paghi una volta, usi per sempre</p>
              </div>
            </div>

            {/* CTA Premium */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 max-w-2xl mx-auto border-4 border-yellow-400/30 shadow-2xl">
              <div className="text-center">
                <div className="text-6xl font-black text-black mb-2">€49</div>
                <div className="text-black font-bold text-xl mb-4">Pagamento Unico • 4000 Crediti Inclusi</div>
                <div className="text-black/80 mb-6">
                  <span className="line-through text-lg">€299 valore</span> → 
                  <span className="text-2xl font-bold ml-2">€49 oggi</span>
                </div>
                <button 
                  onClick={handleFakePurchase}
                  disabled={isProcessing || showSuccess}
                  className="w-full bg-black text-white font-bold py-4 px-8 rounded-2xl text-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                      Elaborando pagamento...
                    </span>
                  ) : showSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      ✅ Pagamento completato! Reindirizzamento...
                    </span>
                  ) : (
                    '🚀 ACCEDI SUBITO A STUDIUS AI PREMIUM'
                  )}
                </button>
                <p className="text-black/70 text-sm mt-3">
                  ⚡ Attivazione istantanea • 💳 Pagamento sicuro • 🔒 Soddisfatti o rimborsati
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Già <span className="text-indigo-600">12.847 studenti</span> hanno rivoluzionato il loro studio
            </h2>
            <div className="flex justify-center items-center gap-2 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xl font-bold text-gray-700 ml-2">4.9/5 • 2.847 recensioni</span>
            </div>
          </div>

          {/* Testimonials Premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 font-medium">
                "Ho passato Diritto Costituzionale con 29/30 studiando solo 3 giorni. 
                Studius AI ha fatto tutto il lavoro per me: riassunti perfetti, quiz mirati, tutto automatico."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <p className="font-bold text-gray-900">Marco T.</p>
                  <p className="text-sm text-gray-600">Giurisprudenza, Bocconi</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 font-medium">
                "Matematica era il mio incubo. Ora con Studius AI genero esercizi illimitati 
                e capisco ogni passaggio. Da 15 a 27. Non ci credevo nemmeno io."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sofia L.</p>
                  <p className="text-sm text-gray-600">Ingegneria, Politecnico</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 font-medium">
                "Con 300 pagine di Anatomia, pensavo di non farcela mai. 
                Studius AI mi ha creato 2000 flashcard perfette. Promossa al primo colpo!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  A
                </div>
                <div>
                  <p className="font-bold text-gray-900">Anna R.</p>
                  <p className="text-sm text-gray-600">Medicina, Statale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            Calcola quanto <span className="text-yellow-400">risparmi</span> con Studius AI
          </h2>
          
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Studio Tradizionale</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ripetizioni private:</span>
                    <span className="font-bold text-red-600">€300/mese</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Libri e materiali:</span>
                    <span className="font-bold text-red-600">€150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corsi online:</span>
                    <span className="font-bold text-red-600">€99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">App di studio:</span>
                    <span className="font-bold text-red-600">€29/mese</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Totale 6 mesi:</span>
                    <span className="text-red-600">€2.124</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Con Studius AI</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Studius AI Premium:</span>
                    <span className="font-bold text-green-600">€49</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">4000 crediti inclusi:</span>
                    <span className="font-bold text-green-600">€0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ricariche (se necessarie):</span>
                    <span className="font-bold text-green-600">€30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aggiornamenti:</span>
                    <span className="font-bold text-green-600">€0</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Totale 6 mesi:</span>
                    <span className="text-green-600">€79</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6">
              <div className="text-5xl font-black text-green-600 mb-2">€2.045</div>
              <div className="text-xl font-bold text-gray-800">RISPARMI IN 6 MESI</div>
              <div className="text-gray-600">Più del 96% di sconto rispetto ai metodi tradizionali</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tutto quello di cui hai bisogno per <span className="text-indigo-600">dominare qualsiasi esame</span>
            </h2>
            <p className="text-xl text-gray-600">4000 crediti = fino a 400 documenti processati completamente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Riassunti Intelligenti</h3>
              <p className="text-gray-600">L'AI estrae automaticamente i concetti chiave e crea riassunti perfetti per il ripasso</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Flashcard Automatiche</h3>
              <p className="text-gray-600">Migliaia di flashcard generate istantaneamente con il sistema di ripetizione spaziata</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Mirati</h3>
              <p className="text-gray-600">Quiz personalizzati con domande probabili d'esame e spiegazioni dettagliate</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Piano Studio 1 Ora</h3>
              <p className="text-gray-600">Strategie di studio ottimizzate per imparare qualsiasi argomento in tempi record</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mappe Concettuali</h3>
              <p className="text-gray-600">Visualizza le connessioni tra i concetti con mappe interattive generate automaticamente</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tutor AI Personale</h3>
              <p className="text-gray-600">Conversazioni illimitate con l'AI per chiarire dubbi e approfondire argomenti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            ⚠️ ATTENZIONE: Prezzo in aumento tra
          </h2>
          <div className="text-6xl font-black mb-6">
            47 ore
          </div>
          <p className="text-xl mb-8">
            Il prezzo passerà da €49 a €99. Approfitta ora dell'offerta di lancio!
          </p>
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold">12.847</div>
              <div className="text-pink-200">Studenti attivi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">847</div>
              <div className="text-pink-200">Iscrizioni oggi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">97%</div>
              <div className="text-pink-200">Tasso successo</div>
            </div>
          </div>
          <button className="bg-white text-red-600 font-bold py-4 px-12 rounded-2xl text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
            🔥 BLOCCA IL PREZZO DI €49 ADESSO
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Domande Frequenti
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Cosa succede se finisco i 4000 crediti?",
                answer: "Puoi acquistare ricariche quando vuoi: 1000 crediti a €9.99, 3000 a €14.99, o 10000 a €39.99. Nessun abbonamento obbligatorio."
              },
              {
                question: "Quanto durano i 4000 crediti?",
                answer: "Con 4000 crediti puoi processare completamente circa 100-400 documenti (dipende dalle pagine). La maggior parte degli studenti li usa per tutto l'anno accademico."
              },
              {
                question: "È davvero un pagamento unico?",
                answer: "Sì! Paghi €49 una volta sola e hai accesso per sempre a Studius AI con 4000 crediti inclusi. Nessun abbonamento mensile o rinnovo automatico."
              },
              {
                question: "Funziona con qualsiasi tipo di documento?",
                answer: "Sì! PDF, slide PowerPoint, appunti Word, libri di testo, articoli scientifici. Studius AI elabora tutto automaticamente."
              },
              {
                question: "C'è davvero la garanzia di rimborso?",
                answer: "Assolutamente! Se nei primi 30 giorni non sei completamente soddisfatto, ti rimborsiamo ogni centesimo. Senza domande."
              },
              {
                question: "È sicuro pagare online?",
                answer: "Al 100%! Usiamo la stessa tecnologia di sicurezza delle banche più importanti. I tuoi dati di pagamento sono protetti e crittografati."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-5xl font-bold mb-6">
            Il momento è <span className="text-yellow-400">ADESSO</span>
          </h2>
          <p className="text-2xl mb-12 text-gray-300">
            Non rimandare il tuo successo. Ogni giorno che aspetti è un giorno in più di studio difficile e stressante.
          </p>
          
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-8 max-w-2xl mx-auto border-4 border-yellow-400/30 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl font-black text-black mb-4">€49</div>
              <div className="text-black font-bold text-2xl mb-6">4000 Crediti • Accesso Lifetime • Nessun Abbonamento</div>
              <button className="w-full bg-black text-white font-bold py-6 px-8 rounded-2xl text-2xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-xl mb-6">
                🚀 SÌ, VOGLIO STUDIUS AI PREMIUM
              </button>
              <div className="grid grid-cols-3 gap-4 text-black/80 text-sm">
                <div>
                  <Shield className="w-6 h-6 mx-auto mb-1" />
                  <div>Pagamento Sicuro</div>
                </div>
                <div>
                  <Zap className="w-6 h-6 mx-auto mb-1" />
                  <div>Attivazione Istantanea</div>
                </div>
                <div>
                  <Award className="w-6 h-6 mx-auto mb-1" />
                  <div>Garanzia 30 Giorni</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-400 mt-8 text-lg">
            Unisciti a <span className="text-yellow-400 font-bold">12.847 studenti</span> che hanno già rivoluzionato il loro modo di studiare
          </p>
        </div>
      </section>
    </div>
  );
};

export default StudiusOnetimePage;