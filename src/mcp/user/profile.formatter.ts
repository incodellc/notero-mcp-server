import {
  FORMATTER_FALLBACK_VALUES,
  FORMATTER_SECTION_HEADERS,
} from '../../formatters/formatters.constants.js';
import type { UserProfile } from './user.types.js';

export function formatProfile(profile: UserProfile): string {
  const { user, organization } = profile;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    FORMATTER_FALLBACK_VALUES.EMPTY_VALUE;

  return [
    FORMATTER_SECTION_HEADERS.USER_PROFILE,
    `**Name:** ${name}`,
    `**Email:** ${user.email}`,
    `**Role:** ${user.role ?? FORMATTER_FALLBACK_VALUES.EMPTY_VALUE}`,
    `**Title:** ${user.title ?? FORMATTER_FALLBACK_VALUES.EMPTY_VALUE}`,
    `**Organization:** ${organization.name}`,
  ].join('\n');
}
