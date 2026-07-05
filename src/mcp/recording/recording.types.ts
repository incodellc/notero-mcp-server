export interface Recording {
  id: string;
  displayName: string | null;
  createdAt: string;
  duration: number | null;
  externalBot: { type: string } | null;
}

export interface TranscriptionSegment {
  startSecond: number;
  endSecond: number;
  text: string;
  speakerId?: string;
}

export interface RecordingMetadata extends Recording {
  transcription: { segments: TranscriptionSegment[] | null } | null;
}

export interface SummaryResult {
  content: string;
}

export interface TranscriptResult {
  content: string;
  segments: TranscriptionSegment[] | null;
}
