'use client';

import { useMutation, useQuery } from 'convex/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
import { getFriendlyErrorMessage } from '../../../lib/friendlyError';

type TeamUser = Doc<'users'>;
type TeamUserRole = TeamUser['role'];

export default function UpdateUsersPage() {
  const users = useQuery(api.users.listUsers);
  const updateUser = useMutation(api.users.updateUser);
  const removeUser = useMutation(api.users.removeUser);
  const [selectedId, setSelectedId] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<TeamUserRole>('volunteer');
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (users && users.length > 0 && !selectedId) {
      setSelectedId(users[0]._id);
    }
  }, [users, selectedId]);

  const selectedUser = users?.find((user) => user._id === selectedId) || null;

  useEffect(() => {
    if (!selectedUser) return;
    setName(selectedUser.name);
    setEmail(selectedUser.email ?? '');
    setPhone(selectedUser.phone ?? '');
    setRole(selectedUser.role);
  }, [selectedUser]);

  const save = async () => {
    if (!selectedUser) return;
    setIsSaving(true);

    try {
      await updateUser({
        id: selectedUser._id,
        name,
        email,
        phone,
        role,
      });
      toast.success('User updated.');
    } catch (error) {
      toast.error(
        getFriendlyErrorMessage(
          error,
          'Unable to update user right now. Please try again.'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedUser) return;
    setIsRemoving(true);

    try {
      await removeUser({ id: selectedUser._id });
      toast.success('User removed.');
      setSelectedId('');
    } catch {
      toast.error('Failed to remove user.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="page-header">
        <div>
          <h1 className="page-title">Update User</h1>
          <p className="page-description">
            Adjust team details, role assignments, or remove old records when
            your team changes.
          </p>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="surface-card">
          <label className="control-label">
            <span className="control-text">Select User</span>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="admin-input"
            >
              {users?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </label>

          {selectedUser && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">{selectedUser.name}</p>
              <p className="mt-1 text-sm text-gray-500">{selectedUser.email}</p>
              <p className="mt-3 text-sm text-gray-600">{selectedUser.phone}</p>
              <span
                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  selectedUser.role === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : selectedUser.role === 'volunteer'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                }`}
              >
                {selectedUser.role}
              </span>
            </div>
          )}

          {users?.length === 0 && (
            <p className="mt-3 text-gray-500">No users available yet.</p>
          )}
        </article>

        {selectedUser && (
          <article className="surface-card space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="control-label sm:col-span-2">
                <span className="control-text">Full Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label className="control-label">
                <span className="control-text">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-input"
                />
              </label>

              <label className="control-label">
                <span className="control-text">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="admin-input"
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

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={save}
                disabled={isSaving}
                className="btn-primary w-full sm:w-auto"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={remove}
                disabled={isRemoving}
                className="btn-danger w-full sm:w-auto"
              >
                {isRemoving ? 'Removing...' : 'Remove User'}
              </button>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
