import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyAuth } from '@/lib/middleware';
import { CreditCosts } from '@/lib/credits/creditRules';
import { createTutorPrompt } from '@/lib/prompts';
import { supabase } from '@/lib/supabase';

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
      sessionId
    } = body || {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Campo 'message' mancante o non valido." },
        { status: 400 }
      );
    }

    // Gestione costi: 5 messaggi gratis poi 2 crediti per messaggio
    let cost = 0;
    let newCreditBalance = user.credits;
    let isWithinFreeLimit = false;

    // Conta i messaggi tutor già utilizzati dall'utente
    // Contiamo SOLO le voci con feature_type 'tutor' per un conteggio preciso dei messaggi
    const { data: tutorMessages, error } = await supabase
      .from('credit_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_type', 'tutor')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutor message count:', error);
    }

    const messageCount = tutorMessages?.length || 0;
    
    if (messageCount < CreditCosts.tutorFreeMessages) {
      // Ancora nei messaggi gratuiti
      isWithinFreeLimit = true;
      cost = 0;
    } else {
      // Deve pagare
      cost = CreditCosts.tutorMessageCost;
      
      // Verifica che abbia crediti sufficienti
      if (user.credits < cost) {
        throw new Error('Insufficient credits');
      }
      
      // Usa la funzione Supabase per detrarre crediti
      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_credits', {
          p_user_id: user.id,
          p_amount: cost,
          p_description: `Messaggio Tutor AI (${messageCount + 1})`,
          p_feature_type: 'tutor'
        });
      
      if (creditError || !creditResult?.success) {
        console.error('Credit deduction error:', creditError || creditResult);
        throw new Error('Failed to deduct credits');
      }
      
      newCreditBalance = creditResult.new_balance;
    }

    // Se è gratuito, aggiungi comunque un log per contare i messaggi
    if (isWithinFreeLimit) {
      await supabase
        .from('credit_logs')
        .insert({
          user_id: user.id,
          amount: 0,
          operation: 'consume',
          description: `Messaggio Tutor AI gratuito (${messageCount + 1}/${CreditCosts.tutorFreeMessages})`,
          feature_type: 'tutor',
          balance_before: user.credits,
          balance_after: user.credits
        });
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

    return NextResponse.json({
      reply,
      creditsRemaining: newCreditBalance,
      newCreditBalance,
      creditsUsed: cost,
      isWithinFreeLimit,
      freeMessagesRemaining: isWithinFreeLimit ? CreditCosts.tutorFreeMessages - (messageCount + 1) : 0
    });

  } catch (error) {
    console.error('Tutor API error:', error);
    
    // Gestisci errori specifici di crediti
    if (error instanceof Error && error.message.includes('Insufficient credits')) {
      return NextResponse.json(
        { 
          error: 'Crediti insufficienti per il Tutor AI',
          type: 'insufficient_credits' 
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