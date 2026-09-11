import http from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import {
  PocketUpdatedEvent,
  GoalReachedDomainEvent,
} from '@examen-fullstack/shared';
import { IEventPublisher } from '../../ports';

export class WebSocketEventPublisher implements IEventPublisher {
  private wss: WebSocketServer | null = null;
  private readonly clients: Set<WebSocket> = new Set();

  public attachServer(server: http.Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });
    });
  }

  public async publishPocketUpdated(event: PocketUpdatedEvent): Promise<void> {
    const payload = JSON.stringify(event);

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public async publishGoalReached(event: GoalReachedDomainEvent): Promise<void> {
    // Evento de dominio interno: puede conectarse a otros listeners o auditorías
    console.info(`[GoalReachedDomainEvent] Meta alcanzada para el bolsillo ${event.pocketId}: ${event.currentAmount}/${event.targetAmount}`);
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.close();
        }
      }
      this.clients.clear();
      if (this.wss) {
        this.wss.close(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
