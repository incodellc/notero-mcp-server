export const McpResourceNames = {
  Meetings: 'meetings',
  UserProfile: 'user-profile',
} as const;

export const McpResourceUriTemplates = {
  Meeting: 'notero://meetings/{id}',
  Profile: 'notero://profile',
} as const;

export const McpToolNames = {
  MeetingMetadata: 'get_meeting_metadata',
  MeetingNotes: 'get_meeting_notes',
  MeetingSummary: 'get_meeting_summary',
  MeetingTranscript: 'get_meeting_transcript',
  UserProfile: 'get_user_profile',
  ListMeetings: 'list_meetings',
  SearchMeetings: 'search_meetings',
} as const;

export const McpToolDescriptions = {
  MeetingMetadata:
    'Retrieve metadata for a meeting recording by its meeting ID, formatted as Markdown.',
  MeetingNotes:
    'Retrieve user-authored notes for a meeting recording by its meeting ID, formatted as Markdown.',
  MeetingSummary:
    'Retrieve the AI-generated summary of a meeting recording by its meeting ID, formatted as Markdown.',
  MeetingTranscript:
    'Retrieve the full transcript of a meeting recording by its meeting ID, formatted as Markdown.',
  UserProfile:
    'Retrieve the authenticated user profile and organization, formatted as Markdown.',
  ListMeetings:
    'Browse recent meetings in the organization (newest first). Optional from/to ISO date filters and limit (default 50, max 100). Call with no arguments to list recent meetings and get IDs for follow-up get_* tools. Prefer this over search_meetings when browsing or filtering by date. Formatted as Markdown.',
  SearchMeetings:
    'Search meetings by keyword in title or transcript content. Use list_meetings instead to browse recent meetings or filter by date. Formatted as Markdown.',
} as const;

export const McpToolInputKeys = {
  MeetingId: 'meetingId',
  Query: 'query',
  From: 'from',
  To: 'to',
  Limit: 'limit',
} as const;

export const MCP_URI_BASE = 'notero://meetings';

export const McpUriVariables = {
  Id: 'id',
} as const;

export const McpRoutes = {
  Endpoint: '/',
  LegacyEndpoint: '/mcp',
} as const;

export const McpServerInfo = {
  Name: 'notero',
  Version: '0.1.0',
  Title: 'Notero',
  WebsiteUrl: 'https://notero.ai',
} as const;

export const McpServerIcons = {
  Mark: {
    Src: 'https://notero.ai/images/shell/notero-mark.svg',
    MimeType: 'image/svg+xml',
    Sizes: ['any'],
  },
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
