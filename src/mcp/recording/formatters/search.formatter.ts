import {
  FormatterFallbackValues,
  FormatterSectionHeaders,
} from '../../../formatters/formatters.constants.js';
import { formatSeconds } from '../../../shared/time.utils.js';
import type { Recording } from '../recording.types.js';

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

export function formatSearchResults(recordings: Recording[]): string {
  if (recordings.length === 0) {
    return `${FormatterSectionHeaders.SearchResults}\n\n${FormatterFallbackValues.NoSearchResults}`;
  }

  const lines: string[] = [FormatterSectionHeaders.SearchResults, ''];

  for (const recording of recordings) {
    lines.push(
      `**Title:** ${recording.displayName ?? FormatterFallbackValues.UntitledMeeting}`,
      `**ID:** ${recording.id}`,
      `**Date:** ${formatDate(recording.createdAt)}`,
      `**Duration:** ${formatDuration(recording.duration)}`,
      '',
    );
  }

  return lines.join('\n');
}
