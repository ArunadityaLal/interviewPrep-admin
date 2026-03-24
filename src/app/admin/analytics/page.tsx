'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatDateTime } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
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
          setError(result.error || 'Failed to load analytics.');
          return;
        }

        setData(result);
      } catch {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div className="empty-state">Loading analytics...</div>;
  if (!data || !data.analytics) return <div className="empty-state">{error || 'Failed to load analytics.'}</div>;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1 className="page-title">Platform Analytics</h1>
          <p className="page-subtitle">Session throughput, interviewer activity, and marketplace health.</p>
        </div>
      </header>

      <section className="stats-grid">
        {[
          ['Total Students', data.analytics.totalStudents],
          ['Total Interviewers', data.analytics.totalInterviewers],
          ['Completed Sessions', data.analytics.completedSessions],
          ['Scheduled Sessions', data.analytics.scheduledSessions],
          ['Guidance Sessions', data.analytics.guidanceSessions],
          ['Mock Interviews', data.analytics.interviewSessions],
        ].map(([label, value]) => (
          <article className="stat-card" key={String(label)}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <Card variant="elevated">
          <h2 className="section-title">Top Interviewers</h2>
          <div className="list">
            {data.topInterviewers.map((interviewer: any, index: number) => (
              <div className="list-row" key={interviewer.id}>
                <div>
                  <p className="list-title">
                    #{index + 1} {interviewer.name}
                  </p>
                  <p className="list-meta">{(interviewer.rolesSupported ?? []).slice(0, 2).join(', ')}</p>
                </div>
                <span className="badge info">{interviewer.sessionCount} sessions</span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated">
          <h2 className="section-title">Recent Sessions</h2>
          <div className="list">
            {data.recentSessions.map((session: any) => (
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
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
