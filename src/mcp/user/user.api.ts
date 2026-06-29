import type { HttpService } from '../../shared/http.service.js';
import { USER_API_PATHS } from './user.constants.js';
import type { UserProfile } from './user.types.js';

export class UserApi {
  constructor(private readonly http: HttpService) {}

  getProfile(): Promise<UserProfile> {
    return this.http.get<UserProfile>(USER_API_PATHS.PROFILE);
  }
}
