'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';

interface AnalyticsResponse {
  analytics: {
    totalStudents: number;
    totalInterviewers: number;
    pendingInterviewers: number;
    approvedInterviewers: number;
    totalSessions: number;
    completedSessions: number;
    guidanceSessions: number;
    interviewSessions: number;
  };
  recentSessions: Array<{
    id: number;
    scheduledTime: string;
    status: string;
    student: { name: string | null };
    interviewer: { name: string | null };
  }>;
  topInterviewers: Array<{
    id: number;
    name: string;
    rolesSupported: string[];
    sessionCount: number;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login/admin');
            router.refresh();
            return;
          }
          setError(result.error || 'Failed to load dashboard analytics.');
          return;
        }

        setData(result);
      } catch {
        setError('Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return <div className="empty-state">Loading admin dashboard...</div>;
  }

  if (!data || !data.analytics) {
    return <div className="empty-state">{error || 'Failed to load dashboard analytics.'}</div>;
  }

  const stats = [
    { label: 'Total Students', value: data.analytics.totalStudents },
    { label: 'Total Interviewers', value: data.analytics.totalInterviewers },
    { label: 'Pending Approval', value: data.analytics.pendingInterviewers },
    { label: 'Completed Sessions', value: data.analytics.completedSessions },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1 className="page-title">Platform overview</h1>
          <p className="page-subtitle">A clean snapshot of operations, interviewers, and sessions.</p>
        </div>
        <div className="header-actions">
          <Link href="/admin/interviewers" className="button small-button">
            Manage Interviewers
          </Link>
          <Link href="/admin/analytics" className="ghost-button">
            Full Analytics
          </Link>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <Card variant="elevated">
          <h2 className="section-title">Top Interviewers</h2>
          <div className="list">
            {data.topInterviewers.length === 0 ? (
              <div className="empty-state">No interviewers available yet.</div>
            ) : (
              data.topInterviewers.map((interviewer, index) => (
                <div className="list-row" key={interviewer.id}>
                  <div>
                    <p className="list-title">
                      #{index + 1} {interviewer.name}
                    </p>
                    <p className="list-meta">{interviewer.rolesSupported.slice(0, 2).join(', ') || 'Generalist'}</p>
                  </div>
                  <span className="badge info">{interviewer.sessionCount} sessions</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card variant="elevated">
          <h2 className="section-title">Recent Sessions</h2>
          <div className="list">
            {data.recentSessions.length === 0 ? (
              <div className="empty-state">No recent sessions yet.</div>
            ) : (
              data.recentSessions.map((session) => (
                <div className="list-row" key={session.id}>
                  <div>
                    <p className="list-title">
                      {session.student.name || 'Student'} to {session.interviewer.name || 'Interviewer'}
                    </p>
                    <p className="list-meta">{formatDateTime(session.scheduledTime)}</p>
                  </div>
                  <span className={`badge ${session.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                    {session.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </>
  );
}
