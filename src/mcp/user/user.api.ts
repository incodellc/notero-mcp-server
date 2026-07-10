import type { HttpService } from '../../shared/http.service.js';
import { UserApiPaths } from './user.constants.js';
import type { UserProfile } from './user.types.js';

export class UserApi {
  constructor(private readonly http: HttpService) {}

  getProfile(): Promise<UserProfile> {
    return this.http.get<UserProfile>(UserApiPaths.Profile);
  }
}
