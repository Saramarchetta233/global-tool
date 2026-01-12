import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { cache } from '@/lib/redis-cache';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createUltraMapsPrompt = (text: string, targetLanguage: string = 'Italiano') => `
Crea mappa ULTRA in ${targetLanguage} (massimo 30-40 nodi).

REGOLE:
- Struttura 3-4 livelli max
- Titoli BREVI (max 40 caratteri)
- Type: concept|example|formula|definition
- Priority: high|medium|low

FORMATO JSON:
{
  "mappa_ultra": [
    {
      "id": "main_1",
      "title": "Argomento Breve", 
      "type": "concept",
      "priority": "high",
      "children": [
        {
          "id": "sub_1_1",
          "title": "Sottoargomento",
          "type": "concept",
          "priority": "medium"
        }
      ]
    }
  ],
  "connections": [],
  "stats": {"total_nodes": 35, "max_depth": 3}
}

TESTO:
${text.substring(0, 8000)}

IMPORTANTE: JSON valido, titoli brevi, max 40 nodi totali.`;

export const POST = async (request: NextRequest) => {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    if (token.startsWith('demo-token-')) {
      return NextResponse.json(
        { error: 'Demo mode - Ultra features not available' },
        { status: 403 }
      );
    }

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

    console.log('🗺️ [ULTRA_MAPS] Starting generation for session:', sessionId);

    // Check cache
    const cacheKey = `ultra_maps_${sessionId}`;
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        console.log('🚀 [ULTRA_MAPS_CACHE_HIT] Returning cached maps (no credit charge)');
        return NextResponse.json({ 
          mappa_ultra: cached, 
          fromCache: true,
          message: 'Mappa Ultra già generata per questo documento' 
        });
      }
    } catch (cacheError) {
      console.log('⚠️ Cache error (non-critical):', cacheError);
    }

    // Get session data
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('pdf_text, mappa_ultra')
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
    if (session.mappa_ultra) {
      console.log('✅ [ULTRA_MAPS] Already exists in DB, returning (no credit charge)');
      return NextResponse.json({ 
        mappa_ultra: session.mappa_ultra, 
        fromDatabase: true,
        message: 'Mappa Ultra già generata per questo documento' 
      });
    }

    if (!session.pdf_text) {
      return NextResponse.json(
        { error: 'No document text found' },
        { status: 404 }
      );
    }

    console.log('🤖 [ULTRA_MAPS] Generating with OpenAI...');
    
    // Generate Ultra Maps
    const prompt = createUltraMapsPrompt(session.pdf_text, targetLanguage);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2500, // Reduced to prevent truncation
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse response - robust JSON extraction
    let mapData;
    try {
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
      
      console.log('🧹 [JSON_CLEAN] Attempting to parse:', cleanContent.substring(0, 200) + '...');
      
      mapData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('❌ Raw content (first 500 chars):', content.substring(0, 500));
      console.error('❌ Cleaned content (first 500 chars):', content.substring(0, 500));
      throw new Error('Invalid JSON response from AI');
    }

    if (!mapData.mappa_ultra || !Array.isArray(mapData.mappa_ultra)) {
      throw new Error('Invalid map data structure');
    }

    console.log('✅ [ULTRA_MAPS] Generated map with', mapData.stats?.total_nodes || 'unknown', 'nodes');

    // Save to database
    const { error: updateError } = await supabaseAdmin
      .from('tutor_sessions')
      .update({ 
        mappa_ultra: {
          nodes: mapData.mappa_ultra,
          connections: mapData.connections || [],
          stats: mapData.stats || {}
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userAuth.user.id);

    if (updateError) {
      console.error('❌ Failed to save maps to database:', updateError);
      throw new Error('Failed to save maps');
    }

    // Cache for 6 months
    const CACHE_TTL_6_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
    try {
      await cache.set(cacheKey, mapData, CACHE_TTL_6_MONTHS);
      console.log('🚀 [ULTRA_MAPS_CACHE_SET] Cached for 6 months');
    } catch (cacheError) {
      console.log('⚠️ Failed to cache maps (non-critical):', cacheError);
    }

    return NextResponse.json({ 
      mappa_ultra: {
        nodes: mapData.mappa_ultra,
        connections: mapData.connections || [],
        stats: mapData.stats || {}
      }
    });

  } catch (error) {
    console.error('❌ [ULTRA_MAPS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Ultra Maps' },
      { status: 500 }
    );
  }
};