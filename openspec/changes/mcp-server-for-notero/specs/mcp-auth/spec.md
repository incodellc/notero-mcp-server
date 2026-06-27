## ADDED Requirements

### Requirement: API key required on every request
Every MCP request (except `/health`) SHALL require a valid `Authorization: Bearer <api-key>` header. The API key is organization-scoped and must exist in the `OrganizationApiKey` table in a non-revoked state.

#### Scenario: Valid API key accepted
- **WHEN** a request includes `Authorization: Bearer <valid-non-revoked-key>`
- **THEN** the request proceeds to email validation

#### Scenario: Missing API key rejected
- **WHEN** a request has no `Authorization` header
- **THEN** the server returns a JSON-RPC error with message: `"Authentication failed: no API key provided. Include your organization API key via Authorization: Bearer <key>"`

#### Scenario: Invalid API key rejected
- **WHEN** a request includes an `Authorization` header with an unrecognized or revoked token
- **THEN** the server returns a JSON-RPC error with message: `"Authentication failed: the provided API key is invalid or has been revoked."`

### Requirement: User email required on every request
Every MCP request (except `/health`) SHALL require a user email, resolved in priority order: (1) `X-User-Email` header, (2) `?email=` query parameter. The email MUST match an existing `User.email` who is a member of the organization resolved from the API key.

#### Scenario: Email from header accepted
- **WHEN** a request includes a valid `X-User-Email` header with an email belonging to the org
- **THEN** the email is accepted, logged, and the request proceeds

#### Scenario: Email from query parameter accepted
- **WHEN** a request has no `X-User-Email` header but includes `?email=<valid-email>` in the URL
- **THEN** the email is accepted, logged, and the request proceeds

#### Scenario: Header takes priority over query param
- **WHEN** a request includes both `X-User-Email` header and `?email=` query param
- **THEN** the value from the `X-User-Email` header is used

#### Scenario: Missing email rejected
- **WHEN** a request has neither `X-User-Email` header nor `?email=` query param
- **THEN** the server returns a JSON-RPC error with message: `"Authentication failed: email is required for auditing. Provide it via the X-User-Email header or ?email= query parameter."`

#### Scenario: Email not in org rejected
- **WHEN** a request provides an email that does not match any user in the resolved organization
- **THEN** the server returns a JSON-RPC error with message: `"Authentication failed: '<email>' is not a member of this organization."`

### Requirement: Validated email is logged per request
The resolved email and orgId SHALL be included in every request log entry for auditing purposes. The email is never persisted to the database beyond log storage.

#### Scenario: Audit log entry on successful request
- **WHEN** a request passes both API key and email validation
- **THEN** a log entry is emitted containing `orgId`, `email`, `resource`, and `timestamp`

### Requirement: Auth validation delegated to NestJS
The MCP server SHALL forward the bearer token and email to NestJS internal endpoints for validation. The MCP server SHALL NOT make authorization decisions independently — NestJS is the authority.

#### Scenario: MCP server forwards credentials to NestJS
- **WHEN** the MCP server receives a request
- **THEN** it forwards `Authorization: Bearer <token>` and `X-User-Email: <email>` headers to the NestJS internal endpoint, which performs all validation and returns org context or an error
