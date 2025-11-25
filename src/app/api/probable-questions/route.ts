import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const { docContext, sessionId } = await request.json();
    
    console.log('🚀 Probable Questions API chiamata:', {
      hasDocContext: !!docContext,
      sessionId: sessionId,
      userId: user.id
    });

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    // NUOVA LOGICA: conta quante volte l'utente ha già usato le "Domande Probabili" (per utente, non per sessione)
    let cost = 0;
    let newCreditBalance = user.credits;
    let isFirstTime = true;
    let probableCount = 0;

    console.log('🔍 Counting existing probable question generations for user:', user.id);
    
    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not available - assuming first time');
      cost = 0;
      isFirstTime = true;
    } else {
      const { count, error: countError } = await supabaseAdmin
        .from('probable_question_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('[PROBABLE_Q_COUNT_ERROR]', { userId: user.id, countError });
        // Se la tabella non esiste, assumiamo sia la prima volta
        console.log('📝 probable_question_sessions table not found, assuming first time');
        cost = 0;
        isFirstTime = true;
      } else {
        probableCount = count ?? 0;
        
        console.log('[PROBABLE_Q_DEBUG_COUNT]', {
          userId: user.id,
          probableCount,
        });
        
        // LOGICA: prima volta gratis, dalla seconda in poi 5 crediti
        if (probableCount === 0) {
          cost = 0;      // PRIMA VOLTA → GRATIS
          isFirstTime = true;
          console.log('🎉 First probable questions generation detected - making it FREE');
        } else {
          cost = 5;      // DALLA SECONDA IN POI → 5 CREDITI
          isFirstTime = false;
          console.log(`💳 Subsequent probable questions (#${probableCount + 1}) - charging 5 credits`);
        }
      }
    }

    // Se cost > 0, controlla crediti e scala
    if (cost > 0) {
      // Recupera crediti attuali
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error fetching user credits:', profileError);
        return NextResponse.json(
          { error: 'Errore nel recupero del profilo utente' },
          { status: 500 }
        );
      }

      const currentCredits = profile?.credits || user.credits;
      
      if (currentCredits < cost) {
        console.log('❌ Insufficient credits:', { required: cost, available: currentCredits });
        return NextResponse.json(
          { 
            error: 'Crediti insufficienti per le domande probabili',
            required: cost,
            available: currentCredits,
            type: 'insufficient_credits' 
          },
          { status: 402 }
        );
      }

      // Scala crediti atomicamente
      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_credits', {
          p_user_id: user.id,
          p_amount: cost,
          p_description: `Domande probabili (${cost} crediti)`,
          p_feature_type: 'probable_questions'
        });

      if (creditError || !creditResult?.success) {
        console.error('❌ Error consuming credits:', creditError || creditResult);
        return NextResponse.json(
          { error: 'Errore nella detrazione dei crediti' },
          { status: 500 }
        );
      }

      newCreditBalance = creditResult.new_balance;
      console.log('✅ Credits consumed:', { cost, newBalance: newCreditBalance });
    } else {
      // Prima volta gratis - nessuna variazione crediti
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      
      newCreditBalance = profile?.credits || user.credits;
      console.log('✅ First generation - no credits consumed');
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

    // Parse JSON response con maggiore robustezza
    let cleanContent = responseContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Cerca il JSON tra le parentesi graffe
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd);
    }

    let questionsData;
    try {
      questionsData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse questions JSON:', parseError);
      console.error('Raw content length:', responseContent.length);
      console.error('Clean content preview:', cleanContent.substring(0, 500));
      
      // Fallback: prova a riparare JSON comuni
      try {
        // Rimuovi trailing comma o caratteri problematici
        const fixedContent = cleanContent
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\r\n\t]/g, ' ')
          .replace(/\s+/g, ' ');
        
        questionsData = JSON.parse(fixedContent);
        console.log('✅ JSON parsed after cleanup');
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        
        // Fallback finale: genera domande semplici
        questionsData = {
          questions: [
            {
              id: 1,
              question: "Quali sono i concetti principali trattati nel documento?",
              answer: "Basandosi sul contenuto del documento, identificare e spiegare i concetti fondamentali.",
              importance: "Alta",
              type: "Spiegazione",
              reasoning: "Domanda generale che copre i temi principali"
            }
          ]
        };
        console.log('⚠️ Using fallback questions due to JSON parse errors');
      }
    }

    // SALVA la nuova sessione nella tabella probable_question_sessions
    console.log('[PROBABLE_Q_DEBUG_BEFORE_INSERT]', {
      userId: user.id,
      cost,
      isFirstTime,
      sessionId
    });
    
    if (!supabaseAdmin) {
      console.log('⚠️ Skipping session insert - supabaseAdmin not available');
    } else {
      const { data: sessionData, error: sessionError } = await supabaseAdmin
        .from('probable_question_sessions')
        .insert({
          user_id: user.id,
          document_id: null, // potremmo aggiungere il document_id se necessario
          session_data: {
            questions: questionsData.questions || [],
            sessionId,
            cost,
            was_free: isFirstTime,
            generated_at: new Date().toISOString()
          },
          cost,
          was_free: isFirstTime
        })
        .select('id')
        .single();

      console.log('[PROBABLE_Q_DEBUG_AFTER_INSERT]', {
        userId: user.id,
        sessionError,
        sessionData,
      });

      if (sessionError) {
        console.error('[PROBABLE_Q_INSERT_FAILED]', sessionError);
        return NextResponse.json(
          { error: 'PROBABLE_Q_SESSION_INSERT_FAILED', details: sessionError.message },
          { status: 500 }
        );
      } else {
        console.log('✅ Probable questions session created:', sessionData?.id);
      }
    }

    console.log('✅ Probable Questions processed successfully:', {
      isFirstTime,
      cost,
      newBalance: newCreditBalance,
      sessionCount: probableCount + 1,
      questionCount: questionsData.questions?.length || 0
    });

    return NextResponse.json({
      questions: questionsData.questions || [],
      newCreditBalance,
      creditsUsed: cost,
      isFirstTime,
      wasFree: isFirstTime
    });

  } catch (error) {
    console.error('Probable questions API error:', error);
    
    // Gestisci errori specifici di crediti
    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti per rigenerare le domande probabili',
          type: 'insufficient_credits' 
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate probable questions' },
      { status: 500 }
    );
  }
}