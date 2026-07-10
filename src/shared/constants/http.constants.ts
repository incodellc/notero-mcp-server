export const HttpStatus = {
  Ok: 200,
  Unauthorized: 401,
  Forbidden: 403,
  InternalServerError: 500,
} as const;

export const HTTP_BEARER_TOKEN_PREFIX = 'Bearer ';

export const HttpHeaders = {
  ContentType: 'Content-Type',
} as const;
