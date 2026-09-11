import {
  Pocket,
  CreatePocketDTO,
  CreateDepositDTO,
  ApiErrorResponse,
} from '@examen-fullstack/shared';
import { cryptoService } from './crypto.service';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://127.0.0.1:3000/api'
  : '/api';

export class ApiService {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  public async getPockets(): Promise<Pocket[]> {
    const response = await fetch(`${this.baseUrl}/pockets`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        error: 'HTTP_ERROR',
        message: 'Error al consultar bolsillos',
      }));
      throw new Error(errorData.message);
    }

    return response.json();
  }

  public async createPocket(dto: CreatePocketDTO): Promise<Pocket> {
    const signatureHeaders = await cryptoService.createSignatureHeaders(dto);

    const response = await fetch(`${this.baseUrl}/pockets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...signatureHeaders,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        error: 'HTTP_ERROR',
        message: 'Error al crear el bolsillo',
      }));
      throw new Error(errorData.message);
    }

    return response.json();
  }

  public async depositFunds(
    pocketId: string,
    amount: number,
    idempotencyKey?: string
  ): Promise<Pocket> {
    const key = idempotencyKey ?? (
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random()}`
    );

    const payload: CreateDepositDTO = { amount };
    const signatureHeaders = await cryptoService.createSignatureHeaders(payload);

    const response = await fetch(`${this.baseUrl}/pockets/${pocketId}/deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Idempotency-Key': key,
        ...signatureHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        error: 'HTTP_ERROR',
        message: 'Error al procesar el abono',
      }));
      throw new Error(errorData.message);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
