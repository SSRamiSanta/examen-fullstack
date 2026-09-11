import {
  sanitizeString,
  isPositiveFiniteNumber,
  computeHmacSha256,
  verifyHmacSha256,
  validateTimestamp,
} from '../../src/domain/security';

describe('Security Utils (Domain Core)', () => {
  const secret = 'super-secret-test-key-123';

  describe('sanitizeString', () => {
    it('debe limpiar etiquetas HTML y caracteres de inyección', () => {
      const malicious = '<script>alert("hack")</script> Viaje a París <img src=x onerror=alert(1)>';
      const clean = sanitizeString(malicious);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<img>');
      expect(clean).toContain('alert("hack")');
      expect(clean).toContain('Viaje a París');
    });

    it('debe recortar espacios y remover caracteres de control ASCII', () => {
      const input = '   \u0000\u0007Bolsillo Ahorro\u001F   ';
      expect(sanitizeString(input)).toBe('Bolsillo Ahorro');
    });

    it('debe retornar string vacío si el input no es un string', () => {
      expect(sanitizeString(null as unknown as string)).toBe('');
      expect(sanitizeString(undefined as unknown as string)).toBe('');
    });
  });

  describe('isPositiveFiniteNumber', () => {
    it('debe aceptar números finitos mayores a cero', () => {
      expect(isPositiveFiniteNumber(100)).toBe(true);
      expect(isPositiveFiniteNumber(0.01)).toBe(true);
      expect(isPositiveFiniteNumber(999999)).toBe(true);
    });

    it('debe rechazar cero, negativos, NaN, infinitos y tipos no numéricos', () => {
      expect(isPositiveFiniteNumber(0)).toBe(false);
      expect(isPositiveFiniteNumber(-1)).toBe(false);
      expect(isPositiveFiniteNumber(-0.01)).toBe(false);
      expect(isPositiveFiniteNumber(NaN)).toBe(false);
      expect(isPositiveFiniteNumber(Infinity)).toBe(false);
      expect(isPositiveFiniteNumber(-Infinity)).toBe(false);
      expect(isPositiveFiniteNumber('100')).toBe(false);
      expect(isPositiveFiniteNumber(null)).toBe(false);
      expect(isPositiveFiniteNumber(undefined)).toBe(false);
    });
  });

  describe('HMAC-SHA256 compute & verify', () => {
    it('debe calcular y verificar correctamente la firma de un mensaje', () => {
      const payload = JSON.stringify({ pocketId: 'p-1', amount: 50 });
      const signature = computeHmacSha256(payload, secret);

      expect(typeof signature).toBe('string');
      expect(signature.length).toBe(64); // 256 bits en hexadecimal

      const isValid = verifyHmacSha256(payload, secret, signature);
      expect(isValid).toBe(true);
    });

    it('debe rechazar una firma si el payload fue alterado (tampering)', () => {
      const originalPayload = JSON.stringify({ pocketId: 'p-1', amount: 50 });
      const tamperedPayload = JSON.stringify({ pocketId: 'p-1', amount: 5000 });
      const signature = computeHmacSha256(originalPayload, secret);

      const isValid = verifyHmacSha256(tamperedPayload, secret, signature);
      expect(isValid).toBe(false);
    });

    it('debe rechazar una firma si el secret no coincide', () => {
      const payload = JSON.stringify({ pocketId: 'p-1', amount: 50 });
      const signature = computeHmacSha256(payload, secret);

      const isValid = verifyHmacSha256(payload, 'wrong-secret', signature);
      expect(isValid).toBe(false);
    });

    it('debe rechazar firmas malformadas o vacías', () => {
      expect(verifyHmacSha256('test', secret, '')).toBe(false);
      expect(verifyHmacSha256('test', secret, 'invalid-hex')).toBe(false);
      expect(verifyHmacSha256('test', secret, null as unknown as string)).toBe(false);
    });
  });

  describe('validateTimestamp (anti-replay)', () => {
    it('debe aceptar timestamps dentro de la ventana de tolerancia', () => {
      const now = Date.now();
      expect(validateTimestamp(now)).toBe(true);
      expect(validateTimestamp(now - 10000)).toBe(true); // 10s en el pasado
      expect(validateTimestamp(now + 5000)).toBe(true);  // 5s en el futuro
    });

    it('debe rechazar timestamps desfasados más allá del límite (30s por defecto)', () => {
      const now = Date.now();
      expect(validateTimestamp(now - 35000)).toBe(false); // 35s en el pasado
      expect(validateTimestamp(now + 35000)).toBe(false); // 35s en el futuro
    });
  });
});
