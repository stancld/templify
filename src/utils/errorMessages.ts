/**
 * Translates Supabase error codes to user-friendly messages
 */

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'invalid_credentials': 'Invalid email or password',
  'email_not_confirmed': 'Please verify your email address before signing in',
  'user_not_found': 'No account found with this email',
  'email_exists': 'An account with this email already exists',
  'weak_password': 'Password must be at least 6 characters',
  'invalid_email': 'Please enter a valid email address',
  'signup_disabled': 'Sign ups are currently disabled',
  'user_banned': 'This account has been suspended',
  'session_expired': 'Your session has expired. Please sign in again',
  'invalid_grant': 'Invalid or expired reset link',
  'same_password': 'New password must be different from your current password',

  // Rate limiting
  'over_request_rate_limit': 'Too many requests. Please wait a moment and try again',
  'over_email_send_rate_limit': 'Too many emails sent. Please wait before requesting another',

  // Database errors
  'PGRST116': 'Record not found',
  '23505': 'This record already exists',
  '23503': 'Cannot delete: this record is referenced by other data',
  '42501': 'You do not have permission to perform this action',

  // Storage errors
  'storage_quota_exceeded': 'Storage limit reached. Please delete some files',
  'payload_too_large': 'File is too large. Maximum size is 50MB',

  // Network errors
  'fetch_error': 'Unable to connect. Please check your internet connection',
  'network_error': 'Network error. Please try again',
};

/**
 * Extract error code from Supabase error
 */
function extractErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const err = error as Record<string, unknown>;

  // Check various error code locations
  if (typeof err.code === 'string') {
    return err.code;
  }
  if (typeof err.error_code === 'string') {
    return err.error_code;
  }
  if (err.error && typeof err.error === 'object') {
    const innerError = err.error as Record<string, unknown>;
    if (typeof innerError.code === 'string') {
      return innerError.code;
    }
  }

  // Check for PostgreSQL error codes in message
  const message = err.message as string | undefined;
  if (message) {
    const pgMatch = message.match(/PGRST(\d+)/);
    if (pgMatch) {
      return `PGRST${pgMatch[1]}`;
    }

    const sqlMatch = message.match(/^(\d{5}):/);
    if (sqlMatch) {
      return sqlMatch[1];
    }
  }

  return null;
}

/**
 * Convert any error to a user-friendly message
 */
export function getUserFriendlyError(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Try to extract error code and translate
  const code = extractErrorCode(error);
  if (code && SUPABASE_ERROR_MESSAGES[code]) {
    return SUPABASE_ERROR_MESSAGES[code];
  }

  // Handle error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return SUPABASE_ERROR_MESSAGES['fetch_error'];
    }

    // Check for known error patterns in message
    if (error.message.includes('Invalid login credentials')) {
      return SUPABASE_ERROR_MESSAGES['invalid_credentials'];
    }
    if (error.message.includes('Email not confirmed')) {
      return SUPABASE_ERROR_MESSAGES['email_not_confirmed'];
    }
    if (error.message.includes('User already registered')) {
      return SUPABASE_ERROR_MESSAGES['email_exists'];
    }

    // Return the message if it's reasonably short and readable
    if (error.message.length < 100 && !error.message.includes('PGRST')) {
      return error.message;
    }
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error for debugging while returning user-friendly message
 */
export function handleError(error: unknown, context?: string): string {
  const prefix = context ? `[${context}]` : '';
  console.error(prefix, error);
  return getUserFriendlyError(error);
}
