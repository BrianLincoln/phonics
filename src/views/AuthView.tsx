import React, { useState } from 'react';
import { supabase } from '../store/supabaseClient';
import './AuthView.css';

const REDIRECT_URL = `${window.location.origin}${window.location.pathname}`;

export const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: REDIRECT_URL },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="auth-view">
      <div className="auth-view__card">
        <div className="auth-view__logo">🐦</div>
        <h1 className="auth-view__title">Phonics</h1>

        {sent ? (
          <div className="auth-view__sent">
            <div className="auth-view__sent-icon">📬</div>
            <p className="auth-view__sent-title">Check your email!</p>
            <p className="auth-view__sent-text">
              We sent a sign-in link to <strong>{email}</strong>.<br />
              Click it to open the app.
            </p>
            <button className="auth-view__resend" onClick={() => setSent(false)}>
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p className="auth-view__subtitle">
              Enter your email to sign in. We'll send you a magic link — no password needed.
            </p>
            <input
              className="auth-view__input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            {error && <p className="auth-view__error">{error}</p>}
            <button className="auth-view__button" type="submit" disabled={loading || !email.trim()}>
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
