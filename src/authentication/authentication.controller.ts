import type { FastifyInstance } from 'fastify';

import { env as environment } from '../env.js';
import {
  AuthenticationRoutes,
  BearerMethods,
  ProtectedResourceMetadataFields,
  ScopeDelimiter,
} from './authentication.constants.js';

function protectedResourceMetadata(): Record<string, unknown> {
  return {
    [ProtectedResourceMetadataFields.Resource]: environment.MCP_PUBLIC_URL,
    [ProtectedResourceMetadataFields.AuthorizationServers]: [
      environment.NOTERO_AUTH_ISSUER_URL,
    ],
    [ProtectedResourceMetadataFields.ScopesSupported]:
      environment.MCP_OAUTH_SCOPES.split(ScopeDelimiter).filter(Boolean),
    [ProtectedResourceMetadataFields.BearerMethodsSupported]: [
      BearerMethods.Header,
    ],
  };
}

export default async function authenticationController(
  fastify: FastifyInstance,
): Promise<void> {
  const handler = async () => protectedResourceMetadata();

  fastify.get(AuthenticationRoutes.ProtectedResourceMetadata, handler);
  fastify.get(AuthenticationRoutes.ProtectedResourceMetadataForMcp, handler);
  fastify.get(AuthenticationRoutes.ProtectedResourceMetadataUnderMcp, handler);
}
