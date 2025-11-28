'use client';

import React from 'react';
import { ArrowRight, FileText, Brain, Target, Check, Star, ChevronDown, ChevronUp, Upload, Zap } from 'lucide-react';

const StudiusLandingPage = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
              Nuovo • AI study assistant
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Studiare è difficile.<br />
              <span className="text-indigo-600">Con l'AI lo rendiamo</span><br />
              10 volte più semplice.
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Studius AI trasforma i tuoi PDF, appunti e slide in riassunti, flashcard,
              mappe concettuali e quiz pronti per l'esame.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <div className="flex items-center text-green-600 font-medium">
                <Check className="w-5 h-5 mr-2" />
                Dimezza il tempo di studio
              </div>
              <div className="flex items-center text-green-600 font-medium">
                <Check className="w-5 h-5 mr-2" />
                Memorizza di più con meno sforzo
              </div>
              <div className="flex items-center text-green-600 font-medium">
                <Check className="w-5 h-5 mr-2" />
                Preparati agli esami con sicurezza
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => window.open('/test-v3', '_blank')}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              >
                Provala gratis!
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => scrollToSection('demo')}
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Guarda come funziona
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Riassunto</h3>
                  <p className="text-sm text-gray-600">Concetti chiave estratti automaticamente</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <Brain className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Flashcard</h3>
                  <p className="text-sm text-gray-600">Per memorizzare velocemente</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Quiz</h3>
                  <p className="text-sm text-gray-600">Verifica la tua preparazione</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
            Studiare oggi è un problema.<br />
            <span className="text-red-600">E tu lo sai bene.</span>
          </h2>

          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Programmi infiniti, appunti lunghi e disordinati, impossibile memorizzare tutto.
              Perdi tempo a riassumere invece che capire.
            </p>
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              ChatGPT ti dà risposte generiche e disordinate che non ti aiutano davvero a preparare l'esame.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              E alla fine arrivi all'esame con l'ansia di non aver fatto abbastanza.
            </p>
          </div>

          <div className="bg-indigo-600 text-white rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Studius AI si occupa del lavoro pesante al posto tuo.
            </h3>
            <p className="text-lg opacity-90">
              Tu ti concentri su quello che conta davvero: capire e ricordare.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Come funziona in 4 semplici step
            </h2>
            <p className="text-xl text-gray-600">
              Dal caos degli appunti all'esame superato. Ecco come.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Carica i tuoi materiali</h3>
              <p className="text-gray-600">
                PDF, slide, appunti digitali, scansioni. Studius AI li trasforma nel punto di partenza perfetto.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ottieni riassunti chiari</h3>
              <p className="text-gray-600">
                Riassunti brevi per ripassi veloci + versioni estese per capire a fondo.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Memorizza con flashcard e mappe</h3>
              <p className="text-gray-600">
                Genera flashcard e mappe concettuali mirate sui concetti chiave.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mettiti alla prova con i quiz</h3>
              <p className="text-gray-600">
                Quiz a risposta multipla per capire se sei davvero pronto per l'esame.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.open('/test-v3', '_blank')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Inizia ora – Provala gratis!
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold mb-4">Dentro l'app</p>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
              Tutto quello che ti serve,<br />
              in un unico spazio di studio.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Riassunti intelligenti</h3>
                  <p className="text-gray-600">
                    L'AI estrae automaticamente i concetti più importanti e li organizza in modo logico e facile da seguire.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flashcard generate in automatico</h3>
                  <p className="text-gray-600">
                    Domande e risposte pronte per la memorizzazione attiva, il metodo più efficace per ricordare.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz che ti mostrano dove sei debole</h3>
                  <p className="text-gray-600">
                    Test mirati che identificano le tue lacune e ti suggeriscono su cosa concentrarti di più.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Materiale di Studio</h4>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Pronto</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Riassunto Breve</span>
                      <span className="text-blue-600 text-sm">2 min di lettura</span>
                    </div>
                    <p className="text-sm text-gray-600">I concetti fondamentali in 5 punti chiave</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">25 Flashcard</span>
                      <span className="text-purple-600 text-sm">15 min</span>
                    </div>
                    <p className="text-sm text-gray-600">Domande e risposte per memorizzare</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Quiz (10 domande)</span>
                      <span className="text-green-600 text-sm">5 min</span>
                    </div>
                    <p className="text-sm text-gray-600">Verifica la tua preparazione</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16">
            Cosa cambia davvero quando<br />
            inizi a usare Studius AI?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Studi più veloce</h3>
              <p className="text-gray-600">
                Niente più ore perse a fare riassunti. L'AI fa il lavoro pesante, tu ti concentri su capire e ricordare.
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ricordi di più nel lungo periodo</h3>
              <p className="text-gray-600">
                Le flashcard e i quiz ti aiutano a consolidare la memoria a lungo termine, non solo per l'esame.
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">⏱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Smetti di sprecare ore a fare riassunti</h3>
              <p className="text-gray-600">
                Il tempo risparmiato lo usi per capire meglio la materia o per avere una vita sociale.
              </p>
            </div>

            <div className="bg-orange-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Arrivi all'esame con un piano chiaro</h3>
              <p className="text-gray-600">
                Sai esattamente cosa ripassare e quanto tempo ci vuole. Niente più ansia dell'ultimo minuto.
              </p>
            </div>

            <div className="bg-red-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Niente più ansia da programma infinito</h3>
              <p className="text-gray-600">
                Quando vedi tutto organizzato e sotto controllo, l'ansia da esame diminuisce drasticamente.
              </p>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Focus sui concetti, non sulla forma</h3>
              <p className="text-gray-600">
                L'AI si occupa dell'organizzazione, tu puoi dedicarti a capire veramente la materia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16">
            Non è magia. È un metodo.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Per l'esame più pesante della sessione ho usato solo i riassunti e le flashcard di Studius AI.
                Ho risparmiato settimane di lavoro."
              </p>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Giulia</p>
                <p className="text-sm text-gray-500">Medicina, Università di Milano</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Prima perdevo ore a fare schemi, adesso inizio dal materiale già pronto.
                È come avere un assistente personale che non dorme mai."
              </p>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Marco</p>
                <p className="text-sm text-gray-500">Ingegneria, Politecnico di Torino</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">
                "I quiz mi hanno fatto capire dove ero debole prima dell'esame.
                Sono arrivata preparata su tutto, non solo su quello che credevo di sapere."
              </p>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Sara</p>
                <p className="text-sm text-gray-500">Giurisprudenza, Università di Roma</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Prezzi pensati per studenti,<br />
            non per aziende.
          </h2>
          <p className="text-xl text-gray-600 mb-16">
            Scegli il piano che fa per te. Puoi sempre cambiare idea.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Consigliato
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Piano Mensile</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">19€</span>
                <span className="text-gray-500">/mese</span>
              </div>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Accesso completo a tutte le funzioni</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Riassunti, flashcard, mappe e quiz illimitati</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Supporto email prioritario</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Aggiornamenti automatici</span>
                </li>
              </ul>
              <button
                onClick={() => window.open('/test-v3', '_blank')}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Inizia la prova gratuita!
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Piano Lifetime</h3>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">99€</span>
                <span className="text-gray-500"> una volta sola</span>
              </div>
              <p className="text-purple-600 font-medium mb-6">Offerta di lancio</p>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Accesso a vita alla versione attuale di Studius AI</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Ideale per chi ha ancora 2-3 anni di università</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Risparmia oltre 200€ rispetto al piano mensile</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span>Nessun rinnovo, nessuna preoccupazione</span>
                </li>
              </ul>
              <button
                onClick={() => window.open('/test-v3', '_blank')}
                className="w-full bg-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Sblocca accesso a vita
              </button>
            </div>
          </div>

          <p className="text-gray-500 mt-8 max-w-2xl mx-auto">
            Nessun vincolo. Puoi annullare quando vuoi direttamente dal tuo account.
            La prova gratuita non ti impegna a nulla.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Domande frequenti
            </h2>
            <p className="text-xl text-gray-600">
              Tutto quello che vuoi sapere su Studius AI
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Come funziona la prova gratuita?",
                answer: "Ti registri, accedi a tutte le funzioni senza pagare niente. Se decidi di continuare, puoi scegliere l'abbonamento. Se non ti convince non paghi nulla."
              },
              {
                question: "Posso disdire prima che venga addebitato il primo pagamento?",
                answer: "Assolutamente sì. Puoi annullare in qualsiasi momento durante la prova gratuita dal tuo account. Non ti verrà addebitato niente e non devi spiegare il motivo."
              },
              {
                question: "Studius AI sostituisce il mio studio?",
                answer: "No, lo potenzia. Studius AI fa il lavoro pesante (riassunti, organizzazione, flashcard) così tu puoi concentrarti su capire e memorizzare. È come avere un assistente che prepara tutto il materiale, ma studiare lo devi fare tu."
              },
              {
                question: "Posso usarlo per qualsiasi materia?",
                answer: "Sì. Studius AI funziona con qualsiasi tipo di contenuto testuale: medicina, giurisprudenza, ingegneria, economia, letteratura. Se puoi caricarlo come PDF o testo, Studius AI può aiutarti."
              },
              {
                question: "Serve sapere usare l'AI per usarlo?",
                answer: "Per niente. Carichi il file, clicchi un bottone, ottieni il risultato. È progettato per essere semplice come usare WhatsApp. Se sai navigare su internet, sai usare Studius AI."
              },
              {
                question: "I miei dati sono al sicuro?",
                answer: "I tuoi documenti sono criptati e protetti. Non condividiamo niente con nessuno e puoi eliminare tutto in qualsiasi momento. La privacy è una priorità, non un optional."
              },
              {
                question: "Funziona anche offline?",
                answer: "Studius AI ha bisogno di internet per generare i contenuti, ma puoi scaricare riassunti e flashcard per studiarli offline. Una volta generati, sono tuoi per sempre."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-gray-900 text-lg">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Il prossimo esame lo puoi<br />
            preparare meglio di così.
          </h2>
          <p className="text-xl mb-12 opacity-90 leading-relaxed">
            Carica i tuoi materiali, lascia fare il lavoro pesante all'AI e concentrati
            su quello che conta davvero: capire e ricordare.
          </p>
          <button
            onClick={() => window.open('/test-v3', '_blank')}
            className="bg-white text-indigo-600 px-12 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
          >
            Inizia ora – Provala gratis!
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="text-sm opacity-75 mt-6">
            Non serve carta di credito per la prova gratuita
          </p>
        </div>
      </section>
    </div>
  );
};

export default StudiusLandingPage;