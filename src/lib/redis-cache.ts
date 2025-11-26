import { Redis } from '@upstash/redis';

// Configurazione Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheItem {
  value: any;
  expires: number;
}

class ProductionCache {
  private memoryFallback = new Map<string, CacheItem>();

  async get(key: string): Promise<any> {
    try {
      // Prova prima Redis (produzione)
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const data = await redis.get(key);
        if (data !== null) {
          console.log(`🚀 [REDIS_CACHE_HIT] Key: ${key}`);
          return data;
        }
      }

      // Fallback memoria locale (dev/backup)
      const memoryItem = this.memoryFallback.get(key);
      if (memoryItem && memoryItem.expires > Date.now()) {
        console.log(`💾 [MEMORY_CACHE_HIT] Key: ${key}`);
        return memoryItem.value;
      }

      console.log(`❌ [CACHE_MISS] Key: ${key}`);
      return null;
    } catch (error) {
      console.log(`⚠️ Cache get error for key ${key}:`, error);
      
      // Fallback memoria in caso di errore Redis
      const memoryItem = this.memoryFallback.get(key);
      if (memoryItem && memoryItem.expires > Date.now()) {
        return memoryItem.value;
      }
      return null;
    }
  }

  async set(key: string, value: any, ttlMs: number): Promise<void> {
    try {
      const ttlSeconds = Math.ceil(ttlMs / 1000);
      
      // Salva in Redis (produzione)
      if (process.env.UPSTASH_REDIS_REST_URL) {
        await redis.setex(key, ttlSeconds, value);
        console.log(`🚀 [REDIS_CACHE_SET] Key: ${key}, TTL: ${ttlSeconds}s`);
      }

      // Salva anche in memoria (fallback)
      this.memoryFallback.set(key, {
        value,
        expires: Date.now() + ttlMs
      });
      console.log(`💾 [MEMORY_CACHE_SET] Key: ${key}`);
    } catch (error) {
      console.log(`⚠️ Cache set error for key ${key}:`, error);
      
      // Se Redis fallisce, almeno salva in memoria
      this.memoryFallback.set(key, {
        value,
        expires: Date.now() + ttlMs
      });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Rimuovi da Redis
      if (process.env.UPSTASH_REDIS_REST_URL) {
        await redis.del(key);
      }
      
      // Rimuovi da memoria
      this.memoryFallback.delete(key);
      console.log(`🗑️ [CACHE_DELETE] Key: ${key}`);
    } catch (error) {
      console.log(`⚠️ Cache delete error for key ${key}:`, error);
    }
  }

  // Metodi helper per backward compatibility
  getOld(key: string): any {
    const memoryItem = this.memoryFallback.get(key);
    if (memoryItem && memoryItem.expires > Date.now()) {
      return memoryItem;
    }
    return null;
  }

  setOld(key: string, data: { value: any; expires: number }): void {
    const ttlMs = data.expires - Date.now();
    if (ttlMs > 0) {
      this.set(key, data.value, ttlMs);
    }
  }
}

// Istanza singleton
export const cache = new ProductionCache();

// Backward compatibility con il sistema esistente
if (typeof global !== 'undefined') {
  (global as any).tempUserCache = {
    get: (key: string) => {
      // Versione sincrona per backward compatibility
      const memoryItem = cache.getOld(key);
      return memoryItem;
    },
    set: (key: string, data: { value: any; expires: number }) => {
      cache.setOld(key, data);
    }
  };
  
  (global as any).tempHistoryCache = {
    get: (key: string) => {
      const memoryItem = cache.getOld(key);
      return memoryItem;
    },
    set: (key: string, data: { messages: any[]; expires: number }) => {
      cache.setOld(key, { value: data.messages, expires: data.expires });
    }
  };
}