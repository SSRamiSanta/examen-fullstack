import { IdempotencyStore } from '../../src/infra/http/middlewares/idempotency.middleware';

describe('IdempotencyStore (TTL & Memory Leak Prevention)', () => {
  it('debe almacenar y recuperar respuestas antes de que expire el TTL', () => {
    const store = new IdempotencyStore(1000); // 1 segundo TTL
    store.set('key-1', { statusCode: 200, body: { success: true } });

    const cached = store.get('key-1');
    expect(cached).toBeDefined();
    expect(cached?.statusCode).toBe(200);
    expect(cached?.body).toEqual({ success: true });
  });

  it('debe expirar y eliminar automáticamente entradas cuyo TTL venció', async () => {
    const store = new IdempotencyStore(50); // 50ms TTL
    store.set('key-fast', { statusCode: 200, body: { ok: true } });

    await new Promise((resolve) => setTimeout(resolve, 80));

    const expired = store.get('key-fast');
    expect(expired).toBeUndefined();
    expect(store.size()).toBe(0);
  });

  it('debe respetar la capacidad máxima expulsando la entrada más antigua si se satura', () => {
    const store = new IdempotencyStore(60000, 2); // Capacidad máxima: 2
    store.set('key-1', { statusCode: 200, body: 1 });
    store.set('key-2', { statusCode: 200, body: 2 });
    store.set('key-3', { statusCode: 200, body: 3 }); // Desborda capacidad

    expect(store.size()).toBeLessThanOrEqual(2);
    expect(store.get('key-1')).toBeUndefined(); // Expulsado
    expect(store.get('key-3')).toBeDefined();
  });
});
