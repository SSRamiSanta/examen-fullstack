import { IPocketRepository } from '../../src/ports';
import { CreatePocketUseCase } from '../../src/application/use-cases/create-pocket.use-case';
import {
  InvalidPocketNameException,
  InvalidAmountException,
} from '../../src/domain';

describe('CreatePocketUseCase (Application Use Case - Backend)', () => {
  let pocketRepoMock: jest.Mocked<IPocketRepository>;
  let useCase: CreatePocketUseCase;
  const mockGeneratedId = 'b3e2a1c0-4d5e-6f7a-8b9c-0d1e2f3a4b5c';

  beforeEach(() => {
    pocketRepoMock = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      saveDeposit: jest.fn(),
    };

    useCase = new CreatePocketUseCase(pocketRepoMock, () => mockGeneratedId);
  });

  it('debe crear y persistir un bolsillo con progreso 0 y no completado', async () => {
    const result = await useCase.execute({
      name: 'Viaje a Europa',
      targetAmount: 5000.0,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: mockGeneratedId,
        name: 'Viaje a Europa',
        targetAmount: 5000.0,
        currentAmount: 0,
        progress: 0,
        isCompleted: false,
      })
    );

    expect(pocketRepoMock.save).toHaveBeenCalledTimes(1);
    expect(pocketRepoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockGeneratedId,
        name: 'Viaje a Europa',
        targetAmount: 5000.0,
      })
    );
  });

  it('debe rechazar nombres inválidos (< 3 caracteres)', async () => {
    await expect(
      useCase.execute({ name: 'AB', targetAmount: 1000 })
    ).rejects.toThrow(InvalidPocketNameException);

    expect(pocketRepoMock.save).not.toHaveBeenCalled();
  });

  it('debe rechazar metas inválidas (<= 0)', async () => {
    await expect(
      useCase.execute({ name: 'Educación', targetAmount: 0 })
    ).rejects.toThrow(InvalidAmountException);

    expect(pocketRepoMock.save).not.toHaveBeenCalled();
  });
});
