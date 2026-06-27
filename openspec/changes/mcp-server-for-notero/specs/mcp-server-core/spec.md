## ADDED Requirements

### Requirement: MCP server exposes Streamable HTTP transport
The MCP server SHALL implement the MCP Streamable HTTP transport at `POST /mcp` and `GET /mcp` on the `mcp.notero.ai` subdomain, using the `@modelcontextprotocol/sdk` TypeScript SDK wrapped in a Fastify HTTP server.

#### Scenario: Client connects via Streamable HTTP
- **WHEN** an MCP client sends a valid JSON-RPC request to `POST https://mcp.notero.ai/mcp`
- **THEN** the server processes the request and returns a valid MCP JSON-RPC response

#### Scenario: Client initiates SSE stream
- **WHEN** an MCP client sends `GET https://mcp.notero.ai/mcp` to open a server-sent event stream
- **THEN** the server establishes the stream and sends events as they occur

### Requirement: Server advertises MCP capabilities on initialize
The MCP server SHALL respond to the MCP `initialize` request with its supported capabilities, including the `resources` capability.

#### Scenario: Client sends initialize
- **WHEN** a client sends an MCP `initialize` request
- **THEN** the server responds with server name `notero`, version, and `capabilities: { resources: {} }`

### Requirement: Health endpoint
The MCP server SHALL expose `GET /health` returning HTTP 200 with `{ status: "ok" }` for infrastructure health checks.

#### Scenario: Health check
- **WHEN** a health check request hits `GET /health`
- **THEN** the server returns HTTP 200 with JSON body `{ "status": "ok" }`

### Requirement: Structured request logging
The MCP server SHALL emit a structured log entry for every MCP request containing: `orgId`, `email`, `resource` (URI or method), `durationMs`, `status` (success or error code).

#### Scenario: Successful resource request logged
- **WHEN** a resource request succeeds
- **THEN** a log entry is emitted with `status: "success"` and all required fields

#### Scenario: Auth failure logged
- **WHEN** a request fails authentication
- **THEN** a log entry is emitted with `status: "auth_error"` and the specific failure reason, with no sensitive token data included
