import React, { useRef, useState } from 'react';
import { activities } from '../data/activities';
import type { LessonActivity as LessonActivityData } from '../data/activities';
import { LessonActivity } from '../components/Activities/LessonActivity';
import { supabase } from '../store/supabaseClient';
import './LandingView.css';

const REDIRECT_URL = `${window.location.origin}${window.location.pathname}`;
const demoActivity = activities.find(a => a.id === 'quiz-m') as LessonActivityData;

interface LandingViewProps {
  onSignIn: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSignIn }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  function scrollToGame() {
    gameRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: REDIRECT_URL },
    });
    setLoading(false);
    if (error) setAuthError(error.message);
    else setSent(true);
  }

  return (
    <div className="landing">
      <nav className="landing__nav">
        <span className="landing__brand">Time to Read</span>
        <button className="landing__nav-signin" onClick={onSignIn}>Sign in</button>
      </nav>

      <header className="landing__hero">
        <div className="landing__hero-text">
          <h1 className="landing__title">
            Learning to read,<br />
            <span className="landing__title-accent">one sound at a time.</span>
          </h1>
          <p className="landing__subtitle">
            Phonics-based games that guide early readers through letters,
            sounds, and words — with a friendly guide every step of the way.
          </p>
          <button className="landing__try-btn" onClick={scrollToGame}>
            Try it &nbsp;↓↓↓
          </button>
        </div>
      </header>

      <div className="landing__game-wrapper" ref={gameRef}>
        {!gameComplete ? (
          <LessonActivity
            activity={demoActivity}
            onComplete={() => setGameComplete(true)}
            onBack={() => { }}
          />
        ) : (
          <div className="landing__signup">
            {sent ? (
              <div className="landing__signup-sent">
                <div className="landing__signup-icon">📬</div>
                <h2>Check your email</h2>
                <p>We sent a sign-in link to <strong>{email}</strong>. Click it to open the app.</p>
              </div>
            ) : (
              <>
                <div className="landing__signup-icon">🌟</div>
                <h2>Sign up to save progress</h2>
                <p>Create a free account and your child's progress will be saved across all their lessons.</p>
                <form className="landing__signup-form" onSubmit={handleSignup}>
                  <input
                    type="email"
                    className="landing__signup-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  {authError && <p className="landing__signup-error">{authError}</p>}
                  <button
                    type="submit"
                    className="landing__signup-submit"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? 'Sending…' : 'Create free account'}
                  </button>
                </form>
                <button className="landing__signup-existing" onClick={onSignIn}>
                  Already have an account? Sign in
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <section className="landing__features">
        <div className="landing__feature">
          <span className="landing__feature-icon">🔤</span>
          <strong>Research-backed sequence</strong>
          <span>27 zones from basic letter sounds to advanced patterns</span>
        </div>
        <div className="landing__feature">
          <span className="landing__feature-icon">🎮</span>
          <strong>Games kids love</strong>
          <span>Audio-led activities with friendly characters and instant feedback</span>
        </div>
        <div className="landing__feature">
          <span className="landing__feature-icon">📈</span>
          <strong>Progress you can see</strong>
          <span>Track exactly which sounds your child has mastered</span>
        </div>
      </section>

      <footer className="landing__footer">
        <span>© 2025 Time to Read</span>
        <button className="landing__footer-signin" onClick={onSignIn}>Sign in to your account →</button>
      </footer>
    </div>
  );
};
