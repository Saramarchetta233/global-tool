import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { createTutorPrompt } from '@/lib/prompts';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { cache } from '@/lib/redis-cache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const body = await request.json();
    console.log("🎓 Tutor AI - Richiesta ricevuta:", { 
      hasMessage: !!body?.message, 
      hasContext: !!body?.docContext,
      targetLanguage: body?.targetLanguage 
    });
    
    const { 
      message, 
      docContext, 
      language, 
      targetLanguage,
      riassuntoBreve,
      riassuntoEsteso,
      flashcards,
      sessionId,
      documentId
    } = body || {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Campo 'message' mancante o non valido." },
        { status: 400 }
      );
    }

    // LOGICA CORRETTA: conta messaggi tutor PER DOCUMENTO (non globalmente)
    let cost = 0;
    let newCreditBalance = user.credits;
    let messageCount = 0;

    console.log('🔍 Counting existing tutor messages for user and document:', { userId: user.id, documentId });
    
    if (!supabaseAdmin || !documentId) {
      console.error('❌ supabaseAdmin or documentId not available - assuming first time');
      cost = 0;
      messageCount = 0;
    } else {
      // Conta messaggi SOLO per questo documento specifico
      const { count, error: countError } = await supabaseAdmin
        .from('tutor_chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('document_id', documentId)
        .eq('role', 'user'); // Conta solo messaggi utente per evitare doppi conteggi

      if (countError) {
        console.error('[TUTOR_COUNT_ERROR]', { userId: user.id, documentId, countError });
        // Se la tabella non esiste, assumiamo sia la prima volta
        console.log('📝 tutor_chat_messages table not found, assuming first time');
        cost = 0;
        messageCount = 0;
      } else {
        messageCount = count ?? 0;
        
        console.log('[TUTOR_DEBUG_COUNT_PER_DOC]', {
          userId: user.id,
          documentId,
          messageCount,
        });
        
        // LOGICA: primi 3 gratis PER DOCUMENTO, dal 4° in poi 2 crediti
        if (messageCount < CreditCosts.tutorFreeMessages) {
          cost = 0;      // PRIMI 3 → GRATIS
          console.log(`🎉 Free tutor message #${messageCount + 1} for document ${documentId} - making it FREE`);
        } else {
          cost = CreditCosts.tutorMessageCost;      // DAL 4° IN POI → 2 CREDITI
          console.log(`💳 Paid tutor message #${messageCount + 1} for document ${documentId} - charging ${cost} credits`);
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
            error: 'LIMIT_REACHED',
            message: 'Hai finito i messaggi gratuiti. Puoi continuare per 2 crediti per messaggio.',
            required: cost,
            available: currentCredits,
            type: 'limit_reached' 
          },
          { status: 402 }
        );
      }

      // Scala crediti atomicamente
      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_credits', {
          p_user_id: user.id,
          p_amount: cost,
          p_description: `Messaggio Tutor AI (${cost} crediti)`,
          p_feature_type: 'tutor'
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
      // Messaggio gratis - nessuna variazione crediti
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();
      
      newCreditBalance = profile?.credits || user.credits;
      console.log(`✅ Free message #${messageCount + 1} - no credits consumed`);
    }

    // Usa targetLanguage se disponibile, altrimenti language, altrimenti default
    const effectiveLanguage = targetLanguage || language || "Italiano";
    
    // Assicurati che abbiamo un docContext valido
    const safeDocContext = typeof docContext === "string" && docContext.trim() 
      ? docContext 
      : "Nessun documento caricato.";

    // Usa i dati aggiuntivi se disponibili per contesto più ricco
    const safeRiassuntoBreve = typeof riassuntoBreve === "string" ? riassuntoBreve : "";
    const safeRiassuntoEsteso = typeof riassuntoEsteso === "string" ? riassuntoEsteso : "";
    const safeFlashcards = Array.isArray(flashcards) ? flashcards : [];

    console.log(`🌐 Lingua effettiva: ${effectiveLanguage}`);
    console.log(`📝 Contesto documento: ${safeDocContext.substring(0, 200)}...`);

    // Usa il prompt avanzato del tutor per coerenza
    const prompt = createTutorPrompt({
      userMessage: message,
      pdfText: safeDocContext,
      riassuntoBrive: safeRiassuntoBreve,
      riassuntoEsteso: safeRiassuntoEsteso,
      flashcards: safeFlashcards
    });

    // Aggiorna il prompt per rispettare targetLanguage
    const languageInstructions = effectiveLanguage !== 'Italiano' 
      ? `IMPORTANTE: Rispondi SEMPRE in ${effectiveLanguage}, mantenendo coerenza con la lingua del materiale di studio.`
      : '';

    const finalPrompt = languageInstructions ? `${languageInstructions}\n\n${prompt}` : prompt;

    // Get response from OpenAI con prompt migliorato e supporto multilingua
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Sei un tutor AI esperto e paziente. Rispondi sempre in ${effectiveLanguage} in modo chiaro, pedagogico e incoraggiante. Mantieni coerenza con il materiale di studio fornito.`
        },
        {
          role: "user",
          content: finalPrompt
        }
      ],
      temperature: 0.4, // Più deterministico per consistenza
      max_tokens: 800,   // Più spazio per risposte dettagliate
      stream: false
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error('Failed to get response from AI');
    }

    // SALVA nella tabella tutor_chat_messages per persistenza chat per documento
    console.log('🔍 [CRITICAL_DEBUG_TUTOR] Checking save conditions:', {
      hasDocumentId: !!documentId,
      documentId: documentId,
      hasSupabaseAdmin: !!supabaseAdmin,
      userIdType: typeof user.id,
      userId: user.id
    });
    
    if (documentId && supabaseAdmin) {
      try {
        console.log('💾 [CRITICAL_DEBUG_TUTOR] Attempting to save chat messages:', {
          userId: user.id,
          documentId: documentId,
          userMessage: message.substring(0, 50) + '...',
          assistantReply: reply.substring(0, 50) + '...'
        });

        // Salva messaggio utente
        console.log('🔍 [CRITICAL_DEBUG_TUTOR] About to save user message with:', {
          user_id: user.id,
          document_id: documentId,
          role: 'user',
          contentLength: message.length
        });
        
        const { data: userInsert, error: userError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .insert({
            user_id: user.id,
            document_id: documentId,
            role: 'user',
            content: message
          })
          .select();

        console.log('🔍 [CRITICAL_DEBUG_TUTOR] User message insert result:', {
          success: !userError,
          error: userError?.message || userError,
          errorCode: userError?.code,
          insertedData: userInsert
        });

        if (userError) {
          console.error('❌ Error saving user message:', userError);
          throw userError;
        }
        console.log('✅ User message saved:', userInsert);

        // Salva risposta assistente
        console.log('🔍 [CRITICAL_DEBUG_TUTOR] About to save assistant message with:', {
          user_id: user.id,
          document_id: documentId,
          role: 'assistant',
          contentLength: reply.length
        });
        
        const { data: assistantInsert, error: assistantError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .insert({
            user_id: user.id,
            document_id: documentId,
            role: 'assistant',
            content: reply
          })
          .select();

        console.log('🔍 [CRITICAL_DEBUG_TUTOR] Assistant message insert result:', {
          success: !assistantError,
          error: assistantError?.message || assistantError,
          errorCode: assistantError?.code,
          insertedData: assistantInsert
        });

        if (assistantError) {
          console.error('❌ Error saving assistant message:', assistantError);
          throw assistantError;
        }
        console.log('✅ Assistant message saved:', assistantInsert);

        console.log('✅ Chat messages saved for document:', documentId);
        
        // CACHE la nuova informazione con Redis
        console.log('🚀 [REDIS_CACHE] Caching updated tutor count for immediate reads...');
        try {
          const tempCacheKey = `tutor_messages_${user.id}_${documentId}`;
          const newCount = messageCount + 1; // +1 perché abbiamo appena aggiunto il messaggio
          
          await cache.set(tempCacheKey, newCount, 30 * 24 * 60 * 60 * 1000); // 30 giorni
          console.log('🚀 [REDIS_CACHE] Cached tutor count:', newCount, 'for key:', tempCacheKey);
          
          // NUOVO: Cache anche i messaggi stessi per lo storico
          const historyCacheKey = `tutor_history_${user.id}_${documentId}`;
          (global as any).tempHistoryCache = (global as any).tempHistoryCache || new Map();
          
          // Recupera messaggi esistenti dal cache se ci sono
          const existingHistory = (global as any).tempHistoryCache.get(historyCacheKey);
          const existingMessages = (existingHistory && existingHistory.expires > Date.now()) 
            ? existingHistory.messages 
            : [];
          
          // Aggiungi i nuovi messaggi
          const newMessages = [
            ...existingMessages,
            {
              id: userInsert?.[0]?.id || 'temp-user-' + Date.now(),
              role: 'user',
              content: message,
              created_at: new Date().toISOString(),
              user_id: user.id,
              document_id: documentId
            },
            {
              id: assistantInsert?.[0]?.id || 'temp-assistant-' + Date.now(),
              role: 'assistant',
              content: reply,
              created_at: new Date().toISOString(),
              user_id: user.id,
              document_id: documentId
            }
          ];
          
          (global as any).tempHistoryCache.set(historyCacheKey, {
            messages: newMessages,
            expires: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 giorni = 3 mesi
          });
          console.log('💾 [NEW_USER_CACHE] Cached chat history, total messages:', newMessages.length);
        } catch (cacheError) {
          console.log('⚠️ Cache error (non-critical):', cacheError);
        }
        
        // VERIFICA IMMEDIATA: I messaggi sono stati salvati veramente?
        console.log('🔍 [CRITICAL_DEBUG_TUTOR] Verifying messages were saved...');
        const { data: verifyMessages, error: verifyError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .select('id, role, created_at, user_id, document_id')
          .eq('user_id', user.id)
          .eq('document_id', documentId)
          .order('created_at', { ascending: false })
          .limit(3);

        console.log('🔍 [CRITICAL_DEBUG_TUTOR] Verification result:', {
          verifyError: verifyError?.message || 'none',
          messagesFound: verifyMessages?.length || 0,
          latestMessages: verifyMessages?.map(m => ({ 
            id: m.id, 
            role: m.role, 
            user_id: m.user_id,
            document_id: m.document_id 
          })) || []
        });

        // DEBUG AGGIUNTIVO: Cerca per USER_ID solo
        const { data: userOnlyMessages, error: userOnlyError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .select('id, user_id, document_id, role, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        console.log('🔍 [CRITICAL_DEBUG_TUTOR] All messages for this user:', {
          userOnlyError: userOnlyError?.message || 'none',
          userOnlyMessagesFound: userOnlyMessages?.length || 0,
          userOnlyMessages: userOnlyMessages?.map(m => ({ 
            id: m.id, 
            user_id: m.user_id,
            document_id: m.document_id,
            role: m.role
          })) || []
        });

        // DEBUG AGGIUNTIVO: Cerca per DOCUMENT_ID solo
        const { data: docOnlyMessages, error: docOnlyError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .select('id, user_id, document_id, role, created_at')
          .eq('document_id', documentId)
          .order('created_at', { ascending: false })
          .limit(5);

        console.log('🔍 [CRITICAL_DEBUG_TUTOR] All messages for this document:', {
          docOnlyError: docOnlyError?.message || 'none',
          docOnlyMessagesFound: docOnlyMessages?.length || 0,
          docOnlyMessages: docOnlyMessages?.map(m => ({ 
            id: m.id, 
            user_id: m.user_id,
            document_id: m.document_id,
            role: m.role
          })) || []
        });
      } catch (chatError) {
        console.error('❌ Failed to save chat messages:', chatError);
        console.error('❌ Full error details:', {
          error: chatError,
          code: chatError?.code,
          message: chatError?.message,
          details: chatError?.details
        });
        // Non bloccare la risposta se il salvataggio fallisce
      }
    } else {
      console.log('⚠️ [CRITICAL_DEBUG_TUTOR] Skipping chat save - missing conditions:', {
        hasDocumentId: !!documentId,
        documentIdValue: documentId,
        hasSupabaseAdmin: !!supabaseAdmin
      });
    }

    // Calcola statistiche finali
    const newMessageCount = messageCount + 1;
    const isWithinFreeLimit = newMessageCount <= CreditCosts.tutorFreeMessages;

    console.log('✅ Tutor AI processed successfully:', {
      messageCount: newMessageCount,
      cost,
      newBalance: newCreditBalance,
      isWithinFreeLimit
    });

    return NextResponse.json({
      reply,
      newCreditBalance,
      creditsUsed: cost,
      messageCount: newMessageCount,
      isWithinFreeLimit,
      freeMessagesRemaining: Math.max(0, CreditCosts.tutorFreeMessages - newMessageCount)
    });

  } catch (error) {
    console.error('Tutor API error:', error);
    
    // Gestisci errori specifici di crediti
    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { 
          error: 'LIMIT_REACHED',
          message: 'Hai finito i messaggi gratuiti. Puoi continuare per 2 crediti per messaggio.',
          type: 'limit_reached' 
        },
        { status: 402 }
      );
    }
    
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Si è verificato un errore interno nel Tutor AI." },
      { status: 500 }
    );
  }
}