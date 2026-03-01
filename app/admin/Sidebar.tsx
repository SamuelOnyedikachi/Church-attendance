'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Services', href: '/admin/services' },
    // Add more admin links here as needed
  ];

  return (
    <aside className="w-80 bg-red-100 flex flex-col min-h-screen flex-shrink-0">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-red-500">Admin Panel</h1>
      </div>
      <nav className="flex-1 py-6 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-6 py-3 text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="block text-center text-sm text-gray-500 hover:text-white"
        >
          &larr; Back to Home
        </Link>
      </div>
    </aside>
  );
}
