import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { FormatterFallbackValues } from '../../formatters/formatters.constants.js';
import { MimeTypes } from '../../shared/constants/mime.constants.js';
import {
  MCP_URI_BASE,
  McpErrorMessages,
  McpResourceNames,
  McpResourceUriTemplates,
  McpUriVariables,
} from '../mcp.constants.js';
import { formatMetadata } from './formatters/metadata.formatter.js';
import type { RecordingApi } from './recording.api.js';

export function registerRecordingResource(
  server: McpServer,
  recordingApi: RecordingApi,
): void {
  server.registerResource(
    McpResourceNames.Meetings,
    new ResourceTemplate(McpResourceUriTemplates.Meeting, {
      list: async () => {
        const recordings = await recordingApi.list();
        return {
          resources: recordings.map((r) => ({
            uri: `${MCP_URI_BASE}/${r.id}`,
            name: r.displayName ?? FormatterFallbackValues.UntitledMeeting,
            mimeType: MimeTypes.Markdown,
            description: new Date(r.createdAt).toLocaleDateString(),
          })),
        };
      },
    }),
    { mimeType: MimeTypes.Markdown },
    async (uri, variables) => {
      const id = String(variables[McpUriVariables.Id]);
      const metadata = await recordingApi.getMetadata(id).catch(() => null);
      if (!metadata) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          McpErrorMessages.ResourceNotFound,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: MimeTypes.Markdown,
            text: formatMetadata(metadata),
          },
        ],
      };
    },
  );
}
