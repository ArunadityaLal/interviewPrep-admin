'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AdminConfigPage() {
  const [roles, setRoles] = useState([
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'DevOps Engineer',
  ]);
  const [newRole, setNewRole] = useState('');

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Config</p>
          <h1 className="page-title">Platform Configuration</h1>
          <p className="page-subtitle">Editable local settings for roles, levels, and defaults.</p>
        </div>
      </header>

      <div className="stack">
        <Card variant="elevated">
          <h2 className="section-title">Supported Roles</h2>
          <div className="inline-form">
            <Input value={newRole} onChange={(event) => setNewRole(event.target.value)} placeholder="Add a role" />
            <Button
              type="button"
              onClick={() => {
                if (!newRole.trim()) return;
                setRoles((current) => [...current, newRole.trim()]);
                setNewRole('');
              }}
            >
              Add Role
            </Button>
          </div>

          <div className="chip-grid">
            {roles.map((role) => (
              <div className="chip-card" key={role}>
                <span>{role}</span>
                <button className="text-button" onClick={() => setRoles((current) => current.filter((item) => item !== role))}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated">
          <h2 className="section-title">Session Defaults</h2>
          <div className="list">
            <div className="list-row">
              <div>
                <p className="list-title">Default Interview Duration</p>
                <p className="list-meta">Standard mock interview slot</p>
              </div>
              <span className="badge info">60 minutes</span>
            </div>
            <div className="list-row">
              <div>
                <p className="list-title">Guidance Duration</p>
                <p className="list-meta">Flexible guidance session length</p>
              </div>
              <span className="badge info">30 to 60 minutes</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
