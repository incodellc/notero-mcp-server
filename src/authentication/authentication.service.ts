import { createRemoteJWKSet, jwtVerify } from 'jose';

import { env as environment } from '../env.js';
import { RecordingApi } from '../mcp/recording/recording.api.js';
import { UserApi } from '../mcp/user/user.api.js';
import {
  HTTP_BEARER_TOKEN_PREFIX,
  HttpHeaders,
} from '../shared/constants/http.constants.js';
import { MimeTypes } from '../shared/constants/mime.constants.js';
import { HttpService } from '../shared/http.service.js';
import {
  AccessTokenClaimKeys,
  AuthenticationErrorMessages,
  AuthenticationErrorStatuses,
  AuthenticationOutboundHeaders,
  AuthenticationRoutes,
  DerivedJwksPath,
  RequiredScope,
  ScopeDelimiter,
  TokenClockToleranceSeconds,
  WwwAuthenticate,
  WwwAuthenticateErrors,
} from './authentication.constants.js';
import { AuthenticationError } from './authentication.errors.js';
import type {
  AccessTokenClaims,
  AuthenticatedContext,
} from './authentication.types.js';

const jwksUrl =
  environment.NOTERO_JWKS_URL ??
  new URL(DerivedJwksPath, environment.NOTERO_AUTH_ISSUER_URL).href;

const remoteJwks = createRemoteJWKSet(new URL(jwksUrl));

function invalidToken(): AuthenticationError {
  return new AuthenticationError(
    AuthenticationErrorMessages.InvalidToken,
    AuthenticationErrorStatuses.Unauthorized,
    WwwAuthenticateErrors.InvalidToken,
  );
}

export async function verifyAccessToken(
  token: string,
  keySet: typeof remoteJwks = remoteJwks,
): Promise<AccessTokenClaims> {
  let payload: Record<string, unknown>;
  try {
    ({ payload } = await jwtVerify(token, keySet, {
      issuer: environment.NOTERO_AUTH_ISSUER_URL,
      audience: environment.MCP_PUBLIC_URL,
      clockTolerance: TokenClockToleranceSeconds,
    }));
  } catch {
    throw invalidToken();
  }

  const scopes = String(payload[AccessTokenClaimKeys.Scope] ?? '')
    .split(ScopeDelimiter)
    .filter(Boolean);
  if (!scopes.includes(RequiredScope)) {
    throw new AuthenticationError(
      AuthenticationErrorMessages.InsufficientScope,
      AuthenticationErrorStatuses.Forbidden,
      WwwAuthenticateErrors.InsufficientScope,
    );
  }

  const userId = payload.sub;
  const email = payload[AccessTokenClaimKeys.Email];
  const organizationId = payload[AccessTokenClaimKeys.OrganizationId];
  if (
    typeof userId !== 'string' ||
    typeof email !== 'string' ||
    typeof organizationId !== 'string'
  ) {
    throw invalidToken();
  }

  return { userId, email, organizationId, scopes };
}

export async function createAuthenticatedContext(
  claims: AccessTokenClaims,
): Promise<AuthenticatedContext> {
  const http = new HttpService({
    baseUrl: environment.NOTERO_API_URL,
    headers: {
      [AuthenticationOutboundHeaders.ServiceAuthorization]: `${HTTP_BEARER_TOKEN_PREFIX}${environment.NOTERO_SERVICE_TOKEN}`,
      [AuthenticationOutboundHeaders.OrganizationId]: claims.organizationId,
      [AuthenticationOutboundHeaders.UserId]: claims.userId,
      [AuthenticationOutboundHeaders.UserEmail]: claims.email,
      [HttpHeaders.ContentType]: MimeTypes.Json,
    },
  });

  const userApi = new UserApi(http);
  const recordingApi = new RecordingApi(http);
  const profile = await userApi.getProfile();

  return {
    userApi,
    recordingApi,
    profile,
    userId: claims.userId,
    email: claims.email,
    organizationId: claims.organizationId,
    scopes: claims.scopes,
  };
}

export function protectedResourceMetadataUrl(): string {
  return new URL(
    AuthenticationRoutes.ProtectedResourceMetadata,
    environment.MCP_PUBLIC_URL,
  ).href;
}

export function buildWwwAuthenticateHeader(errorCode?: string): string {
  const parts = [
    `${WwwAuthenticate.ResourceMetadataParam}="${protectedResourceMetadataUrl()}"`,
  ];
  if (errorCode) {
    parts.push(`${WwwAuthenticate.ErrorParam}="${errorCode}"`);
  }
  return `${WwwAuthenticate.Scheme} ${parts.join(', ')}`;
}
