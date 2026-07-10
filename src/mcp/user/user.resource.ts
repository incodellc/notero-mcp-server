import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { MimeTypes } from '../../shared/constants/mime.constants.js';
import {
  McpResourceNames,
  McpResourceUriTemplates,
} from '../mcp.constants.js';
import { formatProfile } from './profile.formatter.js';
import type { UserProfile } from './user.types.js';

export function registerUserResource(
  server: McpServer,
  profile: UserProfile,
): void {
  server.registerResource(
    McpResourceNames.UserProfile,
    McpResourceUriTemplates.Profile,
    { mimeType: MimeTypes.Markdown },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: MimeTypes.Markdown,
          text: formatProfile(profile),
        },
      ],
    }),
  );
}
