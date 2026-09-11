import { Request, Response, NextFunction } from 'express';
import {
  GetPocketsUseCase,
  CreatePocketUseCase,
  DepositFundsUseCase,
} from '../../../application';
import { InvalidAmountException, InvalidPocketNameException } from '@examen-fullstack/core';

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

      if (typeof name !== 'string' || name.trim().length < 3) {
        throw new InvalidPocketNameException('El nombre debe tener al menos 3 caracteres.');
      }

      const numTarget = Number(targetAmount);
      if (isNaN(numTarget) || numTarget <= 0) {
        throw new InvalidAmountException('La meta de ahorro (targetAmount) debe ser mayor a 0.');
      }

      const created = await this.createPocketUseCase.execute({
        name: name.trim(),
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
      const { id } = req.params;
      const { amount } = req.body ?? {};

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new InvalidAmountException('El monto a abonar debe ser mayor a 0.');
      }

      const rawId = req.params.id;
      const pocketId = Array.isArray(rawId) ? rawId[0] : rawId;

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
