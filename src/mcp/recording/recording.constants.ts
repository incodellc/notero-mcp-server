export const RecordingApiPaths = {
  Base: '/internal/mcp/recordings',
  Suffixes: {
    Metadata: 'metadata',
    Summary: 'summary',
    Transcript: 'transcript',
    Notes: 'notes',
  },
  QueryKeys: {
    Search: 'search',
    From: 'from',
    To: 'to',
    Limit: 'limit',
  },
} as const;

export const RecordingListDefaults = {
  Limit: 50,
  MaxLimit: 100,
} as const;
