'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function UsersPage() {
  const users = useQuery(api.users.listUsers);
  const tasks = useQuery(api.tasks.listTasks, {});
  const stats = useMemo(() => {
    const team = users ?? [];

    return {
      total: team.length,
      admins: team.filter((user) => user.role === 'admin').length,
      volunteers: team.filter((user) => user.role === 'volunteer').length,
      members: team.filter((user) => user.role === 'client').length,
    };
  }, [users]);

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-description">
            Manage ministry workers, review team composition, and jump into
            assignments from one place.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Registered Team Members" value={stats.total} />
        <Card label="Admins" value={stats.admins} />
        <Card label="Volunteers" value={stats.volunteers} />
        <Card label="Follow-up Assignments" value={tasks?.length ?? 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-card space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-500">
                Move fast between onboarding, updates, and follow-up workflows.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users/addUsers" className="btn-primary">
              Add User
            </Link>
            <Link href="/admin/users/updateUsers" className="btn-secondary">
              Update User
            </Link>
            <Link href="/admin/users/tasks" className="btn-secondary">
              Follow-up Assignments
            </Link>
          </div>
        </article>

        <article className="surface-card-muted">
          <h2 className="text-lg font-semibold text-red-900">At a Glance</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info label="Members" value={stats.members} />
            <Info
              label="Open Assignment Hub"
              value={tasks ? 'Ready' : 'Loading'}
              isText
            />
          </div>
        </article>
      </div>

      <article className="table-card">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-red-900">
              Team Directory
            </h2>
            <p className="text-sm text-gray-500">
              A quick directory of the latest registered team members.
            </p>
          </div>
          <span className="pill pill-neutral">{stats.total} total</span>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {users?.map((user) => (
            <article
              key={user._id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <p className="mt-3 text-sm text-gray-600">{user.phone}</p>
            </article>
          ))}

          {users?.length === 0 && (
            <p className="text-sm text-gray-500">No users available yet.</p>
          )}
        </div>

        <div className="table-scroll hidden md:block">
          <table className="table-base">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user._id} className="table-row">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '_'}
                  </td>
                </tr>
              ))}

              {users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-500">
                    No users available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

function Info({
  label,
  value,
  isText,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white/90 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`mt-2 font-bold text-gray-900 ${isText ? 'text-lg' : 'text-2xl'}`}
      >
        {value}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: 'admin' | 'client' | 'volunteer' }) {
  const className =
    role === 'admin'
      ? 'pill-danger'
      : role === 'volunteer'
        ? 'pill-success'
        : 'pill-neutral';

  return <span className={`pill ${className}`}>{role}</span>;
}
