import { Pocket } from '@examen-fullstack/shared';
import { IPocketRepository } from '../../ports';

export class GetPocketsUseCase {
  constructor(private readonly pocketRepo: IPocketRepository) {}

  public async execute(): Promise<Pocket[]> {
    const pockets = await this.pocketRepo.findAll();
    return pockets.map((pocket) => pocket.toDTO());
  }
}
