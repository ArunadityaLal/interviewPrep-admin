import { AdminLoginForm } from '@/components/admin-login-form';

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return <AdminLoginForm urlError={searchParams?.error} />;
}
