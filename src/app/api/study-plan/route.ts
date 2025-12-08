import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { verifyAuth } from '@/lib/middleware';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione (ma il piano di studio è GRATIS!)
    const user = await verifyAuth(request);
    
    const { docContext, examDays } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    // Default a 7 giorni se non specificato
    const days = examDays || 7;
    
    const prompt = `Crea un piano di studio DETTAGLIATO per ${days} giorni basato sul documento fornito. Ogni giorno deve avere istruzioni precise passo-passo.

CONTENUTO DOCUMENTO:
${docContext.substring(0, 6000)}

TOOL STUDIUS AI DA USARE:
• Riassunto Breve/Esteso 
• Flashcard
• Quiz/Esame scritto
• Domande più Probabili  
• Esame Orale

FORMATO JSON:
{
  "days": [
    {
      "day": 1,
      "title": "Giorno 1 — Fondare le basi",
      "description": "BLOCCO 1 (20 min): Prendi i riassunti che hai fatto con il nostro tool Riassunto Breve, leggili attentamente, comprendi ogni concetto. Leggili almeno 3 volte finché non sei sicuro di aver capito tutto. BLOCCO 2 (20 min): Genera Flashcard con il nostro tool sui concetti principali che hai appena studiato. Ripassa le flashcard 2 volte. BLOCCO 3 (15 min): Fai un quiz base con il nostro tool Esame scritto per testare la comprensione di base. BLOCCO 4 (10 min): Rileggi velocemente i punti che hai sbagliato nel quiz e preparati per domani."
    }
  ]
}

ESEMPIO DI DESCRIZIONE DETTAGLIATA:
"BLOCCO 1 (20 min): Prendi i riassunti che hai creato con il nostro tool Riassunto e leggili attentamente. Concentrati su [argomenti specifici del documento]. Ripeti la lettura 2-3 volte. BLOCCO 2 (20 min): Apri il tool Flashcard di Studius e crea flashcard sui concetti che hai appena studiato. Genera almeno 5-7 flashcard. BLOCCO 3 (15 min): Usa il tool Esame scritto per fare un quiz veloce sui contenuti. BLOCCO 4 (10 min): Ripassa gli errori e organizza il materiale per domani."

PROGRESSIONE DEI GIORNI:
- Giorni 1-${Math.ceil(days*0.4)}: Focus su Riassunto + Flashcard + Quiz base
- Giorni ${Math.ceil(days*0.4)+1}-${Math.ceil(days*0.8)}: Approfondimento + Domande più Probabili + Quiz avanzati  
- Ultimi giorni: Esame Orale + Ripasso finale

IMPORTANTE:
1. Ogni description deve essere MOLTO dettagliata (almeno 100 parole)
2. Specifica ESATTAMENTE come usare ogni tool Studius
3. Dai istruzioni precise per ogni blocco di tempo
4. Basati sui contenuti reali del documento
5. Sii operativo: "fai questo", "usa quello", "ripeti X volte"

ESATTAMENTE ${days} GIORNI, descrizioni dettagliate per ognuno.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sei un esperto tutor accademico specializzato in metodologie di studio efficaci e pianificazione strategica per esami universitari. Conosci perfettamente tutte le funzionalità di Studius AI (riassunti, flashcard, quiz, domande probabili, esame orale) e sai integrarle in piani di studio ottimizzati. Crei piani dettagliati, pratici e realistici che massimizzano l'apprendimento in tempi ridotti, con blocchi di studio strutturati e progressione logica."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Failed to generate study plan');
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

    let planData;
    try {
      planData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse study plan JSON:', parseError);
      console.error('Raw content length:', responseContent.length);
      console.error('Clean content preview:', cleanContent.substring(0, 500));
      
      // Fallback: piano di studio semplice
      try {
        // Prova a riparare JSON comuni
        const fixedContent = cleanContent
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/[\r\n\t]/g, ' ')
          .replace(/\s+/g, ' ');
        
        planData = JSON.parse(fixedContent);
        console.log('✅ Study plan JSON parsed after cleanup');
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        
        // Fallback finale: piano di studio dettagliato
        const days = examDays || 7;
        planData = {
          days: Array.from({ length: days }, (_, i) => {
            const phase = i < days * 0.4 ? 'base' : i < days * 0.8 ? 'pratica' : 'finale';
            return {
              day: i + 1,
              title: `Giorno ${i + 1} — ${phase === 'base' ? 'Costruire le basi' : phase === 'pratica' ? 'Consolidare e praticare' : 'Ripasso finale e simulazioni'}`,
              description: phase === 'base' ? 
                `BLOCCO 1 (20 min): Usa il nostro tool Riassunto Breve per ottenere una panoramica dei contenuti principali. Leggi il riassunto 3 volte, sottolinea i concetti che non sono chiari. Prendi appunti sui punti chiave. BLOCCO 2 (20 min): Apri il tool Flashcard di Studius AI e crea flashcard sui concetti principali che hai appena studiato. Genera almeno 6-8 flashcard. Ripassa ogni flashcard 2 volte per verificare che le ricordi. BLOCCO 3 (15 min): Usa il nostro tool Esame scritto per fare un quiz base sui contenuti di oggi. Rispondi alle domande e controlla gli errori. BLOCCO 4 (10 min): Rivedi velocemente i concetti che hai sbagliato nel quiz. Organizza il materiale per il giorno successivo.` :
                
                phase === 'pratica' ?
                `BLOCCO 1 (20 min): Riprendi le flashcard create nei giorni precedenti e ripassale tutte. Identifica quelle che ricordi meno bene e segnale. Rileggi i riassunti dei giorni passati per collegare i concetti. BLOCCO 2 (20 min): Usa il nostro tool Domande più Probabili per generare domande mirate sui contenuti studiati. Rispondi mentalmente a ogni domanda e controlla se la tua risposta è completa. BLOCCO 3 (20 min): Fai un quiz più avanzato con il nostro tool Esame scritto. Scegli 10-15 domande e cronometra le tue risposte. BLOCCO 4 (15 min): Analizza gli errori del quiz, ripassa le flashcard relative agli argomenti sbagliati. Crea 2-3 nuove flashcard sui concetti più difficili.` :

                `BLOCCO 1 (25 min): Fai una simulazione completa con il nostro tool Esame Orale. Rispondi alle domande come se fossi davvero all'esame. Cronometra le tue risposte. BLOCCO 2 (20 min): Ripassa tutte le flashcard create nei giorni precedenti. Concentrati solo su quelle che non ricordi perfettamente. BLOCCO 3 (20 min): Usa il nostro tool Domande più Probabili una volta sola sui tuoi argomenti più deboli. Ripeti le risposte ad alta voce. BLOCCO 4 (10 min): Rilassamento e preparazione mentale. Rileggi una volta sola i riassunti principali per sicurezza. Sei pronto per l'esame!`
            };
          })
        };
        console.log('⚠️ Using fallback study plan due to JSON parse errors');
      }
    }

    return NextResponse.json({
      studyPlan: planData,
      newCreditBalance: user.credits, // Nessuna deduzione, è gratis
      creditsUsed: 0 // Piano di studio GRATIS!
    });

  } catch (error) {
    console.error('Study plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    );
  }
}