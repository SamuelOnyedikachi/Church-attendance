'use client';

import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';

export default function Home() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const latestService = services?.[0];
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Church Attendance
        </h1>

        {latestService ? (
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Scan to Check In
            </h2>
            <p className="text-gray-600 mb-6 font-medium">
              {latestService.title} &bull; {latestService.date}
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
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-gray-100 w-full">
            <p className="text-gray-500">
              {services === undefined
                ? 'Loading service info...'
                : 'No upcoming services found.'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/admin"
            className="text-blue-600 hover:underline font-medium"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
