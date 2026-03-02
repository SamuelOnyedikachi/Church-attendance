'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18M3 6h18M3 18h18"
          />
        </svg>
      ),
    },
    {
      label: 'Services',
      href: '/admin/services',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      subItems: [
        {
          label: 'Add User',
          href: '/admin/Users/addUsers',
        },
        {
          label: 'Update User',
          href: '/admin/Users/updateUsers',
        },
      ],
    },
    {
      label: 'Attendees',
      href: '/admin/attendees',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      label: 'Whatsapp Attendees',
      href: '/admin/whatsapp',
      icon: (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.81L2 22l5.3-1.38c1.38.72 2.93 1.12 4.59 1.12h.11c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.43 14.8c-.22-.11-1.3-.64-1.5-.72s-.34-.11-.48.11c-.14.22-.57.72-.7.86-.13.14-.26.16-.48.05s-1.02-.37-1.94-1.2c-.72-.65-1.2-1.45-1.34-1.7s-.03-.23.08-.34c.1-.11.22-.28.34-.42s.16-.22.24-.37.04-.28-.02-.39c-.06-.11-.48-1.15-.66-1.58s-.36-.36-.48-.36h-.4c-.14 0-.36.05-.54.26s-.68.66-.68 1.6c0 .94.7 1.86.8 2s1.33 2.02 3.23 2.85c.46.2 1..32 1.34.42.5.14.94.12 1.3.08.39-.04.9-.2 1.03-.39.13-.19.13-.36.09-.48s-.18-.28-.4-.39z"
          />
        </svg>
      ),
    },
    {
      label: 'Message Attendees',
      href: '/admin/messages',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      label: 'Assign Task',
      href: '/admin/Users/tasks',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 w-64 bg-red-900 text-white h-screen flex-shrink-0 flex flex-col transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex items-center justify-between p-4 border-b border-red-800">
          <h1 className="text-xl font-bold">Admin Records</h1>
          <button onClick={onClose} className="md:hidden text-red-200 hover:text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              <div
                onClick={() => item.subItems && handleDropdown(item.label)}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  pathname === item.href
                    ? 'bg-red-600 text-white'
                    : 'text-red-200 hover:bg-red-800 hover:text-white'
                }`}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
                {item.subItems && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openDropdown === item.label ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>
              {item.subItems && openDropdown === item.label && (
                <div className="pl-8 space-y-1 py-2">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                        pathname === subItem.href
                          ? 'bg-red-700 text-white'
                          : 'text-red-300 hover:bg-red-800 hover:text-white'
                      }`}
                      onClick={onClose}
                    >
                      <span>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-red-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-red-200 hover:text-white"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </aside>
    </>
  );
}
