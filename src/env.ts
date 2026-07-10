import { z } from 'zod';

const environmentSchema = z.object({
  NOTERO_API_URL: z.string().url(),
  MCP_PUBLIC_URL: z.string().url(),
  NOTERO_AUTH_ISSUER_URL: z.string().url(),
  NOTERO_JWKS_URL: z.string().url().optional(),
  MCP_OAUTH_SCOPES: z.string().default('notero:read'),
  NOTERO_SERVICE_TOKEN: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = environmentSchema.parse(process.env);
