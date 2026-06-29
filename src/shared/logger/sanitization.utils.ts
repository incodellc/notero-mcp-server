import { createHash } from 'node:crypto';

export function hashUserIdentifier(email: string): string {
  return createHash('sha256').update(email).digest('hex').slice(0, 12);
}
