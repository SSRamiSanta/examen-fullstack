import { randomUUID } from 'node:crypto';
import { Pocket } from '@examen-fullstack/shared';
import {
  DepositEntity,
  PocketNotFoundException,
  InvalidAmountException,
} from '@examen-fullstack/core';
import { IPocketRepository, IEventPublisher } from '../../ports';

export interface DepositFundsInput {
  pocketId: string;
  amount: number;
}

export class DepositFundsUseCase {
  constructor(
    private readonly pocketRepo: IPocketRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly idGenerator: () => string = () => randomUUID()
  ) {}

  public async execute(input: DepositFundsInput): Promise<Pocket> {
    if (input.amount <= 0) {
      throw new InvalidAmountException('El monto del abono debe ser estrictamente mayor a 0.');
    }

    const pocket = await this.pocketRepo.findById(input.pocketId);
    if (!pocket) {
      throw new PocketNotFoundException(input.pocketId);
    }

    const wasCompleted = pocket.isCompleted;

    // Ejecuta las invariantes del dominio (PocketGoalExceededException, PocketCompletedException, etc.)
    pocket.deposit(input.amount);

    const deposit = DepositEntity.create({
      id: this.idGenerator(),
      pocketId: pocket.id,
      amount: input.amount,
    });

    await this.pocketRepo.saveDeposit(deposit);
    await this.pocketRepo.update(pocket);

    const isNowCompleted = pocket.isCompleted;
    const goalAchieved = isNowCompleted && !wasCompleted;

    // Si alcanza el 100%: emitir internamente GoalReachedDomainEvent
    if (goalAchieved) {
      await this.eventPublisher.publishGoalReached({
        pocketId: pocket.id,
        targetAmount: pocket.targetAmount,
        currentAmount: pocket.currentAmount,
        reachedAt: new Date().toISOString(),
      });
    }

    // Publicar actualización reactiva vía WebSocket
    await this.eventPublisher.publishPocketUpdated({
      event: 'POCKET_UPDATED',
      pocketId: pocket.id,
      targetAmount: pocket.targetAmount,
      currentAmount: pocket.currentAmount,
      progress: pocket.progress,
      isCompleted: pocket.isCompleted,
      goalAchieved: pocket.isCompleted,
      timestamp: new Date().toISOString(),
    });

    return pocket.toDTO();
  }
}
