import {
  FORMATTER_FALLBACK_VALUES,
  FORMATTER_PROVIDERS,
  FORMATTER_SECTION_HEADERS,
} from '../../../formatters/formatters.constants.js';
import { formatSeconds } from '../../../shared/time.utils.js';
import type {
  RecordingMetadata,
  TranscriptionSegment,
} from '../recording.types.js';

function formatDuration(seconds: number | null): string {
  if (seconds === null) return FORMATTER_FALLBACK_VALUES.EMPTY_VALUE;
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
    return FORMATTER_FALLBACK_VALUES.UNKNOWN_PARTICIPANT;
  const ids = [
    ...new Set(
      segments.map((s) => s.speakerId).filter((id): id is string => !!id),
    ),
  ];
  return ids.length > 0
    ? ids.join(', ')
    : FORMATTER_FALLBACK_VALUES.UNKNOWN_PARTICIPANT;
}

export function formatMetadata(r: RecordingMetadata): string {
  const participants = extractParticipants(r.transcription?.segments);
  const provider = r.externalBot
    ? FORMATTER_PROVIDERS.RECALL_BOT
    : FORMATTER_PROVIDERS.DIRECT_UPLOAD;

  return [
    FORMATTER_SECTION_HEADERS.MEETING_METADATA,
    `**Title:** ${r.displayName ?? FORMATTER_FALLBACK_VALUES.UNTITLED_MEETING}`,
    `**Date:** ${formatDate(r.createdAt)}`,
    `**Duration:** ${formatDuration(r.duration)}`,
    `**Provider:** ${provider}`,
    `**Participants:** ${participants}`,
  ].join('\n');
}
