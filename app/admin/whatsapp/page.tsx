'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../convex/_generated/api';

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

export default function WhatsappAttendeesPage() {
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

  const contacts = useMemo(() => {
    if (!attendance) return [];

    return attendance
      .filter((entry) => entry.phone)
      .map((entry) => ({
        ...entry,
        normalizedPhone: normalizePhone(entry.phone || ''),
      }))
      .filter((entry) => entry.normalizedPhone.length > 5);
  }, [attendance]);

  const defaultMessage = useMemo(() => {
    if (!selectedService) return 'Thanks for worshiping with us today.';
    return `Thank you for joining ${selectedService.title} (${selectedService.date}). We hope to see you again.`;
  }, [selectedService]);

  const copyGroupPhones = async () => {
    if (contacts.length === 0) {
      toast.error('No valid phone numbers to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(contacts.map((entry) => entry.normalizedPhone).join(', '));
      toast.success('Phone list copied.');
    } catch {
      toast.error('Could not copy phone list.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title mb-4">WhatsApp Attendees</h1>
          <p className="page-description my-4">Start one-click chats or copy a clean recipient list for broadcast follow-up.</p>
        </div>
      </header>

      <div className="surface-card text-gray-900">
        <label className="control-label">
          <span className="control-text mr-4">Choose Service</span>
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

        <button onClick={copyGroupPhones} className="btn-secondary mt-4">
          Copy All Numbers
        </button>
      </div>

      <div className="table-card text-gray-900">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((entry) => {
              const url = `https://wa.me/${entry.normalizedPhone.replace(/^\+/, '')}?text=${encodeURIComponent(defaultMessage)}`;

              return (
                <tr key={entry._id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                  <td className="px-4 py-3">{entry.phone}</td>
                  <td className="px-4 py-3">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-success"
                    >
                      Open Chat
                    </a>
                  </td>
                </tr>
              );
            })}

            {contacts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-gray-500">
                  No phone numbers available for this service.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
