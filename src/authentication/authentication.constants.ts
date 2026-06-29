export const AUTHENTICATION_HEADERS = {
  AUTHORIZATION: 'authorization',
  USER_EMAIL: 'x-user-email',
} as const;

export const AUTHENTICATION_OUTBOUND_HEADERS = {
  AUTHORIZATION: 'Authorization',
  USER_EMAIL: 'X-User-Email',
} as const;

export const AUTHENTICATION_QUERY_PARAMS = {
  EMAIL: 'email',
} as const;

export const AUTHENTICATION_ERROR_STATUSES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;

export const AUTHENTICATION_ERROR_MESSAGES = {
  MISSING_API_KEY:
    'Authentication failed: no API key provided. Include your organization API key via Authorization: Bearer <key>',
  MISSING_EMAIL:
    'Authentication failed: email is required for auditing. Provide it via the X-User-Email header or ?email= query parameter.',
} as const;
