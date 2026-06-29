# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is the **MCP server** for Notero (repo dir `interview-manager/mcp-server`) — a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes interview-manager capabilities to AI agents and IDEs. It connects to the NestJS backend (`../server`) via HTTP.

The broader monorepo layout:
- `../client` — Next.js App Router frontend
- `../server` — NestJS backend (apps/server, apps/assistant, apps/infrastructure)
- `../mcp-server` — this package (MCP server)

## Commands

Package manager is **pnpm** (`pnpm@10.6.3`). Use it, not npm/yarn.

```bash
pnpm install    # install dependencies
pnpm build      # compile TypeScript to dist/
pnpm dev        # development with tsx watch
pnpm start      # run compiled output
```

No test runner or lint is configured yet — do not assume those scripts work until added.

## Architecture

- **Runtime**: Node.js ESM (`"type": "module"`)
- **Language**: TypeScript strict mode, explicit return types on all exported functions
- **Transport**: MCP Streamable HTTP via `@modelcontextprotocol/sdk`
- **HTTP layer**: Fastify 5
- **Env validation**: Zod at startup (`src/env.ts`)
- **Build output**: `dist/` (gitignored)

The backend API (`../server`) uses REST over HTTP (NestJS), JWT + cookie-based auth, and is multi-tenant (all resources scoped to `organizationId`).

---

## Style Guides

> **Rule for AI agents**: If a situation arises that is not covered by these guides, or that seems to contradict them, **do not guess or invent a convention — ask the user to update this file first**. These guides are the source of truth; all new patterns must be explicitly agreed and recorded here before being applied.

### Naming

- **No abbreviations or short names in identifiers, files, or directories.**
  - `authentication` not `auth`
  - `credentials` not `creds`
  - `organization` not `org`
  - `configuration` not `config` (as a directory/module name)
  - `formatters` is acceptable (full word)
- Variable and parameter names follow the same rule: prefer clarity over brevity.

### File naming

Every file must carry a descriptive **domain suffix** that describes its role:

| Role | Suffix | Example |
|---|---|---|
| HTTP route handler (Fastify plugin) | `.controller.ts` | `mcp.controller.ts` |
| Fastify middleware / request hook | `.middleware.ts` | `authentication.middleware.ts` |
| Business logic | `.service.ts` | `authentication.service.ts` |
| Domain HTTP client | `.api.ts` | `recording.api.ts` |
| Data access | `.repository.ts` | `recording.repository.ts` |
| MCP resource | `.resource.ts` | `recording.resource.ts` |
| Markdown formatter | `.formatter.ts` | `transcript.formatter.ts` |
| Type definitions | `.types.ts` | `recording.types.ts` |
| Errors | `.errors.ts` | `authentication.errors.ts` |
| Constants | `.constants.ts` | `mcp.constants.ts` |
| Utilities | `.utils.ts` | `time.utils.ts` |
| Environment | `env.ts` | `env.ts` (singleton, no suffix needed) |

Entry points (`index.ts`) and top-level singletons are exempt from the suffix rule.

**Types and constants must live in their own dedicated files.** Never inline exported types or constants in service, client, or controller files. If a type or constant is used by more than one file, or is part of a module's public surface, it belongs in a `*.types.ts` or `*.constants.ts` file in the same domain directory.

- `ApiCredentials` → `api/api.types.ts`, not inside `api.client.ts`
- MCP URI scheme strings → `mcp/mcp.constants.ts`, not hardcoded in resource files

### Directory structure

Source code lives under `src/` with a **domain-first structure**:

```
src/
  authentication/                   # credential extraction and validation
    authentication.constants.ts
    authentication.credentials.ts
    authentication.errors.ts
    authentication.middleware.ts
    authentication.service.ts
    authentication.types.ts
  mcp/                              # MCP server, transport, and domain resources
    user/
      user.api.ts
      user.constants.ts
      user.resource.ts
      user.types.ts
      profile.formatter.ts          # single formatter — no subdirectory
    recording/
      formatters/                   # >1 formatter → grouped into subdirectory
        metadata.formatter.ts
        summary.formatter.ts
        transcript.formatter.ts
      recording.api.ts
      recording.constants.ts
      recording.resource.ts
      recording.types.ts
    mcp.constants.ts
    mcp.controller.ts
    mcp.server.ts
    mcp.service.ts
  shared/                           # reusable utilities with no domain dependency
    constants/                      # >1 constants file → grouped into subdirectory
      http.constants.ts
      mime.constants.ts
    logger/
    http.errors.ts
    http.service.ts
    http.types.ts
    time.utils.ts
  formatters/                       # shared formatter constants
    formatters.constants.ts
  health/
    health.constants.ts
    health.controller.ts
  env.ts                            # environment variable validation (Zod)
  index.ts                          # entry point — wires Fastify + MCP + env
```

**Subdirectory grouping rule**: when a directory contains more than one file sharing the same suffix, group them into a subdirectory named after that suffix (pluralised). A single file with a given suffix stays at the directory level; a second file of the same kind triggers the grouping.

- `recording/` has three `.formatter.ts` files → they live in `recording/formatters/`
- `shared/` has two `.constants.ts` files → they live in `shared/constants/`
- `user/` has one `.formatter.ts` file → it stays at `user/` level

### `src/shared/`

Anything used by more than one domain module and carrying no domain-specific dependency belongs in `src/shared/`. Examples: time formatting, string utilities, generic markdown helpers. Domain logic (API calls, auth rules, resource schemas) does not belong here even if reused.

### Fastify plugins

All route handlers must be encapsulated as **Fastify plugins** — never register routes directly on the root `fastify` instance from `index.ts`. Each controller file exports a default `async function` with signature `(fastify: FastifyInstance): Promise<void>` and is registered via `fastify.register()`.

```typescript
// src/mcp/mcp.controller.ts
import type { FastifyInstance } from 'fastify';

export default async function mcpController(fastify: FastifyInstance): Promise<void> {
  fastify.post('/mcp', async (request, reply) => { ... });
}

// src/index.ts
import mcpController from './mcp/mcp.controller.js';
fastify.register(mcpController);
```

Plugin encapsulation rules:
- Each domain directory that exposes HTTP routes has exactly one `.controller.ts` file
- Shared hooks or decorators that apply to a subset of routes are registered inside the plugin that owns them, not on the root instance
- `index.ts` only calls `fastify.register()` and `fastify.listen()` — it contains no route definitions

### No literal strings or numbers

Every string and number that carries domain meaning must be defined in a `*.constants.ts` file — never inlined in logic files. This applies to:

- Route paths (`'/mcp'`, `'/health'`)
- HTTP status codes (`401`, `500`)
- HTTP header names (`'Authorization'`, `'X-User-Email'`)
- HTTP scheme prefixes (`'Bearer '`)
- MIME types (`'text/markdown'`, `'application/json'`)
- API endpoint paths (`'/internal/mcp/recordings'`)
- Protocol-specific codes (JSON-RPC error codes `-32001`, `-32603`)
- Log status strings (`'success'`, `'auth_error'`)
- Error message strings
- Display / fallback strings (`'Unknown'`, `'Untitled'`, `'—'`)
- Server name and version (`'notero'`, `'0.1.0'`)

**Exceptions** — leave these as inline literals:
- Intl API values: locale strings (`'en-US'`), format option strings (`'numeric'`, `'long'`) — these are typed API enumerations, not domain values
- TypeScript discriminant literals inside `switch`/`if` type narrowing that directly match a union type member

### Imports

- Always use `.js` extensions on relative imports (required for NodeNext ESM):
  ```typescript
  import { env } from './env.js';
  import { formatTranscript } from '../formatters/transcript.formatter.js';
  ```
- Import types with `import type` when the import is type-only.

### TypeScript

- Strict mode is on — no `any`, no non-null assertions (`!`) without a comment explaining why.
- All exported functions have explicit return types.
- Prefer `interface` over `type` for object shapes.
