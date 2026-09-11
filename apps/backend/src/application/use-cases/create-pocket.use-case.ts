import { randomUUID } from 'node:crypto';
import { Pocket, CreatePocketDTO } from '@examen-fullstack/shared';
import { PocketEntity } from '@examen-fullstack/core';
import { IPocketRepository } from '../../ports';

export class CreatePocketUseCase {
  constructor(
    private readonly pocketRepo: IPocketRepository,
    private readonly idGenerator: () => string = () => randomUUID()
  ) {}

  public async execute(dto: CreatePocketDTO): Promise<Pocket> {
    const pocket = PocketEntity.create({
      id: this.idGenerator(),
      name: dto.name,
      targetAmount: dto.targetAmount,
    });

    await this.pocketRepo.save(pocket);

    return pocket.toDTO();
  }
}
