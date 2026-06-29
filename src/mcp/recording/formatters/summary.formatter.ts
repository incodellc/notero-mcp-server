import { FORMATTER_SECTION_HEADERS } from '../../../formatters/formatters.constants.js';

export function formatSummary(content: string): string {
  return `${FORMATTER_SECTION_HEADERS.MEETING_SUMMARY}\n\n${content}`;
}
