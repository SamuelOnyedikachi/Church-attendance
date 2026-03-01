'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../../../public/church-bg.png';
import { toast } from 'react-toastify';

export default function ServicePage() {
  const params = useParams();
  const serviceId = params.serviceId as Id<'services'>;
  const service = useQuery(api.services.getService, { id: serviceId });
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const addAttendance = useMutation(api.attendance.addAttendance);

  useEffect(() => {
    if (!service?.expiresAt) return;

    const updateTimeLeft = () => {
      const interval = service.expiresAt - Date.now();
      setTimeLeft(interval > 0 ? interval : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
    }, [service?.expiresAt]);
  }

  const isExpired = timeLeft === 0;
  const minites =
  timeLeft && timeLeft > 0
  ? Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  : 0;
  const seconds =
  timeLeft && timeLeft > 0
  ? Math.floor((timeLeft % (1000 * 60)) / 1000)
  : 0;

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please select a category.');
      return;
    }
    if (!formData.firstTimer) {
      toast.error('Please select Status');
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
      toast.error(
        'There was an error submitting your attendance. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (service === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading service details...
      </div>
    );
  }

  if (service === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Service not found.
      </div>
    );
  }

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      category: 'male',
      email: '',
      phone: '',
      firstTimer: '',
      prayerRequest: '',
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        {/* <div
          className="absolute inset-0 opacity-4 -z-30 bg-cover bg-center"
          style={{ backgroundImage: "url('/church-bg.png')" }}
        /> */}

        <Link href="/" className="text-red-600 hover:text-gray-900">
          <Image
            src={Logo}
            width={80}
            height={80}
            alt="Church Logo"
            className="mx-auto my-10"
          />
        </Link>
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-bold text-red-800 mb-4">Welcome To Church!</h2>
          <p className="text-gray-700 text-lg mb-6">
            Thank you for checking in to the service.
          </p>
          <button
            onClick={resetForm}
            className="text-red-600 hover:underline font-medium"
          >
            Check in another person
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Check-in Closed
            </h2>
          <p className="text-gray-600">
            The check-in form for this service has expired.
          </p>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen flex flex-col items-center justify-center py-14">
      {/* <div
        className="absolute inset-0 opacity-5 -z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/church-bg.png')" }}
      /> */}
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-900 p-10 text-center">
          <h1 className="text-3xl font-bold text-white">
            {service ? service.title : 'Service Check-in'}
          </h1>
          <p className="text-blue-100 mb-5 mt-2">
            {service
              ? new Date(service.date).toDateString()
              : 'Please fill in your details'}
          </p>
          <p className="mt-2 text-lg text-gray-100">
            Welcome! Please check in.
          </p>
          {timeLeft != null && (
            <p
              className={`mt-3 font-semibold  ${
                isExpired ? 'text-red-300' : 'text-green-300'}`}>
              {isExpired
                 ? 'Check-in Closed' 
                 : `Form closes in : ${minutes}m ${seconds}s`}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as 'male' | 'female' | 'kids' | '',
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition bg-white"
            >
              <option value="">Select a category</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              First Time in church?
            </label>
            <select
              required
              value={formData.firstTimer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  firstTimer: e.target.value as 'Yes' | 'No' | '',
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition bg-white"
            >
              <option value="">If you are a first timer</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Prayer Request
            </label>
            <textarea
              value={formData.prayerRequest}
              onChange={(e) =>
                setFormData({ ...formData, prayerRequest: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
              placeholder="What you want God to do for you..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isExpired}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-red-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}
