export class CryptoService {
  constructor(
    private readonly secret: string = 'examen-fullstack-secret-key-2026'
  ) {}

  public async computeSignature(message: string): Promise<string> {
    const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis.crypto as Crypto | undefined);

    if (cryptoObj && cryptoObj.subtle) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(this.secret);
      const key = await cryptoObj.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign']
      );
      const signatureBuffer = await cryptoObj.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
      );
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    return '';
  }

  public async createSignatureHeaders(body: unknown): Promise<Record<string, string>> {
    const timestamp = Date.now();
    const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis.crypto as Crypto | undefined);
    const nonce = cryptoObj && typeof cryptoObj.randomUUID === 'function'
      ? cryptoObj.randomUUID()
      : `nonce-${Date.now()}-${Math.random()}`;

    const bodyStr = body && Object.keys(body).length > 0 ? JSON.stringify(body) : '';
    const message = `${timestamp}.${nonce}.${bodyStr}`;
    const signature = await this.computeSignature(message);

    return {
      'X-Signature': signature,
      'X-Timestamp': String(timestamp),
      'X-Nonce': nonce,
    };
  }
}

export const cryptoService = new CryptoService();
