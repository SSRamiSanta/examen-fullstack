# Backend: Bolsillos de Ahorro API

Servicio de backend desarrollado en TypeScript sobre Node.js, encargado de la lógica financiera, persistencia de datos y sincronización reactiva en tiempo real.

---

## Arquitectura General

Implementa una **Arquitectura Hexagonal (Ports & Adapters)** pura:

```text
apps/backend/
├── src/
│   ├── domain/        # Núcleo de Dominio: Entidades (Pocket, Deposit), invariantes y seguridad
│   ├── application/   # Casos de Uso: CreatePocket, DepositFunds, GetPockets
│   ├── ports/         # Puertos: IPocketRepository, IEventPublisher
│   └── infra/         # Adaptadores: Express REST, SQLite (better-sqlite3) y WebSockets (ws)
└── tests/             # Pruebas unitarias de dominio, casos de uso e integración HTTP/WS
```

* **Persistencia Relacional**: SQLite nativo con `better-sqlite3`, claves foráneas activas (`PRAGMA foreign_keys = ON`) y modo WAL (`PRAGMA journal_mode = WAL`). Los datos se guardan en `data/pockets.db`.
* **Seguridad Integrada**: Verificación HMAC-SHA256 en tiempo constante, timestamp anti-replay (< 30s) y middleware de idempotencia con clave `X-Idempotency-Key`.

---

## Requisitos y Dependencias a Instalar

* **Node.js**: `>= 18.0.0`
* **npm**: `>= 9.0.0`
* **SQLite3**: Incluido a través de la dependencia `better-sqlite3`. Binario de sistema `sqlite3` opcional para consultas de consola.

Instalación de dependencias (desde la raíz o dentro de `apps/backend`):
```bash
npm install
```

---

## Comandos de Ejecución

```bash
# Iniciar servidor backend (Express en :3000 + WS en :3000) desde la raíz:
npm run dev:backend

# O ejecutando directamente con ts-node:
npx ts-node src/infra/server.ts
```

---

## Comandos de Pruebas

```bash
# Ejecutar todas las pruebas del backend (Dominio, Casos de Uso, Infraestructura y SQLite):
npx jest apps/backend

# Chequeo estricto de tipos TypeScript:
npm run typecheck --workspace=@examen-fullstack/backend
```
