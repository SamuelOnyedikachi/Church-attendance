'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../convex/_generated/api';
import LogoLoader from '../../components/LogoLoader';

export default function ServicesPage() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const createService = useMutation(api.services.createService);

  const [title, setTitle] = useState('Sunday Service');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await createService({ title, date });
      toast.success('Service created.');
      setTitle('Sunday Service');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create service.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-description">Create services, review turnout, and jump straight to check-in or attendance records.</p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Services" value={totals.services} />
        <StatCard label="Total Attendees" value={totals.attendees} />
        <StatCard label="Men" value={totals.male} />
        <StatCard label="Women" value={totals.female} />
        <StatCard label="Kids" value={totals.kids} />
      </div>

      <div className="surface-card">
        <h2 className="text-lg font-semibold text-red-900">Create Service</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-3 md:items-end">
          <label className="control-label md:col-span-2">
            <span className="control-text">Service Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="admin-input"
            />
          </label>

          <label className="control-label">
            <span className="control-text">Service Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="admin-input"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Create Service'}
          </button>
        </form>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Attendees</th>
                <th className="px-4 py-3">Breakdown</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services?.map((service) => (
                <tr key={service._id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">{service.title}</td>
                  <td className="px-4 py-3">{service.date}</td>
                  <td className="px-4 py-3">{service.attendanceCount}</td>
                  <td className="px-4 py-3 text-gray-600">
                    M: {service.maleCount}, F: {service.femaleCount}, K: {service.kidsCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/service/${service._id}`} className="btn-secondary px-3 py-2" target="_blank">
                        Check-in Form
                      </Link>
                      <Link href={`/admin/attendance/${service._id}`} className="btn-secondary px-3 py-2">
                        Attendance
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {services && services.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={5}>
                    No services found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {services === undefined && (
          <LogoLoader
            label="Loading Services"
            size={88}
            containerClassName="min-h-[220px] px-0"
          />
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
