import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { fetchAnalytics } from '../services/dashboardService.js';
import { fetchRecords } from '../services/recordsService.js';
import { fetchBudgetStatus } from '../services/budgetService.js';
import { fetchGoalForecast } from '../services/goalsService.js';
import { fetchAiInsights, fetchAiAnomalies } from '../services/aiService.js';
import FixModal from '../components/FixModal.jsx';
import Toast from '../components/Toast.jsx';

const PALETTE = ['#3B6D11', '#639922', '#97C459', '#1D9E75', '#0F6E56', '#C0DD97'];

/* ─── Scoped styles ───────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  .db-root {
    min-height: 100vh;
    background: #F4F2EC;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 48px 64px;
    box-sizing: border-box;
  }

  .db-root *, .db-root *::before, .db-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Header ── */
  .db-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
    border-bottom: 1px solid #D8D4C8;
    padding-bottom: 24px;
  }

  .db-header-eyebrow {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
  }

  .db-header-title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .db-header-date {
    font-size: 13px;
    color: #A09C8E;
    font-weight: 300;
    text-align: right;
  }

  /* ── Summary cards ── */
  .db-summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .db-stat-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 14px;
    padding: 28px 28px 24px;
    position: relative;
    overflow: hidden;
    animation: db-fadeUp 0.4s ease both;
  }

  .db-stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }
  .db-stat-card.income::before  { background: #639922; }
  .db-stat-card.expense::before { background: #D85A30; }
  .db-stat-card.balance::before { background: #1D9E75; }
  .db-stat-card.balance.neg::before { background: #D85A30; }

  .db-stat-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9A9588;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .db-stat-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .income  .db-stat-dot { background: #639922; }
  .expense .db-stat-dot { background: #D85A30; }
  .balance .db-stat-dot { background: #1D9E75; }
  .balance.neg .db-stat-dot { background: #D85A30; }

  .db-stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .db-stat-value.positive { color: #3B6D11; }
  .db-stat-value.negative { color: #993C1D; }

  .db-stat-icon {
    position: absolute;
    bottom: 20px;
    right: 22px;
    opacity: 0.07;
  }

  /* ── Financial insights ── */
  .db-insights-wrap {
    margin-top: -8px;
    margin-bottom: 24px;
  }

  .db-insights-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #1A1A16;
    letter-spacing: -0.01em;
    margin-bottom: 12px;
  }

  .db-insights-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .db-insight-card {
    background: radial-gradient(circle at 100% 0%, rgba(192, 221, 151, 0.24) 0%, rgba(255, 255, 255, 1) 52%);
    border: 1px solid #E4E0D6;
    border-radius: 12px;
    padding: 16px 16px 14px;
    position: relative;
    overflow: hidden;
    animation: db-fadeUp 0.48s ease both;
    min-height: 112px;
  }

  .db-insight-card::after {
    content: '';
    position: absolute;
    inset: auto auto 0 0;
    width: 48%;
    height: 2px;
    border-radius: 999px;
    background: #C8DFA3;
    opacity: 0.85;
  }

  .db-insight-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .db-insight-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8F8A7A;
    line-height: 1.4;
    padding-right: 10px;
  }

  .db-insight-icon {
    color: #639922;
    opacity: 0.7;
    flex-shrink: 0;
  }

  .db-insight-value {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #1A1A16;
    line-height: 1.12;
  }

  .db-insight-sub {
    margin-top: 6px;
    font-size: 12px;
    color: #8A8677;
    font-weight: 300;
  }

  /* ── Budget overview ── */
  .db-budget-wrap {
    margin-bottom: 24px;
  }

  .db-budget-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .db-budget-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #1A1A16;
    letter-spacing: -0.01em;
  }

  .db-budget-subtitle {
    font-size: 12px;
    color: #A09C8E;
    font-weight: 300;
    margin-bottom: 12px;
  }

  .db-budget-exceeded-note {
    margin-bottom: 10px;
    background: #FFF9ED;
    border: 1px solid #F3DFC2;
    color: #94612D;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 12px;
  }

  .db-budget-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .db-budget-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 12px;
    padding: 14px;
    animation: db-fadeUp 0.5s ease both;
    transition: transform 0.16s ease, box-shadow 0.16s ease;
    cursor: pointer;
  }

  .db-budget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(26,26,22,0.08);
  }

  .db-budget-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
  }

  .db-budget-category {
    font-size: 14px;
    font-weight: 500;
    color: #1A1A16;
  }

  .db-budget-badge {
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 9.5px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .db-budget-badge.safe { background: #EAF3DE; color: #3B6D11; }
  .db-budget-badge.warning { background: #FFF3E0; color: #B1681E; }
  .db-budget-badge.exceeded { background: #FFF0EB; color: #993C1D; }

  .db-budget-progress-track {
    height: 8px;
    border-radius: 999px;
    background: #EFEBE0;
    overflow: hidden;
    margin-bottom: 7px;
  }

  .db-budget-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.35s ease;
  }

  .db-budget-progress-fill.safe { background: #639922; }
  .db-budget-progress-fill.warning { background: #D6943F; }
  .db-budget-progress-fill.exceeded { background: #D85A30; }

  .db-budget-values {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #7A7669;
    font-variant-numeric: tabular-nums;
  }

  .db-budget-values strong {
    color: #1A1A16;
    font-weight: 500;
  }

  /* ── Goal forecast ── */
  .db-goals-wrap {
    margin-bottom: 24px;
  }

  .db-goals-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .db-goals-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #1A1A16;
    letter-spacing: -0.01em;
  }

  .db-goals-subtitle {
    font-size: 12px;
    color: #A09C8E;
    font-weight: 300;
    margin-bottom: 12px;
  }

  .db-goals-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .db-goal-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 12px;
    padding: 14px;
    animation: db-fadeUp 0.5s ease both;
    transition: transform 0.16s ease, box-shadow 0.16s ease;
    cursor: pointer;
  }

  .db-goal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(26,26,22,0.08);
  }

  .db-goal-card.behind {
    border-color: rgba(216, 90, 48, 0.35);
  }

  .db-goal-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
  }

  .db-goal-name {
    font-size: 14px;
    font-weight: 500;
    color: #1A1A16;
  }

  .db-goal-status {
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 9.5px;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .db-goal-status.ON_TRACK { background: #EAF3DE; color: #3B6D11; }
  .db-goal-status.BEHIND { background: #FFF0EB; color: #993C1D; }
  .db-goal-status.COMPLETED { background: #EEF6E1; color: #3B6D11; }

  .db-goal-progress-track {
    height: 8px;
    border-radius: 999px;
    background: #EFEBE0;
    overflow: hidden;
    margin-bottom: 7px;
  }

  .db-goal-progress-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 0.35s ease;
  }

  .db-goal-progress-fill.ON_TRACK { background: #639922; }
  .db-goal-progress-fill.BEHIND { background: #D85A30; }
  .db-goal-progress-fill.COMPLETED { background: #3B6D11; }

  .db-goal-values {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #7A7669;
    margin-bottom: 8px;
  }

  .db-goal-completion {
    font-size: 12px;
    color: #5A5850;
    line-height: 1.45;
    min-height: 34px;
  }

  .db-goal-completion.behind {
    color: #993C1D;
  }

  /* ── AI insights ── */
  .db-ai-wrap {
    margin-bottom: 24px;
  }

  .db-ai-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .db-ai-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: #1A1A16;
    letter-spacing: -0.01em;
  }

  .db-ai-subtitle {
    font-size: 12px;
    color: #A09C8E;
    font-weight: 300;
    margin-bottom: 12px;
  }

  .db-ai-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .db-ai-btn,
  .db-ai-btn-ghost {
    border-radius: 999px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .db-ai-btn {
    border: 1px solid #1A1A16;
    background: #1A1A16;
    color: #EAF3DE;
  }

  .db-ai-btn:hover {
    background: #2B2B25;
    transform: translateY(-1px);
  }

  .db-ai-btn-ghost {
    border: 1px solid #D8D4C8;
    background: #FFFFFF;
    color: #5A5850;
  }

  .db-ai-btn-ghost:hover {
    border-color: #A09C8E;
    color: #1A1A16;
  }

  .db-ai-btn:disabled,
  .db-ai-btn-ghost:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .db-ai-card {
    background: radial-gradient(circle at 100% 0%, rgba(192, 221, 151, 0.25) 0%, rgba(255,255,255,1) 52%);
    border: 1px solid #E4E0D6;
    border-radius: 14px;
    padding: 18px;
    animation: db-fadeUp 0.45s ease both;
  }

  .db-ai-card.warning {
    border-color: rgba(216, 90, 48, 0.35);
    background: radial-gradient(circle at 100% 0%, rgba(243, 197, 181, 0.3) 0%, rgba(255,255,255,1) 56%);
  }

  .db-ai-card.success {
    border-color: rgba(99, 153, 34, 0.28);
  }

  .db-ai-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .db-ai-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #EEF6E1;
    color: #3B6D11;
    flex-shrink: 0;
  }

  .db-ai-card.warning .db-ai-icon {
    background: #FFF0EA;
    color: #B44624;
  }

  .db-ai-card.info .db-ai-icon {
    background: #F0F4EA;
    color: #4A5F31;
  }

  .db-ai-card-title {
    font-size: 15px;
    font-weight: 500;
    color: #1A1A16;
    margin-bottom: 5px;
  }

  .db-ai-badge {
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 9.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    background: #EEF6E1;
    color: #3B6D11;
  }

  .db-ai-badge.warning {
    background: #FFF0EA;
    color: #B44624;
  }

  .db-ai-badge.info {
    background: #F1F4EC;
    color: #5A614C;
  }

  .db-ai-message {
    font-size: 13px;
    color: #5A5850;
    line-height: 1.55;
    margin-bottom: 12px;
  }

  .db-ai-suggestions {
    display: grid;
    gap: 7px;
  }

  .db-ai-suggestion {
    background: #F9F7F1;
    border: 1px solid #E8E3D7;
    border-radius: 10px;
    padding: 9px 11px;
    font-size: 12px;
    color: #4F4D45;
  }

  .db-ai-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 80;
    background: rgba(20, 20, 16, 0.5);
    backdrop-filter: blur(2px);
    display: grid;
    place-items: center;
    padding: 18px;
  }

  .db-ai-modal {
    width: min(580px, 100%);
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 16px;
    box-shadow: 0 24px 50px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    animation: db-fadeUp 0.22s ease both;
  }

  .db-ai-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px 14px;
    border-bottom: 1px solid #F0EDE6;
  }

  .db-ai-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    color: #1A1A16;
  }

  .db-ai-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #E4E0D6;
    background: transparent;
    color: #8A8677;
    cursor: pointer;
  }

  .db-ai-modal-body {
    padding: 16px 22px;
  }

  .db-ai-quick-title {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .db-ai-quick-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
  }

  .db-ai-quick-btn {
    border-radius: 999px;
    border: 1px solid #D8D4C8;
    background: #FFFFFF;
    color: #5A5850;
    padding: 6px 11px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .db-ai-quick-btn:hover {
    border-color: #639922;
    color: #3B6D11;
    background: #F5F9EF;
  }

  .db-ai-question {
    width: 100%;
    min-height: 96px;
    border-radius: 10px;
    border: 1px solid #E4E0D6;
    background: #FAFAF7;
    color: #1A1A16;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 10px 12px;
    resize: vertical;
    outline: none;
  }

  .db-ai-question:focus {
    border-color: #639922;
    box-shadow: 0 0 0 3px rgba(99, 153, 34, 0.1);
  }

  .db-ai-modal-foot {
    border-top: 1px solid #F0EDE6;
    padding: 14px 22px 18px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
  }

  .db-ai-response-box {
    margin-top: 12px;
    background: #F9F7F1;
    border: 1px solid #E8E3D7;
    border-radius: 12px;
    padding: 12px;
  }

  .db-ai-response-title {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .db-ai-response-heading {
    font-size: 14px;
    color: #1A1A16;
    font-weight: 500;
    margin-bottom: 6px;
  }

  .db-ai-response-text {
    font-size: 12px;
    color: #5A5850;
    line-height: 1.5;
  }

  /* ── Charts section ── */
  .db-charts-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 16px;
  }

  .db-chart-card {
    background: #FFFFFF;
    border: 1px solid #E4E0D6;
    border-radius: 14px;
    padding: 28px;
    animation: db-fadeUp 0.5s ease both;
  }

  .db-chart-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 400;
    color: #1A1A16;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }

  .db-chart-subtitle {
    font-size: 12px;
    color: #A09C8E;
    font-weight: 300;
    margin-bottom: 28px;
  }

  .db-chart-legend {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
  }

  .db-legend-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: #7A7669;
    font-weight: 400;
  }

  .db-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  /* ── Pie legend ── */
  .db-pie-legend {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db-pie-legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #5A5850;
  }

  .db-pie-legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .db-pie-legend-name { flex: 1; font-weight: 300; }

  .db-pie-legend-val {
    font-weight: 500;
    color: #1A1A16;
    font-variant-numeric: tabular-nums;
  }

  /* ── Recent transactions ── */
  .db-transactions-wrap {
    margin-top: 16px;
  }

  .db-transactions-card {
    animation: db-fadeUp 0.55s ease both;
  }

  .db-transactions-list {
    display: grid;
    gap: 10px;
  }

  .db-transaction-row {
    display: grid;
    grid-template-columns: 2fr 1fr auto auto;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: linear-gradient(140deg, #FCFBF7 0%, #F8F6EE 100%);
    border: 1px solid #E9E5D9;
    border-radius: 12px;
  }

  .db-transaction-category {
    font-size: 14px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: 0.01em;
  }

  .db-transaction-date {
    font-size: 12px;
    color: #8A8677;
    text-align: left;
    font-variant-numeric: tabular-nums;
  }

  .db-transaction-type {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border: 1px solid transparent;
  }

  .db-transaction-type.income {
    color: #3B6D11;
    background: #EEF6E1;
    border-color: #CFE2AE;
  }

  .db-transaction-type.expense {
    color: #993C1D;
    background: #FFF0EA;
    border-color: #F3C5B5;
  }

  .db-transaction-amount {
    justify-self: end;
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .db-transaction-amount.income {
    color: #3B6D11;
  }

  .db-transaction-amount.expense {
    color: #B44624;
  }

  .db-transactions-note {
    font-size: 13px;
    color: #8A8677;
    line-height: 1.5;
    padding: 6px 0;
  }

  .db-transactions-skeleton {
    height: 56px;
  }

  /* ── Loading / Error ── */
  .db-state-wrap {
    min-height: 100vh;
    background: #F4F2EC;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 48px;
    box-sizing: border-box;
  }

  .db-loading-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }

  .db-skeleton {
    background: linear-gradient(90deg, #EAE7DF 25%, #F4F2EC 50%, #EAE7DF 75%);
    background-size: 200% 100%;
    animation: db-shimmer 1.4s infinite;
    border-radius: 14px;
  }

  .db-skeleton-card { height: 110px; }
  .db-skeleton-chart-a { height: 340px; }
  .db-skeleton-chart-b { height: 340px; }

  .db-skeleton-charts {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 16px;
  }

  .db-error-box {
    background: #FFF6F4;
    border: 1px solid #F0B5A0;
    border-radius: 14px;
    padding: 20px 24px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .db-error-icon { flex-shrink: 0; margin-top: 1px; }

  .db-error-text {
    font-size: 14px;
    color: #993C1D;
    line-height: 1.55;
  }

  /* ── Empty state ── */
  .db-empty-wrap {
    min-height: calc(100vh - 180px);
    display: grid;
    place-items: center;
    padding: 20px 0;
  }

  .db-empty-card {
    width: min(620px, 100%);
    background: radial-gradient(circle at 80% -5%, rgba(192, 221, 151, 0.35) 0%, #FFFFFF 55%);
    border: 1px solid #E4E0D6;
    border-radius: 16px;
    padding: 38px 32px;
    text-align: center;
    box-shadow: 0 14px 30px rgba(26, 26, 22, 0.05);
    animation: db-fadeUp 0.45s ease both;
  }

  .db-empty-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: #EEF6E1;
    color: #3B6D11;
    display: grid;
    place-items: center;
  }

  .db-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 500;
    color: #1A1A16;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }

  .db-empty-subtitle {
    font-size: 14px;
    color: #7A7669;
    line-height: 1.6;
    margin-bottom: 22px;
  }

  .db-empty-btn {
    appearance: none;
    border: 1px solid #4D7D1A;
    border-radius: 999px;
    background: linear-gradient(180deg, #639922 0%, #4D7D1A 100%);
    color: #F7FAF1;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 11px 18px;
    cursor: pointer;
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
    box-shadow: 0 6px 16px rgba(77, 125, 26, 0.22);
  }

  .db-empty-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
    box-shadow: 0 9px 18px rgba(77, 125, 26, 0.28);
  }

  .db-empty-btn:active {
    transform: translateY(0);
  }

  /* ── Custom Tooltip ── */
  .db-tooltip {
    background: #1A1A16;
    border-radius: 10px;
    padding: 10px 14px;
    border: none;
  }

  .db-tooltip-label {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #8A8677;
    margin-bottom: 6px;
  }

  .db-tooltip-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #F4F2EC;
    margin-top: 3px;
  }

  .db-tooltip-swatch {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  /* ── Animations ── */
  @keyframes db-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes db-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .db-root { padding: 24px 20px 48px; }
    .db-summary-grid { grid-template-columns: 1fr; }
    .db-insights-grid { grid-template-columns: repeat(2, 1fr); }
    .db-budget-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .db-goals-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .db-charts-grid { grid-template-columns: 1fr; }
    .db-skeleton-charts { grid-template-columns: 1fr; }
    .db-loading-grid { grid-template-columns: 1fr; }
    .db-transaction-row {
      grid-template-columns: 1fr auto;
      row-gap: 10px;
    }
    .db-transaction-date,
    .db-transaction-type {
      justify-self: start;
    }
    .db-transaction-amount {
      justify-self: end;
    }
  }

  @media (max-width: 620px) {
    .db-insights-grid { grid-template-columns: 1fr; }
    .db-budget-grid { grid-template-columns: 1fr; }
    .db-goals-grid { grid-template-columns: 1fr; }
    .db-ai-head { flex-direction: column; align-items: flex-start; }
    .db-ai-actions { width: 100%; }
    .db-ai-btn,
    .db-ai-btn-ghost { flex: 1; text-align: center; }
  }
`;

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function formatRecordDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ── Custom tooltip for BarChart ── */
function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-label">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="db-tooltip-row">
          <span className="db-tooltip-swatch" style={{ background: p.fill }} />
          <span style={{ color: '#A09C8E', marginRight: 4 }}>{p.name}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>${p.value?.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Custom tooltip for PieChart ── */
function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-label">{d.name}</p>
      <div className="db-tooltip-row">
        <span className="db-tooltip-swatch" style={{ background: d.payload.fill }} />
        <span>${d.value?.toFixed(2)}</span>
      </div>
    </div>
  );
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="db-state-wrap">
      <style>{css}</style>
      <div className="db-header" style={{ borderBottom: '1px solid #D8D4C8', paddingBottom: 24, marginBottom: 40 }}>
        <div>
          <div className="db-skeleton" style={{ width: 60, height: 12, borderRadius: 6, marginBottom: 10 }} />
          <div className="db-skeleton" style={{ width: 180, height: 36, borderRadius: 8 }} />
        </div>
      </div>
      <div className="db-loading-grid">
        {[0, 1, 2].map(i => <div key={i} className="db-skeleton db-skeleton-card" style={{ animationDelay: `${i * 0.1}s` }} />)}
      </div>
      <div className="db-skeleton-charts">
        <div className="db-skeleton db-skeleton-chart-a" />
        <div className="db-skeleton db-skeleton-chart-b" />
      </div>
    </div>
  );
}

/* ── Error state ── */
function ErrorState({ error }) {
  return (
    <div className="db-state-wrap">
      <style>{css}</style>
      <PageHeader />
      <div className="db-error-box" role="alert">
        <svg className="db-error-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#D85A30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="db-error-text">{error}</span>
      </div>
    </div>
  );
}

function EmptyState({ onAddRecord }) {
  return (
    <div className="db-root">
      <style>{css}</style>
      <PageHeader />
      <div className="db-empty-wrap">
        <div className="db-empty-card">
          <div className="db-empty-icon" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M8 10h8" />
              <path d="M8 14h4" />
            </svg>
          </div>
          <h2 className="db-empty-title">No financial data yet</h2>
          <p className="db-empty-subtitle">Add your first income or expense record to see insights</p>
          <button type="button" className="db-empty-btn" onClick={onAddRecord}>Add Record</button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared page header ── */
function PageHeader() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="db-header">
      <div>
        <p className="db-header-eyebrow">Overview</p>
        <h1 className="db-header-title">Dashboard</h1>
      </div>
      <p className="db-header-date">{today}</p>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, type, isNeg, delay }) {
  const cls = `db-stat-card ${type}${isNeg ? ' neg' : ''}`;
  const valCls = `db-stat-value${type === 'balance' ? (isNeg ? ' negative' : ' positive') : ''}`;
  const icons = {
    income: (
      <svg width="56" height="56" fill="none" stroke="#639922" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 38 22 24 30 32 48 14" />
        <polyline points="36 14 48 14 48 26" />
      </svg>
    ),
    expense: (
      <svg width="56" height="56" fill="none" stroke="#D85A30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 18 22 32 30 24 48 42" />
        <polyline points="36 42 48 42 48 30" />
      </svg>
    ),
    balance: (
      <svg width="56" height="56" fill="none" stroke={isNeg ? '#D85A30' : '#1D9E75'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="28" r="14" />
        <line x1="28" y1="22" x2="28" y2="34" />
        <line x1="22" y1="28" x2="34" y2="28" />
      </svg>
    ),
  };

  return (
    <div className={cls} style={{ animationDelay: delay }}>
      <p className="db-stat-label">
        <span className="db-stat-dot" />
        {label}
      </p>
      <p className={valCls}>${value}</p>
      <div className="db-stat-icon">{icons[type]}</div>
    </div>
  );
}

function InsightCard({ label, value, subtext, icon, delay }) {
  return (
    <div className="db-insight-card" style={{ animationDelay: delay }}>
      <div className="db-insight-head">
        <p className="db-insight-label">{label}</p>
        <span className="db-insight-icon">{icon}</span>
      </div>
      <p className="db-insight-value">{value}</p>
      {subtext ? <p className="db-insight-sub">{subtext}</p> : null}
    </div>
  );
}

/* ── Main component ── */
export default function Dashboard() {
  const navigate = useNavigate();
  const AI_QUESTIONS = [
    'Where am I overspending?',
    'How can I save more?',
    'Am I on track?',
    'Which category needs attention?',
  ];
  const [analytics, setAnalytics] = useState(null);
  const [budgetOverview, setBudgetOverview] = useState([]);
  const [goalForecast, setGoalForecast] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState(true);
  const [anomaliesError, setAnomaliesError] = useState(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [fixModalOpen, setFixModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEmptyAnalytics, setIsEmptyAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [goalLoading, setGoalLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [modalAiInsight, setModalAiInsight] = useState(null);
  const [modalAiError, setModalAiError] = useState(null);
  const [error, setError] = useState(null);
  const [txError, setTxError] = useState(null);
  const [budgetError, setBudgetError] = useState(null);
  const [goalError, setGoalError] = useState(null);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setTxLoading(true);
      setBudgetLoading(true);
      setGoalLoading(true);
      setAiLoading(true);
      setError(null);
      setTxError(null);
      setBudgetError(null);
      setGoalError(null);
      setAiError(null);
      setIsEmptyAnalytics(false);

      const analyticsRequest = fetchAnalytics();
      const recordsRequest = fetchRecords({ page: 1, limit: 5 });
      const budgetRequest = fetchBudgetStatus();
      const goalRequest = fetchGoalForecast();
      const aiRequest = fetchAiInsights();
      const anomaliesRequest = fetchAiAnomalies();

      try {
        const data = await analyticsRequest;
        setAnalytics(data);
      } catch (err) {
        const message = err?.response?.data?.message ?? err?.message ?? '';
        const status = err?.response?.status;
        const isNotFound = status === 404 || /not\s*found/i.test(String(message));

        if (isNotFound) {
          setIsEmptyAnalytics(true);
          setAnalytics(null);
          setError(null);
        } else {
          setError(message || 'Unable to load analytics data');
        }
      } finally {
        setLoading(false);
      }

      try {
        const recordsData = await recordsRequest;
        const records = Array.isArray(recordsData?.items) ? recordsData.items : [];
        const total = Number(recordsData?.pagination?.total);
        setTotalRecords(Number.isFinite(total) ? total : records.length);
        const newestFirst = records
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentTransactions(newestFirst);
      } catch (err) {
        setTxError(err?.response?.data?.message ?? 'Unable to load recent transactions');
        setTotalRecords(0);
      } finally {
        setTxLoading(false);
      }

      try {
        const budgetData = await budgetRequest;
        const topBudgets = (Array.isArray(budgetData) ? budgetData : [])
          .slice()
          .sort((a, b) => (b.percentageUsed ?? 0) - (a.percentageUsed ?? 0))
          .slice(0, 4);
        setBudgetOverview(topBudgets);
      } catch (err) {
        setBudgetError(err?.response?.data?.message ?? 'Unable to load budget overview');
        setBudgetOverview([]);
      } finally {
        setBudgetLoading(false);
      }

      try {
        const goalData = await goalRequest;
        const topGoals = (Array.isArray(goalData) ? goalData : [])
          .slice()
          .sort((a, b) => {
            const statusWeight = { BEHIND: 0, ON_TRACK: 1, COMPLETED: 2 };
            const diff = (statusWeight[a.status] ?? 1) - (statusWeight[b.status] ?? 1);
            if (diff !== 0) return diff;
            return (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0);
          })
          .slice(0, 4);
        setGoalForecast(topGoals);
      } catch (err) {
        setGoalError(err?.response?.data?.message ?? 'Unable to load goal forecast');
        setGoalForecast([]);
      } finally {
        setGoalLoading(false);
      }

      try {
        const aiData = await aiRequest;
        setAiInsight(aiData);
      } catch (err) {
        setAiError(err?.response?.data?.message ?? 'Unable to load AI insights');
        setAiInsight(null);
      } finally {
        setAiLoading(false);
      }

      try {
        const anomaliesData = await anomaliesRequest;
        setAnomalies(Array.isArray(anomaliesData) ? anomaliesData : []);
      } catch (err) {
        setAnomaliesError(err?.response?.data?.message ?? 'Unable to load alerts');
        setAnomalies([]);
      } finally {
        setAnomaliesLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (isEmptyAnalytics) return <EmptyState onAddRecord={() => navigate('/records')} />;

  const { summary, categoryBreakdown, monthlyTrends } = analytics || {};
  const isNegBalance = (summary?.netBalance ?? 0) < 0;
  const highestExpenseCategory = (categoryBreakdown || []).reduce(
    (max, item) => ((item?.expense ?? 0) > (max?.expense ?? 0) ? item : max),
    null
  );
  const averageTransactionAmount = totalRecords > 0
    ? ((summary?.totalIncome ?? 0) + (summary?.totalExpense ?? 0)) / totalRecords
    : 0;
  const savingsRate = (summary?.totalIncome ?? 0) > 0
    ? ((summary?.netBalance ?? 0) / summary.totalIncome) * 100
    : 0;
  const exceededBudget = budgetOverview.find((item) => item.alertLevel === 'exceeded');
  const behindGoal = goalForecast.find((item) => item.status === 'BEHIND');
  const aiSeverity = aiInsight?.severity || 'info';

  const refreshAiInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const data = await fetchAiInsights({ forceRefresh: true });
      setAiInsight(data);
    } catch (err) {
      setAiError(err?.response?.data?.message ?? 'Unable to refresh AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const askAiQuestion = async () => {
    const question = aiQuestion.trim();
    if (!question) return;

    setAiSubmitting(true);
    setAiError(null);
    setModalAiError(null);
    try {
      const data = await fetchAiInsights({ question, forceRefresh: true });
      setAiInsight(data);
      setModalAiInsight(data);
      setAiQuestion('');
    } catch (err) {
      const message = err?.response?.data?.message ?? 'Unable to ask AI right now';
      setAiError(message);
      setModalAiError(message);
    } finally {
      setAiSubmitting(false);
    }
  };

  const openAskAiModal = () => {
    setModalAiError(null);
    setAiQuestion('');
    setModalAiInsight(aiInsight);
    setIsAskAiOpen(true);
  };

  const closeAskAiModal = () => {
    setIsAskAiOpen(false);
    setAiQuestion('');
    setModalAiError(null);
  };

  const renderSeverityIcon = (severity) => {
    if (severity === 'warning') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l9 16H3l9-16z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
    }

    if (severity === 'success') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    }

    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    );
  };

  const openBudgetForItem = (item) => {
    const now = new Date();
    const params = new URLSearchParams({
      category: item.category || '',
      month: String(item.month || now.getMonth() + 1),
      year: String(item.year || now.getFullYear()),
    });
    navigate(`/budgets?${params.toString()}`);
  };

  const openGoalForItem = (item) => {
    const params = new URLSearchParams({
      category: item.category || '',
    });
    navigate(`/goals?${params.toString()}`);
  };

  const handleAnomalyClick = (anomaly) => {
    console.log('anomaly clicked', anomaly);
    setSelectedAnomaly(anomaly);
    setFixModalOpen(true);
  };

  const handleFixModalClose = () => {
    setFixModalOpen(false);
    setSelectedAnomaly(null);
  };

  const handleFixSuccess = async () => {
    setToastMessage('Issue resolved successfully');
    setToastType('success');

    // Refresh dashboard data
    try {
      const analyticsRequest = fetchAnalytics();
      const recordsRequest = fetchRecords({ page: 1, limit: 5 });
      const budgetRequest = fetchBudgetStatus();
      const goalRequest = fetchGoalForecast();
      const anomaliesRequest = fetchAiAnomalies();

      const analyticsData = await analyticsRequest;
      setAnalytics(analyticsData);

      const recordsData = await recordsRequest;
      const records = Array.isArray(recordsData?.items) ? recordsData.items : [];
      const newestFirst = records.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
      setRecentTransactions(newestFirst);

      const budgetData = await budgetRequest;
      const topBudgets = (Array.isArray(budgetData) ? budgetData : []).slice().sort((a, b) => (b.percentageUsed ?? 0) - (a.percentageUsed ?? 0)).slice(0, 4);
      setBudgetOverview(topBudgets);

      const goalData = await goalRequest;
      const topGoals = (Array.isArray(goalData) ? goalData : []).slice().sort((a, b) => {
        const statusWeight = { BEHIND: 0, ON_TRACK: 1, COMPLETED: 2 };
        const diff = (statusWeight[a.status] ?? 1) - (statusWeight[b.status] ?? 1);
        if (diff !== 0) return diff;
        return (b.progressPercentage ?? 0) - (a.progressPercentage ?? 0);
      }).slice(0, 4);
      setGoalForecast(topGoals);

      const anomaliesData = await anomaliesRequest;
      setAnomalies(Array.isArray(anomaliesData) ? anomaliesData : []);
    } catch (err) {
      console.error('Failed to refresh dashboard after fix:', err);
    }
  };

  return (
    <div className="db-root">
      <style>{css}</style>

      <PageHeader />

      {/* ── Summary cards ── */}
      {summary && (
        <div className="db-summary-grid">
          <StatCard label="Total Income"   value={summary.totalIncome?.toFixed(2)  || '0.00'} type="income"  delay="0.05s" />
          <StatCard label="Total Expenses" value={summary.totalExpense?.toFixed(2) || '0.00'} type="expense" delay="0.1s" />
          <StatCard label="Net Balance"    value={summary.netBalance?.toFixed(2)   || '0.00'} type="balance" isNeg={isNegBalance} delay="0.15s" />
        </div>
      )}

      {/* ── Financial Insights ── */}
      <div className="db-insights-wrap">
        <h3 className="db-insights-title">Financial Insights</h3>
        <div className="db-insights-grid">
          <InsightCard
            label="Highest Expense Category"
            value={highestExpenseCategory?.category || '-'}
            subtext={highestExpenseCategory ? usdFormatter.format(Number(highestExpenseCategory.expense || 0)) : 'No expense data'}
            delay="0.18s"
            icon={(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 20h18" />
                <path d="M6 16v-5" />
                <path d="M12 16V8" />
                <path d="M18 16V4" />
              </svg>
            )}
          />
          <InsightCard
            label="Average Transaction Amount"
            value={usdFormatter.format(averageTransactionAmount)}
            subtext={txLoading ? 'Calculating from records...' : 'Across all records'}
            delay="0.21s"
            icon={(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M8.5 9.2c0-1.3 1.5-2.2 3.3-2.2s3.2.8 3.2 2.1c0 1.4-1.1 2-3.2 2.4-2.2.4-3.3 1.1-3.3 2.5 0 1.2 1.2 2.2 3.3 2.2 1.9 0 3.2-.9 3.2-2.1" />
              </svg>
            )}
          />
          <InsightCard
            label="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            subtext={(summary?.totalIncome ?? 0) > 0 ? 'Net balance / income' : 'No income data'}
            delay="0.24s"
            icon={(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 14c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 5-4" />
                <path d="M4 20h16" />
                <path d="M7 8l2-4 2 4" />
              </svg>
            )}
          />
          <InsightCard
            label="Total Records"
            value={totalRecords.toLocaleString('en-US')}
            subtext={txLoading ? 'Loading records...' : 'Transactions tracked'}
            delay="0.27s"
            icon={(
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 9h8" />
                <path d="M8 13h8" />
                <path d="M8 17h5" />
              </svg>
            )}
          />
        </div>
      </div>

      {/* ── AI Financial Insights ── */}
      {/* ── Smart Alerts ── */}
      <div className="db-ai-wrap">
        <div className="db-ai-head">
          <h3 className="db-ai-title">Smart Alerts</h3>
        </div>
        <p className="db-ai-subtitle">Automated anomaly detection based on your recent activity</p>

        {anomaliesLoading ? (
          <div className="db-skeleton" style={{ height: 120 }} />
        ) : anomaliesError ? (
          <p className="db-transactions-note">{anomaliesError}</p>
        ) : anomalies.length === 0 ? (
          <p className="db-transactions-note">No alerts at this time.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {anomalies.map((a, idx) => (
              <div
                key={`${a.type}-${idx}`}
                className={`db-ai-card ${a.severity === 'warning' ? 'warning' : 'info'}`}
                onClick={() => handleAnomalyClick(a)}
                style={{ cursor: 'pointer' }}
              >
                <div className="db-ai-top">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className="db-ai-icon">{renderSeverityIcon(a.severity)}</span>
                    <div>
                      <p className="db-ai-card-title">{a.title}</p>
                      <span className={`db-ai-badge ${a.severity}`}>{a.severity}</span>
                    </div>
                  </div>
                </div>

                <p className="db-ai-message">{a.message}</p>

                <button
                  className="db-ai-btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnomalyClick(a);
                  }}
                  style={{ marginTop: 8 }}
                >
                  Fix Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="db-ai-wrap">
        <div className="db-ai-head">
          <h3 className="db-ai-title">AI Financial Insights</h3>
          <div className="db-ai-actions">
            <button type="button" className="db-ai-btn-ghost" onClick={openAskAiModal}>
              Ask AI
            </button>
            <button type="button" className="db-ai-btn" onClick={refreshAiInsights} disabled={aiLoading}>
              {aiLoading ? 'Refreshing...' : 'Refresh Insight'}
            </button>
          </div>
        </div>
        <p className="db-ai-subtitle">Personalized advisor recommendations powered by your live finance data</p>

        {aiLoading ? (
          <div className="db-skeleton" style={{ height: 180 }} />
        ) : aiError ? (
          <p className="db-transactions-note">{aiError}</p>
        ) : !aiInsight ? (
          <p className="db-transactions-note">No AI insights available yet.</p>
        ) : (
          <div className={`db-ai-card ${aiSeverity}`}>
            <div className="db-ai-top">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="db-ai-icon">{renderSeverityIcon(aiSeverity)}</span>
                <div>
                  <p className="db-ai-card-title">{aiInsight.insightTitle}</p>
                  <span className={`db-ai-badge ${aiSeverity}`}>{aiSeverity}</span>
                </div>
              </div>
            </div>

            <p className="db-ai-message">{aiInsight.insightMessage}</p>

            <div className="db-ai-suggestions">
              {(aiInsight.suggestions || []).map((item, index) => (
                <p key={`${index}-${item}`} className="db-ai-suggestion">{item}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Budget Overview ── */}
      <div className="db-budget-wrap">
        <div className="db-budget-head">
          <h3 className="db-budget-title">Budget Overview</h3>
        </div>
        <p className="db-budget-subtitle">Top 4 category budgets this month</p>

        {!budgetLoading && exceededBudget ? (
          <p className="db-budget-exceeded-note">
            You exceeded your {exceededBudget.category} budget by {usdFormatter.format(Math.abs(exceededBudget.remaining || 0))} this month
          </p>
        ) : null}

        {budgetLoading ? (
          <div className="db-budget-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="db-skeleton" style={{ height: 116, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : budgetError ? (
          <p className="db-transactions-note">{budgetError}</p>
        ) : budgetOverview.length === 0 ? (
          <p className="db-transactions-note">No budgets available yet.</p>
        ) : (
          <div className="db-budget-grid">
            {budgetOverview.map((item, index) => (
              <div
                key={item.id || `${item.category}-${index}`}
                className="db-budget-card"
                style={{ animationDelay: `${0.2 + index * 0.03}s` }}
                onClick={() => openBudgetForItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openBudgetForItem(item);
                  }
                }}
              >
                <div className="db-budget-row">
                  <p className="db-budget-category">{item.category}</p>
                  <span className={`db-budget-badge ${item.alertLevel}`}>{item.alertLevel}</span>
                </div>
                <div className="db-budget-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(item.percentageUsed || 0, 100)}>
                  <div className={`db-budget-progress-fill ${item.alertLevel}`} style={{ width: `${Math.min(item.percentageUsed || 0, 100)}%` }} />
                </div>
                <div className="db-budget-values">
                  <span>{usdFormatter.format(item.totalSpent || 0)} / <strong>{usdFormatter.format(item.monthlyLimit || 0)}</strong></span>
                  {item.alertLevel === 'exceeded' ? <span>Exceeded</span> : <span>{(item.percentageUsed || 0).toFixed(1)}%</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Goal Forecast ── */}
      <div className="db-goals-wrap">
        <div className="db-goals-head">
          <h3 className="db-goals-title">Goal Forecast</h3>
        </div>
        <p className="db-goals-subtitle">Top goal projections and status</p>

        {!goalLoading && behindGoal ? (
          <p className="db-budget-exceeded-note">
            {behindGoal.forecastMessage}
          </p>
        ) : null}

        {goalLoading ? (
          <div className="db-goals-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="db-skeleton" style={{ height: 148, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : goalError ? (
          <p className="db-transactions-note">{goalError}</p>
        ) : goalForecast.length === 0 ? (
          <p className="db-transactions-note">No goals available yet.</p>
        ) : (
          <div className="db-goals-grid">
            {goalForecast.map((item, index) => (
              <div
                key={item.id || `${item.name}-${index}`}
                className={`db-goal-card ${item.status === 'BEHIND' ? 'behind' : ''}`}
                style={{ animationDelay: `${0.18 + index * 0.03}s` }}
                role="button"
                tabIndex={0}
                onClick={() => openGoalForItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openGoalForItem(item);
                  }
                }}
              >
                <div className="db-goal-row">
                  <p className="db-goal-name">{item.name}</p>
                  <span className={`db-goal-status ${item.status}`}>{item.status.replace('_', ' ')}</span>
                </div>
                <div className="db-goal-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.min(item.progressPercentage || 0, 100)}>
                  <div className={`db-goal-progress-fill ${item.status}`} style={{ width: `${Math.min(item.progressPercentage || 0, 100)}%` }} />
                </div>
                <div className="db-goal-values">
                  <span>{(item.progressPercentage || 0).toFixed(1)}% saved</span>
                  <span>{item.projectedCompletionDate ? new Date(item.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No projection'}</span>
                </div>
                <p className={`db-goal-completion ${item.status === 'BEHIND' ? 'behind' : ''}`}>
                  {item.forecastMessage}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="db-charts-grid">

        {/* Bar chart */}
        <div className="db-chart-card" style={{ animationDelay: '0.2s' }}>
          <h3 className="db-chart-title">Monthly Performance</h3>
          <p className="db-chart-subtitle">Income vs expenses over time</p>
          <div className="db-chart-legend">
            <span className="db-legend-item">
              <span className="db-legend-dot" style={{ background: '#639922' }} />Income
            </span>
            <span className="db-legend-item">
              <span className="db-legend-dot" style={{ background: '#D85A30' }} />Expenses
            </span>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends || []} barGap={4} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE7DF" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#C0BAA8"
                  tick={{ fill: '#8A8677', fontSize: 12, fontFamily: 'DM Sans' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  stroke="#C0BAA8"
                  tick={{ fill: '#8A8677', fontSize: 12, fontFamily: 'DM Sans' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="income"  fill="#639922" name="Income"  radius={[5, 5, 0, 0]} />
                <Bar dataKey="expense" fill="#D85A30" name="Expense" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="db-chart-card" style={{ animationDelay: '0.25s' }}>
          <h3 className="db-chart-title">Category Breakdown</h3>
          <p className="db-chart-subtitle">Net by category</p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown || []}
                  cx="50%" cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="net"
                  nameKey="category"
                  labelLine={false}
                >
                  {(categoryBreakdown || []).map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={PALETTE[i % PALETTE.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend below pie */}
          <div className="db-pie-legend">
            {(categoryBreakdown || []).map((entry, i) => (
              <div key={i} className="db-pie-legend-row">
                <span className="db-pie-legend-swatch" style={{ background: PALETTE[i % PALETTE.length] }} />
                <span className="db-pie-legend-name">{entry.category}</span>
                <span className="db-pie-legend-val">${entry.net?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Recent Transactions ── */}
      <div className="db-transactions-wrap">
        <div className="db-chart-card db-transactions-card" style={{ animationDelay: '0.3s' }}>
          <h3 className="db-chart-title">Recent Transactions</h3>
          <p className="db-chart-subtitle">Latest 5 records, newest first</p>

          {txLoading && (
            <div className="db-transactions-list">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="db-skeleton db-transactions-skeleton" style={{ animationDelay: `${i * 0.05}s` }} />
              ))}
            </div>
          )}

          {!txLoading && txError && (
            <p className="db-transactions-note">{txError}</p>
          )}

          {!txLoading && !txError && recentTransactions.length === 0 && (
            <p className="db-transactions-note">No recent transactions available.</p>
          )}

          {!txLoading && !txError && recentTransactions.length > 0 && (
            <div className="db-transactions-list">
              {recentTransactions.map((transaction) => {
                const type = transaction.type === 'INCOME' ? 'income' : 'expense';
                const amount = Number(transaction.amount || 0);
                return (
                  <div key={transaction.id} className="db-transaction-row">
                    <p className="db-transaction-category">{transaction.category}</p>
                    <p className="db-transaction-date">{formatRecordDate(transaction.date)}</p>
                    <span className={`db-transaction-type ${type}`}>{transaction.type}</span>
                    <p className={`db-transaction-amount ${type}`}>{usdFormatter.format(amount)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isAskAiOpen ? (
        <div className="db-ai-modal-backdrop" onClick={closeAskAiModal}>
          <div className="db-ai-modal" onClick={(event) => event.stopPropagation()}>
            <div className="db-ai-modal-head">
              <h3 className="db-ai-modal-title">Ask AI Advisor</h3>
              <button type="button" className="db-ai-close" onClick={closeAskAiModal} aria-label="Close">x</button>
            </div>

            <div className="db-ai-modal-body">
              <p className="db-ai-quick-title">Quick prompts</p>
              <div className="db-ai-quick-grid">
                {AI_QUESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="db-ai-quick-btn"
                    onClick={() => setAiQuestion(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <textarea
                className="db-ai-question"
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder="Ask about overspending, savings, budget discipline, or goal pacing"
              />

              {aiSubmitting ? (
                <div className="db-ai-response-box" aria-live="polite">
                  <p className="db-ai-response-title">Latest AI response</p>
                  <p className="db-ai-response-text">Thinking...</p>
                </div>
              ) : modalAiError ? (
                <div className="db-ai-response-box" aria-live="polite">
                  <p className="db-ai-response-title">Latest AI response</p>
                  <p className="db-ai-response-text">{modalAiError}</p>
                </div>
              ) : modalAiInsight ? (
                <div className="db-ai-response-box">
                  <p className="db-ai-response-title">Latest AI response</p>
                  <p className="db-ai-response-heading">{modalAiInsight.insightTitle}</p>
                  <p className="db-ai-response-text">{modalAiInsight.insightMessage}</p>
                </div>
              ) : null}
            </div>

            <div className="db-ai-modal-foot">
              <button type="button" className="db-ai-btn-ghost" onClick={closeAskAiModal} disabled={aiSubmitting}>Cancel</button>
              <button type="button" className="db-ai-btn" onClick={askAiQuestion} disabled={aiSubmitting || !aiQuestion.trim()}>
                {aiSubmitting ? 'Asking...' : 'Ask AI'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Fix Modal ── */}
      <FixModal
        anomaly={selectedAnomaly}
        isOpen={fixModalOpen}
        onClose={handleFixModalClose}
        onSuccess={handleFixSuccess}
      />

      {/* ── Toast Notification ── */}
      <Toast
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastMessage(null)}
      />
    </div>
  );
}