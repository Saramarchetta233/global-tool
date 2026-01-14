import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/redis-cache';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/history/update-ultra-flashcards
 * Aggiorna la cache Redis con le flashcard_ultra per un documento specifico
 * Supporta sia autenticazione standard (Bearer token) che interna (X-Internal-Task)
 */
export async function POST(request: NextRequest) {
  try {
    let userId: string | null = null;

    // Controlla se è una chiamata interna dal task Trigger.dev
    const isInternalTask = request.headers.get('X-Internal-Task') === 'true';
    const internalUserId = request.headers.get('X-User-Id');

    if (isInternalTask && internalUserId) {
      // Autenticazione interna dal task Trigger.dev
      userId = internalUserId;
      console.log(`🔐 [CACHE_UPDATE] Internal task authentication for user ${userId}`);
    } else {
      // Autenticazione standard con Bearer token
      const token = request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({ error: 'Token richiesto' }, { status: 401 });
      }

      // Verifica utente
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'UserId non trovato' }, { status: 401 });
    }

    const { sessionId, flashcardUltra } = await request.json();

    if (!sessionId || !flashcardUltra) {
      return NextResponse.json({ error: 'sessionId e flashcardUltra richiesti' }, { status: 400 });
    }

    // Invalida la cache Redis per forzare ricaricamento dal database
    // Questo è più sicuro che aggiornare parzialmente
    const historyCacheKey = `document_history_${userId}`;

    try {
      // Prima prova ad aggiornare la cache esistente
      const cachedHistory = await cache.get(historyCacheKey);

      if (cachedHistory && Array.isArray(cachedHistory)) {
        // Trova e aggiorna il documento nella cache
        const updatedHistory = cachedHistory.map((doc: any) => {
          if (doc.id === sessionId || doc.sessionId === sessionId) {
            return { ...doc, flashcard_ultra: flashcardUltra };
          }
          return doc;
        });

        // Salva la cache aggiornata (mantieni lo stesso TTL di 6 mesi)
        const CACHE_TTL_6_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
        await cache.set(historyCacheKey, updatedHistory, CACHE_TTL_6_MONTHS);

        console.log(`✅ [CACHE_UPDATE] flashcard_ultra aggiunta alla cache per sessione ${sessionId}`);
        return NextResponse.json({ success: true, cacheUpdated: true });
      } else {
        console.log(`⚠️ [CACHE_UPDATE] Nessuna cache trovata per utente ${userId}`);
        return NextResponse.json({ success: true, cacheUpdated: false, reason: 'no_cache' });
      }
    } catch (cacheError) {
      console.error('❌ Errore aggiornamento cache:', cacheError);
      return NextResponse.json({ success: true, cacheUpdated: false, reason: 'cache_error' });
    }

  } catch (error) {
    console.error('❌ Errore API update-ultra-flashcards:', error);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
