import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';

import { FORMATTER_FALLBACK_VALUES } from '../../formatters/formatters.constants.js';
import { MIME_TYPES } from '../../shared/constants/mime.constants.js';
import {
  MCP_ERROR_MESSAGES,
  MCP_RESOURCE_NAMES,
  MCP_RESOURCE_URI_TEMPLATES,
  MCP_URI_BASE,
  MCP_URI_VARIABLES,
} from '../mcp.constants.js';
import { formatMetadata } from './formatters/metadata.formatter.js';
import { formatSummary } from './formatters/summary.formatter.js';
import { formatTranscript } from './formatters/transcript.formatter.js';
import type { RecordingApi } from './recording.api.js';

export function registerRecordingResource(
  server: McpServer,
  recordingApi: RecordingApi,
): void {
  server.registerResource(
    MCP_RESOURCE_NAMES.MEETINGS,
    new ResourceTemplate(MCP_RESOURCE_URI_TEMPLATES.MEETING, {
      list: async () => {
        const recordings = await recordingApi.list();
        return {
          resources: recordings.map((r) => ({
            uri: `${MCP_URI_BASE}/${r.id}`,
            name: r.displayName ?? FORMATTER_FALLBACK_VALUES.UNTITLED_MEETING,
            mimeType: MIME_TYPES.MARKDOWN,
            description: new Date(r.createdAt).toLocaleDateString(),
          })),
        };
      },
    }),
    { mimeType: MIME_TYPES.MARKDOWN },
    async (uri, variables) => {
      const id = String(variables[MCP_URI_VARIABLES.ID]);
      const metadata = await recordingApi.getMetadata(id).catch(() => null);
      if (!metadata) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          MCP_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: MIME_TYPES.MARKDOWN,
            text: formatMetadata(metadata),
          },
        ],
      };
    },
  );

  server.registerResource(
    MCP_RESOURCE_NAMES.MEETING_SUMMARIES,
    new ResourceTemplate(MCP_RESOURCE_URI_TEMPLATES.MEETING_SUMMARY, {
      list: undefined,
    }),
    { mimeType: MIME_TYPES.MARKDOWN },
    async (uri, variables) => {
      const id = String(variables[MCP_URI_VARIABLES.ID]);
      const summary = await recordingApi.getSummary(id).catch(() => null);
      if (!summary) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          MCP_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        );
      }
      if (summary.status === 'PENDING' || summary.status === 'GENERATING') {
        throw new McpError(
          ErrorCode.InvalidRequest,
          MCP_ERROR_MESSAGES.SUMMARY_NOT_READY,
        );
      }
      if (summary.status === 'FAILED') {
        throw new McpError(
          ErrorCode.InvalidRequest,
          MCP_ERROR_MESSAGES.SUMMARY_FAILED,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: MIME_TYPES.MARKDOWN,
            text: formatSummary(summary.content),
          },
        ],
      };
    },
  );

  server.registerResource(
    MCP_RESOURCE_NAMES.MEETING_TRANSCRIPTS,
    new ResourceTemplate(MCP_RESOURCE_URI_TEMPLATES.MEETING_TRANSCRIPT, {
      list: undefined,
    }),
    { mimeType: MIME_TYPES.MARKDOWN },
    async (uri, variables) => {
      const id = String(variables[MCP_URI_VARIABLES.ID]);
      const transcript = await recordingApi.getTranscript(id).catch(() => null);
      if (!transcript) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          MCP_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
        );
      }
      if (transcript.status !== 'COMPLETED') {
        throw new McpError(
          ErrorCode.InvalidRequest,
          MCP_ERROR_MESSAGES.TRANSCRIPT_NOT_READY,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: MIME_TYPES.MARKDOWN,
            text: formatTranscript(transcript.segments, transcript.content),
          },
        ],
      };
    },
  );
}
