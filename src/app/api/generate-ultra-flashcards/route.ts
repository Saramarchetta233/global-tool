import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { cache } from '@/lib/redis-cache';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering for real-time generation
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced prompts for Ultra Flashcards
const createUltraFlashcardsPrompt = (text: string, targetLanguage: string = 'Italiano') => `
Crea 40-60 flashcard ULTRA in ${targetLanguage} dal testo. 

REGOLE:
- Risposte CONCISE (max 80 parole)
- Categorizza: Definizioni, Formule, Esempi, Date, Concetti, Confronti, Cause-Effetti
- Difficoltà: basic|intermediate|advanced
- NO simboli matematici

FORMATO JSON RICHIESTO:
{
  "flashcard_ultra": [
    {
      "front": "Domanda chiara",
      "back": "Risposta concisa",
      "category": "Definizioni", 
      "difficulty": "basic"
    }
  ],
  "stats": {"total": 45}
}

TESTO:
${text.substring(0, 8000)}

IMPORTANTE: Solo JSON valido, risposte brevi, massimo 60 flashcard.`;

export const POST = async (request: NextRequest) => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Handle demo tokens
    if (token.startsWith('demo-token-')) {
      return NextResponse.json(
        { error: 'Demo mode - Ultra features not available' },
        { status: 403 }
      );
    }

    // Verify token and get user
    const { data: userAuth, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userAuth.user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, targetLanguage = 'Italiano' } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    console.log('🃏 [ULTRA_FLASHCARDS] Starting generation for session:', sessionId);

    // Check if already exists in cache
    const cacheKey = `ultra_flashcards_${sessionId}`;
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        console.log('🚀 [ULTRA_FLASHCARDS_CACHE_HIT] Returning cached flashcards (no credit charge)');
        return NextResponse.json({ 
          flashcard_ultra: cached, 
          fromCache: true,
          message: 'Flashcard Ultra già generate per questo documento' 
        });
      }
    } catch (cacheError) {
      console.log('⚠️ Cache error (non-critical):', cacheError);
    }

    // Get original document text from database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('pdf_text, flashcard_ultra')
      .eq('id', sessionId)
      .eq('user_id', userAuth.user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if already generated
    if (session.flashcard_ultra) {
      console.log('✅ [ULTRA_FLASHCARDS] Already exists in DB, returning (no credit charge)');
      return NextResponse.json({ 
        flashcard_ultra: session.flashcard_ultra, 
        fromDatabase: true,
        message: 'Flashcard Ultra già generate per questo documento' 
      });
    }

    if (!session.pdf_text) {
      return NextResponse.json(
        { error: 'No document text found' },
        { status: 404 }
      );
    }

    console.log('🤖 [ULTRA_FLASHCARDS] Generating with OpenAI...');
    
    // Generate Ultra Flashcards with OpenAI
    const prompt = createUltraFlashcardsPrompt(session.pdf_text, targetLanguage);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 3000, // Reduced to prevent truncation
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse response - robust JSON extraction
    let flashcardData;
    
    // Multiple strategies to extract JSON
    let cleanContent = content.trim();
    
    // Strategy 1: Remove markdown code blocks
    cleanContent = cleanContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/g, '')
      .trim();
    
    // Strategy 2: Find JSON object between { and last }
    const firstBrace = cleanContent.indexOf('{');
    const lastBrace = cleanContent.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
    }
    
    // Strategy 3: Remove any text before first { and after last }
    cleanContent = cleanContent.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    try {
      console.log('🧹 [JSON_CLEAN] Attempting to parse:', cleanContent.substring(0, 200) + '...');
      
      flashcardData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      
      // Fallback: Try to fix incomplete JSON
      try {
        console.log('🔧 [JSON_REPAIR] Attempting to repair truncated JSON...');
        
        // Find last complete flashcard
        const flashcardArrayStart = cleanContent.indexOf('"flashcard_ultra": [');
        const flashcardArrayContent = cleanContent.substring(flashcardArrayStart);
        
        // Find position of last complete }
        let lastCompleteCard = -1;
        let braceCount = 0;
        for (let i = 0; i < flashcardArrayContent.length; i++) {
          if (flashcardArrayContent[i] === '{') braceCount++;
          if (flashcardArrayContent[i] === '}') {
            braceCount--;
            if (braceCount === 0) lastCompleteCard = i;
          }
        }
        
        if (lastCompleteCard > -1) {
          const repairedContent = cleanContent.substring(0, flashcardArrayStart + lastCompleteCard + 1) + '], "stats": {"total": 0}}';
          console.log('🔧 [JSON_REPAIR] Trying repaired version...');
          flashcardData = JSON.parse(repairedContent);
          console.log('✅ [JSON_REPAIR] Successfully repaired truncated JSON');
        } else {
          throw new Error('Cannot repair JSON');
        }
      } catch (repairError) {
        console.error('❌ JSON repair failed:', repairError);
        console.error('❌ Raw content (first 1000 chars):', content.substring(0, 1000));
        console.error('❌ Cleaned content (first 1000 chars):', cleanContent.substring(0, 1000));
        throw new Error('Invalid JSON response from AI');
      }
    }

    if (!flashcardData.flashcard_ultra || !Array.isArray(flashcardData.flashcard_ultra)) {
      throw new Error('Invalid flashcard data structure');
    }

    console.log('✅ [ULTRA_FLASHCARDS] Generated:', flashcardData.flashcard_ultra.length, 'flashcards');

    // Save to database
    const { error: updateError } = await supabaseAdmin
      .from('tutor_sessions')
      .update({ 
        flashcard_ultra: flashcardData.flashcard_ultra,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userAuth.user.id);

    if (updateError) {
      console.error('❌ Failed to save flashcards to database:', updateError);
      throw new Error('Failed to save flashcards');
    }

    // Cache for 6 months
    const CACHE_TTL_6_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
    try {
      await cache.set(cacheKey, flashcardData.flashcard_ultra, CACHE_TTL_6_MONTHS);
      console.log('🚀 [ULTRA_FLASHCARDS_CACHE_SET] Cached for 6 months');
    } catch (cacheError) {
      console.log('⚠️ Failed to cache flashcards (non-critical):', cacheError);
    }

    return NextResponse.json({ 
      flashcard_ultra: flashcardData.flashcard_ultra,
      stats: flashcardData.stats 
    });

  } catch (error) {
    console.error('❌ [ULTRA_FLASHCARDS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Ultra Flashcards' },
      { status: 500 }
    );
  }
};