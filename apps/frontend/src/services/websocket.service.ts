import { PocketUpdatedEvent } from '@examen-fullstack/shared';

type EventListener = (event: PocketUpdatedEvent) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly listeners: Set<EventListener> = new Set();
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isConnecting: boolean = false;

  constructor(private readonly url: string = 'ws://127.0.0.1:3000') {}

  public connect(): void {
    if (typeof window === 'undefined' || this.socket || this.isConnecting) {
      return;
    }

    try {
      this.isConnecting = true;
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as PocketUpdatedEvent;
          if (parsed && parsed.event === 'POCKET_UPDATED') {
            this.listeners.forEach((listener) => listener(parsed));
          }
        } catch {
          // Ignorar mensajes no conformes
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
        // Reintento de reconexión tras 3 segundos
        this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch {
      this.isConnecting = false;
    }
  }

  public subscribe(callback: EventListener): () => void {
    this.listeners.add(callback);
    this.connect();

    return () => {
      this.listeners.delete(callback);
    };
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const websocketService = new WebSocketService();
