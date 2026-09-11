import {
  PocketUpdatedEvent,
  GoalReachedDomainEvent,
} from '@examen-fullstack/shared';

/**
 * Puerto de salida para publicación de eventos en apps/backend.
 * Desacoplado de la tecnología de transporte (WebSocket, SSE, EventBus).
 */
export interface IEventPublisher {
  publishPocketUpdated(event: PocketUpdatedEvent): Promise<void>;
  publishGoalReached(event: GoalReachedDomainEvent): Promise<void>;
}
