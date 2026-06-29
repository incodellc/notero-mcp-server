export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const HTTP_BEARER_TOKEN_PREFIX = 'Bearer ';

export const HTTP_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
} as const;
