import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.jsx';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .login-root *,
  .login-root *::before,
  .login-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .login-root {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #F5F3EE;
  }

  /* ── Left panel ── */
  .login-panel-left {
    width: 420px;
    flex-shrink: 0;
    background: #1A1A18;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 48px;
    position: relative;
    overflow: hidden;
  }

  .login-panel-left::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,153,34,0.18) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-panel-left::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .login-brand-icon {
    width: 38px;
    height: 38px;
    background: #639922;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-brand-icon svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: #EAF3DE;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .login-brand-name {
    font-size: 15px;
    font-weight: 500;
    color: #E8E6DF;
    letter-spacing: 0.01em;
  }

  .login-panel-left-body {
    padding-bottom: 12px;
  }

  .login-panel-left-tagline {
    font-family: 'DM Serif Display', serif;
    font-size: 38px;
    line-height: 1.15;
    color: #F0EDE4;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }

  .login-panel-left-tagline em {
    font-style: italic;
    color: #97C459;
  }

  .login-panel-left-sub {
    font-size: 14px;
    color: #7A786F;
    line-height: 1.65;
    max-width: 260px;
    font-weight: 300;
  }

  .login-panel-left-footer {
    font-size: 12px;
    color: #4A4942;
    font-weight: 300;
  }

  /* ── Right panel ── */
  .login-panel-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
  }

  .login-card-heading {
    margin-bottom: 36px;
  }

  .login-card-heading h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: #1A1A18;
    font-weight: 400;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }

  .login-card-heading p {
    font-size: 14px;
    color: #8A8880;
    font-weight: 300;
  }

  /* ── Form ── */
  .login-field {
    margin-bottom: 22px;
  }

  .login-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #5A5852;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .login-input {
    width: 100%;
    height: 48px;
    padding: 0 16px;
    background: #FFFFFF;
    border: 1.5px solid #E0DDD6;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: #1A1A18;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .login-input::placeholder {
    color: #C0BDB5;
    font-weight: 300;
  }

  .login-input:hover {
    border-color: #C5C2BA;
  }

  .login-input:focus {
    border-color: #639922;
    box-shadow: 0 0 0 3px rgba(99,153,34,0.12);
  }

  /* ── Error ── */
  .login-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #FFF8F5;
    border: 1.5px solid #F09575;
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 22px;
  }

  .login-error-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .login-error-text {
    font-size: 13.5px;
    color: #993C1D;
    line-height: 1.5;
    font-weight: 400;
  }

  /* ── Submit button ── */
  .login-submit {
    width: 100%;
    height: 50px;
    background: #1A1A18;
    color: #EAF3DE;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }

  .login-submit:hover:not(:disabled) {
    background: #2C2C28;
  }

  .login-submit:active:not(:disabled) {
    transform: scale(0.99);
  }

  .login-submit:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .login-submit-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(234,243,222,0.3);
    border-top-color: #EAF3DE;
    border-radius: 50%;
    animation: login-spin 0.7s linear infinite;
  }

  @keyframes login-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Responsive ── */
  @media (max-width: 720px) {
    .login-panel-left {
      display: none;
    }
    .login-root {
      background: #F5F3EE;
    }
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* Left brand panel */}
        <aside className="login-panel-left" aria-hidden="true">
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="login-brand-name">Finance Dashboard</span>
          </div>

          <div className="login-panel-left-body">
            <h2 className="login-panel-left-tagline">
              Your data,<br /><em>clearly</em><br />presented.
            </h2>
            <p className="login-panel-left-sub">
              Real-time analytics and reporting for financial teams who need clarity, not complexity.
            </p>
          </div>

          <p className="login-panel-left-footer">
            Secure · Encrypted · SOC 2 compliant
          </p>
        </aside>

        {/* Right form panel */}
        <main className="login-panel-right">
          <div className="login-card">
            <div className="login-card-heading">
              <h1>Welcome back</h1>
              <p>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="login-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="login-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <svg className="login-error-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="login-error-text">{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-submit-spinner" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </main>

      </div>
    </>
  );
}