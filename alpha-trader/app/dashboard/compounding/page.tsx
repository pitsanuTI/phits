'use client';

import { ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import CompoundingJournal from './CompoundingJournal';
import { useEscClose } from '@/lib/useEscClose';
import { useTradingData } from '@/lib/trading/store';
import { calculateMonthlyPnL } from '@/lib/trading/selectors';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  Clock,
  Coins,
  DollarSign,
  Flame,
  Gauge,
  Hourglass,
  LayoutDashboard,
  Pencil,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  TrendingDown,
  Zap,
  X,
} from 'lucide-react';
import { cardEntrance, staggerContainer } from '@/lib/animations';

/* ─────────────────────────────────────────────────────────────────────────────
   Compounding Interest — single Exness account, balance starts at $100.
   Balance is stored in localStorage (alpha_exness_balance).
   Monthly history is stored in localStorage (alpha_exness_history).
   ──────────────────────────────────────────────────────────────────────────── */

const GOAL = 1_000_000;
const TODAY = new Date(2026, 5, 6);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MILESTONES = [1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];
const MILESTONE_NOTES = [
  'First step!',
  'Keep going',
  'Great start!',
  'On track',
  'Stay consistent',
  'Keep scaling',
  'Patience pays',
  'Risk control',
  'Financial freedom!',
];

const BALANCE_KEY  = 'alpha_exness_balance';
const HISTORY_KEY  = 'alpha_exness_history';
const RETURN_KEY   = 'alpha_exness_return_target';
const ADDON_KEY    = 'alpha_exness_addon';

export interface MonthRecord {
  month: string;
  start: number;
  pct: number;
  profit: number;
  end: number;
}

/* ── Compound math ─────────────────────────────────────────────────────────── */
function balanceAtMonth(n: number, p: number, monthlyPct: number, addon: number): number {
  const r = monthlyPct / 100;
  if (r <= 0) return p + addon * n;
  const g = Math.pow(1 + r, n);
  return p * g + (addon * (g - 1)) / r;
}

function monthsToReach(target: number, p: number, monthlyPct: number, addon: number): number {
  if (p >= target) return 0;
  const r = monthlyPct / 100;
  if (r <= 0) return addon > 0 ? (target - p) / addon : Infinity;
  const k = addon / r;
  const ratio = (target + k) / (p + k);
  if (ratio <= 0) return Infinity;
  return Math.log(ratio) / Math.log(1 + r);
}

function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + Math.round(months));
  return d;
}
const fmtMonthYear = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const fmt2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => Math.round(n).toLocaleString('en-US');
const fmtAxis = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
};

/* ── localStorage helpers ──────────────────────────────────────────────────── */
function loadBalance(): number {
  try { return parseFloat(localStorage.getItem(BALANCE_KEY) || '100') || 100; } catch { return 100; }
}
function saveBalance(v: number) {
  try { localStorage.setItem(BALANCE_KEY, String(v)); } catch {}
}
function loadHistory(): MonthRecord[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveHistory(h: MonthRecord[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}
function loadReturnTarget(): number {
  try { return parseFloat(localStorage.getItem(RETURN_KEY) || '6') || 6; } catch { return 6; }
}
function saveReturnTarget(v: number) {
  try { localStorage.setItem(RETURN_KEY, String(v)); } catch {}
}
function loadAddon(): number {
  try { return parseFloat(localStorage.getItem(ADDON_KEY) || '0') || 0; } catch { return 0; }
}
function saveAddon(v: number) {
  try { localStorage.setItem(ADDON_KEY, String(v)); } catch {}
}

/* ── Accent palette ─────────────────────────────────────────────────────────── */
const ACCENTS = {
  teal:   { grad: 'from-teal-500 to-emerald-400',  stroke: '#5eead4' },
  violet: { grad: 'from-violet-500 to-purple-500', stroke: '#c4b5fd' },
  sky:    { grad: 'from-sky-500 to-blue-500',      stroke: '#7dd3fc' },
  mint:   { grad: 'from-emerald-500 to-teal-500',  stroke: '#6ee7b7' },
  amber:  { grad: 'from-amber-400 to-orange-400',  stroke: '#fde68a' },
  orange: { grad: 'from-orange-500 to-amber-500',  stroke: '#fed7aa' },
  pink:   { grad: 'from-pink-500 to-fuchsia-500',  stroke: '#f9a8d4' },
  green:  { grad: 'from-green-500 to-emerald-500', stroke: '#86efac' },
  coral:  { grad: 'from-rose-500 to-pink-500',     stroke: '#fda4af' },
  indigo: { grad: 'from-indigo-500 to-violet-500', stroke: '#a5b4fc' },
} as const;

/* ── Sparkline ──────────────────────────────────────────────────────────────── */
function Spark({ data, color }: { data: number[]; color: string }) {
  const id = `sp-${useId().replace(/:/g, '')}`;
  const gId = `glow-${useId().replace(/:/g, '')}`;
  const series = data.map((v) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
          <filter id={gId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.2} fill={`url(#${id})`} dot={false} filter={`url(#${gId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── KPI card ───────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accent, icon, spark }: {
  label: string; value: string; sub: ReactNode;
  accent: keyof typeof ACCENTS; icon: ReactNode; spark?: number[];
}) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      variants={cardEntrance}
      whileHover={{ y: -5, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${a.grad} p-4 shadow-lg h-[128px]`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-2xl bg-gradient-to-b from-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70 truncate">{label}</div>
          <div className="stat-num mt-1.5 text-[25px] font-bold leading-none tracking-tight text-white drop-shadow-sm">{value}</div>
          <div className="mt-1.5 text-[11px] font-medium text-white/75">{sub}</div>
        </div>
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
            <span className="text-white drop-shadow">{icon}</span>
          </div>
        </div>
      </div>
      {spark && <div className="relative mt-2.5 h-11"><Spark data={spark} color="rgba(255,255,255,0.9)" /></div>}
    </motion.div>
  );
}

/* ── Calculator field ───────────────────────────────────────────────────────── */
function Field({ label, value, onChange, prefix, suffix, step = 'any' }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      <div className="flex items-center gap-1 rounded-lg border border-purple-100 bg-white px-2 py-1.5 focus-within:border-purple-300">
        {prefix && <span className="text-[11px] font-semibold text-slate-400">{prefix}</span>}
        <input
          type="number" step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-[72px] bg-transparent text-right text-[12px] font-bold text-slate-800 outline-none"
        />
        {suffix && <span className="text-[11px] font-semibold text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

const cardCls  = 'rounded-2xl border border-purple-100/70 dark:border-white/10 bg-white dark:bg-[#181a2c] p-5 shadow-sm';
const titleCls = 'text-[14px] font-bold text-slate-900';

/* ── Update Balance Modal ───────────────────────────────────────────────────── */
function BalanceModal({ current, onSave, onClose }: {
  current: number; onSave: (v: number) => void; onClose: () => void;
}) {
  const [val, setVal] = useState(current);
  useEscClose(onClose);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center shadow">
              <DollarSign size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-extrabold text-gray-800">Update Balance</h2>
              <p className="text-[10px] text-gray-400">Exness Personal Account</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100">
            <X size={15} />
          </button>
        </div>
        <div className="p-6">
          <label className="text-[11px] font-bold text-gray-600">Current Balance (USD)</label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-300">
            <span className="text-[13px] font-bold text-slate-400">$</span>
            <input
              type="number" step="0.01" value={val}
              onChange={e => setVal(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-transparent text-[16px] font-extrabold text-slate-800 outline-none"
              autoFocus
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400">ใส่ยอดเงินจริงใน Exness ของคุณ</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-purple-100 px-6 py-4 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
          <button
            onClick={() => { if (val > 0) onSave(val); }}
            className="px-5 py-2 text-[12px] font-extrabold text-white bg-gradient-to-r from-purple-600 to-violet-500 rounded-xl shadow hover:opacity-90 transition"
          >
            Save Balance
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Add Month Record Modal ─────────────────────────────────────────────────── */
function AddMonthModal({ onSave, onClose, lastBalance }: {
  onSave: (r: MonthRecord) => void; onClose: () => void; lastBalance: number;
}) {
  const now = new Date();
  const [form, setForm] = useState({
    month: `${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
    start: lastBalance,
    pct: 0,
    profit: 0,
  });

  const end = form.start + form.profit;

  useEscClose(onClose);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center shadow">
              <Plus size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-extrabold text-gray-800">Add Monthly Result</h2>
              <p className="text-[10px] text-gray-400">Record this month's performance</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { label: 'Month', key: 'month', type: 'text', placeholder: 'Jun 2026' },
            { label: 'Starting Balance ($)', key: 'start', type: 'number', placeholder: '100' },
            { label: 'Profit % (Monthly Return)', key: 'pct', type: 'number', placeholder: '6.5' },
            { label: 'Profit (USD)', key: 'profit', type: 'number', placeholder: '6.50' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[11px] font-bold text-gray-600">{f.label}</label>
              <input
                type={f.type}
                step="any"
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-purple-200 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
              />
            </div>
          ))}
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-700">
            Ending Balance: ${fmt2(end)}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-purple-100 px-6 py-4 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 text-[12px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">Cancel</button>
          <button
            onClick={() => { if (form.month) onSave({ ...form, end }); }}
            className="px-5 py-2 text-[12px] font-extrabold text-white bg-gradient-to-r from-teal-500 to-emerald-400 rounded-xl shadow hover:opacity-90 transition"
          >
            Add Record
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_TABS = [
  { id: 'overview', label: 'Overview',      icon: <LayoutDashboard size={13} /> },
  { id: 'journal',  label: 'Trade Journal', icon: <BookOpen size={13} /> },
] as const;
type PageTab = (typeof PAGE_TABS)[number]['id'];

export default function CompoundingPage() {
  const [pageTab, setPageTab] = useState<PageTab>('overview');

  // ── Single Exness account state ──
  const [balance, setBalance]           = useState(100);
  const [returnTarget, setReturnTarget] = useState(6);
  const [addon, setAddon]               = useState(0);
  const [history, setHistory]           = useState<MonthRecord[]>([]);

  const [balanceModal, setBalanceModal] = useState(false);
  const [addMonthModal, setAddMonthModal] = useState(false);
  const [syncModal, setSyncModal] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);

  // ── Trading store integration ──
  const { trades } = useTradingData();
  const currentMonthKey = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}`;
  const tradingMonthPnl = useMemo(() => calculateMonthlyPnL(trades, currentMonthKey), [trades, currentMonthKey]);
  const tradingMonthCount = useMemo(
    () => trades.filter(t => t.date.startsWith(currentMonthKey)).length,
    [trades, currentMonthKey],
  );

  useEffect(() => {
    setBalance(loadBalance());
    setReturnTarget(loadReturnTarget());
    setAddon(loadAddon());
    setHistory(loadHistory());
  }, []);

  // Re-read balance from localStorage when switching back to Overview
  // (Journal may have updated it via newBalance on a closed trade)
  useEffect(() => {
    if (pageTab === 'overview') {
      setBalance(loadBalance());
      setHistory(loadHistory());
      setCalcCapital(null);
    }
  }, [pageTab]);

  const handleSaveBalance = (v: number) => {
    setBalance(v);
    saveBalance(v);
    setBalanceModal(false);
  };

  const handleAddMonth = (r: MonthRecord) => {
    const updated = [r, ...history];
    setHistory(updated);
    saveHistory(updated);
    // auto-update balance to latest end balance
    setBalance(r.end);
    saveBalance(r.end);
    setAddMonthModal(false);
  };

  const handleDeleteMonth = (idx: number) => {
    const updated = history.filter((_, i) => i !== idx);
    setHistory(updated);
    saveHistory(updated);
    if (updated.length > 0) { setBalance(updated[0].end); saveBalance(updated[0].end); }
    else { setBalance(loadBalance()); }
  };

  const handleSyncFromTrading = () => {
    const monthLabel = `${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`;
    const start = balance;
    const profit = tradingMonthPnl;
    const end = start + profit;
    const pct = start > 0 ? +(profit / start * 100).toFixed(2) : 0;
    const record: MonthRecord = { month: monthLabel, start, pct, profit, end };
    const existingIdx = history.findIndex(h => h.month === monthLabel);
    const updated = existingIdx >= 0
      ? history.map((h, i) => i === existingIdx ? record : h)
      : [record, ...history];
    setHistory(updated);
    saveHistory(updated);
    setBalance(end);
    saveBalance(end);
    setSyncModal(false);
  };

  // ── Calculator overrides ──
  const [calcCapital, setCalcCapital] = useState<number | null>(null);
  const [calcReturn, setCalcReturn]   = useState<number | null>(null);
  const [calcAddon, setCalcAddon]     = useState<number | null>(null);
  const [years, setYears]             = useState(5);

  const effCapital = calcCapital ?? balance;
  const effReturn  = calcReturn  ?? returnTarget;
  const effAddon   = calcAddon   ?? addon;

  // Position sizing
  const [riskPct,     setRiskPct]     = useState(1.0);
  const [entry,       setEntry]       = useState(2395.5);
  const [slDistance,  setSlDistance]  = useState(35.0);

  /* ── Derived ── */
  const lastGain    = history[0]?.profit ?? 0;
  const lastGainPct = history[0]?.pct ?? 0;

  const monthsTo1M = useMemo(() => monthsToReach(GOAL, effCapital, effReturn, effAddon), [effCapital, effReturn, effAddon]);
  const yearsTo1M  = monthsTo1M / 12;
  const reachDate  = useMemo(() => fmtMonthYear(addMonths(TODAY, monthsTo1M)), [monthsTo1M]);
  const progressPct = (effCapital / GOAL) * 100;

  const streak = useMemo(() => {
    let s = 0;
    for (const r of history) { if (r.pct > 0) s++; else break; }
    return s;
  }, [history]);

  const avgReturn6 = useMemo(() => {
    const slice = history.slice(0, 6);
    return slice.length ? slice.reduce((s, r) => s + r.pct, 0) / slice.length : 0;
  }, [history]);

  const projection = useMemo(() => {
    const pts: { t: number; balance: number }[] = [];
    const total = years * 12;
    for (let m = 0; m <= total; m++) {
      pts.push({ t: +(m / 12).toFixed(4), balance: Math.round(balanceAtMonth(m, effCapital, effReturn, effAddon)) });
    }
    return pts;
  }, [effCapital, effReturn, effAddon, years]);

  const yearTicks  = useMemo(() => Array.from({ length: years + 1 }, (_, i) => i), [years]);
  const goalReached = yearsTo1M <= years && Number.isFinite(yearsTo1M);

  const milestones = useMemo(() => {
    let inProgressFound = false;
    return MILESTONES.map((target, i) => {
      const reached = effCapital >= target;
      let status: 'achieved' | 'inprogress' | 'upcoming';
      if (reached) status = 'achieved';
      else if (!inProgressFound) { status = 'inprogress'; inProgressFound = true; }
      else status = 'upcoming';
      const m = monthsToReach(target, effCapital, effReturn, effAddon);
      return {
        target, status,
        pct: Math.min((effCapital / target) * 100, 100),
        eta: reached ? 'Achieved' : fmtMonthYear(addMonths(TODAY, m)),
        note: MILESTONE_NOTES[i],
      };
    });
  }, [effCapital, effReturn, effAddon]);

  const dollarRisk  = balance * (riskPct / 100);
  const lossPerLot  = slDistance * 100;
  const lots        = lossPerLot > 0 ? dollarRisk / lossPerLot : 0;
  const lotsRounded = Math.round(lots * 100) / 100;
  const ounces      = lotsRounded * 100;

  const visibleMonths = showAllMonths ? history : history.slice(0, 6);

  return (
    <div className="trading-premium">
      <TopBar title="Compounding Interest" subtitle="เปลี่ยนกำไรเทรดทองให้เป็นเป้าหมาย $1,000,000 ด้วยพลังของดอกเบี้ยทบต้น" />

      {/* Tab switcher */}
      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max items-center gap-2">
          {PAGE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPageTab(t.id)}
              className={`flex items-center gap-2 h-10 rounded-xl px-4 text-[12px] font-extrabold whitespace-nowrap transition ${
                pageTab === t.id
                  ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)] dark:bg-purple-500/20 dark:text-purple-300'
                  : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-500/10'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {pageTab === 'journal' && <CompoundingJournal />}

      {pageTab === 'overview' && (
        <div>

          {/* KPI row */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
          >
            <KpiCard label="Current Balance" value={`$${fmt2(balance)}`} accent="teal"
              icon={<DollarSign size={20} />}
              sub={lastGain > 0 ? `+$${fmt2(lastGain)} last month` : 'No records yet'}
              spark={history.length ? history.slice().reverse().map(r => r.end) : [100]}
            />
            <KpiCard label="Monthly Growth Rate" value={history.length ? `+${avgReturn6.toFixed(2)}%` : `${returnTarget}% target`} accent="green"
              icon={<TrendingUp size={20} />}
              sub={history.length ? `Avg last ${Math.min(6, history.length)} months` : 'No records yet'}
              spark={history.length ? history.slice(0, 6).map(r => r.pct).reverse() : [returnTarget]}
            />
            <KpiCard label="Progress to Goal" value={`${progressPct.toFixed(3)}%`} accent="coral"
              icon={<Target size={20} />}
              sub={`$${fmt0(balance)} of $1M`}
              spark={[progressPct, progressPct * 1.05, progressPct * 1.1]}
            />
            <KpiCard label="Est. Time Remaining" value={Number.isFinite(yearsTo1M) ? `${yearsTo1M.toFixed(1)} Yrs` : '∞'} accent="indigo"
              icon={<Hourglass size={20} />}
              sub={Number.isFinite(monthsTo1M) ? `${Math.round(monthsTo1M)} months · ${reachDate}` : 'Set return target'}
              spark={[10, 9, 8, 7, 6, 5, 4]}
            />
            <KpiCard label="Compounding Streak" value={`${streak} Months`} accent="pink"
              icon={<Flame size={20} />}
              sub="Consecutive profitable months"
              spark={streak > 0 ? Array.from({ length: Math.min(streak, 7) }, (_, i) => i + 1) : [0]}
            />
            <KpiCard label="Monthly Add-on" value={`$${fmt0(effAddon)}`} accent="amber"
              icon={<ArrowUpRight size={20} />}
              sub="Reinvested each month"
              spark={[effAddon * 0.8, effAddon * 0.9, effAddon, effAddon, effAddon]}
            />
          </motion.div>

          {/* Account header band */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border border-teal-100/70 dark:border-white/10 bg-gradient-to-r from-teal-50 via-white to-emerald-50 dark:from-teal-900/20 dark:via-[#181a2c] dark:to-emerald-900/20 px-5 py-3.5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 shadow-md">
                <DollarSign size={18} className="text-white" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exness · Personal Account</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="stat-num text-[22px] font-extrabold text-slate-900 leading-none">${fmt2(balance)}</span>
                  {lastGain !== 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${lastGain > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                      {lastGain > 0 ? '+' : ''}${fmt2(lastGain)} ({lastGainPct}%) last month
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setSyncModal(true)}
                whileHover={{ y: -2, boxShadow: '0 8px 22px -8px rgba(168,85,247,0.45)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                disabled={tradingMonthCount === 0}
                className="relative flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-[11px] font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:from-slate-300 disabled:to-slate-300"
                title={tradingMonthCount === 0 ? 'No trades this month yet' : `Sync ${tradingMonthCount} trades from Trading`}
              >
                <Zap size={13} className="drop-shadow" /> Sync from Trading
                {tradingMonthCount > 0 && (
                  <span className="ml-0.5 rounded-full bg-white/25 px-1.5 py-[1px] text-[9px] font-extrabold">{tradingMonthCount}</span>
                )}
              </motion.button>
              <motion.button
                onClick={() => setAddMonthModal(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3 py-2 text-[11px] font-bold text-white shadow hover:bg-teal-600 transition"
              >
                <Plus size={13} /> Add Month
              </motion.button>
              <motion.button
                onClick={() => setBalanceModal(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3 py-2 text-[11px] font-bold text-teal-600 hover:bg-teal-50 transition"
              >
                <Pencil size={13} /> Update Balance
              </motion.button>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">

            {/* LEFT: projection chart + monthly table */}
            <div className="space-y-4 xl:col-span-5">
              <section className={cardCls}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className={titleCls}>Projected Compound Growth to $1,000,000</h3>
                  <select value={years} onChange={(e) => setYears(parseInt(e.target.value))}
                    className="h-8 rounded-lg border border-purple-100 bg-white px-2 text-[11px] font-semibold text-slate-600 outline-none focus:border-purple-300">
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                    <option value={10}>10 Years</option>
                    <option value={20}>20 Years</option>
                  </select>
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-500" /> Projected Balance</span>
                  <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-emerald-500" /> Goal: $1,000,000</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-400" /> Current</span>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projection} margin={{ top: 16, right: 12, bottom: 0, left: -8 }}>
                      <defs>
                        <linearGradient id="grow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.42} />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="t" type="number" domain={[0, years]} ticks={yearTicks}
                        tickFormatter={(v) => (v === 0 ? 'Now' : `${v}yr`)} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                      <Tooltip formatter={(v: number) => [`$${fmt0(v)}`, 'Balance']} labelFormatter={(v: number) => (v === 0 ? 'Now' : `${(+v).toFixed(1)} Years`)} />
                      <ReferenceLine y={GOAL} stroke="#10b981" strokeDasharray="5 4"
                        label={{ value: '$1,000,000', position: 'insideTopRight', fontSize: 9, fill: '#10b981', fontWeight: 700 }} />
                      <Area type="monotone" dataKey="balance" stroke="#7c3aed" strokeWidth={2.4} fill="url(#grow)" dot={false} />
                      <ReferenceDot x={0} y={balance} r={5} fill="#f97316" stroke="#fff" strokeWidth={2} />
                      {goalReached && (
                        <ReferenceDot x={yearsTo1M} y={GOAL} r={6} fill="#7c3aed" stroke="#fff" strokeWidth={2}
                          label={{ value: `${yearsTo1M.toFixed(1)}yrs → $1M`, position: 'top', fontSize: 9, fill: '#7c3aed', fontWeight: 700 }} />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Assuming {effReturn}% avg monthly return + ${fmt0(effAddon)}/mo add-on.
                </p>
              </section>

              {/* Monthly table */}
              <section className={cardCls}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`${titleCls} flex items-center gap-1.5`}>
                    <Gauge size={15} className="text-purple-500" /> Monthly Compounding Overview
                  </h3>
                  <button onClick={() => setAddMonthModal(true)}
                    className="flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-bold text-teal-600 hover:bg-teal-100 transition">
                    <Plus size={12} /> Add Month
                  </button>
                </div>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Gauge size={28} className="mb-2 opacity-30" />
                    <p className="text-[12px] font-semibold">No monthly records yet</p>
                    <p className="text-[11px]">Click "Add Month" to record your first result</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[480px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                            <th className="pb-2">Month</th>
                            <th className="pb-2">Start</th>
                            <th className="pb-2">%</th>
                            <th className="pb-2">Profit</th>
                            <th className="pb-2">End Balance</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleMonths.map((row, idx) => (
                            <tr key={`${row.month}-${idx}`} className="border-b border-slate-50 text-[12px]">
                              <td className="py-2 font-bold text-slate-800">{row.month}</td>
                              <td className="py-2 text-slate-600">${fmt2(row.start)}</td>
                              <td className={`py-2 font-semibold ${row.pct >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {row.pct >= 0 ? '+' : ''}{row.pct}%
                              </td>
                              <td className={`py-2 font-semibold ${row.profit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {row.profit >= 0 ? '+' : ''}${fmt2(row.profit)}
                              </td>
                              <td className="py-2 font-bold text-slate-900">${fmt2(row.end)}</td>
                              <td className="py-2">
                                <button onClick={() => handleDeleteMonth(idx)}
                                  className="text-slate-300 hover:text-rose-400 transition">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {history.length > 6 && (
                      <button onClick={() => setShowAllMonths(v => !v)}
                        className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-purple-600 hover:text-purple-700">
                        {showAllMonths ? 'Show Less' : `View All ${history.length} Months`} <ArrowUpRight size={13} />
                      </button>
                    )}
                  </>
                )}
              </section>
            </div>

            {/* CENTER: milestone roadmap + checklist + insights */}
            <div className="space-y-4 xl:col-span-4">
              <section className={cardCls}>
                <h3 className={`${titleCls} mb-4`}>Milestone Roadmap</h3>
                <div className="overflow-x-auto pb-1">
                  <div className="flex min-w-[500px]">
                    {milestones.map((m, i) => (
                      <div key={m.target} className="relative flex flex-1 flex-col items-center gap-2 px-0.5">
                        {i < milestones.length - 1 && (
                          <span className={`absolute left-1/2 h-0.5 w-full ${m.status === 'achieved' ? 'bg-emerald-300' : 'bg-slate-200'}`} style={{ top: 42 }} />
                        )}
                        <span className="h-4 text-[9px] font-bold text-slate-600">{fmtAxis(m.target)}</span>
                        <span className={[
                          'relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-[9px] font-extrabold',
                          m.status === 'achieved' ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md'
                            : m.status === 'inprogress' ? 'border-2 border-purple-400 bg-white text-purple-600'
                            : 'border-2 border-slate-200 bg-white text-slate-400',
                        ].join(' ')}>
                          {m.status === 'achieved' ? <Check size={15} /> : `${Math.round(m.pct)}%`}
                        </span>
                        <span className="h-3 text-center text-[9px] font-semibold text-slate-400">
                          {m.status === 'achieved' ? 'Done' : m.eta.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={cardCls}>
                <h3 className={`${titleCls} mb-3`}>Milestone Progress</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                        <th className="pb-2">Target</th>
                        <th className="pb-2">Progress</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Est. Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map((m) => (
                        <tr key={m.target} className="border-b border-slate-50 text-[11px]">
                          <td className="py-2 font-bold text-slate-800">{fmtAxis(m.target)}</td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full ${m.status === 'achieved' ? 'bg-emerald-500' : 'bg-purple-400'}`}
                                  style={{ width: `${m.pct}%` }} />
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500">{m.pct.toFixed(m.pct < 10 ? 1 : 0)}%</span>
                            </div>
                          </td>
                          <td className="py-2">
                            <span className={[
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold',
                              m.status === 'achieved' ? 'bg-emerald-50 text-emerald-600'
                                : m.status === 'inprogress' ? 'bg-purple-50 text-purple-600'
                                : 'bg-slate-100 text-slate-500',
                            ].join(' ')}>
                              {m.status === 'achieved' ? <><Check size={10} /> Achieved</>
                                : m.status === 'inprogress' ? <><Clock size={10} /> In Progress</>
                                : 'Upcoming'}
                            </span>
                          </td>
                          <td className="py-2 text-[10px] font-semibold text-slate-500">{m.eta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className={cardCls}>
                <h3 className={`${titleCls} mb-3 flex items-center gap-1.5`}>
                  <Sparkles size={15} className="text-purple-500" /> Insights
                </h3>
                <div className="space-y-3">
                  {[
                    { accent: 'mint' as const, icon: <ShieldCheck size={14} />, title: 'Safest Growth Pace', value: '4% – 7%', desc: 'Monthly returns in this range are sustainable long-term.', spark: [4,5,4.5,6,5.5,6.8,6.2] },
                    { accent: 'orange' as const, icon: <ShieldCheck size={14} />, title: 'Risk Control Reminder', value: '1% Max Risk', desc: 'Per trade is ideal for consistent compound growth.', spark: [3,2.2,2.6,1.8,2,1.4,1] },
                    { accent: 'sky' as const, icon: <TrendingUp size={14} />, title: 'At Current Pace', value: Number.isFinite(yearsTo1M) ? `${yearsTo1M.toFixed(1)} Years` : '∞', desc: "Stay disciplined and keep compounding.", spark: [2,3,4,5,6.5,8,10] },
                  ].map((c) => {
                    const a = ACCENTS[c.accent];
                    return (
                      <div key={c.title} className="flex items-center gap-3 rounded-xl border border-purple-100/70 p-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${a.grad} text-white shadow-sm`}>
                          {c.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{c.title}</div>
                          <div className="stat-num text-[16px] font-extrabold leading-tight text-slate-800">{c.value}</div>
                          <p className="text-[10px] leading-snug text-slate-500">{c.desc}</p>
                        </div>
                        <div className="h-10 w-16 shrink-0"><Spark data={c.spark} color={a.stroke} /></div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* RIGHT: calculators */}
            <div className="space-y-4 xl:col-span-3">
              {/* Account settings */}
              <section className={cardCls}>
                <h3 className={`${titleCls} mb-3 flex items-center gap-1.5`}>
                  <Gauge size={15} className="text-teal-500" /> Account Settings
                </h3>
                <div className="space-y-2.5">
                  <Field label="Monthly Return Target" value={returnTarget}
                    onChange={v => { setReturnTarget(v || 0); saveReturnTarget(v || 0); }} suffix="%" />
                  <Field label="Monthly Add-on (USD)" value={addon}
                    onChange={v => { setAddon(v || 0); saveAddon(v || 0); }} prefix="$" />
                </div>
                <div className="mt-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 px-3 py-2.5 text-[11px] text-teal-700 dark:text-teal-400">
                  <span className="font-bold">Current Balance:</span> ${fmt2(balance)} ·{' '}
                  <button onClick={() => setBalanceModal(true)} className="font-bold underline underline-offset-2 hover:text-teal-900">
                    Update
                  </button>
                </div>
              </section>

              {/* Time to $1M */}
              <section className={cardCls}>
                <h3 className={`${titleCls} mb-3 flex items-center gap-1.5`}>
                  <Calculator size={15} className="text-purple-500" /> Time to $1M Calculator
                </h3>
                <div className="space-y-2.5">
                  <Field label="Capital (USD)" value={effCapital} onChange={v => setCalcCapital(v || 0)} prefix="$" />
                  <Field label="Monthly Return (%)" value={effReturn} onChange={v => setCalcReturn(v || 0)} suffix="%" />
                  <Field label="Monthly Add-on (USD)" value={effAddon} onChange={v => setCalcAddon(v || 0)} prefix="$" />
                </div>
                {(calcCapital !== null || calcReturn !== null || calcAddon !== null) && (
                  <button onClick={() => { setCalcCapital(null); setCalcReturn(null); setCalcAddon(null); }}
                    className="mt-1.5 text-[10px] font-bold text-purple-500 hover:underline">
                    Reset to account defaults
                  </button>
                )}
                <div className="mt-3 rounded-xl border border-purple-100 dark:border-purple-800/40 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-purple-500">Time to $1,000,000</span>
                    <Rocket size={16} className="text-purple-500" />
                  </div>
                  <div className="stat-num mt-1 text-[26px] font-bold leading-none tracking-tight text-slate-900">
                    {Number.isFinite(monthsTo1M) ? monthsTo1M.toFixed(1) : '∞'}{' '}
                    <span className="text-[14px] font-semibold text-slate-500">Months</span>
                  </div>
                  <div className="mt-0.5 text-[12px] font-bold text-purple-600">{Number.isFinite(yearsTo1M) ? `${yearsTo1M.toFixed(1)} Years` : '∞'}</div>
                  {Number.isFinite(monthsTo1M) && (
                    <div className="mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Reach $1,000,000 by {reachDate}
                    </div>
                  )}
                </div>
              </section>

              {/* Gold position sizing */}
              <section className={cardCls}>
                <h3 className={`${titleCls} mb-3 flex items-center gap-1.5`}>
                  <Coins size={15} className="text-amber-500" /> Gold Position Sizing
                  <span className="text-[10px] font-bold text-amber-500">(XAUUSD)</span>
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Account Balance</span>
                    <span className="text-[12px] font-extrabold text-slate-800">${fmt2(balance)}</span>
                  </div>
                  <Field label="Risk % per Trade" value={riskPct} onChange={setRiskPct} suffix="%" />
                  <Field label="Entry Price (XAUUSD)" value={entry} onChange={setEntry} prefix="$" />
                  <Field label="Stop Loss Distance ($)" value={slDistance} onChange={setSlDistance} prefix="$" />
                </div>
                <div className="mt-3 rounded-xl border border-amber-100 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-orange-500">Suggested Lot Size</span>
                    <Coins size={16} className="text-amber-500" />
                  </div>
                  <div className="stat-num mt-1 text-[26px] font-extrabold leading-none text-slate-900">
                    {lotsRounded.toFixed(2)} <span className="text-[14px] font-bold text-slate-500">Lots</span>
                  </div>
                  <div className="mt-1 text-[10px] font-semibold text-slate-500">≈ {fmt0(ounces)} oz · Risk ${fmt2(dollarRisk)}</div>
                </div>
                <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">1.00 Lot = 100 oz of Gold</p>
              </section>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-purple-100/70 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 px-5 py-3 text-center">
            <Sparkles size={14} className="shrink-0 text-purple-500" />
            <p className="text-[12px] font-semibold text-slate-600">
              &ldquo;The goal is not to make the most money, but to make the best money consistently.&rdquo; — Compounding is a marathon, not a sprint.
            </p>
          </div>
        </div>
      )}

      {balanceModal && (
        <BalanceModal current={balance} onSave={handleSaveBalance} onClose={() => setBalanceModal(false)} />
      )}
      {addMonthModal && (
        <AddMonthModal
          onSave={handleAddMonth}
          onClose={() => setAddMonthModal(false)}
          lastBalance={history[0]?.end ?? balance}
        />
      )}
      <AnimatePresence>
        {syncModal && (
          <SyncFromTradingModal
            balance={balance}
            pnl={tradingMonthPnl}
            count={tradingMonthCount}
            monthLabel={`${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`}
            overwriting={history.some(h => h.month === `${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`)}
            onConfirm={handleSyncFromTrading}
            onClose={() => setSyncModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sync from Trading Modal ─────────────────────────────────────────────────── */
function SyncFromTradingModal({ balance, pnl, count, monthLabel, overwriting, onConfirm, onClose }: {
  balance: number; pnl: number; count: number; monthLabel: string;
  overwriting: boolean; onConfirm: () => void; onClose: () => void;
}) {
  useEscClose(onClose, true);
  const newBalance = balance + pnl;
  const pct = balance > 0 ? (pnl / balance * 100) : 0;
  const positive = pnl >= 0;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]"
      >
        {/* Header */}
        <div className="px-5 py-4 text-white" style={{ background: 'linear-gradient(135deg,#8b5cf6,#d946ef)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[14px] font-extrabold">Sync from Trading</div>
              <div className="text-[11px] text-white/80">นำผล P&L เดือนนี้จาก Trading Journal มาเป็นเดือนใหม่</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Month</div>
              <div className="mt-1 text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{monthLabel}</div>
              <div className="mt-0.5 text-[10px] text-slate-400">{count} trades closed</div>
            </div>
            <div className={`rounded-2xl border p-3 ${positive ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10' : 'border-rose-100 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10'}`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />} Net P&L
              </div>
              <div className={`mt-1 text-[15px] font-extrabold ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {positive ? '+' : ''}${fmt2(pnl)}
              </div>
              <div className={`mt-0.5 text-[10px] font-bold ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {positive ? '+' : ''}{pct.toFixed(2)}%
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 p-4 dark:border-purple-500/20 dark:from-purple-500/10 dark:to-violet-500/10"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-500 dark:text-slate-400">Start Balance</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-200">${fmt2(balance)}</span>
            </div>
            <div className="my-2 h-px bg-purple-100 dark:bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">End Balance</span>
              <span className="text-[20px] font-extrabold text-purple-700 dark:text-purple-300">${fmt2(newBalance)}</span>
            </div>
          </motion.div>

          {overwriting && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
            >
              ⚠️ จะเขียนทับ record เดือน {monthLabel} ที่มีอยู่
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-white/5">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
          >ยกเลิก</motion.button>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 22px -6px rgba(168,85,247,0.5)' }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-[12px] font-extrabold text-white shadow"
          >
            <Zap size={13} /> Sync Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
