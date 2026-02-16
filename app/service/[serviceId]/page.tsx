'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Id } from '../../../convex/_generated/dataModel';
import Link from 'next/link';

export default function ServiceAttendancePage() {
  const params = useParams();
  const serviceId = params.serviceId as Id<'services'>;

  const addAttendance = useMutation(api.attendance.add);
  const service = useQuery(
    api.services.getService,
    serviceId ? { id: serviceId } : 'skip'
  );

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as 'male' | 'female' | '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !formData.name || !formData.gender) return;

    setIsSubmitting(true);
    try {
      await addAttendance({ ...formData, serviceId });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit attendance', error);
      alert('Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ name: '', gender: 'male', email: '', phone: '' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Welcome!</h2>
          <p className="text-gray-700 text-lg mb-6">
            Thank you for checking in to the service.
          </p>
          <button
            onClick={resetForm}
            className="text-blue-600 hover:underline font-medium"
          >
            Check in another person
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">
            {service ? service.title : 'Service Check-in'}
          </h1>
          <p className="text-blue-100 mt-2">
            {service
              ? new Date(service.date).toDateString()
              : 'Please fill in your details'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              required
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value as 'male' | 'female',
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="+1 234 567 8900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md mt-6 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Check In'}
          </button>
        </form>
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to Admin
        </Link>
      </div>
    </div>
  );
}
