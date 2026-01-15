import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { verifyAuth, AuthError } from '@/lib/middleware';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EXAM_ULTRA_COST = 50; // Costo fisso 50 crediti
const TARGET_QUESTIONS = 30; // Target 30 domande

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID richiesto' },
        { status: 400 }
      );
    }

    // Verifica che supabaseAdmin sia disponibile
    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not configured');
      return NextResponse.json(
        { error: 'Configurazione server incompleta' },
        { status: 500 }
      );
    }

    console.log(`📝 [EXAM_ULTRA] Looking for session: ${sessionId}, user: ${user.id}`);

    // Recupera il documento dal database per ottenere il pdf_text completo
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('pdf_text, file_name, title')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      console.error(`❌ [EXAM_ULTRA] Session not found: ${sessionId}`, sessionError);
      return NextResponse.json(
        { error: 'Sessione non trovata', details: sessionError?.message },
        { status: 404 }
      );
    }

    console.log(`✅ [EXAM_ULTRA] Session found: ${session.file_name}, text length: ${session.pdf_text?.length || 0}`);

    if (!session.pdf_text || session.pdf_text.length < 500) {
      return NextResponse.json(
        { error: 'Testo del documento non disponibile o troppo breve' },
        { status: 400 }
      );
    }

    // Verifica crediti sufficienti
    if (user.credits < EXAM_ULTRA_COST) {
      console.log(`❌ Insufficient credits: user has ${user.credits}, needs ${EXAM_ULTRA_COST}`);
      return NextResponse.json(
        {
          error: 'Crediti insufficienti',
          required: EXAM_ULTRA_COST,
          available: user.credits,
          type: 'insufficient_credits'
        },
        { status: 402 }
      );
    }

    const documentTitle = session.title || session.file_name || 'Documento';
    const fullText = session.pdf_text;

    console.log(`📝 [EXAM_ULTRA] Generating exam for: ${documentTitle}`);
    console.log(`📄 [EXAM_ULTRA] Text length: ${fullText.length} characters`);

    // Dividi il documento in sezioni per coprire tutto il contenuto
    const sections = splitIntoSections(fullText, 6000); // ~6000 char per sezione
    const questionsPerSection = Math.ceil(TARGET_QUESTIONS / sections.length);

    console.log(`📊 [EXAM_ULTRA] Split into ${sections.length} sections, ~${questionsPerSection} questions per section`);

    // Genera domande per ogni sezione
    const allQuestions: any[] = [];
    let questionId = 1;

    for (let i = 0; i < sections.length; i++) {
      const sectionNumber = i + 1;
      console.log(`🔄 [EXAM_ULTRA] Processing section ${sectionNumber}/${sections.length}`);

      try {
        const prompt = createUltraExamPrompt(
          sections[i],
          questionsPerSection,
          sectionNumber,
          sections.length,
          documentTitle
        );

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Sei un professore universitario esperto nella creazione di esami.
Crea domande DIFFICILI e SPECIFICHE come in un vero esame universitario.
Le domande devono testare:
- Comprensione profonda dei concetti
- Capacità di analisi critica
- Applicazione pratica delle conoscenze
- Sintesi e collegamenti tra argomenti
NON fare domande banali o troppo generiche.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 3000,
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (responseContent) {
          const cleanContent = responseContent
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

          try {
            // Trova il JSON nella risposta
            const jsonStart = cleanContent.indexOf('{');
            const jsonEnd = cleanContent.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = cleanContent.substring(jsonStart, jsonEnd + 1);
              const sectionData = JSON.parse(jsonStr);

              if (sectionData.questions && Array.isArray(sectionData.questions)) {
                // Aggiungi ID univoci e numero sezione
                const questionsWithIds = sectionData.questions.map((q: any) => ({
                  ...q,
                  id: `q${questionId++}`,
                  section: sectionNumber
                }));
                allQuestions.push(...questionsWithIds);
              }
            }
          } catch (parseError) {
            console.warn(`⚠️ [EXAM_ULTRA] Parse error for section ${sectionNumber}:`, parseError);
          }
        }

        // Delay tra le richieste
        if (i < sections.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (sectionError) {
        console.error(`❌ [EXAM_ULTRA] Error processing section ${sectionNumber}:`, sectionError);
      }
    }

    // Verifica che abbiamo abbastanza domande
    if (allQuestions.length < 10) {
      console.error(`❌ [EXAM_ULTRA] Only generated ${allQuestions.length} questions`);
      return NextResponse.json(
        { error: 'Impossibile generare abbastanza domande. Riprova.' },
        { status: 500 }
      );
    }

    // Bilancia le domande (mix aperte e multiple)
    const balancedQuestions = balanceQuestions(allQuestions);

    console.log(`✅ [EXAM_ULTRA] Generated ${balancedQuestions.length} questions`);

    // Consuma crediti
    const { data: creditResult, error: creditError } = await supabase
      .rpc('consume_credits', {
        p_user_id: user.id,
        p_amount: EXAM_ULTRA_COST,
        p_description: `Simulazione Esame Ultra (${balancedQuestions.length} domande)`,
        p_feature_type: 'exam_ultra'
      });

    if (creditError || !creditResult?.success) {
      console.error('❌ Credit deduction error:', creditError || creditResult);
      return NextResponse.json(
        { error: 'Errore nel consumo crediti' },
        { status: 500 }
      );
    }

    console.log(`💳 [EXAM_ULTRA] Credits consumed. New balance: ${creditResult.new_balance}`);

    // Calcola statistiche
    const stats = {
      total: balancedQuestions.length,
      multiple_choice: balancedQuestions.filter((q: any) => q.type === 'multiple_choice').length,
      open: balancedQuestions.filter((q: any) => q.type === 'open').length,
      sections_covered: sections.length
    };

    return NextResponse.json({
      questions: balancedQuestions,
      stats,
      newCreditBalance: creditResult.new_balance,
      creditsUsed: EXAM_ULTRA_COST
    });

  } catch (error) {
    console.error('❌ Generate exam ultra API error:', error);

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, type: 'auth_error' },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { error: 'Crediti insufficienti', type: 'insufficient_credits' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      {
        error: 'Si è verificato un problema nella generazione dell\'esame. I tuoi crediti non sono stati utilizzati.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function splitIntoSections(text: string, targetSize: number): string[] {
  const sections: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);

  let currentSection = '';

  for (const paragraph of paragraphs) {
    if (currentSection.length + paragraph.length > targetSize && currentSection.length > 1000) {
      sections.push(currentSection.trim());
      currentSection = paragraph;
    } else {
      currentSection += (currentSection.length > 0 ? '\n\n' : '') + paragraph;
    }
  }

  if (currentSection.trim().length > 0) {
    sections.push(currentSection.trim());
  }

  // Se abbiamo poche sezioni, usa tutto il testo
  if (sections.length < 2) {
    const chunks = [];
    for (let i = 0; i < text.length; i += targetSize) {
      chunks.push(text.slice(i, i + targetSize));
    }
    return chunks.length > 0 ? chunks : [text];
  }

  return sections;
}

function createUltraExamPrompt(
  sectionText: string,
  numQuestions: number,
  sectionNumber: number,
  totalSections: number,
  documentTitle: string
): string {
  return `Crea ${numQuestions} domande di ESAME UNIVERSITARIO basate su questa sezione del documento "${documentTitle}".

SEZIONE ${sectionNumber} di ${totalSections}:
${sectionText}

REQUISITI CRITICI:
1. Domande DIFFICILI come un vero esame universitario
2. Mix di domande a scelta multipla (60%) e aperte (40%)
3. Le domande devono essere SPECIFICHE sul contenuto, non generiche
4. Includi domande che richiedono:
   - Definizioni precise di termini tecnici
   - Spiegazioni di processi o meccanismi
   - Confronti tra concetti
   - Applicazioni pratiche
   - Analisi critica
   - Date, numeri, nomi specifici se presenti

FORMATO RISPOSTA (JSON VALIDO):
{
  "questions": [
    {
      "type": "multiple_choice",
      "text": "Domanda specifica e dettagliata",
      "options": ["Opzione A precisa", "Opzione B plausibile", "Opzione C plausibile", "Opzione D plausibile"],
      "correct_option_index": 0,
      "explanation": "Spiegazione dettagliata del perché questa è la risposta corretta",
      "difficulty": "avanzato"
    },
    {
      "type": "open",
      "text": "Domanda aperta che richiede analisi approfondita",
      "correctAnswer": "Risposta modello completa e dettagliata (almeno 50 parole)",
      "explanation": "Punti chiave che la risposta deve contenere",
      "difficulty": "avanzato"
    }
  ]
}

IMPORTANTE:
- Le opzioni delle domande multiple devono essere TUTTE plausibili
- Le domande aperte devono richiedere risposte ARTICOLATE
- NON fare domande troppo facili o ovvie
- Rispondi SOLO con JSON valido`;
}

function balanceQuestions(questions: any[]): any[] {
  // Rimuovi duplicati basati sul testo
  const unique = questions.filter((q, index, self) =>
    index === self.findIndex(t => t.text.toLowerCase().trim() === q.text.toLowerCase().trim())
  );

  // Ordina per sezione per avere una progressione logica
  unique.sort((a, b) => (a.section || 0) - (b.section || 0));

  // Limita a 35 domande max
  return unique.slice(0, 35);
}
