'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  ImageIcon,
  Info,
  Layers,
  Minus,
  Plus,
  Search,
  Shield,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────────── */
export interface TradeEntry {
  id: string;
  // Before Entry
  date: string;
  session: 'London' | 'New York' | 'Asian' | 'Other';
  direction: 'Long' | 'Short';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  lotSize: number;
  riskPct: number;
  riskAmount: number;
  rrRatio: number;
  setup: string;
  marketStructure: 'Bullish' | 'Bearish' | 'Ranging';
  timeframe: string;
  confluence: string[];
  confidence: number;
  preTradeNotes: string;
  emotionalState: string;
  preScreenshot: string;
  // After Exit
  exitPrice: number;
  outcome: 'Win' | 'Loss' | 'Breakeven' | '';
  actualPnl: number;
  rMultiple: number;
  newBalance: number;
  exitReason: string;
  postTradeNotes: string;
  postScreenshot: string;
  // Self Review
  followedPlan: 'Yes' | 'Partial' | 'No' | '';
  entryQuality: number;
  exitQuality: number;
  riskManagementOk: boolean | null;
  mistakes: string;
  lessonsLearned: string;
  nextImprovement: string;
  status: 'open' | 'closed';
  createdAt: string;
}

/* ─── Mock seed data ─────────────────────────────────────────────────────────── */
const SEED: TradeEntry[] = [
  {
    id: 'j1',
    date: '2026-06-03',
    session: 'London',
    direction: 'Long',
    entryPrice: 2415.5,
    stopLoss: 2400.0,
    takeProfit1: 2445.0,
    takeProfit2: 2462.0,
    lotSize: 0.12,
    riskPct: 1.0,
    riskAmount: 187.51,
    rrRatio: 1.9,
    setup: 'Order Block',
    marketStructure: 'Bullish',
    timeframe: 'H1',
    confluence: ['EMA', 'S&R', 'Session Low'],
    confidence: 4,
    preTradeNotes: 'Price bounced from 4H OB, structure bullish, targeting previous high. DXY showing weakness.',
    emotionalState: 'Calm',
    preScreenshot: '',
    exitPrice: 2445.0,
    outcome: 'Win',
    actualPnl: 356.4,
    rMultiple: 1.9,
    newBalance: 19107.08,
    exitReason: 'TP Hit',
    postTradeNotes: 'Clean execution. Price moved directly to TP1 without retracing. Could have held for TP2.',
    postScreenshot: '',
    followedPlan: 'Yes',
    entryQuality: 5,
    exitQuality: 4,
    riskManagementOk: true,
    mistakes: '',
    lessonsLearned: 'OB + Session Low confluence is high-probability on H1 during London open.',
    nextImprovement: 'Consider trailing stop to TP2 when price moves 1R in profit.',
    status: 'closed',
    createdAt: '2026-06-03T09:30:00Z',
  },
  {
    id: 'j2',
    date: '2026-06-02',
    session: 'New York',
    direction: 'Short',
    entryPrice: 2432.0,
    stopLoss: 2442.0,
    takeProfit1: 2415.0,
    takeProfit2: 2405.0,
    lotSize: 0.09,
    riskPct: 0.8,
    riskAmount: 150.0,
    rrRatio: 1.7,
    setup: 'Break & Retest',
    marketStructure: 'Bearish',
    timeframe: 'H1',
    confluence: ['S&R', 'FVG', 'News'],
    confidence: 3,
    preTradeNotes: 'Break of H4 structure, retest of broken level, bearish FVG above. NFP week caution.',
    emotionalState: 'Nervous',
    preScreenshot: '',
    exitPrice: 2439.0,
    outcome: 'Loss',
    actualPnl: -150.0,
    rMultiple: -1.0,
    newBalance: 18750.68,
    exitReason: 'SL Hit',
    postTradeNotes: 'Price spiked up before reversing. Likely liquidity hunt above my SL. Entry was too early.',
    postScreenshot: '',
    followedPlan: 'Partial',
    entryQuality: 2,
    exitQuality: 3,
    riskManagementOk: true,
    mistakes: 'Entered before retest confirmation. Should have waited for M15 candle close.',
    lessonsLearned: 'During NFP week, wait for full candle confirmation before entry.',
    nextImprovement: 'Add news calendar check to pre-trade routine.',
    status: 'closed',
    createdAt: '2026-06-02T14:00:00Z',
  },
  {
    id: 'j3',
    date: '2026-05-30',
    session: 'London',
    direction: 'Long',
    entryPrice: 2388.0,
    stopLoss: 2375.0,
    takeProfit1: 2415.0,
    takeProfit2: 2428.0,
    lotSize: 0.11,
    riskPct: 1.0,
    riskAmount: 175.0,
    rrRatio: 2.1,
    setup: 'FVG Fill',
    marketStructure: 'Bullish',
    timeframe: 'H4',
    confluence: ['EMA', 'FVG', 'Session High-Low'],
    confidence: 5,
    preTradeNotes: 'H4 FVG left from last week, price returning to fill. Strong bullish structure on D1.',
    emotionalState: 'Confident',
    preScreenshot: '',
    exitPrice: 2415.0,
    outcome: 'Win',
    actualPnl: 367.5,
    rMultiple: 2.1,
    newBalance: 18960.68,
    exitReason: 'TP Hit',
    postTradeNotes: 'Perfect FVG fill play. Price reacted exactly at the zone. H4 timeframe is my edge.',
    postScreenshot: '',
    followedPlan: 'Yes',
    entryQuality: 5,
    exitQuality: 5,
    riskManagementOk: true,
    mistakes: '',
    lessonsLearned: 'H4 FVG on D1 bullish structure = highest-probability setup for this account.',
    nextImprovement: 'Scale up lot size slightly when confidence is 5/5.',
    status: 'closed',
    createdAt: '2026-05-30T09:15:00Z',
  },
  {
    id: 'j4',
    date: '2026-05-28',
    session: 'Asian',
    direction: 'Long',
    entryPrice: 2371.0,
    stopLoss: 2362.0,
    takeProfit1: 2390.0,
    takeProfit2: 2400.0,
    lotSize: 0.10,
    riskPct: 0.9,
    riskAmount: 168.0,
    rrRatio: 2.1,
    setup: 'HL Break',
    marketStructure: 'Bullish',
    timeframe: 'M15',
    confluence: ['EMA', 'S&R'],
    confidence: 3,
    preTradeNotes: 'Asian session breakout of previous day high. Low volume but structure supports long.',
    emotionalState: 'Calm',
    preScreenshot: '',
    exitPrice: 2369.0,
    outcome: 'Loss',
    actualPnl: -168.0,
    rMultiple: -1.0,
    newBalance: 18593.18,
    exitReason: 'SL Hit',
    postTradeNotes: 'Asian session fakeout. Price broke high then reversed. Shouldnt trade Asian low-volume.',
    postScreenshot: '',
    followedPlan: 'No',
    entryQuality: 2,
    exitQuality: 3,
    riskManagementOk: true,
    mistakes: 'Trading during Asian low-volume session. M15 timeframe too noisy.',
    lessonsLearned: 'Stick to London and New York sessions. Asian session has too many fakeouts for this setup.',
    nextImprovement: 'Add session filter — only trade London open and NY overlap.',
    status: 'closed',
    createdAt: '2026-05-28T03:00:00Z',
  },
  {
    id: 'j5',
    date: '2026-06-05',
    session: 'London',
    direction: 'Long',
    entryPrice: 2421.0,
    stopLoss: 2408.0,
    takeProfit1: 2448.0,
    takeProfit2: 2462.0,
    lotSize: 0.12,
    riskPct: 1.0,
    riskAmount: 187.51,
    rrRatio: 2.1,
    setup: 'Order Block',
    marketStructure: 'Bullish',
    timeframe: 'H1',
    confluence: ['EMA', 'S&R', 'FVG'],
    confidence: 4,
    preTradeNotes: 'Clean H1 OB + FVG combo at key S&R. DXY showing weakness into London. Targeting liquidity above.',
    emotionalState: 'Confident',
    preScreenshot: '',
    exitPrice: 0,
    outcome: '',
    actualPnl: 0,
    rMultiple: 0,
    newBalance: 0,
    exitReason: '',
    postTradeNotes: '',
    postScreenshot: '',
    followedPlan: '',
    entryQuality: 0,
    exitQuality: 0,
    riskManagementOk: null,
    mistakes: '',
    lessonsLearned: '',
    nextImprovement: '',
    status: 'open',
    createdAt: '2026-06-05T09:00:00Z',
  },
];

const JOURNAL_KEY  = 'alpha_compounding_journal';
const BALANCE_KEY  = 'alpha_exness_balance';
const SETUPS = ['Order Block', 'Break & Retest', 'FVG Fill', 'HL Break', 'Trendline', 'Support/Resistance', 'Pattern', 'Other'];
const SESSIONS = ['London', 'New York', 'Asian', 'Other'] as const;
const TIMEFRAMES = ['M15', 'M30', 'H1', 'H4', 'D1'];
const CONFLUENCE_OPTIONS = ['EMA', 'S&R', 'FVG', 'Session High-Low', 'News', 'Order Block', 'VWAP', 'Liquidity'];
const EMOTIONS = ['Calm', 'Confident', 'Nervous', 'FOMO', 'Tired', 'Frustrated'];
const EXIT_REASONS = ['TP Hit', 'SL Hit', 'Manual Close', 'Trailing Stop', 'Partial Close'];

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const fmt2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = (n: number) => Math.round(n).toLocaleString('en-US');

function loadJournal(): TradeEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
}
function saveJournal(entries: TradeEntry[]) {
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries)); } catch { }
}

function calcRR(entry: number, sl: number, tp: number): number {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  return risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0;
}

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function newEntry(): TradeEntry {
  return {
    id: `j${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    session: 'London',
    direction: 'Long',
    entryPrice: 0,
    stopLoss: 0,
    takeProfit1: 0,
    takeProfit2: 0,
    lotSize: 0,
    riskPct: 1,
    riskAmount: 0,
    rrRatio: 0,
    setup: 'Order Block',
    marketStructure: 'Bullish',
    timeframe: 'H1',
    confluence: [],
    confidence: 3,
    preTradeNotes: '',
    emotionalState: 'Calm',
    preScreenshot: '',
    exitPrice: 0,
    outcome: '',
    actualPnl: 0,
    rMultiple: 0,
    newBalance: 0,
    exitReason: '',
    postTradeNotes: '',
    postScreenshot: '',
    followedPlan: '',
    entryQuality: 0,
    exitQuality: 0,
    riskManagementOk: null,
    mistakes: '',
    lessonsLearned: '',
    nextImprovement: '',
    status: 'open',
    createdAt: new Date().toISOString(),
  };
}

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function StarRating({ value, onChange, max = 5 }: { value: number; onChange?: (v: number) => void; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          className={`transition-colors ${i < value ? 'text-amber-400' : 'text-slate-200'}`}
        >
          <Star size={14} fill={i < value ? '#fbbf24' : 'none'} />
        </button>
      ))}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: TradeEntry['outcome'] }) {
  if (!outcome) return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">Open</span>;
  const map = {
    Win: 'bg-emerald-50 text-emerald-600',
    Loss: 'bg-rose-50 text-rose-600',
    Breakeven: 'bg-amber-50 text-amber-600',
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${map[outcome]}`}>{outcome}</span>;
}

function SessionBadge({ session }: { session: string }) {
  const map: Record<string, string> = {
    London: 'bg-sky-50 text-sky-600',
    'New York': 'bg-violet-50 text-violet-600',
    Asian: 'bg-amber-50 text-amber-600',
    Other: 'bg-slate-100 text-slate-500',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${map[session] ?? 'bg-slate-100 text-slate-500'}`}>{session}</span>;
}

function ImageUpload({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (b64: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          <img src={value} alt={label} className="max-h-40 w-full object-contain" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow"
          >
            <X size={12} className="text-rose-500" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 py-5 text-purple-400 transition-colors hover:border-purple-400 hover:bg-purple-50"
        >
          <Camera size={20} />
          <span className="text-[11px] font-semibold">Upload chart screenshot</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) onChange(await toBase64(f));
        }}
      />
    </div>
  );
}

/* ─── Journal Stats Bar ──────────────────────────────────────────────────────── */
function JournalStats({ entries }: { entries: TradeEntry[] }) {
  const closed = entries.filter((e) => e.status === 'closed');
  const wins = closed.filter((e) => e.outcome === 'Win');
  const losses = closed.filter((e) => e.outcome === 'Loss');
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const totalPnl = closed.reduce((s, e) => s + (e.actualPnl || 0), 0);
  const avgR = closed.length ? closed.reduce((s, e) => s + (e.rMultiple || 0), 0) / closed.length : 0;
  const setupCount: Record<string, number> = {};
  wins.forEach((e) => { setupCount[e.setup] = (setupCount[e.setup] || 0) + 1; });
  const bestSetup = Object.entries(setupCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const stats = [
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, sub: `${wins.length}W / ${losses.length}L`, icon: <Trophy size={16} />, grad: 'from-emerald-500 to-teal-500' },
    { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${fmt2(totalPnl)}`, sub: `${closed.length} closed trades`, icon: <TrendingUp size={16} />, grad: totalPnl >= 0 ? 'from-teal-500 to-emerald-400' : 'from-rose-500 to-pink-500' },
    { label: 'Avg R:R', value: `${avgR.toFixed(2)}R`, sub: 'Average per trade', icon: <Target size={16} />, grad: 'from-violet-500 to-purple-500' },
    { label: 'Best Setup', value: bestSetup, sub: `${setupCount[bestSetup] ?? 0} wins`, icon: <Zap size={16} />, grad: 'from-amber-400 to-orange-400' },
  ];

  return (
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.grad} p-4 text-white shadow-md`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold text-white/80">{s.label}</div>
              <div className="stat-num mt-1 text-[20px] font-extrabold leading-none">{s.value}</div>
              <div className="mt-1 text-[10px] font-semibold text-white/70">{s.sub}</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">{s.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Trade Detail Popup — Trading Journal style ─────────────────────────────── */
function CompareModal({ entry: initialEntry, onClose, onEdit, onUpdate }: {
  entry: TradeEntry; onClose: () => void; onEdit: () => void; onUpdate: (e: TradeEntry) => void;
}) {
  const [entry, setEntry] = useState(initialEntry);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleImg = (type: 'preScreenshot' | 'postScreenshot', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...entry, [type]: String(reader.result) };
      setEntry(updated);
      onUpdate(updated);
    };
    reader.readAsDataURL(file);
  };

  const pnlPos = entry.actualPnl >= 0;
  const dirLong = entry.direction === 'Long';

  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center p-3 pt-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[95vw] max-w-7xl rounded-3xl bg-white shadow-2xl my-2">

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-purple-100 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-md text-white bg-gradient-to-br ${dirLong ? 'from-emerald-500 to-teal-400' : 'from-rose-500 to-pink-500'}`}>
                XAU
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-gray-800">XAUUSD</h2>
                  <span className={`text-[12px] px-3 py-1 rounded-lg font-bold ${dirLong ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                    {dirLong ? '▲ Long' : '▼ Short'}
                  </span>
                  {entry.outcome && (
                    <span className={`text-[12px] px-3 py-1 rounded-lg font-bold ring-1 ${entry.outcome === 'Win' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : entry.outcome === 'Loss' ? 'bg-rose-50 text-rose-500 ring-rose-200' : 'bg-amber-50 text-amber-600 ring-amber-200'}`}>
                      {entry.outcome}
                    </span>
                  )}
                  {entry.status === 'open' && (
                    <span className="text-[12px] px-3 py-1 rounded-lg font-bold bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                      Open
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={11} />{entry.date}</span>
                  <span>·</span>
                  <SessionBadge session={entry.session} />
                  <span>·</span>
                  <span>{entry.setup}</span>
                  <span>·</span>
                  <span>{entry.timeframe}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {entry.status === 'closed' && (
                <div className="text-right">
                  <div className={`text-2xl font-extrabold ${pnlPos ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {pnlPos ? '+' : ''}${fmt2(Math.abs(entry.actualPnl))}
                  </div>
                  <div className={`text-base font-bold ${entry.rMultiple >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {entry.rMultiple >= 0 ? '+' : ''}{entry.rMultiple}R
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={onEdit}
                  className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-[11px] font-bold text-purple-600 hover:bg-purple-100 transition">
                  Edit
                </button>
                <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-gray-100 border border-gray-200 transition">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Data Grid ── */}
        <div className="px-6 pt-5 pb-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
            {[
              { label: 'Direction', value: entry.direction, icon: dirLong ? '▲' : '▼' },
              { label: 'Entry', value: `$${entry.entryPrice}`, icon: '📍' },
              { label: 'Stop Loss', value: `$${entry.stopLoss}`, icon: '🛑' },
              { label: 'TP1', value: `$${entry.takeProfit1}`, icon: '🎯' },
              { label: 'Lot Size', value: `${entry.lotSize} lots`, icon: '📦' },
              { label: 'Risk', value: `${entry.riskPct}% / $${fmt2(entry.riskAmount)}`, icon: '⚖️' },
              { label: 'R:R Ratio', value: `${entry.rrRatio}R`, icon: '📊' },
            ].map(d => (
              <div key={d.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">{d.label}</div>
                <div className="text-[12px] font-bold text-gray-800 flex items-center gap-1 truncate">
                  <span>{d.icon}</span>{d.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Market Structure</div>
              <div className="text-[12px] font-bold text-gray-800">{entry.marketStructure === 'Bullish' ? '📈' : entry.marketStructure === 'Bearish' ? '📉' : '➡️'} {entry.marketStructure}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Emotion</div>
              <div className="text-[12px] font-bold text-gray-800">{entry.emotionalState}</div>
            </div>
            {entry.status === 'closed' && (
              <>
                <div className={`rounded-xl p-3 border ${pnlPos ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">P&L</div>
                  <div className={`text-[14px] font-extrabold ${pnlPos ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {pnlPos ? '+' : ''}${fmt2(entry.actualPnl)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Exit Price</div>
                  <div className="text-[12px] font-bold text-gray-800">🏁 ${entry.exitPrice}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <div className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">New Balance</div>
                  <div className="text-[12px] font-bold text-gray-800">${fmt2(entry.newBalance)}</div>
                </div>
              </>
            )}
          </div>

          {/* Confluence + Notes */}
          {entry.confluence.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.confluence.map(c => (
                <span key={c} className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">{c}</span>
              ))}
            </div>
          )}
          {entry.preTradeNotes && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <span className="text-[10px] text-blue-600 font-semibold">Pre-trade notes: </span>
              <span className="text-[12px] text-gray-700">{entry.preTradeNotes}</span>
            </div>
          )}
          {entry.postTradeNotes && (
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <span className="text-[10px] text-purple-600 font-semibold">Post-trade notes: </span>
              <span className="text-[12px] text-gray-700">{entry.postTradeNotes}</span>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="px-6">
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-purple-100" />
            <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-50 rounded-full border border-purple-100">
              <Camera size={14} className="text-purple-600" />
              <span className="text-[11px] font-bold text-purple-700">ภาพเปรียบเทียบก่อน-หลังเทรด</span>
            </div>
            <div className="flex-1 h-px bg-purple-100" />
          </div>
        </div>

        {/* ── Before / After Screenshots ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pb-5 pt-3">
          {/* Before */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-white">Before Trade (ก่อนเทรด)</span>
              <button onClick={() => beforeRef.current?.click()}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition">
                {entry.preScreenshot ? 'เปลี่ยนรูป' : 'อัพโหลด'}
              </button>
            </div>
            {/* URL input */}
            <div className="px-4 pt-3">
              <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 focus-within:border-blue-400">
                <ImageIcon size={12} className="shrink-0 text-blue-400" />
                <input
                  type="url"
                  placeholder="หรือ Paste TradingView URL..."
                  value={entry.preScreenshot.startsWith('http') ? entry.preScreenshot : ''}
                  onChange={e => {
                    const updated = { ...entry, preScreenshot: e.target.value };
                    setEntry(updated); onUpdate(updated);
                  }}
                  className="flex-1 bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                />
                {entry.preScreenshot && (
                  <button type="button" onClick={() => { const u = { ...entry, preScreenshot: '' }; setEntry(u); onUpdate(u); }}
                    className="text-slate-400 hover:text-rose-400"><X size={11} /></button>
                )}
              </div>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center min-h-[240px]">
              {entry.preScreenshot ? (
                <img src={entry.preScreenshot} alt="Before" className="max-w-full max-h-[420px] rounded-xl border border-gray-200 shadow-lg object-contain" />
              ) : (
                <div onClick={() => beforeRef.current?.click()}
                  className="w-full min-h-[200px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition">
                  <Camera size={36} className="text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400 font-medium">คลิกเพื่ออัพโหลดรูป Before</span>
                  <span className="text-[11px] text-gray-300 mt-1">PNG, JPG — chart ก่อนเข้าเทรด</span>
                </div>
              )}
            </div>
            <input ref={beforeRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImg('preScreenshot', f); e.target.value = ''; }} />
          </div>

          {/* After */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 flex items-center justify-between">
              <span className="text-[13px] font-bold text-white">After Trade (หลังเทรด)</span>
              <button onClick={() => afterRef.current?.click()}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 transition">
                {entry.postScreenshot ? 'เปลี่ยนรูป' : 'อัพโหลด'}
              </button>
            </div>
            {/* URL input */}
            <div className="px-4 pt-3">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 focus-within:border-emerald-400">
                <ImageIcon size={12} className="shrink-0 text-emerald-400" />
                <input
                  type="url"
                  placeholder="หรือ Paste TradingView URL..."
                  value={entry.postScreenshot.startsWith('http') ? entry.postScreenshot : ''}
                  onChange={e => {
                    const updated = { ...entry, postScreenshot: e.target.value };
                    setEntry(updated); onUpdate(updated);
                  }}
                  className="flex-1 bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                />
                {entry.postScreenshot && (
                  <button type="button" onClick={() => { const u = { ...entry, postScreenshot: '' }; setEntry(u); onUpdate(u); }}
                    className="text-slate-400 hover:text-rose-400"><X size={11} /></button>
                )}
              </div>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center min-h-[240px]">
              {entry.postScreenshot ? (
                <img src={entry.postScreenshot} alt="After" className="max-w-full max-h-[420px] rounded-xl border border-gray-200 shadow-lg object-contain" />
              ) : (
                <div onClick={() => afterRef.current?.click()}
                  className="w-full min-h-[200px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition">
                  <Camera size={36} className="text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400 font-medium">คลิกเพื่ออัพโหลดรูป After</span>
                  <span className="text-[11px] text-gray-300 mt-1">PNG, JPG — chart หลังปิดเทรด</span>
                </div>
              )}
            </div>
            <input ref={afterRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImg('postScreenshot', f); e.target.value = ''; }} />
          </div>
        </div>

        {/* ── Self Review ── */}
        {entry.status === 'closed' && entry.followedPlan && (
          <div className="mx-6 mb-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-5">
            <div className="mb-3 text-[11px] font-extrabold uppercase tracking-wide text-purple-600">Self Review</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Scores</div>
                {[
                  { label: 'Followed Plan', value: <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${entry.followedPlan === 'Yes' ? 'bg-emerald-100 text-emerald-700' : entry.followedPlan === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'}`}>{entry.followedPlan}</span> },
                  { label: 'Entry Quality', value: <StarRating value={entry.entryQuality} max={5} /> },
                  { label: 'Exit Quality', value: <StarRating value={entry.exitQuality} max={5} /> },
                  { label: 'Risk Mgmt OK', value: entry.riskManagementOk ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" /> },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-gray-500">{r.label}</span>
                    {r.value}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Mistakes</div>
                <p className="text-[11px] leading-snug text-gray-600">{entry.mistakes || 'None noted'}</p>
                <div className="mt-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">Lessons Learned</div>
                <p className="text-[11px] leading-snug text-gray-600">{entry.lessonsLearned || '—'}</p>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Next Improvement</div>
                <p className="text-[11px] leading-snug text-gray-600">{entry.nextImprovement || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ESC key helper ─────────────────────────────────────────────────────────── */
function TradeModalEscHandler({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return null;
}

/* ─── Add / Edit Modal — Trading Journal AddTradeModal style ─────────────────── */
function TradeModal({
  initial, onSave, onClose, onDelete,
}: {
  initial: TradeEntry; onSave: (e: TradeEntry) => void; onClose: () => void; onDelete?: () => void;
}) {
  const [form, setForm] = useState<TradeEntry>(initial);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof TradeEntry>(k: K, v: TradeEntry[K]) =>
    setForm(f => {
      const next = { ...f, [k]: v };
      if (['entryPrice', 'stopLoss', 'takeProfit1'].includes(k as string)) {
        next.rrRatio = calcRR(
          k === 'entryPrice' ? (v as number) : next.entryPrice,
          k === 'stopLoss' ? (v as number) : next.stopLoss,
          k === 'takeProfit1' ? (v as number) : next.takeProfit1,
        );
      }
      return next;
    });

  const toggleConfluence = (c: string) =>
    set('confluence', form.confluence.includes(c) ? form.confluence.filter(x => x !== c) : [...form.confluence, c]);

  const handleImgUpload = (type: 'preScreenshot' | 'postScreenshot', file: File) => {
    const reader = new FileReader();
    reader.onload = () => set(type, String(reader.result) as TradeEntry[typeof type]);
    reader.readAsDataURL(file);
  };

  const inputCls = 'w-full mt-1 px-3 py-2 rounded-xl border border-purple-200 text-[12px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 transition';
  const labelCls = 'text-[11px] font-bold text-gray-600';
  const isEdit = !!onDelete;

  return (
    <>
    <TradeModalEscHandler onClose={onClose} />
    <div className="fixed inset-0 z-[80] flex items-start justify-center p-3 pt-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[95vw] max-w-6xl rounded-3xl bg-white shadow-2xl my-2">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center shadow-lg">
              <Plus size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">{isEdit ? 'แก้ไขการเทรด' : 'บันทึกการเทรดใหม่'}</h2>
              <p className="text-[11px] text-gray-400">XAUUSD · Exness Compounding Journal</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100 border border-gray-200">
            <X size={18} />
          </button>
        </div>

        {/* Form body — 3-column layout */}
        <div className="p-8 space-y-6">

          {/* ── Before Entry ── */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600 border-b border-purple-100 pb-2 mb-4">📋 Before Entry</div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Date *</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Session</label>
                <select value={form.session} onChange={e => set('session', e.target.value as TradeEntry['session'])} className={inputCls}>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Timeframe</label>
                <select value={form.timeframe} onChange={e => set('timeframe', e.target.value)} className={inputCls}>
                  {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Direction *</label>
                <div className="mt-1 flex gap-1.5">
                  {(['Long', 'Short'] as const).map(d => (
                    <button key={d} type="button" onClick={() => set('direction', d)}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition ${form.direction === d ? (d === 'Long' ? 'bg-emerald-500 text-white shadow' : 'bg-rose-500 text-white shadow') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {d === 'Long' ? '▲ Long' : '▼ Short'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className={labelCls}>Entry Price *</label>
                <input type="number" step="any" placeholder="e.g. 2415.50" value={form.entryPrice || ''} onChange={e => set('entryPrice', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Stop Loss *</label>
                <input type="number" step="any" placeholder="e.g. 2400.00" value={form.stopLoss || ''} onChange={e => set('stopLoss', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Take Profit 1 *</label>
                <input type="number" step="any" placeholder="e.g. 2445.00" value={form.takeProfit1 || ''} onChange={e => set('takeProfit1', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Take Profit 2</label>
                <input type="number" step="any" placeholder="Optional" value={form.takeProfit2 || ''} onChange={e => set('takeProfit2', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Lot Size</label>
                <input type="number" step="0.01" placeholder="e.g. 0.12" value={form.lotSize || ''} onChange={e => set('lotSize', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Risk %</label>
                <input type="number" step="0.1" placeholder="e.g. 1.0" value={form.riskPct || ''} onChange={e => set('riskPct', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Risk Amount ($)</label>
                <input type="number" step="any" placeholder="e.g. 187.50" value={form.riskAmount || ''} onChange={e => set('riskAmount', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>R:R Ratio (auto)</label>
                <div className="mt-1 px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-[13px] font-extrabold text-purple-700">
                  {form.rrRatio}R
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className={labelCls}>Setup</label>
                <select value={form.setup} onChange={e => set('setup', e.target.value)} className={inputCls}>
                  {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Market Structure</label>
                <div className="mt-1 flex gap-1.5">
                  {(['Bullish', 'Bearish', 'Ranging'] as const).map(m => (
                    <button key={m} type="button" onClick={() => set('marketStructure', m)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition ${form.marketStructure === m ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Emotional State</label>
                <select value={form.emotionalState} onChange={e => set('emotionalState', e.target.value)} className={inputCls}>
                  {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className={labelCls}>Confidence Level</label>
                <div className="mt-2.5"><StarRating value={form.confidence} onChange={v => set('confidence', v)} /></div>
              </div>
              <div>
                <label className={labelCls}>Confluence Factors</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {CONFLUENCE_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => toggleConfluence(c)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${form.confluence.includes(c) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className={labelCls}>Pre-Trade Notes</label>
              <textarea rows={3} value={form.preTradeNotes} onChange={e => set('preTradeNotes', e.target.value)}
                placeholder="เหตุผลที่เข้าเทรด, การวิเคราะห์, สิ่งที่สังเกตเห็น..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* ── After Exit ── */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 border-b border-emerald-100 pb-2 mb-4">🏁 After Exit</div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Exit Price</label>
                <input type="number" step="any" value={form.exitPrice || ''} onChange={e => set('exitPrice', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Outcome</label>
                <div className="mt-1 flex gap-1.5">
                  {(['Win', 'Loss', 'Breakeven'] as const).map(o => (
                    <button key={o} type="button" onClick={() => { set('outcome', o); set('status', 'closed'); }}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition ${form.outcome === o ? (o === 'Win' ? 'bg-emerald-500 text-white' : o === 'Loss' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Actual P&L ($)</label>
                <input type="number" step="any" placeholder="e.g. 356.40" value={form.actualPnl || ''} onChange={e => set('actualPnl', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>R Multiple</label>
                <input type="number" step="0.1" placeholder="e.g. 1.9" value={form.rMultiple || ''} onChange={e => set('rMultiple', parseFloat(e.target.value) || 0)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>New Balance ($) <span className="text-teal-500 font-bold">→ syncs Overview</span></label>
                <input type="number" step="any" value={form.newBalance || ''} onChange={e => set('newBalance', parseFloat(e.target.value) || 0)} className={`${inputCls} border-teal-300 focus:ring-teal-300`} />
              </div>
              <div>
                <label className={labelCls}>Exit Reason</label>
                <select value={form.exitReason} onChange={e => set('exitReason', e.target.value)} className={inputCls}>
                  <option value="">Select...</option>
                  {EXIT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Post-Trade Notes</label>
                <textarea rows={2} value={form.postTradeNotes} onChange={e => set('postTradeNotes', e.target.value)}
                  placeholder="สิ่งที่เกิดขึ้นจริง, ราคาเคลื่อนไหวอย่างไร..."
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          {/* ── Self Review ── */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-violet-600 border-b border-violet-100 pb-2 mb-4">🧠 Self Review</div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Followed Plan?</label>
                <div className="mt-1 flex gap-1.5">
                  {(['Yes', 'Partial', 'No'] as const).map(v => (
                    <button key={v} type="button" onClick={() => set('followedPlan', v)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition ${form.followedPlan === v ? (v === 'Yes' ? 'bg-emerald-500 text-white' : v === 'Partial' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Risk Management OK?</label>
                <div className="mt-1 flex gap-1.5">
                  {([true, false] as const).map(v => (
                    <button key={String(v)} type="button" onClick={() => set('riskManagementOk', v)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition ${form.riskManagementOk === v ? (v ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {v ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Entry Quality</label>
                <div className="mt-2.5"><StarRating value={form.entryQuality} onChange={v => set('entryQuality', v)} /></div>
              </div>
              <div>
                <label className={labelCls}>Exit Quality</label>
                <div className="mt-2.5"><StarRating value={form.exitQuality} onChange={v => set('exitQuality', v)} /></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {[
                { label: 'Mistakes Made', key: 'mistakes' as const, placeholder: 'Entry เร็วไป, Setup ไม่ครบ, ไม่รอ confirmation...' },
                { label: 'Lessons Learned', key: 'lessonsLearned' as const, placeholder: 'สิ่งที่ได้เรียนรู้จาก trade นี้...' },
                { label: 'Next Improvement', key: 'nextImprovement' as const, placeholder: 'สิ่งหนึ่งที่จะปรับปรุง trade ต่อไป...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <textarea rows={3} value={form[key] as string} onChange={e => set(key, e.target.value)}
                    placeholder={placeholder} className={`${inputCls} resize-none`} />
                </div>
              ))}
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600 border-b border-sky-100 pb-2 mb-4">📸 Chart Screenshots</div>
            <div className="grid grid-cols-2 gap-6">
              {/* Before screenshot */}
              <div>
                <label className={labelCls}>Before Screenshot (ก่อนเทรด)</label>
                {/* URL input — paste TradingView link */}
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/60 px-3 py-2 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-300">
                  <ImageIcon size={13} className="shrink-0 text-sky-400" />
                  <input
                    type="url"
                    placeholder="Paste TradingView image URL..."
                    value={form.preScreenshot.startsWith('http') ? form.preScreenshot : ''}
                    onChange={e => set('preScreenshot', e.target.value)}
                    className="flex-1 bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  {form.preScreenshot && (
                    <button type="button" onClick={() => set('preScreenshot', '')} className="text-slate-400 hover:text-rose-400">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-slate-400 text-center">— หรือ —</div>
                <div onClick={() => beforeRef.current?.click()}
                  className="mt-1 h-40 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition overflow-hidden">
                  {form.preScreenshot ? (
                    <img src={form.preScreenshot} alt="Before" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Camera size={24} className="mx-auto text-gray-300 mb-1.5" />
                      <span className="text-[11px] text-gray-400 font-medium">คลิกเพื่ออัพโหลดไฟล์</span>
                    </div>
                  )}
                </div>
                <input ref={beforeRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImgUpload('preScreenshot', f); e.target.value = ''; }} />
              </div>
              {/* After screenshot */}
              <div>
                <label className={labelCls}>After Screenshot (หลังปิดเทรด)</label>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-300">
                  <ImageIcon size={13} className="shrink-0 text-emerald-400" />
                  <input
                    type="url"
                    placeholder="Paste TradingView image URL..."
                    value={form.postScreenshot.startsWith('http') ? form.postScreenshot : ''}
                    onChange={e => set('postScreenshot', e.target.value)}
                    className="flex-1 bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  {form.postScreenshot && (
                    <button type="button" onClick={() => set('postScreenshot', '')} className="text-slate-400 hover:text-rose-400">
                      <X size={12} />
                    </button>
                  )}
                </div>
                <div className="mt-1 text-[10px] text-slate-400 text-center">— หรือ —</div>
                <div onClick={() => afterRef.current?.click()}
                  className="mt-1 h-40 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition overflow-hidden">
                  {form.postScreenshot ? (
                    <img src={form.postScreenshot} alt="After" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Camera size={24} className="mx-auto text-gray-300 mb-1.5" />
                      <span className="text-[11px] text-gray-400 font-medium">คลิกเพื่ออัพโหลดไฟล์</span>
                    </div>
                  )}
                </div>
                <input ref={afterRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImgUpload('postScreenshot', f); e.target.value = ''; }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-2 border-t border-purple-100 px-8 py-5 bg-gray-50/50 rounded-b-3xl">
          <div>
            {onDelete && (
              <button onClick={onDelete} className="px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition">
                Delete Trade
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition">
              Cancel
            </button>
            <button onClick={() => onSave(form)}
              className="px-8 py-2.5 text-[13px] font-extrabold text-white bg-gradient-to-r from-purple-600 to-violet-500 rounded-xl shadow-lg hover:opacity-90 transition">
              <Plus size={15} className="inline mr-1.5" /> Save Trade
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

/* ─── Main Journal Component ─────────────────────────────────────────────────── */
export default function CompoundingJournal() {
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [filterOutcome, setFilterOutcome] = useState('All');
  const [filterSession, setFilterSession] = useState('All');
  const [filterDirection, setFilterDirection] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TradeEntry | null>(null);
  const [compareEntry, setCompareEntry] = useState<TradeEntry | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  useEffect(() => { setEntries(loadJournal()); }, []);

  const save = (updated: TradeEntry[]) => { setEntries(updated); saveJournal(updated); };

  const handleSave = (e: TradeEntry) => {
    const exists = entries.find((x) => x.id === e.id);
    const updated = exists ? entries.map((x) => (x.id === e.id ? e : x)) : [e, ...entries];
    save(updated);
    // Sync Exness balance with latest closed trade's newBalance
    if (e.status === 'closed' && e.newBalance > 0) {
      try { localStorage.setItem(BALANCE_KEY, String(e.newBalance)); } catch {}
    }
    setAddOpen(false);
    setEditEntry(null);
  };

  const handleDelete = (id: string) => {
    save(entries.filter((e) => e.id !== id));
    setEditEntry(null);
    setCompareEntry(null);
  };

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterOutcome !== 'All' && e.outcome !== filterOutcome) return false;
      if (filterSession !== 'All' && e.session !== filterSession) return false;
      if (filterDirection !== 'All' && e.direction !== filterDirection) return false;
      if (filterStatus !== 'All' && e.status !== filterStatus) return false;
      if (search && !`${e.setup} ${e.date} ${e.preTradeNotes}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [entries, filterOutcome, filterSession, filterDirection, filterStatus, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <JournalStats entries={entries} />

      {/* Filter bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-purple-100 bg-white px-3 py-2 focus-within:border-purple-300">
          <Search size={13} className="text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search setup, notes..." className="w-36 bg-transparent text-[12px] text-slate-700 outline-none" />
        </div>
        {[
          { label: 'Outcome', value: filterOutcome, set: setFilterOutcome, opts: ['All', 'Win', 'Loss', 'Breakeven'] },
          { label: 'Session', value: filterSession, set: setFilterSession, opts: ['All', 'London', 'New York', 'Asian', 'Other'] },
          { label: 'Direction', value: filterDirection, set: setFilterDirection, opts: ['All', 'Long', 'Short'] },
          { label: 'Status', value: filterStatus, set: setFilterStatus, opts: ['All', 'open', 'closed'] },
        ].map(({ label, value, set, opts }) => (
          <div key={label} className="flex items-center gap-1 rounded-xl border border-purple-100 bg-white px-2 py-2">
            <Filter size={11} className="text-slate-400" />
            <select value={value} onChange={(e) => { set(e.target.value); setPage(0); }}
              className="bg-transparent text-[11px] font-semibold text-slate-600 outline-none">
              {opts.map((o) => <option key={o} value={o}>{o === 'All' ? `${label}: All` : o}</option>)}
            </select>
          </div>
        ))}
        <div className="ml-auto">
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2 text-[12px] font-bold text-white shadow-sm hover:bg-purple-600">
            <Plus size={14} /> New Trade
          </button>
        </div>
      </div>

      {/* Trade Table */}
      <div className="rounded-2xl border border-purple-100/70 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Dir.</th>
                <th className="px-4 py-3">Setup</th>
                <th className="px-4 py-3">TF</th>
                <th className="px-4 py-3">Entry</th>
                <th className="px-4 py-3">SL / TP</th>
                <th className="px-4 py-3">Lots</th>
                <th className="px-4 py-3">R:R</th>
                <th className="px-4 py-3">P&L</th>
                <th className="px-4 py-3">R</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Charts</th>
                <th className="px-4 py-3">Review</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={15} className="px-4 py-12 text-center text-[13px] font-semibold text-slate-400">
                    No trades found. Click &ldquo;New Trade&rdquo; to add your first entry.
                  </td>
                </tr>
              ) : paged.map((e) => (
                <tr key={e.id} onClick={() => setCompareEntry(e)}
                  className="cursor-pointer border-b border-slate-50 text-[12px] transition-colors hover:bg-purple-50/30">
                  <td className="px-4 py-3 font-bold text-slate-800">{e.date}</td>
                  <td className="px-4 py-3"><SessionBadge session={e.session} /></td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 font-extrabold ${e.direction === 'Long' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {e.direction === 'Long' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {e.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{e.setup}</td>
                  <td className="px-4 py-3 text-slate-500">{e.timeframe}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">${e.entryPrice}</td>
                  <td className="px-4 py-3 text-[11px]">
                    <span className="font-semibold text-rose-500">{e.stopLoss}</span>
                    <span className="text-slate-300 mx-0.5">/</span>
                    <span className="font-semibold text-emerald-600">{e.takeProfit1}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.lotSize}</td>
                  <td className="px-4 py-3 font-bold text-purple-600">{e.rrRatio}R</td>
                  <td className={`px-4 py-3 font-extrabold ${e.actualPnl > 0 ? 'text-emerald-600' : e.actualPnl < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {e.status === 'open' ? '—' : `${e.actualPnl >= 0 ? '+' : ''}$${fmt2(e.actualPnl)}`}
                  </td>
                  <td className={`px-4 py-3 font-bold ${e.rMultiple > 0 ? 'text-emerald-600' : e.rMultiple < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {e.status === 'open' ? '—' : `${e.rMultiple >= 0 ? '+' : ''}${e.rMultiple}R`}
                  </td>
                  <td className="px-4 py-3"><OutcomeBadge outcome={e.outcome} /></td>
                  {/* Chart thumbnails */}
                  <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {e.preScreenshot ? (
                        <div className="relative group">
                          <img src={e.preScreenshot} alt="Before"
                            className="h-8 w-14 rounded-lg object-cover border border-blue-200 cursor-pointer hover:opacity-80 transition"
                            onClick={() => setCompareEntry(e)}
                          />
                          <div className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-blue-400 flex items-center justify-center">
                            <span className="text-[6px] font-bold text-white">B</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-8 w-14 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                          <ImageIcon size={10} className="text-slate-300" />
                        </div>
                      )}
                      {e.postScreenshot ? (
                        <div className="relative group">
                          <img src={e.postScreenshot} alt="After"
                            className="h-8 w-14 rounded-lg object-cover border border-emerald-200 cursor-pointer hover:opacity-80 transition"
                            onClick={() => setCompareEntry(e)}
                          />
                          <div className="absolute -top-1 -left-1 h-3 w-3 rounded-full bg-emerald-400 flex items-center justify-center">
                            <span className="text-[6px] font-bold text-white">A</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-8 w-14 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                          <ImageIcon size={10} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === 'closed' && e.followedPlan ? (
                      <div className="flex items-center gap-1.5">
                        <StarRating value={Math.round((e.entryQuality + e.exitQuality) / 2)} max={5} />
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                    <button onClick={() => setEditEntry(e)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-purple-50 hover:text-purple-600">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-[11px] text-slate-400">{filtered.length} trades · Page {page + 1} of {pageCount}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] disabled:opacity-40 hover:bg-slate-50">
                <ChevronLeft size={13} />
              </button>
              <button disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] disabled:opacity-40 hover:bg-slate-50">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {addOpen && (
          <TradeModal initial={newEntry()} onSave={handleSave} onClose={() => setAddOpen(false)} />
        )}
        {editEntry && (
          <TradeModal
            initial={editEntry}
            onSave={handleSave}
            onClose={() => setEditEntry(null)}
            onDelete={() => handleDelete(editEntry.id)}
          />
        )}
        {compareEntry && !editEntry && (
          <CompareModal
            entry={compareEntry}
            onClose={() => setCompareEntry(null)}
            onEdit={() => { setEditEntry(compareEntry); setCompareEntry(null); }}
            onUpdate={(updated) => { save(entries.map(e => e.id === updated.id ? updated : e)); setCompareEntry(updated); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
