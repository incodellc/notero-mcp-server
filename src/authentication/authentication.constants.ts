export const AuthenticationHeaders = {
  Authorization: 'authorization',
} as const;

export const AuthenticationOutboundHeaders = {
  ServiceAuthorization: 'Authorization',
  OrganizationId: 'X-Organization-Id',
  UserId: 'X-User-Id',
  UserEmail: 'X-User-Email',
} as const;

export const AuthenticationRoutes = {
  ProtectedResourceMetadata: '/.well-known/oauth-protected-resource',
  // RFC 9728 path insertion for resource https://…/mcp — Cursor probes this first.
  ProtectedResourceMetadataForMcp:
    '/.well-known/oauth-protected-resource/mcp',
  ProtectedResourceMetadataUnderMcp:
    '/mcp/.well-known/oauth-protected-resource',
} as const;

export const AuthenticationErrorStatuses = {
  Unauthorized: 401,
  Forbidden: 403,
} as const;

export const WwwAuthenticate = {
  HeaderName: 'WWW-Authenticate',
  Scheme: 'Bearer',
  ResourceMetadataParam: 'resource_metadata',
  ErrorParam: 'error',
} as const;

export const WwwAuthenticateErrors = {
  InvalidToken: 'invalid_token',
  InsufficientScope: 'insufficient_scope',
} as const;

export const AccessTokenClaimKeys = {
  Email: 'email',
  OrganizationId: 'organizationId',
  Scope: 'scope',
} as const;

export const ProtectedResourceMetadataFields = {
  Resource: 'resource',
  AuthorizationServers: 'authorization_servers',
  ScopesSupported: 'scopes_supported',
  BearerMethodsSupported: 'bearer_methods_supported',
} as const;

export const BearerMethods = {
  Header: 'header',
} as const;

export const RequiredScope = 'notero:read';

export const ScopeDelimiter = ' ';

export const DerivedJwksPath = '/.well-known/jwks.json';

export const TokenClockToleranceSeconds = 5;

export const AuthenticationErrorMessages = {
  MissingToken:
    'Authentication failed: no access token provided. Include a valid OAuth access token via Authorization: Bearer <token>.',
  InvalidToken:
    'Authentication failed: the access token is missing, malformed, expired, or not valid for this server.',
  InsufficientScope:
    'Authentication failed: the access token does not grant the scope required for this resource.',
} as const;
