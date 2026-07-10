export const FormatterSectionHeaders = {
  MeetingMetadata: '# Meeting Metadata',
  MeetingSummary: '# Meeting Summary',
  MeetingTranscript: '# Meeting Transcript',
  UserProfile: '# User Profile',
} as const;

export const FormatterFallbackValues = {
  UnknownParticipant: 'Unknown',
  UnknownSpeaker: 'Unknown Speaker',
  UntitledMeeting: 'Untitled',
  EmptyValue: '—',
} as const;

export const FormatterProviders = {
  RecallBot: 'Recall Bot',
  DirectUpload: 'Direct Upload',
} as const;
