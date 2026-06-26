'use client';
import { useMemo, useState } from 'react';
import { useThemeColors } from '@/lib/useThemeColors';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine, Cell,
} from 'recharts';
import KpiCard from '@/components/KpiCard';
import { Camera, DollarSign, Target, Award, Brain, BarChart2, CheckCircle2, XCircle, Smile } from 'lucide-react';
import { useTradingData } from '@/lib/trading/store';
import {
  calculatePsychologyScore, calculateDisciplineScore, buildKpiSparkline,
} from '@/lib/trading/selectors';
import { deriveDaily, deriveAdvanced } from '@/lib/trading/insights';
import {
  deriveKpis, deriveMonthly, deriveEquity, groupBy, MONTHS,
} from '@/data/trading-data-mock';

const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SESSIONS = ['Asia', 'London', 'New York', 'Overlap'] as const;

function getWRColor(v: number): string {
  if (v >= 65) return '#10b981';
  if (v >= 55) return '#6ee7b7';
  if (v >= 45) return '#fbbf24';
  return '#f87171';
}

export default function ReviewTab() {
  const tc = useThemeColors();
  const router = useRouter();
  const { trades } = useTradingData();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  // ── Derived core metrics ────────────────────────────────────────────────────
  const kpis = useMemo(() => deriveKpis(trades), [trades]);
  const adv = useMemo(() => deriveAdvanced(trades), [trades]);
  const monthly = useMemo(() => deriveMonthly(trades), [trades]);
  const equity = useMemo(() => deriveEquity(trades), [trades]);
  const psych = useMemo(() => calculatePsychologyScore(trades), [trades]);
  const discipline = useMemo(() => calculateDisciplineScore(trades), [trades]);
  const spark = useMemo(() => buildKpiSparkline(trades), [trades]);

  // Last trading week (last 7 trading days) + previous week for change
  const weekly = useMemo(() => {
    const days = [...deriveDaily(trades).values()].sort((a, b) => (a.date < b.date ? -1 : 1));
    const last7 = days.slice(-7);
    const prev7 = days.slice(-14, -7);
    const weekPnl = last7.reduce((s, d) => s + d.pnl, 0);
    const prevPnl = prev7.reduce((s, d) => s + d.pnl, 0);
    const data = last7.map((d) => {
      const [y, m, dd] = d.date.split('-').map(Number);
      const wd = new Date(Date.UTC(y, m - 1, dd)).getUTCDay();
      return { day: `${WD[wd]} ${dd}`, equity: d.pnl };
    });
    return { data, weekPnl, prevPnl };
  }, [trades]);

  // Equity trend sampled to monthly points
  const equityTrend = useMemo(() => {
    return MONTHS.map((mo) => {
      const upto = equity.filter((p) => p.date !== 'start' && p.date.startsWith(mo.key));
      const last = upto.length ? upto[upto.length - 1].equity : null;
      return { date: mo.label, equity: last };
    }).filter((p) => p.equity !== null) as { date: string; equity: number }[];
  }, [equity]);

  // Monthly P&L (MTD = latest month)
  const lastMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];
  const monthChangePct = prevMonth && prevMonth.pnl !== 0
    ? ((lastMonth.pnl - prevMonth.pnl) / Math.abs(prevMonth.pnl)) * 100 : 0;

  // Best assets (positive pnl)
  const bestAssets = useMemo(() => {
    const rows = groupBy(trades, 'asset').filter((g) => g.pnl > 0);
    const max = rows.length ? Math.max(...rows.map((r) => r.pnl)) : 1;
    return rows.slice(0, 5).map((r) => ({ ...r, pct: Math.round((r.pnl / max) * 100) }));
  }, [trades]);

  // Negative habits — losing trades grouped by emotion + worst exit reasons
  const negativeHabits = useMemo(() => {
    const NEG = ['Anxious', 'Impulsive', 'Greedy'];
    const byEmotion = groupBy(trades, 'emotion')
      .filter((g) => NEG.includes(g.name))
      .map((g) => ({ habit: g.name, count: trades.filter((t) => t.emotion === g.name && t.result === 'Loss').length, color: '#f97316' }));
    const maxC = Math.max(1, ...byEmotion.map((h) => h.count));
    return byEmotion.sort((a, b) => b.count - a.count).map((h) => ({ ...h, pctW: (h.count / maxC) * 100 }));
  }, [trades]);

  // Session review — win rate & pnl per session
  const sessionReview = useMemo(() => {
    return SESSIONS.map((s) => {
      const rows = trades.filter((t) => t.session === s);
      const wins = rows.filter((t) => t.result === 'Win').length;
      return {
        session: s,
        trades: rows.length,
        winRate: rows.length ? (wins / rows.length) * 100 : 0,
        pnl: rows.reduce((sum, t) => sum + t.pnl, 0),
      };
    }).filter((s) => s.trades > 0);
  }, [trades]);

  // Psychology trend per month
  const psychTrend = useMemo(() => {
    return MONTHS.map((mo) => {
      const rows = trades.filter((t) => t.date.startsWith(mo.key));
      if (!rows.length) return null;
      return { date: mo.label, score: calculatePsychologyScore(rows), mood: calculateDisciplineScore(rows) };
    }).filter(Boolean) as { date: string; score: number; mood: number }[];
  }, [trades]);

  // Rule compliance — derived proxies from real trades
  const ruleCompliance = useMemo(() => {
    const total = trades.length || 1;
    const losses = trades.filter((t) => t.result === 'Loss');
    const stopExits = losses.filter((t) => ['Stop Loss', 'Break-even Stop', 'Trailing Stop'].includes(t.exitReason)).length;
    const withinRisk = trades.filter((t) => Math.abs(t.r) <= 2).length;
    const journaled = trades.filter((t) => t.notes && t.notes.trim().length > 0).length;
    const posEmotion = trades.filter((t) => ['Calm', 'Confident'].includes(t.emotion)).length;
    const daily = [...deriveDaily(trades).values()];
    const calmDays = daily.filter((d) => d.count <= 3).length;
    return [
      { rule: 'Stop Loss Discipline', desc: 'ปิดขาดทุนด้วย stop ตามแผน', pct: losses.length ? +(stopExits / losses.length * 100).toFixed(1) : 100, ok: true },
      { rule: 'Risk Limit (≤2R)', desc: 'คุมความเสี่ยงต่อไม้ไม่เกินแผน', pct: +(withinRisk / total * 100).toFixed(1), ok: withinRisk / total >= 0.8 },
      { rule: 'Emotional Control', desc: 'เทรดด้วยอารมณ์นิ่ง', pct: +(posEmotion / total * 100).toFixed(1), ok: posEmotion / total >= 0.55 },
      { rule: 'Complete Journal', desc: 'บันทึกโน้ตหลังจบดีล', pct: +(journaled / total * 100).toFixed(1), ok: journaled / total >= 0.5 },
      { rule: 'Avoid Overtrading', desc: 'ไม่เทรดเกิน 3 ไม้/วัน', pct: daily.length ? +(calmDays / daily.length * 100).toFixed(1) : 100, ok: calmDays / Math.max(1, daily.length) >= 0.6 },
    ];
  }, [trades]);

  // Edge / mistake cards
  const worstAsset = useMemo(() => {
    const rows = groupBy(trades, 'asset');
    return rows.length ? rows[rows.length - 1] : null;
  }, [trades]);
  const bestSetup = useMemo(() => {
    const rows = groupBy(trades, 'setup').filter((g) => g.pnl > 0);
    return rows.length ? rows[0] : null;
  }, [trades]);
  const bestSession = useMemo(() => {
    const sorted = [...sessionReview].sort((a, b) => b.pnl - a.pnl);
    return sorted[0] ?? null;
  }, [sessionReview]);

  const improvementScore = Math.round((psych + discipline) / 2);

  const kpiCards = [
    { title: 'Week P&L', value: `${weekly.weekPnl >= 0 ? '+' : ''}${usd(weekly.weekPnl)}`, change: `${weekly.prevPnl !== 0 ? (((weekly.weekPnl - weekly.prevPnl) / Math.abs(weekly.prevPnl)) * 100).toFixed(1) : '0'}%`, positive: weekly.weekPnl >= 0, icon: <Camera size={20} color="#fff" />, color: tc.primary, sparkData: spark },
    { title: 'Month P&L (MTD)', value: `${lastMonth.pnl >= 0 ? '+' : ''}${usd(lastMonth.pnl)}`, change: `${monthChangePct.toFixed(1)}%`, positive: lastMonth.pnl >= 0, icon: <DollarSign size={20} color="#fff" />, color: '#10b981', sparkData: spark },
    { title: 'Win Rate', value: `${kpis.winRate.toFixed(1)}%`, change: `${kpis.wins}W / ${kpis.losses}L`, positive: kpis.winRate >= 50, icon: <Target size={20} color="#fff" />, color: '#f59e0b', sparkData: spark },
    { title: 'Profit Factor', value: kpis.profitFactor >= 99 ? '∞' : kpis.profitFactor.toFixed(2), change: `Payoff ${adv.payoff.toFixed(2)}`, positive: kpis.profitFactor >= 1, icon: <Award size={20} color="#fff" />, color: '#38bdf8', sparkData: spark },
    { title: 'Psychology Score', value: `${psych} / 100`, change: `${psych >= 60 ? 'Healthy' : 'Watch'}`, positive: psych >= 60, icon: <Brain size={20} color="#fff" />, color: tc.primarySoft, sparkData: spark },
    { title: 'Improvement Score', value: `${improvementScore} / 100`, change: `Discipline ${discipline}`, positive: improvementScore >= 60, icon: <BarChart2 size={20} color="#fff" />, color: '#0d9488', sparkData: spark },
  ];

  const saveWeeklyReview = () => {
    localStorage.setItem('alpha-trader-weekly-review', JSON.stringify({
      savedAt: new Date().toISOString(),
      weekPnl: weekly.weekPnl, winRate: kpis.winRate, psych, discipline,
    }));
    showToast('Weekly review saved');
  };
  const openBacktestPlan = () => {
    localStorage.setItem('alpha-trader-review-backtest-plan', `${bestSetup?.name ?? 'Breakout'} / ${bestSession?.session ?? 'London'}`);
    router.replace('/dashboard/trading?tab=backtest');
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-[12px] font-bold text-emerald-700 shadow-[0_18px_44px_rgba(45,35,95,0.16)]">
          {toast}
        </div>
      )}

      {/* KPI Row — derived */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      {/* Row 2: Weekly Chart + Equity Trend + Biggest Win/Loss */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Performance */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Weekly Performance</div>
          <div className="mb-2 text-[11px] font-medium text-slate-500">กำไร/ขาดทุนรายวัน 7 วันเทรดล่าสุด</div>
          <div className={`text-right font-bold text-sm mb-2 ${weekly.weekPnl >= 0 ? 'text-purple-700' : 'text-rose-500'}`}>
            {weekly.weekPnl >= 0 ? '+' : ''}{usd(weekly.weekPnl)}
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={weekly.data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" />
              <XAxis dataKey="day" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`} tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={38} />
              <Tooltip formatter={(v: number) => [usd(v), 'P&L']} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Bar dataKey="equity" radius={[6, 6, 0, 0]} barSize={14}>
                {weekly.data.map((d, i) => <Cell key={i} fill={d.equity >= 0 ? tc.primary : '#f43f5e'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Equity Trend */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Equity Trend</div>
          <div className="mb-2 text-[11px] font-medium text-slate-500">เส้นทาง Equity รายเดือน (Jan–May 2026)</div>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={equityTrend}>
              <defs>
                <linearGradient id="rvEq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tc.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={tc.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={35} domain={['dataMin - 2000', 'dataMax + 2000']} />
              <Tooltip formatter={(v: number) => [usd(v), 'Equity']} />
              <Area type="monotone" dataKey="equity" stroke={tc.primary} strokeWidth={1.8} fill="url(#rvEq)" dot={{ fill: tc.primary, r: 2.2 }} activeDot={{ r: 3.5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Biggest Win vs Loss — real trades */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-semibold text-sm text-gray-800 mb-3">Biggest Win vs Biggest Loss</div>
          <div className="grid grid-cols-2 gap-3">
            {([['Biggest Win', adv.bestTrade, '#10b981', 'bg-emerald-50', 'border-emerald-100', 'text-emerald-500'],
               ['Biggest Loss', adv.worstTrade, '#f43f5e', 'bg-red-50', 'border-red-100', 'text-red-400']] as const).map(
              ([label, tr, color, bg, bd, tc]) => (
                <div key={label} className={`${bg} rounded-xl p-3 border ${bd}`}>
                  <div className="text-[10px] text-gray-400 mb-1">{label}</div>
                  <div className="font-bold text-xs text-gray-800">{tr?.asset ?? '—'}</div>
                  <div className={`font-bold ${tc} text-sm`}>{tr ? `${tr.pnl >= 0 ? '+' : ''}${usd(tr.pnl)}` : '—'}</div>
                  <div className="text-[10px] text-gray-400">{tr ? `${tr.r >= 0 ? '+' : ''}${tr.r.toFixed(2)}R` : ''}</div>
                  <div className="text-[9px] text-gray-400 mt-1">{tr ? `${tr.date} · ${tr.session}` : ''}</div>
                  <div className="text-[9px] text-gray-400">{tr ? `${tr.setup} · ${tr.exitReason}` : ''}</div>
                </div>
              ))}
          </div>
          {adv.bestTrade && (
            <div className="mt-3 text-[10px] text-gray-400">
              Best day {adv.bestDay ? usd(adv.bestDay.pnl) : '—'} · Worst day {adv.worstDay ? usd(adv.worstDay.pnl) : '—'}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Best Assets + Negative Habits + Session Review + Psychology */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Best Assets */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Top Profitable Assets</div>
          <div className="mb-3 text-[11px] font-medium text-slate-500">สินทรัพย์ที่ทำเงินดีที่สุด</div>
          <div className="space-y-2">
            {bestAssets.length ? bestAssets.map((a) => (
              <div key={a.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{a.name}</span>
                  <span className="text-emerald-500 font-semibold">{usd(a.pnl)} <span className="text-gray-400">({a.winRate.toFixed(0)}%)</span></span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            )) : <div className="text-xs text-gray-400">ยังไม่มีสินทรัพย์ที่กำไร</div>}
          </div>
        </div>

        {/* Negative Habits */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Top Negative Habits</div>
          <div className="mb-3 text-[11px] font-medium text-slate-500">อารมณ์ลบที่นำไปสู่ดีลขาดทุน</div>
          <div className="space-y-2">
            {negativeHabits.length ? negativeHabits.map((h) => (
              <div key={h.habit}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{h.habit}</span>
                  <span className="font-semibold text-gray-800">{h.count} ดีลขาดทุน</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${h.pctW}%`, background: h.color }} />
                </div>
              </div>
            )) : <div className="text-xs text-gray-400">วินัยอารมณ์ดีมาก</div>}
          </div>
        </div>

        {/* Session Review */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Session Review</div>
          <div className="mb-3 text-[11px] font-medium text-slate-500">Win rate &amp; P&amp;L ตาม Session</div>
          <div className="space-y-2.5">
            {sessionReview.map((s) => (
              <div key={s.session}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-medium text-gray-700">{s.session}</span>
                  <span className="text-gray-400">{s.trades} ดีล · <span className={s.pnl >= 0 ? 'text-emerald-500' : 'text-red-400'}>{usd(s.pnl)}</span></span>
                </div>
                <div className="h-6 rounded-lg flex items-center px-2 text-[10px] font-bold"
                  style={{ background: getWRColor(s.winRate) + '30', color: getWRColor(s.winRate), width: '100%' }}>
                  <div className="h-1.5 rounded-full mr-2 flex-1 bg-white/50">
                    <div className="h-1.5 rounded-full" style={{ width: `${s.winRate}%`, background: getWRColor(s.winRate) }} />
                  </div>
                  {s.winRate.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Psychology Trend */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Psychology Trend</div>
          <div className="mb-2 text-[11px] font-medium text-slate-500">คะแนนจิตวิทยา &amp; วินัยรายเดือน</div>
          <div className="flex gap-3 text-[10px] text-gray-400 mb-2">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-500 inline-block" />Psychology</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-t border-dashed border-gray-400 inline-block" />Discipline</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={psychTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f3ff" />
              <XAxis dataKey="date" tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke={tc.primary} strokeWidth={1.8} dot={{ fill: tc.primary, r: 2 }} activeDot={{ r: 3.5 }} />
              <Line type="monotone" dataKey="mood" stroke={tc.primarySoft} strokeWidth={1.2} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-end gap-1 text-lg font-bold text-purple-700 mt-1">{psych} <Smile size={17} /></div>
        </div>
      </div>

      {/* Row 4: Rule Compliance + Edge/Mistake + Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rule Compliance — derived */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Rule Compliance</div>
          <div className="mb-3 text-[11px] font-medium text-slate-500">วัดจากพฤติกรรมการเทรดจริง</div>
          <div className="space-y-2.5">
            {ruleCompliance.map((r) => (
              <div key={r.rule} className="grid grid-cols-[18px_1fr_auto] items-center gap-2">
                <span className={`flex-shrink-0 ${r.ok ? 'text-emerald-500' : 'text-red-400'}`}>{r.ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}</span>
                <span className="text-[10px] text-gray-600">
                  <span className="font-extrabold text-slate-700">{r.rule}</span>
                  <span className="ml-1 text-slate-400">{r.desc}</span>
                </span>
                <span className={`text-xs font-bold ${r.ok ? 'text-emerald-500' : 'text-red-400'}`}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edge / Mistake cards — derived */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            {[
              bestSetup
                ? { label: 'Best Edge', sub: bestSetup.name, detail: `WR ${bestSetup.winRate.toFixed(0)}% · ${usd(bestSetup.pnl)}`, color: '#10b981', bg: '#d1fae5' }
                : { label: 'Best Edge', sub: '—', detail: 'ยังไม่มีข้อมูล', color: '#10b981', bg: '#d1fae5' },
              adv.worstTrade
                ? { label: 'Main Mistake', sub: adv.worstTrade.emotion, detail: `แพ้ ${usd(adv.worstTrade.pnl)} · ${adv.worstTrade.exitReason}`, color: '#f97316', bg: '#fff7ed' }
                : { label: 'Main Mistake', sub: '—', detail: '', color: '#f97316', bg: '#fff7ed' },
              worstAsset
                ? { label: 'Asset to Watch', sub: worstAsset.name, detail: `WR ${worstAsset.winRate.toFixed(0)}% · ${usd(worstAsset.pnl)}`, color: '#f43f5e', bg: '#fff1f2' }
                : { label: 'Asset to Watch', sub: '—', detail: '', color: '#f43f5e', bg: '#fff1f2' },
              bestSession
                ? { label: 'Session to Focus', sub: bestSession.session, detail: `WR ${bestSession.winRate.toFixed(0)}% · ${usd(bestSession.pnl)}`, color: tc.primary, bg: '#ede9ff' }
                : { label: 'Session to Focus', sub: '—', detail: '', color: tc.primary, bg: '#ede9ff' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl p-3 border" style={{ background: c.bg + '80', borderColor: c.color + '40' }}>
                <div className="text-[9px] font-semibold mb-1" style={{ color: c.color }}>{c.label}</div>
                <div className="text-xs font-bold text-gray-800">{c.sub}</div>
                <div className="text-[9px] text-gray-500 mt-1">{c.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
          <div className="font-extrabold text-[15px] text-[#151a3d] mb-1">Review Recommendation</div>
          <div className="mb-3 text-[11px] font-medium text-slate-500">คำแนะนำจากข้อมูลรอบนี้</div>
          <div className="space-y-3 mb-4">
            {[
              bestSetup ? `โฟกัส Setup “${bestSetup.name}” ที่ทำกำไร ${usd(bestSetup.pnl)} (WR ${bestSetup.winRate.toFixed(0)}%)` : 'สะสมดีลให้มากพอเพื่อหา edge',
              worstAsset && worstAsset.pnl < 0 ? `ลดน้ำหนัก ${worstAsset.name} ที่ขาดทุน ${usd(worstAsset.pnl)}` : 'รักษาวินัยการคุมความเสี่ยงต่อไป',
              bestSession ? `เทรดช่วง ${bestSession.session} ที่สถิติดีที่สุด (WR ${bestSession.winRate.toFixed(0)}%)` : 'เก็บสถิติตาม session เพิ่ม',
            ].map((r, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${tc.primary},${tc.primarySoft})` }}>{i + 1}</div>
                <div className="text-xs text-gray-600">{r}</div>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <div className="text-[10px] text-purple-600 font-semibold mb-1">Coach Insight</div>
            <div className="text-[10px] text-gray-600 italic">
              {kpis.profitFactor >= 1.5
                ? 'Profit Factor แข็งแรง — ขยายขนาดไม้อย่างมีวินัยเพื่อต่อยอด edge'
                : kpis.profitFactor >= 1
                  ? 'ระบบมี edge บวกแล้ว — เน้นความสม่ำเสมอเพื่อยก Profit Factor'
                  : 'ตอนนี้ยังติดลบ — ลดความถี่ คุมความเสี่ยง และโฟกัส setup ที่ได้ผล'}
            </div>
            <div className="text-[10px] text-purple-500 mt-1 font-medium">– Coach Alpha</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={saveWeeklyReview} className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[11px] font-extrabold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5">
              Save Weekly Review
            </button>
            <button onClick={openBacktestPlan} className="rounded-xl border border-purple-100 bg-white px-4 py-2 text-[11px] font-extrabold text-purple-700 transition hover:bg-purple-50">
              Open Backtest Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
