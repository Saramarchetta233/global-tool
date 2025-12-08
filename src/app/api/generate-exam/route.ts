import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getExamCost, getExamCostDescription } from '@/lib/credits/creditRules';
import { verifyAuth } from '@/lib/middleware';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const { docContext, numQuestions = 5, difficulty, questionType } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    // Calcola il costo basato sul numero di domande
    const cost = getExamCost(numQuestions);
    const costDescription = getExamCostDescription(numQuestions);

    // STEP 1: Verifica crediti sufficienti (SENZA scalare)
    if (cost > 0 && user.credits < cost) {
      console.log(`❌ Insufficient credits: user has ${user.credits}, needs ${cost}`);
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti',
          required: cost,
          available: user.credits,
          type: 'insufficient_credits' 
        },
        { status: 402 }
      );
    }

    // STEP 2: Genera il quiz PRIMA di scalare i crediti
    console.log(`🎯 Generating ${numQuestions} questions for user ${user.id}`);
    
    const prompt = createExamPrompt(docContext, numQuestions, difficulty, questionType);

    // Aumenta max_tokens per 20 domande
    const maxTokens = numQuestions <= 10 ? 2000 : 4000;
    
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
      max_tokens: maxTokens,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      console.error('❌ OpenAI returned empty response');
      throw new Error('OpenAI returned empty response');
    }

    // STEP 3: Parse e valida la risposta
    const cleanContent = responseContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let examData;
    try {
      examData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw response content:', responseContent);
      throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    // STEP 4: Valida che le domande siano state generate correttamente
    if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length === 0) {
      console.error('❌ Invalid exam data structure:', examData);
      throw new Error('AI did not generate valid questions array');
    }

    if (examData.questions.length < numQuestions) {
      console.warn(`⚠️ Only got ${examData.questions.length} questions instead of ${numQuestions}`);
    }

    // STEP 5: Solo ora scala i crediti (dopo che la generazione è riuscita)
    let newCreditBalance = user.credits;
    if (cost > 0) {
      console.log(`💳 Consuming ${cost} credits for user ${user.id}`);
      
      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_credits', {
          p_user_id: user.id,
          p_amount: cost,
          p_description: costDescription,
          p_feature_type: 'exam'
        });
      
      if (creditError || !creditResult?.success) {
        console.error('❌ Credit deduction error:', creditError || creditResult);
        throw new Error(`Failed to consume credits: ${creditError?.message || 'Unknown error'}`);
      }
      
      newCreditBalance = creditResult.new_balance;
      console.log(`✅ Credits consumed successfully. New balance: ${newCreditBalance}`);
    }

    // STEP 6: Restituisci il quiz generato
    console.log(`✅ Exam generated successfully: ${examData.questions.length} questions`);
    
    return NextResponse.json({
      questions: examData.questions || [],
      newCreditBalance,
      creditsUsed: cost,
      costDescription
    });

  } catch (error) {
    console.error('❌ Generate exam API error:', error);
    
    // Gestisci errori specifici di crediti
    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti',
          type: 'insufficient_credits' 
        },
        { status: 402 }
      );
    }
    
    // Per qualsiasi altro errore, i crediti NON sono stati scalati
    return NextResponse.json(
      { 
        error: 'Si è verificato un problema nella generazione dell\'esame. I tuoi crediti non sono stati utilizzati. Riprova.',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'generation_failed'
      },
      { status: 500 }
    );
  }
}

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