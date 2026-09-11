# Packages: Contratos Compartidos (Shared)

En este directorio reside **única y exclusivamente** el paquete de contratos compartidos `@examen-fullstack/shared`.

---

## Arquitectura y Propósito

Actúa como la **Única Fuente de Verdad (Single Source of Truth)** entre backend y frontend:

```text
packages/
└── shared/
    └── src/
        └── contracts/
            ├── models.ts   # Modelos de datos canónicos (Pocket, Deposit)
            ├── dtos.ts     # DTOs de petición y respuesta (CreatePocketDTO, CreateDepositDTO, etc.)
            └── events.ts   # Definición de eventos WebSocket y sobre seguro (SecureEnvelope)
```

Al mantener únicamente los contratos en esta capa compartida:
1. El frontend no arrastra dependencias de base de datos ni lógica interna del backend.
2. El compilador de TypeScript valida de punta a punta cualquier cambio en contratos entre cliente y servidor.

---

## Comandos de Verificación

```bash
# Chequeo estricto de tipos en el paquete compartido:
npm run typecheck --workspace=@examen-fullstack/shared
```
