import {
  FormatterFallbackValues,
  FormatterSectionHeaders,
} from '../../formatters/formatters.constants.js';
import type { UserProfile } from './user.types.js';

export function formatProfile(profile: UserProfile): string {
  const { user, organization } = profile;
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    FormatterFallbackValues.EmptyValue;

  return [
    FormatterSectionHeaders.UserProfile,
    `**Name:** ${name}`,
    `**Email:** ${user.email}`,
    `**Role:** ${user.role ?? FormatterFallbackValues.EmptyValue}`,
    `**Title:** ${user.title ?? FormatterFallbackValues.EmptyValue}`,
    `**Organization:** ${organization.name}`,
  ].join('\n');
}
