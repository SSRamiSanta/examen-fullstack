import { Request, Response, NextFunction } from 'express';

export interface CachedResponse {
  statusCode: number;
  body: unknown;
  expiresAt: number;
}

export class IdempotencyStore {
  private readonly cache: Map<string, CachedResponse> = new Map();

  constructor(
    private readonly ttlMs: number = 24 * 60 * 60 * 1000, // 24 horas por defecto
    private readonly maxCapacity: number = 10000
  ) {}

  public get(key: string): CachedResponse | undefined {
    const cached = this.cache.get(key);
    if (!cached) {
      return undefined;
    }

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return cached;
  }

  public set(key: string, response: Omit<CachedResponse, 'expiresAt'>): void {
    this.pruneExpired();

    // Si aún excede la capacidad máxima tras podar expirados, expulsar la entrada más antigua (FIFO/LRU simple)
    if (this.cache.size >= this.maxCapacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      ...response,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  public pruneExpired(): void {
    const now = Date.now();
    for (const [key, val] of this.cache.entries()) {
      if (now > val.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  public size(): number {
    return this.cache.size;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const defaultIdempotencyStore = new IdempotencyStore();

export function createIdempotencyMiddleware(store: IdempotencyStore = defaultIdempotencyStore) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rawKey = req.headers['x-idempotency-key'];
    const key = Array.isArray(rawKey) ? rawKey[0] : rawKey;

    if (!key || typeof key !== 'string' || key.trim() === '') {
      res.status(400).json({
        error: 'MISSING_IDEMPOTENCY_KEY',
        message: 'La cabecera X-Idempotency-Key es obligatoria para procesar un abono.',
      });
      return;
    }

    const cached = store.get(key);
    if (cached) {
      res.status(cached.statusCode).json(cached.body);
      return;
    }

    // Interceptar res.json para guardar la respuesta exitosa
    const originalJson = res.json.bind(res);
    res.json = (body: unknown): Response => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, {
          statusCode: res.statusCode,
          body,
        });
      }
      return originalJson(body);
    };

    next();
  };
}
