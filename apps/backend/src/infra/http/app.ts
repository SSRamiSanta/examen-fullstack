import express, { Express } from 'express';
import cors from 'cors';
import {
  GetPocketsUseCase,
  CreatePocketUseCase,
  DepositFundsUseCase,
} from '../../application';
import { PocketController } from './controllers/pocket.controller';
import { createPocketRouter } from './routes/pocket.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export interface AppDependencies {
  getPocketsUseCase: GetPocketsUseCase;
  createPocketUseCase: CreatePocketUseCase;
  depositFundsUseCase: DepositFundsUseCase;
}

export function createExpressApp(deps: AppDependencies): Express {
  const app = express();

  // Middlewares estándar de seguridad y parseo
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Controlador y rutas de bolsillo
  const pocketController = new PocketController(
    deps.getPocketsUseCase,
    deps.createPocketUseCase,
    deps.depositFundsUseCase
  );

  app.use('/api/pockets', createPocketRouter(pocketController));

  // Middleware de traducción y sanitización de errores
  app.use(errorMiddleware);

  return app;
}
