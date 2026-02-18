'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState, useMemo } from 'react';
import Link from 'next/link';

// A simple chart component placeholder
const AttendanceChart = ({
  data,
}: {
  data: { date: string; total: number; male: number; female: number; kids:number; }[];
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded flex items-center justify-center border border-dashed border-gray-300">
        <span className="text-gray-400">
          No attendance data to display chart.
        </span>
      </div>
    );
  }

  // Sort by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const maxVal = Math.max(...sortedData.map((d) => d.total), 5);

  // Simple SVG Line Chart
  const height = 300;
  const width = 600;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const getX = (index: number) =>
    padding + (index / (sortedData.length - 1 || 1)) * chartWidth;
  const getY = (val: number) => height - padding - (val / maxVal) * chartHeight;

  const makePath = (key: 'total' | 'male' | 'female' | 'kids') =>
    sortedData.map((d, i) => `${getX(i)},${getY(d[key])}`).join(' ');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
      <h3 className="font-semibold mb-6 text-lg">Attendance Growth Flow</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <line
                key={t}
                x1={padding}
                y1={getY(maxVal * t)}
                x2={width - padding}
                y2={getY(maxVal * t)}
                stroke="#e5e7eb"
                strokeDasharray="4"
              />
            ))}

            {/* Paths */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points={makePath('total')}
            />
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              points={makePath('male')}
            />
            <polyline
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              points={makePath('female')}
            />
            <polyline
              fill="none"
              stroke="#00ff00"
              strokeWidth="2"
              points={makePath('kids')}
            />

            {/* Points */}
            {sortedData.map((d, i) => (
              <g key={i}>
                <circle cx={getX(i)} cy={getY(d.total)} r="4" fill="#3b82f6" />
                <circle cx={getX(i)} cy={getY(d.male)} r="3" fill="#22c55e" />
                <circle cx={getX(i)} cy={getY(d.female)} r="3" fill="#ec4899" />
                <circle cx={getX(i)} cy={getY(d.kids)} r="3" fill="#00ff00" />

                <text
                  x={getX(i)}
                  y={height - 15}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#6b7280"
                >
                  {new Date(d.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span> Total
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span> Male
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span> Female
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span> Kids
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const createService = useMutation(api.services.createService);
  const services = useQuery(api.services.listServicesWithAttendance);

  const [newServiceTitle, setNewServiceTitle] = useState('Sunday Service');
  const [newServiceDate, setNewServiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await createService({ title: newServiceTitle, date: newServiceDate });
    alert('Service created successfully!');
  };

  const selectedService = useMemo(() => {
    if (!selectedServiceId || !services) return null;
    return services.find((s) => s._id === selectedServiceId);
  }, [selectedServiceId, services]);

  const chartData = useMemo(() => {
    if (!services) return [];
    return services
      .map((s) => ({
        date: s.date,
        total: s.attendanceCount,
        male: s.maleCount,
        female: s.femaleCount,
        kids: s.kidsCount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [services]);

  return (
    <div
      className="relative min-h-screen p-4 md:p-8"
      // style={{ backgroundImage: "url('/church-bg.png')" }}
    >
      <div
        className="absolute inset-0 opacity-1 -z-30 bg-cover bg-center"
        style={{ backgroundImage: "url('/church-bg.png')" }}
      />
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between p-5 items-center">
          <h1 className="text-3xl font-bold text-red-800">Admin Dashboard</h1>
          <Link href="/" className="text-red-600 hover:text-gray-900">
            &larr; Back to Home
          </Link>
        </div>

        {/* Create Service Section */}
        <div className="bg-white p-10 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Create New Service</h2>
          <form
            onSubmit={handleCreateService}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="w-full md:w-1/3">
              <label className="block font-medium text-gray-700 mb-2">
                Service Title
              </label>
              <input
                type="text"
                value={newServiceTitle}
                onChange={(e) => setNewServiceTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-100"
                required
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={newServiceDate}
                onChange={(e) => setNewServiceDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-red-800 text-white px-6 py-2 rounded-md hover:bg-red-900 transition-colors"
            >
              Create
            </button>
          </form>
        </div>

        {/* Services List & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-red-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {services?.map((service) => (
                <div
                  key={service._id}
                  onClick={() => setSelectedServiceId(service._id)}
                  className={`border p-4 rounded-lg cursor-pointer transition ${selectedServiceId === service._id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <p className="font-medium">{service.title}</p>
                  <p className="text-sm text-gray-500">{service.date}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Attendees: {service.attendanceCount}
                  </p>
                  <Link
                    href={`/service/${service._id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-red-600 hover:underline mt-2 inline-block"
                  >
                    Open Check-in Form
                  </Link>
                </div>
              ))}
              {(!services || services.length === 0) && (
                <p className="text-gray-500">No services found.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              {selectedService ? (
                <div>
                  <h3 className="font-medium text-lg">
                    {selectedService.title} on {selectedService.date}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-center">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold">
                        {selectedService.attendanceCount}
                      </p>
                      <p className="text-sm text-gray-600">Total Attendees</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold">
                        {selectedService.maleCount}
                      </p>
                      <p className="text-sm text-gray-600">Men</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold">
                        {selectedService.femaleCount}
                      </p>
                      <p className="text-sm text-gray-600">Women</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <p className="text-2xl font-bold">
                        {selectedService.kidsCount}
                      </p>
                      <p className="text-sm text-gray-600">kids</p>
                    </div>
                  
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Select a service to view its statistics.
                </p>
              )}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <AttendanceChart data={chartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
