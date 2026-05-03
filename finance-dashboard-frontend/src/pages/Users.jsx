import { useEffect, useState } from 'react';
import { fetchUsers, deleteUser, updateUserRole } from '../services/usersService.js';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .us-root {
    min-height: 100vh;
    background: #F4F2EC;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 48px 64px;
    box-sizing: border-box;
  }

  .us-root *, .us-root *::before, .us-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  /* ── Header ── */
  .us-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px;
    border-bottom: 1px solid #D8D4C8;
    padding-bottom: 24px;
  }

  .us-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
  }

  .us-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .us-count-pill {
    padding: 5px 14px;
    background: #1A1A16;
    color: #C0DD97;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    align-self: flex-end;
    margin-bottom: 6px;
  }

  /* ── Error ── */
  .us-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #FFF6F4;
    border: 1px solid #F0B5A0;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 24px;
  }
  .us-error svg { flex-shrink: 0; margin-top: 1px; }
  .us-error-text { font-size: 13.5px; color: #993C1D; line-height: 1.5; }

  /* ── Skeleton ── */
  .us-skeleton {
    background: linear-gradient(90deg, #EAE7DF 25%, #F4F2EC 50%, #EAE7DF 75%);
    background-size: 200% 100%;
    animation: us-shimmer 1.4s infinite;
    border-radius: 10px;
  }
  @keyframes us-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Table card ── */
  .us-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 16px;
    overflow: hidden;
    animation: us-fadeUp 0.35s ease both;
  }
  @keyframes us-fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .us-table-wrap { overflow-x: auto; }

  table.us-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 580px;
  }

  .us-table thead tr { border-bottom: 1px solid #EAE7DF; }

  .us-table thead th {
    padding: 14px 20px;
    text-align: left;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9A9588;
    background: #FAFAF7;
    white-space: nowrap;
  }

  .us-table tbody tr {
    border-bottom: 1px solid #F0EDE6;
    transition: background 0.12s;
  }
  .us-table tbody tr:last-child { border-bottom: none; }
  .us-table tbody tr:hover { background: #FAFAF7; }

  .us-table td {
    padding: 15px 20px;
    font-size: 13.5px;
    color: #3A3830;
    vertical-align: middle;
    white-space: nowrap;
  }

  /* ── User cell (avatar + email) ── */
  .us-user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .us-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #EAE7DF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11.5px;
    font-weight: 500;
    color: #5A5850;
    flex-shrink: 0;
    letter-spacing: 0.03em;
  }

  .us-avatar.admin  { background: #EAF3DE; color: #3B6D11; }
  .us-avatar.analyst { background: #E6F1FB; color: #185FA5; }
  .us-avatar.viewer { background: #F4F2EC; color: #7A7669; }

  .us-email { font-weight: 400; color: #1A1A16; }

  /* ── Date cell ── */
  .us-date { color: #A09C8E; font-weight: 300; }

  /* ── Role select ── */
  .us-role-wrap { position: relative; display: inline-flex; align-items: center; }

  .us-role-select {
    appearance: none;
    padding: 6px 28px 6px 10px;
    border-radius: 8px;
    border: 1.5px solid #E4E0D6;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: #5A5850;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .us-role-select:focus { border-color: #639922; box-shadow: 0 0 0 3px rgba(99,153,34,0.1); }
  .us-role-select:hover { border-color: #C8C4B8; }

  /* Role-specific tints */
  .us-role-select.role-ADMIN   { background: #EAF3DE; border-color: #B4D880; color: #3B6D11; }
  .us-role-select.role-ANALYST { background: #E6F1FB; border-color: #85B7EB; color: #185FA5; }
  .us-role-select.role-VIEWER  { background: #F4F2EC; border-color: #D8D4C8; color: #7A7669; }

  .us-role-wrap::after {
    content: '';
    position: absolute;
    right: 9px;
    top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    border-top: 4.5px solid currentColor;
    pointer-events: none;
    opacity: 0.6;
  }

  /* ── Delete button ── */
  .us-btn-delete {
    padding: 5px 12px;
    border-radius: 7px;
    border: 1px solid #E8E5DD;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: #C0BAB0;
    cursor: pointer;
    transition: all 0.15s;
  }
  .us-btn-delete:hover { background: #FFF0EB; color: #993C1D; border-color: #F0B5A0; }

  /* ── Empty state ── */
  .us-empty {
    padding: 64px 24px;
    text-align: center;
  }
  .us-empty-icon { width: 48px; height: 48px; margin: 0 auto 14px; opacity: 0.15; }
  .us-empty-text { font-size: 14px; color: #A09C8E; font-weight: 300; }

  /* ── Responsive ── */
  @media (max-width: 720px) {
    .us-root { padding: 24px 16px 48px; }
    .us-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
`;

const ROLE_ORDER = ['VIEWER', 'ANALYST', 'ADMIN'];

function getInitials(email = '') {
  const parts = email.split('@')[0].split(/[._-]/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

function avatarClass(role = '') {
  return { ADMIN: 'admin', ANALYST: 'analyst', VIEWER: 'viewer' }[role] ?? '';
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers({ page: 1, limit: 50 });
      setUsers(data.items);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to delete user');
    }
  };

  return (
    <div className="us-root">
      <style>{css}</style>

      {/* Header */}
      <div className="us-header">
        <div>
          <p className="us-eyebrow">Admin</p>
          <h1 className="us-title">Users</h1>
        </div>
        {!loading && (
          <span className="us-count-pill">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        )}
      </div>

      {error && (
        <div className="us-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="us-error-text">{error}</span>
        </div>
      )}

      {/* Skeleton loader */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="us-skeleton" style={{ height: 56, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      ) : (
        <div className="us-card">
          <div className="us-table-wrap">
            <table className="us-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Member since</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>

                      {/* User column — avatar + email */}
                      <td>
                        <div className="us-user-cell">
                          <div className={`us-avatar ${avatarClass(user.role)}`}>
                            {getInitials(user.email)}
                          </div>
                          <span className="us-email">{user.email}</span>
                        </div>
                      </td>

                      {/* Role select */}
                      <td>
                        <div className="us-role-wrap">
                          <select
                            className={`us-role-select role-${user.role}`}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          >
                            {ROLE_ORDER.map((r) => (
                              <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="us-date">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>

                      {/* Delete */}
                      <td>
                        <button className="us-btn-delete" onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="us-empty">
                        <svg className="us-empty-icon" viewBox="0 0 48 48" fill="none" stroke="#1A1A16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="24" cy="18" r="8" />
                          <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" />
                        </svg>
                        <p className="us-empty-text">No users found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}