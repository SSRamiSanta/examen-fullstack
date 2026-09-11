import {
  PocketEntity,
  PocketNotFoundException,
  InvalidAmountException,
  PocketCompletedException,
  PocketGoalExceededException,
} from '../../src/domain';
import { IPocketRepository, IEventPublisher } from '../../src/ports';
import { DepositFundsUseCase } from '../../src/application/use-cases/deposit-funds.use-case';

describe('DepositFundsUseCase (Application Use Case - Backend)', () => {
  let pocketRepoMock: jest.Mocked<IPocketRepository>;
  let eventPublisherMock: jest.Mocked<IEventPublisher>;
  let useCase: DepositFundsUseCase;

  const mockPocketId = 'b3e2a1c0-4d5e-6f7a-8b9c-0d1e2f3a4b5c';
  const mockDepositId = 'd1e2f3a4-5b6c-7d8e-9f0a-1b2c3d4e5f6a';

  const getMockPocket = (currentAmount: number = 2500, targetAmount: number = 5000) => {
    return PocketEntity.create({
      id: mockPocketId,
      name: 'Viaje a Europa',
      targetAmount,
      currentAmount,
    });
  };

  beforeEach(() => {
    pocketRepoMock = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      saveDeposit: jest.fn(),
    };

    eventPublisherMock = {
      publishPocketUpdated: jest.fn(),
      publishGoalReached: jest.fn(),
    };

    useCase = new DepositFundsUseCase(
      pocketRepoMock,
      eventPublisherMock,
      () => mockDepositId
    );
  });

  describe('Abono parcial exitoso', () => {
    it('debe registrar el depósito, actualizar el bolsillo y emitir evento POCKET_UPDATED sin meta alcanzada', async () => {
      const pocket = getMockPocket(2500, 5000);
      pocketRepoMock.findById.mockResolvedValue(pocket);

      const result = await useCase.execute({
        pocketId: mockPocketId,
        amount: 250.0,
      });

      // Verificación de estado retornado
      expect(result.currentAmount).toBe(2750.0);
      expect(result.progress).toBe(55.0);
      expect(result.isCompleted).toBe(false);

      // Verificación de persistencia
      expect(pocketRepoMock.findById).toHaveBeenCalledWith(mockPocketId);
      expect(pocketRepoMock.saveDeposit).toHaveBeenCalledTimes(1);
      expect(pocketRepoMock.saveDeposit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockDepositId,
          pocketId: mockPocketId,
          amount: 250.0,
        })
      );
      expect(pocketRepoMock.update).toHaveBeenCalledWith(pocket);

      // Verificación de eventos
      expect(eventPublisherMock.publishPocketUpdated).toHaveBeenCalledTimes(1);
      expect(eventPublisherMock.publishPocketUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'POCKET_UPDATED',
          pocketId: mockPocketId,
          targetAmount: 5000.0,
          currentAmount: 2750.0,
          progress: 55.0,
          isCompleted: false,
          goalAchieved: false,
        })
      );
      expect(eventPublisherMock.publishGoalReached).not.toHaveBeenCalled();
    });
  });

  describe('Abono que completa el 100% de la meta', () => {
    it('debe marcar el bolsillo completado y emitir tanto POCKET_UPDATED como GoalReachedDomainEvent', async () => {
      const pocket = getMockPocket(4750, 5000);
      pocketRepoMock.findById.mockResolvedValue(pocket);

      const result = await useCase.execute({
        pocketId: mockPocketId,
        amount: 250.0,
      });

      expect(result.currentAmount).toBe(5000.0);
      expect(result.progress).toBe(100.0);
      expect(result.isCompleted).toBe(true);

      // Evento WebSocket POCKET_UPDATED con goalAchieved: true
      expect(eventPublisherMock.publishPocketUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'POCKET_UPDATED',
          pocketId: mockPocketId,
          targetAmount: 5000.0,
          currentAmount: 5000.0,
          progress: 100.0,
          isCompleted: true,
          goalAchieved: true,
        })
      );

      // Evento de Dominio GoalReachedDomainEvent
      expect(eventPublisherMock.publishGoalReached).toHaveBeenCalledTimes(1);
      expect(eventPublisherMock.publishGoalReached).toHaveBeenCalledWith(
        expect.objectContaining({
          pocketId: mockPocketId,
          targetAmount: 5000.0,
          currentAmount: 5000.0,
        })
      );
    });
  });

  describe('Casos de error e invariantes', () => {
    it('debe lanzar PocketNotFoundException si el bolsillo no existe', async () => {
      pocketRepoMock.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ pocketId: 'inexistente', amount: 100 })
      ).rejects.toThrow(PocketNotFoundException);

      expect(pocketRepoMock.saveDeposit).not.toHaveBeenCalled();
      expect(pocketRepoMock.update).not.toHaveBeenCalled();
      expect(eventPublisherMock.publishPocketUpdated).not.toHaveBeenCalled();
    });

    it('debe lanzar InvalidAmountException si el monto es <= 0', async () => {
      const pocket = getMockPocket(1000, 5000);
      pocketRepoMock.findById.mockResolvedValue(pocket);

      await expect(
        useCase.execute({ pocketId: mockPocketId, amount: 0 })
      ).rejects.toThrow(InvalidAmountException);

      await expect(
        useCase.execute({ pocketId: mockPocketId, amount: -10 })
      ).rejects.toThrow(InvalidAmountException);

      expect(pocketRepoMock.saveDeposit).not.toHaveBeenCalled();
    });

    it('debe lanzar PocketCompletedException si el bolsillo ya está completado', async () => {
      const pocket = getMockPocket(5000, 5000);
      pocketRepoMock.findById.mockResolvedValue(pocket);

      await expect(
        useCase.execute({ pocketId: mockPocketId, amount: 100 })
      ).rejects.toThrow(PocketCompletedException);

      expect(pocketRepoMock.saveDeposit).not.toHaveBeenCalled();
    });

    it('debe lanzar PocketGoalExceededException si el monto excede el targetAmount', async () => {
      const pocket = getMockPocket(4900, 5000);
      pocketRepoMock.findById.mockResolvedValue(pocket);

      await expect(
        useCase.execute({ pocketId: mockPocketId, amount: 200 })
      ).rejects.toThrow(PocketGoalExceededException);

      expect(pocketRepoMock.saveDeposit).not.toHaveBeenCalled();
      expect(pocketRepoMock.update).not.toHaveBeenCalled();
      expect(eventPublisherMock.publishPocketUpdated).not.toHaveBeenCalled();
    });
  });
});
