import {
  FormatterFallbackValues,
  FormatterProviders,
  FormatterSectionHeaders,
} from '../../../formatters/formatters.constants.js';
import { formatSeconds } from '../../../shared/time.utils.js';
import type {
  RecordingMetadata,
  TranscriptionSegment,
} from '../recording.types.js';

function formatDuration(seconds: number | null): string {
  if (seconds === null) return FormatterFallbackValues.EmptyValue;
  return formatSeconds(seconds);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function extractParticipants(
  segments: TranscriptionSegment[] | null | undefined,
): string {
  if (!segments || segments.length === 0)
    return FormatterFallbackValues.UnknownParticipant;
  const ids = [
    ...new Set(
      segments.map((s) => s.speakerId).filter((id): id is string => !!id),
    ),
  ];
  return ids.length > 0
    ? ids.join(', ')
    : FormatterFallbackValues.UnknownParticipant;
}

export function formatMetadata(r: RecordingMetadata): string {
  const participants = extractParticipants(r.transcription?.segments);
  const provider = r.externalBot
    ? FormatterProviders.RecallBot
    : FormatterProviders.DirectUpload;

  return [
    FormatterSectionHeaders.MeetingMetadata,
    `**Title:** ${r.displayName ?? FormatterFallbackValues.UntitledMeeting}`,
    `**Date:** ${formatDate(r.createdAt)}`,
    `**Duration:** ${formatDuration(r.duration)}`,
    `**Provider:** ${provider}`,
    `**Participants:** ${participants}`,
  ].join('\n');
}
