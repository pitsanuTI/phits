'use client';

import { useMemo, useRef, useState } from 'react';
import { useThemeColors } from '@/lib/useThemeColors';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  Database, Plus, Download, Upload, RotateCcw, Pencil, Trash2, X, Search, Maximize2, ArrowRight, Camera,
  DollarSign, Target, Award, Scale, Shield, Save, Filter, Coins, Clock, Layers, Brain, LogIn, LogOut, MessageSquare, Wallet,
} from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import IconGlyph from '@/components/IconGlyph';
import {
  type Trade, type TradeResult, type GroupRow,
  ASSETS, ACCOUNTS, SESSIONS, SETUPS, SIDES, RESULTS, EMOTIONS, EXIT_REASONS, MONTHS, RISK_PER_TRADE,
  sortByDate, deriveKpis, deriveMonthly, deriveEquity, groupBy, tradesToCsv,
  assetInfo, computeExit, fmtPrice, mulberry32, normalizeTrade,
} from '@/data/trading-data-mock';
import { useTradingData } from '@/lib/trading/store';
import { useEscClose } from '@/lib/useEscClose';

// ── format helpers ────────────────────────────────────────────────────────────
const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const rStr = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}R`;
const dateLabel = (iso: string) => {
  const m = MONTHS.find((mo) => iso.startsWith(mo.key));
  const day = iso.slice(8);
  return m ? `${day} ${m.th}` : iso;
};

const assetMeta = Object.fromEntries(ASSETS.map((a) => [a.name, a]));
const emotionMeta = Object.fromEntries(EMOTIONS.map((e) => [e.name, e]));
const accountMeta = Object.fromEntries(ACCOUNTS.map((a) => [a.name, a]));

type FormState = Omit<Trade, 'pnl'> & { pnl: number };

const blankTrade = (): FormState => {
  const entry = assetInfo('XAUUSD').price;
  return {
    id: '', date: '2026-05-15', account: ACCOUNTS[0].name, asset: 'XAUUSD', side: 'Long', session: 'London', setup: 'Breakout', emotion: 'Confident',
    result: 'Win', entry, exit: computeExit(entry, 1.5, 'Long', 'XAUUSD'), exitReason: 'Take Profit',
    r: 1.5, pnl: Math.round(1.5 * RISK_PER_TRADE), mfe: 1.9, mae: -0.6, notes: '',
  };
};

// deterministic price path for the before/after comparison charts
function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function buildPath(t: Trade) {
  const a = assetInfo(t.asset);
  const rand = mulberry32(hashStr(t.id));
  const dir = t.side === 'Long' ? 1 : -1;
  const E = t.entry, X = t.exit;
  const mfeP = +(E + dir * t.mfe * a.move).toFixed(a.digits);
  const maeP = +(E + dir * t.mae * a.move).toFixed(a.digits);

  const before: { i: number; price: number }[] = [];
  let p = E - dir * a.move * (1.2 + rand());
  for (let i = 0; i < 15; i++) { p += (E - p) * 0.16 + (rand() - 0.5) * a.move * 0.3; before.push({ i, price: +p.toFixed(a.digits) }); }
  before.push({ i: 15, price: E });

  const keys = [E, maeP, mfeP, X];
  const after: { i: number; price: number }[] = [];
  let idx = 0;
  for (let s = 0; s < keys.length - 1; s++) {
    const from = keys[s], to = keys[s + 1], n = 6;
    for (let j = 0; j < n; j++) { const tt = j / n; after.push({ i: idx++, price: +(from + (to - from) * tt + (rand() - 0.5) * a.move * 0.22).toFixed(a.digits) }); }
  }
  after.push({ i: idx, price: X });
  return { before, after, E, X, mfeP, maeP };
}

export default function DataTab() {
  const tc = useThemeColors();
  // Shared source of truth — the same trades the Calendar & Analytics tabs read.
  const { trades, setTrades, resetTrades } = useTradingData();

  // filters
  const [fMonth, setFMonth] = useState<string>('all');
  const [fAccount, setFAccount] = useState<string>('all');
  const [fAsset, setFAsset] = useState<string>('all');
  const [fResult, setFResult] = useState<string>('all');
  const [search, setSearch] = useState('');

  // modals / toast
  const [editing, setEditing] = useState<FormState | null>(null);
  const [viewing, setViewing] = useState<Trade | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'delete'; id: string } | { kind: 'reset' } | null>(null);
  const [toast, setToast] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const fileRef = useRef<HTMLInputElement>(null);

  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2200); };

  // ── filtered view ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortByDate(
      trades.filter((t) => {
        if (fMonth !== 'all' && !t.date.startsWith(fMonth)) return false;
        if (fAccount !== 'all' && t.account !== fAccount) return false;
        if (fAsset !== 'all' && t.asset !== fAsset) return false;
        if (fResult !== 'all' && t.result !== fResult) return false;
        if (q) {
          const hay = `${t.id} ${t.account} ${t.asset} ${t.setup} ${t.session} ${t.emotion} ${t.exitReason} ${t.notes ?? ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    ).reverse(); // newest first in the table
  }, [trades, fMonth, fAccount, fAsset, fResult, search]);

  const kpis = useMemo(() => deriveKpis(filtered), [filtered]);
  const monthly = useMemo(() => deriveMonthly(trades), [trades]);
  const equity = useMemo(() => deriveEquity(filtered).map((p, i) => ({ i, equity: p.equity })), [filtered]);
  const byAccount = useMemo(() => groupBy(filtered, 'account'), [filtered]);
  const byAsset = useMemo(() => groupBy(filtered, 'asset'), [filtered]);
  const bySession = useMemo(() => groupBy(filtered, 'session'), [filtered]);
  const bySetup = useMemo(() => groupBy(filtered, 'setup'), [filtered]);
  const byEmotion = useMemo(() => groupBy(filtered, 'emotion'), [filtered]);

  const netSpark = useMemo(() => {
    let acc = 0;
    return monthly.map((m) => ({ v: (acc += m.pnl) }));
  }, [monthly]);

  // live snapshot for the detail modal (reflects uploads instantly)
  const detail = viewing ? trades.find((t) => t.id === viewing.id) ?? viewing : null;

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + rowsPerPage);

  const kpiCards = [
    { title: 'Total Trades', value: String(kpis.total), change: `${kpis.wins}W / ${kpis.losses}L`, positive: true, icon: <Database size={20} color="#fff" />, color: '#7c5cbf' },
    { title: 'Net P&L', value: usd(kpis.netPnl), change: `${usd(kpis.expectancy)} / trade`, positive: kpis.netPnl >= 0, icon: <DollarSign size={20} color="#fff" />, color: '#10b981', sparkData: netSpark },
    { title: 'Win Rate', value: pct(kpis.winRate), change: `${kpis.breakeven} BE`, positive: kpis.winRate >= 50, icon: <Target size={20} color="#fff" />, color: '#f59e0b' },
    { title: 'Profit Factor', value: kpis.profitFactor.toFixed(2), change: `PF ${kpis.profitFactor >= 1 ? 'edge' : 'risk'}`, positive: kpis.profitFactor >= 1, icon: <Scale size={20} color="#fff" />, color: '#38bdf8' },
    { title: 'Average R', value: rStr(kpis.avgR), change: `win ${rStr(kpis.avgWin)}`, positive: kpis.avgR >= 0, icon: <Award size={20} color="#fff" />, color: '#a78bfa' },
    { title: 'Max Drawdown', value: pct(kpis.maxDdPct), change: `loss ${rStr(kpis.avgLoss)}`, positive: false, icon: <Shield size={20} color="#fff" />, color: '#f43f5e' },
  ];

  // ── CRUD ──
  function saveTrade(form: FormState) {
    if (!form.asset) return notify('กรุณาเลือก Asset');
    if (!form.date) return notify('กรุณาเลือกวันที่');
    if (Number.isNaN(Number(form.r))) return notify('R ต้องเป็นตัวเลข');

    const clean: Trade = {
      ...form,
      entry: Number(form.entry),
      exit: Number(form.exit),
      r: Number(form.r),
      pnl: Math.round(Number(form.pnl)),
      mfe: Number(form.mfe),
      mae: Number(form.mae),
      notes: form.notes?.trim() || undefined,
    };

    if (form.id) {
      setTrades((prev) => prev.map((t) => (t.id === form.id ? clean : t)));
      notify('อัปเดตเทรดแล้ว');
    } else {
      clean.id = `T-${Date.now().toString(36)}`;
      setTrades((prev) => [...prev, clean]);
      notify('เพิ่มเทรดใหม่แล้ว');
    }
    setEditing(null);
  }

  function deleteTrade(id: string) {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    setConfirm(null);
    if (viewing?.id === id) setViewing(null);
    notify('ลบเทรดแล้ว');
  }

  function resetData() {
    resetTrades();
    setConfirm(null);
    notify('↺ คืนค่าข้อมูล seed (ม.ค.–พ.ค. 2026)');
  }

  // before/after screenshot upload (stored as data URL in the trade)
  function uploadImg(id: string, which: 'beforeImg' | 'afterImg', file: File) {
    const reader = new FileReader();
    reader.onload = () => setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, [which]: String(reader.result) } : t)));
    reader.readAsDataURL(file);
    notify('แนบภาพแล้ว');
  }
  function clearImg(id: string, which: 'beforeImg' | 'afterImg') {
    setTrades((prev) => prev.map((t) => (t.id === id ? { ...t, [which]: undefined } : t)));
  }

  // ── export / import ──
  function download(filename: string, text: string, type: string) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  const exportJson = () => { download(`trading-data-${Date.now()}.json`, JSON.stringify(sortByDate(trades), null, 2), 'application/json'); notify('⬇ Export JSON แล้ว'); };
  const exportCsv = () => { download(`trading-data-${Date.now()}.csv`, tradesToCsv(trades), 'text/csv'); notify('⬇ Export CSV แล้ว'); };

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error('not array');
        const cleaned: Trade[] = parsed.map((t: Record<string, unknown>, i: number) => normalizeTrade(t, i));
        if (!cleaned.length) throw new Error('empty');
        setTrades(cleaned);
        notify(`⬆ Import สำเร็จ ${cleaned.length} เทรด`);
      } catch {
        notify('ไฟล์ไม่ถูกต้อง (ต้องเป็น JSON array)');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-4">
      {/* ── Header + actions ── */}
      <div className="rounded-2xl border border-purple-50 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 shadow-md">
              <Database size={20} color="#fff" />
            </span>
            <div>
              <h2 className="text-[16px] font-extrabold leading-tight text-slate-800 dark:text-slate-100">Trading Data Center</h2>
              <p className="text-[11px] font-medium text-slate-400">คลิกที่แถวเพื่อดูรายละเอียด · ทุก KPI คำนวณสด · seed ม.ค.–พ.ค. 2026</p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
            <ActionBtn onClick={() => fileRef.current?.click()} icon={<Upload size={13} />}>Import</ActionBtn>
            <ActionBtn onClick={exportCsv} icon={<Download size={13} />}>CSV</ActionBtn>
            <ActionBtn onClick={exportJson} icon={<Download size={13} />}>JSON</ActionBtn>
            <ActionBtn onClick={() => setConfirm({ kind: 'reset' })} icon={<RotateCcw size={13} />} danger>Reset</ActionBtn>
            <button
              onClick={() => setEditing(blankTrade())}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5"
            >
              <Plus size={15} /> Add Trade
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI strip (live-derived) ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      {/* ── Monthly P&L + Equity curve ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-purple-50 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Monthly Net P&L</div>
            <span className="text-[11px] font-bold text-slate-400">Jan – May 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthly} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.10)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [usd(v), 'Net P&L']} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
              <Bar dataKey="pnl" radius={[5, 5, 0, 0]} maxBarSize={48}>
                {monthly.map((m, i) => <Cell key={i} fill={m.pnl >= 0 ? '#10b981' : '#f43f5e'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {monthly.map((m) => (
              <div key={m.key} className="rounded-xl border border-slate-100 bg-slate-50/60 px-2 py-1.5 text-center dark:border-white/10 dark:bg-white/5">
                <div className="text-[10px] font-bold text-slate-400">{m.label}</div>
                <div className={`text-[11px] font-extrabold ${m.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{usd(m.pnl)}</div>
                <div className="text-[9px] font-semibold text-slate-400">{m.trades} · {pct(m.winRate)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-purple-50 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Equity Curve</div>
            <span className="text-[11px] font-bold text-emerald-600">{usd(deriveEquity(filtered).at(-1)?.equity ?? 0)}</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={equity} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="dataEq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tc.primary} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={tc.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.10)" vertical={false} />
              <XAxis dataKey="i" hide />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [usd(v), 'Equity']} labelFormatter={() => ''} />
              <Area type="monotone" dataKey="equity" stroke={tc.primary} strokeWidth={2} fill="url(#dataEq)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-purple-50 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
        <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 dark:text-slate-300"><Filter size={14} /> Filters</span>
        <Select value={fMonth} onChange={setFMonth} options={[['all', 'ทุกเดือน'], ...MONTHS.map((m) => [m.key, `${m.label} 2026`] as [string, string])]} />
        <Select value={fAccount} onChange={setFAccount} options={[['all', 'ทุกบัญชี'], ...ACCOUNTS.map((a) => [a.name, a.name] as [string, string])]} />
        <Select value={fAsset} onChange={setFAsset} options={[['all', 'ทุก Asset'], ...ASSETS.map((a) => [a.name, `${a.flag} ${a.name}`] as [string, string])]} />
        <Select value={fResult} onChange={setFResult} options={[['all', 'ทุกผล'], ['Win', 'Win'], ['Loss', 'Loss'], ['Breakeven', 'Breakeven']]} />
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา asset / setup / reason…"
            className="h-9 w-48 rounded-xl border border-purple-100 bg-white pl-7 pr-3 text-[12px] text-slate-700 outline-none focus:border-purple-400 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-100"
          />
        </div>
        <span className="ml-auto text-[11px] font-bold text-slate-400">แสดง {filtered.length} จาก {trades.length} เทรด</span>
      </div>

      {/* ── Trades table ── */}
      <div className="rounded-2xl border border-purple-50 bg-white shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
        <div className="max-h-[480px] overflow-auto trading-scrollbar">
          <table className="w-full text-left text-[12px]">
            <thead className="sticky top-0 z-10 bg-purple-50/90 backdrop-blur dark:bg-[#1f2138]">
              <tr className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <Th>Date</Th><Th>Account</Th><Th>Asset</Th><Th>Side</Th><Th>Session</Th><Th>Setup</Th><Th>Emotion</Th>
                <Th>Entry → Exit</Th><Th>Exit Reason</Th><Th center>Result</Th><Th right>R</Th><Th right>P&L</Th><Th right>Action</Th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((t) => (
                <tr key={t.id} onClick={() => setViewing(t)} className="cursor-pointer border-t border-slate-50 hover:bg-purple-50/40 dark:border-white/5 dark:hover:bg-white/5">
                  <Td className="whitespace-nowrap font-semibold text-slate-600 dark:text-slate-300">{dateLabel(t.date)}</Td>
                  <Td className="whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accountMeta[t.account]?.color ?? '#94a3b8' }} />
                      {t.account}
                    </span>
                  </Td>
                  <Td className="font-bold text-slate-800 dark:text-slate-100">{assetMeta[t.asset]?.flag} {t.asset}</Td>
                  <Td>
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${t.side === 'Long' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'}`}>
                      {t.side === 'Long' ? '▲' : '▼'} {t.side}
                    </span>
                  </Td>
                  <Td className="text-slate-500 dark:text-slate-400">{t.session}</Td>
                  <Td className="text-slate-500 dark:text-slate-400">{t.setup}</Td>
                  <Td className="text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><IconGlyph token={emotionMeta[t.emotion]?.emoji ?? 'neutral'} size={13} /> {t.emotion}</span></Td>
                  <Td className="whitespace-nowrap font-semibold text-slate-600 dark:text-slate-300">
                    {fmtPrice(t.entry, t.asset)} <span className="text-slate-300 dark:text-slate-500">→</span> {fmtPrice(t.exit, t.asset)}
                  </Td>
                  <Td className="text-slate-500 dark:text-slate-400">{t.exitReason}</Td>
                  <Td center><ResultBadge result={t.result} /></Td>
                  <Td right className={`font-bold ${t.r > 0 ? 'text-emerald-600' : t.r < 0 ? 'text-rose-500' : 'text-slate-400'}`}>{rStr(t.r)}</Td>
                  <Td right className={`font-extrabold ${t.pnl > 0 ? 'text-emerald-600' : t.pnl < 0 ? 'text-rose-500' : 'text-slate-400'}`}>{usd(t.pnl)}</Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setViewing(t); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-sky-100 hover:text-sky-600 dark:hover:bg-white/10" title="ดูรายละเอียด"><Maximize2 size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditing({ ...t, notes: t.notes ?? '' }); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-white/10" title="แก้ไข"><Pencil size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirm({ kind: 'delete', id: t.id }); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/15" title="ลบ"><Trash2 size={13} /></button>
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={13} className="py-10 text-center text-[12px] font-semibold text-slate-400">ไม่พบเทรดตามตัวกรอง — ลองล้างตัวกรองหรือเพิ่มเทรดใหม่</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-50 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[12px] dark:border-white/10 dark:bg-[#14162a] dark:text-slate-100"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="ml-2">{startIndex + 1}–{Math.min(startIndex + rowsPerPage, filtered.length)} of {filtered.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              ← Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isNear = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages;
                if (!isNear && page > 1 && page < totalPages) {
                  if (i === 1) return <span key={`dot-${i}`} className="px-1 text-slate-400">…</span>;
                  return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── Breakdown panels (all live-derived) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <GroupPanel title="By Account" icon={<Wallet size={14} className="text-purple-500" />} rows={byAccount} render={(r) => r.name} dot={(r) => accountMeta[r.name]?.color} />
        <GroupPanel title="By Asset" icon={<Coins size={14} className="text-amber-500" />} rows={byAsset} render={(r) => `${assetMeta[r.name]?.flag ?? ''} ${r.name}`} />
        <GroupPanel title="By Session" icon={<Clock size={14} className="text-sky-500" />} rows={bySession} render={(r) => r.name} />
        <GroupPanel title="By Setup" icon={<Layers size={14} className="text-violet-500" />} rows={bySetup} render={(r) => r.name} />
        <GroupPanel title="By Emotion" icon={<Brain size={14} className="text-rose-500" />} rows={byEmotion} render={(r) => r.name} />
      </div>

      {/* ── Trade detail modal ── */}
      {detail && (
        <TradeDetailModal
          trade={detail}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing({ ...detail, notes: detail.notes ?? '' }); setViewing(null); }}
          onDelete={() => setConfirm({ kind: 'delete', id: detail.id })}
          onUpload={(which, file) => uploadImg(detail.id, which, file)}
          onClearImg={(which) => clearImg(detail.id, which)}
        />
      )}

      {/* ── Add / Edit modal ── */}
      {editing && <TradeModal initial={editing} onClose={() => setEditing(null)} onSave={saveTrade} />}

      {/* ── Confirm dialog ── */}
      {confirm && (
        <ConfirmDialog
          title={confirm.kind === 'reset' ? 'คืนค่าข้อมูล seed?' : 'ลบเทรดนี้?'}
          body={confirm.kind === 'reset' ? 'ข้อมูลปัจจุบันทั้งหมดจะถูกแทนที่ด้วย seed ม.ค.–พ.ค. 2026' : 'การลบนี้ไม่สามารถย้อนกลับได้'}
          confirmLabel={confirm.kind === 'reset' ? 'Reset' : 'ลบ'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => (confirm.kind === 'reset' ? resetData() : deleteTrade(confirm.id))}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] rounded-2xl bg-slate-900 px-5 py-3 text-[13px] font-bold text-white shadow-xl dark:bg-purple-600">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── small building blocks ─────────────────────────────────────────────────────
function ActionBtn({ children, onClick, icon, danger }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition ${
        danger
          ? 'border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10'
          : 'border-purple-100 text-slate-600 hover:bg-purple-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5'
      }`}
    >
      {icon} {children}
    </button>
  );
}

function Th({ children, right, center }: { children: React.ReactNode; right?: boolean; center?: boolean }) {
  return <th className={`px-3 py-2.5 font-bold ${right ? 'text-right' : center ? 'text-center' : 'text-left'}`}>{children}</th>;
}
function Td({ children, right, center, className = '' }: { children: React.ReactNode; right?: boolean; center?: boolean; className?: string }) {
  return <td className={`px-3 py-2.5 ${right ? 'text-right' : center ? 'text-center' : 'text-left'} ${className}`}>{children}</td>;
}

function ResultBadge({ result }: { result: TradeResult }) {
  const map = {
    Win: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    Loss: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    Breakeven: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
  } as const;
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${map[result]}`}>{result}</span>;
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-purple-100 bg-white px-2.5 text-[12px] font-semibold text-slate-600 outline-none focus:border-purple-400 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-200"
    >
      {options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}

function GroupPanel({ title, icon, rows, render, dot }: { title: string; icon: React.ReactNode; rows: GroupRow[]; render: (r: GroupRow) => string; dot?: (r: GroupRow) => string | undefined }) {
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.pnl)));
  return (
    <div className="rounded-2xl border border-purple-50 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
      <div className="mb-3 flex items-center gap-2 text-[12px] font-bold text-slate-700 dark:text-slate-200">{icon}{title}</div>
      <div className="space-y-2">
        {rows.length === 0 && <div className="py-4 text-center text-[11px] font-semibold text-slate-400">ไม่มีข้อมูล</div>}
        {rows.map((r) => (
          <div key={r.name}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                {dot && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot(r) ?? '#94a3b8' }} />}
                {render(r)}
              </span>
              <span className={`font-extrabold ${r.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{usd(r.pnl)}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${(Math.abs(r.pnl) / maxAbs) * 100}%`, background: r.pnl >= 0 ? '#10b981' : '#f43f5e' }} />
              </div>
              <span className="w-20 text-right text-[9.5px] font-semibold text-slate-400">{r.trades} · {pct(r.winRate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trade Detail modal (before / after comparison + full data) ────────────────
function TradeDetailModal({
  trade, onClose, onEdit, onDelete, onUpload, onClearImg,
}: {
  trade: Trade;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (which: 'beforeImg' | 'afterImg', file: File) => void;
  onClearImg: (which: 'beforeImg' | 'afterImg') => void;
}) {
  const path = useMemo(() => buildPath(trade), [trade.id, trade.entry, trade.exit, trade.mfe, trade.mae, trade.side, trade.asset]);
  const resultColor = trade.result === 'Win' ? '#10b981' : trade.result === 'Loss' ? '#f43f5e' : '#94a3b8';

  useEscClose(onClose);

  return (
    <div className="fixed inset-0 z-[72] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 text-white" style={{ background: `linear-gradient(135deg, ${resultColor}, ${resultColor}cc)` }}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-xl backdrop-blur-sm">{assetMeta[trade.asset]?.flag}</span>
            <div>
              <div className="flex items-center gap-2 text-[15px] font-extrabold">
                {trade.asset}
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{trade.side === 'Long' ? '▲ Long' : '▼ Short'}</span>
                <span className="rounded-md bg-white/25 px-1.5 py-0.5 text-[10px] font-bold uppercase">{trade.result}</span>
              </div>
              <div className="text-[11px] font-medium text-white/85">{dateLabel(trade.date)} · {trade.account} · {trade.session} · {trade.setup} · {trade.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[18px] font-extrabold leading-none">{usd(trade.pnl)}</div>
              <div className="text-[11px] font-bold text-white/85">{rStr(trade.r)}</div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"><X size={16} /></button>
          </div>
        </div>

        {/* body */}
        <div className="overflow-y-auto p-6">
          {/* before / after comparison */}
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100">เปรียบเทียบ ก่อน / หลัง เทรด</div>
            <div className="text-[10px] font-semibold text-slate-400">แนบภาพจริงได้ — ค่าเริ่มต้นเป็นกราฟราคาจำลองจากค่าเทรด</div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ComparePanel
              label="ก่อนเทรด · Setup" sub="ราคาวิ่งเข้าหาจุด Entry" tone="#7c5cbf"
              img={trade.beforeImg} which="beforeImg" onUpload={onUpload} onClearImg={onClearImg}
              data={path.before} entry={path.E}
            />
            <ComparePanel
              label="หลังเทรด · Result" sub={`ปิดด้วย: ${trade.exitReason}`} tone={resultColor}
              img={trade.afterImg} which="afterImg" onUpload={onUpload} onClearImg={onClearImg}
              data={path.after} entry={path.E} exit={path.X} mfe={path.mfeP} mae={path.maeP}
            />
          </div>

          {/* trade data — below the images */}
          <div className="mt-5 text-[13px] font-extrabold text-slate-800 dark:text-slate-100">ข้อมูลการเทรด</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <Stat icon={<LogIn size={13} className="text-emerald-500" />} label="Entry Price" value={fmtPrice(trade.entry, trade.asset)} />
            <Stat icon={<LogOut size={13} className="text-rose-500" />} label="Exit Price" value={fmtPrice(trade.exit, trade.asset)} />
            <Stat icon={<ArrowRight size={13} className="text-sky-500" />} label="Exit Reason" value={trade.exitReason} />
            <Stat icon={<DollarSign size={13} className="text-emerald-500" />} label="Net P&L" value={usd(trade.pnl)} valueClass={trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-500'} />
            <Stat icon={<Award size={13} className="text-violet-500" />} label="R-Multiple" value={rStr(trade.r)} valueClass={trade.r >= 0 ? 'text-emerald-600' : 'text-rose-500'} />
            <Stat icon={<Target size={13} className="text-emerald-500" />} label="MFE" value={`${trade.mfe.toFixed(2)}R`} />
            <Stat icon={<Shield size={13} className="text-rose-500" />} label="MAE" value={`${trade.mae.toFixed(2)}R`} />
            <Stat icon={<Clock size={13} className="text-sky-500" />} label="Session" value={trade.session} />
            <Stat icon={<Layers size={13} className="text-violet-500" />} label="Setup" value={trade.setup} />
            <Stat icon={<Brain size={13} className="text-rose-500" />} label="Emotion" value={trade.emotion} />
            <Stat icon={<Coins size={13} className="text-amber-500" />} label="Asset" value={`${assetMeta[trade.asset]?.flag ?? ''} ${trade.asset}`} />
            <Stat icon={<Wallet size={13} style={{ color: accountMeta[trade.account]?.color ?? '#7c5cbf' }} />} label="Account" value={trade.account} />
            <Stat icon={<ArrowRight size={13} className="text-slate-400" />} label="Side" value={trade.side} />
          </div>

          {trade.notes && (
            <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/60 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-purple-700 dark:text-purple-300"><MessageSquare size={13} /> Notes</div>
              <div className="mt-1 text-[12px] text-slate-600 dark:text-slate-300">{trade.notes}</div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          <button onClick={onDelete} className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-4 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10"><Trash2 size={13} /> ลบเทรด</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">ปิด</button>
            <button onClick={onEdit} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[12px] font-extrabold text-white"><Pencil size={13} /> แก้ไข</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparePanel({
  label, sub, tone, img, which, onUpload, onClearImg, data, entry, exit, mfe, mae,
}: {
  label: string; sub: string; tone: string;
  img?: string; which: 'beforeImg' | 'afterImg';
  onUpload: (which: 'beforeImg' | 'afterImg', file: File) => void;
  onClearImg: (which: 'beforeImg' | 'afterImg') => void;
  data: { i: number; price: number }[]; entry: number; exit?: number; mfe?: number; mae?: number;
}) {
  const gid = `cmp-${which}`;
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="text-[12px] font-extrabold text-slate-700 dark:text-slate-200">{label}</div>
          <div className="text-[10px] font-medium text-slate-400">{sub}</div>
        </div>
        <div className="flex items-center gap-1">
          <label className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 hover:bg-purple-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
            <Camera size={11} /> {img ? 'เปลี่ยน' : 'แนบภาพ'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(which, f); e.target.value = ''; }} />
          </label>
          {img && <button onClick={() => onClearImg(which)} className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-slate-400 hover:text-rose-500 dark:border-white/10 dark:bg-white/10"><X size={11} /></button>}
        </div>
      </div>

      <div className="relative h-[170px] overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#14162a]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={label} className="h-full w-full object-cover" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tone} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={tone} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <XAxis dataKey="i" hide />
              <Tooltip formatter={(v: number) => [v, 'Price']} labelFormatter={() => ''} />
              {mae != null && <ReferenceLine y={mae} stroke="#f43f5e" strokeDasharray="2 3" strokeOpacity={0.6} />}
              {mfe != null && <ReferenceLine y={mfe} stroke="#10b981" strokeDasharray="2 3" strokeOpacity={0.6} />}
              <ReferenceLine y={entry} stroke="#64748b" strokeDasharray="4 3" label={{ value: 'Entry', position: 'insideLeft', fontSize: 9, fill: '#64748b' }} />
              {exit != null && <ReferenceLine y={exit} stroke={tone} strokeWidth={1.5} label={{ value: 'Exit', position: 'insideRight', fontSize: 9, fill: tone }} />}
              <Area type="monotone" dataKey="price" stroke={tone} strokeWidth={2} fill={`url(#${gid})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, valueClass = 'text-slate-800 dark:text-slate-100' }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#14162a]">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">{icon}{label}</div>
      <div className={`mt-0.5 truncate text-[13px] font-extrabold ${valueClass}`}>{value}</div>
    </div>
  );
}

// ── Add / Edit modal ──────────────────────────────────────────────────────────
function TradeModal({ initial, onClose, onSave }: { initial: FormState; onClose: () => void; onSave: (f: FormState) => void }) {
  const [f, setF] = useState<FormState>(initial);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  // keep exit / pnl consistent with entry · R · side · asset (user can still override)
  const recalc = (next: Partial<FormState>) => setF((p) => {
    const m = { ...p, ...next } as FormState;
    const entry = Number(m.entry);
    const r = Number(m.r);
    const exit = Number.isNaN(entry) || Number.isNaN(r) ? m.exit : computeExit(entry, r, m.side, m.asset);
    const pnl = Number.isNaN(r) ? m.pnl : Math.round(r * RISK_PER_TRADE);
    return { ...m, exit, pnl };
  });

  useEscClose(onClose);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]">
        <div className="flex items-center justify-between px-5 py-4 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
          <div>
            <div className="text-sm font-extrabold">{initial.id ? 'แก้ไขเทรด' : 'เพิ่มเทรดใหม่'}</div>
            <div className="text-[11px] text-white/80">ฟิลด์สอดคล้องกับข้อมูลที่ทุก tab ใช้แสดงผล</div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"><X size={16} /></button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><input type="date" min="2026-01-01" max="2026-05-31" value={f.date} onChange={(e) => set('date', e.target.value)} className={inputCls} /></Field>
            <Field label="Asset">
              <select value={f.asset} onChange={(e) => recalc({ asset: e.target.value, entry: assetInfo(e.target.value).price })} className={inputCls}>
                {ASSETS.map((a) => <option key={a.name} value={a.name}>{a.flag} {a.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Account">
            <select value={f.account} onChange={(e) => set('account', e.target.value)} className={inputCls}>
              {ACCOUNTS.map((a) => <option key={a.id} value={a.name}>{a.name} · {a.type} ({a.broker})</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Side">
              <div className="flex gap-1">
                {SIDES.map((s) => (
                  <button key={s} type="button" onClick={() => recalc({ side: s })}
                    className={`flex-1 rounded-lg py-2 text-[12px] font-bold transition ${f.side === s ? (s === 'Long' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                    {s === 'Long' ? '▲ Long' : '▼ Short'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Result">
              <div className="flex gap-1">
                {RESULTS.map((r) => (
                  <button key={r} type="button" onClick={() => set('result', r)}
                    className={`flex-1 rounded-lg py-2 text-[11px] font-bold transition ${f.result === r ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                    {r === 'Breakeven' ? 'BE' : r}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Session"><select value={f.session} onChange={(e) => set('session', e.target.value)} className={inputCls}>{SESSIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Setup"><select value={f.setup} onChange={(e) => set('setup', e.target.value)} className={inputCls}>{SETUPS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Emotion"><select value={f.emotion} onChange={(e) => set('emotion', e.target.value)} className={inputCls}>{EMOTIONS.map((em) => <option key={em.name} value={em.name}>{em.name}</option>)}</select></Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Entry Price"><input type="number" step="any" value={f.entry} onChange={(e) => recalc({ entry: parseFloat(e.target.value) })} className={inputCls} /></Field>
            <Field label="Exit Price"><input type="number" step="any" value={f.exit} onChange={(e) => set('exit', parseFloat(e.target.value))} className={inputCls} /></Field>
            <Field label="Exit Reason"><select value={f.exitReason} onChange={(e) => set('exitReason', e.target.value)} className={inputCls}>{EXIT_REASONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Field label="R-Multiple"><input type="number" step="0.01" value={f.r} onChange={(e) => recalc({ r: parseFloat(e.target.value) })} className={inputCls} /></Field>
            <Field label="P&L ($)"><input type="number" step="1" value={f.pnl} onChange={(e) => set('pnl', parseFloat(e.target.value))} className={inputCls} /></Field>
            <Field label="MFE (R)"><input type="number" step="0.01" value={f.mfe} onChange={(e) => set('mfe', parseFloat(e.target.value))} className={inputCls} /></Field>
            <Field label="MAE (R)"><input type="number" step="0.01" value={f.mae} onChange={(e) => set('mae', parseFloat(e.target.value))} className={inputCls} /></Field>
          </div>

          <Field label="Notes"><textarea rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="setup / plan / บทเรียน…" className={`${inputCls} resize-none`} /></Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-white/10">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">ยกเลิก</button>
          <button onClick={() => onSave(f)} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[12px] font-extrabold text-white"><Save size={13} /> บันทึก</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, body, confirmLabel, onCancel, onConfirm }: { title: string; body: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void }) {
  useEscClose(onCancel);
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl bg-white p-5 shadow-2xl dark:bg-[#191a2c]">
        <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</div>
        <div className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{body}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">ยกเลิก</button>
          <button onClick={onConfirm} className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-[12px] font-extrabold text-white">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-purple-400 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-100';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}
