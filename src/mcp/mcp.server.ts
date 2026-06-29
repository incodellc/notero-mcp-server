import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { MCP_SERVER_INFO } from './mcp.constants.js';
import type { RecordingApi } from './recording/recording.api.js';
import { registerRecordingResource } from './recording/recording.resource.js';
import type { UserApi } from './user/user.api.js';
import { registerUserResource } from './user/user.resource.js';
import type { UserProfile } from './user/user.types.js';

export function createMcpServer(
  userApi: UserApi,
  recordingApi: RecordingApi,
  userProfile: UserProfile,
): McpServer {
  const server = new McpServer({
    name: MCP_SERVER_INFO.NAME,
    version: MCP_SERVER_INFO.VERSION,
  });
  registerUserResource(server, userProfile);
  registerRecordingResource(server, recordingApi);
  return server;
}
