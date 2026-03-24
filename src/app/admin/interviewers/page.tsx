'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function AdminInterviewersPage() {
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [tab, setTab] = useState<'interviewers' | 'requests'>('interviewers');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [interviewersResponse, requestsResponse] = await Promise.all([
        fetch('/api/admin/interviewers'),
        fetch('/api/admin/manual-requests?status=PENDING'),
      ]);

      const interviewersData = await interviewersResponse.json();
      const requestsData = await requestsResponse.json();
      setInterviewers(interviewersData.interviewers || []);
      setRequests(requestsData.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const updateStatus = async (interviewerId: number, status: string) => {
    await fetch('/api/admin/interviewers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewerId, status }),
    });
    await fetchAll();
  };

  const assignRequest = async (requestId: number, interviewerId: number) => {
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await fetch('/api/admin/manual-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, interviewerId, scheduledTime, durationMinutes: 60 }),
    });
    await fetchAll();
  };

  const pendingInterviewers = interviewers.filter((item) => item.status === 'PENDING');
  const approvedInterviewers = interviewers.filter((item) => item.status === 'APPROVED');

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Manage Interviewers</p>
          <h1 className="page-title">Interviewer Operations</h1>
          <p className="page-subtitle">Approve experts and manually assign pending student requests.</p>
        </div>
      </header>

      <div className="tab-row">
        <button className={`tab-pill ${tab === 'interviewers' ? 'active' : ''}`} onClick={() => setTab('interviewers')}>
          Interviewers
        </button>
        <button className={`tab-pill ${tab === 'requests' ? 'active' : ''}`} onClick={() => setTab('requests')}>
          Pending Requests
        </button>
      </div>

      {loading ? <div className="empty-state">Loading interviewer data...</div> : null}

      {!loading && tab === 'interviewers' ? (
        <div className="stack">
          <Card variant="elevated">
            <h2 className="section-title">Pending Approval</h2>
            <div className="list">
              {pendingInterviewers.length === 0 ? (
                <div className="empty-state">No interviewers are waiting for approval.</div>
              ) : (
                pendingInterviewers.map((interviewer) => (
                  <div className="list-row align-start" key={interviewer.id}>
                    <div>
                      <p className="list-title">{interviewer.name}</p>
                      <p className="list-meta">
                        {interviewer.user.email} • {interviewer.companies.join(', ') || 'No companies listed'}
                      </p>
                    </div>
                    <div className="action-row">
                      <Button size="sm" onClick={() => updateStatus(interviewer.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(interviewer.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card variant="elevated">
            <h2 className="section-title">Approved Interviewers</h2>
            <div className="list">
              {approvedInterviewers.map((interviewer) => (
                <div className="list-row" key={interviewer.id}>
                  <div>
                    <p className="list-title">{interviewer.name}</p>
                    <p className="list-meta">
                      {interviewer.user.email} • {(interviewer.rolesSupported || []).join(', ')}
                    </p>
                  </div>
                  <span className="badge success">{interviewer.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {!loading && tab === 'requests' ? (
        <Card variant="elevated">
          <h2 className="section-title">Pending Manual Requests</h2>
          <div className="list">
            {requests.length === 0 ? (
              <div className="empty-state">No pending manual booking requests.</div>
            ) : (
              requests.map((request) => (
                <div className="list-row align-start" key={request.id}>
                  <div>
                    <p className="list-title">{request.student.user.email}</p>
                    <p className="list-meta">
                      {request.sessionType} • {request.role || request.topic || 'General request'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      assignRequest(
                        request.id,
                        request.preferredInterviewerId ||
                          approvedInterviewers[0]?.id
                      )
                    }
                    disabled={!request.preferredInterviewerId && approvedInterviewers.length === 0}
                  >
                    Auto Assign
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}
    </>
  );
}
