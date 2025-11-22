import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth, deductCredits } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const { docContext, action, userAnswer, sessionHistory, targetLanguage, turnCount = 0 } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    // Gestione costi - REGOLE DEFINITIVE
    let newCreditBalance = user.credits;
    let cost = 0;
    let isFirstTime = false;
    
    if (action === 'start') {
      // Controlla se è la prima sessione orale per questo utente
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_used_oral_once')
        .eq('user_id', user.id)
        .single();
      
      isFirstTime = !profile?.has_used_oral_once;
      
      if (isFirstTime) {
        // Prima sessione sempre GRATIS
        cost = CreditCosts.oralExamFirst; // 0 crediti
        
        // Segna che l'utente ha usato l'orale almeno una volta
        await supabase
          .from('profiles')
          .update({ has_used_oral_once: true })
          .eq('user_id', user.id);
          
        newCreditBalance = user.credits; // Nessuna deduzione
      } else {
        // Sessioni successive costano 10 crediti
        cost = CreditCosts.oralExam; // 10 crediti
        newCreditBalance = await deductCredits(
          user.id, 
          cost, 
          'Sessione esame orale',
          { action }
        );
      }
    }
    // Rimuovo la logica dei turni extra: dentro la sessione tutto è GRATIS

    const language = targetLanguage || 'Italiano';
    let prompt = '';

    if (action === 'start') {
      // Inizia l'esame orale
      prompt = `Sei un professore universitario che conduce un esame orale. Basati ESCLUSIVAMENTE sul seguente contenuto del documento per fare domande.

Contenuto del documento:
${docContext.substring(0, 6000)}

ISTRUZIONI:
- Rispondi in ${language}
- Comportati come un vero professore universitario durante un esame orale
- Fai UNA domanda alla volta
- Inizia con una domanda di livello intermedio
- Sii professionale ma incoraggiante
- Le domande devono essere basate SOLO sui contenuti del documento

FORMATO RISPOSTA:
- Saluta lo studente
- Fai la prima domanda
- Non dare ancora valutazioni

Inizia l'esame orale ora.`;

    } else if (action === 'evaluate') {
      // Valuta la risposta e fai la prossima domanda
      prompt = `Sei un professore universitario che sta conducendo un esame orale. 

Contenuto del documento (base per tutte le domande):
${docContext.substring(0, 6000)}

Cronologia conversazione:
${sessionHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n\n') || ''}

ULTIMA RISPOSTA DELLO STUDENTE:
"${userAnswer}"

COMPITI:
1. Valuta la risposta dello studente (correttezza, completezza, precisione)
2. Fornisci feedback costruttivo
3. Fai una nuova domanda basata sui contenuti del documento
4. Adatta la difficoltà della prossima domanda in base alla performance

FORMATO RISPOSTA:
- Valutazione breve della risposta precedente
- Feedback specifico (cosa va bene, cosa migliorare)
- Nuova domanda del livello appropriato
- Mantieni un tono professionale ma incoraggiante

Rispondi in ${language}.`;

    } else if (action === 'finish') {
      // Concludi l'esame con valutazione finale
      prompt = `Sei un professore universitario che conclude un esame orale.

Cronologia completa dell'esame:
${sessionHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n\n') || ''}

COMPITI:
1. Fornisci una valutazione finale dell'esame
2. Riassumi i punti di forza dello studente
3. Indica le aree da migliorare
4. Dai un voto orientativo e consigli per il futuro

FORMATO RISPOSTA:
- Valutazione complessiva
- Punti di forza evidenziati durante l'esame
- Aree di miglioramento
- Voto orientativo (se appropriato)
- Consigli per approfondire lo studio

Rispondi in ${language} con un tono professionale e costruttivo.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sei un professore universitario esperto negli esami orali. Conduci esami realistici, giusti e formativi. Rispondi sempre in ${language}.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Failed to generate oral exam response');
    }

    return NextResponse.json({
      response,
      newCreditBalance,
      creditsUsed: cost,
      isFirstTime
    });

  } catch (error) {
    console.error('Oral exam API error:', error);
    
    // Gestisci errori specifici di crediti
    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti per l\'esame orale',
          type: 'insufficient_credits' 
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process oral exam request' },
      { status: 500 }
    );
  }
}