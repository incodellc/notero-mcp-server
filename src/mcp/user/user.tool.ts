import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { HttpError } from '../../shared/http.errors.js';
import {
  McpErrorMessages,
  McpToolDescriptions,
  McpToolNames,
} from '../mcp.constants.js';
import { formatProfile } from './profile.formatter.js';
import type { UserApi } from './user.api.js';

function toErrorMessage(error: unknown): string {
  return error instanceof HttpError
    ? error.message
    : McpErrorMessages.ResourceNotFound;
}

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
