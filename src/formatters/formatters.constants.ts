export const FormatterSectionHeaders = {
  MeetingMetadata: '# Meeting Metadata',
  MeetingNotes: '# Meeting Notes',
  MeetingSummary: '# Meeting Summary',
  MeetingTranscript: '# Meeting Transcript',
  SearchResults: '# Search Results',
  UserProfile: '# User Profile',
} as const;

export const FormatterFallbackValues = {
  UnknownParticipant: 'Unknown',
  UnknownSpeaker: 'Unknown Speaker',
  UntitledMeeting: 'Untitled',
  EmptyValue: '—',
  NoNotes: 'No notes found for this meeting.',
  NoSearchResults: 'No meetings matched your search.',
} as const;

export const FormatterProviders = {
  RecallBot: 'Recall Bot',
  DirectUpload: 'Direct Upload',
} as const;
