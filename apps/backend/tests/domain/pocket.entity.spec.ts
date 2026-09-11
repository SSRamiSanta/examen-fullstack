import {
  PocketEntity,
  CreatePocketProps,
} from '../../src/domain/entities/pocket.entity';
import {
  DomainException,
  InvalidPocketNameException,
  InvalidAmountException,
  PocketCompletedException,
  PocketGoalExceededException,
} from '../../src/domain/errors';

describe('PocketEntity (Domain Entity)', () => {
  const validProps: CreatePocketProps = {
    id: 'b3e2a1c0-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
    name: 'Viaje a Europa',
    targetAmount: 5000.0,
  };

  describe('Creación de Pocket', () => {
    it('debe instanciar un Pocket válido con valores iniciales por defecto', () => {
      const pocket = PocketEntity.create(validProps);

      expect(pocket.id).toBe(validProps.id);
      expect(pocket.name).toBe('Viaje a Europa');
      expect(pocket.targetAmount).toBe(5000.0);
      expect(pocket.currentAmount).toBe(0);
      expect(pocket.progress).toBe(0);
      expect(pocket.isCompleted).toBe(false);
      expect(pocket.createdAt).toBeDefined();
      expect(new Date(pocket.createdAt).toISOString()).toBe(pocket.createdAt);
    });

    it('debe rechazar un nombre con menos de 3 caracteres', () => {
      expect(() =>
        PocketEntity.create({ ...validProps, name: 'AB' })
      ).toThrow(InvalidPocketNameException);

      expect(() =>
        PocketEntity.create({ ...validProps, name: '   ' })
      ).toThrow(InvalidPocketNameException);
    });

    it('debe rechazar una meta (targetAmount) menor o igual a 0', () => {
      expect(() =>
        PocketEntity.create({ ...validProps, targetAmount: 0 })
      ).toThrow(InvalidAmountException);

      expect(() =>
        PocketEntity.create({ ...validProps, targetAmount: -100 })
      ).toThrow(InvalidAmountException);
    });

    it('todas las excepciones de dominio deben heredar de DomainException', () => {
      expect(new InvalidPocketNameException('test')).toBeInstanceOf(DomainException);
      expect(new InvalidAmountException('test')).toBeInstanceOf(DomainException);
      expect(new PocketCompletedException('test')).toBeInstanceOf(DomainException);
      expect(new PocketGoalExceededException('test')).toBeInstanceOf(DomainException);
    });
  });

  describe('Invariantes y Reglas de Abono (deposit)', () => {
    it('debe aplicar un abono válido incrementando el monto y calculando el progreso', () => {
      const pocket = PocketEntity.create(validProps);

      pocket.deposit(2500.0);

      expect(pocket.currentAmount).toBe(2500.0);
      expect(pocket.progress).toBe(50.0);
      expect(pocket.isCompleted).toBe(false);
    });

    it('debe rechazar abonos con montos menores o iguales a 0', () => {
      const pocket = PocketEntity.create(validProps);

      expect(() => pocket.deposit(0)).toThrow(InvalidAmountException);
      expect(() => pocket.deposit(-50)).toThrow(InvalidAmountException);
    });

    it('debe rechazar un abono que exceda la meta del bolsillo (LIMIT_EXCEEDED)', () => {
      const pocket = PocketEntity.create(validProps);
      pocket.deposit(4000.0);

      expect(() => pocket.deposit(1500.0)).toThrow(PocketGoalExceededException);
      // El estado no debe alterarse tras el fallo
      expect(pocket.currentAmount).toBe(4000.0);
      expect(pocket.progress).toBe(80.0);
    });

    it('debe marcar el bolsillo como completado y progreso 100% al alcanzar la meta exacta', () => {
      const pocket = PocketEntity.create(validProps);

      pocket.deposit(5000.0);

      expect(pocket.currentAmount).toBe(5000.0);
      expect(pocket.progress).toBe(100.0);
      expect(pocket.isCompleted).toBe(true);
    });

    it('debe rechazar cualquier abono adicional si el bolsillo ya está completado', () => {
      const pocket = PocketEntity.create(validProps);
      pocket.deposit(5000.0);

      expect(pocket.isCompleted).toBe(true);
      expect(() => pocket.deposit(10.0)).toThrow(PocketCompletedException);
    });
  });

  describe('Serialización de Dominio', () => {
    it('debe exportar un objeto que cumpla con el contrato Pocket de @examen-fullstack/shared', () => {
      const pocket = PocketEntity.create(validProps);
      pocket.deposit(1250.0);

      const dto = pocket.toDTO();

      expect(dto).toEqual({
        id: validProps.id,
        name: 'Viaje a Europa',
        targetAmount: 5000.0,
        currentAmount: 1250.0,
        progress: 25.0,
        isCompleted: false,
        createdAt: pocket.createdAt,
      });
    });
  });
});
