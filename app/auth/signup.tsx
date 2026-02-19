'use client';

import { useState } from 'react';

export default function Signup() {
  const [role, setRole] = useState('client');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('User role:', role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <select
            className="w-full border p-3 rounded-lg"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="client">Client</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
