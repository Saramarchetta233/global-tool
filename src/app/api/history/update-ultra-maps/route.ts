import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/redis-cache';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/history/update-ultra-maps
 * Aggiorna la cache Redis con la mappa_ultra per un documento specifico
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token richiesto' }, { status: 401 });
    }

    // Verifica utente
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    const { sessionId, mappaUltra } = await request.json();

    if (!sessionId || !mappaUltra) {
      return NextResponse.json({ error: 'sessionId e mappaUltra richiesti' }, { status: 400 });
    }

    // Aggiorna la cache Redis
    const historyCacheKey = `document_history_${user.id}`;

    try {
      const cachedHistory = await cache.get(historyCacheKey);

      if (cachedHistory && Array.isArray(cachedHistory)) {
        // Trova e aggiorna il documento nella cache
        const updatedHistory = cachedHistory.map((doc: any) => {
          if (doc.id === sessionId || doc.sessionId === sessionId) {
            return { ...doc, mappa_ultra: mappaUltra };
          }
          return doc;
        });

        // Salva la cache aggiornata (mantieni lo stesso TTL di 6 mesi)
        const CACHE_TTL_6_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
        await cache.set(historyCacheKey, updatedHistory, CACHE_TTL_6_MONTHS);

        console.log(`✅ [CACHE_UPDATE] mappa_ultra aggiunta alla cache per sessione ${sessionId}`);
        return NextResponse.json({ success: true, cacheUpdated: true });
      } else {
        console.log(`⚠️ [CACHE_UPDATE] Nessuna cache trovata per utente ${user.id}`);
        return NextResponse.json({ success: true, cacheUpdated: false, reason: 'no_cache' });
      }
    } catch (cacheError) {
      console.error('❌ Errore aggiornamento cache:', cacheError);
      return NextResponse.json({ success: true, cacheUpdated: false, reason: 'cache_error' });
    }

  } catch (error) {
    console.error('❌ Errore API update-ultra-maps:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
