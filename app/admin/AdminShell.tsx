'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell flex min-h-screen bg-transparent text-gray-950">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-red-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-800 transition hover:bg-red-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
              Admin
            </p>
            <p className="text-base font-medium text-gray-700">
              Attendance dashboard
            </p>
          </div>
        </header>
        <main className="flex-1 bg-transparent px-4 py-5 text-gray-950 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="page-shell">{children}</div>
        </main>
      </div>
    </div>
  );
}
