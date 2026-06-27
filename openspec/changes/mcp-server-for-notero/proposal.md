## Why

Notero users want to bring their meeting intelligence into AI workflows — asking Claude questions about past interviews, generating follow-ups, or analyzing patterns across meetings. Without an MCP server, this requires manual copy-paste. A first-class MCP integration makes Notero's meeting data natively accessible to any MCP-compatible AI client (Claude Desktop, Cursor, etc.).

## What Changes

- **New standalone MCP server** (`mcp-server/` repo) deployed at `mcp.notero.ai` exposing Notero meeting data via the Model Context Protocol (Streamable HTTP transport)
- **New `OrganizationApiKey` model** in the NestJS backend for org-scoped, admin-managed API keys
- **New `ApiKeyGuard`** in NestJS to validate API key + user email on incoming requests
- **New internal read-only endpoints** in NestJS that the MCP server calls to fetch meeting data
- **New API key management endpoints** in NestJS (admin-only: create, list, revoke)
- **New `GET /organization/mcp/config` endpoint** returning dynamic config JSON for the frontend
- **New MCP configuration page** in the frontend at `/organization/mcp` with setup instructions, config JSON viewer, and API key management UI
- **New sidebar item** in the Organization section (under Webhooks) linking to the MCP page

## Capabilities

### New Capabilities

- `mcp-server-core`: Standalone MCP server — Streamable HTTP transport, request lifecycle, error handling, structured logging
- `mcp-auth`: Two-credential auth — API key (Bearer token) + user email (header or query param), validated against org membership on every request, with descriptive JSON-RPC error messages
- `mcp-resources`: Four MCP resource providers — meeting metadata, meeting summary, meeting transcript (speaker-attributed), user profile — each formatted as markdown
- `org-api-key-management`: Backend API key lifecycle — `OrganizationApiKey` model, create/list/revoke endpoints (admin-only), `ApiKeyGuard`
- `mcp-config-page`: Frontend MCP configuration page — setup instructions, dynamic config JSON viewer, copy-to-clipboard, API key management UI

### Modified Capabilities

## Impact

- **New repo**: `mcp-server/` — TypeScript, `@modelcontextprotocol/sdk`, Fastify (or Express), deployed to `mcp.notero.ai`
- **NestJS backend**: new Prisma model (`OrganizationApiKey`), new migration, new guard, new controller/endpoints under `/organization/mcp/` and `/internal/mcp/`
- **Frontend**: new page, new sidebar nav item, new API key management components
- **Infrastructure**: new subdomain `mcp.notero.ai`, SSL cert (wildcard or dedicated), new Docker Compose service, nginx upstream
- **No breaking changes** to existing API or frontend routes
