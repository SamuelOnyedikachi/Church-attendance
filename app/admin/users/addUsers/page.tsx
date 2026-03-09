'use client';

import { useMutation } from 'convex/react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../../../convex/_generated/api';
import { getFriendlyErrorMessage } from '../../../lib/friendlyError';

type TeamUserRole = 'admin' | 'client' | 'volunteer';

export default function AddUsersPage() {
  const createUser = useMutation(api.users.createUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<TeamUserRole>('volunteer');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await createUser({
        name,
        email,
        phone,
        role,
      });
      toast.success('User added.');
      setName('');
      setEmail('');
      setPhone('');
      setRole('volunteer');
    } catch (error) {
      toast.error(
        getFriendlyErrorMessage(
          error,
          'Unable to add user right now. Please try again.'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Add User</h1>
          <p className="page-description">Create a team member profile for follow-up assignments and outreach coordination.</p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} className="surface-card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="control-label sm:col-span-2">
              <span className="control-text">Full Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="admin-input"
                placeholder="John Doe"
              />
            </label>

            <label className="control-label">
              <span className="control-text">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input"
                placeholder="john@example.com"
              />
            </label>

            <label className="control-label">
              <span className="control-text">Phone</span>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="admin-input"
                placeholder="+234..."
              />
            </label>

            <label className="control-label sm:col-span-2">
              <span className="control-text">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TeamUserRole)}
                className="admin-input"
              >
                <option value="volunteer">Volunteer</option>
                <option value="client">Member</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full sm:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>

        <aside className="surface-card-muted space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-red-900">Before You Save</h2>
            <p className="mt-1 text-sm text-gray-600">Use this page to onboard volunteers, admins, and members for assignment workflows.</p>
          </div>

          <div className="space-y-3">
            <Tip title="Email must be unique" text="The system prevents duplicate team records with the same email address." />
            <Tip title="Phone helps outreach" text="Add a working number so the team can quickly reach the person through calls or WhatsApp." />
            <Tip title="Pick the right role" text="Admins manage the workspace, volunteers handle follow-up, and members stay visible in the team list." />
          </div>
        </aside>
      </div>
    </section>
  );
}

function Tip({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl bg-white/90 p-4">
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{text}</p>
    </article>
  );
}
