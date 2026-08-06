import {
  FormatterFallbackValues,
  FormatterSectionHeaders,
} from '../../../formatters/formatters.constants.js';
import { formatDate, formatSeconds } from '../../../shared/time.utils.js';
import type { Recording } from '../recording.types.js';

function formatDuration(seconds: number | null): string {
  if (seconds === null) return FormatterFallbackValues.EmptyValue;
  return formatSeconds(seconds);
}

export function formatMeetingList(recordings: Recording[]): string {
  if (recordings.length === 0) {
    return `${FormatterSectionHeaders.Meetings}\n\n${FormatterFallbackValues.NoMeetings}`;
  }

  const lines: string[] = [FormatterSectionHeaders.Meetings, ''];

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
