import { z } from 'zod';

const environmentSchema = z.object({
  NOTERO_API_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = environmentSchema.parse(process.env);
