import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { McpServerInfo } from './mcp.constants.js';
import type { RecordingApi } from './recording/recording.api.js';
import { registerRecordingResource } from './recording/recording.resource.js';
import { registerRecordingTools } from './recording/recording.tool.js';
import type { UserApi } from './user/user.api.js';
import { registerUserResource } from './user/user.resource.js';
import type { UserProfile } from './user/user.types.js';

export function createMcpServer(
  userApi: UserApi,
  recordingApi: RecordingApi,
  userProfile: UserProfile,
): McpServer {
  const server = new McpServer({
    name: McpServerInfo.Name,
    version: McpServerInfo.Version,
  });
  registerUserResource(server, userProfile);
  registerRecordingResource(server, recordingApi);
  registerRecordingTools(server, recordingApi);
  return server;
}
