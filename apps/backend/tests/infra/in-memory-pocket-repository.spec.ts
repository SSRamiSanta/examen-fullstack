import { PocketEntity, DepositEntity } from '@examen-fullstack/core';
import { InMemoryPocketRepository } from '../../src/infra/persistence/in-memory-pocket.repository';

describe('InMemoryPocketRepository (Infra Persistence Adapter)', () => {
  let repository: InMemoryPocketRepository;

  beforeEach(() => {
    repository = new InMemoryPocketRepository();
  });

  it('debe guardar y recuperar un bolsillo por su ID', async () => {
    const pocket = PocketEntity.create({
      id: 'pocket-1',
      name: 'Viaje a Japón',
      targetAmount: 8000.0,
    });

    await repository.save(pocket);

    const found = await repository.findById('pocket-1');
    expect(found).not.toBeNull();
    expect(found?.id).toBe('pocket-1');
    expect(found?.name).toBe('Viaje a Japón');
    expect(found?.targetAmount).toBe(8000.0);
  });

  it('debe retornar null si el bolsillo no existe', async () => {
    const found = await repository.findById('inexistente');
    expect(found).toBeNull();
  });

  it('debe listar todos los bolsillos almacenados', async () => {
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
  });

  it('debe actualizar el estado de un bolsillo', async () => {
    const pocket = PocketEntity.create({
      id: 'pocket-1',
      name: 'Meta 1',
      targetAmount: 1000.0,
    });
    await repository.save(pocket);

    pocket.deposit(500.0);
    await repository.update(pocket);

    const updated = await repository.findById('pocket-1');
    expect(updated?.currentAmount).toBe(500.0);
    expect(updated?.progress).toBe(50.0);
  });

  it('debe registrar depósitos asociados a bolsillos', async () => {
    const deposit = DepositEntity.create({
      id: 'deposit-1',
      pocketId: 'pocket-1',
      amount: 250.0,
    });

    await repository.saveDeposit(deposit);

    const deposits = await repository.findDepositsByPocketId('pocket-1');
    expect(deposits).toHaveLength(1);
    expect(deposits[0].amount).toBe(250.0);
  });
});
