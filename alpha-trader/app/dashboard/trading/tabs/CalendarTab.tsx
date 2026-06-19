'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, Wallet,
  TrendingUp, TrendingDown, Trophy, Activity, Hash,
  BarChart2, Clock, Target, AlertTriangle,
} from 'lucide-react';
import {
  type Trade, ACCOUNTS, MONTHS, EMOTIONS, assetInfo, accountInfo, fmtPrice,
} from '@/data/trading-data-mock';
import { useTradingData } from '@/lib/trading/store';
import { deriveDaily, type DailyAgg } from '@/lib/trading/insights';

const usd = (n: number) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${n.toFixed(0)}%`;
const rStr = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}R`;

const emotionMeta = Object.fromEntries(EMOTIONS.map((e) => [e.name, e]));
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const TODAY = '2026-06-02';
const WEEKDAY_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

const monthIndex = (key: string) => MONTHS.findIndex((m) => m.key === key);

type GridCell = { day: number; dateKey: string; isCurrentMonth: boolean; agg?: DailyAgg };
type WeeklySummary = { pnl: number; trades: number; weekNum: number };

export default function CalendarTab() {
  const { trades } = useTradingData();
  const [monthKey, setMonthKey] = useState<string>('2026-05');
  const [account, setAccount] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const month = MONTHS.find((m) => m.key === monthKey) ?? MONTHS[MONTHS.length - 1];
  const mIdx = monthIndex(monthKey);

  const scoped = useMemo(
    () => (account === 'all' ? trades : trades.filter((t) => t.account === account)),
    [trades, account],
  );
  const daily = useMemo(() => deriveDaily(scoped), [scoped]);

  // Auto-select last trading day in this month
  useEffect(() => {
    const daysInMonth = [...daily.keys()].filter((k) => k.startsWith(monthKey)).sort();
    const last = daysInMonth[daysInMonth.length - 1] ?? null;
    setSelectedDay(last);
  }, [monthKey, daily]);

  const [year, mo] = monthKey.split('-').map(Number);
  const firstDow = new Date(Date.UTC(year, mo - 1, 1)).getUTCDay();
  const daysInMonthCount = new Date(Date.UTC(year, mo, 0)).getUTCDate();
  const prevMonthDays = new Date(Date.UTC(year, mo - 1, 0)).getUTCDate();
  const prevYear = mo === 1 ? year - 1 : year;
  const prevMo = mo === 1 ? 12 : mo - 1;
  const nextYear = mo === 12 ? year + 1 : year;
  const nextMo = mo === 12 ? 1 : mo + 1;

  const gridCells: GridCell[] = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateKey = `${prevYear}-${String(prevMo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    gridCells.push({ day: d, dateKey, isCurrentMonth: false, agg: daily.get(dateKey) });
  }
  for (let d = 1; d <= daysInMonthCount; d++) {
    const dateKey = `${monthKey}-${String(d).padStart(2, '0')}`;
    gridCells.push({ day: d, dateKey, isCurrentMonth: true, agg: daily.get(dateKey) });
  }
  const tail = gridCells.length % 7 === 0 ? 0 : 7 - (gridCells.length % 7);
  for (let d = 1; d <= tail; d++) {
    const dateKey = `${nextYear}-${String(nextMo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    gridCells.push({ day: d, dateKey, isCurrentMonth: false, agg: daily.get(dateKey) });
  }

  const weeks: GridCell[][] = [];
  for (let i = 0; i < gridCells.length; i += 7) weeks.push(gridCells.slice(i, i + 7));

  const weekSummaries: WeeklySummary[] = weeks.map((week, idx) => ({
    pnl: week.reduce((s, c) => s + (c.agg?.pnl ?? 0), 0),
    trades: week.reduce((s, c) => s + (c.agg?.count ?? 0), 0),
    weekNum: idx + 1,
  }));

  const monthTrades = useMemo(() => scoped.filter((t) => t.date.startsWith(monthKey)), [scoped, monthKey]);
  const summary = useMemo(() => {
    const days = [...daily.values()].filter((d) => d.date.startsWith(monthKey));
    const net = monthTrades.reduce((s, t) => s + t.pnl, 0);
    const wins = monthTrades.filter((t) => t.result === 'Win').length;
    const profitDays = days.filter((d) => d.pnl > 0).length;
    const lossDays = days.filter((d) => d.pnl < 0).length;
    const best = days.reduce<DailyAgg | undefined>((b, d) => (!b || d.pnl > b.pnl ? d : b), undefined);
    return { net, trades: monthTrades.length, winRate: monthTrades.length ? (wins / monthTrades.length) * 100 : 0, tradingDays: days.length, profitDays, lossDays, best };
  }, [daily, monthTrades, monthKey]);

  const dayTrades = useMemo(
    () => (selectedDay ? scoped.filter((t) => t.date === selectedDay).sort((a, b) => b.pnl - a.pnl) : []),
    [scoped, selectedDay],
  );
  const dayAgg = selectedDay ? daily.get(selectedDay) : undefined;

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(300);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(300);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startX.current - e.clientX;
      setPanelWidth(Math.min(520, Math.max(220, startW.current + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  return (
    <div className="space-y-4">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-purple-50 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 shadow-md">
            <CalendarDays size={20} color="#fff" />
          </span>
          <div className="mr-auto">
            <h2 className="text-[16px] font-extrabold leading-tight text-slate-800 dark:text-slate-100">Trading Calendar</h2>
            <p className="text-[11px] font-medium text-slate-400">คลิกวันที่มีเทรดเพื่อดูรายละเอียด · Sa = สรุปรายสัปดาห์</p>
          </div>

          <label className="flex items-center gap-1.5 rounded-xl border border-purple-100 bg-white px-2.5 py-2 text-[12px] font-semibold text-slate-600 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-200">
            <Wallet size={13} className="text-purple-500" />
            <select value={account} onChange={(e) => setAccount(e.target.value)} className="bg-transparent outline-none">
              <option value="all">ทุกบัญชี</option>
              {ACCOUNTS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
          </label>

          <div className="flex items-center gap-1 rounded-xl border border-purple-100 bg-white p-1 dark:border-white/10 dark:bg-[#14162a]">
            <button onClick={() => setMonthKey(MONTHS[Math.max(0, mIdx - 1)].key)} disabled={mIdx <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 enabled:hover:bg-purple-50 disabled:opacity-30 dark:enabled:hover:bg-white/10">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[92px] text-center text-[13px] font-extrabold text-slate-700 dark:text-slate-100">
              {month.label} {year}
            </span>
            <button onClick={() => setMonthKey(MONTHS[Math.min(MONTHS.length - 1, mIdx + 1)].key)} disabled={mIdx >= MONTHS.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 enabled:hover:bg-purple-50 disabled:opacity-30 dark:enabled:hover:bg-white/10">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {MONTHS.map((m) => (
            <button key={m.key} onClick={() => setMonthKey(m.key)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                m.key === monthKey
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                  : 'text-slate-400 hover:bg-purple-50 dark:hover:bg-white/5'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary tiles ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryTile label="Net P&L เดือนนี้" value={usd(summary.net)} tone={summary.net >= 0 ? 'good' : 'danger'} icon={summary.net >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} />
        <SummaryTile label="จำนวนเทรด" value={String(summary.trades)} tone="info" icon={<Hash size={14} />} />
        <SummaryTile label="Win Rate" value={summary.trades ? pct(summary.winRate) : '—'} tone={summary.winRate >= 50 ? 'good' : 'warn'} icon={<Activity size={14} />} />
        <SummaryTile label="วันเทรด" value={`${summary.tradingDays} วัน`} tone="premium" icon={<CalendarDays size={14} />} />
        <SummaryTile label="วันได้ / วันเสีย" value={`${summary.profitDays} / ${summary.lossDays}`} tone={summary.profitDays >= summary.lossDays ? 'good' : 'warn'} icon={<Trophy size={14} />} />
        <SummaryTile label="วันที่ดีที่สุด" value={summary.best && summary.best.pnl > 0 ? usd(summary.best.pnl) : '—'}
          sub={summary.best && summary.best.pnl > 0 ? `${Number(summary.best.date.slice(8))} ${month.th}` : undefined}
          tone="good" icon={<Trophy size={14} />} />
      </div>

      {/* ── Main 2-column layout ───────────────────────────────── */}
      <div className="flex gap-0">

        {/* Left: Calendar grid */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111318]">
            {/* Weekday header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
              {WEEKDAYS.map((w, i) => (
                <div key={w} className={`py-3 text-center text-[12px] font-bold tracking-wide ${
                  i === 6
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>{w}</div>
              ))}
            </div>

            {weeks.map((week, weekIdx) => {
              const weekSum = weekSummaries[weekIdx];
              return (
                <div key={weekIdx} className="grid grid-cols-7 border-b border-slate-200/80 last:border-b-0 dark:border-slate-700/60">
                  {week.map((cell, dayIdx) => {
                    const isSat = dayIdx === 6;
                    const agg = cell.agg;
                    const has = !!agg && agg.count > 0 && cell.isCurrentMonth;
                    const isToday = cell.dateKey === TODAY;
                    const isSelected = cell.dateKey === selectedDay;
                    const win = has && agg!.pnl > 0;
                    const loss = has && agg!.pnl < 0;

                    if (isSat) {
                      const wPnl = weekSum.pnl;
                      return (
                        <div key={cell.dateKey} className={`relative flex min-h-[90px] flex-col items-center justify-center gap-0.5 border-l border-slate-200/80 px-1 py-2 dark:border-slate-700/60 ${
                          wPnl > 0 ? 'bg-emerald-50 dark:bg-emerald-950/60'
                            : wPnl < 0 ? 'bg-rose-50 dark:bg-rose-950/60'
                            : 'bg-slate-50 dark:bg-slate-800/30'
                        }`}>
                          <span className={`mb-0.5 text-[10px] font-semibold ${cell.isCurrentMonth ? 'text-slate-400' : 'text-slate-300 dark:text-slate-600'}`}>
                            {cell.day}
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">W{weekSum.weekNum}</span>
                          <span className={`text-[14px] font-extrabold leading-tight ${
                            wPnl > 0 ? 'text-emerald-600 dark:text-emerald-400'
                              : wPnl < 0 ? 'text-rose-500 dark:text-rose-400'
                              : 'text-slate-400'
                          }`}>{usd(wPnl)}</span>
                          <span className="text-[9px] font-semibold text-slate-400">{weekSum.trades}T</span>
                        </div>
                      );
                    }

                    return (
                      <button key={cell.dateKey}
                        onClick={() => has ? setSelectedDay(cell.dateKey) : undefined}
                        disabled={!has}
                        className={`relative flex min-h-[90px] flex-col items-center justify-center gap-1 px-1 py-2 transition-all ${
                          dayIdx > 0 ? 'border-l border-slate-200/80 dark:border-slate-700/60' : ''
                        } ${has ? 'cursor-pointer' : 'cursor-default'} ${
                          isSelected ? 'ring-2 ring-inset ring-purple-400 dark:ring-purple-500 z-10' : ''
                        } ${
                          win ? 'bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-900/25 dark:hover:bg-emerald-900/40'
                            : loss ? 'bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/50 dark:hover:bg-rose-950/70'
                            : 'bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/5'
                        }`}
                      >
                        <span className={`inline-flex h-6 w-6 items-center justify-center text-[12px] font-bold leading-none ${
                          isToday ? 'rounded-full bg-blue-500 text-white shadow-sm'
                            : cell.isCurrentMonth ? 'text-slate-600 dark:text-slate-300'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}>{cell.day}</span>

                        {has ? (
                          <>
                            <span className={`text-[13px] font-extrabold leading-none ${
                              win ? 'text-emerald-600 dark:text-emerald-400'
                                : loss ? 'text-rose-500 dark:text-rose-400'
                                : 'text-slate-500'
                            }`}>{usd(agg!.pnl)}</span>
                            <span className="text-[10px] font-semibold text-slate-400">{agg!.count}T</span>
                          </>
                        ) : (
                          <span className="h-[30px]" />
                        )}

                        {isSelected && (
                          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-purple-400 dark:bg-purple-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-200 dark:bg-emerald-700/60" />วันกำไร</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-rose-200 dark:bg-rose-900/80" />วันขาดทุน</span>
            <span className="flex items-center gap-1.5"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white">1</span>วันนี้</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-purple-300 dark:bg-purple-500/50" />วันที่เลือก</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-100 ring-1 ring-slate-300 dark:bg-emerald-950/60" />Sa = สรุปสัปดาห์</span>
          </div>
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="group relative flex w-3 shrink-0 cursor-col-resize items-center justify-center"
          title="ลากเพื่อปรับขนาด"
        >
          <div className="h-16 w-1 rounded-full bg-slate-200 transition group-hover:bg-purple-400 dark:bg-white/10 dark:group-hover:bg-purple-500" />
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* Right: Day detail panel (resizable) */}
        <div className="shrink-0 pl-2" style={{ width: panelWidth }}>
          <div className="mb-1 flex items-center justify-end gap-1 text-[9px] font-semibold text-slate-300 dark:text-slate-600">
            <span>◀ ลากปรับขนาด ▶</span>
            <span className="rounded bg-slate-100 px-1 dark:bg-white/10">{panelWidth}px</span>
          </div>
          <DayPanel
            date={selectedDay}
            monthTh={month.th}
            agg={dayAgg}
            trades={dayTrades}
          />
        </div>
      </div>
    </div>
  );
}

// ── Day detail panel ──────────────────────────────────────────────────────────
function DayPanel({ date, monthTh, agg, trades }: {
  date: string | null; monthTh: string; agg?: DailyAgg; trades: Trade[];
}) {
  if (!date) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 dark:border-white/10 dark:bg-white/[0.02]">
        <CalendarDays size={32} className="opacity-30" />
        <p className="text-[12px] font-semibold">คลิกวันที่มีเทรดเพื่อดูรายละเอียด</p>
      </div>
    );
  }

  const dayNum = Number(date.slice(8));
  const net = agg?.pnl ?? 0;
  const bgGradient = net > 0
    ? 'from-emerald-500 to-teal-500'
    : net < 0 ? 'from-rose-500 to-pink-500'
    : 'from-purple-500 to-violet-500';

  const avgPnl = trades.length ? net / trades.length : 0;
  const bestTrade = trades.reduce<Trade | null>((b, t) => (!b || t.pnl > b.pnl ? t : b), null);
  const worstTrade = trades.reduce<Trade | null>((b, t) => (!b || t.pnl < b.pnl ? t : b), null);
  const avgR = trades.length ? (agg?.rSum ?? 0) / trades.length : 0;
  const dow = new Date(date + 'T00:00:00').getDay();

  const sessionMap = new Map<string, { pnl: number; count: number }>();
  trades.forEach((t) => {
    const s = sessionMap.get(t.session) ?? { pnl: 0, count: 0 };
    sessionMap.set(t.session, { pnl: s.pnl + t.pnl, count: s.count + 1 });
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div key={date} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }} className="flex flex-col gap-3">

        {/* Date header */}
        <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} p-4 text-white shadow-lg`}>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/20 px-3 py-2 backdrop-blur-sm">
              <span className="text-[9px] font-bold uppercase leading-none tracking-widest opacity-80">{monthTh}</span>
              <span className="text-[26px] font-extrabold leading-none">{dayNum}</span>
              <span className="text-[9px] font-semibold leading-none opacity-75">{WEEKDAY_TH[dow]}</span>
            </div>
            <div>
              <div className="text-[11px] font-semibold opacity-80">วัน{WEEKDAY_TH[dow]}ที่ {dayNum} {monthTh}</div>
              <div className="mt-1 text-[26px] font-extrabold leading-none">{usd(net)}</div>
              <div className="mt-0.5 text-[12px] font-bold opacity-80">{rStr(agg?.rSum ?? 0)} Total R</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">{agg?.count ?? 0} เทรด</span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">{agg?.wins ?? 0}W · {agg?.losses ?? 0}L</span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">Win {pct(agg?.winRate ?? 0)}</span>
          </div>
        </div>

        {/* Stats grid */}
        {trades.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Avg P&L/เทรด', value: usd(avgPnl), color: avgPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400', icon: <BarChart2 size={12} /> },
              { label: 'Avg R/เทรด', value: rStr(avgR), color: avgR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400', icon: <Target size={12} /> },
              { label: 'Best Trade', value: bestTrade ? usd(bestTrade.pnl) : '—', color: 'text-emerald-600 dark:text-emerald-400', icon: <TrendingUp size={12} /> },
              { label: 'Worst Trade', value: worstTrade ? usd(worstTrade.pnl) : '—', color: 'text-rose-500 dark:text-rose-400', icon: <TrendingDown size={12} /> },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-[#181a2c]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <span className="text-slate-300 dark:text-slate-500">{s.icon}</span>{s.label}
                </div>
                <div className={`mt-1 text-[15px] font-extrabold leading-none ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Session breakdown */}
        {sessionMap.size > 0 && (
          <div className="rounded-xl border border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-[#181a2c]">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Clock size={11} /> Session
            </div>
            <div className="space-y-2">
              {Array.from(sessionMap.entries()).map(([ses, { pnl, count }]) => (
                <div key={ses} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{ses}</span>
                  <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className={`absolute inset-y-0 left-0 rounded-full transition-all ${pnl >= 0 ? 'bg-emerald-400/70' : 'bg-rose-400/70'}`}
                      style={{ width: `${Math.min(100, Math.abs(pnl) / (Math.abs(net) || 1) * 100)}%` }} />
                  </div>
                  <span className={`w-16 shrink-0 text-right text-[11px] font-extrabold ${pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {usd(pnl)}
                  </span>
                  <span className="text-[10px] text-slate-400">{count}T</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade list */}
        <div className="rounded-xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#181a2c] overflow-hidden">
          <div className="border-b border-slate-100 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-white/10">
            รายการเทรด ({trades.length})
          </div>
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {trades.length === 0 ? (
              <div className="py-8 text-center text-[12px] font-semibold text-slate-400">ไม่มีเทรดในวันนี้</div>
            ) : (
              trades.map((t) => {
                const acct = accountInfo(t.account);
                const win = t.result === 'Win';
                const loss = t.result === 'Loss';
                const emo = emotionMeta[t.emotion];
                const info = assetInfo(t.asset);
                return (
                  <div key={t.id} className={`px-3 py-2.5 ${win ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : loss ? 'bg-rose-50/50 dark:bg-rose-900/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">{info.flag}</span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100">{t.asset}</span>
                            <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${t.side === 'Long' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                              {t.side === 'Long' ? '▲' : '▼'} {t.side}
                            </span>
                            <span className={`rounded px-1 py-0.5 text-[9px] font-bold ${win ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : loss ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>
                              {t.result}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: acct.color }} />
                            {t.account} · {t.session}
                            {emo && <span>{emo.emoji}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={`text-[14px] font-extrabold leading-none ${t.pnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : t.pnl < 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'}`}>
                          {usd(t.pnl)}
                        </div>
                        <div className={`text-[11px] font-bold ${t.r > 0 ? 'text-emerald-500' : t.r < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {rStr(t.r)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="relative h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-sky-400/70"
                          style={{ width: `${Math.min(100, (t.mfe / (t.mfe + Math.abs(t.mae) + 0.01)) * 100)}%` }} />
                      </div>
                      <div className="mt-0.5 flex justify-between text-[9px] font-semibold">
                        <span className="text-sky-500">MFE +{t.mfe.toFixed(1)}R</span>
                        <span className="text-amber-500">MAE -{Math.abs(t.mae).toFixed(1)}R</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {trades.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-[11px] font-semibold text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertTriangle size={14} />
            วันนี้ไม่มีเทรด
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Summary tile ──────────────────────────────────────────────────────────────
const TONE_MAP = {
  good:    { text: 'text-emerald-600 dark:text-emerald-400', chip: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  danger:  { text: 'text-rose-500 dark:text-rose-400',       chip: 'bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300' },
  warn:    { text: 'text-amber-600 dark:text-amber-400',     chip: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  info:    { text: 'text-sky-600 dark:text-sky-400',         chip: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  premium: { text: 'text-purple-600 dark:text-purple-300',   chip: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' },
} as const;

const SPARKLE_COLORS: Record<keyof typeof TONE_MAP, { fill: string; glow: string }> = {
  good:    { fill: 'rgba(52,211,153,0.80)',  glow: 'rgba(52,211,153,0.55)'  },
  danger:  { fill: 'rgba(251,113,133,0.80)', glow: 'rgba(251,113,133,0.55)' },
  warn:    { fill: 'rgba(251,191,36,0.80)',  glow: 'rgba(251,191,36,0.55)'  },
  info:    { fill: 'rgba(125,211,252,0.80)', glow: 'rgba(125,211,252,0.55)' },
  premium: { fill: 'rgba(167,139,250,0.80)', glow: 'rgba(167,139,250,0.55)' },
};
const STAR_PATH_TILE = 'M5,0 C5,0 5.2,3.8 5.6,4.4 C6.2,4.8 10,5 10,5 C10,5 6.2,5.2 5.6,5.6 C5.2,6.2 5,10 5,10 C5,10 4.8,6.2 4.4,5.6 C3.8,5.2 0,5 0,5 C0,5 3.8,4.8 4.4,4.4 C4.8,3.8 5,0 5,0 Z';

function SparkleAccents({ tone }: { tone: keyof typeof TONE_MAP }) {
  const { fill, glow } = SPARKLE_COLORS[tone];
  const stars = [
    { size: 11, right: 6,  bottom: 7,    delay: 0,   dur: 2.9 },
    { size: 7,  right: 22, top:    26,   delay: 1.3, dur: 3.3 },
    { size: 8,  right: 4,  top: '50%',   delay: 2.2, dur: 2.6 },
  ];
  return (
    <>
      {stars.map((s, i) => (
        <motion.svg key={i} width={s.size} height={s.size} viewBox="0 0 10 10"
          style={{ position: 'absolute', right: s.right, bottom: (s as { bottom?: number }).bottom, top: (s as { top?: number | string }).top, pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
          animate={{ opacity: [0, 0.85, 0.15, 1, 0.55, 0], scale: [0.3, 1.2, 0.75, 1.1, 0.9, 0.3], rotate: [0, 18, 8, 22, 12, 0] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.45, 0.6, 0.8, 1] }}>
          <path d={STAR_PATH_TILE} fill={fill} />
          <path d={STAR_PATH_TILE} fill={glow} style={{ filter: `blur(${s.size * 0.4}px)`, transform: 'scale(1.6) translate(-3%, -3%)' }} />
        </motion.svg>
      ))}
    </>
  );
}

function SummaryTile({ label, value, sub, tone, icon }: {
  label: string; value: string; sub?: string; tone: keyof typeof TONE_MAP; icon: React.ReactNode;
}) {
  const t = TONE_MAP[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-50 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
      <SparkleAccents tone={tone} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400">{label}</span>
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${t.chip}`}>{icon}</span>
      </div>
      <div className={`mt-1.5 text-[20px] font-extrabold leading-none ${t.text}`}>{value}</div>
      {sub && <div className="mt-1 text-[10px] font-semibold text-slate-400">{sub}</div>}
    </div>
  );
}
