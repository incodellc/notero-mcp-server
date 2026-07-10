export interface RequestLogContext {
  userHash: string;
  durationMs: number;
  status: 'success' | 'auth_error' | 'error';
  error?: string;
}
