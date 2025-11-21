import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = withCredits('tutor', async (request: NextRequest, user, newCreditBalance) => {
  try {
    const { docContext, action, userAnswer, sessionHistory, targetLanguage } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

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
      creditsUsed: 5
    });

  } catch (error) {
    console.error('Oral exam API error:', error);
    return NextResponse.json(
      { error: 'Failed to process oral exam request' },
      { status: 500 }
    );
  }
});