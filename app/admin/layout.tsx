import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';
import {
  AUTH_COOKIE_NAME,
  verifyAuthSessionToken,
} from '../../lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await verifyAuthSessionToken(
    cookieStore.get(AUTH_COOKIE_NAME)?.value
  );

  if (session?.role !== 'admin') {
    redirect('/auth/login?next=/admin');
  }

  return <AdminShell>{children}</AdminShell>;
}
