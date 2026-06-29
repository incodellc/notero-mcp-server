import { env as environment } from '../env.js';
import { RecordingApi } from '../mcp/recording/recording.api.js';
import { UserApi } from '../mcp/user/user.api.js';
import {
  HTTP_BEARER_TOKEN_PREFIX,
  HTTP_HEADERS,
} from '../shared/constants/http.constants.js';
import { MIME_TYPES } from '../shared/constants/mime.constants.js';
import { HttpError } from '../shared/http.errors.js';
import { HttpService } from '../shared/http.service.js';
import {
  AUTHENTICATION_ERROR_STATUSES,
  AUTHENTICATION_OUTBOUND_HEADERS,
} from './authentication.constants.js';
import { AuthenticationError } from './authentication.errors.js';
import type {
  AuthenticatedContext,
  Credentials,
} from './authentication.types.js';

export async function createAuthenticatedContext(
  credentials: Credentials,
): Promise<AuthenticatedContext> {
  const http = new HttpService({
    baseUrl: environment.NOTERO_API_URL,
    headers: {
      [AUTHENTICATION_OUTBOUND_HEADERS.AUTHORIZATION]: `${HTTP_BEARER_TOKEN_PREFIX}${credentials.bearerToken}`,
      [AUTHENTICATION_OUTBOUND_HEADERS.USER_EMAIL]: credentials.email,
      [HTTP_HEADERS.CONTENT_TYPE]: MIME_TYPES.JSON,
    },
  });

  const userApi = new UserApi(http);
  const recordingApi = new RecordingApi(http);

  try {
    const profile = await userApi.getProfile();
    return { userApi, recordingApi, profile, email: credentials.email };
  } catch (error) {
    if (
      error instanceof HttpError &&
      (error.status === AUTHENTICATION_ERROR_STATUSES.UNAUTHORIZED ||
        error.status === AUTHENTICATION_ERROR_STATUSES.FORBIDDEN)
    ) {
      throw new AuthenticationError(error.message);
    }
    throw error;
  }
}
