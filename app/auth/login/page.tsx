'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConvex } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../convex/_generated/api';

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const convex = useConvex();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const attemptedAdminRoute = searchParams.get('next') === '/admin';
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await convex.query(api.users.getByEmailForLogin, {
        email: normalizedEmail,
      });

      if (!user) {
        toast.error('No account found with that email. Please sign up first.');
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: user.email,
          role: user.role,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        redirectTo?: string;
        role?: 'admin' | 'client';
      };

      if (!response.ok || !result.redirectTo || !result.role) {
        toast.error(result.error || 'Login failed.');
        return;
      }

      toast.success('User found. Signing you in.');

      if (result.role !== 'admin' && attemptedAdminRoute) {
        toast.error('Only admins can access the admin dashboard.');
      }

      router.push(result.redirectTo);
    } catch {
      toast.error('Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-card w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Welcome Back
          </p>
          <h1 className="mt-2 text-2xl font-bold text-red-900">Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the church attendance admin workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="admin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Enter the email already registered in your church records.
        </p>

        <div className="mt-5 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-semibold text-red-700 transition hover:text-red-800"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
