import http from 'http';
import path from 'path';
import { SqlitePocketRepository, createSqliteDatabase } from './persistence';
import { WebSocketEventPublisher } from './realtime/websocket.event-publisher';
import {
  GetPocketsUseCase,
  CreatePocketUseCase,
  DepositFundsUseCase,
} from '../application';
import { createExpressApp } from './http/app';

export function bootstrapServer(
  port: number = Number(process.env.PORT) || 3000,
  host: string = '127.0.0.1',
  dbPath: string = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'pockets.db')
) {
  const db = createSqliteDatabase(dbPath);
  const repository = new SqlitePocketRepository(db);
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
          console.info(`[Backend Infra] HTTP API & WS Server running on http://${host}:${port} (SQLite: ${dbPath})`);
          resolve();
        });
      }),
  };
}

if (require.main === module) {
  const { start } = bootstrapServer();
  start();
}
