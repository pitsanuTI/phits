// ─────────────────────────────────────────────────────────────────────────────
// Trading selectors & calculation utilities — Trading > Overall
// All values are derived from the live trade log (no hardcoded JSX numbers).
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Trade,
  ACCOUNTS,
  START_CAPITAL,
  deriveKpis,
  deriveEquity,
  groupBy,
  sortByDate,
} from '@/data/trading-data-mock';
import { deriveAdvanced } from '@/lib/trading/insights';

// ── Total capital = sum of all account balances (prop + personal) ─────────────
export function calculateTotalCapital(): number {
  return ACCOUNTS.reduce((s, a) => s + a.balance, 0);
}

// ── Monthly P&L for a given month key (e.g. '2026-05') ───────────────────────
export function calculateMonthlyPnL(trades: Trade[], monthKey: string): number {
  return trades
    .filter((t) => t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.pnl, 0);
}

export function calculateMonthlyPnLPct(trades: Trade[], monthKey: string): number {
  const pnl = calculateMonthlyPnL(trades, monthKey);
  return START_CAPITAL > 0 ? (pnl / START_CAPITAL) * 100 : 0;
}

// ── Win rate ──────────────────────────────────────────────────────────────────
export function calculateWinRate(trades: Trade[]): number {
  if (!trades.length) return 0;
  return (trades.filter((t) => t.result === 'Win').length / trades.length) * 100;
}

// ── Profit factor ─────────────────────────────────────────────────────────────
export function calculateProfitFactor(trades: Trade[]): number {
  const gross = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const loss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
  if (loss === 0) return gross > 0 ? 99 : 0;
  return gross / loss;
}

// ── Max drawdown % from equity curve ─────────────────────────────────────────
export function calculateMaxDrawdown(trades: Trade[]): number {
  const eq = deriveEquity(trades);
  let peak = -Infinity;
  let maxDd = 0;
  for (const p of eq) {
    peak = Math.max(peak, p.equity);
    if (peak > 0) {
      const dd = ((p.equity - peak) / peak) * 100;
      if (dd < maxDd) maxDd = dd;
    }
  }
  return maxDd; // negative number
}

// ── Active challenges count (prop firm accounts = challenges) ─────────────────
export function getActiveChallenges(): number {
  return ACCOUNTS.filter((a) => a.type === 'Prop Firm').length;
}

// ── Build equity curve data for the chart ─────────────────────────────────────
export interface EquityPoint {
  date: string;
  equity: number;
  sma?: number; // 10-period SMA
}

export function buildEquityCurve(trades: Trade[]): EquityPoint[] {
  const raw = deriveEquity(trades);
  const PERIOD = 10;
  return raw.map((p, i) => {
    const window = raw.slice(Math.max(0, i - PERIOD + 1), i + 1);
    const sma = window.reduce((s, x) => s + x.equity, 0) / window.length;
    return { date: p.date, equity: p.equity, sma: +sma.toFixed(0) };
  });
}

// ── Trading readiness (0–100) ─────────────────────────────────────────────────
// Derived from discipline (PF, WR), psychology (consistency), and risk (DD)
export function calculateTradingReadiness(trades: Trade[]): {
  score: number;
  label: 'Ready' | 'Caution' | 'No Trade';
} {
  const kpis = deriveKpis(trades);
  const adv = deriveAdvanced(trades);
  const dd = Math.abs(adv.maxDdPct);

  let score = 50;
  score += Math.min(20, Math.max(-20, (kpis.winRate - 50) * 0.8));
  score += Math.min(20, Math.max(-20, (kpis.profitFactor - 1) * 15));
  score += Math.min(10, Math.max(-10, adv.consistency * 0.1));
  score -= Math.min(20, dd * 1.2);
  score -= Math.max(0, adv.maxLossStreak - 3) * 4;
  score = Math.round(Math.max(0, Math.min(100, score)));

  const label: 'Ready' | 'Caution' | 'No Trade' =
    score >= 65 ? 'Ready' : score >= 40 ? 'Caution' : 'No Trade';
  return { score, label };
}

// ── Psychology score — from emotion data in trades ────────────────────────────
// Calm/Confident = positive, Anxious/Impulsive/Greedy = negative
const POSITIVE_EMOTIONS = ['Calm', 'Confident'];
const NEGATIVE_EMOTIONS = ['Anxious', 'Impulsive', 'Greedy'];

export function calculatePsychologyScore(trades: Trade[]): number {
  if (!trades.length) return 50;
  const posCount = trades.filter((t) => POSITIVE_EMOTIONS.includes(t.emotion)).length;
  const negCount = trades.filter((t) => NEGATIVE_EMOTIONS.includes(t.emotion)).length;
  const base = (posCount / trades.length) * 100;
  const negPenalty = (negCount / trades.length) * 30;
  return Math.round(Math.max(0, Math.min(100, base - negPenalty + 30)));
}

// ── Discipline score — from consistency of profitable setup/session use ───────
export function calculateDisciplineScore(trades: Trade[]): number {
  if (!trades.length) return 50;
  const kpis = deriveKpis(trades);
  const adv = deriveAdvanced(trades);
  const base = adv.consistency;
  const bonus = kpis.expectancy > 0 ? 8 : -8;
  return Math.round(Math.max(0, Math.min(100, base + bonus)));
}

// ── Best edge — setup with highest PnL and enough samples ─────────────────────
export interface EdgeSummary {
  name: string;
  winRate: number;
  profitFactor: number;
  trades: number;
  pnl: number;
}

export function getBestEdge(trades: Trade[]): EdgeSummary | null {
  const bySetup = groupBy(trades, 'setup').filter((g) => g.trades >= 3 && g.pnl > 0);
  if (!bySetup.length) return null;
  const best = bySetup[0];
  const rows = trades.filter((t) => t.setup === best.name);
  const pf = calculateProfitFactor(rows);
  return { name: best.name, winRate: best.winRate, profitFactor: pf, trades: best.trades, pnl: best.pnl };
}

// ── Worst risk — asset/session combo with worst PnL and meaningful sample ─────
export interface RiskSummary {
  name: string;
  type: 'Asset' | 'Session' | 'Emotion';
  pnl: number;
  winRate: number;
  trades: number;
  severity: 'High' | 'Medium';
}

export function getWorstRisk(trades: Trade[]): RiskSummary | null {
  const candidates: RiskSummary[] = [];

  const byAsset = groupBy(trades, 'asset').filter((g) => g.trades >= 3 && g.pnl < 0);
  if (byAsset.length)
    candidates.push({ name: byAsset[byAsset.length - 1].name, type: 'Asset', ...byAsset[byAsset.length - 1], severity: 'High' });

  const byEmotion = groupBy(trades, 'emotion').filter(
    (g) => g.trades >= 2 && g.pnl < 0 && NEGATIVE_EMOTIONS.includes(g.name),
  );
  if (byEmotion.length)
    candidates.push({ name: byEmotion[byEmotion.length - 1].name, type: 'Emotion', ...byEmotion[byEmotion.length - 1], severity: 'High' });

  candidates.sort((a, b) => a.pnl - b.pnl);
  return candidates[0] ?? null;
}

// ── Recent trades (latest N by date) ─────────────────────────────────────────
export function getRecentTrades(trades: Trade[], n = 5): Trade[] {
  return sortByDate(trades).slice(-n).reverse();
}

// ── Sparkline data for a KPI — per-period net P&L so curve shows real waves ───
export function buildKpiSparkline(trades: Trade[]): { v: number }[] {
  const sorted = sortByDate(trades);
  if (sorted.length < 2) return [];

  // Divide the date range into 12 equal buckets and sum PnL per bucket
  const firstMs = new Date(sorted[0].date).getTime();
  const lastMs  = new Date(sorted[sorted.length - 1].date).getTime();
  const bucketMs = Math.max(1, (lastMs - firstMs) / 12);

  const buckets = new Array(12).fill(0) as number[];
  for (const t of sorted) {
    const idx = Math.min(11, Math.floor((new Date(t.date).getTime() - firstMs) / bucketMs));
    buckets[idx] += t.pnl;
  }

  // Shift so all values ≥ 1 (keeps normalization meaningful)
  const minVal = Math.min(...buckets);
  const shift  = minVal < 1 ? -minVal + 1 : 0;
  return buckets.map(b => ({ v: b + shift }));
}

// ── Month key helper ──────────────────────────────────────────────────────────
export function currentMonthKey(): string {
  // Use latest month in seed data (May 2026)
  return '2026-05';
}

export function prevMonthKey(): string {
  return '2026-04';
}
