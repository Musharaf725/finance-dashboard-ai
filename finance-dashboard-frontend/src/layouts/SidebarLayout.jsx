import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth.jsx';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .sl-root {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #F4F2EC;
  }

  .sl-root *, .sl-root *::before, .sl-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── Sidebar ── */
  .sl-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: #1A1A16;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }

  /* Subtle texture overlay */
  .sl-sidebar::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* ── Brand ── */
  .sl-brand {
    padding: 32px 24px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    position: relative;
  }

  .sl-brand-mark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .sl-brand-icon {
    width: 30px;
    height: 30px;
    background: #639922;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .sl-brand-icon svg {
    width: 16px;
    height: 16px;
    stroke: #EAF3DE;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .sl-brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 500;
    color: #F0EDE4;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .sl-brand-tagline {
    font-size: 10.5px;
    color: #4A4840;
    font-weight: 300;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding-left: 40px;
  }

  /* ── Nav ── */
  .sl-nav {
    flex: 1;
    padding: 20px 14px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sl-nav-section-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #3A3830;
    padding: 0 10px;
    margin-bottom: 8px;
    margin-top: 4px;
  }

  .sl-nav-link {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 12px;
    border-radius: 9px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 400;
    color: #6A6860;
    transition: background 0.15s ease, color 0.15s ease;
    position: relative;
    overflow: hidden;
  }

  .sl-nav-link:hover {
    background: rgba(255,255,255,0.05);
    color: #C8C4B8;
  }

  .sl-nav-link.active {
    background: rgba(99,153,34,0.15);
    color: #97C459;
  }

  .sl-nav-link.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 2.5px;
    background: #639922;
    border-radius: 0 2px 2px 0;
  }

  .sl-nav-icon {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    opacity: 0.7;
  }

  .sl-nav-link.active .sl-nav-icon {
    opacity: 1;
  }

  .sl-nav-label {
    flex: 1;
  }

  /* ── Footer / User ── */
  .sl-footer {
    padding: 16px 14px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .sl-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 10px;
  }

  .sl-user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #3B6D11;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: #C0DD97;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  .sl-user-info {
    flex: 1;
    min-width: 0;
  }

  .sl-user-name {
    font-size: 13px;
    font-weight: 500;
    color: #D0CCC0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sl-user-role {
    font-size: 10px;
    color: #4A4840;
    font-weight: 400;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-top: 1px;
  }

  .sl-logout-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 12px;
    border-radius: 9px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.07);
    color: #4A4840;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    text-align: left;
  }

  .sl-logout-btn:hover {
    background: rgba(216,90,48,0.1);
    color: #D85A30;
    border-color: rgba(216,90,48,0.2);
  }

  .sl-logout-btn svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.8;
  }

  /* ── Main content ── */
  .sl-main {
    flex: 1;
    overflow: auto;
    min-width: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sl-sidebar {
      width: 64px;
    }
    .sl-brand-name,
    .sl-brand-tagline,
    .sl-nav-label,
    .sl-nav-section-label,
    .sl-user-info,
    .sl-logout-btn span {
      display: none;
    }
    .sl-brand-mark { justify-content: center; }
    .sl-brand { padding: 20px 16px; }
    .sl-nav { padding: 16px 8px; }
    .sl-nav-link { justify-content: center; padding: 11px; }
    .sl-nav-link.active::before { display: none; }
    .sl-user-card { justify-content: center; padding: 10px; }
    .sl-footer { padding: 12px 8px 20px; }
    .sl-logout-btn { justify-content: center; padding: 10px; }
  }
`;

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Records',
    path: '/records',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Budgets',
    path: '/budgets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="13" x2="14" y2="13" />
        <line x1="7" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
  {
    label: 'Goals',
    path: '/goals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3" />
        <path d="M22 12h-3" />
        <path d="M12 22v-3" />
        <path d="M2 12h3" />
      </svg>
    ),
  },
  {
    label: 'Users',
    path: '/users',
    adminOnly: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function SidebarLayout() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="sl-root">
      <style>{css}</style>

      <aside className="sl-sidebar">
        {/* Brand */}
        <div className="sl-brand">
          <div className="sl-brand-mark">
            <div className="sl-brand-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <span className="sl-brand-name">Finance<br />Dashboard</span>
          </div>
          <p className="sl-brand-tagline">Analytics Platform</p>
        </div>

        {/* Nav */}
        <nav className="sl-nav" aria-label="Main navigation">
          <p className="sl-nav-section-label">Menu</p>
          {navItems.map((item) => {
            if (item.adminOnly && currentUser?.role !== 'ADMIN') return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sl-nav-link${isActive ? ' active' : ''}`
                }
              >
                <span className="sl-nav-icon">{item.icon}</span>
                <span className="sl-nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sl-footer">
          <div className="sl-user-card">
            <div className="sl-user-avatar">
              {getInitials(currentUser?.name)}
            </div>
            <div className="sl-user-info">
              <p className="sl-user-name">{currentUser?.name}</p>
              <p className="sl-user-role">{currentUser?.role}</p>
            </div>
          </div>

          <button className="sl-logout-btn" onClick={logout}>
            <svg viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="sl-main">
        <Outlet />
      </main>
    </div>
  );
}