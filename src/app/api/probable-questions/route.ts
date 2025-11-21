import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = withCredits('quiz', async (request: NextRequest, user, newCreditBalance) => {
  try {
    const { docContext } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    const prompt = `Analizza il seguente contenuto del documento e identifica le 7-10 domande più probabili che potrebbero essere chieste all'esame universitario.

Contenuto del documento:
${docContext.substring(0, 8000)}

CRITERI per le domande "più probabili":
1. Basate sui concetti CHIAVE del documento
2. Tipiche domande d'esame universitario 
3. Testano comprensione profonda, non solo memorizzazione
4. Variano in tipologia (definizioni, spiegazioni, confronti, applicazioni)
5. Focus sui temi più importanti e ricorrenti nel testo

FORMATO RICHIESTO (JSON):
{
  "questions": [
    {
      "id": 1,
      "question": "Domanda specifica e realistica che potrebbe essere chiesta all'esame",
      "answer": "Risposta modello completa e dettagliata che uno studente dovrebbe dare",
      "importance": "Alta",
      "type": "Definizione/Spiegazione/Confronto/Applicazione",
      "reasoning": "Perché questa domanda è probabile all'esame"
    }
  ]
}

IMPORTANTE: Le domande devono essere REALISTICHE per un esame universitario e basate esclusivamente sui contenuti del documento fornito.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sei un professore universitario esperto nella creazione di esami. Sai identificare le domande più probabili e importanti per valutare la comprensione degli studenti."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Failed to generate probable questions');
    }

    // Parse JSON response
    const cleanContent = responseContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let questionsData;
    try {
      questionsData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to generate properly formatted questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: questionsData.questions || [],
      newCreditBalance,
      creditsUsed: 5
    });

  } catch (error) {
    console.error('Probable questions API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate probable questions' },
      { status: 500 }
    );
  }
});