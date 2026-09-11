# Frontend: Bolsillos de Ahorro Web App

Aplicación cliente SPA (Single Page Application) desarrollada con React 18 y Vite, con suscripción a eventos en tiempo real vía WebSocket y firma criptográfica de peticiones.

---

## Arquitectura General

Organizada bajo el patrón **Component-Driven & Custom Hooks**:

```text
apps/frontend/
├── src/
│   ├── services/      # Servicios de transporte: API REST (Fetch), WebSocket cliente y Web Crypto API
│   ├── hooks/         # Custom Hooks como orquestadores de estado: usePockets, useDeposit
│   ├── components/    # Componentes UI: PocketCard, DepositModal, CreatePocketModal, GoalCelebration
│   ├── domain/        # Helpers de dominio frontend: formateo de moneda y porcentaje de progreso
│   └── App.tsx        # Tablero principal con métricas acumuladas
└── tests/             # Pruebas de componentes y hooks con Jest y React Testing Library
```

* **Seguridad en Tránsito**: Firma automática de peticiones POST usando la API nativa del navegador `window.crypto.subtle` (HMAC-SHA256).
* **Reactividad en Vivo**: Escucha instantánea de eventos `POCKET_UPDATED` sin necesidad de recargar la página.

---

## Requisitos y Dependencias a Instalar

* **Node.js**: `>= 18.0.0`
* **npm**: `>= 9.0.0`

Instalación de dependencias (desde la raíz o dentro de `apps/frontend`):
```bash
npm install
```

---

## Comandos de Ejecución

```bash
# Iniciar servidor de desarrollo Vite (en http://localhost:5173) desde la raíz:
npm run dev:frontend

# O dentro del directorio apps/frontend:
npm run dev

# Compilar para producción (HTML/CSS/JS optimizado en dist/):
npm run build
```

---

## Comandos de Pruebas

```bash
# Ejecutar todas las pruebas del frontend (Componentes, Hooks y Mock WS):
npx jest apps/frontend

# Chequeo estricto de tipos TypeScript:
npm run typecheck --workspace=@examen-fullstack/frontend
```
