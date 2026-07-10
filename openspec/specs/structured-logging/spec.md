# Spec: Structured Logging

## Purpose

Defines requirements for structured, privacy-safe JSON logging across the MCP server. All log output must be compatible with Grafana/Loki ingestion while ensuring sensitive data (user emails, auth credentials, meeting content) is never written to logs.

## Requirements

### Requirement: Log output is structured JSON compatible with Grafana/Loki

Every log line emitted by the server SHALL be a single-line JSON object. Each line MUST include the fields `level`, `time`, `service`, `env`, `version`, and `msg`.

#### Scenario: Base labels present on every log line

- **WHEN** the server emits any log line
- **THEN** the line MUST contain `service: "notero-mcp-server"`, `env` matching the `NODE_ENV` environment variable, and `version` matching the package version

#### Scenario: Timestamps are ISO8601

- **WHEN** the server emits any log line
- **THEN** the `time` field MUST be a valid ISO8601 string (e.g. `"2026-06-27T10:30:00.000Z"`), not a Unix epoch integer

---

### Requirement: User email is never logged in plaintext

The server SHALL NOT write a user's raw email address to any log line. In its place, the server MUST log a `userHash` field computed as the first 12 hex characters of the SHA-256 hash of the email.

#### Scenario: MCP request log contains userHash, not email

- **WHEN** an MCP request is handled successfully
- **THEN** the resulting log line MUST contain a `userHash` field and MUST NOT contain an `email` field with the real email address

#### Scenario: Same email always produces the same userHash

- **WHEN** two requests arrive from the same email address
- **THEN** both log lines MUST contain identical `userHash` values

---

### Requirement: Authorization credentials are redacted from all log output

The server SHALL redact the `Authorization` header, the `x-user-email` header, and any field named `bearerToken` or `token` before writing log output. Redacted values MUST be replaced with the string `"[REDACTED]"`.

#### Scenario: Authorization header does not appear in request logs

- **WHEN** Fastify logs an incoming request
- **THEN** the `authorization` header value MUST appear as `"[REDACTED]"` or be absent entirely

#### Scenario: Bearer token field is redacted if present

- **WHEN** a log object contains a field named `bearerToken`
- **THEN** that field's value MUST appear as `"[REDACTED]"` in the emitted log line

---

### Requirement: Request logs contain only method and URL

The server's request serializer SHALL emit only `{ method, url }` for each request. Headers, query parameters, and request body MUST NOT appear in request log output.

#### Scenario: Request log has no headers

- **WHEN** Fastify logs an incoming request
- **THEN** the log line MUST NOT contain a `headers` field

#### Scenario: Request log has no body

- **WHEN** Fastify logs an incoming request with a JSON body
- **THEN** the log line MUST NOT contain a `body` field

---

### Requirement: Meeting content, organization names, and user display names are never logged

The server SHALL NOT log meeting transcript content, meeting summary content, meeting metadata titles, organization names, or user display names in any log line.

#### Scenario: MCP handler does not log resource content

- **WHEN** a meeting resource is fetched and returned
- **THEN** no log line for that request MUST contain transcript text, summary text, or participant names

---

### Requirement: Error log lines include the full error message

When a request fails, the server SHALL log the error with the full `message` field from the caught Error object, plus a stack trace via `pino.stdSerializers.err`.

#### Scenario: Auth error is logged with message

- **WHEN** an `AuthError` is thrown during request handling
- **THEN** the log line MUST contain `status: "auth_error"` and the `error` field MUST contain the full error message string

#### Scenario: Generic error is logged with message

- **WHEN** an unexpected Error is thrown during request handling
- **THEN** the log line MUST contain `status: "error"` and the `error` field MUST contain the full error message string

---

### Requirement: Development environment emits colorized human-readable output

In development mode the server SHALL use a pretty-print transport so log lines are colorized and human-readable instead of raw JSON. The production JSON format MUST remain unchanged.

#### Scenario: Colorized output in development

- **WHEN** `NODE_ENV` is `"development"`
- **THEN** each log line MUST be colorized with a human-readable timestamp (e.g. `HH:MM:ss.l`), a bracketed service prefix, and level highlighted by color

#### Scenario: JSON output in production

- **WHEN** `NODE_ENV` is `"production"`
- **THEN** each log line MUST be a single-line JSON object with no colorization or pretty-printing

---

### Requirement: NODE_ENV is validated at startup

The server SHALL validate that `NODE_ENV` is one of `"development"`, `"production"`, or `"test"` at startup via Zod. If the value is absent or invalid, the process MUST exit with a non-zero code before accepting any requests.

#### Scenario: Valid NODE_ENV starts the server

- **WHEN** `NODE_ENV` is set to `"production"`
- **THEN** the server MUST start successfully

#### Scenario: Invalid NODE_ENV aborts startup

- **WHEN** `NODE_ENV` is set to an unrecognised value such as `"prod"`
- **THEN** the process MUST exit before the Fastify server begins listening
