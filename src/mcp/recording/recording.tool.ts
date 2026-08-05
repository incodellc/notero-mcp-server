import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { HttpError } from '../../shared/http.errors.js';
import {
  McpErrorMessages,
  McpToolDescriptions,
  McpToolInputKeys,
  McpToolNames,
} from '../mcp.constants.js';
import { formatMetadata } from './formatters/metadata.formatter.js';
import { formatNotes } from './formatters/notes.formatter.js';
import { formatSearchResults } from './formatters/search.formatter.js';
import { formatSummary } from './formatters/summary.formatter.js';
import { formatTranscript } from './formatters/transcript.formatter.js';
import type { RecordingApi } from './recording.api.js';

function toErrorMessage(error: unknown): string {
  return error instanceof HttpError
    ? error.message
    : McpErrorMessages.ResourceNotFound;
}

export function registerRecordingTools(
  server: McpServer,
  recordingApi: RecordingApi,
): void {
  server.registerTool(
    McpToolNames.MeetingMetadata,
    {
      description: McpToolDescriptions.MeetingMetadata,
      inputSchema: { [McpToolInputKeys.MeetingId]: z.string() },
    },
    async (args) => {
      const meetingId = args[McpToolInputKeys.MeetingId];
      try {
        const metadata = await recordingApi.getMetadata(meetingId);
        return {
          content: [{ type: 'text', text: formatMetadata(metadata) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: toErrorMessage(error) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    McpToolNames.MeetingNotes,
    {
      description: McpToolDescriptions.MeetingNotes,
      inputSchema: { [McpToolInputKeys.MeetingId]: z.string() },
    },
    async (args) => {
      const meetingId = args[McpToolInputKeys.MeetingId];
      try {
        const notes = await recordingApi.getNotes(meetingId);
        return {
          content: [{ type: 'text', text: formatNotes(notes) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: toErrorMessage(error) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    McpToolNames.MeetingSummary,
    {
      description: McpToolDescriptions.MeetingSummary,
      inputSchema: { [McpToolInputKeys.MeetingId]: z.string() },
    },
    async (args) => {
      const meetingId = args[McpToolInputKeys.MeetingId];
      try {
        const summary = await recordingApi.getSummary(meetingId);
        return {
          content: [{ type: 'text', text: formatSummary(summary.content) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: toErrorMessage(error) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    McpToolNames.MeetingTranscript,
    {
      description: McpToolDescriptions.MeetingTranscript,
      inputSchema: { [McpToolInputKeys.MeetingId]: z.string() },
    },
    async (args) => {
      const meetingId = args[McpToolInputKeys.MeetingId];
      try {
        const transcript = await recordingApi.getTranscript(meetingId);
        return {
          content: [
            {
              type: 'text',
              text: formatTranscript(transcript.segments, transcript.content),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: toErrorMessage(error) }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    McpToolNames.SearchMeetings,
    {
      description: McpToolDescriptions.SearchMeetings,
      inputSchema: { [McpToolInputKeys.Query]: z.string() },
    },
    async (args) => {
      const query = args[McpToolInputKeys.Query];
      try {
        const recordings = await recordingApi.list(query);
        return {
          content: [{ type: 'text', text: formatSearchResults(recordings) }],
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
