# Documentación de Gobernanza y Uso de Inteligencia Artificial

## 1. Declaración de Uso de Herramientas de IA
- **Herramientas Utilizadas**: Antigravity AI Assistant (Google DeepMind) / Modelo Gemini 3.8 Flash.
- **Rol Desempeñado**: Desarrollador e Ingeniero de Software Senior especializado en TypeScript, Node.js y React.
- **Alcance**: Asistencia en la arquitectura, contratos compartidos, pruebas (TDD) e implementación del proyecto KATA "Bolsillo de Ahorro Programado" en monorepo bajo especificación formal (`spec.md`).

## 2. Gobernanza, Ética y Seguridad
- **Políticas de Privacidad y Datos**: Ningún secreto, token ni dato sensible o confidencial es transmitido. No se utilizan credenciales reales.
- **Licenciamiento y Propiedad Intelectual**: Todo el código se genera con estándares de código abierto y contratos TypeScript limpios, evitando dependencias innecesarias y respetando la propiedad del código.
- **Fuente de Verdad Única**: Toda generación se ciñe 100% a la especificación en `spec.md`, sin invención de endpoints, propiedades no definidas ni atajos no tipados (`any` prohibido).
- **Delimitación Estricta de Paquetes Compartidos**: En la carpeta `packages/` reside única y exclusivamente `packages/shared`, garantizando que únicamente los contratos, modelos, DTOs e interfaces de eventos viajen entre cliente y servidor. Todo el núcleo de dominio financiero y las reglas de negocio pertenecen al backend (`apps/backend/src/domain`).

## 3. Proceso de Supervisión y Validación Humana (Human-in-the-Loop)
- **Flujo Task-by-Task**: Ejecución estricta paso a paso con punto de detención y confirmación explícita del usuario entre cada tarea antes de continuar.
- **Estrategia de Pruebas**: SDD (Spec-Driven Development) y ciclo TDD (Red-Green-Refactor) para validar el comportamiento antes y después de cada implementación.
- **Auditoría de Tipos**: Verificación estricta mediante TypeScript (`tsc --noEmit`) con reglas `strict: true` y `noImplicitAny: true`.

---

## 4. Registro Cronológico de Prompts, Acciones y Decisiones por Ítems

### Ítem 1: Creación de la estructura base del monorepo
* **Fecha / Sesión**: 2026-09-10
* **Prompt del Usuario**:
  > "Creame esta estructura de encarpetado para crear mi proyecto: examen-fullstack/ apps/ backend/ frontend/ packages/ docs/ arquitectura.md ia.md README.md"
* **Acciones Realizadas**:
  - Creación del árbol de carpetas base del monorepo (`apps/backend`, `apps/frontend`, `packages/shared`, `docs`).
  - Creación del archivo `README.md` con descripción general y flujo de inicio.
  - Creación de las plantillas iniciales de `docs/arquitectura.md` y `docs/ia.md`.
  - Creación de `README.md` en `apps/backend`, `apps/frontend` y `packages/`.
* **Archivos Definidos**:
  - `README.md`
  - `docs/arquitectura.md`
  - `docs/ia.md`
  - `apps/backend/README.md`
  - `apps/frontend/README.md`
  - `packages/README.md`
* **Validación**:
  - Inspección del árbol de directorios con `find` verificando la coincidencia exacta con el árbol solicitado.

---

### Ítem 2: Tarea 1 (Shared - SDD) - Contratos Canónicos, Modelos, DTOs y Eventos
* **Fecha / Sesión**: 2026-09-10
* **Prompt del Usuario**:
  > "Actúa como un Desarrollador e Ingeniero de Software Senior especializado en TypeScript, Node.js y React... Vas a implementar el proyecto KATA 'Bolsillo de Ahorro Programado' en este monorepo... Comienza ÚNICA Y EXCLUSIVAMENTE con la Tarea 1 (Shared - SDD). Crea los contratos y tipos en packages/shared basados fielmente en spec.md. Cuando termines de escribir estos archivos, DETENTE Y ESPERA MI REVISIÓN Y ORDEN PARA PASAR A LA TAREA 2. No escribas nada de backend ni frontend todavía. Registra cada prompt que te haga, cada archivo que definas en el archivo docs/ia.md..."
* **Acciones Realizadas**:
  1. Configuración del monorepo en `package.json` raíz definiendo `workspaces: ["packages/*", "apps/*"]`.
  2. Creación del módulo canónico `@examen-fullstack/shared` en `packages/shared`:
     - Configuración de `packages/shared/package.json` con scripts de compilación/chequeo de tipos.
     - Configuración de `packages/shared/tsconfig.json` con compilación estricta (`strict: true`, `noImplicitAny: true`).
  3. Definición de contratos formales según `spec.md` (Sección 2):
     - Modelos base: `Pocket` (id, name, targetAmount, currentAmount, progress, isCompleted, createdAt) y `Deposit` (id, pocketId, amount, createdAt).
     - DTOs y respuestas de API: `CreatePocketDTO`, `CreateDepositDTO`, `ApiErrorResponse`, códigos de error `ApiErrorCode` y cabeceras (`x-idempotency-key`).
     - Eventos WebSocket y de dominio: `PocketUpdatedEvent`, `GoalReachedDomainEvent`, `WebSocketEvent`, `SecureEnvelope<T>`.
  4. Exportación centralizada de contratos a través de `packages/shared/src/contracts/index.ts` y punto de entrada `packages/shared/src/index.ts`.
  5. Ejecución del compilador TypeScript para verificar la sanidad de tipos sin emisiones erróneas.
* **Archivos Definidos / Modificados**:
  - `package.json` (actualizado para workspaces)
  - `packages/shared/package.json` (nuevo)
  - `packages/shared/tsconfig.json` (nuevo)
  - `packages/shared/src/contracts/models.ts` (nuevo)
  - `packages/shared/src/contracts/dtos.ts` (nuevo)
  - `packages/shared/src/contracts/events.ts` (nuevo)
  - `packages/shared/src/contracts/index.ts` (nuevo)
  - `packages/shared/src/index.ts` (nuevo)
  - `docs/ia.md` (actualizado)
* **Validación y Estado de Tests**:
  - Chequeo de tipos: `npx tsc --project packages/shared/tsconfig.json --noEmit` completado exitosamente (0 errores).
  - Tipado 100% estricto, sin `any`.

---

### Ítem 3: Tarea 2 (Backend Domain TDD) - Entidades de Dominio e Invariantes Financieras
* **Fecha / Sesión**: 2026-09-10
* **Prompt del Usuario**:
  > "Continúa con la capa de dominio en el backend. Asegura la pureza de las entidades de negocio, invariantes y excepciones semánticas con TDD estricto."
* **Roles de Subagentes Activos**:
  - *TDD Lead*: Coordinación del ciclo Red -> Green -> Refactor.
  - *Architecture Guardian*: Dominio puro en `apps/backend/src/domain/`, blindado contra dependencias externas, frameworks HTTP o librerías de bases de datos.
  - *Clean Code / Security Reviewer*: Tipado estricto, encapsulación de propiedades privadas, validación de invariantes financieras y utilidades criptográficas seguras.
* **Acciones Realizadas**:
  1. Configuración de `apps/backend/package.json` y `apps/backend/tsconfig.json` estricto (`moduleResolution: Node16`).
  2. Configuración de pruebas unitarias con Jest + `ts-jest` y mapeo de módulos de workspace.
  3. **Fase RED**: Redacción de `apps/backend/tests/domain/pocket.entity.spec.ts` verificando:
     - Creación válida de un `Pocket` con valores por defecto.
     - Rechazo de nombre con menos de 3 caracteres (`InvalidPocketNameException`).
     - Rechazo de meta <= 0 (`InvalidAmountException`).
     - Jerarquía semántica de excepciones heredando de `DomainException`.
     - Invariantes en abonos (`deposit`): incremento de monto, cálculo de porcentaje con cota máxima 100, rechazo de monto <= 0, rechazo si excede meta (`PocketGoalExceededException`), paso a completado al 100% y bloqueo de abonos subsiguientes (`PocketCompletedException`).
     - Serialización DTO conforme al contrato de `@examen-fullstack/shared`.
  4. **Fase GREEN**:
     - Implementación de las excepciones de dominio puras en `apps/backend/src/domain/errors/index.ts`.
     - Implementación de `PocketEntity` con métodos de fábrica `create`, `reconstitute`, método de negocio `deposit`, `calculateProgress` y `toDTO` en `apps/backend/src/domain/entities/pocket.entity.ts`.
     - Implementación de `DepositEntity` en `apps/backend/src/domain/entities/deposit.entity.ts`.
  5. **Fase REFACTOR**:
     - Consolidación de exportaciones en barril `apps/backend/src/domain/index.ts` y re-exportación en `apps/backend/src/index.ts`.
     - Verificación de tipos estricta sin `any`.
* **Archivos Definidos**:
  - `apps/backend/package.json` (nuevo)
  - `apps/backend/tsconfig.json` (nuevo)
  - `jest.config.js` (nuevo)
  - `tsconfig.json` (nuevo en raíz)
  - `apps/backend/src/domain/errors/index.ts` (nuevo)
  - `apps/backend/src/domain/entities/pocket.entity.ts` (nuevo)
  - `apps/backend/src/domain/entities/deposit.entity.ts` (nuevo)
  - `apps/backend/src/domain/entities/index.ts` (nuevo)
  - `apps/backend/src/domain/index.ts` (nuevo)
  - `apps/backend/tests/domain/pocket.entity.spec.ts` (nuevo)
* **Validación y Estado de Tests**:
  - Pruebas unitarias de dominio: 1 suite pasada, 10 tests pasados, 0 fallidos.
  - Chequeo de tipos: `npx tsc --project apps/backend/tsconfig.json --noEmit` completado exitosamente (0 errores).

---

### Ítem 4: Tarea 3 (Backend Application TDD) - Puertos y Casos de Uso
* **Fecha / Sesión**: 2026-09-10
* **Prompt del Usuario**:
  > "Continua con los casos de uso y puertos del backend."
* **Roles de Subagentes Activos**:
  - *Architecture Guardian*: Puertos abstractos (`IPocketRepository`, `IEventPublisher`) desacoplados de infraestructura; orquestación de casos de uso agnósticos sin dependencias de Express ni bases de datos.
  - *TDD Lead*: Ciclo Red -> Green -> Refactor para `DepositFundsUseCase`, `CreatePocketUseCase` y `GetPocketsUseCase` con simulación por mocks.
  - *Clean Code / Security Reviewer*: Validación de efectos secundarios, emisión reactiva condicionada del 100% (`GoalReachedDomainEvent` y `PocketUpdatedEvent`) y tipado estricto sin `any`.
* **Acciones Realizadas**:
  1. Definición de puertos en `apps/backend/src/ports/`:
     - `IPocketRepository`: operaciones `findById`, `findAll`, `save`, `update`, `saveDeposit`.
     - `IEventPublisher`: operaciones `publishPocketUpdated` y `publishGoalReached`.
  2. **Fase RED**: Redacción de pruebas unitarias en `apps/backend/tests/application/`:
     - `deposit-funds.use-case.spec.ts`: abono parcial exitoso, actualización de monto y progreso, persistencia de depósito, abono que culmina la meta al 100% disparando `GoalReachedDomainEvent` y `PocketUpdatedEvent` con `goalAchieved: true`, excepciones ante bolsillos inexistentes (`PocketNotFoundException`), montos inválidos (`InvalidAmountException`), bolsillos completados (`PocketCompletedException`) y montos excedentes (`PocketGoalExceededException`).
     - `create-pocket.use-case.spec.ts`: creación de bolsillo, asignación de id e inicialización en 0% con persistencia en repositorio.
     - `get-pockets.use-case.spec.ts`: consulta y mapeo a DTOs de todos los bolsillos existentes.
  3. **Fase GREEN**:
     - Implementación de `DepositFundsUseCase` en `apps/backend/src/application/use-cases/deposit-funds.use-case.ts`.
     - Implementación de `CreatePocketUseCase` en `apps/backend/src/application/use-cases/create-pocket.use-case.ts`.
     - Implementación de `GetPocketsUseCase` en `apps/backend/src/application/use-cases/get-pockets.use-case.ts`.
  4. **Fase REFACTOR**:
     - Exportaciones limpias a través de barriles `src/application/use-cases/index.ts`, `src/application/index.ts` y `src/index.ts`.
     - Verificación de tipos estricta sin `any`.
* **Archivos Definidos / Modificados**:
  - `apps/backend/src/ports/pocket-repository.port.ts` (nuevo)
  - `apps/backend/src/ports/event-publisher.port.ts` (nuevo)
  - `apps/backend/src/ports/index.ts` (nuevo)
  - `apps/backend/src/application/use-cases/deposit-funds.use-case.ts` (nuevo)
  - `apps/backend/src/application/use-cases/create-pocket.use-case.ts` (nuevo)
  - `apps/backend/src/application/use-cases/get-pockets.use-case.ts` (nuevo)
  - `apps/backend/src/application/use-cases/index.ts` (nuevo)
  - `apps/backend/src/application/index.ts` (nuevo)
  - `apps/backend/tests/application/deposit-funds.use-case.spec.ts` (nuevo)
  - `apps/backend/tests/application/create-pocket.use-case.spec.ts` (nuevo)
  - `apps/backend/tests/application/get-pockets.use-case.spec.ts` (nuevo)
* **Validación y Estado de Tests**:
  - Pruebas unitarias de casos de uso y dominio: 4 suites pasadas, 21 tests pasados, 0 fallidos.
  - Chequeo de tipos: `npx tsc --project apps/backend/tsconfig.json --noEmit` completado exitosamente (0 errores).

---

### Ítem 5: Tarea 4 (Backend Infra) - Persistencia SQLite, Express, Idempotencia y WebSocket
* **Fecha / Sesión**: 2026-09-10
* **Prompt del Usuario**:
  > "Implementa la infraestructura del backend con persistencia relacional en SQLite, adaptadores Express, middleware de idempotencia y publicador en tiempo real por WebSockets."
* **Roles de Subagentes Activos**:
  - *Architecture Guardian*: Implementación pura de adaptadores secundarios (`SqlitePocketRepository` sobre `better-sqlite3` y gateway WebSocket mediante `WebSocketEventPublisher`) y primarios (controladores Express y enrutamiento REST).
  - *Clean Code & Security Reviewer*: Aplicación de estándares de seguridad y consistencia:
    - Enlace estricto a `127.0.0.1` en desarrollo y tests.
    - Validación y sanitización estricta de entradas en controladores.
    - Middleware de idempotencia (`X-Idempotency-Key`) con almacenamiento controlado en memoria, TTL y LRU para prevenir duplicados.
    - `errorMiddleware` para sanitizar respuestas y evitar fugas de stack traces (`INTERNAL_ERROR`).
  - *TDD Lead*: Ciclo Red -> Green -> Refactor para la capa de persistencia e infraestructura HTTP con Supertest y cliente WebSocket.
* **Acciones Realizadas**:
  1. **Adaptador de Persistencia SQLite:**
     - Configuración del motor relacional con `better-sqlite3` en `apps/backend/src/infra/persistence/sqlite/sqlite-database.ts` con `PRAGMA foreign_keys = ON` y `PRAGMA journal_mode = WAL`.
     - Esquema relacional con tablas `pockets` y `deposits`, claves foráneas con `ON DELETE CASCADE` e índice optimizado `idx_deposits_pocket_id`.
     - Implementación de `SqlitePocketRepository` en `apps/backend/src/infra/persistence/sqlite/sqlite-pocket.repository.ts` implementando el puerto `IPocketRepository` con sentencias SQL preparadas (*prepared statements*).
  2. **Adaptador de Realtime (WebSocket):**
     - Implementación de `WebSocketEventPublisher` en `apps/backend/src/infra/realtime/websocket.event-publisher.ts` implementando `IEventPublisher` para transmisión en vivo de `POCKET_UPDATED`.
  3. **Middlewares y Controladores HTTP:**
     - `createIdempotencyMiddleware`: verificación obligatoria de `X-Idempotency-Key` y caché de respuestas.
     - `errorMiddleware`: traducción semántica de `DomainException` a respuestas HTTP (`400 VALIDATION_ERROR`, `400 LIMIT_EXCEEDED`, `404 NOT_FOUND`, `500 INTERNAL_ERROR`).
     - `PocketController`: endpoints `getPockets` (GET 200), `createPocket` (POST 201), `depositFunds` (POST 200).
     - `createPocketRouter` y `createExpressApp` con CORS y JSON parsing.
     - `bootstrapServer`: orquestación de servidor HTTP y WebSocket acoplados en `apps/backend/src/infra/server.ts`.
  4. **Pruebas de Infraestructura (TDD):**
     - `sqlite-pocket-repository.spec.ts`: pruebas de persistencia con base de datos atómica en memoria (`:memory:`), consulta, actualización, inserción de depósitos y verificación de clave foránea.
     - `websocket-gateway.spec.ts`: prueba en vivo de transmisión y recepción de eventos `POCKET_UPDATED`.
     - `http-api.spec.ts`: pruebas de integración con Supertest para los endpoints, validaciones, 404, límite excedido e idempotencia.
* **Archivos Definidos / Modificados**:
  - `apps/backend/src/infra/persistence/sqlite/sqlite-database.ts` (nuevo)
  - `apps/backend/src/infra/persistence/sqlite/sqlite-pocket.repository.ts` (nuevo)
  - `apps/backend/src/infra/persistence/index.ts` (nuevo)
  - `apps/backend/src/infra/realtime/websocket.event-publisher.ts` (nuevo)
  - `apps/backend/src/infra/http/middlewares/idempotency.middleware.ts` (nuevo)
  - `apps/backend/src/infra/http/middlewares/error.middleware.ts` (nuevo)
  - `apps/backend/src/infra/http/controllers/pocket.controller.ts` (nuevo)
  - `apps/backend/src/infra/http/routes/pocket.routes.ts` (nuevo)
  - `apps/backend/src/infra/http/app.ts` (nuevo)
  - `apps/backend/src/infra/server.ts` (nuevo)
  - `apps/backend/src/infra/index.ts` (nuevo)
  - `apps/backend/tests/infra/sqlite-pocket-repository.spec.ts` (nuevo)
  - `apps/backend/tests/infra/websocket-gateway.spec.ts` (nuevo)
  - `apps/backend/tests/infra/http-api.spec.ts` (nuevo)
* **Validación y Estado de Tests**:
  - Pruebas totales del backend: 7 suites pasadas, 37 tests pasados, 0 fallidos.
  - Chequeo de tipos: `npx tsc` completado exitosamente (0 errores).

---

### Ítem 6: Tarea 5 (Frontend TDD & UI) - React SPA, Hooks, Componentes y Celebración Reactiva
* **Fecha / Sesión**: 2026-09-11
* **Prompt del Usuario**:
  > "Continua con el frontend en React consumiendo los contratos compartidos."
* **Roles de Subagentes Activos**:
  - *Architecture Guardian*: Desacoplamiento estricto en el frontend: servicios de transporte (`api.service.ts`, `websocket.service.ts`) -> custom hooks como orquestadores (`usePockets`, `useDeposit`) -> componentes presentacionales (`PocketCard`, `DepositModal`, `CreatePocketModal`, `GoalCelebration`).
  - *UX/UI Designer*: Interfaz intuitiva y accesible (visibilidad del estado, chips rápidos de monto, confirmación con spinner y clave de idempotencia automática, modal de celebración al alcanzar el 100%).
  - *TDD Lead*: Ciclo Red -> Green -> Refactor para componentes de React y Custom Hooks con Jest y `@testing-library/react`.
  - *Clean Code Reviewer*: TypeScript estricto consumiendo `@examen-fullstack/shared`, sin `any`.
* **Acciones Realizadas**:
  1. **Configuración de `apps/frontend`:**
     - `package.json`, `tsconfig.json` con `moduleResolution: bundler` y `vite.config.ts` con proxy hacia el backend.
     - `index.html` con buenas prácticas SEO y tipografía Inter.
  2. **Helpers de Dominio Frontend:**
     - `currency.formatter.ts`: formateador numérico a moneda USD.
     - `progress.helper.ts`: cálculo de coloración dinámica según el avance de la meta.
  3. **Servicios de Transporte:**
     - `api.service.ts`: cliente HTTP fetch con inyección de cabecera `X-Idempotency-Key` y manejo de errores.
     - `websocket.service.ts`: cliente WebSocket reactivo con reconexión automática y despacho de eventos `POCKET_UPDATED`.
  4. **Custom Hooks:**
     - `usePockets`: carga inicial, actualización reactiva en tiempo real ante eventos WebSocket y detección de `goalAchieved: true` para la celebración.
     - `useDeposit`: ejecución de abonos con estados de carga y manejo de excepciones de negocio.
  5. **Componentes Presentacionales y de Celebración:**
     - `PocketCard`: renderizado de meta, progreso, montos, insignia de estado y botón de abono.
     - `DepositModal`: modal de abono con atajos rápidos de monto y validación.
     - `CreatePocketModal`: modal para creación de nuevos bolsillos.
     - `GoalCelebration`: modal de felicitación reactiva al cumplir el 100% de la meta de ahorro.
     - `App.tsx`: tablero integral con métricas acumuladas (total ahorrado, meta global, metas cumplidas).
     - `index.css`: diseño moderno con gradientes, dark mode y glassmorphism.
  6. **Pruebas TDD (`apps/frontend/tests/`):**
     - `PocketCard.spec.tsx`: renderizado, cálculos, botón habilitado/deshabilitado y evento de abono.
     - `GoalCelebration.spec.tsx`: visualización condicional ante metas cumplidas y cierre.
     - `usePockets.spec.ts`: carga inicial, actualización reactiva vía WebSocket y activación del estado de celebración.
* **Archivos Definidos / Modificados**:
  - `apps/frontend/package.json` (nuevo)
  - `apps/frontend/tsconfig.json` (nuevo)
  - `apps/frontend/vite.config.ts` (nuevo)
  - `apps/frontend/index.html` (nuevo)
  - `apps/frontend/src/domain/currency.formatter.ts` (nuevo)
  - `apps/frontend/src/domain/progress.helper.ts` (nuevo)
  - `apps/frontend/src/services/api.service.ts` (nuevo)
  - `apps/frontend/src/services/websocket.service.ts` (nuevo)
  - `apps/frontend/src/hooks/usePockets.ts` (nuevo)
  - `apps/frontend/src/hooks/useDeposit.ts` (nuevo)
  - `apps/frontend/src/components/PocketCard.tsx` (nuevo)
  - `apps/frontend/src/components/DepositModal.tsx` (nuevo)
  - `apps/frontend/src/components/CreatePocketModal.tsx` (nuevo)
  - `apps/frontend/src/components/GoalCelebration.tsx` (nuevo)
  - `apps/frontend/src/App.tsx` (nuevo)
  - `apps/frontend/src/main.tsx` (nuevo)
  - `apps/frontend/src/index.css` (nuevo)
  - `apps/frontend/tests/components/PocketCard.spec.tsx` (nuevo)
  - `apps/frontend/tests/components/GoalCelebration.spec.tsx` (nuevo)
  - `apps/frontend/tests/hooks/usePockets.spec.ts` (nuevo)
* **Validación y Estado de Tests**:
  - Pruebas totales del monorepo: 10 suites pasadas, 46 tests pasados, 0 fallidos.
  - Build de producción: `vite build` completado exitosamente (0 errores).

---

### Ítem 7: Seguridad Integral (Tríada CIA), Criptografía HMAC-SHA256, Sanitización y Validación Estricta
* **Fecha / Sesión**: 2026-09-11
* **Prompt del Usuario**:
  > "Sobre todo me interesa priorizar seguridad y el trio CIA, que deberia manejar y arreglar para que esto mejore? Y se prioricen estos atributos... Quiero aparte que la información viaje autenticada con hash sha 256 o similares con criptografia de llave privada... Con las emisiones de websocket que no haya vulnerabilidad en tránsito... Sanitizar la data y que sea mayor a 0 el monto en creacion y update en el backend."
* **Roles de Subagentes Activos**:
  - *Security & Cryptography Specialist*: Diseño del esquema de integridad, autenticidad y mitigación de ataques de repetición mediante HMAC-SHA256 y timestamps.
  - *Architecture Guardian*: Utilidades criptográficas en `apps/backend/src/domain/security/` y contratos de sobres de seguridad en `@examen-fullstack/shared`.
  - *Backend Hardening & SRE Lead*: Eliminación de riesgo de OOM en `IdempotencyStore` (TTL 24h, poda automática y límite de capacidad), `express.json({ limit: '10kb' })`, desactivación de `X-Powered-By`, cabeceras de seguridad nosniff/frame-options y ciclo de heartbeat ping/pong en WebSockets.
  - *Clean Code & TDD Lead*: Implementación de pruebas automatizadas para sanitización HTML, validación estricta de montos > 0, detección de alteración de mensajes y ataques de repetición.
* **Acciones Realizadas**:
  1. **Contratos en `@examen-fullstack/shared`**:
     - Definición de `SecureEnvelope<T>` en `events.ts` con `payload`, `timestamp`, `nonce` y `signature`.
  2. **Núcleo de Dominio y Seguridad en `apps/backend/src/domain/security/`**:
     - Implementación de `security.utils.ts` con `sanitizeString` (neutralización de etiquetas HTML/XSS y caracteres de control), `isPositiveFiniteNumber` (rechazo estricto de <= 0, NaN e infinitos), `computeHmacSha256`, `verifyHmacSha256` (comparación timing-safe con `crypto.timingSafeEqual`) y `validateTimestamp` (ventana de tolerancia anti-replay de 30s).
     - Excepciones semánticas `InvalidSignatureException` y `ReplayAttackException`.
  3. **Backend (`apps/backend`)**:
     - `IdempotencyStore`: Incorporación de TTL (24 horas), política de expulsión FIFO/LRU y poda automática de entradas expiradas para prevenir agotamiento de memoria.
     - `PocketController`: Sanitización estricta de nombres y validación de `targetAmount > 0` y `amount > 0` con `isPositiveFiniteNumber`.
     - `signature.middleware.ts`: Middleware de verificación criptográfica de cabeceras `X-Signature`, `X-Timestamp` y `X-Nonce`.
     - `app.ts`: Desactivación de `x-powered-by`, cabeceras nosniff/frame-options, límite de carga de 10kb y vinculación del middleware de firma.
     - `websocket.event-publisher.ts`: Heartbeat `ping`/`pong` cada 30 segundos con desconexión de clientes zombies y soporte para emisión segura con `SecureEnvelope`.
  4. **Frontend (`apps/frontend`)**:
     - `crypto.service.ts`: Integración nativa con Web Crypto API (`window.crypto.subtle`) para cálculo de firmas HMAC-SHA256 y cabeceras anti-replay.
     - `api.service.ts`: Firma automática de peticiones POST con inyección de cabeceras `X-Signature`, `X-Timestamp` y `X-Nonce`.
     - `websocket.service.ts`: Desempaquetado y procesamiento seguro de eventos envueltos en `SecureEnvelope`.
* **Archivos Modificados / Creados**:
  - `packages/shared/src/contracts/events.ts` (actualizado)
  - `apps/backend/src/domain/security/security.utils.ts` (nuevo)
  - `apps/backend/src/domain/security/index.ts` (nuevo)
  - `apps/backend/tests/domain/security.utils.spec.ts` (nuevo)
  - `apps/backend/src/infra/http/middlewares/idempotency.middleware.ts` (actualizado)
  - `apps/backend/src/infra/http/middlewares/signature.middleware.ts` (nuevo)
  - `apps/backend/src/infra/http/controllers/pocket.controller.ts` (actualizado)
  - `apps/backend/src/infra/http/routes/pocket.routes.ts` (actualizado)
  - `apps/backend/src/infra/http/app.ts` (actualizado)
  - `apps/backend/src/infra/realtime/websocket.event-publisher.ts` (actualizado)
  - `apps/backend/tests/infra/http-api.spec.ts` (actualizado)
  - `apps/backend/tests/infra/idempotency-store.spec.ts` (nuevo)
  - `apps/backend/tests/infra/websocket-gateway.spec.ts` (actualizado)
  - `apps/frontend/src/services/crypto.service.ts` (nuevo)
  - `apps/frontend/src/services/api.service.ts` (actualizado)
  - `apps/frontend/src/services/websocket.service.ts` (actualizado)
  - `scripts/db-viewer.js` (nuevo script de inspección de SQLite)
* **Validación y Estado de Tests**:
  - Tests unitarios e integración: **12/12 suites pasadas, 67/67 tests pasados (100% verde)**.
  - Typecheck: 0 errores en todos los workspaces.
  - Build de producción frontend: completado exitosamente.

---

## 5. Resumen del Estado Final del Sistema

| Métrica / Dimensión | Estado Alcanzado |
| :--- | :--- |
| **Suites de Pruebas (Jest)** | **12 pasadas, 12 totales (100%)** |
| **Pruebas Unitarias e Integración** | **67 pasadas, 67 totales (100% verde)** |
| **Chequeo de Tipos TypeScript (`tsc --noEmit`)** | **0 errores en todos los workspaces** |
| **Paquetes Compartidos (`packages/`)** | **Exclusivamente `packages/shared` (Contratos canónicos, DTOs y eventos)** |
| **Núcleo de Dominio Financiero** | **`apps/backend/src/domain` (Entidades, invariantes, excepciones y criptografía)** |
| **Motor de Persistencia** | **SQLite relacional (`better-sqlite3`) con WAL, claves foráneas e índices** |
| **Seguridad Implementada** | **Tríada CIA: HMAC-SHA256, Anti-Replay, Sanitización XSS, Idempotencia, Timing-Safe** |
