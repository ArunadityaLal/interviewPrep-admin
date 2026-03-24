import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { AdminShell } from '@/components/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAuth(['ADMIN']);
  } catch {
    redirect('/login/admin');
  }

  return <AdminShell>{children}</AdminShell>;
}
