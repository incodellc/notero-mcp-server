## 1. NestJS — OrganizationApiKey Model & Migration

- [ ] 1.1 Add `OrganizationApiKey` model to `prisma/schema/organization-api-key.prisma` with fields: `id`, `organizationId`, `name` (unique per org), `hashedToken` (unique), `createdAt`, `lastUsedAt?`, `revokedAt?`
- [ ] 1.2 Add `organizationApiKeys` relation to `Organization` model in `organization.prisma`
- [ ] 1.3 Run `pnpm migrate:dev` to generate and apply migration
- [ ] 1.4 Run `pnpm db:generate` to regenerate Prisma client

## 2. NestJS — ApiKeyGuard & Auth Strategy

- [ ] 2.1 Create `apps/server/src/authentication/strategies/api-key.strategy.ts` that hashes the bearer token (SHA-256), looks up `OrganizationApiKey` (non-revoked), and resolves `organizationId`
- [ ] 2.2 Create `apps/server/src/authentication/guards/api-key.guard.ts` that extracts email from `X-User-Email` header (priority) or `?email=` query param (fallback) and validates it against org membership
- [ ] 2.3 Implement all four descriptive error messages for: missing token, invalid/revoked token, missing email, email not in org
- [ ] 2.4 Implement async fire-and-forget `lastUsedAt` update on each successful validation
- [ ] 2.5 Attach `{ organizationId, email }` to request context (decorator) for use by controllers

## 3. NestJS — API Key Management Endpoints

- [ ] 3.1 Create `OrganizationMcpModule` with controller at `apps/server/src/organization/mcp/`
- [ ] 3.2 Implement `POST /organization/mcp/keys` (admin-only): generate cryptographically random token, hash with SHA-256, store, return plaintext token once in response
- [ ] 3.3 Implement `GET /organization/mcp/keys` (admin-only): return all non-revoked keys (`id`, `name`, `createdAt`, `lastUsedAt`), never return `hashedToken`
- [ ] 3.4 Implement `DELETE /organization/mcp/keys/:id` (admin-only): set `revokedAt` = now (soft delete)
- [ ] 3.5 Enforce unique key name per org at application level (HTTP 409 on duplicate)

## 4. NestJS — MCP Config Endpoint

- [ ] 4.1 Implement `GET /organization/mcp/config` (any authenticated org member): return config JSON shape with `hasApiKey` boolean and user's email pre-filled in the `X-User-Email` field

## 5. NestJS — Internal MCP Endpoints

- [ ] 5.1 Create internal controller at `apps/server/src/organization/mcp/internal.controller.ts` protected by `ApiKeyGuard`
- [ ] 5.2 Implement `GET /internal/mcp/recordings` — list all recordings for the resolved org (`id`, `displayName`, `createdAt`, `duration`, `externalBot.type`)
- [ ] 5.3 Implement `GET /internal/mcp/recordings/:id/metadata` — return recording + unique speakerIds from transcript segments
- [ ] 5.4 Implement `GET /internal/mcp/recordings/:id/summary` — return `RecordingSummary` content and status
- [ ] 5.5 Implement `GET /internal/mcp/recordings/:id/transcript` — return `Transcription` segments array and content, with org ownership check
- [ ] 5.6 Implement `GET /internal/mcp/user` — return `User` profile fields + `Organization.name` for the validated email

## 6. MCP Server — Project Setup

- [ ] 6.1 Add dependencies to `mcp-server/package.json`: `@modelcontextprotocol/sdk`, `fastify`, `zod`, and dev dependencies (`typescript`, `tsx`, `@types/node`)
- [ ] 6.2 Configure `tsconfig.json` with strict mode and `dist/` output
- [ ] 6.3 Add `pnpm dev` (tsx watch), `pnpm build` (tsc), `pnpm start` (node dist/) scripts
- [ ] 6.4 Add environment variable validation at startup using Zod: `NOTERO_API_URL`, `PORT`, `LOG_LEVEL`
- [ ] 6.5 Create `src/index.ts` entry point that initialises Fastify, registers MCP transport, and starts the server

## 7. MCP Server — Transport & Server Core

- [ ] 7.1 Create `src/server.ts` — initialise `McpServer` from `@modelcontextprotocol/sdk` with name `notero` and version
- [ ] 7.2 Register Streamable HTTP transport on `POST /mcp` and `GET /mcp` Fastify routes
- [ ] 7.3 Implement `GET /health` route returning `{ status: "ok" }`
- [ ] 7.4 Add structured JSON request logger middleware (emits `orgId`, `email`, `resource`, `durationMs`, `status` per request)

## 8. MCP Server — Auth Middleware

- [ ] 8.1 Create `src/auth/resolve-credentials.ts` — extract bearer token from `Authorization` header and email from `X-User-Email` header or `?email=` query param
- [ ] 8.2 Create `src/auth/validate.ts` — call `GET /internal/mcp/user` on NestJS, forwarding credentials; handle and rethrow descriptive MCP errors on 401/403 responses
- [ ] 8.3 Wire auth middleware into Fastify so every `/mcp` request passes through credential resolution before reaching MCP handlers

## 9. MCP Server — NestJS API Client

- [ ] 9.1 Create `src/api/client.ts` — typed HTTP client wrapping `fetch` calls to NestJS internal endpoints, attaching `Authorization` and `X-User-Email` headers on every call
- [ ] 9.2 Define TypeScript interfaces for all NestJS internal endpoint response shapes

## 10. MCP Server — Markdown Formatters

- [ ] 10.1 Create `src/formatters/metadata.ts` — format recording metadata response into markdown block
- [ ] 10.2 Create `src/formatters/summary.ts` — format summary content into markdown (prefix + content)
- [ ] 10.3 Create `src/formatters/transcript.ts` — merge consecutive same-speaker segments, format as speaker-attributed blocks with timestamps; fall back to plain content when no speakerIds
- [ ] 10.4 Create `src/formatters/profile.ts` — format user profile into markdown block

## 11. MCP Server — Resource Handlers

- [ ] 11.1 Register `resources/list` handler — fetch `/internal/mcp/recordings`, return one `notero://meetings/{id}` resource entry per recording
- [ ] 11.2 Register `resources/read` handler for `notero://meetings/{id}/metadata` — fetch metadata endpoint, run through metadata formatter
- [ ] 11.3 Register `resources/read` handler for `notero://meetings/{id}/summary` — fetch summary endpoint, handle not-ready and failed states with descriptive errors
- [ ] 11.4 Register `resources/read` handler for `notero://meetings/{id}/transcript` — fetch transcript endpoint, run through transcript formatter
- [ ] 11.5 Register `resources/read` handler for `notero://profile` — fetch user endpoint, run through profile formatter

## 12. Frontend — Sidebar & Routing

- [ ] 12.1 Add "MCP Server" item to the Organization sidebar component directly below the Webhooks item, with an appropriate icon
- [ ] 12.2 Apply active highlight state when route is `/organization/mcp`
- [ ] 12.3 Create the page route at `app/organization/mcp/page.tsx` (or equivalent routing structure)

## 13. Frontend — MCP Configuration Page

- [ ] 13.1 Implement page layout: title, description block, setup instructions block (static), config JSON viewer, API key management section
- [ ] 13.2 Fetch config from `GET /organization/mcp/config` and render in the JSON viewer with syntax highlighting and monospace font
- [ ] 13.3 Show placeholder config and "Generate an API key to get started" prompt when `hasApiKey` is false
- [ ] 13.4 Implement copy-to-clipboard button with idle → copied (2s) → idle state cycle and failure state
- [ ] 13.5 Write static setup instructions documenting `X-User-Email` header approach and `?email=` query param fallback, with Claude Desktop as the primary example

## 14. Frontend — Admin API Key Management UI

- [ ] 14.1 Implement key list component: shows `name`, `createdAt`, `lastUsedAt` for each active key (admin-only, hidden for non-admins)
- [ ] 14.2 Implement "Generate API Key" flow: name input → calls `POST /organization/mcp/keys` → shows raw token once in a modal with copy button and "won't be shown again" warning
- [ ] 14.3 Implement "Revoke" action: confirmation dialog → calls `DELETE /organization/mcp/keys/:id` → removes key from list

## 15. Infrastructure & Deployment

- [ ] 15.1 Write `mcp-server/Dockerfile` (multi-stage: build with Node 20, run with slim image)
- [ ] 15.2 Add `mcp-server` service to `server/docker-compose.production.yaml` with `NOTERO_API_URL`, `PORT`, health check on `GET /health`
- [ ] 15.3 Configure nginx upstream for `mcp.notero.ai` → MCP server container
- [ ] 15.4 Provision SSL certificate for `mcp.notero.ai` (wildcard `*.notero.ai` or dedicated cert via Let's Encrypt)
- [ ] 15.5 Add DNS A/CNAME record for `mcp.notero.ai` pointing to the production server
