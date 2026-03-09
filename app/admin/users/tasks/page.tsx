'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { toast } from 'react-toastify';
import { api } from '../../../../convex/_generated/api';
import type { Doc, Id } from '../../../../convex/_generated/dataModel';

type TaskStatus = Doc<'taskAssignments'>['status'];

export default function UserTasksPage() {
  const services = useQuery(api.services.listServicesWithAttendance);
  const users = useQuery(api.users.listUsers);
  const today = new Date().toISOString().slice(0, 10);
  const [serviceId, setServiceId] = useState('');
  const tasks = useQuery(
    api.tasks.listTasks,
    serviceId
      ? { serviceId: serviceId as Id<'services'>, assignmentDate: today }
      : { assignmentDate: today }
  );
  const generateDailyAssignments = useMutation(
    api.tasks.generateDailyAssignments
  );
  const updateTaskStatusMutation = useMutation(api.tasks.updateTaskStatus);
  const removeTaskMutation = useMutation(api.tasks.removeTask);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (services && services.length > 0 && !serviceId) {
      setServiceId(services[0]._id);
    }
  }, [services, serviceId]);

  const selectedService =
    services?.find((service) => service._id === serviceId) ?? null;
  const completedCount =
    tasks?.filter((assignment) => assignment.status === 'done').length ?? 0;

  const generateAssignments = async () => {
    if (!serviceId) {
      toast.error('Select a service first.');
      return;
    }

    setIsSaving(true);

    try {
      const result = await generateDailyAssignments({
        serviceId: serviceId as Id<'services'>,
        assignmentDate: today,
      });

      toast.success(
        result.assignedNow > 0
          ? `${result.assignedNow} attendee(s) assigned for follow-up.`
          : 'Assignments are already up to date for today.'
      );
    } catch {
      toast.error('Failed to generate daily assignments.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (
    id: Id<'taskAssignments'>,
    status: TaskStatus
  ) => {
    await updateTaskStatusMutation({ id, status });
  };

  const removeTask = async (id: Id<'taskAssignments'>) => {
    await removeTaskMutation({ id });
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Daily Follow-up Assignments</h1>
          <p className="page-description">
            Each day, attendees with contact details are distributed across your
            team for follow-up and WhatsApp outreach.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available Staff"
          value={users?.filter((user) => user.role !== 'client').length ?? 0}
        />
        <StatCard label="Today's Assignments" value={tasks?.length ?? 0} />
        <StatCard label="Completed" value={completedCount} />
        <StatCard
          label="Service Attendees"
          value={selectedService?.attendanceCount ?? 0}
        />
      </div>

      <div className="surface-card grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="control-label">
          <span className="control-text">Service</span>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="admin-input"
          >
            {services?.map((service) => (
              <option key={service._id} value={service._id}>
                {service.title} - {service.date}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={generateAssignments}
          disabled={isSaving}
          className="btn-primary w-full lg:w-auto"
        >
          {isSaving ? 'Generating...' : `Generate ${today} Assignments`}
        </button>
      </div>

      <div className="space-y-4 md:hidden">
        {tasks?.map((task) => {
          const whatsappLink = task.attendee?.phone
            ? `https://wa.me/${task.attendee.phone.replace(/[^\d]/g, '')}`
            : null;
          const emailLink = task.attendee?.email
            ? `mailto:${task.attendee.email}`
            : null;

          return (
            <article key={task._id} className="surface-card space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {task.attendee?.name || 'Unknown attendee'}
                  </p>
                  <p className="mt-1 text-sm capitalize text-gray-500">
                    {task.attendee?.category || 'No category'}
                  </p>
                </div>
                <span
                  className={`pill ${
                    task.status === 'done'
                      ? 'pill-success'
                      : task.status === 'in_progress'
                        ? 'pill-warning'
                        : 'pill-neutral'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid gap-3 text-sm text-gray-600">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Contact
                  </p>
                  <p className="mt-1">{task.attendee?.phone || '-'}</p>
                  <p>{task.attendee?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Assigned User
                  </p>
                  <p className="mt-1">{task.user?.name || 'Unknown user'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Service
                  </p>
                  <p className="mt-1">
                    {task.service
                      ? `${task.service.title} (${task.service.date})`
                      : 'Unknown service'}
                  </p>
                </div>
              </div>

              <label className="control-label">
                <span className="control-text">Status</span>
                <select
                  value={task.status}
                  onChange={(e) =>
                    updateStatus(task._id, e.target.value as TaskStatus)
                  }
                  className="admin-input"
                >
                  <option value="todo">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-success"
                  >
                    WhatsApp
                  </a>
                )}
                {emailLink && (
                  <a href={emailLink} className="btn-secondary">
                    Email
                  </a>
                )}
                <button
                  onClick={() => removeTask(task._id)}
                  className="btn-danger"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}

        {tasks?.length === 0 && (
          <div className="surface-card">
            <p className="text-sm text-gray-500">
              No follow-up assignments for this date and service yet.
            </p>
          </div>
        )}
      </div>

      <div className="table-card hidden md:block">
        <div className="table-scroll">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Assigned User</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map((task) => {
                const whatsappLink = task.attendee?.phone
                  ? `https://wa.me/${task.attendee.phone.replace(/[^\d]/g, '')}`
                  : null;
                const emailLink = task.attendee?.email
                  ? `mailto:${task.attendee.email}`
                  : null;

                return (
                  <tr key={task._id} className="table-row">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {task.attendee?.name || 'Unknown attendee'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {task.attendee?.category || 'No category'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{task.attendee?.phone || '-'}</p>
                      <p className="text-xs text-gray-500">
                        {task.attendee?.email || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {task.user?.name || 'Unknown user'}
                    </td>
                    <td className="px-4 py-3">
                      {task.service
                        ? `${task.service.title} (${task.service.date})`
                        : 'Unknown service'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateStatus(task._id, e.target.value as TaskStatus)
                        }
                        className="admin-input min-w-[8rem] px-2 py-1.5"
                      >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {whatsappLink && (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-success px-3 py-2"
                          >
                            WhatsApp
                          </a>
                        )}
                        {emailLink && (
                          <a
                            href={emailLink}
                            className="btn-secondary px-3 py-2"
                          >
                            Email
                          </a>
                        )}
                        <button
                          onClick={() => removeTask(task._id)}
                          className="btn-danger px-3 py-2"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {tasks?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-gray-500">
                    No follow-up assignments for this date and service yet.
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
