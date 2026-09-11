import request from 'supertest';
import { Express } from 'express';
import { createExpressApp } from '../../src/infra/http/app';
import { InMemoryPocketRepository } from '../../src/infra/persistence/in-memory-pocket.repository';
import { IEventPublisher } from '../../src/ports';
import {
  CreatePocketUseCase,
  DepositFundsUseCase,
  GetPocketsUseCase,
} from '../../src/application';

describe('HTTP API Endpoints (Express Infra Adapter)', () => {
  let app: Express;
  let repository: InMemoryPocketRepository;
  let eventPublisher: jest.Mocked<IEventPublisher>;

  beforeEach(() => {
    repository = new InMemoryPocketRepository();
    eventPublisher = {
      publishPocketUpdated: jest.fn().mockResolvedValue(undefined),
      publishGoalReached: jest.fn().mockResolvedValue(undefined),
    };

    const getPocketsUseCase = new GetPocketsUseCase(repository);
    const createPocketUseCase = new CreatePocketUseCase(repository);
    const depositFundsUseCase = new DepositFundsUseCase(repository, eventPublisher);

    app = createExpressApp({
      getPocketsUseCase,
      createPocketUseCase,
      depositFundsUseCase,
    });
  });

  describe('GET /api/pockets', () => {
    it('debe responder 200 con un array vacío inicialmente', async () => {
      const res = await request(app).get('/api/pockets').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('POST /api/pockets', () => {
    it('debe crear un nuevo bolsillo y retornar 201 Created', async () => {
      const payload = {
        name: 'Viaje a Europa',
        targetAmount: 5000.0,
      };

      const res = await request(app)
        .post('/api/pockets')
        .send(payload)
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: 'Viaje a Europa',
          targetAmount: 5000.0,
          currentAmount: 0,
          progress: 0,
          isCompleted: false,
          createdAt: expect.any(String),
        })
      );
    });

    it('debe retornar 400 Bad Request si el nombre tiene menos de 3 caracteres', async () => {
      const res = await request(app)
        .post('/api/pockets')
        .send({ name: 'AB', targetAmount: 5000 })
        .expect(400);

      expect(res.body).toEqual({
        error: 'VALIDATION_ERROR',
        message: expect.any(String),
      });
    });

    it('debe retornar 400 Bad Request si el targetAmount es <= 0', async () => {
      const res = await request(app)
        .post('/api/pockets')
        .send({ name: 'Educación', targetAmount: 0 })
        .expect(400);

      expect(res.body).toEqual({
        error: 'VALIDATION_ERROR',
        message: expect.any(String),
      });
    });
  });

  describe('POST /api/pockets/:id/deposits', () => {
    let createdPocketId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/pockets')
        .send({ name: 'Ahorro Carro', targetAmount: 1000.0 });
      createdPocketId = res.body.id;
    });

    it('debe requerir la cabecera X-Idempotency-Key y retornar 400 si no se envía', async () => {
      const res = await request(app)
        .post(`/api/pockets/${createdPocketId}/deposits`)
        .send({ amount: 200 })
        .expect(400);

      expect(res.body).toEqual({
        error: 'MISSING_IDEMPOTENCY_KEY',
        message: 'La cabecera X-Idempotency-Key es obligatoria para procesar un abono.',
      });
    });

    it('debe procesar el abono exitosamente y retornar 200 OK con el bolsillo actualizado', async () => {
      const res = await request(app)
        .post(`/api/pockets/${createdPocketId}/deposits`)
        .set('X-Idempotency-Key', 'idempotency-key-1')
        .send({ amount: 250.0 })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: createdPocketId,
          currentAmount: 250.0,
          progress: 25.0,
          isCompleted: false,
        })
      );

      expect(eventPublisher.publishPocketUpdated).toHaveBeenCalledTimes(1);
    });

    it('debe ser idempotente: devolver la misma respuesta en peticiones duplicadas con la misma clave', async () => {
      const key = 'transaccion-unica-123';

      // Primera llamada
      const firstRes = await request(app)
        .post(`/api/pockets/${createdPocketId}/deposits`)
        .set('X-Idempotency-Key', key)
        .send({ amount: 200.0 })
        .expect(200);

      // Segunda llamada con la misma clave
      const secondRes = await request(app)
        .post(`/api/pockets/${createdPocketId}/deposits`)
        .set('X-Idempotency-Key', key)
        .send({ amount: 200.0 })
        .expect(200);

      expect(secondRes.body).toEqual(firstRes.body);
      // El saldo debe ser 200 (no 400)
      expect(secondRes.body.currentAmount).toBe(200.0);
    });

    it('debe retornar 404 Not Found si el bolsillo no existe', async () => {
      const res = await request(app)
        .post('/api/pockets/00000000-0000-0000-0000-000000000000/deposits')
        .set('X-Idempotency-Key', 'key-404')
        .send({ amount: 100 })
        .expect(404);

      expect(res.body).toEqual({
        error: 'NOT_FOUND',
        message: expect.any(String),
      });
    });

    it('debe retornar 400 Bad Request si el abono excede la meta (LIMIT_EXCEEDED)', async () => {
      const res = await request(app)
        .post(`/api/pockets/${createdPocketId}/deposits`)
        .set('X-Idempotency-Key', 'key-limit')
        .send({ amount: 1500.0 })
        .expect(400);

      expect(res.body).toEqual({
        error: 'LIMIT_EXCEEDED',
        message: expect.any(String),
      });
    });
  });
});
