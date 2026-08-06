export const FormatterSectionHeaders = {
  MeetingMetadata: '# Meeting Metadata',
  MeetingNotes: '# Meeting Notes',
  MeetingSummary: '# Meeting Summary',
  MeetingTranscript: '# Meeting Transcript',
  Meetings: '# Meetings',
  UserProfile: '# User Profile',
} as const;

export const FormatterFallbackValues = {
  UnknownParticipant: 'Unknown',
  UnknownSpeaker: 'Unknown Speaker',
  UntitledMeeting: 'Untitled',
  EmptyValue: '—',
  NoMeetings: 'No meetings found.',
  NoNotes: 'No notes found for this meeting.',
} as const;

export const FormatterProviders = {
  RecallBot: 'Recall Bot',
  DirectUpload: 'Direct Upload',
} as const;
