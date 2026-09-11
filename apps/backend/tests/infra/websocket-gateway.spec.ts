import http from 'http';
import WebSocket from 'ws';
import { WebSocketEventPublisher } from '../../src/infra/realtime/websocket.event-publisher';
import { PocketUpdatedEvent } from '@examen-fullstack/shared';

describe('WebSocketEventPublisher (Realtime Infra Adapter)', () => {
  let server: http.Server;
  let publisher: WebSocketEventPublisher;
  let clientSocket: WebSocket;
  const port = 8089;

  beforeEach((done) => {
    server = http.createServer();
    publisher = new WebSocketEventPublisher();
    publisher.attachServer(server);

    server.listen(port, '127.0.0.1', () => {
      clientSocket = new WebSocket(`ws://127.0.0.1:${port}`);
      clientSocket.on('open', () => done());
    });
  });

  afterEach((done) => {
    if (clientSocket.readyState === WebSocket.OPEN) {
      clientSocket.close();
    }
    server.close(() => done());
  });

  it('debe transmitir el evento POCKET_UPDATED a los clientes conectados', (done) => {
    const eventPayload: PocketUpdatedEvent = {
      event: 'POCKET_UPDATED',
      pocketId: 'pocket-ws-1',
      targetAmount: 5000.0,
      currentAmount: 2500.0,
      progress: 50.0,
      isCompleted: false,
      goalAchieved: false,
      timestamp: new Date().toISOString(),
    };

    clientSocket.on('message', (data: WebSocket.RawData) => {
      const parsed = JSON.parse(data.toString());
      expect(parsed).toEqual(eventPayload);
      done();
    });

    publisher.publishPocketUpdated(eventPayload);
  });
});
