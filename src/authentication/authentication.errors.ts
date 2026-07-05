import { AuthenticationErrorStatuses } from './authentication.constants.js';

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly status: number = AuthenticationErrorStatuses.Unauthorized,
    public readonly wwwAuthenticateError?: string,
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
