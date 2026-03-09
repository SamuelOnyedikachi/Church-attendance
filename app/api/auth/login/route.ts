import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_MAX_AGE,
  createAuthSessionToken,
} from '../../../../lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      role?: 'admin' | 'client';
    };

    const email = body.email?.trim().toLowerCase();
    const role = body.role;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'client') {
      return NextResponse.json(
        { error: 'Invalid role for login.' },
        { status: 400 }
      );
    }

    const token = await createAuthSessionToken({
      email,
      role,
    });
    const redirectTo = role === 'admin' ? '/admin' : '/';

    const response = NextResponse.json({
      authenticated: true,
      email,
      role,
      redirectTo,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Login route error:', error);

    return NextResponse.json(
      { error: 'Login is temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
