# Examen Fullstack: Bolsillo de Ahorro Programado

Monorepo modular en TypeScript para la gestión de bolsillos de ahorro financiero con actualizaciones reactivas en tiempo real, persistencia relacional en SQLite y seguridad integral (HMAC-SHA256, Idempotencia y anti-replay).

---

## Arquitectura General

El sistema sigue una **Arquitectura Hexagonal (Ports & Adapters)** desacoplada:

```text
examen-fullstack/
├── packages/
│   └── shared/   --> Contratos canónicos compartidos (Modelos, DTOs y Eventos WS)
└── apps/
    ├── backend/  --> Arquitectura Hexagonal: Dominio puro, Casos de Uso, Express y SQLite
    └── frontend/ --> SPA React 18 + Vite, Custom Hooks, Web Crypto API y WebSockets
```

Para el detalle técnico y justificación de patrones SOLID, DRY y tácticas CIA, consultar [docs/arquitectura.md](docs/arquitectura.md) y [docs/ia.md](docs/ia.md).

---

## Requisitos del Sistema

* **Node.js**: versión `>= 18.0.0` (recomendado Node.js LTS).
* **npm**: versión `>= 9.0.0`.
* **SQLite3**: el motor relacional funciona embebido vía `better-sqlite3`. La herramienta CLI de sistema `sqlite3` es opcional si se desea inspección manual por terminal.

---

## Instalación

Instalar todas las dependencias del monorepo desde la raíz:

```bash
npm install
```

---

## Comandos Principales

### Ejecución de Aplicaciones
```bash
# Iniciar Backend (Express + WebSockets en http://localhost:3000)
npm run dev:backend

# Iniciar Frontend (React + Vite en http://localhost:5173)
npm run dev:frontend
```

### Pruebas y Calidad
```bash
# Ejecutar todas las pruebas unitarias y de integración (67 tests / 12 suites)
npm test

# Ejecutar pruebas con reporte de cobertura
npm run test:coverage

# Chequeo estricto de tipos TypeScript en todos los workspaces
npm run typecheck

# Compilar frontend para producción
npm run build
```

### Inspección de Base de Datos SQLite
```bash
# Visor de datos en terminal (tablas pockets y deposits)
npm run db

# O inspección directa con SQLite CLI (si está instalado en el sistema)
sqlite3 data/pockets.db ".mode table" "SELECT * FROM pockets;"
```
