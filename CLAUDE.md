# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is the **MCP server** for Notero (repo dir `interview-manager/mcp-server`) — a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes interview-manager capabilities to AI agents and IDEs. It will connect to the NestJS backend (`../server`) via HTTP/WebSocket.

The broader monorepo layout:
- `../client` — Next.js App Router frontend
- `../server` — NestJS backend (apps/server, apps/assistant, apps/infrastructure)
- `../mcp-server` — this package (MCP server, early stage)

## Commands

Package manager is **pnpm** (`pnpm@10.6.3`). Use it, not npm/yarn.

```bash
pnpm install       # install dependencies
pnpm build         # compile (set up in package.json scripts when ready)
pnpm dev           # development with watch (set up when ready)
pnpm test          # run tests (not yet configured)
pnpm lint          # lint (not yet configured)
```

No test runner or lint is configured yet — do not assume those scripts work until added.

## Architecture (planned)

This package is intentionally empty at project start. When implementing, follow the conventions of the sibling `server` project:

- **TypeScript** — strict mode, explicit return types on non-React functions
- **Entry point** is `index.js` / `index.ts` (per `package.json`)
- **Build output** goes to `dist/` (already in `.gitignore`)
- **Env vars** should be validated at startup (Zod recommended, matching the server pattern)

The backend API (`../server`) uses:
- REST over HTTP (NestJS, port 3000)
- WebSockets (socket.io)
- JWT + cookie-based auth
- Multi-tenant: all resources are scoped to an `organizationId`
