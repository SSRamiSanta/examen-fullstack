# ESPECIFICACIÓN TÉCNICA (SDD): BOLSILLO DE AHORRO PROGRAMADO

## 1. CONTEXTO Y DIRECTRICES ARQUITECTÓNICAS
* **Estilo Arquitectónico Backend:** Arquitectura Hexagonal (Ports & Adapters) orientada a eventos.
* **Estilo Frontend:** SPA (React + TypeScript) desacoplada bajo Feature-First Clean UI (Custom Hooks como casos de uso, componentes presentacionales puros).
* **Filosofía de Desarrollo:** Spec-Driven Development (SDD) con TDD estricto (Red-Green-Refactor).
* **Tipado:** TypeScript estricto de punta a punta (prohibido `any`).

---

## 2. CONTRATOS FORMALES DE DATOS (SPECIFICATION)

### 2.1. Modelos Base (Types / Entities)
```typescript
export interface Pocket {
  id: string; // UUID v4
  name: string; // Min 3 caracteres
  targetAmount: number; // > 0
  currentAmount: number; // >= 0
  progress: number; // Calculado: min(100, (currentAmount / targetAmount) * 100)
  isCompleted: boolean; // currentAmount >= targetAmount
  createdAt: string; // ISO 8601
}

export interface Deposit {
  id: string; // UUID v4
  pocketId: string;
  amount: number; // > 0
  createdAt: string;
}

### 2.2. Endpoints HTTP (REST API)

GET /api/pockets
Descripción: Lista todas las metas de ahorro con su estado y progreso calculado.

Headers: Accept: application/json

Response 200 OK:

[
  {
    "id": "b3e2a1c0-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
    "name": "Viaje a Europa",
    "targetAmount": 5000.0,
    "currentAmount": 2500.0,
    "progress": 50.0,
    "isCompleted": false,
    "createdAt": "2026-09-10T15:00:00.000Z"
  }
]

POST /api/pockets
Descripción: Crea un nuevo bolsillo de ahorro.

Headers: Content-Type: application/json

Request Body:

{
  "name": "Viaje a Europa",
  "targetAmount": 5000.0
}

Validaciones: name no vacío (min 3 caracteres), targetAmount > 0.

Response 201 Created: Retorna el objeto Pocket creado.

Response 400 Bad Request: { "error": "VALIDATION_ERROR", "message": "..." }

POST /api/pockets/:id/deposits
Descripción: Procesa un abono hacia un bolsillo específico.

Headers:

Content-Type: application/json

X-Idempotency-Key: string (Obligatorio para evitar transacciones duplicadas)

Path Parameter: id (UUID del bolsillo)

Request Body:

{
  "amount": 250.0
}

Reglas de Negocio / Invariantes:

amount > 0.

El bolsillo debe existir (404 Not Found si no existe).

El bolsillo no debe estar completado (isCompleted === false).

currentAmount + amount NO debe exceder targetAmount (400 Bad Request: LIMIT_EXCEEDED).

Efectos Secundarios:

Persistir la transacción del abono.

Actualizar currentAmount e isCompleted.

Si alcanza el 100%: emitir internamente GoalReachedDomainEvent.

Publicar actualización reactiva vía WebSocket.

Response 200 OK: Retorna el objeto Pocket actualizado.


### 2.3. Contrato WebSocket (Push Events)
Protocolo: WSS (o WS local) vía canal multiplexado.

Canal/Room: pocket:{id} o broadcast autenticado por usuario.

Payload emitido tras cualquier abono exitoso:

{
  "event": "POCKET_UPDATED",
  "pocketId": "b3e2a1c0-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "targetAmount": 5000.0,
  "currentAmount": 5000.0,
  "progress": 100.0,
  "isCompleted": true,
  "goalAchieved": true,
  "timestamp": "2026-09-10T15:30:00.000Z"
}

### 3. ESTRUCTURA DEL PROYECTO (MONOREPO)

exam-fullstack/
├── packages/
│   └── shared/                       # Única fuente de verdad (SDD)
│       ├── src/
│       │   ├── contracts/            # Interfaces de dominio y DTOs
│       │   └── index.ts
│       └── package.json
├── apps/
│   ├── backend/                      # Arquitectura Hexagonal
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── domain/           # Entidades e invariantes puras (Pocket, Deposit)
│   │   │   │   ├── application/      # Casos de uso (CreatePocket, DepositFunds)
│   │   │   │   └── ports/            # Interfaces: IPocketRepository, IEventPublisher
│   │   │   └── infra/
│   │   │       ├── http/             # Express controllers y middlewares (Idempotency)
│   │   │       ├── realtime/         # WebSocket / WS Server adapter
│   │   │       └── persistence/      # SQLite / In-Memory repository
│   │   └── tests/                    # Tests unitarios e integración (TDD)
│   └── frontend/                     # React SPA (Clean UI)
│       ├── src/
│       │   ├── domain/               # Helpers y validaciones puras de UI
│       │   ├── services/             # Adaptadores HTTP (Fetch) y WebSocket
│       │   ├── hooks/                # Orquestación / Casos de uso (usePockets, useDeposit)
│       │   └── components/           # UI Dumb (PocketCard, DepositModal, GoalCelebration)
│       └── tests/
├── docs/
│   ├── arquitectura.md               # Justificación y trade-offs
│   └── ia.md                         # Bitácora de gobernanza de IA
└── package.json

### 4. INSTRUCCIONES DE IMPLEMENTACIÓN PARA EL AGENTE (TDD WORKFLOW)
Fase Shared: Exportar todos los contratos e interfaces TypeScript descritos en la sección 2.

Fase Backend TDD:

Escribir pocket.entity.spec.ts verificando: rechazo de montos <= 0, rechazo de excedentes sobre la meta y cambio de estado a completado.

Implementar la entidad pura Pocket.

Escribir deposit-funds.use-case.spec.ts con mocks de repositorio y bus de eventos.

Implementar el caso de uso y verificar que pase en verde.

Implementar adaptadores HTTP y WebSocket.

Fase Frontend TDD:

Escribir pruebas unitarias para el renderizado del listado de bolsillos y el modal de felicitaciones cuando goalAchieved === true.

Implementar componentes y custom hooks conectando los contratos de packages/shared.