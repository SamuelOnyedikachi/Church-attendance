import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIE_NAME,
  verifyAuthSessionToken,
} from '../../../../lib/auth/session';

export async function GET() {
  const cookieStore = await cookies();
  const session = await verifyAuthSessionToken(
    cookieStore.get(AUTH_COOKIE_NAME)?.value
  );

  return NextResponse.json(
    session
      ? {
          authenticated: true,
          email: session.email,
          role: session.role,
        }
      : {
          authenticated: false,
          email: null,
          role: null,
        },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
