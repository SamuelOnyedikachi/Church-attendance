'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../convex/_generated/api';

const DEFAULT_TEMPLATE =
  'Thank you for attending {{serviceTitle}} on {{serviceDate}}. We are glad you joined us.';

function buildMailtoHref(recipients: string[], subject: string, body: string, useBcc = false) {
  const uniqueRecipients = Array.from(new Set(recipients.filter(Boolean)));

  if (uniqueRecipients.length === 0) {
    return null;
  }

  const params = new URLSearchParams({ subject, body });

  if (useBcc) {
    params.set('bcc', uniqueRecipients.join(','));
    return `mailto:?${params.toString()}`;
  }

  return `mailto:${uniqueRecipients[0]}?${params.toString()}`;
}

export default function MessageAttendeesPage() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

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
    return attendance.filter((entry) => entry.email || entry.phone);
  }, [attendance]);

  const emailRecipients = useMemo(
    () => contacts.map((entry) => entry.email).filter((email): email is string => Boolean(email)),
    [contacts]
  );

  const resolvedPreview = useMemo(() => {
    if (!selectedService) return template;

    return template
      .replaceAll('{{serviceTitle}}', selectedService.title)
      .replaceAll('{{serviceDate}}', selectedService.date);
  }, [selectedService, template]);

  const emailSubject = useMemo(() => {
    if (!selectedService) {
      return 'Follow-up from Rhythmn 5 Fellowship';
    }

    return `Follow-up from ${selectedService.title}`;
  }, [selectedService]);

  const emailAllHref = useMemo(
    () => buildMailtoHref(emailRecipients, emailSubject, resolvedPreview, true),
    [emailRecipients, emailSubject, resolvedPreview]
  );

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(resolvedPreview);
      toast.success('Message copied.');
    } catch {
      toast.error('Could not copy message.');
    }
  };

  const copyEmails = async () => {
    const emails = emailRecipients.join(', ');
    if (!emails) {
      toast.error('No emails available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(emails);
      toast.success('Email list copied.');
    } catch {
      toast.error('Could not copy email list.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Message Attendees</h1>
          <p className="page-description">Draft one follow-up message, preview it instantly, and launch email outreach without copying text around.</p>
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="surface-card">
          <h2 className="text-lg font-semibold text-red-900">Message Template</h2>
          <p className="mt-1 text-sm text-gray-500">
            Supported tokens: <code>{'{{serviceTitle}}'}</code>, <code>{'{{serviceDate}}'}</code>
          </p>
          <textarea value={template} onChange={(e) => setTemplate(e.target.value)} className="admin-textarea mt-3" />
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={copyMessage} className="btn-primary">
              Copy Message
            </button>
            <button onClick={copyEmails} className="btn-secondary">
              Copy Emails
            </button>
            {emailAllHref && (
              <a href={emailAllHref} className="btn-info">
                Email Attendees
              </a>
            )}
          </div>
        </article>

        <article className="surface-card">
          <h2 className="text-lg font-semibold text-red-900">Preview</h2>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-gray-800">{resolvedPreview}</p>
          <p className="mt-3 text-sm text-gray-600">
            Reachable contacts: {contacts.length} · Email recipients: {emailRecipients.length}
          </p>
        </article>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((entry) => {
                const emailHref = entry.email
                  ? buildMailtoHref([entry.email], emailSubject, resolvedPreview)
                  : null;

                return (
                  <tr key={entry._id} className="table-row">
                    <td className="px-4 py-3 font-medium text-gray-900">{entry.name}</td>
                    <td className="px-4 py-3">{entry.email || '-'}</td>
                    <td className="px-4 py-3">{entry.phone || '-'}</td>
                    <td className="px-4 py-3">
                      {emailHref ? (
                        <a href={emailHref} className="btn-info px-3 py-2">
                          Send Email
                        </a>
                      ) : (
                        <span className="text-gray-400">No email</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-gray-500">
                    No attendee with email or phone for this service.
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
