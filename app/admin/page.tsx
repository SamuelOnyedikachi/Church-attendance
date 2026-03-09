'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../convex/_generated/api';

const AttendanceChart = ({
  data,
}: {
  data: {
    date: string;
    total: number;
    male: number;
    female: number;
    kids: number;
  }[];
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50">
        <span className="text-gray-400">
          No attendance data to display yet.
        </span>
      </div>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const maxVal = Math.max(...sortedData.map((d) => d.total), 5);
  const height = 340;
  const width = 680;
  const padding = 56;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const series = {
    total: '#2563eb',
    male: '#16a34a',
    female: '#f97316',
    kids: '#dc2626',
  } as const;

  const getX = (index: number) =>
    padding + (index / (sortedData.length - 1 || 1)) * chartWidth;
  const getY = (value: number) =>
    height - padding - (value / maxVal) * chartHeight;

  const buildSmoothPath = (key: 'total' | 'male' | 'female' | 'kids') => {
    const points = sortedData.map((item, index) => ({
      x: getX(index),
      y: getY(item[key]),
    }));

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    return points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];
      const controlX = (previous.x + point.x) / 2;
      return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    }, '');
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[680px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
            {yTicks.map((tick) => {
              const value = Math.round(maxVal * tick);
              const y = getY(value);

              return (
                <g key={tick}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeDasharray="4"
                  />
                  <text
                    x={padding - 12}
                    y={y + 4}
                    fontSize="10"
                    textAnchor="end"
                    fill="#6b7280"
                  >
                    {value} ({Math.round(tick * 100)}%)
                  </text>
                </g>
              );
            })}

            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#cbd5e1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#cbd5e1"
            />

            <path
              d={buildSmoothPath('total')}
              fill="none"
              stroke={series.total}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildSmoothPath('male')}
              fill="none"
              stroke={series.male}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildSmoothPath('female')}
              fill="none"
              stroke={series.female}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildSmoothPath('kids')}
              fill="none"
              stroke={series.kids}
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {sortedData.map((item, index) => (
              <g key={item.date + index}>
                <circle
                  cx={getX(index)}
                  cy={getY(item.total)}
                  r="4.5"
                  fill={series.total}
                />
                <circle
                  cx={getX(index)}
                  cy={getY(item.male)}
                  r="3.5"
                  fill={series.male}
                />
                <circle
                  cx={getX(index)}
                  cy={getY(item.female)}
                  r="3.5"
                  fill={series.female}
                />
                <circle
                  cx={getX(index)}
                  cy={getY(item.kids)}
                  r="3.5"
                  fill={series.kids}
                />
                <text
                  x={getX(index)}
                  y={height - 20}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#6b7280"
                >
                  {new Date(item.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </text>
                <text
                  x={getX(index)}
                  y={height - 7}
                  fontSize="10"
                  textAnchor="middle"
                  fill={series.total}
                  fontWeight="600"
                >
                  {item.total}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
        <Legend color="bg-blue-500" label="Total" />
        <Legend color="bg-green-500" label="Male" />
        <Legend color="bg-orange-500" label="Female" />
        <Legend color="bg-red-500" label="Kids" />
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
  const [isCreating, setIsCreating] = useState(false);

  const selectedService = useMemo(() => {
    if (!selectedServiceId || !services) return services?.[0] ?? null;
    return (
      services.find((service) => service._id === selectedServiceId) ??
      services[0] ??
      null
    );
  }, [selectedServiceId, services]);

  const totals = useMemo(() => {
    if (!services) {
      return { services: 0, attendees: 0, male: 0, female: 0, kids: 0 };
    }

    return services.reduce(
      (acc, service) => {
        acc.services += 1;
        acc.attendees += service.attendanceCount;
        acc.male += service.maleCount;
        acc.female += service.femaleCount;
        acc.kids += service.kidsCount;
        return acc;
      },
      { services: 0, attendees: 0, male: 0, female: 0, kids: 0 }
    );
  }, [services]);

  const chartData = useMemo(() => {
    if (!services) return [];
    return services.map((service) => ({
      date: service.date,
      total: service.attendanceCount,
      male: service.maleCount,
      female: service.femaleCount,
      kids: service.kidsCount,
    }));
  }, [services]);

  const handleCreateService = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      await createService({ title: newServiceTitle, date: newServiceDate });
      toast.success('Service created successfully!');
      setNewServiceTitle('Sunday Service');
    } catch {
      toast.error('Unable to create service right now.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-description">
            Get a quick snapshot of attendance trends, recent services, and the
            fastest next actions for your team.
          </p>
        </div>
        <Link href="/" className="btn-secondary">
          ← Back to Home
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Services" value={totals.services} />
        <StatTile label="Attendees" value={totals.attendees} />
        <StatTile label="Men" value={totals.male} />
        <StatTile label="Women" value={totals.female} />
        <StatTile label="Kids" value={totals.kids} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <article className="surface-card">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Create New Service
              </h2>
              <p className="text-sm text-gray-500">
                Add a service and make it immediately available for check-in.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCreateService}
            className="mt-4 grid gap-3 md:grid-cols-[1.3fr_1fr_auto] md:items-end"
          >
            <label className="control-label">
              <span className="control-text">Service Title</span>
              <input
                type="text"
                value={newServiceTitle}
                onChange={(event) => setNewServiceTitle(event.target.value)}
                className="admin-input"
                required
              />
            </label>
            <label className="control-label">
              <span className="control-text">Service Date</span>
              <input
                type="date"
                value={newServiceDate}
                onChange={(event) => setNewServiceDate(event.target.value)}
                className="admin-input"
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Service'}
            </button>
          </form>
        </article>

        <article className="surface-card-muted">
          <h2 className="text-lg font-semibold text-red-900">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link href="/admin/services" className="btn-primary justify-start">
              Manage Services
            </Link>
            <Link
              href="/admin/attendees"
              className="btn-secondary justify-start"
            >
              View Attendees
            </Link>
            <Link
              href="/admin/whatsapp"
              className="btn-secondary justify-start"
            >
              WhatsApp Outreach
            </Link>
            <Link
              href="/admin/messages"
              className="btn-secondary justify-start"
            >
              Email Follow-up
            </Link>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <article className="surface-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Recent Services
              </h2>
              <p className="text-sm text-gray-500">
                Select a service to inspect its key metrics.
              </p>
            </div>
            {services && services.length > 3 && (
              <Link href="/admin/services" className="btn-secondary">
                View All
              </Link>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            {services?.slice(0, 4).map((service) => {
              const isSelected = selectedService?._id === service._id;
              const serviceDate = new Date(service.date);

              return (
                <button
                  key={service._id}
                  type="button" // Corrected typo here.
                  onClick={() => setSelectedServiceId(service._id)}
                  className={`rounded-2xl border px-5 py-4 text-left transition ${
                    isSelected
                      ? 'border-red-200 bg-red-50/80 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-red-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 w-[60%] ">
                      <div className="w-full space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`pill ${isSelected ? 'pill-danger' : 'pill-neutral'}`}
                          >
                            {isSelected ? 'Selected' : 'Service'}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            {serviceDate.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="truncate text-lg font-semibold text-gray-900">
                          {service.title}
                        </p>
                      </div>
                      {/* <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left lg:min-w-[124px] lg:text-right">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                          Total
                        </p>
                        <p className="mt-1 text-3xl font-bold tracking-tight text-blue-900">
                          {service.attendanceCount}
                        </p>
                        <p className="text-sm text-blue-700/80">attendees</p>
                      </div> */}
                    </div>

                    {/* <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
                          Men
                        </p>
                        <p className="mt-2 text-xl font-bold text-green-900">
                          {service.maleCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                          Women
                        </p>
                        <p className="mt-2 text-xl font-bold text-orange-900">
                          {service.femaleCount}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
                          Kids
                        </p>
                        <p className="mt-2 text-xl font-bold text-red-900">
                          {service.kidsCount}
                        </p>
                      </div>
                    </div> */}

                    <div className="flex item-center gap-2 pt-2">
                      <Link
                        href={`/service/${service._id}`}
                        target="_blank"
                        className="btn-secondary px-3 py-2 whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Open Check-in
                      </Link>
                      <Link
                        href={`/admin/attendance/${service._id}`}
                        className="btn-secondary px-3 py-2 whitespace-nowrap"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View Attendance
                      </Link>
                    </div>
                  </div>
                </button>
              );
            })}

            {services && services.length === 0 && (
              <p className="text-sm text-gray-500">No services created yet.</p>
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="surface-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-red-900">
                  Selected Service
                </h2>
                <p className="text-sm text-gray-500">
                  A quick breakdown of the current service attendance.
                </p>
              </div>
              {selectedService && (
                <span className="pill pill-neutral">
                  {selectedService.date}
                </span>
              )}
            </div>

            {selectedService ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <StatBox
                  label="Total Attendees"
                  value={selectedService.attendanceCount}
                />
                <StatBox label="Men" value={selectedService.maleCount} />
                <StatBox label="Women" value={selectedService.femaleCount} />
                <StatBox label="Kids" value={selectedService.kidsCount} />
              </div> // Corrected typo here.
            ) : (
              <p className="mt-4 text-sm text-gray-500">
                Select a service to view its statistics.
              </p>
            )}
          </article>

          <article className="surface-card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-red-900">
                Attendance Trend
              </h2>
              <p className="text-sm text-gray-500">
                Track turnout changes across recent services.
              </p>
            </div>
            <AttendanceChart data={chartData} />
          </article>
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
