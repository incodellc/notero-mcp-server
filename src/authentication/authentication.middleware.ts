import type { FastifyRequest } from 'fastify';

import { extractBearerToken } from './authentication.credentials.js';
import {
  createAuthenticatedContext,
  verifyAccessToken,
} from './authentication.service.js';
import type { AuthenticatedContext } from './authentication.types.js';

export async function authenticationMiddleware(
  request: FastifyRequest,
): Promise<AuthenticatedContext> {
  const token = extractBearerToken(request);
  const claims = await verifyAccessToken(token);
  return createAuthenticatedContext(claims);
}
