import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { withCredits } from '@/lib/middleware';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = withCredits('summary', async (request: NextRequest, user, newCreditBalance) => {
  try {
    const { docContext, examDays } = await request.json();

    if (!docContext) {
      return NextResponse.json(
        { error: 'Document context is required' },
        { status: 400 }
      );
    }

    const prompt = `Crea un piano di studio dettagliato per prepararsi all'esame in ${examDays} giorni, basato ESCLUSIVAMENTE sul seguente contenuto del documento.

Contenuto del documento:
${docContext.substring(0, 6000)}

REQUISITI:
- Piano per esattamente ${examDays} giorni
- Ogni giorno deve avere attività specifiche
- Basato sui concetti del documento fornito
- Distribuzione intelligente dei contenuti
- Giorni finali dedicati al ripasso
- Approccio progressivo (dal generale al specifico)

FORMATO RICHIESTO (JSON):
{
  "studyPlan": {
    "totalDays": ${examDays},
    "description": "Piano di studio strategico per ${examDays} giorni",
    "days": [
      {
        "day": 1,
        "title": "Fase iniziale: Panoramica generale",
        "description": "Attività specifiche per questo giorno basate sui concetti del documento",
        "timeRequired": "2-3 ore",
        "focus": "Comprensione generale"
      }
    ]
  }
}

IMPORTANTE: Le attività devono essere SEMPRE basate sui contenuti specifici del documento fornito.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sei un esperto di metodologie di studio e pianificazione accademica. Crea piani di studio efficaci e realistici."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error('Failed to generate study plan');
    }

    // Parse JSON response
    const cleanContent = responseContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let planData;
    try {
      planData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse study plan JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to generate properly formatted study plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      studyPlan: planData.studyPlan || planData,
      newCreditBalance,
      creditsUsed: 5
    });

  } catch (error) {
    console.error('Study plan API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate study plan' },
      { status: 500 }
    );
  }
});