import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { MIME_TYPES } from '../../shared/constants/mime.constants.js';
import {
  MCP_RESOURCE_NAMES,
  MCP_RESOURCE_URI_TEMPLATES,
} from '../mcp.constants.js';
import { formatProfile } from './profile.formatter.js';
import type { UserProfile } from './user.types.js';

export function registerUserResource(
  server: McpServer,
  profile: UserProfile,
): void {
  server.registerResource(
    MCP_RESOURCE_NAMES.USER_PROFILE,
    MCP_RESOURCE_URI_TEMPLATES.PROFILE,
    { mimeType: MIME_TYPES.MARKDOWN },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: MIME_TYPES.MARKDOWN,
          text: formatProfile(profile),
        },
      ],
    }),
  );
}
