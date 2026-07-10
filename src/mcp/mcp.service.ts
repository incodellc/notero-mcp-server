import type { IncomingMessage, ServerResponse } from 'node:http';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import type { AuthenticatedContext } from '../authentication/authentication.types.js';
import { createMcpServer } from './mcp.server.js';

export async function handleMcpRequest(
  context: AuthenticatedContext,
  rawRequest: IncomingMessage,
  rawResponse: ServerResponse,
  body: unknown,
): Promise<void> {
  const server = createMcpServer(
    context.userApi,
    context.recordingApi,
    context.profile,
  );
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  await transport.handleRequest(rawRequest, rawResponse, body);
}
