import { Router } from 'express';
import { PocketController } from '../controllers/pocket.controller';
import { createIdempotencyMiddleware } from '../middlewares/idempotency.middleware';

export function createPocketRouter(controller: PocketController): Router {
  const router = Router();
  const idempotencyMiddleware = createIdempotencyMiddleware();

  router.get('/', controller.getPockets);
  router.post('/', controller.createPocket);
  router.post('/:id/deposits', idempotencyMiddleware, controller.depositFunds);

  return router;
}
