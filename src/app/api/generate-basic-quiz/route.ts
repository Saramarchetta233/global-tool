import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'Italiano' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Testo non fornito' }, { status: 400 });
    }

    const prompt = `Crea un Quiz di Base di 3 domande in ${language} su questo documento:

DOCUMENTO:
${text.substring(0, 8000)}

Genera SOLO 3 domande multiple choice di difficoltà BASE, sui concetti più importanti.

Rispondi SOLO con JSON:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Prima domanda base...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_option_index": 0,
      "explanation": "Spiegazione semplice"
    },
    {
      "id": "q2", 
      "type": "multiple_choice",
      "question": "Seconda domanda base...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_option_index": 1,
      "explanation": "Spiegazione semplice"
    },
    {
      "id": "q3",
      "type": "multiple_choice", 
      "question": "Terza domanda base...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_option_index": 2,
      "explanation": "Spiegazione semplice"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0].message.content || '{}';
    
    try {
      const cleanedContent = content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
        
      const quizData = JSON.parse(cleanedContent);
      
      return NextResponse.json(quizData);
    } catch (parseError) {
      console.error('Error parsing quiz JSON:', parseError);
      return NextResponse.json({ 
        error: 'Errore nella generazione del quiz',
        fallback: {
          questions: [
            {
              id: "q1",
              type: "multiple_choice",
              question: "Quale è l'argomento principale del documento?",
              options: ["A) Argomento A", "B) Argomento B", "C) Argomento C", "D) Argomento D"],
              correct_option_index: 0,
              explanation: "Risposta basata sul contenuto del documento."
            }
          ]
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error generating basic quiz:', error);
    return NextResponse.json(
      { error: 'Errore nella generazione del quiz' },
      { status: 500 }
    );
  }
}