'use client';

import { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../convex/_generated/api';
import {
  buildWhatsAppHref,
  normalizeWhatsAppPhone,
  resolveWhatsAppTemplate,
} from '../../../lib/whatsapp';

const CHURCH_NAME = 'Rhythmn 5 Fellowship';
const CUSTOM_TEMPLATE_ID = 'custom';
const WHATSAPP_TEMPLATES = [
  {
    id: 'appreciation',
    label: 'Service Appreciation',
    description: 'A warm thank-you after a service or event.',
    body:
      'Hello {{name}}, thank you for worshipping with us at {{churchName}} during {{serviceTitle}} on {{serviceDate}}. We pray the word blesses you all through the week.',
  },
  {
    id: 'first-timer',
    label: 'First Timer Welcome',
    description: 'Welcome note for guests visiting for the first time.',
    body:
      'Hello {{name}}, welcome again to {{churchName}}. It was such a joy having you with us at {{serviceTitle}} on {{serviceDate}}. We would love to stay connected and support you however we can.',
  },
  {
    id: 'second-timer',
    label: 'Second Timer Follow-up',
    description: 'Encouragement for someone returning after their first visit.',
    body:
      'Hello {{name}}, thank you for coming back to {{churchName}} for {{serviceTitle}} on {{serviceDate}}. We are glad to see you again and we are praying that you keep growing in grace with us.',
  },
  {
    id: 'birthday',
    label: 'Birthday Blessing',
    description: 'Birthday prayer and celebration message.',
    body:
      'Happy birthday, {{name}}. On {{birthdayDate}}, we celebrate God\'s faithfulness over your life. Everyone at {{churchName}} is praying for fresh joy, strength, and favor for you in this new season.',
  },
  {
    id: 'prayer',
    label: 'Prayer Check-in',
    description: 'A caring follow-up for prayer and support.',
    body:
      'Hello {{name}}, this is {{churchName}} checking in on you after {{serviceTitle}}. We are praying for you and would be glad to stand with you in faith if there is any prayer point you want us to keep before God.',
  },
  {
    id: 'sunday-reminder',
    label: 'Sunday Reminder',
    description: 'Invite attendees to the next Sunday gathering.',
    body:
      'Hello {{name}}, this is a loving reminder from {{churchName}}. We would be happy to welcome you again at our next worship service. We are trusting God to bless you richly as you join us.',
  },
  {
    id: 'midweek',
    label: 'Midweek Recharge',
    description: 'Invitation to a midweek fellowship or Bible study.',
    body:
      'Hello {{name}}, we are inviting you to our midweek fellowship at {{churchName}}. It is a beautiful time of worship, teaching, and prayer, and we would love to see you there.',
  },
  {
    id: 'special-event',
    label: 'Special Event Invite',
    description: 'Invitation to a special church program.',
    body:
      'Hello {{name}}, you are specially invited to our upcoming program at {{churchName}}. We believe it will be a powerful time in God\'s presence, and we would be honored to have you with us.',
  },
  {
    id: 'volunteer-appreciation',
    label: 'Volunteer Appreciation',
    description: 'A thank-you note for members who served.',
    body:
      'Hello {{name}}, thank you for serving so faithfully at {{churchName}}. Your support during {{serviceTitle}} on {{serviceDate}} made a real difference, and we appreciate your heart for God\'s work.',
  },
  {
    id: 'seasonal',
    label: 'Seasonal Greeting',
    description: 'A festive or holiday encouragement note.',
    body:
      'Hello {{name}}, warm greetings from {{churchName}}. We are grateful for you and we pray that this season brings peace, joy, open doors, and a deeper walk with God for you and your family.',
  },
] as const;

export default function WhatsappAttendeesPage() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    WHATSAPP_TEMPLATES[0].id
  );
  const [template, setTemplate] = useState<string>(WHATSAPP_TEMPLATES[0].body);
  const resolvedSelectedServiceId =
    selectedServiceId || services?.[0]?._id || '';

  const selectedService = useMemo(
    () =>
      services?.find((service) => service._id === resolvedSelectedServiceId) ??
      null,
    [resolvedSelectedServiceId, services]
  );

  const attendance = useQuery(
    api.attendance.getAttendanceByService,
    resolvedSelectedServiceId
      ? { serviceId: resolvedSelectedServiceId as never }
      : 'skip'
  );

  const contacts = useMemo(() => {
    if (!attendance) return [];

    return attendance
      .filter((entry) => entry.phone?.trim())
      .map((entry) => ({
        ...entry,
        normalizedPhone: normalizeWhatsAppPhone(entry.phone),
        resolvedMessage: resolveWhatsAppTemplate(template, {
          attendeeName: entry.name,
          churchName: CHURCH_NAME,
          dob: entry.dob,
          phone: entry.phone,
          serviceDate: selectedService?.date,
          serviceTitle: selectedService?.title,
        }),
      }))
      .map((entry) => ({
        ...entry,
        whatsappHref: buildWhatsAppHref(entry.phone, entry.resolvedMessage),
      }));
  }, [attendance, selectedService, template]);

  const validContacts = useMemo(
    () => contacts.filter((entry) => Boolean(entry.whatsappHref)),
    [contacts]
  );

  const invalidContactsCount = contacts.length - validContacts.length;
  const previewContact = validContacts[0] ?? contacts[0] ?? null;
  const previewMessage = useMemo(
    () =>
      resolveWhatsAppTemplate(template, {
        attendeeName: previewContact?.name,
        churchName: CHURCH_NAME,
        dob: previewContact?.dob,
        phone: previewContact?.phone,
        serviceDate: selectedService?.date,
        serviceTitle: selectedService?.title,
      }),
    [previewContact, selectedService, template]
  );
  const selectedTemplate = useMemo(
    () =>
      WHATSAPP_TEMPLATES.find((messageTemplate) => {
        return messageTemplate.id === selectedTemplateId;
      }) ?? null,
    [selectedTemplateId]
  );
  const storedBirthdays = useMemo(
    () => contacts.filter((entry) => Boolean(entry.dob?.trim())).length,
    [contacts]
  );

  const copyGroupPhones = async () => {
    const phoneList = Array.from(
      new Set(
        validContacts
          .map((entry) => entry.normalizedPhone)
          .filter((phone): phone is string => Boolean(phone))
      )
    );

    if (phoneList.length === 0) {
      toast.error('No valid phone numbers to copy.');
      return;
    }

    try {
      await navigator.clipboard.writeText(phoneList.join(', '));
      toast.success('Phone list copied.');
    } catch {
      toast.error('Could not copy phone list.');
    }
  };

  const copyPreviewMessage = async () => {
    try {
      await navigator.clipboard.writeText(previewMessage);
      toast.success('Message copied.');
    } catch {
      toast.error('Could not copy message.');
    }
  };

  const handleTemplateSelect = (value: string) => {
    setSelectedTemplateId(value);

    if (value === CUSTOM_TEMPLATE_ID) {
      return;
    }

    const nextTemplate = WHATSAPP_TEMPLATES.find(
      (messageTemplate) => messageTemplate.id === value
    );

    if (nextTemplate) {
      setTemplate(nextTemplate.body);
    }
  };

  const openChatsForAll = () => {
    const uniqueHrefs = Array.from(
      new Set(
        validContacts
          .map((entry) => entry.whatsappHref)
          .filter((href): href is string => Boolean(href))
      )
    );

    if (uniqueHrefs.length === 0) {
      toast.error('No valid WhatsApp chats are available for this service.');
      return;
    }

    let openedCount = 0;

    uniqueHrefs.forEach((href) => {
      const popup = window.open(href, '_blank', 'noopener,noreferrer');
      if (popup) {
        openedCount += 1;
      }
    });

    if (openedCount === 0) {
      toast.error('Your browser blocked the WhatsApp chats. Allow pop-ups and try again.');
      return;
    }

    if (openedCount < uniqueHrefs.length) {
      toast.warn(
        `Opened ${openedCount} chat(s). ${uniqueHrefs.length - openedCount} may have been blocked by your browser.`
      );
      return;
    }

    toast.success(`Opened ${openedCount} WhatsApp chat(s) with the selected template.`);
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title mb-4">WhatsApp Attendees</h1>
          <p className="page-description my-4">Start one-click chats, choose a ready-made follow-up template, and launch WhatsApp outreach without cleaning numbers by hand.</p>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface-card text-gray-900">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="control-label">
              <span className="control-text mr-4">Choose Service</span>
              <select
                value={resolvedSelectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="admin-input"
              >
                {services?.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.title} - {service.date}
                  </option>
                ))}
              </select>
            </label>

            <label className="control-label">
              <span className="control-text">Message Template</span>
              <select
                value={selectedTemplateId}
                onChange={(event) => handleTemplateSelect(event.target.value)}
                className="admin-input"
              >
                {WHATSAPP_TEMPLATES.map((messageTemplate) => (
                  <option key={messageTemplate.id} value={messageTemplate.id}>
                    {messageTemplate.label}
                  </option>
                ))}
                <option value={CUSTOM_TEMPLATE_ID}>Custom Template</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Ready for WhatsApp" value={validContacts.length} />
            <SummaryCard label="Need Correction" value={invalidContactsCount} />
            <SummaryCard label="Birthdays Stored" value={storedBirthdays} />
          </div>

          <p className="mt-4 text-sm text-gray-500">
            {selectedTemplate?.description ||
              'You are editing a custom message template.'}
          </p>
        </article>

        <article className="surface-card text-gray-900">
          <h2 className="text-lg font-semibold text-red-900">Preview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Previewing for {previewContact?.name || 'a sample attendee'}.
          </p>
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-gray-800">
            {previewMessage}
          </p>
          {/* <p className="mt-3 text-sm text-gray-600">
            Tokens: <code>{'{{name}}'}</code>, <code>{'{{firstName}}'}</code>{' '}
            <code>{'{{serviceTitle}}'}</code>, <code>{'{{serviceDate}}'}</code>,{' '}
            <code>{'{{churchName}}'}</code>, <code>{'{{phone}}'}</code>,{' '}
            <code>{'{{birthdayDate}}'}</code>
          </p> */}
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="surface-card text-gray-900">
          <h2 className="text-lg font-semibold text-red-900">Template Editor</h2>
          <p className="mt-1 text-sm text-gray-500">
            Edit the selected template if you want a custom tone for this service.
          </p>
          <textarea
            value={template}
            onChange={(event) => {
              if (selectedTemplateId !== CUSTOM_TEMPLATE_ID) {
                setSelectedTemplateId(CUSTOM_TEMPLATE_ID);
              }
              setTemplate(event.target.value);
            }}
            className="admin-textarea mt-3"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button onClick={copyPreviewMessage} className="btn-primary">
              Copy Preview
            </button>
            <button onClick={copyGroupPhones} className="btn-secondary">
              Copy All Numbers
            </button>
            <button onClick={openChatsForAll} className="btn-success">
              Open Chats For All
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            This opens one WhatsApp chat per attendee with the template already filled in.
            WhatsApp may still require you to tap send inside the app.
          </p>
        </article>

        <article className="surface-card text-gray-900">
          <h2 className="text-lg font-semibold text-red-900">Included Templates</h2>
          <div className="mt-3 space-y-3">
            {WHATSAPP_TEMPLATES.map((messageTemplate) => (
              <div
                key={messageTemplate.id}
                className="rounded-2xl border border-red-100 bg-red-50/40 p-4"
              >
                <p className="font-semibold text-red-900">{messageTemplate.label}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {messageTemplate.description}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="table-card text-gray-900">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((entry) => (
                <tr key={entry._id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <p>{entry.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {entry.firstTimer === 'Yes' ? 'First timer' : 'Returning attendee'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{entry.phone}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {entry.normalizedPhone
                        ? `WhatsApp format: ${entry.normalizedPhone}`
                        : 'Could not convert this number for WhatsApp.'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`pill ${
                        entry.whatsappHref ? 'pill-success' : 'pill-danger'
                      }`}
                    >
                      {entry.whatsappHref ? 'Ready' : 'Needs fix'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.whatsappHref ? (
                      <a
                        href={entry.whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-success"
                      >
                        Open Chat
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Invalid number</span>
                    )}
                  </td>
                </tr>
              ))}

              {contacts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-gray-500">
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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
      <p className="text-sm font-medium uppercase tracking-wide text-red-700">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </article>
  );
}
