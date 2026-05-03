import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createGoal, deleteGoal, fetchGoals, updateGoal } from '../services/goalsService.js';
import { useAuth } from '../context/useAuth.jsx';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .gl-root {
    min-height: 100vh;
    background: #F4F2EC;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 48px 64px;
    box-sizing: border-box;
  }

  .gl-root *, .gl-root *::before, .gl-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .gl-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 22px;
    border-bottom: 1px solid #D8D4C8;
    padding-bottom: 24px;
  }

  .gl-header-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
  }

  .gl-header-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .gl-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .gl-add-btn {
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
    transition: background 0.15s ease, transform 0.12s ease, box-shadow 0.15s ease;
    box-shadow: 0 8px 18px rgba(26, 26, 22, 0.12);
  }

  .gl-add-btn:hover { background: #2A2A24; transform: translateY(-1px); }
  .gl-add-btn:active { transform: scale(0.98); }
  .gl-add-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .gl-toolbar {
    margin-bottom: 16px;
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 12px;
    padding: 12px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 10px;
  }

  .gl-toolbar-input,
  .gl-toolbar-select,
  .gl-input,
  .gl-select {
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

  .gl-toolbar-input:focus,
  .gl-toolbar-select:focus,
  .gl-input:focus,
  .gl-select:focus {
    border-color: #639922;
    box-shadow: 0 0 0 3px rgba(99, 153, 34, 0.1);
  }

  .gl-error {
    background: #FFF6F4;
    border: 1px solid #F0B5A0;
    border-radius: 12px;
    padding: 12px 14px;
    color: #993C1D;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .gl-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .gl-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 16px;
    padding: 18px;
    position: relative;
    overflow: hidden;
    animation: gl-fadeUp 0.35s ease both;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .gl-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(26, 26, 22, 0.08);
  }

  .gl-card.completed {
    border-color: rgba(99, 153, 34, 0.35);
    background: linear-gradient(180deg, #FFFFFF 0%, #FAFDF4 100%);
  }

  .gl-card.completed::before {
    content: '';
    position: absolute;
    inset: 0 auto auto 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #639922, #97C459);
  }

  .gl-card-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .gl-name {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #1A1A16;
    letter-spacing: -0.01em;
    margin-bottom: 4px;
  }

  .gl-category {
    font-size: 12px;
    color: #8A8677;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
  }

  .gl-status-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .gl-status-badge.ON_TRACK { background: #EAF3DE; color: #3B6D11; }
  .gl-status-badge.BEHIND { background: #FFF3E0; color: #B1681E; }
  .gl-status-badge.COMPLETED { background: #EEF6E1; color: #3B6D11; }

  .gl-hero {
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 16px;
    align-items: center;
    margin-bottom: 14px;
  }

  .gl-ring {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }

  .gl-ring-inner {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #fff;
    display: grid;
    place-items: center;
    text-align: center;
    box-shadow: 0 8px 18px rgba(26, 26, 22, 0.08);
  }

  .gl-ring-value {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: #1A1A16;
    line-height: 1;
  }

  .gl-ring-label {
    font-size: 10px;
    color: #8A8677;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .gl-forecast {
    font-size: 13px;
    color: #5A5850;
    line-height: 1.55;
  }

  .gl-forecast.completed {
    color: #3B6D11;
    font-weight: 500;
  }

  .gl-values {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 10px;
    margin-bottom: 12px;
  }

  .gl-label {
    color: #8A8677;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  .gl-value {
    color: #1A1A16;
    font-size: 15px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .gl-value.negative { color: #993C1D; }

  .gl-progress-track {
    height: 10px;
    background: #EFEBE0;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .gl-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.35s ease;
  }

  .gl-progress-fill.ON_TRACK { background: #639922; }
  .gl-progress-fill.BEHIND { background: #D6943F; }
  .gl-progress-fill.COMPLETED { background: #3B6D11; }

  .gl-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: #7A7669;
    margin-bottom: 12px;
  }

  .gl-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .gl-action-btn {
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

  .gl-action-btn:hover {
    border-color: #1A1A16;
    background: #1A1A16;
    color: #EAF3DE;
  }

  .gl-action-btn.delete:hover {
    border-color: #D85A30;
    background: #FFF0EB;
    color: #993C1D;
  }

  .gl-empty {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 14px;
    padding: 44px 20px;
    text-align: center;
    color: #8A8677;
    font-size: 14px;
  }

  .gl-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20, 20, 16, 0.52);
    backdrop-filter: blur(2px);
    z-index: 60;
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .gl-modal {
    width: min(480px, 100%);
    background: #FFFFFF;
    border-radius: 16px;
    border: 1px solid #E4E0D6;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: gl-fadeUp 0.22s ease both;
  }

  .gl-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 24px 16px;
    border-bottom: 1px solid #F0EDE6;
  }

  .gl-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #1A1A16;
  }

  .gl-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #E4E0D6;
    background: transparent;
    color: #8A8677;
    cursor: pointer;
  }

  .gl-modal-body {
    padding: 18px 24px;
    display: grid;
    gap: 12px;
  }

  .gl-field label {
    display: block;
    color: #7A7669;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .gl-field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .gl-modal-foot {
    border-top: 1px solid #F0EDE6;
    padding: 16px 24px 22px;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
  }

  .gl-btn-secondary,
  .gl-btn-primary {
    padding: 9px 16px;
    border-radius: 9px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
  }

  .gl-btn-secondary {
    border: 1px solid #E4E0D6;
    background: transparent;
    color: #7A7669;
  }

  .gl-btn-primary {
    border: none;
    background: #1A1A16;
    color: #EAF3DE;
  }

  .gl-btn-primary:disabled,
  .gl-btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes gl-fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 920px) {
    .gl-root { padding: 24px 20px 48px; }
    .gl-header { flex-direction: column; align-items: flex-start; }
    .gl-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 620px) {
    .gl-header-actions {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .gl-add-btn {
      grid-column: span 2;
      justify-content: center;
    }

    .gl-toolbar {
      grid-template-columns: 1fr;
    }

    .gl-field-row {
      grid-template-columns: 1fr;
    }

    .gl-hero {
      grid-template-columns: 1fr;
    }
  }
`;

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DEFAULT_FORM = {
  name: '',
  targetAmount: '',
  currentAmount: '0',
  targetDate: new Date().toISOString().split('T')[0],
  priority: 'MEDIUM',
  category: '',
};

const PRIORITY_ORDER = { HIGH: 2, MEDIUM: 1, LOW: 0 };

export default function Goals() {
  const { role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') ?? '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority-desc');

  const canEdit = role === 'ANALYST' || role === 'ADMIN';
  const canDelete = role === 'ADMIN';

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoals();
      setGoals(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadGoals();
    };
    init();
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (categoryFilter.trim()) next.set('category', categoryFilter.trim());
    setSearchParams(next, { replace: true });
  }, [categoryFilter, setSearchParams]);

  const visibleGoals = useMemo(() => {
    const category = categoryFilter.trim().toLowerCase();
    return goals
      .filter((goal) => (category ? goal.category.toLowerCase().includes(category) : true))
      .filter((goal) => (statusFilter === 'all' ? true : goal.status === statusFilter))
      .sort((a, b) => {
        if (sortBy === 'progress-asc') return (a.progressPercentage ?? 0) - (b.progressPercentage ?? 0);
        if (sortBy === 'targetDate-asc') return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        if (sortBy === 'targetDate-desc') return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'status-asc') return a.status.localeCompare(b.status);
        return (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
      });
  }, [goals, categoryFilter, statusFilter, sortBy]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormData({ ...DEFAULT_FORM, category: categoryFilter.trim() });
    setModalOpen(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      priority: goal.priority,
      category: goal.category,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGoal(null);
    setFormData({ ...DEFAULT_FORM, category: categoryFilter.trim() });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount),
        targetDate: formData.targetDate,
        priority: formData.priority,
        category: formData.category.trim(),
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, payload);
      } else {
        await createGoal(payload);
      }

      closeModal();
      await loadGoals();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    setError(null);
    try {
      await deleteGoal(id);
      await loadGoals();
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to delete goal');
    }
  };

  return (
    <div className="gl-root">
      <style>{css}</style>

      <div className="gl-header">
        <div>
          <p className="gl-header-eyebrow">Planning</p>
          <h1 className="gl-header-title">Financial Goal Planner</h1>
        </div>
        <div className="gl-header-actions">
          <button className="gl-add-btn" onClick={openCreateModal} disabled={!canEdit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add goal
          </button>
        </div>
      </div>

      {error ? <div className="gl-error">{error}</div> : null}

      <div className="gl-toolbar">
        <input
          className="gl-toolbar-input"
          type="text"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="Filter by category"
          aria-label="Filter by category"
        />
        <select className="gl-toolbar-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="ON_TRACK">On track</option>
          <option value="BEHIND">Behind</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="gl-toolbar-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="priority-desc">Priority high to low</option>
          <option value="progress-asc">Progress low to high</option>
          <option value="targetDate-asc">Target date soonest</option>
          <option value="targetDate-desc">Target date latest</option>
          <option value="name-asc">Name A-Z</option>
          <option value="status-asc">Status A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="gl-grid">
          {[0, 1, 2, 3].map((i) => <div key={i} className="gl-card" style={{ minHeight: 260, opacity: 0.8 }} />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="gl-empty">No goals yet. Add your first goal to start planning.</div>
      ) : visibleGoals.length === 0 ? (
        <div className="gl-empty">No goals match your current filters.</div>
      ) : (
        <div className="gl-grid">
          {visibleGoals.map((goal, index) => {
            const completed = goal.status === 'COMPLETED';
            const progress = Math.min(goal.progressPercentage || 0, 100);
            const ringColor = completed ? '#3B6D11' : goal.status === 'BEHIND' ? '#D6943F' : '#639922';

            return (
              <article className={`gl-card ${goal.status.toLowerCase()}`} key={goal.id} style={{ animationDelay: `${index * 0.04}s` }}>
                <div className="gl-card-head">
                  <div>
                    <h3 className="gl-name">{goal.name}</h3>
                    <p className="gl-category">{goal.category}</p>
                  </div>
                  <span className={`gl-status-badge ${goal.status}`}>{goal.status.replace('_', ' ')}</span>
                </div>

                <div className="gl-hero">
                  <div
                    className="gl-ring"
                    style={{ background: `conic-gradient(${ringColor} ${progress}%, #E8E4D8 0)` }}
                    aria-label={`${progress.toFixed(1)} percent complete`}
                  >
                    <div className="gl-ring-inner">
                      <div>
                        <div className="gl-ring-value">{progress.toFixed(0)}%</div>
                        <div className="gl-ring-label">saved</div>
                      </div>
                    </div>
                  </div>
                  <div className={`gl-forecast ${completed ? 'completed' : ''}`}>{goal.forecastMessage}</div>
                </div>

                <div className="gl-values">
                  <div>
                    <p className="gl-label">Target amount</p>
                    <p className="gl-value">{usdFormatter.format(goal.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="gl-label">Saved amount</p>
                    <p className="gl-value">{usdFormatter.format(goal.currentAmount)}</p>
                  </div>
                  <div>
                    <p className="gl-label">Remaining amount</p>
                    <p className={`gl-value${goal.remainingAmount < 0 ? ' negative' : ''}`}>{usdFormatter.format(goal.remainingAmount)}</p>
                  </div>
                  <div>
                    <p className="gl-label">Target date</p>
                    <p className="gl-value">{formatDate(goal.targetDate)}</p>
                  </div>
                  <div>
                    <p className="gl-label">Estimated completion</p>
                    <p className="gl-value">{goal.projectedCompletionDate ? formatDate(goal.projectedCompletionDate) : 'No projection'}</p>
                  </div>
                  <div>
                    <p className="gl-label">Monthly saving needed</p>
                    <p className="gl-value">{usdFormatter.format(goal.monthlyRequired || 0)}</p>
                  </div>
                </div>

                <div className="gl-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(goal.progressPercentage || 0, 100)}>
                  <div className={`gl-progress-fill ${goal.status}`} style={{ width: `${Math.min(goal.progressPercentage || 0, 100)}%` }} />
                </div>

                <div className="gl-meta">
                  <span>Current savings rate: {usdFormatter.format(goal.currentSavingsRate || 0)}/mo</span>
                  <span>{goal.status === 'COMPLETED' ? 'Congratulations, goal achieved' : `Priority ${goal.priority.toLowerCase()}`}</span>
                </div>

                {canEdit ? (
                  <div className="gl-actions">
                    <button type="button" className="gl-action-btn" onClick={() => openEditModal(goal)}>Edit</button>
                    {canDelete ? <button type="button" className="gl-action-btn delete" onClick={() => handleDelete(goal.id)}>Delete</button> : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {modalOpen ? (
        <div className="gl-modal-backdrop" onClick={closeModal}>
          <div className="gl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gl-modal-head">
              <h2 className="gl-modal-title">{editingGoal ? 'Edit goal' : 'Add goal'}</h2>
              <button type="button" className="gl-modal-close" onClick={closeModal} aria-label="Close">x</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="gl-modal-body">
                <div className="gl-field">
                  <label>Name</label>
                  <input className="gl-input" type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required maxLength={150} placeholder="e.g. Emergency Fund" />
                </div>
                <div className="gl-field-row">
                  <div className="gl-field">
                    <label>Target amount</label>
                    <input className="gl-input" type="number" step="0.01" min="0.01" value={formData.targetAmount} onChange={(e) => setFormData((p) => ({ ...p, targetAmount: e.target.value }))} required placeholder="0.00" />
                  </div>
                  <div className="gl-field">
                    <label>Current amount</label>
                    <input className="gl-input" type="number" step="0.01" min="0" value={formData.currentAmount} onChange={(e) => setFormData((p) => ({ ...p, currentAmount: e.target.value }))} required placeholder="0.00" />
                  </div>
                </div>
                <div className="gl-field-row">
                  <div className="gl-field">
                    <label>Target date</label>
                    <input className="gl-input" type="date" value={formData.targetDate} onChange={(e) => setFormData((p) => ({ ...p, targetDate: e.target.value }))} required />
                  </div>
                  <div className="gl-field">
                    <label>Priority</label>
                    <select className="gl-select" value={formData.priority} onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div className="gl-field">
                  <label>Category</label>
                  <input className="gl-input" type="text" value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} required maxLength={100} placeholder="e.g. Savings, Travel, Health" />
                </div>
              </div>

              <div className="gl-modal-foot">
                <button type="button" className="gl-btn-secondary" onClick={closeModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="gl-btn-primary" disabled={submitting}>{submitting ? 'Saving...' : editingGoal ? 'Save changes' : 'Add goal'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
