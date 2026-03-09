'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import Logo from '../../../public/church-bg.png';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import LogoLoader from '../../components/LogoLoader';

export default function ServicePage() {
  const params = useParams();
  const serviceId = params.serviceId as Id<'services'>;
  const service = useQuery(api.services.getService, { id: serviceId });
  const addAttendance = useMutation(api.attendance.addAttendance);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    email: '',
    phone: '',
    firstTimer: '',
    prayerRequest: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!service?.expiresAt) return;

    const updateTimer = () => {
      const remaining = service.expiresAt - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [service?.expiresAt]);

  const isExpired = timeLeft === 0;
  const hours = timeLeft && timeLeft > 0 ? Math.floor(timeLeft / (1000 * 60 * 60)) : 0;
  const minutes =
    timeLeft && timeLeft > 0 ? Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)) : 0;
  const seconds = timeLeft && timeLeft > 0 ? Math.floor((timeLeft % (1000 * 60)) / 1000) : 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.category) {
      toast.error('Please select a category.');
      return;
    }

    if (!formData.firstTimer) {
      toast.error('Please select your first-time status.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addAttendance({
        ...formData,
        firstTimer: formData.firstTimer as 'Yes' | 'No',
        category: formData.category as 'male' | 'female' | 'kids',
        serviceId,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit attendance', error);
      toast.error('There was an error submitting your attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      category: '',
      email: '',
      phone: '',
      firstTimer: '',
      prayerRequest: '',
    });
  };

  if (service === undefined) {
    return <LogoLoader label="Opening Service" containerClassName="min-h-screen" />;
  }

  if (service === null) {
    return <div className="flex min-h-screen items-center justify-center px-6 text-center text-gray-500">Service not found.</div>;
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10 text-center">
        <Link href="/" className="inline-block text-red-600 hover:text-gray-900">
          <Image src={Logo} width={80} height={80} alt="Church Logo" className="mx-auto mb-8" />
        </Link>
        <div className="surface-card w-full max-w-md">
          <h2 className="text-3xl font-bold text-red-800">Welcome To Church!</h2>
          <p className="mt-4 text-lg text-gray-700">Thank you for checking in to the service.</p>
          <button onClick={resetForm} className="btn-secondary mt-6">
            Check in another person
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-center">
        <div className="surface-card w-full max-w-md">
          <h2 className="text-2xl font-bold text-red-700">Check-in Closed</h2>
          <p className="mt-3 text-gray-600">The check-in form for this service has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-xl">
        <div className="bg-red-900 px-6 py-10 text-center sm:px-10">
          <Link href="/" className="inline-block text-red-100 transition hover:text-white">
            <Image src={Logo} width={72} height={72} alt="Church Logo" className="mx-auto mb-5 rounded-full" />
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">Service Check-in</p>
          <h1 className="mt-3 text-3xl font-bold text-white">{service.title}</h1>
          <p className="mt-2 text-sm text-red-100">{new Date(service.date).toDateString()}</p>
          <p className="mt-4 text-base text-gray-100">Welcome! Please fill in your details below.</p>
          {timeLeft != null && (
            <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${isExpired ? 'bg-red-800 text-red-100' : 'bg-green-100 text-green-700'}`}>
              {isExpired ? 'Check-in Closed' : `Form closes in ${hours}h ${minutes}m ${seconds}s`}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <label className="control-label">
            <span className="control-text">Full Name</span>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              className="admin-input"
              placeholder="John Doe"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="control-label">
              <span className="control-text">Category</span>
              <select
                required
                value={formData.category}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    category: event.target.value as 'male' | 'female' | 'kids' | '',
                  })
                }
                className="admin-input"
              >
                <option value="">Select a category</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="kids">Kids</option>
              </select>
            </label>

            <label className="control-label">
              <span className="control-text">First time in church?</span>
              <select
                required
                value={formData.firstTimer}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    firstTimer: event.target.value as 'Yes' | 'No' | '',
                  })
                }
                className="admin-input"
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="control-label">
              <span className="control-text">Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="admin-input"
                placeholder="john@example.com"
              />
            </label>

            <label className="control-label">
              <span className="control-text">Phone</span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                className="admin-input"
                placeholder="+1 234 567 8900"
              />
            </label>
          </div>

          <label className="control-label">
            <span className="control-text">Prayer Request</span>
            <textarea
              value={formData.prayerRequest}
              onChange={(event) => setFormData({ ...formData, prayerRequest: event.target.value })}
              className="admin-textarea min-h-28"
              placeholder="What do you want God to do for you?"
            />
          </label>

          <button type="submit" disabled={isSubmitting || isExpired} className="btn-primary w-full py-3">
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </main>
  );
}
