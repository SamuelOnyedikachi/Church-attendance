export type AuthRole = 'admin' | 'client' | 'volunteer';

export type AuthSession = {
  email: string;
  role: AuthRole;
  authenticatedAt: number;
  expiresAt: number;
};

export const AUTH_COOKIE_NAME = 'churchAttendanceSession';
export const AUTH_SESSION_MAX_AGE = 60 * 60 * 8;

const encoder = new TextEncoder();

function getAuthSecret() {
  return process.env.AUTH_SECRET || 'dev-only-auth-secret-change-me';
}

function toBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

async function importHmacKey(usage: KeyUsage) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getAuthSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

async function signValue(value: string) {
  const key = await importHmacKey('sign');
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verifyValue(value: string, signature: string) {
  const key = await importHmacKey('verify');
  return crypto.subtle.verify('HMAC', key, fromBase64Url(signature), encoder.encode(value));
}

export function normalizeNextRoute(nextRoute?: string | null) {
  if (!nextRoute || !nextRoute.startsWith('/') || nextRoute.startsWith('//')) {
    return '/';
  }

  return nextRoute;
}

export async function createAuthSessionToken(
  session: Omit<AuthSession, 'authenticatedAt' | 'expiresAt'>,
  now = Date.now()
) {
  const payload: AuthSession = {
    ...session,
    authenticatedAt: now,
    expiresAt: now + AUTH_SESSION_MAX_AGE * 1000,
  };
  const encodedPayload = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAuthSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const isValid = await verifyValue(encodedPayload, signature);
  if (!isValid) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(fromBase64Url(encodedPayload)).toString('utf8')) as Partial<AuthSession>;

    if (
      typeof payload.email !== 'string' ||
      (payload.role !== 'admin' &&
        payload.role !== 'client' &&
        payload.role !== 'volunteer') ||
      typeof payload.authenticatedAt !== 'number' ||
      typeof payload.expiresAt !== 'number'
    ) {
      return null;
    }

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return payload as AuthSession;
  } catch {
    return null;
  }
}
