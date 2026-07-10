import type { FastifyRequest } from 'fastify';

import { HTTP_BEARER_TOKEN_PREFIX } from '../shared/constants/http.constants.js';
import {
  AuthenticationErrorMessages,
  AuthenticationErrorStatuses,
  AuthenticationHeaders,
  WwwAuthenticateErrors,
} from './authentication.constants.js';
import { AuthenticationError } from './authentication.errors.js';

export function extractBearerToken(request: FastifyRequest): string {
  const header = request.headers[AuthenticationHeaders.Authorization];
  const value = Array.isArray(header) ? header[0] : header;

  if (!value?.startsWith(HTTP_BEARER_TOKEN_PREFIX)) {
    throw new AuthenticationError(
      AuthenticationErrorMessages.MissingToken,
      AuthenticationErrorStatuses.Unauthorized,
      WwwAuthenticateErrors.InvalidToken,
    );
  }

  const token = value.slice(HTTP_BEARER_TOKEN_PREFIX.length).trim();
  if (!token) {
    throw new AuthenticationError(
      AuthenticationErrorMessages.MissingToken,
      AuthenticationErrorStatuses.Unauthorized,
      WwwAuthenticateErrors.InvalidToken,
    );
  }

  return token;
}
