'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import LogoLoader from '../../components/LogoLoader';

export default function AttendeesPage() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  useEffect(() => {
    if (!services || services.length === 0) return;
    if (!selectedServiceId) {
      setSelectedServiceId(services[0]._id);
    }
  }, [services, selectedServiceId]);

  const selectedService = useMemo(
    () => services?.find((service) => service._id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  );

  const attendance = useQuery(
    api.attendance.getAttendanceByService,
    selectedServiceId ? { serviceId: selectedServiceId as never } : 'skip'
  );

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Attendees</h1>
          <p className="page-description">Review who checked in, contact details, and first-time visitor status for each service.</p>
        </div>
      </header>

      <div className="surface-card">
        <label className="control-label">
          <span className="control-text">Choose Service</span>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="admin-input md:max-w-md"
          >
            {services?.map((service) => (
              <option key={service._id} value={service._id}>
                {service.title} - {service.date}
              </option>
            ))}
          </select>
        </label>

        {!services && (
          <LogoLoader
            label="Loading Services"
            size={88}
            containerClassName="min-h-[180px] px-0"
          />
        )}
        {services && services.length === 0 && (
          <p className="mt-3 text-gray-500">No service has been created yet.</p>
        )}
      </div>

      {selectedService && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Total" value={selectedService.attendanceCount} />
          <InfoCard label="Men" value={selectedService.maleCount} />
          <InfoCard label="Women" value={selectedService.femaleCount} />
          <InfoCard label="Kids" value={selectedService.kidsCount} />
        </div>
      )}

      <div className="table-card">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">First Timer</th>
            </tr>
          </thead>
          <tbody>
            {attendance?.map((entry) => (
              <tr key={entry._id} className="table-row">
                <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                <td className="px-4 py-3 capitalize">{entry.category || '-'}</td>
                <td className="px-4 py-3">{entry.phone || '-'}</td>
                <td className="px-4 py-3">{entry.email || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`pill ${entry.firstTimer === 'Yes' ? 'pill-warning' : 'pill-neutral'}`}>
                    {entry.firstTimer || '-'}
                  </span>
                </td>
              </tr>
            ))}

            {attendance && attendance.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-gray-500">
                  No check-ins for this service yet.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>

        {selectedServiceId && attendance === undefined && (
          <LogoLoader
            label="Loading Attendance"
            size={88}
            containerClassName="min-h-[220px] px-0"
          />
        )}
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
