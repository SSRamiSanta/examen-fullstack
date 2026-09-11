import { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  statusCode: number;
  body: unknown;
}

export class IdempotencyStore {
  private readonly cache: Map<string, CachedResponse> = new Map();

  public get(key: string): CachedResponse | undefined {
    return this.cache.get(key);
  }

  public set(key: string, response: CachedResponse): void {
    this.cache.set(key, response);
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
