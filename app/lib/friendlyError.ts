export function getFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : '';

  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes('a user with this email already exists') ||
    normalized.includes('already exists')
  ) {
    return 'This email is already registered. Please log in or use another email.';
  }

  if (
    normalized.includes('unable to process login request') ||
    normalized.includes('convex')
  ) {
    return 'Login is temporarily unavailable. Please try again.';
  }

  if (!rawMessage) {
    return fallback;
  }

  return rawMessage
    .replace(/^uncaught error:\s*/i, '')
    .replace(/^error:\s*/i, '')
    .trim();
}
