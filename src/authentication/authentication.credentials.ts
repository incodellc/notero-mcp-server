import type { FastifyRequest } from 'fastify';

import { HTTP_BEARER_TOKEN_PREFIX } from '../shared/constants/http.constants.js';
import {
  AUTHENTICATION_ERROR_MESSAGES,
  AUTHENTICATION_HEADERS,
  AUTHENTICATION_QUERY_PARAMS,
} from './authentication.constants.js';
import { AuthenticationError } from './authentication.errors.js';
import type { Credentials } from './authentication.types.js';

export function resolveCredentials(request: FastifyRequest): Credentials {
  const authHeader = request.headers[AUTHENTICATION_HEADERS.AUTHORIZATION];
  if (!authHeader?.startsWith(HTTP_BEARER_TOKEN_PREFIX)) {
    throw new AuthenticationError(
      AUTHENTICATION_ERROR_MESSAGES.MISSING_API_KEY,
    );
  }
  const bearerToken = authHeader.slice(HTTP_BEARER_TOKEN_PREFIX.length);

  const headerEmail = request.headers[AUTHENTICATION_HEADERS.USER_EMAIL];
  const queryEmail = (request.query as Record<string, string | undefined>)[
    AUTHENTICATION_QUERY_PARAMS.EMAIL
  ];
  const email =
    (Array.isArray(headerEmail) ? headerEmail[0] : headerEmail) ?? queryEmail;

  if (!email) {
    throw new AuthenticationError(AUTHENTICATION_ERROR_MESSAGES.MISSING_EMAIL);
  }

  return { bearerToken, email };
}
