## Context

Notero is a NestJS + Prisma + PostgreSQL monorepo. The `mcp-server/` package is a new, intentionally thin service whose job is to translate MCP protocol requests into calls against the NestJS API and return formatted markdown responses. The NestJS server (`../server`) is the single source of truth for all data and business logic; the MCP server holds no state and touches no database directly.

The Model Context Protocol (MCP) defines a JSON-RPC 2.0 based protocol for AI clients to discover and read contextual resources from external systems. Clients like Claude Desktop, Cursor, and others can be configured to connect to a remote MCP server over HTTP.

## Goals / Non-Goals

**Goals:**
- Expose Notero meeting data (metadata, summaries, transcripts, user profile) as MCP resources
- Support any MCP client that sends `Authorization: Bearer` and an email credential
- Provide descriptive, actionable error messages that LLMs can relay to users
- Keep the MCP server stateless and thin — all logic lives in NestJS
- Admin-managed org-scoped API keys with per-request user email auditing

**Non-Goals:**
- MCP Tools (write operations) — resources (read-only) only in this phase
- OAuth 2.0 flow — API key auth only
- Multi-org key support — one key maps to exactly one organization
- Direct database access from the MCP server
- Real-time / streaming resource updates

## Decisions

### 1. Standalone service, not a NestJS module

**Decision**: The MCP server is a separate Node.js process (`mcp-server/` repo) deployed at `mcp.notero.ai`, calling NestJS over HTTP.

**Rationale**: The `CLAUDE.md` in `mcp-server/` explicitly scopes this as a separate service. MCP's transport model (Streamable HTTP, long-lived connections) doesn't fit naturally inside NestJS's request/response lifecycle. Independent deployment and scaling are also cleaner.

**Alternative considered**: Add MCP as a NestJS module — rejected because it couples deployment cycles and MCP transport doesn't align with NestJS patterns.

### 2. Streamable HTTP transport (not SSE)

**Decision**: Use MCP Streamable HTTP transport over the legacy SSE transport.

**Rationale**: Streamable HTTP is the current MCP spec recommendation for new servers. It supports both request/response and streaming in one transport, works well with stateless deployments, and is supported by Claude Desktop and other modern clients.

**Alternative considered**: SSE — still works but is the legacy path; new builds should use Streamable HTTP.

### 3. Fastify as the HTTP layer

**Decision**: Use Fastify as the HTTP server wrapping the MCP SDK.

**Rationale**: Lightweight, TypeScript-native, faster than Express, well-suited for a thin adapter service. The MCP SDK provides the protocol layer; Fastify handles HTTP concerns (routing, middleware, logging).

**Alternative considered**: Express — familiar but slower and less type-safe out of the box.

### 4. Two-credential auth: API key + email

**Decision**: Every request requires (a) `Authorization: Bearer <api-key>` and (b) user email via `X-User-Email` header or `?email=` query param.

**Rationale**: The API key identifies the organization (created by admins). The email identifies the individual user for auditing — it is never stored, only validated against org membership and logged per-request. Supporting both header and query param maximizes MCP client compatibility.

**Alternative considered**: Encoding email into the token — rejected because keys are org-scoped (created by admins who don't know which users will connect).

### 5. MCP server calls NestJS internal endpoints

**Decision**: The MCP server authenticates to NestJS by forwarding the bearer token. NestJS exposes a new `ApiKeyGuard` that validates the token and resolves org context. Internal endpoints at `/internal/mcp/*` are protected by this guard and return exactly what the MCP server needs.

**Rationale**: Keeps all data access, business logic, and authorization in NestJS. The MCP server is a pure protocol adapter — it formats responses but makes no authorization decisions.

**Data flow**:
```
MCP Client
  → Authorization: Bearer <api-key>
  → X-User-Email: user@org.com
  ↓
mcp.notero.ai (MCP server, Fastify + MCP SDK)
  → validates email present
  → forwards: GET /internal/mcp/recordings
               Authorization: Bearer <api-key>
               X-User-Email: user@org.com
  ↓
api.notero.ai (NestJS)
  → ApiKeyGuard: validates token → resolves organizationId
  → validates email ∈ org members
  → logs {orgId, email, resource, timestamp}
  → returns data
  ↓
MCP server formats response as markdown → returns MCP resource
```

### 6. OrganizationApiKey model (NestJS/Prisma)

**Decision**: New `OrganizationApiKey` model stores: `id`, `organizationId`, `name`, `hashedToken` (SHA-256, unique), `createdAt`, `lastUsedAt?`, `revokedAt?`.

**Rationale**: Token is hashed at rest (never stored in plaintext). `lastUsedAt` updates on each validated request for audit visibility. `revokedAt` supports soft revocation without deleting records.

### 7. Transcript speaker attribution from segments

**Decision**: Transcript resources are rendered from `Transcription.segments` (JSON array), not `Transcription.content` (plain text blob).

**Rationale**: `content` is a plain concatenated string with no speaker labels. `segments` carries `{ startSecond, endSecond, text, speakerId? }` — the only source of speaker attribution. When `speakerId` is absent on all segments, fall back to rendering `content` as an unlabeled block.

### 8. Error messages as JSON-RPC errors (not HTTP codes)

**Decision**: Auth failures and resource errors return structured JSON-RPC error responses with human-readable `message` fields, not bare HTTP 4xx.

**Rationale**: MCP clients surface the `message` field directly to the LLM, which can then explain the issue to the user. Generic HTTP error codes are invisible to the LLM layer.

## Risks / Trade-offs

- **Custom header support in MCP clients** → The `X-User-Email` header may not be supported by all clients. Mitigated by also accepting `?email=` query param as fallback. If neither works for a given client, the error message explicitly documents both options.

- **NestJS internal endpoint coupling** → The MCP server depends on `/internal/mcp/*` endpoint contracts. Schema changes in NestJS that break these contracts will break the MCP server silently. Mitigated by: typed response DTOs shared via documentation, and a health/version endpoint the MCP server can check.

- **`lastUsedAt` write on every request** → A DB write on every MCP resource fetch adds latency. Mitigated by: async fire-and-forget update (don't block the response), or batch update with a short delay.

- **Participants derived from segments** → There is no dedicated participants table. Participant names come from deduplicating `speakerId` values in transcript segments, which may be raw identifiers (`speaker_0`) rather than real names when Deepgram diarization is used without a participant roster.

## Migration Plan

1. Deploy NestJS changes first (new model, guard, internal endpoints) — no breaking changes to existing routes
2. Deploy MCP server to `mcp.notero.ai` — new subdomain, zero impact on existing traffic
3. Deploy frontend MCP config page — additive, behind new route `/organization/mcp`
4. Update nginx config to add `mcp.notero.ai` upstream
5. No rollback complexity — all changes are purely additive

## Open Questions

- Should `lastUsedAt` be updated synchronously (simpler) or async (lower latency)? Recommend async fire-and-forget.
- Should the MCP server expose a `/health` endpoint for Docker Compose health checks? Yes — simple 200 OK.
- Should API key names be enforced unique per org, or just human-readable labels? Recommend unique per org to avoid confusion.
