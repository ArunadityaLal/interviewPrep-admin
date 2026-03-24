import { redirect } from 'next/navigation';

export default function LegacyDashboardInterviewersPage() {
  redirect('/admin/interviewers');
}
