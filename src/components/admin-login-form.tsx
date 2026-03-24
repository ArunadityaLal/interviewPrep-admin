'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function AdminLoginForm({ urlError }: { urlError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const displayError =
    error ||
    (urlError === 'unauthorized_google'
      ? 'This Google account is not allowed for admin access.'
      : '');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.replace('/admin/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signIn('google', {
        callbackUrl: '/admin/dashboard',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-icon">A</div>
        <div className="auth-center">
          <p className="eyebrow">InterviewPrep Live</p>
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">Restricted access for platform administrators only.</p>
        </div>

        <button
          className="ghost-button google-button"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
        >
          {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        <div className="divider-row">
          <span>Email and password</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span className="field-label">Admin Email</span>
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@yourcompany.com"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {displayError ? <p className="error-text">{displayError}</p> : null}

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <p className="auth-footnote">
          Admin access uses credentials from your environment config. Return to{' '}
          <Link href="/">home</Link>.
        </p>
      </div>
    </div>
  );
}
