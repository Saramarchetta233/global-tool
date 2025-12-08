import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { verifyAuth } from '@/lib/middleware';
import { cache } from '@/lib/redis-cache';
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
    
    const { docContext, action, userAnswer, sessionHistory, targetLanguage, turnCount = 0 } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    // STEP 1: Prima genera la risposta AI, poi gestisci i crediti atomicamente
    const language = targetLanguage || 'Italiano';
    let prompt = '';
    let newCreditBalance = user.credits;
    let cost = 0;
    let wasFirstTime = false;
    let oralExamCount = 0;

    // STEP 2: Costruisci il prompt per l'AI
    if (action === 'start') {
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

    // STEP 3: Genera la risposta AI PRIMA di gestire i crediti
    console.log(`🤖 Generating AI response for action: ${action}`);
    
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
      console.error('❌ OpenAI returned empty response for oral exam');
      throw new Error('Failed to generate oral exam response');
    }

    console.log(`✅ AI response generated successfully for action: ${action}`);

    // STEP 4: Gestisci i crediti usando SOLO profiles.oral_exam_uses
    if (action === 'start') {
      console.log(`🎯 Processing credits for oral exam start - user ${user.id}`);
      
      try {
        // 1. LEGGI oral_exam_uses dal profilo utente
        console.log('📊 [CRITICAL_READ] Reading oral_exam_uses from profile...', {
          userId: user.id,
          userIdType: typeof user.id
        });
        
        // SEMPRE usa supabaseAdmin per evitare problemi RLS
        if (!supabaseAdmin) {
          console.error('❌ [CRITICAL_READ] supabaseAdmin not available for profile read!');
          return NextResponse.json(
            { error: 'Service unavailable for profile read' },
            { status: 500 }
          );
        }
        
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('user_id, oral_exam_uses, credits, created_at, updated_at')
          .eq('user_id', user.id)
          .single();

        console.log('📊 [CRITICAL_READ] Profile read result:', {
          userId: user.id,
          profile,
          profileError: profileError?.message || 'none',
          errorCode: profileError?.code
        });

        if (profileError) {
          console.error('[ORAL_EXAM_PROFILE_ERROR]', { 
            userId: user.id, 
            profileError,
            code: profileError.code,
            message: profileError.message 
          });
          return NextResponse.json(
            { error: 'Errore nel recupero del profilo utente' },
            { status: 500 }
          );
        }

        oralExamCount = profile?.oral_exam_uses ?? 0;
        
        console.log('[ORAL_EXAM_DEBUG_COUNT]', {
          userId: user.id,
          oralExamCount,
        });
        
        // 2. DECIDI il costo basato sul conteggio dal profilo
        if (oralExamCount === 0) {
          // PRIMO ESAME ORALE → GRATIS
          cost = 0;
          wasFirstTime = true;
          console.log('🎉 First oral exam detected - making it FREE');
        } else {
          // DAL SECONDO IN POI → 25 CREDITI
          cost = 25;
          wasFirstTime = false;
          console.log(`💳 Subsequent oral exam (#${oralExamCount + 1}) - charging 25 credits`);
        }

        // 3. Scala crediti e aggiorna oral_exam_uses
        if (cost > 0) {
          // Non è la prima volta - scala crediti
          const currentCredits = profile?.credits || user.credits;
          
          if (currentCredits < cost) {
            console.log('❌ Insufficient credits:', { required: cost, available: currentCredits });
            return NextResponse.json(
              { 
                error: 'Crediti insufficienti per l\'esame orale',
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
              p_description: `Esame orale (${cost} crediti)`,
              p_feature_type: 'oral_exam'
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
          // Primo esame gratis - nessuna variazione crediti
          newCreditBalance = profile?.credits || user.credits;
          console.log('✅ First exam - no credits consumed');
        }

        // 4. AGGIORNA oral_exam_uses nel profilo (sia per primo che per successivi)
        console.log('📝 [CRITICAL_UPDATE] Updating oral_exam_uses in profile...', {
          userId: user.id,
          currentCount: oralExamCount,
          newCount: oralExamCount + 1,
          userIdType: typeof user.id,
          userIdLength: user.id.length
        });
        
        // SEMPRE usa supabaseAdmin per evitare problemi RLS
        if (!supabaseAdmin) {
          console.error('❌ [CRITICAL_UPDATE] supabaseAdmin not available for profile update!');
          return NextResponse.json(
            { error: 'Service unavailable for profile update' },
            { status: 500 }
          );
        }
        
        // UPDATE con valore esplicito per evitare problemi NULL
        const newOralExamUses = (oralExamCount || 0) + 1;
        
        // USA UNA FUNZIONE RPC per garantire atomicità e persistenza
        console.log('💾 [CRITICAL_UPDATE] Using RPC function to increment oral_exam_uses...');
        
        const { data: rpcData, error: rpcError } = await supabaseAdmin
          .rpc('increment_oral_exam_uses', {
            p_user_id: user.id
          });
          
        if (rpcError) {
          console.error('❌ RPC increment_oral_exam_uses failed:', rpcError);
          
          // FALLBACK: Update normale
          const { data: updateData, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
              oral_exam_uses: newOralExamUses,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select('user_id, oral_exam_uses, updated_at');
            
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
        } else {
          console.log('✅ RPC increment_oral_exam_uses successful:', rpcData);
        }

        console.log('📝 [CRITICAL_UPDATE] RPC operation completed successfully');

        // 5. Crea una nuova entry in oral_exam_sessions per tracciare questa sessione (opzionale)
        console.log('[ORAL_EXAM_DEBUG_BEFORE_INSERT]', {
          userId: user.id,
          cost,
          wasFirstTime,
          action: 'start'
        });
        
        console.log('🔍 supabaseAdmin available for insert:', !!supabaseAdmin);
        
        if (!supabaseAdmin) {
          console.log('⚠️ PROBLEM: Skipping session insert - supabaseAdmin not available');
          console.log('⚠️ This will cause the user to always see FREE on subsequent exams!');
        } else {
          console.log('✅ Using supabaseAdmin for session insert');
          const { data: sessionData, error: sessionError } = await supabaseAdmin
            .from('oral_exam_sessions')
            .insert({
              user_id: user.id,
              session_data: {
                action: 'start',
                cost: cost,
                was_free: wasFirstTime,
                started_at: new Date().toISOString()
              },
              completed: false
            })
            .select('id')
            .single();

          console.log('[ORAL_EXAM_DEBUG_AFTER_INSERT]', {
            userId: user.id,
            sessionError,
            sessionData,
          });

          if (sessionError) {
            console.error('[ORAL_EXAM_INSERT_FAILED]', sessionError);
            return NextResponse.json(
              { error: 'ORAL_EXAM_SESSION_INSERT_FAILED', details: sessionError.message },
              { status: 500 }
            );
          } else {
            console.log('✅ Oral exam session created:', sessionData?.id);
        
        // CACHE la nuova informazione in Redis e memoria per 30 giorni
        console.log('💾 [CACHE_UPDATE] Updating all caches with new oral_exam count...');
        
        // Aggiorna cache Redis per 30 giorni
        try {
          const redisCacheKey = `oral_exam_uses_${user.id}`;
          await cache.set(redisCacheKey, newOralExamUses, 30 * 24 * 60 * 60 * 1000);
          console.log('🚀 [REDIS_CACHE_UPDATE] Updated Redis cache:', newOralExamUses);
        } catch (redisError) {
          console.log('⚠️ Redis cache update error (non-critical):', redisError);
        }
        
        // Aggiorna anche cache in memoria come fallback
        try {
          const tempCacheKey = `oral_exam_uses_${user.id}`;
          (global as any).tempUserCache = (global as any).tempUserCache || new Map();
          (global as any).tempUserCache.set(tempCacheKey, {
            value: newOralExamUses,
            expires: Date.now() + (30 * 24 * 60 * 60 * 1000)
          });
          console.log('💾 [MEMORY_CACHE_UPDATE] Updated memory cache:', newOralExamUses);
        } catch (cacheError) {
          console.log('⚠️ Memory cache error (non-critical):', cacheError);
        }
          }
        }


        console.log('✅ Oral Exam credits processed successfully:', {
          wasFirstTime,
          cost,
          newBalance: newCreditBalance,
          sessionCount: (oralExamCount || 0) + 1
        });
        
      } catch (creditProcessingError) {
        console.error('❌ Error in oral exam credit processing:', creditProcessingError);
        return NextResponse.json(
          { error: 'Errore nella gestione dei crediti dell\'esame orale' },
          { status: 500 }
        );
      }
    }

    console.log('🔥 Oral Exam API Response:', {
      newCreditBalance,
      creditsUsed: cost,
      wasFirstTime
    });
    
    return NextResponse.json({
      response,
      newCreditBalance,
      creditsUsed: cost,
      was_free: wasFirstTime
    });

  } catch (error) {
    console.error('❌ Oral exam API error:', error);
    
    // IMPORTANTE: Se arrivi qui durante action='start', i crediti sono già stati scalati
    // dalla funzione handle_oral_exam_credits. 
    // Per ora gestiamo così, ma in futuro si potrebbe implementare un rollback
    // manuale se necessario per casi molto specifici.
    
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
    
    // Per fallimenti nella generazione AI, verifica se erano per l'avvio (start).
    // Recupera action dal request body se disponibile
    try {
      const requestBody = await request.clone().json();
      if (requestBody?.action === 'start') {
        return NextResponse.json(
          { 
            error: 'Si è verificato un problema nella generazione dell\'esame orale. L\'operazione è stata registrata. Riprova.',
            type: 'generation_failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }
    } catch (parseError) {
      // Se non riusciamo a parsare il body, ignora e continua
    }
    
    return NextResponse.json(
      { 
        error: 'Errore durante l\'elaborazione dell\'esame orale',
        type: 'processing_failed'
      },
      { status: 500 }
    );
  }
}