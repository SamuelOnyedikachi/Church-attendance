'use client';

import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../public/church-bg.png';
import QRCode from 'react-qr-code';
import Image from 'next/image';

export default function Home() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const latestService = services?.[0];
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div
        className="absolute inset-0 opacity-3 -z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/church-bg.png')" }}
      />
      <div className="max-w-lg w-full text-center space-y-8">
        <Link href="/" className="text-red-600 hover:text-gray-900">
        <Image
         src={Logo} 
         width={80}
         height={80}
         alt="Church Logo" 
         className="mx-auto my-10" 
         />
        </Link>
        <h1 className="text-5xl font-extrabold text-red-900 tracking-tight">
          Church Attendance
        </h1>

        {latestService ? (
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-2 text-red-800">
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

        {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/admin" className="text-red-600 hover:text-gray-900">
            Go to Admin Dashboard
          </Link>
        </div> */}
      </div>
    </div>
  );
}
