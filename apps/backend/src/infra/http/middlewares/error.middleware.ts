import { Request, Response, NextFunction } from 'express';
import {
  DomainException,
  InvalidPocketNameException,
  InvalidAmountException,
  PocketNotFoundException,
  PocketGoalExceededException,
  PocketCompletedException,
} from '../../../domain';
import { ApiErrorResponse } from '@examen-fullstack/shared';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof PocketNotFoundException) {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: err.message,
    });
    return;
  }

  if (
    err instanceof PocketGoalExceededException ||
    err instanceof PocketCompletedException
  ) {
    res.status(400).json({
      error: 'LIMIT_EXCEEDED',
      message: err.message,
    });
    return;
  }

  if (
    err instanceof InvalidPocketNameException ||
    err instanceof InvalidAmountException ||
    err instanceof DomainException
  ) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message,
    });
    return;
  }

  // Error no controlado (evitar fuga de stack traces en producción)
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'Ha ocurrido un error interno en el servidor.',
  });
}
