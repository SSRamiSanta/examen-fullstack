import Database from 'better-sqlite3';
import { PocketEntity, DepositEntity } from '../../src/domain';
import { SqlitePocketRepository, createSqliteDatabase } from '../../src/infra/persistence';

describe('SqlitePocketRepository (Infra SQLite Persistence Adapter)', () => {
  let db: Database.Database;
  let repository: SqlitePocketRepository;

  beforeEach(() => {
    db = createSqliteDatabase(':memory:');
    repository = new SqlitePocketRepository(db);
  });

  afterEach(() => {
    repository.close();
  });

  it('debe guardar y recuperar un bolsillo por su ID desde SQLite', async () => {
    const pocket = PocketEntity.create({
      id: 'pocket-sqlite-1',
      name: 'Viaje a Japón',
      targetAmount: 8000.0,
    });

    await repository.save(pocket);

    const found = await repository.findById('pocket-sqlite-1');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('pocket-sqlite-1');
    expect(found?.name).toBe('Viaje a Japón');
    expect(found?.targetAmount).toBe(8000.0);
    expect(found?.currentAmount).toBe(0);
    expect(found?.progress).toBe(0);
    expect(found?.isCompleted).toBe(false);
  });

  it('debe retornar null si el bolsillo no existe en la base de datos', async () => {
    const found = await repository.findById('inexistente');
    expect(found).toBeNull();
  });

  it('debe listar todos los bolsillos almacenados en orden cronológico', async () => {
    const pocket1 = PocketEntity.create({
      id: 'pocket-1',
      name: 'Meta 1',
      targetAmount: 1000.0,
    });
    const pocket2 = PocketEntity.create({
      id: 'pocket-2',
      name: 'Meta 2',
      targetAmount: 2000.0,
    });

    await repository.save(pocket1);
    await repository.save(pocket2);

    const all = await repository.findAll();
    expect(all).toHaveLength(2);
    expect(all[0].id).toBe('pocket-1');
    expect(all[1].id).toBe('pocket-2');
  });

  it('debe actualizar el estado y balance de un bolsillo en SQLite', async () => {
    const pocket = PocketEntity.create({
      id: 'pocket-upd',
      name: 'Meta Ahorro',
      targetAmount: 1000.0,
    });
    await repository.save(pocket);

    pocket.deposit(500.0);
    await repository.update(pocket);

    const updated = await repository.findById('pocket-upd');
    expect(updated?.currentAmount).toBe(500.0);
    expect(updated?.progress).toBe(50.0);
    expect(updated?.isCompleted).toBe(false);
  });

  it('debe registrar y consultar depósitos con clave foránea hacia bolsillos', async () => {
    const pocket = PocketEntity.create({
      id: 'pocket-dep',
      name: 'Bolsillo con Abonos',
      targetAmount: 2000.0,
    });
    await repository.save(pocket);

    const deposit1 = DepositEntity.create({
      id: 'deposit-1',
      pocketId: 'pocket-dep',
      amount: 300.0,
    });
    const deposit2 = DepositEntity.create({
      id: 'deposit-2',
      pocketId: 'pocket-dep',
      amount: 700.0,
    });

    await repository.saveDeposit(deposit1);
    await repository.saveDeposit(deposit2);

    const deposits = await repository.findDepositsByPocketId('pocket-dep');
    expect(deposits).toHaveLength(2);
    expect(deposits[0].id).toBe('deposit-1');
    expect(deposits[0].amount).toBe(300.0);
    expect(deposits[1].id).toBe('deposit-2');
    expect(deposits[1].amount).toBe(700.0);
  });

  it('debe rechazar abonos si el bolsillo referenciado no existe (Foreign Key Constraint)', async () => {
    const deposit = DepositEntity.create({
      id: 'deposit-orphan',
      pocketId: 'pocket-does-not-exist',
      amount: 100.0,
    });

    await expect(repository.saveDeposit(deposit)).rejects.toThrow();
  });
});
