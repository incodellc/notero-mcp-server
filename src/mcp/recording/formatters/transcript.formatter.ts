import {
  FormatterFallbackValues,
  FormatterSectionHeaders,
} from '../../../formatters/formatters.constants.js';
import { formatSeconds } from '../../../shared/time.utils.js';
import type { TranscriptionSegment } from '../recording.types.js';

interface MergedBlock {
  speakerId?: string;
  text: string;
  start: number;
  end: number;
}

function mergeConsecutiveSpeakers(
  segments: TranscriptionSegment[],
): MergedBlock[] {
  const merged: MergedBlock[] = [];

  for (const seg of segments) {
    const last = merged.at(-1);
    if (last !== undefined && last.speakerId === seg.speakerId) {
      last.text += ' ' + seg.text;
      last.end = seg.endSecond;
    } else {
      merged.push({
        speakerId: seg.speakerId,
        text: seg.text,
        start: seg.startSecond,
        end: seg.endSecond,
      });
    }
  }

  return merged;
}

export function formatTranscript(
  segments: TranscriptionSegment[] | null | undefined,
  fallbackContent: string,
): string {
  const hasAttribution = segments?.some((s) => s.speakerId);

  if (!hasAttribution || !segments || segments.length === 0) {
    return `${FormatterSectionHeaders.MeetingTranscript}\n\n${fallbackContent}`;
  }

  const merged = mergeConsecutiveSpeakers(segments);
  const lines: string[] = [FormatterSectionHeaders.MeetingTranscript, ''];

  for (const block of merged) {
    const speaker = block.speakerId ?? FormatterFallbackValues.UnknownSpeaker;
    lines.push(
      `**${speaker}** *(${formatSeconds(block.start)} – ${formatSeconds(
        block.end,
      )})*`,
      block.text,
      '',
    );
  }

  return lines.join('\n');
}
