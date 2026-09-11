import { Router, RequestHandler } from 'express';
import { PocketController } from '../controllers/pocket.controller';
import { createIdempotencyMiddleware } from '../middlewares/idempotency.middleware';

export interface PocketRouterOptions {
  signatureMiddleware?: RequestHandler;
}

export function createPocketRouter(
  controller: PocketController,
  options: PocketRouterOptions = {}
): Router {
  const router = Router();
  const idempotencyMiddleware = createIdempotencyMiddleware();

  const middlewareList: RequestHandler[] = [];
  if (options.signatureMiddleware) {
    middlewareList.push(options.signatureMiddleware);
  }

  router.get('/', controller.getPockets);
  router.post('/', ...middlewareList, controller.createPocket);
  router.post(
    '/:id/deposits',
    idempotencyMiddleware,
    ...middlewareList,
    controller.depositFunds
  );

  return router;
}
