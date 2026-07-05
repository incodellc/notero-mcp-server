export const McpResourceNames = {
  Meetings: 'meetings',
  UserProfile: 'user-profile',
} as const;

export const McpResourceUriTemplates = {
  Meeting: 'notero://meetings/{id}',
  Profile: 'notero://profile',
} as const;

export const McpToolNames = {
  MeetingSummary: 'get_meeting_summary',
  MeetingTranscript: 'get_meeting_transcript',
} as const;

export const McpToolDescriptions = {
  MeetingSummary:
    'Retrieve the AI-generated summary of a meeting recording by its meeting ID, formatted as Markdown.',
  MeetingTranscript:
    'Retrieve the full transcript of a meeting recording by its meeting ID, formatted as Markdown.',
} as const;

export const McpToolInputKeys = {
  MeetingId: 'meetingId',
} as const;

export const MCP_URI_BASE = 'notero://meetings';

export const McpUriVariables = {
  Id: 'id',
} as const;

export const McpRoutes = {
  Endpoint: '/mcp',
} as const;

export const McpServerInfo = {
  Name: 'notero',
  Version: '0.1.0',
} as const;

export const McpJsonRpc = {
  Version: '2.0',
  AuthErrorCode: -32_001,
  InternalErrorCode: -32_603,
} as const;

export const McpLogStatuses = {
  Success: 'success',
  AuthError: 'auth_error',
  Error: 'error',
  UnknownEmail: 'unknown',
} as const;

export const McpErrorMessages = {
  ResourceNotFound: 'Resource not found or access denied.',
} as const;
