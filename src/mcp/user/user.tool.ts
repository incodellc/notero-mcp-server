import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import {
  McpToolDescriptions,
  McpToolNames,
} from '../mcp.constants.js';
import { toErrorMessage } from '../mcp.errors.js';
import { formatProfile } from './profile.formatter.js';
import type { UserApi } from './user.api.js';

export function registerUserTools(server: McpServer, userApi: UserApi): void {
  server.registerTool(
    McpToolNames.UserProfile,
    {
      description: McpToolDescriptions.UserProfile,
      inputSchema: {},
    },
    async () => {
      try {
        const profile = await userApi.getProfile();
        return {
          content: [{ type: 'text', text: formatProfile(profile) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: toErrorMessage(error) }],
          isError: true,
        };
      }
    },
  );
}
