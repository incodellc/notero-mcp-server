import Fastify from 'fastify';

import authenticationController from './authentication/authentication.controller.js';
import { env as environment } from './env.js';
import healthController from './health/health.controller.js';
import mcpController from './mcp/mcp.controller.js';
import { logger } from './shared/logger/logger.service.js';

const fastify = Fastify({ loggerInstance: logger });

fastify.register(healthController);
fastify.register(authenticationController);
fastify.register(mcpController);

await fastify.listen({ port: environment.PORT });
fastify.log.info(`Notero MCP server listening on port ${environment.PORT}`);
