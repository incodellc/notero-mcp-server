import {
  FormatterFallbackValues,
  FormatterSectionHeaders,
} from '../../../formatters/formatters.constants.js';
import type { MeetingNote } from '../recording.types.js';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatAuthorName(author: MeetingNote['author']): string {
  return (
    [author.firstName, author.lastName].filter(Boolean).join(' ') ||
    FormatterFallbackValues.EmptyValue
  );
}

export function formatNotes(notes: MeetingNote[]): string {
  if (notes.length === 0) {
    return `${FormatterSectionHeaders.MeetingNotes}\n\n${FormatterFallbackValues.NoNotes}`;
  }

  const lines: string[] = [FormatterSectionHeaders.MeetingNotes, ''];

  for (const note of notes) {
    lines.push(
      `**${formatAuthorName(note.author)}** *(${formatDate(note.createdAt)})*`,
      note.content,
      '',
    );
  }

  return lines.join('\n');
}
