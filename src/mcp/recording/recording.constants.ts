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
  },
} as const;
