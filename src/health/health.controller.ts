import type { FastifyInstance } from 'fastify';

import { HEALTH_RESPONSE, HEALTH_ROUTES } from './health.constants.js';

export default async function healthController(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.get(HEALTH_ROUTES.ENDPOINT, async () => ({
    status: HEALTH_RESPONSE.STATUS_OK,
  }));
}
