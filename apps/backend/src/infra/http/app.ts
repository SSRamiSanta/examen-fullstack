import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  GetPocketsUseCase,
  CreatePocketUseCase,
  DepositFundsUseCase,
} from '../../application';
import { PocketController } from './controllers/pocket.controller';
import { createPocketRouter } from './routes/pocket.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { createSignatureMiddleware } from './middlewares/signature.middleware';

export interface AppDependencies {
  getPocketsUseCase: GetPocketsUseCase;
  createPocketUseCase: CreatePocketUseCase;
  depositFundsUseCase: DepositFundsUseCase;
}

export interface AppOptions {
  requireSignature?: boolean;
  signatureSecret?: string;
}

export function createExpressApp(
  deps: AppDependencies,
  options: AppOptions = {}
): Express {
  const app = express();

  // Hardening: Ocultar fingerprinting de Express
  app.disable('x-powered-by');

  // Hardening: Cabeceras de seguridad básicas
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  // Middlewares estándar de seguridad y parseo con límite de carga estricto (10kb)
  app.use(cors());
  app.use(express.json({ limit: '10kb' }));

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Middleware criptográfico de firma HMAC-SHA256
  // Si requireSignature es true (o REQUIRE_SIGNATURE=true), exige la firma.
  // Si no, si viene X-Signature, valida obligatoriamente que sea correcta.
  const isRequired = options.requireSignature ?? (process.env.REQUIRE_SIGNATURE === 'true');
  const signatureMiddleware = createSignatureMiddleware({
    secret: options.signatureSecret,
    required: isRequired,
  });

  // Controlador y rutas de bolsillo
  const pocketController = new PocketController(
    deps.getPocketsUseCase,
    deps.createPocketUseCase,
    deps.depositFundsUseCase
  );

  app.use('/api/pockets', createPocketRouter(pocketController, { signatureMiddleware }));

  // Middleware de traducción y sanitización de errores
  app.use(errorMiddleware);

  return app;
}
