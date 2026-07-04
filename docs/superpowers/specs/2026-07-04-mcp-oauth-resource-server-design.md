# Design: MCP OAuth — Resource Server

**Date:** 2026-07-04
**Status:** Approved (pending spec review)
**Branch:** feat/na-121/mcp

## Problem

MCP clients report the notero server as **"not authenticated."** The `/mcp` endpoint
today requires a static organization API key (`Authorization: Bearer <key>`) plus a
self-asserted `X-User-Email` header, and returns a bare `401` with no
`WWW-Authenticate` header. Two consequences:

1. MCP clients cannot self-authenticate — the server advertises no OAuth metadata, so
   the client's built-in auth flow has nothing to act on and stays stuck at
   "not authenticated."
2. User attribution is unreliable — the acting user is whatever email the caller puts
   in the header, which anyone holding the org key can forge.

## Goal

1. **Only notero users may connect.**
2. **Every request is attributable to a specific organization and user.**

## Decisions

- **Roles:** MCP server = OAuth 2.0 **Resource Server (RS)**; notero backend =
  **Authorization Server (AS)**.
- **OAuth-only.** Remove the organization API key and `X-User-Email` header scheme
  entirely. There is no headless/non-interactive consumer, so no API-key or
  `client_credentials` path is needed. (Removing the API key also removes the forgeable
  attribution — OAuth token claims become the single source of identity.)
- **Flow:** Authorization Code + PKCE, with Dynamic Client Registration (DCR) so MCP
  clients self-register.
- **Membership gate:** the AS refuses to issue a token unless the authenticated
  identity maps to an existing notero user with an organization. Passing the upstream
  Google login is not sufficient.
- **Token validation:** stateless **JWT verified against the backend's JWKS** — no
  per-request backend call. Access tokens are **short-lived** (recommend 10–15 min) with
  refresh; the refresh grant re-checks membership, so a removed user loses access at
  access-token expiry.
- **Attribution:** taken from verified token claims (`sub`, `email`, `organizationId`),
  not from request headers.

## Scope

This spec covers the **Resource Server (this repo).** The Authorization Server is a
separate effort in `../server` (NestJS); its obligations are captured below as a hard
contract but are not implemented here.

## Changes in this repo (Resource Server)

### Discovery

- New route `GET /.well-known/oauth-protected-resource` returns Protected Resource
  Metadata (RFC 9728):
  ```json
  {
    "resource": "<MCP_PUBLIC_URL>",
    "authorization_servers": ["<NOTERO_AUTH_ISSUER_URL>"],
    "scopes_supported": ["notero:read"],
    "bearer_methods_supported": ["header"]
  }
  ```
  Implemented as a Fastify plugin controller in `authentication/`, registered from
  `index.ts`.

### 401 behavior

- Unauthenticated / invalid-token `/mcp` responses return `401` **with**
  `WWW-Authenticate: Bearer resource_metadata="<MCP_PUBLIC_URL>/.well-known/oauth-protected-resource"`
  (plus `error`/`error_description` on invalid tokens). This is the change that lets
  clients discover how to authenticate. Set in the mcp controller's error handler.

### Token verification (replaces `resolveCredentials`)

1. Extract the bearer token from the `Authorization` header (missing/malformed →
   `AuthenticationError`).
2. Verify the JWT against the backend JWKS using the `jose` library (new dependency;
   `createRemoteJWKSet` handles key caching + rotation).
3. Assert: `iss` == `NOTERO_AUTH_ISSUER_URL`, `aud` == `MCP_PUBLIC_URL`, `exp` valid
   (small clock-skew tolerance), and the required scope is present.
4. Build `AuthenticatedContext` from claims.

Rejecting a wrong `aud` is mandatory — it prevents a token minted for another resource
being replayed here (confused-deputy / token-passthrough protection).

### Token contract (AS ↔ RS interface)

| Claim | RS check |
|---|---|
| `iss` | equals `NOTERO_AUTH_ISSUER_URL` |
| `aud` | equals `MCP_PUBLIC_URL` (rejected otherwise) |
| `exp` / `iat` | valid, short TTL (10–15 min access token) |
| `sub` | notero user id |
| `email` | user email (audit / display) |
| `organizationId` | tenant scope for all downstream calls |
| `scope` | space-delimited; must contain the required scope |

### Downstream calls (RS → backend `/internal/mcp/*`)

**Default (recommended): service credential.** The MCP server authenticates to the
backend with its own service credential (`NOTERO_SERVICE_TOKEN`) and forwards the
verified `organizationId` and user id/email as context. This avoids forwarding the
user's access token to the backend (its audience is the MCP server, not the backend —
that would be token passthrough) and preserves the existing internal-API pattern.
`HttpService` is constructed per request with these headers instead of the old
org-key + email headers.

### Config / new env vars (`src/env.ts`, Zod)

- `MCP_PUBLIC_URL` — canonical resource identifier; used as PRM `resource` and expected `aud`.
- `NOTERO_AUTH_ISSUER_URL` — backend issuer; basis for AS metadata + JWKS discovery.
- `NOTERO_JWKS_URL` — optional explicit JWKS URL (else derived from issuer).
- `MCP_OAUTH_SCOPES` — scopes advertised in PRM.
- `NOTERO_SERVICE_TOKEN` — RS→backend service credential.

### Removed

- Inbound org-key parsing and `X-User-Email` / `?email=` handling.
- `AuthenticationQueryParams`, `MissingApiKey` / `MissingEmail` messages (replaced by
  `MissingToken` / `InvalidToken` / `InsufficientScope`).
- `credentials.bearerToken` + `email` outbound header forwarding of the org key.

## Backend AS contract (separate effort — requirements only)

The `../server` backend must provide:

1. **AS metadata** (`/.well-known/oauth-authorization-server`) and a **JWKS** endpoint.
2. **Authorization Code + PKCE** authorize + token endpoints.
3. **Refresh grant** that **re-checks notero membership** on each refresh.
4. **Dynamic Client Registration** (RFC 7591).
5. **Membership gate:** deny token issuance for identities that are not notero users.
6. **Tokens** carrying the claims in the contract above, audience-bound to
   `MCP_PUBLIC_URL`, short access-token TTL.
7. **Accept the MCP server's service credential** on `/internal/mcp/*`, scoped by the
   forwarded `organizationId` / user context.

## File & naming plan (per CLAUDE.md)

- `authentication/authentication.controller.ts` — **new** Fastify plugin: PRM route.
- `authentication/authentication.credentials.ts` — now extracts the bearer token from
  the request (returns the raw token or throws).
- `authentication/authentication.service.ts` — `verifyAccessToken(token)` (JWKS verify
  + claim checks) and `createAuthenticatedContext(claims)`; module-level cached JWKS set.
- `authentication/authentication.middleware.ts` — orchestrates extract → verify → build
  context (same signature).
- `authentication/authentication.constants.ts` — well-known path, `WWW-Authenticate`
  template, claim names, scope names, PRM field keys.
- `authentication/authentication.types.ts` — `AccessTokenClaims` interface;
  `AuthenticatedContext` gains `organizationId`, `userId`, `scopes`.
- `src/env.ts` — new env vars above.
- `src/mcp/mcp.controller.ts` — add `WWW-Authenticate` header to the 401.
- `package.json` — add `jose`.

## Security considerations

- HTTPS required in production (bearer tokens).
- Reject wrong-audience and expired tokens; small clock-skew tolerance only.
- JWKS cached with automatic refetch on unknown `kid` (via `jose`).
- Never log raw tokens; keep hashing the user identifier for logs (existing
  `hashUserIdentifier`).
- Short access-token TTL is the revocation mechanism (stateless JWT cannot be revoked
  mid-life); membership is re-verified at refresh.

## Verification

No test runner is configured (CLAUDE.md), so verification is:
1. `pnpm build` — compiles, strict mode passes, no orphaned imports from removed auth.
2. Manual: PRM endpoint returns valid JSON; unauthenticated `/mcp` → `401` +
   `WWW-Authenticate`; a valid token reaches a resource; an expired / wrong-`aud` token
   is rejected with `401`.
3. Optional (recommend): a one-off harness verifying `verifyAccessToken` accepts a
   correctly-signed token and rejects bad `iss` / `aud` / `exp` / signature.

## Open decisions (defaulted — flip on review)

- **(a) RS → backend auth:** service credential *(default)* vs. RFC 8693 token exchange.
- **(b) Scopes:** single coarse `notero:read` *(default)* vs. split `recordings:read` /
  `profile:read` now.

## Out of scope

- Implementing the backend Authorization Server (separate `../server` effort).
- API keys / `client_credentials` (no headless consumer).
- A test runner.
- The `get_meeting_summary` / `get_meeting_transcript` tools (separate parked spec:
  `2026-07-04-mcp-summary-transcript-tools-design.md`).
