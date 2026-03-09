'use client';

import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '../public/church-bg.png';
import QRCode from 'react-qr-code';
import Image from 'next/image';
import { toast } from 'react-toastify';
import LogoLoader from './components/LogoLoader';

export default function Home() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const router = useRouter();
  const latestService = services?.[0];
  const [origin, setOrigin] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isOpeningAdmin, setIsOpeningAdmin] = useState(false);
  const [session, setSession] = useState<{
    authenticated: boolean;
    email: string | null;
    role: 'admin' | 'client' | null;
  } | null>(null);
  const profileUser = useQuery(
    api.users.getByEmailForLogin,
    session?.authenticated && session.email ? { email: session.email } : 'skip'
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          authenticated: boolean;
          email: string | null;
          role: 'admin' | 'client' | null;
        };

        if (isMounted) {
          setSession(payload);
        }
      } catch {
        if (isMounted) {
          setSession(null);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update expiration time remaining every second
  useEffect(() => {
    if (!latestService?.expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = latestService.expiresAt - now;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [latestService?.expiresAt]);

  const openAdminDashboard = async () => {
    setIsOpeningAdmin(true);

    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Session lookup failed.');
      }

      const session = (await response.json()) as {
        authenticated: boolean;
        role: 'admin' | 'client' | 'volunteer' | null;
      };

      if (session.authenticated && session.role === 'admin') {
        router.push('/admin');
        return;
      }

      toast.error(
        'Please log in with an admin account to access the dashboard.'
      );
      router.push('/auth/login?next=/admin');
    } catch {
      toast.error('Unable to verify admin access right now.');
    } finally {
      setIsOpeningAdmin(false);
    }
  };

  const profileInitials =
    profileUser?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') ||
    session?.email?.slice(0, 1).toUpperCase() ||
    'P';

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl space-y-8 text-center">
        {session?.authenticated && (
          <div className="flex justify-end">
            <Link
              href="/profile"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-red-900 shadow-sm transition hover:bg-gray-50 sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2.5"
              aria-label="Open profile"
            >
              <span className="sm:hidden">{profileInitials}</span>
              <span className="hidden sm:inline">My Profile</span>
            </Link>
          </div>
        )}
        <Link
          href="/"
          className="inline-block text-red-600 hover:text-gray-900"
        >
          <Image
            src={Logo}
            width={80}
            height={80}
            alt="Church Logo"
            className="mx-auto my-10"
          />
        </Link>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Rythmn 5 Fellowship
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-red-900 sm:text-5xl">
            Church Attendance
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600">
            Make check-in fast for members and easy to manage for your admin
            team.
          </p>
        </div>

        {latestService ? (
          <div className="surface-card flex w-full flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-red-800">
              Scan to Check In
            </h2>
            <p className="text-gray-600 mb-2 font-medium">
              {latestService.title} &bull; {latestService.date}
            </p>
            <p
              className={`text-sm font-semibold mb-6 px-3 py-1 rounded ${
                timeRemaining === 'Expired'
                  ? 'text-red-600 bg-red-100'
                  : 'text-green-600 bg-green-100'
              }`}
            >
              Expires in: {timeRemaining}
            </p>
            <div className="p-4 bg-white border-2 border-gray-900 rounded-lg">
              {origin && (
                <QRCode
                  value={`${origin}/service/${latestService._id}`}
                  size={200}
                />
              )}
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Scan this QR code with your mobile device to fill out the
              attendance form.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={`/service/${latestService._id}`}
                className="btn-primary"
              >
                Open Check-in Form
              </Link>
              <button
                type="button"
                onClick={openAdminDashboard}
                disabled={isOpeningAdmin}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isOpeningAdmin ? 'Checking Access...' : 'Open Admin Dashboard'}
              </button>
            </div>
          </div>
        ) : (
          <div className="surface-card w-full">
            {services === undefined ? (
              <LogoLoader
                label="Loading Service"
                size={88}
                containerClassName="min-h-[220px] px-0"
              />
            ) : (
              <p className="text-gray-500">No upcoming services found.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
