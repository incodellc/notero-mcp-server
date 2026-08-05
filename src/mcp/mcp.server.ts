import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { McpServerIcons, McpServerInfo } from './mcp.constants.js';
import type { RecordingApi } from './recording/recording.api.js';
import { registerRecordingResource } from './recording/recording.resource.js';
import { registerRecordingTools } from './recording/recording.tool.js';
import type { UserApi } from './user/user.api.js';
import { registerUserResource } from './user/user.resource.js';
import { registerUserTools } from './user/user.tool.js';
import type { UserProfile } from './user/user.types.js';

export function createMcpServer(
  userApi: UserApi,
  recordingApi: RecordingApi,
  userProfile: UserProfile,
): McpServer {
  const server = new McpServer({
    name: McpServerInfo.Name,
    version: McpServerInfo.Version,
    title: McpServerInfo.Title,
    websiteUrl: McpServerInfo.WebsiteUrl,
    icons: [
      {
        src: McpServerIcons.Mark.Src,
        mimeType: McpServerIcons.Mark.MimeType,
        sizes: [...McpServerIcons.Mark.Sizes],
      },
    ],
  });
  registerUserResource(server, userProfile);
  registerUserTools(server, userApi);
  registerRecordingResource(server, recordingApi);
  registerRecordingTools(server, recordingApi);
  return server;
}
