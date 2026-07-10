import { FormatterSectionHeaders } from '../../../formatters/formatters.constants.js';

export function formatSummary(content: string): string {
  return `${FormatterSectionHeaders.MeetingSummary}\n\n${content}`;
}
