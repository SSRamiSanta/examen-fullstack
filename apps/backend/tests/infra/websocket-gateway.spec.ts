import http from 'http';
import WebSocket from 'ws';
import { WebSocketEventPublisher } from '../../src/infra/realtime/websocket.event-publisher';
import { PocketUpdatedEvent } from '@examen-fullstack/shared';
import { verifyHmacSha256 } from '../../src/domain';

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

  it('debe transmitir el evento envuelto en SecureEnvelope con firma HMAC-SHA256 si está habilitado', async () => {
    const secret = 'ws-test-secret';
    const securePort = 8090;
    const secureServer = http.createServer();
    const securePublisher = new WebSocketEventPublisher({
      secret,
      useSecureEnvelope: true,
    });
    securePublisher.attachServer(secureServer);

    await new Promise<void>((resolve) => {
      secureServer.listen(securePort, '127.0.0.1', () => resolve());
    });

    const secureClient = new WebSocket(`ws://127.0.0.1:${securePort}`);
    await new Promise<void>((resolve) => {
      secureClient.on('open', () => resolve());
    });

    const eventPayload: PocketUpdatedEvent = {
      event: 'POCKET_UPDATED',
      pocketId: 'pocket-ws-secure',
      targetAmount: 1000.0,
      currentAmount: 500.0,
      progress: 50.0,
      isCompleted: false,
      goalAchieved: false,
      timestamp: new Date().toISOString(),
    };

    const messagePromise = new Promise<void>((resolve) => {
      secureClient.on('message', (data: WebSocket.RawData) => {
        const parsed = JSON.parse(data.toString());
        expect(parsed).toHaveProperty('payload');
        expect(parsed).toHaveProperty('signature');
        expect(parsed).toHaveProperty('timestamp');
        expect(parsed).toHaveProperty('nonce');
        expect(parsed.payload).toEqual(eventPayload);

        const reconstructed = `${parsed.timestamp}.${parsed.nonce}.${JSON.stringify(parsed.payload)}`;
        const valid = verifyHmacSha256(reconstructed, secret, parsed.signature);
        expect(valid).toBe(true);

        resolve();
      });
    });

    await securePublisher.publishPocketUpdated(eventPayload);
    await messagePromise;

    secureClient.close();
    await securePublisher.close();
    await new Promise<void>((resolve) => secureServer.close(() => resolve()));
  });
});


