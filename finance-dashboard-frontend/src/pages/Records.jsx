import { useEffect, useState } from 'react';
import { fetchRecords, createRecord, updateRecord, deleteRecord } from '../services/recordsService.js';
import { useAuth } from '../context/useAuth.jsx';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .rc-root {
    min-height: 100vh;
    background: #F4F2EC;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 48px 64px;
    box-sizing: border-box;
  }

  .rc-root *, .rc-root *::before, .rc-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  /* ── Header ── */
  .rc-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 32px;
    border-bottom: 1px solid #D8D4C8;
    padding-bottom: 24px;
  }

  .rc-header-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
  }

  .rc-header-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .rc-create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    background: #1A1A16;
    color: #EAF3DE;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    white-space: nowrap;
  }

  .rc-create-btn:hover { background: #2C2C28; }
  .rc-create-btn:active { transform: scale(0.98); }

  .rc-create-btn svg {
    width: 15px; height: 15px;
    stroke: currentColor; fill: none;
    stroke-width: 2.5; stroke-linecap: round;
  }

  /* ── Error ── */
  .rc-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #FFF6F4;
    border: 1px solid #F0B5A0;
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 24px;
  }

  .rc-error svg { flex-shrink: 0; margin-top: 1px; }

  .rc-error-text { font-size: 13.5px; color: #993C1D; line-height: 1.5; }

  /* ── Skeleton ── */
  .rc-skeleton {
    background: linear-gradient(90deg, #EAE7DF 25%, #F4F2EC 50%, #EAE7DF 75%);
    background-size: 200% 100%;
    animation: rc-shimmer 1.4s infinite;
    border-radius: 10px;
  }
  @keyframes rc-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Table card ── */
  .rc-table-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 16px;
    overflow: hidden;
    animation: rc-fadeUp 0.35s ease both;
  }
  @keyframes rc-fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .rc-table-wrap { overflow-x: auto; }

  table.rc-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 640px;
  }

  .rc-table thead tr {
    border-bottom: 1px solid #EAE7DF;
  }

  .rc-table thead th {
    padding: 14px 20px;
    text-align: left;
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9A9588;
    white-space: nowrap;
    background: #FAFAF7;
  }

  .rc-table tbody tr {
    border-bottom: 1px solid #F0EDE6;
    transition: background 0.12s;
  }

  .rc-table tbody tr:last-child { border-bottom: none; }
  .rc-table tbody tr:hover { background: #FAFAF7; }

  .rc-table td {
    padding: 15px 20px;
    font-size: 13.5px;
    color: #3A3830;
    white-space: nowrap;
    vertical-align: middle;
  }

  .rc-table td.muted { color: #A09C8E; font-weight: 300; }

  .rc-amount {
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    color: #1A1A16;
  }

  .rc-amount.income { color: #3B6D11; }
  .rc-amount.expense { color: #993C1D; }

  /* ── Type badge ── */
  .rc-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .rc-badge.income {
    background: #EAF3DE;
    color: #3B6D11;
  }

  .rc-badge.expense {
    background: #FFF0EB;
    color: #993C1D;
  }

  .rc-badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .rc-badge.income .rc-badge-dot { background: #639922; }
  .rc-badge.expense .rc-badge-dot { background: #D85A30; }

  /* ── Action buttons ── */
  .rc-actions { display: flex; align-items: center; gap: 6px; }

  .rc-btn-edit, .rc-btn-delete {
    padding: 5px 12px;
    border-radius: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s;
  }

  .rc-btn-edit {
    background: #F4F2EC;
    color: #5A5850;
    border-color: #E0DDD6;
  }
  .rc-btn-edit:hover { background: #1A1A16; color: #EAF3DE; border-color: #1A1A16; }

  .rc-btn-delete {
    background: transparent;
    color: #C0BAB0;
    border-color: #E8E5DD;
  }
  .rc-btn-delete:hover { background: #FFF0EB; color: #993C1D; border-color: #F0B5A0; }

  /* ── Empty state ── */
  .rc-empty {
    padding: 64px 24px;
    text-align: center;
  }

  .rc-empty-icon {
    width: 48px; height: 48px;
    margin: 0 auto 16px;
    opacity: 0.18;
  }

  .rc-empty-text {
    font-size: 14px;
    color: #A09C8E;
    font-weight: 300;
  }

  /* ── Modal backdrop ── */
  .rc-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20,20,16,0.55);
    backdrop-filter: blur(3px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: rc-fadeIn 0.15s ease;
  }
  @keyframes rc-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* ── Modal ── */
  .rc-modal {
    background: #FFFFFF;
    border-radius: 18px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 32px 64px rgba(0,0,0,0.18);
    animation: rc-slideUp 0.2s ease both;
    overflow: hidden;
  }
  @keyframes rc-slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  .rc-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 26px 28px 20px;
    border-bottom: 1px solid #F0EDE6;
  }

  .rc-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #1A1A16;
    letter-spacing: -0.01em;
  }

  .rc-modal-close {
    width: 32px; height: 32px;
    border-radius: 8px;
    border: 1px solid #E4E0D6;
    background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: #A09C8E;
    transition: all 0.15s;
  }
  .rc-modal-close:hover { background: #F4F2EC; color: #1A1A16; }
  .rc-modal-close svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; }

  .rc-modal-body { padding: 24px 28px; }

  /* ── Type toggle ── */
  .rc-type-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
  }

  .rc-type-btn {
    padding: 10px;
    border-radius: 10px;
    border: 1.5px solid #E4E0D6;
    background: #FAFAF7;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #8A8677;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: all 0.15s;
  }

  .rc-type-btn.active-income {
    background: #EAF3DE;
    border-color: #97C459;
    color: #3B6D11;
  }

  .rc-type-btn.active-expense {
    background: #FFF0EB;
    border-color: #F0A080;
    color: #993C1D;
  }

  .rc-type-btn-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
  }

  .rc-type-btn.active-income .rc-type-btn-dot { background: #639922; }
  .rc-type-btn.active-expense .rc-type-btn-dot { background: #D85A30; }

  /* ── Form fields ── */
  .rc-field { margin-bottom: 16px; }

  .rc-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }

  .rc-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #7A7669;
    margin-bottom: 7px;
  }

  .rc-input, .rc-select {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    background: #FAFAF7;
    border: 1.5px solid #E4E0D6;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #1A1A16;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
  }

  .rc-input::placeholder { color: #C0BAB0; font-weight: 300; }
  .rc-input:focus, .rc-select:focus { border-color: #639922; box-shadow: 0 0 0 3px rgba(99,153,34,0.1); }

  .rc-select-wrap { position: relative; }
  .rc-select-wrap::after {
    content: '';
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid #A09C8E;
    pointer-events: none;
  }

  /* ── Modal footer ── */
  .rc-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 28px 26px;
    border-top: 1px solid #F0EDE6;
  }

  .rc-btn-cancel {
    padding: 10px 20px;
    border-radius: 9px;
    border: 1.5px solid #E4E0D6;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #7A7669;
    cursor: pointer;
    transition: all 0.15s;
  }
  .rc-btn-cancel:hover { background: #F4F2EC; }
  .rc-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

  .rc-btn-submit {
    padding: 10px 24px;
    border-radius: 9px;
    border: none;
    background: #1A1A16;
    color: #EAF3DE;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.15s, opacity 0.15s;
  }
  .rc-btn-submit:hover:not(:disabled) { background: #2C2C28; }
  .rc-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  .rc-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(234,243,222,0.3);
    border-top-color: #EAF3DE;
    border-radius: 50%;
    animation: rc-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes rc-spin { to { transform: rotate(360deg); } }

  /* ── Responsive ── */
  @media (max-width: 720px) {
    .rc-root { padding: 24px 16px 48px; }
    .rc-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .rc-field-row { grid-template-columns: 1fr; }
  }
`;

const DEFAULT_FORM = {
  amount: '',
  type: 'income',
  category: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
};

function ErrorBanner({ message }) {
  return (
    <div className="rc-error" role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="rc-error-text">{message}</span>
    </div>
  );
}

export default function Records() {
  const { role } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadRecords = async () => {
    try {
      const data = await fetchRecords({ page: 1, limit: 50 });
      setRecords(data.items);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    loadRecords();
  }, []);

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormData(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      amount: record.amount.toString(),
      type: record.type,
      category: record.category,
      description: record.notes || '',
      date: new Date(record.date).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    setFormData(DEFAULT_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(formData.amount),
        type: formData.type.toUpperCase(),
        category: formData.category,
        date: formData.date,
        notes: formData.description || null
      };
      if (editingRecord) {
        await updateRecord(editingRecord.id, payload);
      } else {
        await createRecord(payload);
      }
      await loadRecords();
      closeModal();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await deleteRecord(id);
      await loadRecords();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to delete record');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="rc-root">
      <style>{css}</style>

      {/* Header */}
      <div className="rc-header">
        <div>
          <p className="rc-header-eyebrow">Records</p>
          <h1 className="rc-header-title">Financial records</h1>
        </div>
        <button className="rc-create-btn" onClick={openCreateModal}>
          <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add record
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rc-skeleton" style={{ height: 52, animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      ) : (
        <div className="rc-table-card">
          <div className="rc-table-wrap">
            <table className="rc-table">
              <thead>
                <tr>
                  {['Date', 'Type', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length > 0 ? (
                  records.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>
                        <span className={`rc-badge ${record.type}`}>
                          <span className="rc-badge-dot" />
                          {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                        </span>
                      </td>
                      <td>{record.category}</td>
                      <td className="muted">{record.notes || '—'}</td>
                      <td>
                        <span className={`rc-amount ${record.type}`}>
                          {record.type === 'expense' ? '−' : '+'}${record.amount.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div className="rc-actions">
                          <button className="rc-btn-edit" onClick={() => openEditModal(record)}>Edit</button>
                          {role === 'ADMIN' && (
                            <button className="rc-btn-delete" onClick={() => handleDelete(record.id)}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="rc-empty">
                        <svg className="rc-empty-icon" viewBox="0 0 48 48" fill="none" stroke="#1A1A16" strokeWidth="1.5">
                          <rect x="8" y="6" width="32" height="36" rx="4" />
                          <line x1="16" y1="18" x2="32" y2="18" />
                          <line x1="16" y1="26" x2="28" y2="26" />
                          <line x1="16" y1="34" x2="22" y2="34" />
                        </svg>
                        <p className="rc-empty-text">No records yet. Add your first one.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="rc-modal-backdrop" onClick={closeModal}>
          <div className="rc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal-header">
              <h2 className="rc-modal-title">
                {editingRecord ? 'Edit record' : 'New record'}
              </h2>
              <button className="rc-modal-close" onClick={closeModal} aria-label="Close">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="rc-modal-body">

                {/* Type toggle */}
                <div className="rc-type-toggle">
                  {['income', 'expense'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`rc-type-btn${formData.type === t ? ` active-${t}` : ''}`}
                      onClick={() => setFormData((p) => ({ ...p, type: t }))}
                    >
                      <span className="rc-type-btn-dot" />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Amount + Date row */}
                <div className="rc-field-row">
                  <div>
                    <label className="rc-label">Amount</label>
                    <input
                      className="rc-input"
                      type="number"
                      name="amount"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="rc-label">Date</label>
                    <input
                      className="rc-input"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="rc-field">
                  <label className="rc-label">Category</label>
                  <input
                    className="rc-input"
                    type="text"
                    name="category"
                    placeholder="e.g. Salary, Rent, Groceries"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="rc-field">
                  <label className="rc-label">Description <span style={{ color: '#C0BAB0', fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>optional</span></label>
                  <input
                    className="rc-input"
                    type="text"
                    name="description"
                    placeholder="Add a note..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

              </div>

              <div className="rc-modal-footer">
                <button type="button" className="rc-btn-cancel" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="rc-btn-submit" disabled={submitting}>
                  {submitting && <span className="rc-spinner" />}
                  {submitting ? 'Saving…' : editingRecord ? 'Save changes' : 'Add record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}