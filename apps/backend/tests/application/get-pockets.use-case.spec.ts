import { PocketEntity } from '@examen-fullstack/core';
import { IPocketRepository } from '../../src/ports';
import { GetPocketsUseCase } from '../../src/application/use-cases/get-pockets.use-case';

describe('GetPocketsUseCase (Application Use Case - Backend)', () => {
  let pocketRepoMock: jest.Mocked<IPocketRepository>;
  let useCase: GetPocketsUseCase;

  beforeEach(() => {
    pocketRepoMock = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      saveDeposit: jest.fn(),
    };

    useCase = new GetPocketsUseCase(pocketRepoMock);
  });

  it('debe listar todos los bolsillos convertidos a DTO', async () => {
    const pocket1 = PocketEntity.create({
      id: 'id-1',
      name: 'Viaje a Europa',
      targetAmount: 5000.0,
      currentAmount: 2500.0,
    });
    const pocket2 = PocketEntity.create({
      id: 'id-2',
      name: 'Fondo de Emergencia',
      targetAmount: 10000.0,
      currentAmount: 0,
    });

    pocketRepoMock.findAll.mockResolvedValue([pocket1, pocket2]);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Viaje a Europa');
    expect(result[0].progress).toBe(50.0);
    expect(result[1].name).toBe('Fondo de Emergencia');
    expect(result[1].progress).toBe(0);
    expect(pocketRepoMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('debe retornar un array vacío si no hay bolsillos creados', async () => {
    pocketRepoMock.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
