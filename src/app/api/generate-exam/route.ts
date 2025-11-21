import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = withCredits('quiz', async (request: NextRequest, user, newCreditBalance) => {
  try {
    const { docContext, numQuestions, difficulty, questionType } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    const prompt = createExamPrompt(docContext, numQuestions, difficulty, questionType);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sei un esperto nella creazione di esami universitari. Genera domande accurate e formative basate sul contenuto fornito."
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
      throw new Error('Failed to generate exam questions');
    }

    // Parse JSON response
    const cleanContent = responseContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let examData;
    try {
      examData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse exam JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to generate properly formatted exam' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: examData.questions || [],
      newCreditBalance,
      creditsUsed: 8
    });

  } catch (error) {
    console.error('Generate exam API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate exam' },
      { status: 500 }
    );
  }
});

function createExamPrompt(docContext: string, numQuestions: number, difficulty: string, questionType: string): string {
  const basePrompt = `Crea un esame di ${numQuestions} domande basato ESCLUSIVAMENTE sul seguente contenuto del documento.

Contenuto del documento:
${docContext.substring(0, 8000)}

Configurazione esame:
- Numero domande: ${numQuestions}
- Difficoltà: ${difficulty}
- Tipo: ${questionType}

REGOLE IMPORTANTI:
1. Le domande devono essere basate SOLO sul contenuto fornito
2. Non aggiungere informazioni esterne al documento
3. Livello di difficoltà "${difficulty}":
   - Base: Concetti fondamentali e definizioni
   - Intermedio: Applicazioni e collegamenti
   - Avanzato: Analisi critica e sintesi complessa

4. Tipo di domande "${questionType}":`;

  if (questionType === 'Scelta multipla') {
    return basePrompt + `
   - Solo domande a scelta multipla con 4 opzioni
   - Una sola risposta corretta per domanda
   - Opzioni plausibili ma chiaramente distinguibili

FORMATO RICHIESTO (JSON):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "Domanda chiara e specifica",
      "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"],
      "correct_option_index": 0,
      "explanation": "Spiegazione dettagliata della risposta corretta"
    }
  ]
}`;
  } else if (questionType === 'Aperte') {
    return basePrompt + `
   - Solo domande aperte
   - Richiesta di spiegazioni, analisi o sintesi
   - Fornire risposta modello per ogni domanda

FORMATO RICHIESTO (JSON):
{
  "questions": [
    {
      "id": "q1", 
      "type": "open",
      "text": "Domanda che richiede analisi o spiegazione",
      "correctAnswer": "Risposta modello dettagliata e completa",
      "explanation": "Criteri di valutazione e punti chiave da includere"
    }
  ]
}`;
  } else { // Miste
    return basePrompt + `
   - Mix di domande aperte e a scelta multipla
   - Circa 60% scelta multipla, 40% aperte
   - Varietà di tipologie per valutazione completa

FORMATO RICHIESTO (JSON):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "Domanda scelta multipla",
      "options": ["A", "B", "C", "D"], 
      "correct_option_index": 0,
      "explanation": "Spiegazione risposta"
    },
    {
      "id": "q2",
      "type": "open",
      "text": "Domanda aperta",
      "correctAnswer": "Risposta modello",
      "explanation": "Criteri valutazione"
    }
  ]
}`;
  }
}