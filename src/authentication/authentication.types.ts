import type { RecordingApi } from '../mcp/recording/recording.api.js';
import type { UserApi } from '../mcp/user/user.api.js';
import type { UserProfile } from '../mcp/user/user.types.js';

export interface AccessTokenClaims {
  userId: string;
  email: string;
  organizationId: string;
  scopes: string[];
}

export interface AuthenticatedContext {
  userApi: UserApi;
  recordingApi: RecordingApi;
  profile: UserProfile;
  userId: string;
  email: string;
  organizationId: string;
  scopes: string[];
}
