import type { FastifyInstance } from 'fastify';

import { HealthResponse, HealthRoutes } from './health.constants.js';

export default async function healthController(
  fastify: FastifyInstance,
): Promise<void> {
  fastify.get(HealthRoutes.Endpoint, async () => ({
    status: HealthResponse.StatusOk,
  }));
}
