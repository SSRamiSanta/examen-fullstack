import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sanitiza cadenas de texto para evitar inyecciones HTML/XSS y caracteres de control no imprimibles.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    // Eliminar etiquetas HTML
    .replace(/<[^>]*>?/gm, '')
    // Eliminar caracteres de control invisibles (excepto espacios comunes)
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '')
    .trim();
}

/**
 * Valida que un valor sea un número estrictamente finito y mayor a cero.
 * Rechaza NaN, Infinity, strings numéricas no convertidas, negativos y cero.
 */
export function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * Calcula la firma HMAC-SHA256 de una cadena de texto dado un secreto.
 */
export function computeHmacSha256(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data, 'utf8').digest('hex');
}

/**
 * Verifica una firma HMAC-SHA256 en tiempo constante (timing-safe) para mitigar ataques de temporización.
 */
export function verifyHmacSha256(data: string, secret: string, signature: string): boolean {
  if (!signature || typeof signature !== 'string') {
    return false;
  }

  const expectedSignature = computeHmacSha256(data, secret);
  if (expectedSignature.length !== signature.length) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Valida si un timestamp se encuentra dentro de la ventana de tolerancia (anti-replay).
 * @param timestamp Milisegundos epoch UTC
 * @param maxDriftMs Ventana de tolerancia en ms (por defecto 30 segundos)
 */
export function validateTimestamp(timestamp: number, maxDriftMs: number = 30000): boolean {
  if (!timestamp || typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    return false;
  }
  const now = Date.now();
  return Math.abs(now - timestamp) <= maxDriftMs;
}
