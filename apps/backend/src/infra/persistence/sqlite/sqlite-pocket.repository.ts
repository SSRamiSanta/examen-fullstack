import Database from 'better-sqlite3';
import { PocketEntity, DepositEntity } from '../../../domain';
import { IPocketRepository } from '../../../ports';

interface PocketRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  progress: number;
  is_completed: number;
  created_at: string;
}

interface DepositRow {
  id: string;
  pocket_id: string;
  amount: number;
  created_at: string;
}

export class SqlitePocketRepository implements IPocketRepository {
  private readonly stmtFindById: Database.Statement<[string]>;
  private readonly stmtFindAll: Database.Statement<[]>;
  private readonly stmtInsertPocket: Database.Statement<[string, string, number, number, number, number, string]>;
  private readonly stmtUpdatePocket: Database.Statement<[string, number, number, number, number, string]>;
  private readonly stmtInsertDeposit: Database.Statement<[string, string, number, string]>;
  private readonly stmtFindDepositsByPocketId: Database.Statement<[string]>;

  constructor(private readonly db: Database.Database) {
    this.stmtFindById = this.db.prepare(
      'SELECT id, name, target_amount, current_amount, progress, is_completed, created_at FROM pockets WHERE id = ?'
    );
    this.stmtFindAll = this.db.prepare(
      'SELECT id, name, target_amount, current_amount, progress, is_completed, created_at FROM pockets ORDER BY created_at ASC'
    );
    this.stmtInsertPocket = this.db.prepare(
      'INSERT INTO pockets (id, name, target_amount, current_amount, progress, is_completed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    this.stmtUpdatePocket = this.db.prepare(
      'UPDATE pockets SET name = ?, target_amount = ?, current_amount = ?, progress = ?, is_completed = ? WHERE id = ?'
    );
    this.stmtInsertDeposit = this.db.prepare(
      'INSERT INTO deposits (id, pocket_id, amount, created_at) VALUES (?, ?, ?, ?)'
    );
    this.stmtFindDepositsByPocketId = this.db.prepare(
      'SELECT id, pocket_id, amount, created_at FROM deposits WHERE pocket_id = ? ORDER BY created_at ASC'
    );
  }

  public async findById(id: string): Promise<PocketEntity | null> {
    const row = this.stmtFindById.get(id) as PocketRow | undefined;
    if (!row) {
      return null;
    }

    return this.mapRowToEntity(row);
  }

  public async findAll(): Promise<PocketEntity[]> {
    const rows = this.stmtFindAll.all() as PocketRow[];
    return rows.map((row) => this.mapRowToEntity(row));
  }

  public async save(pocket: PocketEntity): Promise<void> {
    this.stmtInsertPocket.run(
      pocket.id,
      pocket.name,
      pocket.targetAmount,
      pocket.currentAmount,
      pocket.progress,
      pocket.isCompleted ? 1 : 0,
      pocket.createdAt
    );
  }

  public async update(pocket: PocketEntity): Promise<void> {
    this.stmtUpdatePocket.run(
      pocket.name,
      pocket.targetAmount,
      pocket.currentAmount,
      pocket.progress,
      pocket.isCompleted ? 1 : 0,
      pocket.id
    );
  }

  public async saveDeposit(deposit: DepositEntity): Promise<void> {
    this.stmtInsertDeposit.run(
      deposit.id,
      deposit.pocketId,
      deposit.amount,
      deposit.createdAt
    );
  }

  public async findDepositsByPocketId(pocketId: string): Promise<DepositEntity[]> {
    const rows = this.stmtFindDepositsByPocketId.all(pocketId) as DepositRow[];
    return rows.map((row) =>
      DepositEntity.create({
        id: row.id,
        pocketId: row.pocket_id,
        amount: row.amount,
        createdAt: row.created_at,
      })
    );
  }

  public close(): void {
    if (this.db.open) {
      this.db.close();
    }
  }

  private mapRowToEntity(row: PocketRow): PocketEntity {
    return PocketEntity.reconstitute({
      id: row.id,
      name: row.name,
      targetAmount: row.target_amount,
      currentAmount: row.current_amount,
      progress: row.progress,
      isCompleted: row.is_completed === 1,
      createdAt: row.created_at,
    });
  }
}
