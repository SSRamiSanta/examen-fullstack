import http from 'http';
import { randomUUID } from 'node:crypto';
import WebSocket, { Server as WebSocketServer } from 'ws';
import {
  PocketUpdatedEvent,
  GoalReachedDomainEvent,
  SecureEnvelope,
} from '@examen-fullstack/shared';
import { computeHmacSha256 } from '../../domain';
import { IEventPublisher } from '../../ports';

export interface WebSocketPublisherOptions {
  secret?: string;
  useSecureEnvelope?: boolean;
  heartbeatIntervalMs?: number;
}

interface MonitoredWebSocket extends WebSocket {
  isAlive?: boolean;
}

export class WebSocketEventPublisher implements IEventPublisher {
  private wss: WebSocketServer | null = null;
  private readonly clients: Set<MonitoredWebSocket> = new Set();
  private readonly secret: string;
  private readonly useSecureEnvelope: boolean;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(options: WebSocketPublisherOptions = {}) {
    this.secret = options.secret || process.env.SIGNATURE_SECRET || 'examen-fullstack-secret-key-2026';
    this.useSecureEnvelope = options.useSecureEnvelope ?? (process.env.REQUIRE_SIGNATURE === 'true');
  }

  public attachServer(server: http.Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: MonitoredWebSocket) => {
      ws.isAlive = true;
      this.clients.add(ws);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });
    });

    // Heartbeat cada 30s para podar conexiones muertas (Disponibilidad)
    this.heartbeatTimer = setInterval(() => {
      for (const ws of this.clients) {
        if (!ws.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
        } else {
          ws.isAlive = false;
          ws.ping();
        }
      }
    }, 30000);
    this.heartbeatTimer.unref();
  }


  public async publishPocketUpdated(event: PocketUpdatedEvent): Promise<void> {
    let payloadToSend: string;

    if (this.useSecureEnvelope) {
      const timestamp = Date.now();
      const nonce = randomUUID();
      const serializedPayload = JSON.stringify(event);
      const messageToSign = `${timestamp}.${nonce}.${serializedPayload}`;
      const signature = computeHmacSha256(messageToSign, this.secret);

      const envelope: SecureEnvelope<PocketUpdatedEvent> = {
        payload: event,
        timestamp,
        nonce,
        signature,
      };
      payloadToSend = JSON.stringify(envelope);
    } else {
      payloadToSend = JSON.stringify(event);
    }

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payloadToSend);
      }
    }
  }

  public async publishGoalReached(event: GoalReachedDomainEvent): Promise<void> {
    console.info(`[GoalReachedDomainEvent] Meta alcanzada para el bolsillo ${event.pocketId}: ${event.currentAmount}/${event.targetAmount}`);
  }

  public close(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

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
