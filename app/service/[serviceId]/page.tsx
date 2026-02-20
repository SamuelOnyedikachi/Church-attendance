'use client';

import { useState } from 'react';
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
  const addAttendance = useMutation(api.attendance.addAttendance);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    email: '',
    phone: '',
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
    setIsSubmitting(true);
    try {
      await addAttendance({
        ...formData,
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
      prayerRequest: '',
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div
          className="absolute inset-0 opacity-4 -z-30 bg-cover bg-center"
          style={{ backgroundImage: "url('/church-bg.png')" }}
        />

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
          <h2 className="text-3xl font-bold text-red-800 mb-4">Welcome!</h2>
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

  return (
    // <div className="min-h-screen flex flex-col items-center justify-center p-6">
    //   <div
    //     className="absolute inset-0 opacity-5 -z-30 bg-cover bg-center"
    //     style={{ backgroundImage: "url('/church-bg.png')" }}
    //   />
    //   <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg">
    //     <div className="text-center bg-red-900 rounded-t-xl p-20 mb-8">
    //       <h1 className="text-3xl font-bold text-white">{service.title}</h1>
    //       <p className="text-white">{service.date}</p>
    //       <p className="mt-2 text-lg text-gray-500">Welcome! Please check in.</p>
    //     </div>
    //     <form onSubmit={handleSubmit} className="space-y-6">
    //       <div>
    //         <label
    //           htmlFor="name"
    //           className="block text-sm font-medium text-gray-700"
    //         >
    //           Full Name
    //         </label>
    //         <input
    //           type="text"
    //           name="name"
    //           id="name"
    //           value={formData.name}
    //           onChange={handleChange}
    //           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //           required
    //         />
    //       </div>
    //       <div>
    //         <label
    //           htmlFor="gender"
    //           className="block text-sm font-medium text-gray-700"
    //         >
    //           Gender
    //         </label>
    //         <select
    //           name="gender"
    //           id="gender"
    //           value={formData.gender}
    //           onChange={handleChange}
    //           className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //           required
    //         >
    //           <option value="">Select Gender</option>
    //           <option value="male">Male</option>
    //           <option value="female">Female</option>
    //           <option value="kids">Kids</option>
    //         </select>
    //       </div>

    //       <div>
    //         <label className="block font-medium text-gray-700 mb-2">
    //           Email (Optional)
    //         </label>
    //         <input
    //           type="email"
    //           value={formData.email}
    //           onChange={(e) =>
    //             setFormData({ ...formData, email: e.target.value })
    //           }
    //           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
    //           placeholder="john@example.com"
    //         />
    //       </div>

    //       <div>
    //         <label className="block font-medium text-gray-700 mb-2">
    //           Phone
    //         </label>
    //         <input
    //           type="tel"
    //           value={formData.phone}
    //           onChange={(e) =>
    //             setFormData({ ...formData, phone: e.target.value })
    //           }
    //           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
    //           placeholder="+1 234 567 8900"
    //         />
    //       </div>

    //         <label className="block font-medium text-gray-700 mb-2">
    //           Prayer Request
    //         </label>
    //         <textarea
    //           value={formData.prayerRequest}
    //           onChange={(e) =>
    //             setFormData({ ...formData, prayerRequest: e.target.value })
    //           }
    //           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-700 focus:border-red-100 outline-none transition"
    //           placeholder="What you want God to do for you..."
    //         />

    //       {/* You can add other fields like email, phone, etc. here */}

    <div className="min-h-screen flex flex-col items-center justify-center py-14">
      <div
        className="absolute inset-0 opacity-5 -z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/church-bg.png')" }}
      />
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
            disabled={isSubmitting}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-red-900 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}
