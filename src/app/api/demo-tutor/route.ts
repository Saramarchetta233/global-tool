import { NextRequest, NextResponse } from 'next/server';

import { demoAuth, isDemoMode } from '@/lib/demo-auth';
import { CREDIT_COSTS } from '@/lib/prompts';

// Demo AI tutor responses
const generateDemoTutorResponse = (userMessage: string, docContext?: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('memoria') || message.includes('memory')) {
    return `Ottima domanda sulla memoria! 

La memoria è uno dei processi cognitivi più affascinanti. Come hai visto nel documento, si divide in tre sistemi principali:

🧠 **Memoria Sensoriale**: È come un "buffer" ultra-rapido che trattiene le informazioni per millisecondi
📝 **Memoria a Breve Termine**: Ha una capacità limitata (famoso "7±2" di Miller) e dura circa 15-30 secondi
💾 **Memoria a Lungo Termine**: Capacità praticamente illimitata, può conservare informazioni per tutta la vita

Un trucco per ricordare meglio: prova la "tecnica della catena" - collega ogni nuovo concetto a qualcosa che già conosci. Per esempio, pensa alla memoria come al tuo smartphone: hai la RAM (breve termine) e lo storage (lungo termine)!

Vuoi che ti spieghi meglio la differenza tra memoria dichiarativa e procedurale?`;
  }

  if (message.includes('attenzione') || message.includes('attention')) {
    return `L'attenzione è il nostro "filtro cognitivo"! 🔍

Immagina di essere in una festa affollata: riesci a concentrarti sulla conversazione con un amico ignorando il rumore di fondo. Questo è attenzione selettiva in azione!

I tipi di attenzione che devi conoscere:
- **Selettiva**: Focus su un compito ignorando distrazioni
- **Divisa**: Fare multitasking (anche se il cervello in realtà "switcha" rapidamente)
- **Sostenuta**: Mantenere concentrazione nel tempo

💡 **Tip pratico**: Quando studi, usa la tecnica Pomodoro (25 min focus + 5 min pausa) per sfruttare al meglio l'attenzione sostenuta!

Hai notato come la tua attenzione si comporta durante lo studio? Quali sono le tue principali fonti di distrazione?`;
  }

  if (message.includes('linguaggio') || message.includes('language')) {
    return `Il linguaggio umano è davvero straordinario! 🗣️

Le caratteristiche che lo rendono unico sono:

🎭 **Arbitrarietà**: La parola "cane" non assomiglia a un cane - è una convenzione
♾️ **Produttività**: Puoi creare frasi che nessuno ha mai detto prima (come questa!)
🕰️ **Displacement**: Possiamo parlare di dinosauri, del futuro, di cose immaginarie
🔄 **Dualità**: Combiniamo suoni semplici in strutture complesse infinite

Pensiaci: in questo momento stai usando il linguaggio per pensare alle caratteristiche del linguaggio! È un processo ricorsivo affascinante.

Un esercizio interessante: prova a inventare una frase completamente nuova che sia grammaticalmente corretta ma che probabilmente nessuno ha mai detto prima. Questo dimostra la produttività linguistica!`;
  }

  if (message.includes('problem solving') || message.includes('risoluzione') || message.includes('problem-solving')) {
    return `Excellent question sul problem-solving! 🧩

Nel documento hai visto la distinzione fondamentale:

⚙️ **Algoritmi**: Procedure step-by-step che garantiscono la soluzione
- Esempio: Istruzioni IKEA (se le segui, il mobile viene montato!)
- Pro: Sicurezza di successo
- Contro: Possono essere lenti

⚡ **Euristiche**: Scorciatoie mentali veloci ma fallibili  
- Esempio: "Quando dubiti, scegli la risposta più lunga nel quiz"
- Pro: Velocità 
- Contro: Possono sbagliarsi

🌟 **Insight**: Il famoso "Eureka!" - comprensione improvvisa
- Come quando finalmente capisci una barzelletta complessa!

**Strategia di studio**: Per l'esame, usa algoritmi per i concetti fondamentali (memorizza sistematicamente) ed euristiche per collegare rapidamente argomenti diversi.

Quale approccio usi di solito quando affronti un problema di studio complesso?`;
  }

  // Generic response
  return `Grazie per la domanda! 🤖

Come tutor AI, sono qui per aiutarti a comprendere meglio i concetti della psicologia cognitiva dal documento che hai caricato.

Posso aiutarti con:
- 🧠 Spiegazioni approfondite sui processi cognitivi
- 💡 Esempi pratici e applicazioni
- 🔗 Collegamenti tra diversi concetti
- 📚 Strategie di memorizzazione
- 🎯 Preparazione per l'esame

Prova a farmi una domanda più specifica su:
- Memoria (sensoriale, breve/lungo termine)
- Attenzione (selettiva, divisa, sostenuta) 
- Linguaggio (caratteristiche uniche)
- Percezione e processing
- Problem-solving e ragionamento

Qual è l'aspetto che ti interessa di più o che trovi più difficile da capire?`;
};

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: 'Demo mode not enabled' },
      { status: 404 }
    );
  }

  try {
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const user = await demoAuth.verifyToken(token);

    const { message, docContext, language } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!docContext || typeof docContext !== 'string') {
      return NextResponse.json(
        { 
          error: 'MISSING_CONTEXT',
          message: 'È necessario caricare un documento prima di usare il Tutor AI.'
        },
        { status: 400 }
      );
    }

    // Check credits
    const creditCheck = await demoAuth.checkCredits(user.id, CREDIT_COSTS.tutor);
    
    if (!creditCheck.canProceed) {
      return NextResponse.json(
        { 
          error: 'NOT_ENOUGH_CREDITS',
          message: `Crediti insufficienti per usare il Tutor AI. Servono ${creditCheck.requiredCredits} crediti, ma ne hai solo ${creditCheck.currentCredits}.`,
          required: creditCheck.requiredCredits,
          available: creditCheck.currentCredits
        },
        { status: 402 }
      );
    }

    // Deduct credits
    const { newCreditBalance } = await demoAuth.deductCredits(user.id, CREDIT_COSTS.tutor, 'tutor');

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate demo response
    const reply = generateDemoTutorResponse(message, docContext);

    return NextResponse.json({
      reply,
      creditsRemaining: newCreditBalance,
      newCreditBalance,
      creditsUsed: CREDIT_COSTS.tutor
    });

  } catch (error) {
    console.error('Demo tutor error:', error);
    return NextResponse.json(
      { 
        error: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Si è verificato un errore interno. Riprova più tardi.'
      },
      { status: 500 }
    );
  }
}