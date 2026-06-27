## ADDED Requirements

### Requirement: OrganizationApiKey Prisma model
The NestJS backend SHALL define an `OrganizationApiKey` Prisma model with fields: `id` (UUID), `organizationId` (FK to Organization), `name` (String, unique per org), `hashedToken` (String, SHA-256 hash, globally unique), `createdAt` (DateTime), `lastUsedAt` (DateTime, optional), `revokedAt` (DateTime, optional).

#### Scenario: Model created via migration
- **WHEN** Prisma migration runs
- **THEN** the `organization_api_keys` table exists with all required columns and foreign key to `organizations`

#### Scenario: Token uniqueness enforced
- **WHEN** two keys are created with the same raw token value
- **THEN** the database rejects the second insert due to the unique constraint on `hashedToken`

### Requirement: Admin-only API key creation
The NestJS backend SHALL expose `POST /organization/mcp/keys` (admin-only, protected by existing role guard) that accepts `{ name: string }`, generates a cryptographically random token, stores its SHA-256 hash, and returns the plaintext token once (never stored).

#### Scenario: Admin creates key
- **WHEN** an org admin sends `POST /organization/mcp/keys` with `{ "name": "Claude Desktop – John" }`
- **THEN** a new `OrganizationApiKey` record is created, and the response includes the plaintext token in `{ "token": "<raw>", "id": "<id>", "name": "<name>", "createdAt": "..." }` — this is the only time the raw token is returned

#### Scenario: Non-admin cannot create key
- **WHEN** a non-admin org member sends `POST /organization/mcp/keys`
- **THEN** the server returns HTTP 403

#### Scenario: Duplicate name within org rejected
- **WHEN** an admin creates a key with a name already used in the same org
- **THEN** the server returns HTTP 409 with a descriptive error

### Requirement: Admin-only API key listing
The NestJS backend SHALL expose `GET /organization/mcp/keys` (admin-only) returning all non-revoked keys for the org with fields: `id`, `name`, `createdAt`, `lastUsedAt`. The `hashedToken` is never returned.

#### Scenario: List keys
- **WHEN** an admin sends `GET /organization/mcp/keys`
- **THEN** the response contains all active (non-revoked) keys for the org, without token values

### Requirement: Admin-only API key revocation
The NestJS backend SHALL expose `DELETE /organization/mcp/keys/:id` (admin-only) that sets `revokedAt` to the current timestamp (soft delete). Revoked keys are immediately rejected by `ApiKeyGuard`.

#### Scenario: Admin revokes key
- **WHEN** an admin sends `DELETE /organization/mcp/keys/:id`
- **THEN** the key's `revokedAt` is set and subsequent requests using that token are rejected

#### Scenario: Revoked key rejected
- **WHEN** a request uses a revoked API key
- **THEN** `ApiKeyGuard` returns a JSON-RPC error: `"Authentication failed: the provided API key is invalid or has been revoked."`

### Requirement: ApiKeyGuard validates token and email
The NestJS backend SHALL implement `ApiKeyGuard` that: (1) extracts the bearer token, (2) hashes it and looks up the matching non-revoked `OrganizationApiKey`, (3) extracts the email from `X-User-Email` header or `?email=` query param, (4) validates the email belongs to the org, (5) updates `lastUsedAt` asynchronously, (6) attaches `{ organizationId, email }` to the request context.

#### Scenario: Valid credentials pass guard
- **WHEN** a request with valid token and valid org-member email reaches a guarded endpoint
- **THEN** the guard resolves `organizationId` and `email` into request context and allows the request

#### Scenario: Missing email at guard level
- **WHEN** a request reaches the guard with no email credential
- **THEN** the guard throws with the descriptive missing-email message

#### Scenario: lastUsedAt updated asynchronously
- **WHEN** a request passes validation
- **THEN** `lastUsedAt` is updated via a fire-and-forget DB write that does not block the response

### Requirement: MCP config endpoint
The NestJS backend SHALL expose `GET /organization/mcp/config` (authenticated, any org member) that returns the MCP config JSON the frontend displays, with the org's active API key pre-filled if one exists.

Response shape:
```json
{
  "mcpServers": {
    "notero": {
      "url": "https://mcp.notero.ai/mcp",
      "headers": {
        "Authorization": "Bearer <token-placeholder-or-actual>",
        "X-User-Email": "<requesting-user-email>"
      }
    }
  },
  "hasApiKey": true
}
```

#### Scenario: Config returned with key
- **WHEN** an org member requests config and the org has at least one active API key
- **THEN** the response includes `hasApiKey: true` (token itself is not returned here — users copy from creation time)

#### Scenario: Config returned without key
- **WHEN** an org has no active API keys
- **THEN** the response includes `hasApiKey: false` and placeholder values in the config block
