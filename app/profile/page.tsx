'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConvex } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../convex/_generated/api';
import LogoLoader from '../components/LogoLoader';

type SessionResponse = {
  authenticated: boolean;
  email: string | null;
  role: 'admin' | 'client' | null;
};

type ProfileState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | {
      status: 'ready';
      session: {
        email: string;
        role: 'admin' | 'client';
      };
      user: {
        name: string;
        email: string | null;
        phone?: string | null;
      } | null;
    };

export default function ProfilePage() {
  const router = useRouter();
  const convex = useConvex();
  const [state, setState] = useState<ProfileState>({ status: 'loading' });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Unable to load session.');
        }

        const session = (await response.json()) as SessionResponse;

        if (!session.authenticated || !session.email || !session.role) {
          if (!isMounted) {
            return;
          }
          setState({ status: 'unauthenticated' });
          router.replace('/auth/login');
          return;
        }

        const user = await convex.query(api.users.getByEmailForLogin, {
          email: session.email,
        });

        if (!isMounted) {
          return;
        }

        setState({
          status: 'ready',
          session: {
            email: session.email,
            role: session.role,
          },
          user: user
            ? {
                name: user.name,
                email: user.email ?? session.email,
                phone: 'phone' in user ? user.phone ?? null : null,
              }
            : null,
        });
      } catch {
        if (!isMounted) {
          return;
        }
        toast.error('Unable to load your profile right now.');
        setState({ status: 'unauthenticated' });
        router.replace('/auth/login');
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [convex, router]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      toast.success('You have been logged out.');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Unable to log out right now.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (state.status === 'loading') {
    return <LogoLoader label="Loading Profile" containerClassName="min-h-screen" />;
  }

  if (state.status !== 'ready') {
    return null;
  }

  const displayName = state.user?.name || 'Church Member';
  const displayEmail = state.user?.email || state.session.email;
  const displayPhone = state.user?.phone || 'No phone number added yet.';
  const isAdmin = state.session.role === 'admin';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CM';

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <section className="overflow-hidden rounded-[32px] border border-red-100 bg-white/95 shadow-[0_28px_80px_rgba(127,29,29,0.16)] backdrop-blur-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-700 px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_28%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/15 bg-white/10 text-2xl font-bold tracking-[0.2em] text-white shadow-lg backdrop-blur-sm sm:h-24 sm:w-24 sm:text-3xl">
                  {initials}
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-100/80">
                      User Profile
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      {displayName}
                    </h1>
                    <p className="max-w-2xl text-sm leading-7 text-red-50/85 sm:text-base">
                      Your account overview, contact details, and session controls in one place.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/95">
                      {isAdmin ? 'Admin Account' : 'Member Account'}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/95">
                      Active Session
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
                <article className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-red-100/70">
                    Email
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    {displayEmail}
                  </p>
                </article>
                <article className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-red-100/70">
                    Phone
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                    {displayPhone}
                  </p>
                </article>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
            <article className="rounded-[28px] border border-red-100 bg-gradient-to-b from-white to-red-50/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                Account Summary
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{displayName}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {isAdmin ? 'Administrator' : 'Church Member'}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900 break-all">{displayEmail}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{displayPhone}</p>
                </div>
              </div>
            </article>

            <div className="space-y-5">
              <article className="rounded-[28px] border border-red-100 bg-red-50/70 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                  Session Controls
                </p>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  Use these actions to return to the site, open the admin workspace if your role allows it, or end this session securely.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/" className="btn-secondary">
                    Back Home
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="btn-primary">
                      Open Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="btn-danger"
                  >
                    {isLoggingOut ? 'Logging Out...' : 'Log Out'}
                  </button>
                </div>
              </article>

              <article className="rounded-[28px] border border-gray-200 bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                  Account Access
                </p>
                <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
                  <p>
                    {isAdmin
                      ? 'This account can open the admin dashboard and manage church attendance records.'
                      : 'This account can sign in and use the regular member flow, but it does not have admin dashboard access.'}
                  </p>
                  <p>
                    If any detail here is incorrect, update the user record in the Convex database before using this account for attendance workflows.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
