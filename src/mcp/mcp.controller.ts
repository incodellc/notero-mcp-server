import type { FastifyInstance } from 'fastify';

import { WwwAuthenticate } from '../authentication/authentication.constants.js';
import { AuthenticationError } from '../authentication/authentication.errors.js';
import { authenticationMiddleware } from '../authentication/authentication.middleware.js';
import { buildWwwAuthenticateHeader } from '../authentication/authentication.service.js';
import { HttpStatus } from '../shared/constants/http.constants.js';
import type { RequestLogContext } from '../shared/logger/logger.types.js';
import { hashUserIdentifier } from '../shared/logger/sanitization.utils.js';
import { McpJsonRpc, McpLogStatuses, McpRoutes } from './mcp.constants.js';
import { handleMcpRequest } from './mcp.service.js';

export default async function mcpController(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.setErrorHandler(async (error: Error, _request, reply) => {
    const isAuth = error instanceof AuthenticationError;
    if (isAuth) {
      reply.header(
        WwwAuthenticate.HeaderName,
        buildWwwAuthenticateHeader(error.wwwAuthenticateError),
      );
    }
    await reply
      .code(isAuth ? error.status : HttpStatus.InternalServerError)
      .send({
        jsonrpc: McpJsonRpc.Version,
        id: null,
        error: {
          code: isAuth
            ? McpJsonRpc.AuthErrorCode
            : McpJsonRpc.InternalErrorCode,
          message: error.message,
        },
      });
  });

  fastify.post(McpRoutes.Endpoint, async (request, reply) => {
    const startTime = Date.now();
    let userHash: string = McpLogStatuses.UnknownEmail;

    try {
      const context = await authenticationMiddleware(request);
      userHash = hashUserIdentifier(context.email);

      reply.hijack();
      await handleMcpRequest(context, request.raw, reply.raw, request.body);

      const logContext: RequestLogContext = {
        userHash,
        durationMs: Date.now() - startTime,
        status: McpLogStatuses.Success,
      };
      request.log.info(logContext, 'MCP request handled');
    } catch (error) {
      const logContext: RequestLogContext = {
        userHash,
        durationMs: Date.now() - startTime,
        status:
          error instanceof AuthenticationError
            ? McpLogStatuses.AuthError
            : McpLogStatuses.Error,
        error: error instanceof Error ? error.message : String(error),
      };
      request.log.info(logContext, 'MCP request failed');
      throw error;
    }
  });
}
