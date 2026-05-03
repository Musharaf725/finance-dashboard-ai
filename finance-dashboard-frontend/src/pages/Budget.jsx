import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchBudgetStatus,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../services/budgetService.js';
import { useAuth } from '../context/useAuth.jsx';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .bg-root {
    min-height: 100vh;
    background: #F4F2EC;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 48px 64px;
    box-sizing: border-box;
  }

  .bg-root *, .bg-root *::before, .bg-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .bg-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 24px;
    border-bottom: 1px solid #D8D4C8;
    padding-bottom: 24px;
  }

  .bg-header-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
  }

  .bg-header-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .bg-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .bg-select {
    height: 40px;
    border-radius: 10px;
    border: 1px solid #D8D4C8;
    background: #FFFFFF;
    color: #3A3830;
    padding: 0 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    outline: none;
  }

  .bg-select:focus {
    border-color: #639922;
    box-shadow: 0 0 0 3px rgba(99,153,34,0.12);
  }

  .bg-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 10px;
    background: #1A1A16;
    color: #EAF3DE;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.12s ease;
  }

  .bg-add-btn:hover { background: #2A2A24; }
  .bg-add-btn:active { transform: scale(0.98); }

  .bg-add-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .bg-error {
    background: #FFF6F4;
    border: 1px solid #F0B5A0;
    border-radius: 12px;
    padding: 12px 14px;
    color: #993C1D;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .bg-exceeded-note {
    margin-bottom: 16px;
    background: #FFF9ED;
    border: 1px solid #F3DFC2;
    border-radius: 12px;
    padding: 12px 14px;
    color: #94612D;
    font-size: 13px;
  }

  .bg-toolbar {
    margin-bottom: 16px;
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 12px;
    padding: 12px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 10px;
  }

  .bg-toolbar-input,
  .bg-toolbar-select {
    width: 100%;
    height: 40px;
    border-radius: 9px;
    border: 1px solid #E4E0D6;
    background: #FAFAF7;
    color: #1A1A16;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 0 12px;
    outline: none;
  }

  .bg-toolbar-input:focus,
  .bg-toolbar-select:focus {
    border-color: #639922;
    box-shadow: 0 0 0 3px rgba(99,153,34,0.1);
  }

  .bg-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .bg-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 14px;
    padding: 18px;
    animation: bg-fadeUp 0.35s ease both;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .bg-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 22px rgba(26,26,22,0.08);
  }

  .bg-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .bg-category {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #1A1A16;
    letter-spacing: -0.01em;
  }

  .bg-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .bg-badge.safe {
    background: #EAF3DE;
    color: #3B6D11;
  }

  .bg-badge.warning {
    background: #FFF3E0;
    color: #B1681E;
  }

  .bg-badge.exceeded {
    background: #FFF0EB;
    color: #993C1D;
  }

  .bg-values {
    margin: 10px 0 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 10px;
  }

  .bg-k-label {
    color: #8A8677;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  .bg-k-value {
    color: #1A1A16;
    font-size: 15px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .bg-k-value.negative {
    color: #993C1D;
  }

  .bg-progress-track {
    height: 9px;
    background: #EFEBE0;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .bg-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.35s ease;
  }

  .bg-progress-fill.safe { background: #639922; }
  .bg-progress-fill.warning { background: #D6943F; }
  .bg-progress-fill.exceeded { background: #D85A30; }

  .bg-progress-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #7A7669;
    margin-bottom: 12px;
  }

  .bg-progress-meta strong {
    font-variant-numeric: tabular-nums;
    color: #1A1A16;
  }

  .bg-card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .bg-action-btn {
    border-radius: 8px;
    border: 1px solid #E0DDD6;
    background: #F8F6EF;
    color: #5A5850;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    padding: 6px 10px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .bg-action-btn:hover {
    border-color: #1A1A16;
    background: #1A1A16;
    color: #EAF3DE;
  }

  .bg-action-btn.delete:hover {
    border-color: #D85A30;
    background: #FFF0EB;
    color: #993C1D;
  }

  .bg-empty {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 14px;
    padding: 44px 20px;
    text-align: center;
    color: #8A8677;
    font-size: 14px;
  }

  .bg-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20,20,16,0.52);
    backdrop-filter: blur(2px);
    z-index: 60;
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .bg-modal {
    width: min(460px, 100%);
    background: #FFFFFF;
    border-radius: 16px;
    border: 1px solid #E4E0D6;
    box-shadow: 0 24px 50px rgba(0,0,0,0.2);
    overflow: hidden;
    animation: bg-fadeUp 0.22s ease both;
  }

  .bg-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 24px 16px;
    border-bottom: 1px solid #F0EDE6;
  }

  .bg-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #1A1A16;
  }

  .bg-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #E4E0D6;
    background: transparent;
    color: #8A8677;
    cursor: pointer;
  }

  .bg-modal-body {
    padding: 18px 24px;
    display: grid;
    gap: 12px;
  }

  .bg-field label {
    display: block;
    color: #7A7669;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .bg-field input,
  .bg-field select {
    width: 100%;
    height: 42px;
    border-radius: 9px;
    border: 1px solid #E4E0D6;
    background: #FAFAF7;
    padding: 0 12px;
    font-size: 14px;
    color: #1A1A16;
    font-family: 'DM Sans', sans-serif;
    outline: none;
  }

  .bg-field input:focus,
  .bg-field select:focus {
    border-color: #639922;
    box-shadow: 0 0 0 3px rgba(99,153,34,0.1);
  }

  .bg-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .bg-modal-foot {
    border-top: 1px solid #F0EDE6;
    padding: 16px 24px 22px;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
  }

  .bg-btn-secondary,
  .bg-btn-primary {
    padding: 9px 16px;
    border-radius: 9px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
  }

  .bg-btn-secondary {
    border: 1px solid #E4E0D6;
    background: transparent;
    color: #7A7669;
  }

  .bg-btn-primary {
    border: none;
    background: #1A1A16;
    color: #EAF3DE;
  }

  .bg-btn-primary:disabled,
  .bg-btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes bg-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 920px) {
    .bg-root { padding: 24px 20px 48px; }
    .bg-header { flex-direction: column; align-items: flex-start; }
    .bg-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 620px) {
    .bg-actions {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bg-add-btn {
      grid-column: span 2;
      justify-content: center;
    }

    .bg-field-row {
      grid-template-columns: 1fr;
    }

    .bg-toolbar {
      grid-template-columns: 1fr;
    }
  }
`;

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getCurrentPeriod() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function normalizeMonth(value, fallback) {
  const month = Number(value);
  if (!Number.isFinite(month) || month < 1 || month > 12) return fallback;
  return month;
}

function normalizeYear(value, fallback) {
  const year = Number(value);
  if (!Number.isFinite(year) || year < 2000 || year > fallback + 10) return fallback;
  return year;
}

const current = getCurrentPeriod();

const DEFAULT_FORM = {
  category: '',
  monthlyLimit: '',
  month: current.month,
  year: current.year,
};

export default function Budget() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { role } = useAuth();
  const [period, setPeriod] = useState(() => ({
    month: normalizeMonth(searchParams.get('month'), current.month),
    year: normalizeYear(searchParams.get('year'), current.year),
  }));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') ?? '');
  const [alertFilter, setAlertFilter] = useState('all');
  const [sortBy, setSortBy] = useState('usage-desc');
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const canEdit = role === 'ANALYST' || role === 'ADMIN';
  const canDelete = role === 'ADMIN';

  const loadBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await fetchBudgetStatus(period);
      setItems(Array.isArray(status) ? status : []);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [period.month, period.year]);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set('month', String(period.month));
    next.set('year', String(period.year));
    if (categoryFilter.trim()) {
      next.set('category', categoryFilter.trim());
    }
    setSearchParams(next, { replace: true });
  }, [period.month, period.year, categoryFilter, setSearchParams]);

  const exceededItem = useMemo(
    () => items.find((item) => item.alertLevel === 'exceeded'),
    [items]
  );

  const visibleItems = useMemo(() => {
    const byCategory = categoryFilter.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const categoryMatch = byCategory
        ? item.category.toLowerCase().includes(byCategory)
        : true;
      const alertMatch = alertFilter === 'all' ? true : item.alertLevel === alertFilter;
      return categoryMatch && alertMatch;
    });

    const sorted = filtered.slice();
    sorted.sort((a, b) => {
      if (sortBy === 'usage-asc') return (a.percentageUsed ?? 0) - (b.percentageUsed ?? 0);
      if (sortBy === 'remaining-asc') return (a.remaining ?? 0) - (b.remaining ?? 0);
      if (sortBy === 'remaining-desc') return (b.remaining ?? 0) - (a.remaining ?? 0);
      if (sortBy === 'category-asc') return a.category.localeCompare(b.category);
      return (b.percentageUsed ?? 0) - (a.percentageUsed ?? 0);
    });

    return sorted;
  }, [items, categoryFilter, alertFilter, sortBy]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ ...DEFAULT_FORM, month: period.month, year: period.year });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      monthlyLimit: item.monthlyLimit.toString(),
      month: item.month,
      year: item.year,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({ ...DEFAULT_FORM, month: period.month, year: period.year });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        category: formData.category.trim(),
        monthlyLimit: Number(formData.monthlyLimit),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingItem) {
        await updateBudget(editingItem.id, payload);
      } else {
        await createBudget(payload);
      }

      closeModal();
      await loadBudgets();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;

    setError(null);
    try {
      await deleteBudget(id);
      await loadBudgets();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to delete budget');
    }
  };

  return (
    <div className="bg-root">
      <style>{css}</style>

      <div className="bg-header">
        <div>
          <p className="bg-header-eyebrow">Planning</p>
          <h1 className="bg-header-title">Budget tracking</h1>
        </div>
        <div className="bg-actions">
          <select
            className="bg-select"
            value={period.month}
            onChange={(e) => setPeriod((prev) => ({ ...prev, month: Number(e.target.value) }))}
            aria-label="Month"
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>{name}</option>
            ))}
          </select>
          <select
            className="bg-select"
            value={period.year}
            onChange={(e) => setPeriod((prev) => ({ ...prev, year: Number(e.target.value) }))}
            aria-label="Year"
          >
            {[0, 1, 2, 3, 4].map((offset) => {
              const year = current.year - 2 + offset;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
          <button className="bg-add-btn" onClick={openCreateModal} disabled={!canEdit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add budget
          </button>
        </div>
      </div>

      {error ? <div className="bg-error">{error}</div> : null}

      {exceededItem ? (
        <div className="bg-exceeded-note">
          You exceeded your {exceededItem.category} budget by {usdFormatter.format(Math.abs(exceededItem.remaining))} this month
        </div>
      ) : null}

      <div className="bg-toolbar">
        <input
          className="bg-toolbar-input"
          type="text"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="Filter by category"
          aria-label="Filter by category"
        />
        <select
          className="bg-toolbar-select"
          value={alertFilter}
          onChange={(e) => setAlertFilter(e.target.value)}
          aria-label="Filter by alert level"
        >
          <option value="all">All levels</option>
          <option value="safe">Safe</option>
          <option value="warning">Warning</option>
          <option value="exceeded">Exceeded</option>
        </select>
        <select
          className="bg-toolbar-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort budgets"
        >
          <option value="usage-desc">Usage high to low</option>
          <option value="usage-asc">Usage low to high</option>
          <option value="remaining-asc">Remaining low to high</option>
          <option value="remaining-desc">Remaining high to low</option>
          <option value="category-asc">Category A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-card" style={{ minHeight: 174, opacity: 0.78 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-empty">No budgets for this period yet. Add one to start tracking.</div>
      ) : visibleItems.length === 0 ? (
        <div className="bg-empty">No budgets match your current filters.</div>
      ) : (
        <div className="bg-grid">
          {visibleItems.map((item, index) => {
            const progressWidth = Math.min(item.percentageUsed, 100);
            return (
              <div className="bg-card" key={item.id} style={{ animationDelay: `${index * 0.04}s` }}>
                <div className="bg-card-head">
                  <h3 className="bg-category">{item.category}</h3>
                  <span className={`bg-badge ${item.alertLevel}`}>{item.alertLevel}</span>
                </div>

                <div className="bg-values">
                  <div>
                    <p className="bg-k-label">Monthly limit</p>
                    <p className="bg-k-value">{usdFormatter.format(item.monthlyLimit)}</p>
                  </div>
                  <div>
                    <p className="bg-k-label">Spent</p>
                    <p className="bg-k-value">{usdFormatter.format(item.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="bg-k-label">Remaining</p>
                    <p className={`bg-k-value${item.remaining < 0 ? ' negative' : ''}`}>
                      {usdFormatter.format(item.remaining)}
                    </p>
                  </div>
                  <div>
                    <p className="bg-k-label">Usage %</p>
                    <p className="bg-k-value">{item.percentageUsed.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="bg-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(item.percentageUsed, 100)}>
                  <div className={`bg-progress-fill ${item.alertLevel}`} style={{ width: `${progressWidth}%` }} />
                </div>
                <div className="bg-progress-meta">
                  <span>{usdFormatter.format(item.totalSpent)} spent</span>
                  <strong>{usdFormatter.format(item.monthlyLimit)} limit</strong>
                </div>

                {canEdit ? (
                  <div className="bg-card-actions">
                    <button type="button" className="bg-action-btn" onClick={() => openEditModal(item)}>
                      Edit
                    </button>
                    {canDelete ? (
                      <button type="button" className="bg-action-btn delete" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen ? (
        <div className="bg-modal-backdrop" onClick={closeModal}>
          <div className="bg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bg-modal-head">
              <h2 className="bg-modal-title">{editingItem ? 'Edit budget' : 'Add budget'}</h2>
              <button type="button" className="bg-modal-close" onClick={closeModal} aria-label="Close">x</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="bg-modal-body">
                <div className="bg-field">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    required
                    maxLength={100}
                    placeholder="e.g. Food"
                  />
                </div>
                <div className="bg-field">
                  <label>Monthly limit</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, monthlyLimit: e.target.value }))}
                    required
                    placeholder="0.00"
                  />
                </div>
                <div className="bg-field-row">
                  <div className="bg-field">
                    <label>Month</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData((prev) => ({ ...prev, month: Number(e.target.value) }))}
                    >
                      {monthNames.map((name, index) => (
                        <option key={name} value={index + 1}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-field">
                    <label>Year</label>
                    <input
                      type="number"
                      value={formData.year}
                      min={2000}
                      max={current.year + 10}
                      onChange={(e) => setFormData((prev) => ({ ...prev, year: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-modal-foot">
                <button type="button" className="bg-btn-secondary" onClick={closeModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="bg-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingItem ? 'Save changes' : 'Add budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
