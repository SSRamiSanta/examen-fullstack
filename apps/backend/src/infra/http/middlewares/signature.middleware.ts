import { Request, Response, NextFunction } from 'express';
import { verifyHmacSha256, validateTimestamp } from '@examen-fullstack/core';

export const DEFAULT_SIGNATURE_SECRET =
  process.env.SIGNATURE_SECRET || 'examen-fullstack-secret-key-2026';

export interface SignatureMiddlewareOptions {
  secret?: string;
  required?: boolean;
  maxDriftMs?: number;
}

export function createSignatureMiddleware(options: SignatureMiddlewareOptions = {}) {
  const secret = options.secret || DEFAULT_SIGNATURE_SECRET;
  const required = options.required ?? true;
  const maxDriftMs = options.maxDriftMs ?? 30000; // 30 segundos de tolerancia anti-replay

  return (req: Request, res: Response, next: NextFunction): void => {
    const rawSignature = req.headers['x-signature'];
    const rawTimestamp = req.headers['x-timestamp'];
    const rawNonce = req.headers['x-nonce'];

    const signature = Array.isArray(rawSignature) ? rawSignature[0] : rawSignature;
    const timestampStr = Array.isArray(rawTimestamp) ? rawTimestamp[0] : rawTimestamp;
    const nonce = (Array.isArray(rawNonce) ? rawNonce[0] : rawNonce) || '';

    if (!signature || !timestampStr) {
      if (!required) {
        return next();
      }
      res.status(401).json({
        error: 'MISSING_SIGNATURE',
        message: 'Las cabeceras X-Signature y X-Timestamp son obligatorias para esta operación.',
      });
      return;
    }

    const timestamp = Number(timestampStr);
    if (isNaN(timestamp) || !validateTimestamp(timestamp, maxDriftMs)) {
      res.status(401).json({
        error: 'REPLAY_ATTACK_DETECTED',
        message: 'Timestamp fuera de la ventana de tolerancia (30s) o inválido.',
      });
      return;
    }

    // Normalizar payload para verificación
    const bodyStr = req.body && Object.keys(req.body).length > 0
      ? JSON.stringify(req.body)
      : '';
    const message = `${timestamp}.${nonce}.${bodyStr}`;

    const isValid = verifyHmacSha256(message, secret, signature);
    if (!isValid) {
      res.status(401).json({
        error: 'INVALID_SIGNATURE',
        message: 'Firma HMAC-SHA256 inválida o cuerpo adulterado en tránsito.',
      });
      return;
    }

    next();
  };
}
