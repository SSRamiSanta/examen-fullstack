/**
 * Data Transfer Objects (DTOs) y respuestas de la API REST según spec.md
 */

export interface CreatePocketDTO {
  name: string; // Min 3 caracteres
  targetAmount: number; // > 0
}

export interface CreateDepositDTO {
  amount: number; // > 0
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'LIMIT_EXCEEDED'
  | 'NOT_FOUND'
  | 'MISSING_IDEMPOTENCY_KEY'
  | 'INTERNAL_ERROR';

export interface ApiErrorResponse {
  error: ApiErrorCode | string;
  message: string;
}

export const HTTP_HEADERS = {
  IDEMPOTENCY_KEY: 'x-idempotency-key',
} as const;
