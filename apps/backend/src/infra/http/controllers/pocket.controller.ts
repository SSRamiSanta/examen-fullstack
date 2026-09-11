import { Request, Response, NextFunction } from 'express';
import {
  GetPocketsUseCase,
  CreatePocketUseCase,
  DepositFundsUseCase,
} from '../../../application';
import {
  InvalidAmountException,
  InvalidPocketNameException,
  sanitizeString,
  isPositiveFiniteNumber,
} from '@examen-fullstack/core';

export class PocketController {
  constructor(
    private readonly getPocketsUseCase: GetPocketsUseCase,
    private readonly createPocketUseCase: CreatePocketUseCase,
    private readonly depositFundsUseCase: DepositFundsUseCase
  ) {}

  public getPockets = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pockets = await this.getPocketsUseCase.execute();
      res.status(200).json(pockets);
    } catch (error) {
      next(error);
    }
  };

  public createPocket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, targetAmount } = req.body ?? {};

      const sanitizedName = sanitizeString(typeof name === 'string' ? name : '');
      if (sanitizedName.length < 3) {
        throw new InvalidPocketNameException(
          'El nombre del bolsillo debe contener al menos 3 caracteres válidos tras sanitización.'
        );
      }

      const numTarget = typeof targetAmount === 'number' ? targetAmount : Number(targetAmount);
      if (!isPositiveFiniteNumber(numTarget)) {
        throw new InvalidAmountException(
          'La meta de ahorro (targetAmount) debe ser un número finito estrictamente mayor a 0.'
        );
      }

      const created = await this.createPocketUseCase.execute({
        name: sanitizedName,
        targetAmount: numTarget,
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  public depositFunds = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rawId = req.params.id;
      const pocketId = sanitizeString(Array.isArray(rawId) ? rawId[0] : (rawId ?? ''));

      const { amount } = req.body ?? {};
      const numAmount = typeof amount === 'number' ? amount : Number(amount);

      if (!isPositiveFiniteNumber(numAmount)) {
        throw new InvalidAmountException(
          'El monto del abono debe ser un número finito estrictamente mayor a 0.'
        );
      }

      const updated = await this.depositFundsUseCase.execute({
        pocketId,
        amount: numAmount,
      });

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };
}
