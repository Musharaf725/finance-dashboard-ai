import { useState } from 'react';
import { patchGoal } from '../services/goalsService.js';
import { updateRecord } from '../services/recordsService.js';

const FixModal = ({ anomaly, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // GOAL_ALERT form state
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalMonthlyContribution, setGoalMonthlyContribution] = useState('');

  // MISCLASSIFIED form state
  const [selectedTransactionType, setSelectedTransactionType] = useState('EXPENSE');

  if (!isOpen || !anomaly) return null;

  const handleClose = () => {
    setError(null);
    setGoalTargetDate('');
    setGoalMonthlyContribution('');
    setSelectedTransactionType('EXPENSE');
    onClose();
  };

  const handleApplyFix = async () => {
    setError(null);
    setLoading(true);

    try {
      if (anomaly.type === 'GOAL_ALERT') {
        // Extract goal ID from meta or anomaly
        const goalId = anomaly.meta?.goalId;
        if (!goalId) throw new Error('Goal ID not found');

        const payload = {};
        if (goalTargetDate) payload.targetDate = goalTargetDate;
        if (goalMonthlyContribution) payload.monthlyContribution = Number(goalMonthlyContribution);

        if (Object.keys(payload).length === 0) {
          throw new Error('Please fill in at least one field');
        }

        await patchGoal(goalId, payload);
      } else if (anomaly.type === 'MISCLASSIFIED') {
        // Update transaction type
        const txId = anomaly.meta?.transactionId;
        if (!txId) throw new Error('Transaction ID not found');

        await updateRecord(txId, { type: selectedTransactionType });
      } else if (anomaly.type === 'BUDGET_ALERT') {
        // Budget alert: user may navigate manually
        // No default action; could add budget edit form here
        throw new Error('Manual review required for budget alerts');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Fix failed:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to apply fix');
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    if (anomaly.type === 'GOAL_ALERT') {
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#5A5850' }}>
              Target Date
            </label>
            <input
              type="date"
              value={goalTargetDate}
              onChange={(e) => setGoalTargetDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #E4E0D6',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#5A5850' }}>
              Monthly Contribution ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={goalMonthlyContribution}
              onChange={(e) => setGoalMonthlyContribution(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #E4E0D6',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
              }}
              placeholder="0.00"
            />
          </div>
        </div>
      );
    }

    if (anomaly.type === 'MISCLASSIFIED') {
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6, color: '#5A5850' }}>
              Correct Transaction Type
            </label>
            <select
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #E4E0D6',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'DM Sans, sans-serif',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div style={{ fontSize: 12, color: '#8A8677', padding: '8px 10px', backgroundColor: '#F9F7F1', borderRadius: 8 }}>
            <strong>Note:</strong> This will change the transaction type from {anomaly.meta?.currentType || 'INCOME'} to {selectedTransactionType}.
          </div>
        </div>
      );
    }

    if (anomaly.type === 'BUDGET_ALERT') {
      return (
        <div style={{ fontSize: 13, color: '#5A5850', lineHeight: 1.6 }}>
          <p>Review your budget settings and adjust spending or limits as needed.</p>
          <p style={{ marginTop: 8 }}>Click the "Fix Now" button in the Smart Alerts card to navigate to the Budgets page.</p>
        </div>
      );
    }

    return <p>No additional actions available for this alert type.</p>;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(20, 20, 16, 0.5)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        padding: 18,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: 'min(520px, 100%)',
          background: '#FFFFFF',
          border: '1px solid #E4E0D6',
          borderRadius: 16,
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          animation: 'fadeUp 0.22s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 22px 14px', borderBottom: '1px solid #F0EDE6' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1A1A16', margin: 0 }}>Resolve Issue</h2>
          <button
            onClick={handleClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #E4E0D6',
              background: 'transparent',
              color: '#8A8677',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 22px' }}>
          {/* Alert Summary */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: '#1A1A16', marginBottom: 8 }}>{anomaly.title}</h3>
            <p style={{ fontSize: 13, color: '#5A5850', lineHeight: 1.55, margin: 0 }}>{anomaly.message}</p>
          </div>

          {/* Form Content */}
          <div style={{ marginBottom: 16 }}>
            {renderFormContent()}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#FFF0EA',
              border: '1px solid rgba(216, 90, 48, 0.35)',
              borderRadius: 10,
              padding: 12,
              marginBottom: 16,
              fontSize: 13,
              color: '#993C1D',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #F0EDE6', padding: '14px 22px 18px', display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              borderRadius: 999,
              border: '1px solid #D8D4C8',
              background: '#FFFFFF',
              color: '#5A5850',
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s ease',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFix}
            disabled={loading}
            style={{
              borderRadius: 999,
              border: '1px solid #1A1A16',
              background: '#1A1A16',
              color: '#EAF3DE',
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s ease',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {loading ? 'Applying...' : 'Apply Fix'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixModal;
