// ─────────────────────────────────────────────────────────────────────────────
// Trading Data Center — single source of truth for the Trading module.
// A trade log is the foundational unit; every headline metric the other Trading
// tabs show (Net P&L, Win Rate, Profit Factor, Avg R, Max DD, by-asset, by-session,
// by-setup, by-emotion, equity curve, monthly breakdown) is *derived* from it.
//
// Seeded deterministically Jan–May 2026 so SSR and client render identically
// (no Math.random at runtime → no hydration mismatch).
// ─────────────────────────────────────────────────────────────────────────────

export type TradeSide = 'Long' | 'Short';
export type TradeResult = 'Win' | 'Loss' | 'Breakeven';

export interface Trade {
  id: string;
  date: string; // 'YYYY-MM-DD' (Jan–May 2026)
  account: string; // which trading account this trade was taken on
  asset: string;
  side: TradeSide;
  session: string;
  setup: string;
  emotion: string;
  result: TradeResult;
  entry: number; // entry price
  exit: number; // exit price
  exitReason: string; // why the trade was closed
  r: number; // R-multiple, e.g. +1.9 / -0.85
  pnl: number; // $ profit / loss
  mfe: number; // Max Favourable Excursion (R)
  mae: number; // Max Adverse Excursion (R)
  notes?: string;
  beforeImg?: string; // optional uploaded "before" screenshot (data URL)
  afterImg?: string; // optional uploaded "after" screenshot (data URL)
}

// ── Taxonomies (shared with the other tabs so entries stay consistent) ────────
// price = typical level · move = price change per 1R · digits = decimals shown
export const ASSETS = [
  { name: 'XAUUSD', flag: '🪙', color: '#f59e0b', price: 2350, move: 8, digits: 2 },
  { name: 'NAS100', flag: '📊', color: '#10b981', price: 18900, move: 55, digits: 2 },
  { name: 'EURUSD', flag: '🇪🇺', color: '#38bdf8', price: 1.085, move: 0.0035, digits: 5 },
  { name: 'BTCUSD', flag: '₿', color: '#f97316', price: 62000, move: 850, digits: 1 },
  { name: 'GBPUSD', flag: '🇬🇧', color: '#8b5cf6', price: 1.27, move: 0.0042, digits: 5 },
] as const;

export const SESSIONS = ['Asia', 'London', 'New York', 'Overlap'] as const;
export const SETUPS = ['Breakout', 'Trend Follow', 'Reversal', 'Retest', 'Range'] as const;
export const SIDES: TradeSide[] = ['Long', 'Short'];
export const RESULTS: TradeResult[] = ['Win', 'Loss', 'Breakeven'];
export const EXIT_REASONS = [
  'Take Profit', 'Stop Loss', 'Trailing Stop', 'Manual Close',
  'Break-even Stop', 'News Exit', 'Reversal Signal', 'Time Exit',
] as const;
const WIN_EXITS = ['Take Profit', 'Trailing Stop', 'Manual Close', 'Reversal Signal'];
const LOSS_EXITS = ['Stop Loss', 'Manual Close', 'News Exit', 'Break-even Stop'];

export const assetInfo = (name: string) => ASSETS.find((a) => a.name === name) ?? ASSETS[0];

export function computeExit(entry: number, r: number, side: TradeSide, assetName: string): number {
  const a = assetInfo(assetName);
  const dir = side === 'Long' ? 1 : -1;
  return +(entry + dir * r * a.move).toFixed(a.digits);
}

export function fmtPrice(v: number, assetName: string): string {
  const a = assetInfo(assetName);
  return Number(v).toLocaleString('en-US', { minimumFractionDigits: a.digits, maximumFractionDigits: a.digits });
}

export const EMOTIONS = [
  { name: 'Confident', emoji: '💪', color: '#10b981' },
  { name: 'Calm', emoji: '😊', color: '#38bdf8' },
  { name: 'Anxious', emoji: '😟', color: '#f97316' },
  { name: 'Impulsive', emoji: '⚡', color: '#f43f5e' },
  { name: 'Greedy', emoji: '🤑', color: '#a78bfa' },
] as const;

// ── Trading accounts (which account each trade was taken on) ──────────────────
// type = Prop Firm (funded/challenge) · Personal (own capital)
// balance = nominal account size, used as the equity base when a single account
// is selected so per-account drawdown/return stay realistic.
export const ACCOUNTS = [
  { id: 'ftmo-200k', name: 'FTMO 200K', type: 'Prop Firm', broker: 'FTMO', color: '#7c3aed', balance: 200000 },
  { id: 'fundednext-50k', name: 'FundedNext 50K', type: 'Prop Firm', broker: 'FundedNext', color: '#38bdf8', balance: 50000 },
  { id: 'personal-live', name: 'Personal Live', type: 'Personal', broker: 'IC Markets', color: '#10b981', balance: 25000 },
  { id: 'swing-live', name: 'Swing Live', type: 'Personal', broker: 'Pepperstone', color: '#f59e0b', balance: 12000 },
] as const;

export const accountInfo = (name: string) => ACCOUNTS.find((a) => a.name === name) ?? ACCOUNTS[0];

// Stable hash → account, used to backfill legacy / imported rows that predate
// the account field so older localStorage data still spreads across accounts.
export function accountForId(id: string): string {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ACCOUNTS[(h >>> 0) % ACCOUNTS.length].name;
}

// Seed distribution: prop firms carry most of the volume (40/20/20/20).
const ACCOUNT_WEIGHTS = ['FTMO 200K', 'FTMO 200K', 'FundedNext 50K', 'Personal Live', 'Swing Live'] as const;

export const MONTHS = [
  { key: '2026-01', label: 'Jan', th: 'ม.ค.' },
  { key: '2026-02', label: 'Feb', th: 'ก.พ.' },
  { key: '2026-03', label: 'Mar', th: 'มี.ค.' },
  { key: '2026-04', label: 'Apr', th: 'เม.ย.' },
  { key: '2026-05', label: 'May', th: 'พ.ค.' },
] as const;

export const START_CAPITAL = 100000; // equity base for drawdown math
export const RISK_PER_TRADE = 420; // $ baseline risk → keeps R and $ consistent

export const STORAGE_KEY = 'alpha-trading-data-v1';

// ── Deterministic PRNG (mulberry32) ───────────────────────────────────────────
export function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(arr: readonly T[], rand: () => number): T => arr[Math.floor(rand() * arr.length)];

function buildSeed(): Trade[] {
  const rand = mulberry32(20260531);
  const plan = [
    { key: '2026-01', count: 9 },
    { key: '2026-02', count: 10 },
    { key: '2026-03', count: 11 },
    { key: '2026-04', count: 9 },
    { key: '2026-05', count: 10 },
  ];

  const trades: Trade[] = [];
  let n = 1;
  // Error-diffusion win/loss so the win-rate lands ~61% deterministically
  // (independent of the PRNG draw), matching the dashboard narrative.
  let winAcc = 0;

  for (const mo of plan) {
    for (let i = 0; i < mo.count; i++) {
      const account = ACCOUNT_WEIGHTS[Math.floor(rand() * ACCOUNT_WEIGHTS.length)];
      const asset = pick(ASSETS, rand).name;
      const side: TradeSide = pick(SIDES, rand);
      const session = pick(SESSIONS, rand);
      const setup = pick(SETUPS, rand);

      let result: TradeResult;
      if (n % 18 === 0) {
        result = 'Breakeven'; // ~2 breakeven trades sprinkled in
      } else {
        winAcc += 0.63;
        if (winAcc >= 1) { winAcc -= 1; result = 'Win'; } else result = 'Loss';
      }

      let r: number;
      if (result === 'Win') r = +(rand() * 2.6 + 0.4).toFixed(2);
      else if (result === 'Loss') r = -+(rand() * 1.4 + 0.3).toFixed(2);
      else r = 0;

      const pnl = Math.round(r * RISK_PER_TRADE);
      const mfe = +(Math.abs(r) + 0.2 + rand() * 0.9).toFixed(2);
      const mae = -+(0.2 + rand() * 1.1).toFixed(2);

      const a = assetInfo(asset);
      const entry = +(a.price * (1 + (rand() - 0.5) * 0.012)).toFixed(a.digits);
      const exit = computeExit(entry, r, side, asset);
      const exitReason =
        result === 'Breakeven'
          ? 'Break-even Stop'
          : result === 'Win'
            ? WIN_EXITS[Math.floor(rand() * WIN_EXITS.length)]
            : LOSS_EXITS[Math.floor(rand() * LOSS_EXITS.length)];

      const emotion =
        result === 'Win'
          ? EMOTIONS[Math.floor(rand() * 2)].name // Confident / Calm
          : result === 'Breakeven'
            ? 'Calm'
            : EMOTIONS[2 + Math.floor(rand() * 3)].name; // Anxious / Impulsive / Greedy

      const day = 1 + Math.floor(rand() * 27);
      const date = `${mo.key}-${String(day).padStart(2, '0')}`;

      trades.push({
        id: `T-${String(n).padStart(3, '0')}`,
        date,
        account,
        asset,
        side,
        session,
        setup,
        emotion,
        result,
        entry,
        exit,
        exitReason,
        r,
        pnl,
        mfe,
        mae,
      });
      n++;
    }
  }

  trades.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return trades;
}

export const seedTrades: Trade[] = buildSeed();

// ── Derivations ───────────────────────────────────────────────────────────────
export interface DerivedKpis {
  total: number;
  wins: number;
  losses: number;
  breakeven: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  winRate: number;
  profitFactor: number;
  avgR: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number; // $ per trade
  maxDdPct: number;
}

export function sortByDate(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

export function deriveEquity(trades: Trade[]): { date: string; equity: number }[] {
  let eq = START_CAPITAL;
  const out = sortByDate(trades).map((t) => {
    eq += t.pnl;
    return { date: t.date, equity: eq };
  });
  return [{ date: 'start', equity: START_CAPITAL }, ...out];
}

export function deriveKpis(trades: Trade[]): DerivedKpis {
  const total = trades.length;
  const wins = trades.filter((t) => t.result === 'Win').length;
  const losses = trades.filter((t) => t.result === 'Loss').length;
  const breakeven = trades.filter((t) => t.result === 'Breakeven').length;

  const netPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0);

  const winRate = total ? (wins / total) * 100 : 0;
  const profitFactor = grossLoss !== 0 ? grossProfit / Math.abs(grossLoss) : grossProfit > 0 ? 99 : 0;
  const avgR = total ? trades.reduce((s, t) => s + t.r, 0) / total : 0;

  const winRows = trades.filter((t) => t.result === 'Win');
  const lossRows = trades.filter((t) => t.result === 'Loss');
  const avgWin = winRows.length ? winRows.reduce((s, t) => s + t.r, 0) / winRows.length : 0;
  const avgLoss = lossRows.length ? lossRows.reduce((s, t) => s + t.r, 0) / lossRows.length : 0;
  const expectancy = total ? netPnl / total : 0;

  // Max drawdown % from the derived equity curve
  const eq = deriveEquity(trades);
  let peak = -Infinity;
  let maxDdPct = 0;
  for (const p of eq) {
    peak = Math.max(peak, p.equity);
    if (peak > 0) {
      const dd = ((p.equity - peak) / peak) * 100;
      if (dd < maxDdPct) maxDdPct = dd;
    }
  }

  return {
    total,
    wins,
    losses,
    breakeven,
    netPnl,
    grossProfit,
    grossLoss,
    winRate,
    profitFactor,
    avgR,
    avgWin,
    avgLoss,
    expectancy,
    maxDdPct,
  };
}

export interface MonthlyRow {
  key: string;
  label: string;
  th: string;
  trades: number;
  pnl: number;
  winRate: number;
}

export function deriveMonthly(trades: Trade[]): MonthlyRow[] {
  return MONTHS.map((mo) => {
    const rows = trades.filter((t) => t.date.startsWith(mo.key));
    const wins = rows.filter((t) => t.result === 'Win').length;
    return {
      key: mo.key,
      label: mo.label,
      th: mo.th,
      trades: rows.length,
      pnl: rows.reduce((s, t) => s + t.pnl, 0),
      winRate: rows.length ? (wins / rows.length) * 100 : 0,
    };
  });
}

export interface GroupRow {
  name: string;
  trades: number;
  pnl: number;
  wins: number;
  winRate: number;
}

export function groupBy(trades: Trade[], key: 'asset' | 'session' | 'setup' | 'emotion' | 'account'): GroupRow[] {
  const map = new Map<string, GroupRow>();
  for (const t of trades) {
    const k = t[key];
    if (!map.has(k)) map.set(k, { name: k, trades: 0, pnl: 0, wins: 0, winRate: 0 });
    const g = map.get(k)!;
    g.trades++;
    g.pnl += t.pnl;
    if (t.result === 'Win') g.wins++;
  }
  return [...map.values()]
    .map((g) => ({ ...g, winRate: g.trades ? (g.wins / g.trades) * 100 : 0 }))
    .sort((a, b) => b.pnl - a.pnl);
}

// ── Normalizer ────────────────────────────────────────────────────────────────
// Coerces an unknown record (localStorage / imported JSON) into a valid Trade,
// backfilling any missing field — including `account` for rows that predate it.
export function normalizeTrade(raw: Record<string, unknown>, i = 0): Trade {
  const asset = String(raw.asset ?? 'XAUUSD');
  const side: TradeSide = raw.side === 'Short' ? 'Short' : 'Long';
  const r = Number(raw.r ?? 0);
  const entry = raw.entry != null ? Number(raw.entry) : assetInfo(asset).price;
  const exit = raw.exit != null ? Number(raw.exit) : computeExit(entry, r, side, asset);
  const id = String(raw.id ?? `T-imp-${i}`);
  return {
    id,
    date: String(raw.date ?? '2026-01-01'),
    account: raw.account ? String(raw.account) : accountForId(id),
    asset,
    side,
    session: String(raw.session ?? 'London'),
    setup: String(raw.setup ?? 'Breakout'),
    emotion: String(raw.emotion ?? 'Calm'),
    result: (['Win', 'Loss', 'Breakeven'].includes(String(raw.result)) ? raw.result : 'Win') as TradeResult,
    entry,
    exit,
    exitReason: String(raw.exitReason ?? 'Manual Close'),
    r,
    pnl: Math.round(Number(raw.pnl ?? r * RISK_PER_TRADE)),
    mfe: Number(raw.mfe ?? 0),
    mae: Number(raw.mae ?? 0),
    notes: raw.notes ? String(raw.notes) : undefined,
    beforeImg: raw.beforeImg ? String(raw.beforeImg) : undefined,
    afterImg: raw.afterImg ? String(raw.afterImg) : undefined,
  };
}

// ── CSV helpers ───────────────────────────────────────────────────────────────
export const CSV_HEADERS = ['id', 'date', 'account', 'asset', 'side', 'session', 'setup', 'emotion', 'result', 'entry', 'exit', 'exitReason', 'r', 'pnl', 'mfe', 'mae', 'notes'] as const;

export function tradesToCsv(trades: Trade[]): string {
  const esc = (v: unknown) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = CSV_HEADERS.join(',');
  const body = sortByDate(trades)
    .map((t) => CSV_HEADERS.map((h) => esc((t as unknown as Record<string, unknown>)[h])).join(','))
    .join('\n');
  return `${head}\n${body}`;
}
