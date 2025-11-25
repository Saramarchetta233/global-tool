import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { createTutorPrompt } from '@/lib/prompts';
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

    // NUOVA LOGICA: conta messaggi tutor dalla tabella dedicata tutor_messages
    let cost = 0;
    let newCreditBalance = user.credits;
    let messageCount = 0;

    console.log('🔍 Counting existing tutor messages for user:', user.id);
    
    if (!supabaseAdmin) {
      console.error('❌ supabaseAdmin not available - assuming first time');
      cost = 0;
      messageCount = 0;
    } else {
      const { count, error: countError } = await supabaseAdmin
        .from('tutor_messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('[TUTOR_COUNT_ERROR]', { userId: user.id, countError });
        // Se la tabella non esiste, assumiamo sia la prima volta
        console.log('📝 tutor_messages table not found, assuming first time');
        cost = 0;
        messageCount = 0;
      } else {
        messageCount = count ?? 0;
        
        console.log('[TUTOR_DEBUG_COUNT]', {
          userId: user.id,
          messageCount,
        });
        
        // LOGICA: primi 3 gratis, dal 4° in poi 2 crediti
        if (messageCount < CreditCosts.tutorFreeMessages) {
          cost = 0;      // PRIMI 3 → GRATIS
          console.log(`🎉 Free tutor message #${messageCount + 1} detected - making it FREE`);
        } else {
          cost = CreditCosts.tutorMessageCost;      // DAL 4° IN POI → 2 CREDITI
          console.log(`💳 Paid tutor message #${messageCount + 1} - charging ${cost} credits`);
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

    // SALVA il messaggio nella tabella tutor_messages (per conteggio crediti)
    console.log('[TUTOR_DEBUG_BEFORE_INSERT]', {
      userId: user.id,
      cost,
      messageCount
    });
    
    if (!supabaseAdmin) {
      console.log('⚠️ Skipping message insert - supabaseAdmin not available');
    } else {
      const { data: messageData, error: messageError } = await supabaseAdmin
        .from('tutor_messages')
        .insert({
          user_id: user.id,
          message_content: message.substring(0, 1000), // limita lunghezza
          response_content: reply.substring(0, 2000), // limita lunghezza
          cost,
          was_free: cost === 0
        })
        .select('id')
        .single();

      console.log('[TUTOR_DEBUG_AFTER_INSERT]', {
        userId: user.id,
        messageError,
        messageData,
      });

      if (messageError) {
        console.error('[TUTOR_INSERT_FAILED]', messageError);
        // Non bloccare la risposta se il salvataggio fallisce
        console.log('⚠️ Message saved failed, but continuing with response');
      } else {
        console.log('✅ Tutor message saved:', messageData?.id);
      }
    }

    // SALVA ANCHE nella tabella tutor_chat_messages per persistenza chat per documento
    if (documentId && supabaseAdmin) {
      try {
        console.log('💾 Attempting to save chat messages:', {
          userId: user.id,
          documentId: documentId,
          userMessage: message.substring(0, 50) + '...',
          assistantReply: reply.substring(0, 50) + '...'
        });

        // Salva messaggio utente
        const { data: userInsert, error: userError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .insert({
            user_id: user.id,
            document_id: documentId,
            role: 'user',
            content: message
          })
          .select();

        if (userError) {
          console.error('❌ Error saving user message:', userError);
          throw userError;
        }
        console.log('✅ User message saved:', userInsert);

        // Salva risposta assistente
        const { data: assistantInsert, error: assistantError } = await supabaseAdmin
          .from('tutor_chat_messages')
          .insert({
            user_id: user.id,
            document_id: documentId,
            role: 'assistant',
            content: reply
          })
          .select();

        if (assistantError) {
          console.error('❌ Error saving assistant message:', assistantError);
          throw assistantError;
        }
        console.log('✅ Assistant message saved:', assistantInsert);

        console.log('✅ Chat messages saved for document:', documentId);
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
      console.log('⚠️ Skipping chat save - missing documentId or supabaseAdmin:', {
        hasDocumentId: !!documentId,
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