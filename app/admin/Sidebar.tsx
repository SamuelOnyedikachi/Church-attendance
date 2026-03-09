'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX, SVGProps } from 'react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

type MenuItem = {
  label: string;
  href: string;
  icon: IconComponent;
  subItems?: Array<{
    label: string;
    href: string;
    icon: IconComponent;
  }>;
};

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 13h8V3H3zM13 21h8v-6h-8zM13 10h8V3h-8zM3 21h8v-6H3z" />
    </svg>
  );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 2v4M16 2v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function PlusUserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8" cy="7" r="4" />
      <path d="M20 8v6M17 11h6" />
    </svg>
  );
}

function EditUserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L7 21H3v-4z" />
    </svg>
  );
}

function AttendeesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M20 12a8 8 0 0 1-11.76 7.05L4 20l.95-4.24A8 8 0 1 1 20 12Z" />
      <path d="M9.5 8.5c.3-.7.8-.7 1.1-.7.2 0 .4 0 .6.5l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.1.1-.2.2-.1.4.4.8 1.1 1.5 1.9 1.9.2.1.3 0 .4-.1l.6-.5c.2-.2.4-.2.7-.1l1.7.7c.5.2.5.4.5.6 0 .3 0 .8-.7 1.1-.6.3-1.4.5-2.1.3-1.2-.4-2.6-1.4-3.6-2.4-1-1-2-2.4-2.4-3.6-.2-.7 0-1.5.3-2.1Z" />
    </svg>
  );
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function ClipboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 3h6l1 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3z" />
      <path d="M9 3a2 2 0 0 0-2 2v0h10v0a2 2 0 0 0-2-2" />
    </svg>
  );
}

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/admin', icon: DashboardIcon },
  { label: 'Services', href: '/admin/services', icon: CalendarIcon },
  {
    label: 'Users',
    href: '/admin/users',
    icon: UsersIcon,
    subItems: [
      { label: 'Add User', href: '/admin/users/addUsers', icon: PlusUserIcon },
      { label: 'Update User', href: '/admin/users/updateUsers', icon: EditUserIcon },
    ],
  },
  { label: 'Attendees', href: '/admin/attendees', icon: AttendeesIcon },
  { label: 'WhatsApp Attendees', href: '/admin/whatsapp', icon: WhatsappIcon },
  { label: 'Message Attendees', href: '/admin/messages', icon: MailIcon },
  { label: 'Follow-up Assignments', href: '/admin/users/tasks', icon: ClipboardIcon },
];

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(
    pathname.startsWith('/admin/users') ? 'Users' : null
  );

  useEffect(() => {
    const warmupRoutes = menuItems
      .flatMap((item) =>
        item.subItems ? [item.href, ...item.subItems.map((sub) => sub.href)] : [item.href]
      )
      .filter((href) => href !== pathname);

    warmupRoutes.forEach((href) => router.prefetch(href));
  }, [pathname, router]);

  useEffect(() => {
    if (pathname.startsWith('/admin/users')) {
      setOpenDropdown('Users');
    }
  }, [pathname]);

  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  }, []);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      onClose();
      router.push('/');
      router.refresh();
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, onClose, router]);

  const items = useMemo(() => menuItems, []);

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-68 flex-col border-r border-red-950/20 bg-gradient-to-b from-red-950 via-red-900 to-red-950 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:sticky md:top-0 md:translate-x-0`}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-red-200">Church Admin</p>
              <h1 className="mt-1.5 text-lg font-semibold tracking-wide">Attendance Records</h1>
              <p className="mt-1 text-sm leading-6 text-red-100/80">Manage services, attendees, follow-up, and outreach.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-red-200 transition hover:bg-white/10 hover:text-white md:hidden">
              ✕
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-hidden px-3 py-3">
          <div className="space-y-1">
            {items.map((item) => {
              const isActive = (() => {
                if (item.href === '/admin') {
                  return pathname === '/admin';
                }

                if (item.subItems) {
                  return pathname === item.href || pathname.startsWith(`${item.href}/`);
                }

                return pathname === item.href || pathname.startsWith(item.href + '/');
              })();

              const Icon = item.icon;

              return (
                <div key={item.label}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                          isActive ? 'bg-white/14 text-white shadow-sm' : 'text-red-100/85 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`rounded-lg p-2 ${isActive ? 'bg-white/15' : 'bg-white/8'}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />
                      </button>

                      {openDropdown === item.label && (
                        <div className="ml-4 mt-1.5 space-y-1 border-l border-white/10 pl-4">
                          {item.subItems.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            const SubIcon = subItem.icon;

                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                prefetch
                                onClick={onClose}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                                  isSubActive ? 'bg-white/14 text-white shadow-sm' : 'text-red-100/80 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                <SubIcon className="h-4 w-4" />
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      prefetch
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive ? 'bg-white/14 text-white shadow-sm' : 'text-red-100/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className={`rounded-lg p-2 ${isActive ? 'bg-white/15' : 'bg-white/8'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="space-y-2">
            <Link
              href="/"
              prefetch
              className="flex items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-red-50 transition hover:bg-white/10"
            >
              ← Back to Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-red-50 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default memo(Sidebar);
