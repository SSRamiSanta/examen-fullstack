import http from 'http';
import { InMemoryPocketRepository } from './persistence/in-memory-pocket.repository';
import { WebSocketEventPublisher } from './realtime/websocket.event-publisher';
import {
  GetPocketsUseCase,
  CreatePocketUseCase,
  DepositFundsUseCase,
} from '../application';
import { createExpressApp } from './http/app';

export function bootstrapServer(port: number = Number(process.env.PORT) || 3000, host: string = '127.0.0.1') {
  const repository = new InMemoryPocketRepository();
  const eventPublisher = new WebSocketEventPublisher();

  const getPocketsUseCase = new GetPocketsUseCase(repository);
  const createPocketUseCase = new CreatePocketUseCase(repository);
  const depositFundsUseCase = new DepositFundsUseCase(repository, eventPublisher);

  const app = createExpressApp({
    getPocketsUseCase,
    createPocketUseCase,
    depositFundsUseCase,
  });

  const server = http.createServer(app);
  eventPublisher.attachServer(server);

  return {
    server,
    repository,
    eventPublisher,
    start: () =>
      new Promise<void>((resolve) => {
        server.listen(port, host, () => {
          console.info(`[Backend Infra] HTTP API & WS Server running on http://${host}:${port}`);
          resolve();
        });
      }),
  };
}

if (require.main === module) {
  const { start } = bootstrapServer();
  start();
}
