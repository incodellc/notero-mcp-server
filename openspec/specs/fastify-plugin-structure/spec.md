# Spec: Fastify Plugin Structure

## Purpose

Defines requirements for how route handlers are organized in the MCP server. Routes must be encapsulated as Fastify plugins in dedicated controller files, keeping `index.ts` as a pure wiring entry point.

## Requirements

### Requirement: Route handlers are encapsulated as Fastify plugins

Every HTTP route SHALL be defined inside a default-exported async function with the signature `(fastify: FastifyInstance): Promise<void>`. Route handler files MUST use the `.controller.ts` suffix. Routes MUST NOT be registered directly on the root Fastify instance from `index.ts`.

#### Scenario: MCP route is a Fastify plugin

- **WHEN** the server starts
- **THEN** the `/mcp` route MUST be registered via `fastify.register()` from a `mcp.controller.ts` file, not inline in `index.ts`

#### Scenario: Health route is a Fastify plugin

- **WHEN** the server starts
- **THEN** the `/health` route MUST be registered via `fastify.register()` from a `health.controller.ts` file, not inline in `index.ts`

---

### Requirement: index.ts contains only wiring

The `index.ts` entry point SHALL contain only environment validation, Fastify instance creation, `fastify.register()` calls, and `fastify.listen()`. It MUST NOT define route handlers, business logic, or error handling beyond global error handler registration.

#### Scenario: index.ts has no inline route definitions

- **WHEN** `index.ts` is read
- **THEN** it MUST NOT contain any `fastify.get(...)`, `fastify.post(...)`, or equivalent inline route registration calls
