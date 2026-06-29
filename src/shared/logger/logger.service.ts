import pino from 'pino';

import { env as environment } from '../../env.js';

const isDevelopment = environment.NODE_ENV === 'development';

export const logger: pino.Logger = pino({
  level: environment.LOG_LEVEL,
  base: {
    service: 'notero-mcp-server',
    version: '0.1.0',
    env: environment.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-user-email"]',
      '*.bearerToken',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req(request: { method?: string; url?: string }): {
      method: string;
      url: string;
    } {
      return {
        method: request.method ?? 'UNKNOWN',
        url: request.url ?? '/',
      };
    },
    res(reply: { statusCode: number }): { statusCode: number } {
      return { statusCode: reply.statusCode };
    },
    err: pino.stdSerializers.err,
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname,service,env,version',
          messageFormat: '[{service}] {msg}',
        },
      }
    : undefined,
});
