/**
 * Contratos de eventos WebSocket y de Dominio según spec.md
 */

export interface PocketUpdatedEvent {
  event: 'POCKET_UPDATED';
  pocketId: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  isCompleted: boolean;
  goalAchieved: boolean;
  timestamp: string;
}

export interface GoalReachedDomainEvent {
  pocketId: string;
  targetAmount: number;
  currentAmount: number;
  reachedAt: string;
}

export interface SecureEnvelope<T> {
  payload: T;
  timestamp: number;
  nonce: string;
  signature: string;
}

export type WebSocketEvent = PocketUpdatedEvent | SecureEnvelope<PocketUpdatedEvent>;

