import type { FastifyRequest } from 'fastify';

import { resolveCredentials } from './authentication.credentials.js';
import { createAuthenticatedContext } from './authentication.service.js';
import type { AuthenticatedContext } from './authentication.types.js';

export async function authenticationMiddleware(
  request: FastifyRequest,
): Promise<AuthenticatedContext> {
  const credentials = resolveCredentials(request);
  return createAuthenticatedContext(credentials);
}
