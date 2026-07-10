import type { FastifyInstance } from 'fastify';

import { env as environment } from '../env.js';
import {
  AuthenticationRoutes,
  BearerMethods,
  ProtectedResourceMetadataFields,
  ScopeDelimiter,
} from './authentication.constants.js';

export default async function authenticationController(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.get(AuthenticationRoutes.ProtectedResourceMetadata, async () => ({
    [ProtectedResourceMetadataFields.Resource]: environment.MCP_PUBLIC_URL,
    [ProtectedResourceMetadataFields.AuthorizationServers]: [
      environment.NOTERO_AUTH_ISSUER_URL,
    ],
    [ProtectedResourceMetadataFields.ScopesSupported]:
      environment.MCP_OAUTH_SCOPES.split(ScopeDelimiter).filter(Boolean),
    [ProtectedResourceMetadataFields.BearerMethodsSupported]: [
      BearerMethods.Header,
    ],
  }));
}
