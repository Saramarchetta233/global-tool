import { NextRequest, NextResponse } from 'next/server';

import { verifyAuth } from '@/lib/middleware';
import { cache } from '@/lib/redis-cache';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await verifyAuth(request);
    
    const { documentId, resetType = 'all' } = await request.json();

    console.log('🔄 [CACHE_RESET] Resetting cache for user:', user.id);

    const results = {
      redisReset: false,
      memoryReset: false,
      errors: []
    };

    // Reset cache Redis se richiesto
    if (resetType === 'all' || resetType === 'redis') {
      try {
        if (documentId) {
          const cacheKey = `tutor_messages_${user.id}_${documentId}`;
          await cache.delete(cacheKey);
          console.log('🚀 [REDIS_RESET] Deleted cache key:', cacheKey);
        } else {
          // Non abbiamo un metodo per cancellare tutte le chiavi dell'utente
          // Dobbiamo specificare il documentId
          console.log('⚠️ [REDIS_RESET] DocumentId required for Redis reset');
        }
        results.redisReset = true;
      } catch (error) {
        console.error('❌ [REDIS_RESET] Error:', error);
        results.errors.push('Redis reset failed: ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    // Reset cache memoria se richiesto
    if (resetType === 'all' || resetType === 'memory') {
      try {
        if (documentId) {
          const historyCacheKey = `tutor_history_${user.id}_${documentId}`;
          if ((global as any).tempHistoryCache) {
            (global as any).tempHistoryCache.delete(historyCacheKey);
            console.log('💾 [MEMORY_RESET] Deleted history cache key:', historyCacheKey);
          }
        } else {
          // Reset completo cache memoria
          (global as any).tempHistoryCache = new Map();
          console.log('💾 [MEMORY_RESET] Cleared entire memory history cache');
        }
        results.memoryReset = true;
      } catch (error) {
        console.error('❌ [MEMORY_RESET] Error:', error);
        results.errors.push('Memory reset failed: ' + (error instanceof Error ? error.message : String(error)));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cache reset completed',
      results
    });

  } catch (error) {
    console.error('🔄 [CACHE_RESET] Error:', error);
    return NextResponse.json({ 
      error: 'Cache reset failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}