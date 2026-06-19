'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  BookCheck,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Download,
  FileText,
  Play,
  Plus,
  Shield,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  backtestEquityCurve,
  backtestSessions,
  backtestStrategyCompare,
  mfeMaeBacktest,
  timeHeatmap,
} from '@/lib/mockData';
import KpiCard from '@/components/KpiCard';
import { useEscClose } from '@/lib/useEscClose';

const kpis = [
  { title: 'Backtest Sessions', value: '128', change: '+18', positive: true, icon: <BookCheck size={20} color="#fff" />, iconBg: '#ede9ff', color: '#7c3aed' },
  { title: 'Win Rate', value: '63.24%', change: '+4.21%', positive: true, icon: <Target size={20} color="#fff" />, iconBg: '#d1fae5', color: '#10b981' },
  { title: 'Profit Factor', value: '1.87', change: '+0.28', positive: true, icon: <TrendingUp size={20} color="#fff" />, iconBg: '#dbeafe', color: '#3b82f6' },
  { title: 'Total R', value: '+342.18R', change: '+40.47R', positive: true, icon: <Award size={20} color="#fff" />, iconBg: '#d1fae5', color: '#10b981' },
  { title: 'Max Drawdown', value: '-14.32%', change: '-2.11%', positive: false, icon: <Shield size={20} color="#fff" />, iconBg: '#fee2e2', color: '#ef4444' },
  { title: 'Pass Probability', value: '78.6%', change: '+6.45%', positive: true, icon: <Cpu size={20} color="#fff" />, iconBg: '#dbeafe', color: '#2563eb' },
];

const tradeLog = [
  { id: 'T-128-01', asset: 'EUR/USD', entry: 1.08645, exit: 1.09066, result: 'Win', r: 1.34, mfe: 2.18, mae: -0.42, month: 'Jan' },
  { id: 'T-127-04', asset: 'GBP/USD', entry: 1.27981, exit: 1.2761, result: 'Win', r: 0.97, mfe: 1.55, mae: -0.38, month: 'Feb' },
  { id: 'T-126-12', asset: 'XAU/USD', entry: 2331.1, exit: 2322.4, result: 'Loss', r: -0.82, mfe: 0.21, mae: -0.82, month: 'Mar' },
  { id: 'T-125-09', asset: 'NAS100', entry: 18520.5, exit: 18642.8, result: 'Win', r: 1.72, mfe: 2.42, mae: -0.55, month: 'Apr' },
  { id: 'T-124-18', asset: 'EUR/USD', entry: 1.0942, exit: 1.0914, result: 'Loss', r: -0.63, mfe: 0.17, mae: -1.04, month: 'May' },
];

const notes = [
  'London Kill Zone ให้สัญญาณชัดกว่า Asia เมื่อรอ liquidity sweep ก่อนเข้า',
  'Breakout + Retest ต้องรอ confirmation candle ไม่รีบเข้าไม้แรก',
  'ควบคุม Risk 1% ช่วยลด drawdown และเพิ่มโอกาสผ่าน Prop Firm',
];

const equityOptions = ['Equity', 'Balance', 'Benchmark'];
const sessionOptions = ['All Sessions', 'ICT Silver Bullet', 'London Kill Zone', 'Breakout + Retest', 'Scalping M5'];
const strategyMetrics = ['Total R', 'Win Rate', 'Profit Factor'];

type BacktestSession = (typeof backtestSessions)[number];
type TradeLogRow = (typeof tradeLog)[number];
type DrawerContent = { type: 'session'; data: BacktestSession } | { type: 'trade'; data: TradeLogRow } | { type: 'notes' } | null;

function useDarkMode() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains('dark')));
    obs.observe(el, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function heatColor(value: number) {
  if (value >= 1.2) return 'linear-gradient(135deg,#10b981,#34d399)';
  if (value >= 0.6) return 'linear-gradient(135deg,#bbf7d0,#6ee7b7)';
  if (value >= 0) return 'linear-gradient(135deg,#ecfdf5,#d1fae5)';
  return 'linear-gradient(135deg,#fee2e2,#fecaca)';
}

function Card({ children, className = '', tint = false }: { children: ReactNode; className?: string; tint?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-[22px] border border-purple-100/70 dark:border-white/10 bg-white/88 dark:bg-[#181a2c] shadow-[0_14px_36px_rgba(45,35,95,0.075)] backdrop-blur ${className}`}>
      {tint && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.09),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(16,185,129,0.08),transparent_28%)]" />
          <div className="pointer-events-none absolute right-8 top-8 h-2 w-2 rotate-45 bg-white/80" />
          <div className="pointer-events-none absolute right-16 top-14 h-1.5 w-1.5 rotate-45 bg-white/70" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function Header({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 className="text-[15px] font-extrabold leading-tight text-[#111a3d] dark:text-slate-100">{title}</h3>
        {desc && <p className="mt-1 text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function SelectPill({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-xl border border-purple-100 dark:border-white/10 bg-white/90 dark:bg-[#1e2035] px-3 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/40">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}

function ActionButton({ children, onClick, soft = false }: { children: ReactNode; onClick: () => void; soft?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-[12px] font-extrabold transition hover:-translate-y-0.5 ${soft ? 'border border-purple-100 dark:border-purple-800/40 bg-white dark:bg-white/5 text-purple-700 dark:text-purple-300 shadow-sm hover:bg-purple-50 dark:hover:bg-purple-900/30' : 'bg-gradient-to-r from-purple-600 to-violet-500 text-white shadow-lg shadow-purple-200/40'}`}>
      {children}
    </button>
  );
}

function Toast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="fixed right-5 top-5 z-50 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 bg-white dark:bg-[#181a2c] px-4 py-3 text-[12px] font-bold text-emerald-700 dark:text-emerald-400 shadow-[0_18px_44px_rgba(45,35,95,0.16)]">
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Drawer({ content, onClose }: { content: DrawerContent; onClose: () => void }) {
  useEscClose(onClose, !!content);
  return (
    <AnimatePresence>
      {content && (
        <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close drawer" className="absolute inset-0 bg-slate-950/20" onClick={onClose} />
          <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} transition={{ duration: 0.22 }} className="absolute right-0 top-0 h-full w-full max-w-[420px] overflow-y-auto border-l border-purple-100 dark:border-white/10 bg-white dark:bg-[#181a2c] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#111a3d] dark:text-slate-100">{content.type === 'session' ? 'Session Detail' : content.type === 'trade' ? 'Trade Detail' : 'Backtest Notes'}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">ข้อมูลจำลองสำหรับตรวจสอบรายละเอียด</p>
              </div>
              <button onClick={onClose} className="rounded-full border border-slate-200 dark:border-white/10 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"><X size={16} /></button>
            </div>
            {content.type === 'session' && <SessionDetail session={content.data} />}
            {content.type === 'trade' && <TradeDetail trade={content.data} />}
            {content.type === 'notes' && <NotesDetail />}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-white/8 bg-slate-50 dark:bg-white/5 px-4 py-3"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span><span className="text-sm font-extrabold text-[#111a3d] dark:text-slate-100">{value}</span></div>;
}

function SessionDetail({ session }: { session: BacktestSession }) {
  return <div className="space-y-3"><Row label="Session ID" value={session.id} /><Row label="Strategy" value={session.strategy} /><Row label="Asset" value={`${session.asset} / ${session.tf}`} /><Row label="Date" value={session.date} /><Row label="Result" value={`${session.result} ${session.r > 0 ? '+' : ''}${session.r}R`} /><div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">บทเรียนหลัก: รอให้ราคา retest โซนก่อนเข้า ช่วยลด MAE และทำให้ R-multiple ดีขึ้น</div></div>;
}

function TradeDetail({ trade }: { trade: TradeLogRow }) {
  return <div className="space-y-3"><Row label="Trade ID" value={trade.id} /><Row label="Asset" value={trade.asset} /><Row label="Month" value={`${trade.month} 2026`} /><Row label="Result" value={`${trade.result} ${trade.r > 0 ? '+' : ''}${trade.r}R`} /><Row label="MFE / MAE" value={`+${trade.mfe}R / ${trade.mae}R`} /><div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">จุดที่ควรดู: เทียบ MFE กับจุดออกจริง เพื่อดูว่าปล่อยกำไรเร็วเกินไปหรือไม่</div></div>;
}

function NotesDetail() {
  return <div className="space-y-3">{notes.map((note, index) => <div key={note} className="rounded-2xl border border-purple-100 dark:border-purple-800/40 bg-purple-50/70 dark:bg-purple-900/20 p-4"><div className="mb-1 text-[11px] font-extrabold text-purple-600 dark:text-purple-400">Note {index + 1}</div><p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{note}</p></div>)}</div>;
}

function CreateSessionModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: () => void }) {
  useEscClose(onClose, open);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close modal" className="absolute inset-0 bg-slate-950/25" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className="relative w-full max-w-[560px] rounded-[28px] border border-purple-100 dark:border-white/10 bg-white dark:bg-[#181a2c] p-6 shadow-[0_24px_70px_rgba(45,35,95,0.20)]">
            <div className="mb-5 flex items-start justify-between"><div><h2 className="text-2xl font-extrabold text-[#111a3d] dark:text-slate-100">Create Backtest Session</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ตั้งค่า session ใหม่สำหรับทดสอบกลยุทธ์ Jan-May 2026</p></div><button onClick={onClose} className="rounded-full border border-slate-200 dark:border-white/10 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"><X size={16} /></button></div>
            <div className="grid gap-3 sm:grid-cols-2">{['Strategy', 'Asset', 'Timeframe', 'Session'].map((label) => <label key={label} className="space-y-1 text-[12px] font-bold text-slate-600 dark:text-slate-400">{label}<input className="h-11 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/40 placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder={`Enter ${label.toLowerCase()}`} /></label>)}</div>
            <label className="mt-3 block space-y-1 text-[12px] font-bold text-slate-600 dark:text-slate-400">Test Plan<textarea className="min-h-[96px] w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/40 placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="จดเป้าหมาย กฎเข้าออก และ risk rule ของ session นี้" /></label>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"><button onClick={onClose} className="h-11 rounded-2xl border border-slate-200 dark:border-white/10 px-5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">Cancel</button><button onClick={onCreate} className="h-11 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 px-5 text-sm font-bold text-white shadow-lg shadow-purple-200/40">Create Session</button></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const scatterDot = (props: { cx?: number; cy?: number; fill?: string }) => <circle cx={props.cx} cy={props.cy} r={2.35} fill={props.fill} fillOpacity={0.78} />;

export default function BacktestTab() {
  const [equityMetric, setEquityMetric] = useState('Equity');
  const [sessionFilter, setSessionFilter] = useState('All Sessions');
  const [strategyMetric, setStrategyMetric] = useState('Total R');
  const [drawer, setDrawer] = useState<DrawerContent>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filteredSessions = useMemo(() => sessionFilter === 'All Sessions' ? backtestSessions : backtestSessions.filter((session) => session.strategy === sessionFilter), [sessionFilter]);
  const strategyRows = useMemo(() => backtestStrategyCompare.map((strategy, index) => {
    if (strategyMetric === 'Win Rate') return { ...strategy, displayValue: 52 + index * 5, suffix: '%' };
    if (strategyMetric === 'Profit Factor') return { ...strategy, displayValue: Math.max(0.7, 2.4 - index * 0.26), suffix: 'PF' };
    return { ...strategy, displayValue: strategy.r, suffix: 'R' };
  }), [strategyMetric]);

  const dark = useDarkMode();
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2200); };
  const onSelect = (label: string, setter: (value: string) => void) => (value: string) => { setter(value); showToast(`${label}: ${value}`); };
  const createSession = () => { localStorage.setItem('alpha-trader-draft-session', JSON.stringify({ createdAt: new Date().toISOString(), range: 'Jan-May 2026' })); setModalOpen(false); showToast('New backtest session created'); };
  const exportBacktest = () => {
    const blob = new Blob([JSON.stringify({ range: 'Jan-May 2026', equityMetric, sessionFilter, strategyMetric, sessions: filteredSessions, trades: tradeLog }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'alpha-trader-backtest-jan-may-2026.json'; link.click(); URL.revokeObjectURL(url); showToast('Exported backtest JSON');
  };

  return (
    <div className="space-y-5">
      <Toast message={toast} /><Drawer content={drawer} onClose={() => setDrawer(null)} /><CreateSessionModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={createSession} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold text-slate-500 dark:text-slate-400"><span className="rounded-full bg-purple-50 dark:bg-purple-900/30 px-3 py-1 text-purple-700 dark:text-purple-300">FX Replay Style</span><span>Jan-May 2026</span><span className="text-slate-300 dark:text-slate-600">/</span><span>Prop Firm Simulation</span></div>
        <div className="flex flex-wrap gap-2"><ActionButton soft onClick={exportBacktest}><Download size={14} /> Export Backtest Result</ActionButton><ActionButton onClick={() => setModalOpen(true)}><Plus size={14} /> New Session</ActionButton></div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{kpis.map((item) => <KpiCard key={item.title} {...item} />)}</div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="p-4 xl:col-span-7" tint>
          <Header title="FX Replay Equity Curve" desc="เปรียบเทียบ equity, balance และ benchmark ตั้งแต่ Jan-May 2026" action={<div className="flex flex-wrap gap-2"><SelectPill value={equityMetric} options={equityOptions} onChange={onSelect('Equity filter', setEquityMetric)} /><SelectPill value={sessionFilter} options={sessionOptions} onChange={onSelect('Session filter', setSessionFilter)} /></div>} />
          <div className="mb-2 flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1"><span className="h-1 w-4 rounded-full bg-purple-500" />Equity</span><span className="flex items-center gap-1"><span className="h-1 w-4 rounded-full bg-blue-400" />Balance</span><span className="flex items-center gap-1"><span className="h-px w-4 border-t border-dashed border-slate-400" />Benchmark</span></div>
          <div className="h-[250px] sm:h-[300px] xl:h-[318px]">
            <ResponsiveContainer width="100%" height="100%"><ComposedChart data={backtestEquityCurve} margin={{ top: 10, right: 16, left: 2, bottom: 0 }}><defs><linearGradient id="backtestEquityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} /><stop offset="95%" stopColor="#7c3aed" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} /><XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={16} tick={{ fill: dark ? '#64748b' : '#94a3b8', fontSize: 11 }} /><YAxis tickLine={false} axisLine={false} width={42} tickFormatter={(value) => `${Number(value) / 1000}K`} tick={{ fill: dark ? '#64748b' : '#94a3b8', fontSize: 11 }} /><Tooltip formatter={(value: number) => value.toLocaleString()} contentStyle={{ background: dark ? '#1e2035' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 12, color: dark ? '#e2e8f0' : '#111a3d' }} /><Bar dataKey="balance" barSize={5} radius={[999, 999, 0, 0]} fill="#34d399" fillOpacity={0.34} /><Area type="monotone" dataKey="equity" stroke="#7c3aed" strokeWidth={1.9} fill="url(#backtestEquityFill)" dot={false} activeDot={{ r: 4 }} /><Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={1.5} dot={false} /><Line type="monotone" dataKey="buyhold" stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="5 4" dot={false} /></ComposedChart></ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 xl:col-span-3" tint>
          <Header title="Strategy Comparison" desc="ดูผลลัพธ์ตาม metric ที่เลือก" action={<SelectPill value={strategyMetric} options={strategyMetrics} onChange={onSelect('Strategy metric', setStrategyMetric)} />} />
          <div className="space-y-3">{strategyRows.map((strategy) => { const value = Number(strategy.displayValue); const positive = value >= 0; const width = strategyMetric === 'Total R' ? Math.min(Math.abs(value) / 30 * 100, 100) : Math.min(Math.abs(value), 100); return <button key={strategy.name} onClick={() => showToast(`Filtered by ${strategy.name}`)} className="w-full rounded-2xl p-2 text-left transition hover:bg-white/70 dark:hover:bg-white/5"><div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-bold"><span className="truncate text-slate-600 dark:text-slate-300">{strategy.name}</span><span className={positive ? 'text-emerald-600' : 'text-rose-500'}>{positive && strategyMetric !== 'Profit Factor' ? '+' : ''}{value.toFixed(strategyMetric === 'Profit Factor' ? 2 : 2)}{strategy.suffix}</span></div><div className="h-2 rounded-full bg-slate-100 dark:bg-white/10"><div className={`h-2 rounded-full ${positive ? 'bg-gradient-to-r from-emerald-500 to-teal-300' : 'bg-gradient-to-r from-rose-500 to-red-300'}`} style={{ width: `${width}%` }} /></div></button>; })}</div>
        </Card>

        <Card className="p-4 xl:col-span-2" tint>
          <Header title="Prop Simulation" desc="จำลองกฎบัญชีทุนสอบ" />
          <div className="rounded-2xl border border-purple-100 dark:border-white/10 bg-white/75 dark:bg-white/5 p-3">
            <div className="mb-3 flex items-center justify-between"><div className="text-[12px] font-extrabold text-[#111a3d] dark:text-slate-100">FTMO Challenge</div><span className="rounded-full bg-purple-50 dark:bg-purple-900/30 px-2 py-1 text-[10px] font-bold text-purple-700 dark:text-purple-300">#123556</span></div>
            {[['Progress', '71%', 71, '#7c3aed'], ['Profit Target', '$7,120 / $10,000', 71, '#10b981'], ['Daily Loss Buffer', '$1,250 / $1,500', 83, '#3b82f6'], ['Max DD Buffer', '$3,200 / $10,000', 32, '#f59e0b']].map(([label, value, pct, color]) => <div key={label as string} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400"><span>{label}</span><span className="text-slate-700 dark:text-slate-200">{value}</span></div><div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color as string }} /></div></div>)}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/20 p-3 text-center"><div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Daily Violation</div><div className="mt-1 text-lg font-extrabold text-rose-500">2</div></div><div className="rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/20 p-3 text-center"><div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Rule Violation</div><div className="mt-1 text-lg font-extrabold text-orange-500">1</div></div></div>
          <div className="mt-3 rounded-2xl bg-orange-50 dark:bg-orange-900/20 p-3"><div className="mb-2 flex justify-between text-[11px] font-extrabold text-orange-600 dark:text-orange-400"><span>Consistency Risk</span><span>45%</span></div><div className="h-2 rounded-full bg-orange-100 dark:bg-orange-900/30"><div className="h-2 rounded-full bg-orange-400" style={{ width: '45%' }} /></div><p className="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">ระดับ Medium ยังควบคุมได้</p></div>
        </Card>
      </div>

      <Card className="p-4" tint>
        <Header title="Recent Sessions" desc="คลิก card เพื่อดูรายละเอียด session" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{filteredSessions.map((session) => <button key={session.id} onClick={() => setDrawer({ type: 'session', data: session })} className={`rounded-[20px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(45,35,95,0.10)] ${session.result === 'Win' ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/75 dark:bg-emerald-900/20' : 'border-rose-200 dark:border-rose-800/40 bg-rose-50/75 dark:bg-rose-900/20'}`}><div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-extrabold text-[#111a3d] dark:text-slate-100">{session.id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${session.result === 'Win' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>{session.result}</span></div><div className="text-[12px] font-extrabold text-slate-800 dark:text-slate-200">{session.strategy}</div><div className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{session.asset} / {session.tf}</div><div className="mt-3 flex items-end justify-between"><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{session.date}</span><span className={`text-lg font-extrabold ${session.r > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{session.r > 0 ? '+' : ''}{session.r}R</span></div></button>)}<button onClick={() => setModalOpen(true)} className="grid min-h-[134px] place-items-center rounded-[20px] border border-dashed border-purple-200 dark:border-purple-800/40 bg-purple-50/50 dark:bg-purple-900/20 text-center text-purple-700 dark:text-purple-300 transition hover:bg-purple-50 dark:hover:bg-purple-900/30"><div><Plus className="mx-auto mb-2" size={22} /><div className="text-[12px] font-extrabold">New Session</div></div></button></div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="p-4 xl:col-span-4" tint><Header title="MFE / MAE Scatter" desc="จุดเล็กลงเพื่ออ่าน pattern ได้พรีเมียมขึ้น" /><div className="h-[235px]"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} /><XAxis dataKey="trialNum" name="Trial" tickLine={false} axisLine={false} tick={{ fill: dark ? '#64748b' : '#94a3b8', fontSize: 11 }} /><YAxis dataKey="r" name="R" tickLine={false} axisLine={false} width={32} tick={{ fill: dark ? '#64748b' : '#94a3b8', fontSize: 11 }} /><Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: dark ? '#1e2035' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', borderRadius: 12, color: dark ? '#e2e8f0' : '#111a3d' }} /><ReferenceLine y={0} stroke={dark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'} strokeWidth={1} /><ReferenceLine x={0} stroke={dark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'} strokeWidth={1} /><Scatter data={mfeMaeBacktest} shape={scatterDot}>{mfeMaeBacktest.map((point, index) => <Cell key={index} fill={point.win ? '#10b981' : '#ef4444'} />)}</Scatter></ScatterChart></ResponsiveContainer></div><div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold"><div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-2 text-emerald-700 dark:text-emerald-400">Avg MFE +1.24R</div><div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 p-2 text-rose-600 dark:text-rose-400">Avg MAE -0.78R</div><div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-2 text-blue-700 dark:text-blue-400">Expectancy +0.67R</div></div></Card>

        <Card className="p-4 xl:col-span-4" tint><Header title="Day / Time Heatmap" desc="ดูช่วงเวลาที่ให้ R-multiple ดีที่สุด" /><div className="overflow-x-auto trading-scrollbar"><table className="w-full min-w-[420px] text-[11px]"><thead><tr><th className="pb-2 text-left font-extrabold text-slate-500 dark:text-slate-400">Session</th>{['Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <th key={day} className="pb-2 text-center font-extrabold text-slate-500 dark:text-slate-400">{day}</th>)}</tr></thead><tbody>{timeHeatmap.map((row) => <tr key={row.session}><td className="pr-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">{row.session}</td>{[row.tue, row.wed, row.thu, row.fri, row.sat].map((value, index) => <td key={index} className="p-1"><button onClick={() => showToast(`${row.session}: ${value.toFixed(2)}R`)} className="h-10 w-full rounded-xl text-[11px] font-extrabold text-[#111a3d] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:scale-[1.03]" style={{ background: heatColor(value) }}>{value.toFixed(2)}R</button></td>)}</tr>)}</tbody></table></div></Card>

        <Card className="p-4 xl:col-span-4" tint><Header title="Notes / Lessons" desc="บทเรียนสำคัญจาก session ที่ทดสอบ" action={<ActionButton soft onClick={() => setDrawer({ type: 'notes' })}><FileText size={14} /> View all notes</ActionButton>} /><div className="mb-3 flex flex-wrap gap-2">{['ICT Concepts', 'Kill Zone', 'Liquidity', 'Breakout', 'Risk Mgmt', 'Discipline', 'Journaling'].map((tag) => <span key={tag} className="rounded-full bg-purple-50 dark:bg-purple-900/30 px-3 py-1 text-[10px] font-extrabold text-purple-700 dark:text-purple-300">{tag}</span>)}</div><div className="space-y-3">{notes.map((note) => <div key={note} className="flex gap-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 bg-white/80 dark:bg-white/5 p-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={16} /><p className="text-[12px] font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{note}</p></div>)}</div></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="p-4 xl:col-span-5" tint><Header title="Backtest Trade Log" desc="ตัวอย่างดีลที่สัมพันธ์กับข้อมูล Jan-May 2026" /><div className="overflow-x-auto trading-scrollbar"><table className="w-full min-w-[620px] text-[11px]"><thead><tr className="border-b border-slate-100 dark:border-white/8 text-left text-[10px] font-extrabold uppercase tracking-[0.02em] text-slate-400 dark:text-slate-500">{['Asset', 'Entry', 'Exit', 'Result', 'R', 'MFE', 'MAE', 'Month'].map((header) => <th key={header} className="pb-2">{header}</th>)}</tr></thead><tbody>{tradeLog.map((trade) => <tr key={trade.id} onClick={() => setDrawer({ type: 'trade', data: trade })} className="cursor-pointer border-b border-slate-50 dark:border-white/5 transition hover:bg-purple-50/60 dark:hover:bg-purple-900/20"><td className="py-3 font-extrabold text-slate-700 dark:text-slate-300">{trade.asset}</td><td className="py-3 text-slate-500 dark:text-slate-400">{trade.entry}</td><td className="py-3 text-slate-500 dark:text-slate-400">{trade.exit}</td><td className="py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${trade.result === 'Win' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>{trade.result}</span></td><td className={`py-3 font-extrabold ${trade.r > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{trade.r > 0 ? '+' : ''}{trade.r}R</td><td className="py-3 font-bold text-emerald-600">+{trade.mfe}R</td><td className="py-3 font-bold text-rose-500">{trade.mae}R</td><td className="py-3 text-slate-500 dark:text-slate-400">{trade.month}</td></tr>)}</tbody></table></div></Card>

        <Card className="p-4 xl:col-span-7" tint><Header title="Next Test Recommendation" desc="คำแนะนำรอบถัดไปจากข้อมูล backtest และ prop simulation" /><div className="grid gap-3 lg:grid-cols-4">{[{ icon: <Target size={20} />, title: 'Strategy', value: 'London Kill Zone', desc: 'ให้สัญญาณชัดในช่วง London' }, { icon: <ClipboardList size={20} />, title: 'Pair', value: 'GBP/USD', desc: 'โอกาสสูงและ MAE ต่ำ' }, { icon: <Cpu size={20} />, title: 'Session', value: 'London 08:00-16:00', desc: 'Overlap 13:00-16:00' }, { icon: <Shield size={20} />, title: 'Reason', value: 'Pass Ready', desc: 'Win rate และ DD อยู่ในเกณฑ์' }].map((item) => <div key={item.title} className="rounded-2xl border border-purple-100 dark:border-white/10 bg-white/78 dark:bg-white/5 p-4"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{item.icon}</div><div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">{item.title}</div><div className="mt-1 text-[14px] font-extrabold text-[#111a3d] dark:text-slate-100">{item.value}</div><p className="mt-1 text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400">{item.desc}</p></div>)}</div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><ActionButton onClick={() => setModalOpen(true)}><Play size={14} /> Start New Session</ActionButton><ActionButton soft onClick={() => { localStorage.setItem('alpha-trader-next-test-plan', 'London Kill Zone / GBPUSD / May 2026'); showToast('Saved next test plan'); }}>Save Test Plan</ActionButton></div></Card>
      </div>
    </div>
  );
}
