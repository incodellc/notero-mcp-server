import { HttpError } from './http.errors.js';
import type { HttpServiceConfig } from './http.types.js';

export class HttpService {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(config: HttpServiceConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = config.headers;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers,
    });
    if (!response.ok) {
      const body = (await response
        .json()
        .catch(() => ({ message: response.statusText }))) as {
        message?: string;
      };
      throw new HttpError(body.message ?? response.statusText, response.status);
    }
    return response.json() as Promise<T>;
  }
}
