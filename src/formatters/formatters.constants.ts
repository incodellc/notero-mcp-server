export const FORMATTER_SECTION_HEADERS = {
  MEETING_METADATA: '# Meeting Metadata',
  MEETING_SUMMARY: '# Meeting Summary',
  MEETING_TRANSCRIPT: '# Meeting Transcript',
  USER_PROFILE: '# User Profile',
} as const;

export const FORMATTER_FALLBACK_VALUES = {
  UNKNOWN_PARTICIPANT: 'Unknown',
  UNKNOWN_SPEAKER: 'Unknown Speaker',
  UNTITLED_MEETING: 'Untitled',
  EMPTY_VALUE: '—',
} as const;

export const FORMATTER_PROVIDERS = {
  RECALL_BOT: 'Recall Bot',
  DIRECT_UPLOAD: 'Direct Upload',
} as const;
