import { PocketEntity, DepositEntity } from '@examen-fullstack/core';
import { IPocketRepository } from '../../ports';

export class InMemoryPocketRepository implements IPocketRepository {
  private readonly pockets: Map<string, PocketEntity> = new Map();
  private readonly deposits: DepositEntity[] = [];

  public async findById(id: string): Promise<PocketEntity | null> {
    const pocket = this.pockets.get(id);
    if (!pocket) return null;
    return pocket;
  }

  public async findAll(): Promise<PocketEntity[]> {
    return Array.from(this.pockets.values());
  }

  public async save(pocket: PocketEntity): Promise<void> {
    this.pockets.set(pocket.id, pocket);
  }

  public async update(pocket: PocketEntity): Promise<void> {
    this.pockets.set(pocket.id, pocket);
  }

  public async saveDeposit(deposit: DepositEntity): Promise<void> {
    this.deposits.push(deposit);
  }

  public async findDepositsByPocketId(pocketId: string): Promise<DepositEntity[]> {
    return this.deposits.filter((d) => d.pocketId === pocketId);
  }

  public clear(): void {
    this.pockets.clear();
    this.deposits.length = 0;
  }
}
