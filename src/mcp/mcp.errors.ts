import { HttpError } from '../shared/http.errors.js';
import { McpErrorMessages } from './mcp.constants.js';

export function toErrorMessage(error: unknown): string {
  return error instanceof HttpError
    ? error.message
    : McpErrorMessages.ResourceNotFound;
}
