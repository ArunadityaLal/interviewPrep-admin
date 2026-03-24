import { redirect } from 'next/navigation';

export default function LegacyDashboardManualRequestsPage() {
  redirect('/admin/interviewers');
}
