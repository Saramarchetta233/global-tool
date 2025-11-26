import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import '@/lib/redis-cache'; // Inizializza il cache Redis

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

    // USA SOLO IL PROFILO (come per l'esame orale)
    let cost = 0;
    let newCreditBalance = user.credits;
    let isFirstTime = true;
    let probableCount = 0;
    let wasFirstTime = false;

    console.log('📊 [PROBABLE_PROFILE_READ] Reading probable_questions_uses from profile...', {
      userId: user.id,
      userIdType: typeof user.id
    });
    
    // Usa SOLO supabaseAdmin per evitare problemi RLS
    if (!supabaseAdmin) {
      console.error('[PROBABLE_ERROR] supabaseAdmin not available');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 500 }
      );
    }
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, probable_questions_uses, credits, created_at, updated_at')
      .eq('user_id', user.id)
      .single();

    console.log('📊 [PROBABLE_PROFILE_READ] Profile read result:', {
      userId: user.id,
      profile,
      profileError: profileError?.message || 'none',
      errorCode: profileError?.code
    });

    if (profileError) {
      console.error('[PROBABLE_ERROR] Error reading profile:', {
        userId: user.id,
        error: profileError
      });
      return NextResponse.json(
        { error: 'Failed to check probable questions status' },
        { status: 500 }
      );
    }

    probableCount = profile?.probable_questions_uses ?? 0;
    
    console.log('[PROBABLE_Q_DEBUG_COUNT]', {
      userId: user.id,
      probableCount,
    });
    
    // LOGICA: prima volta gratis, dalla seconda in poi 5 crediti
    if (probableCount === 0) {
      cost = 0;      // PRIMA VOLTA → GRATIS
      isFirstTime = true;
      wasFirstTime = true;
      console.log('🎉 First probable questions generation detected - making it FREE');
    } else {
      cost = 5;      // DALLA SECONDA IN POI → 5 CREDITI
      isFirstTime = false;
      wasFirstTime = false;
      console.log(`💳 Subsequent probable questions (#${probableCount + 1}) - charging 5 credits`);
    }

    // Se cost > 0, controlla crediti e scala
    if (cost > 0) {
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

    // USA UNA FUNZIONE RPC per garantire atomicità e persistenza (come per l'esame orale)
    console.log('💾 [PROBABLE_UPDATE] Using RPC function to increment probable_questions_uses...');
    
    const newProbableQuestionsUses = (probableCount || 0) + 1;
    
    const { data: rpcData, error: rpcError } = await supabaseAdmin
      .rpc('increment_probable_questions_uses', {
        p_user_id: user.id
      });
      
    if (rpcError) {
      console.error('❌ RPC increment_probable_questions_uses failed:', rpcError);
      
      // FALLBACK: Update normale
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          probable_questions_uses: newProbableQuestionsUses,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select('user_id, probable_questions_uses, updated_at');
        
      console.log('📝 [FALLBACK_UPDATE] Profile update result:', {
        userId: user.id,
        updateData,
        updateError: updateError?.message || 'none'
      });
      
      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }
      
      // IMPORTANTE: Imposta il cache anche nel fallback
      console.log('💾 [FALLBACK_CACHE] Caching updated probable_questions count after fallback update...');
      try {
        const tempCacheKey = `probable_questions_uses_${user.id}`;
        (global as any).tempUserCache = (global as any).tempUserCache || new Map();
        (global as any).tempUserCache.set(tempCacheKey, {
          value: newProbableQuestionsUses,
          expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 giorni = 1 mese
        });
        console.log('💾 [FALLBACK_CACHE] Cached probable_questions count (fallback):', newProbableQuestionsUses, 'for key:', tempCacheKey);
      } catch (fallbackCacheError) {
        console.log('⚠️ Fallback cache error (non-critical):', fallbackCacheError);
      }
    } else {
      console.log('✅ RPC increment_probable_questions_uses successful:', rpcData);
      
      // CACHE la nuova informazione per 30 secondi per nuovi utenti (stesso fix dell'esame orale)
      console.log('💾 [NEW_USER_CACHE] Caching updated probable_questions count for immediate reads...');
      try {
        const tempCacheKey = `probable_questions_uses_${user.id}`;
        (global as any).tempUserCache = (global as any).tempUserCache || new Map();
        (global as any).tempUserCache.set(tempCacheKey, {
          value: newProbableQuestionsUses,
          expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 giorni = 1 mese
        });
        console.log('💾 [NEW_USER_CACHE] Cached probable_questions count:', newProbableQuestionsUses, 'for key:', tempCacheKey);
      } catch (cacheError) {
        console.log('⚠️ Cache error (non-critical):', cacheError);
      }
    }

    // Opzionale: Salva la sessione per storico (non critico per il conteggio)
    try {
      if (supabaseAdmin) {
        const { error: sessionError } = await supabaseAdmin
          .from('probable_question_sessions')
          .insert({
            user_id: user.id,
            session_data: {
              questions: questionsData.questions || [],
              sessionId,
              cost,
              was_free: wasFirstTime,
              generated_at: new Date().toISOString()
            },
            cost,
            was_free: wasFirstTime
          });
        
        if (sessionError) {
          console.log('⚠️ Session insert failed (non-critical):', sessionError);
        } else {
          console.log('✅ Probable questions session saved for history');
        }
      }
    } catch (sessionInsertError) {
      console.log('⚠️ Session insert error (non-critical):', sessionInsertError);
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
      was_free: wasFirstTime
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