export const MCP_RESOURCE_NAMES = {
  MEETINGS: 'meetings',
  MEETING_SUMMARIES: 'meeting-summaries',
  MEETING_TRANSCRIPTS: 'meeting-transcripts',
  USER_PROFILE: 'user-profile',
} as const;

export const MCP_RESOURCE_URI_TEMPLATES = {
  MEETING: 'notero://meetings/{id}',
  MEETING_SUMMARY: 'notero://meetings/{id}/summary',
  MEETING_TRANSCRIPT: 'notero://meetings/{id}/transcript',
  PROFILE: 'notero://profile',
} as const;

export const MCP_URI_BASE = 'notero://meetings';

export const MCP_URI_VARIABLES = {
  ID: 'id',
} as const;

export const MCP_ROUTES = {
  ENDPOINT: '/mcp',
} as const;

export const MCP_SERVER_INFO = {
  NAME: 'notero',
  VERSION: '0.1.0',
} as const;

export const MCP_JSON_RPC = {
  VERSION: '2.0',
  AUTH_ERROR_CODE: -32_001,
  INTERNAL_ERROR_CODE: -32_603,
} as const;

export const MCP_LOG_STATUSES = {
  SUCCESS: 'success',
  AUTH_ERROR: 'auth_error',
  ERROR: 'error',
  UNKNOWN_EMAIL: 'unknown',
} as const;

export const MCP_ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Resource not found or access denied.',
  SUMMARY_NOT_READY: 'Summary is not yet available for this meeting.',
  SUMMARY_FAILED: 'Summary generation failed for this meeting.',
  TRANSCRIPT_NOT_READY: 'Transcript is not yet available for this meeting.',
} as const;
