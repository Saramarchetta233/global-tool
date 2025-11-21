import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';
import { createTutorPrompt } from '@/lib/prompts';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = withCredits('tutor', async (request: NextRequest, user, newCreditBalance) => {
  try {
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
      flashcards 
    } = body || {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "Campo 'message' mancante o non valido." },
        { status: 400 }
      );
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
      creditsUsed: 5
    });

  } catch (error) {
    console.error('Tutor API error:', error);
    return NextResponse.json(
      { error: "SERVER_ERROR", message: "Si è verificato un errore interno nel Tutor AI." },
      { status: 500 }
    );
  }
});