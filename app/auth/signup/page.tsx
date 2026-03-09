'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../convex/_generated/api';
import { getFriendlyErrorMessage } from '../../lib/friendlyError';

export default function Signup() {
  const router = useRouter();
  const createUser = useMutation(api.users.registerWithEmail);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createUser({
        name,
        email,
        phone,
      });
      toast.success('Account created. You can now log in.');
      router.push('/auth/login');
    } catch (error) {
      toast.error(
        getFriendlyErrorMessage(
          error,
          'Unable to create your account right now. Please try again.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-card w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-500">
            Get Started
          </p>
          <h1 className="mt-2 text-2xl font-bold text-red-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a member record so you can sign in with the same email later.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="admin-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="Phone"
            className="admin-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-red-700 transition hover:text-red-800"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
