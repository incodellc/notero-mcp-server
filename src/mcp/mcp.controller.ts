import type { FastifyInstance } from 'fastify';

import { AuthenticationError } from '../authentication/authentication.errors.js';
import { authenticationMiddleware } from '../authentication/authentication.middleware.js';
import { HTTP_STATUS } from '../shared/constants/http.constants.js';
import type { RequestLogContext } from '../shared/logger/logger.types.js';
import { hashUserIdentifier } from '../shared/logger/sanitization.utils.js';
import { MCP_JSON_RPC, MCP_LOG_STATUSES, MCP_ROUTES } from './mcp.constants.js';
import { handleMcpRequest } from './mcp.service.js';

export default async function mcpController(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.setErrorHandler(async (error: Error, _request, reply) => {
    const isAuth = error instanceof AuthenticationError;
    await reply
      .code(
        isAuth ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      )
      .send({
        jsonrpc: MCP_JSON_RPC.VERSION,
        id: null,
        error: {
          code: isAuth
            ? MCP_JSON_RPC.AUTH_ERROR_CODE
            : MCP_JSON_RPC.INTERNAL_ERROR_CODE,
          message: error.message,
        },
      });
  });

  fastify.post(MCP_ROUTES.ENDPOINT, async (request, reply) => {
    const startTime = Date.now();
    let userHash: string = MCP_LOG_STATUSES.UNKNOWN_EMAIL;

    try {
      const context = await authenticationMiddleware(request);
      userHash = hashUserIdentifier(context.email);

      reply.hijack();
      await handleMcpRequest(context, request.raw, reply.raw, request.body);

      const logContext: RequestLogContext = {
        userHash,
        durationMs: Date.now() - startTime,
        status: MCP_LOG_STATUSES.SUCCESS,
      };
      request.log.info(logContext, 'MCP request handled');
    } catch (error) {
      const logContext: RequestLogContext = {
        userHash,
        durationMs: Date.now() - startTime,
        status:
          error instanceof AuthenticationError
            ? MCP_LOG_STATUSES.AUTH_ERROR
            : MCP_LOG_STATUSES.ERROR,
        error: error instanceof Error ? error.message : String(error),
      };
      request.log.info(logContext, 'MCP request failed');
      throw error;
    }
  });
}
