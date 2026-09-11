import { PocketEntity, DepositEntity } from '../domain';

/**
 * Puerto de salida para persistencia en apps/backend.
 * Desacoplado de implementaciones concretas (SQLite, In-Memory).
 */
export interface IPocketRepository {
  findById(id: string): Promise<PocketEntity | null>;
  findAll(): Promise<PocketEntity[]>;
  save(pocket: PocketEntity): Promise<void>;
  update(pocket: PocketEntity): Promise<void>;
  saveDeposit(deposit: DepositEntity): Promise<void>;
}
