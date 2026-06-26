'use client';

// ─────────────────────────────────────────────────────────────────────────────
// AI Performance Lab — the Analytics tab, now fully LIVE.
//
// Every number, chart and AI insight is derived from the same trade log the
// Data Center edits (via the shared store). Add a trade in Data → it changes the
// grade here. Filter by account → the whole lab re-scopes. Fund-desk styling:
// equity & underwater drawdown, R-multiple distribution, day-of-week edge,
// Sharpe / payoff / recovery / risk-of-ruin, and a deterministic AI coach.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import { useThemeColors } from '@/lib/useThemeColors';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  Brain, Download, Wallet, Sparkles, TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle, ListChecks,
  DollarSign, Target, Scale, Award, Shield, Activity, Flame, Gauge, Coins, Clock, Layers, Repeat,
} from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import {
  type GroupRow, type Trade, ACCOUNTS, EMOTIONS, assetInfo, deriveKpis, deriveEquity, deriveMonthly, groupBy,
} from '@/data/trading-data-mock';
import { useTradingData } from '@/lib/trading/store';
import {
  deriveAdvanced, deriveByDayOfWeek, deriveRDistribution, generateCoaching, type Insight,
} from '@/lib/trading/insights';

// ── format helpers ────────────────────────────────────────────────────────────
const usd = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const rStr = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}R`;

const emotionMeta = Object.fromEntries(EMOTIONS.map((e) => [e.name, e]));
const accountMeta = Object.fromEntries(ACCOUNTS.map((a) => [a.name, a]));
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-first

const GRADE_GRAD: Record<string, string> = {
  'A+': 'linear-gradient(135deg,#0d9488,#10b981)',
  A: 'linear-gradient(135deg,#10b981,#34d399)',
  B: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
  C: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
  D: 'linear-gradient(135deg,#f43f5e,#fb7185)',
};

export default function AnalyticsLive() {
  const tc = useThemeColors();
  const { trades } = useTradingData();
  const [account, setAccount] = useState<string>('all');
  const [toast, setToast] = useState('');

  const scoped = useMemo(
    () => (account === 'all' ? trades : trades.filter((t) => t.account === account)),
    [trades, account],
  );

  const kpis = useMemo(() => deriveKpis(scoped), [scoped]);
  const adv = useMemo(() => deriveAdvanced(scoped), [scoped]);
  const coach = useMemo(() => generateCoaching(scoped), [scoped]);
  const monthly = useMemo(() => deriveMonthly(scoped), [scoped]);
  const byAccount = useMemo(() => groupBy(scoped, 'account'), [scoped]);
  const byAsset = useMemo(() => groupBy(scoped, 'asset'), [scoped]);
  const bySetup = useMemo(() => groupBy(scoped, 'setup'), [scoped]);
  const bySession = useMemo(() => groupBy(scoped, 'session'), [scoped]);
  const byEmotion = useMemo(() => groupBy(scoped, 'emotion'), [scoped]);
  const rDist = useMemo(() => deriveRDistribution(scoped), [scoped]);
  const dow = useMemo(() => {
    const rows = deriveByDayOfWeek(scoped);
    return DOW_ORDER.map((i) => rows[i]).filter((r) => r.trades > 0);
  }, [scoped]);

  // equity + underwater drawdown series
  const equity = useMemo(() => {
    const eq = deriveEquity(scoped);
    let peak = -Infinity;
    return eq.map((p, i) => {
      peak = Math.max(peak, p.equity);
      const ddPct = peak > 0 ? ((p.equity - peak) / peak) * 100 : 0;
      return { i, equity: Math.round(p.equity), dd: +ddPct.toFixed(2) };
    });
  }, [scoped]);

  const netSpark = useMemo(() => {
    let acc = 0;
    return monthly.map((m) => ({ v: (acc += m.pnl) }));
  }, [monthly]);

  function exportReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      scope: account === 'all' ? 'All accounts' : account,
      grade: coach.grade,
      score: coach.score,
      headline: coach.headline,
      kpis,
      advanced: {
        sharpe: +adv.sharpe.toFixed(2), payoff: +adv.payoff.toFixed(2),
        recoveryFactor: +adv.recoveryFactor.toFixed(2), riskOfRuin: +adv.riskOfRuin.toFixed(2),
        consistency: Math.round(adv.consistency), maxWinStreak: adv.maxWinStreak, maxLossStreak: adv.maxLossStreak,
        maxDdUsd: Math.round(adv.maxDdUsd), maxDdPct: +adv.maxDdPct.toFixed(2),
        profitDays: adv.profitDays, lossDays: adv.lossDays, tradingDays: adv.tradingDays,
      },
      coaching: { strengths: coach.strengths, weaknesses: coach.weaknesses, warnings: coach.warnings, actions: coach.actions },
      byAccount, byAsset, bySetup, bySession, byEmotion,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ai-performance-${account === 'all' ? 'all' : account.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    setToast('⬇ Export AI Performance Report แล้ว');
    window.setTimeout(() => setToast(''), 2200);
  }

  const kpiCards = [
    { title: 'Net P&L', value: usd(kpis.netPnl), change: `${usd(kpis.expectancy)} / trade`, positive: kpis.netPnl >= 0, icon: <DollarSign size={14} color="#10b981" />, color: '#10b981', sparkData: netSpark },
    { title: 'Win Rate', value: pct(kpis.winRate), change: `${kpis.wins}W / ${kpis.losses}L`, positive: kpis.winRate >= 50, icon: <Target size={14} color="#f59e0b" />, color: '#f59e0b' },
    { title: 'Profit Factor', value: kpis.profitFactor.toFixed(2), change: kpis.profitFactor >= 1.5 ? 'strong edge' : kpis.profitFactor >= 1 ? 'positive' : 'at risk', positive: kpis.profitFactor >= 1, icon: <Scale size={14} color="#38bdf8" />, color: '#38bdf8' },
    { title: 'Expectancy', value: usd(kpis.expectancy), change: `avg win ${rStr(kpis.avgWin)}`, positive: kpis.expectancy >= 0, icon: <Sparkles size={14} color="#06b6d4" />, color: '#06b6d4' },
    { title: 'Average R', value: rStr(kpis.avgR), change: `avg loss ${rStr(kpis.avgLoss)}`, positive: kpis.avgR >= 0, icon: <Award size={14} color="#a78bfa" />, color: '#a78bfa' },
    { title: 'Max Drawdown', value: pct(kpis.maxDdPct), change: usd(adv.maxDdUsd), positive: false, icon: <Shield size={14} color="#f43f5e" />, color: '#f43f5e' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Action bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 shadow-md">
            <Brain size={18} color="#fff" />
          </span>
          <div>
            <h2 className="text-[15px] font-extrabold leading-tight text-slate-800 dark:text-slate-100">AI Performance Lab</h2>
            <p className="text-[11px] font-medium text-slate-400">วิเคราะห์ระดับกองทุน — derived สดจากทุกเทรดของคุณ</p>
          </div>
        </div>
        <label className="flex items-center gap-1.5 rounded-xl border border-purple-100 bg-white px-2.5 py-2 text-[12px] font-semibold text-slate-600 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-200">
          <Wallet size={13} className="text-purple-500" />
          <select value={account} onChange={(e) => setAccount(e.target.value)} className="bg-transparent outline-none">
            <option value="all">ทุกบัญชี</option>
            {ACCOUNTS.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </label>
        <button onClick={exportReport} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-2 text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* ── AI Coach hero ── */}
      <div className="overflow-hidden rounded-3xl border border-purple-100/70 bg-gradient-to-br from-purple-50 via-white to-violet-50 shadow-sm dark:border-white/10 dark:from-[#1c1d33] dark:via-[#181a2c] dark:to-[#201a37]">
        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[260px_1fr]">
          {/* grade card */}
          <div className="flex flex-col items-center justify-center rounded-2xl p-5 text-white shadow-md" style={{ background: GRADE_GRAD[coach.grade] ?? GRADE_GRAD.C }}>
            <div className="text-[11px] font-bold uppercase tracking-wide text-white/80">Discipline Grade</div>
            <div className="my-1 text-[56px] font-black leading-none drop-shadow">{coach.grade}</div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold">
              <Gauge size={14} /> Score {coach.score}/100
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-white" style={{ width: `${coach.score}%` }} />
            </div>
            <div className="mt-3 grid w-full grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/15 px-2 py-1.5">
                <div className="text-[9px] font-bold text-white/80">CONSISTENCY</div>
                <div className="text-[15px] font-extrabold">{Math.round(adv.consistency)}</div>
              </div>
              <div className="rounded-xl bg-white/15 px-2 py-1.5">
                <div className="text-[9px] font-bold text-white/80">SHARPE</div>
                <div className="text-[15px] font-extrabold">{adv.sharpe.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* coach narrative + insights */}
          <div className="min-w-0">
            <div className="flex items-start gap-2 rounded-2xl border border-purple-100 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-purple-500" />
              <div>
                <div className="text-[12px] font-extrabold text-purple-700 dark:text-purple-300">AI Coach สรุปภาพรวม</div>
                <div className="mt-0.5 text-[12px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">{coach.headline}</div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <InsightColumn title="จุดแข็ง" icon={<CheckCircle2 size={14} className="text-emerald-500" />} items={coach.strengths} empty="ยังไม่พบจุดแข็งเด่น — เก็บสถิติเพิ่ม" />
              <InsightColumn title="จุดอ่อน" icon={<AlertTriangle size={14} className="text-amber-500" />} items={coach.weaknesses} empty="ไม่พบจุดอ่อนชัดเจน 👍" />
              <InsightColumn title="ข้อควรระวัง" icon={<ShieldAlert size={14} className="text-rose-500" />} items={coach.warnings} empty="ความเสี่ยงอยู่ในเกณฑ์ดี ✅" />
            </div>
          </div>
        </div>

        {/* action plan */}
        {coach.actions.length > 0 && (
          <div className="border-t border-purple-100/70 bg-white/60 px-5 py-4 dark:border-white/10 dark:bg-black/10">
            <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-700 dark:text-slate-200">
              <ListChecks size={15} className="text-purple-500" /> Action Plan — สิ่งที่ควรทำต่อ
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {coach.actions.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-purple-100 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-violet-500 text-[10px] font-extrabold text-white">{i + 1}</span>
                  <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      {/* ── Secondary quant tiles ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <QuantTile label="Sharpe (ann.)" value={adv.sharpe.toFixed(2)} hint="ผลตอบแทนต่อความผันผวน" tone={adv.sharpe >= 1.5 ? 'good' : adv.sharpe >= 0.8 ? 'warn' : 'danger'} icon={<Activity size={14} />} />
        <QuantTile label="Payoff Ratio" value={adv.payoff.toFixed(2)} hint="กำไรเฉลี่ย ÷ ขาดทุนเฉลี่ย" tone={adv.payoff >= 1.3 ? 'good' : adv.payoff >= 1 ? 'warn' : 'danger'} icon={<Scale size={14} />} />
        <QuantTile label="Recovery Factor" value={adv.recoveryFactor.toFixed(2)} hint="กำไรสุทธิ ÷ Max DD" tone={adv.recoveryFactor >= 3 ? 'good' : adv.recoveryFactor >= 1.5 ? 'warn' : 'danger'} icon={<TrendingUp size={14} />} />
        <QuantTile label="Risk of Ruin" value={pct(adv.riskOfRuin)} hint="โอกาสเสียพอร์ต (ประเมิน)" tone={adv.riskOfRuin <= 2 ? 'good' : adv.riskOfRuin <= 5 ? 'warn' : 'danger'} icon={<ShieldAlert size={14} />} />
        <QuantTile label="Win Streak สูงสุด" value={`${adv.maxWinStreak} ไม้`} hint={`ปัจจุบัน ${adv.currentStreak > 0 ? `+${adv.currentStreak}` : adv.currentStreak}`} tone="good" icon={<Flame size={14} />} />
        <QuantTile label="Loss Streak สูงสุด" value={`${adv.maxLossStreak} ไม้`} hint="คุมไม่ให้ revenge trade" tone={adv.maxLossStreak >= 4 ? 'danger' : 'warn'} icon={<Repeat size={14} />} />
      </div>

      {/* ── Equity + Underwater drawdown ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-purple-50 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Equity Curve</div>
              <div className="text-[11px] font-medium text-slate-400">เส้นทุนสะสมจากทุกเทรด ({account === 'all' ? 'ทุกบัญชี' : account})</div>
            </div>
            <span className={`text-[12px] font-extrabold ${kpis.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{usd(equity.at(-1)?.equity ?? 0)}</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={equity} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="liveEq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tc.primary} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={tc.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} vertical={false} />
              <XAxis dataKey="i" hide />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [usd(v), 'Equity']} labelFormatter={() => ''} />
              <Area type="monotone" dataKey="equity" stroke={tc.primary} strokeWidth={2} fill="url(#liveEq)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-purple-50 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Underwater Drawdown</div>
              <div className="text-[11px] font-medium text-slate-400">ระยะที่ทุนต่ำกว่าจุดสูงสุด</div>
            </div>
            <span className="text-[12px] font-extrabold text-rose-500">{pct(kpis.maxDdPct)}</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={equity} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="liveDd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.05} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,63,94,0.10)" vertical={false} />
              <XAxis dataKey="i" hide />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Drawdown']} labelFormatter={() => ''} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Area type="monotone" dataKey="dd" stroke="#f43f5e" strokeWidth={1.6} fill="url(#liveDd)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── R distribution + Day of week ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-purple-50 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
          <div className="mb-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">R-Multiple Distribution</div>
          <div className="mb-3 text-[11px] font-medium text-slate-400">รูปร่างของกำไร/ขาดทุน — มองหาหางขวาที่ยาว (let winners run)</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={rDist} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number, n) => [`${v} เทรด`, n === 'wins' ? 'Win' : 'Loss']} cursor={{ fill: tc.cursor }} />
              <Bar dataKey="losses" stackId="r" fill="#fb7185" radius={[0, 0, 0, 0]} maxBarSize={42} />
              <Bar dataKey="wins" stackId="r" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-purple-50 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
          <div className="mb-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">Performance by Day of Week</div>
          <div className="mb-3 text-[11px] font-medium text-slate-400">วันไหนเป็นวันทำเงิน — วันไหนควรเบามือ</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={dow} margin={{ top: 6, right: 6, left: -14, bottom: 0 }} barCategoryGap="24%">
              <CartesianGrid strokeDasharray="3 3" stroke={tc.grid} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number, _n, p) => [`${usd(v)} · ${p?.payload?.trades ?? 0} เทรด · WR ${pct(p?.payload?.winRate ?? 0)}`, 'P&L']} cursor={{ fill: tc.cursor }} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey="pnl" radius={[5, 5, 0, 0]} maxBarSize={46}>
                {dow.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? '#10b981' : '#f43f5e'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Breakdown grid (live) ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MiniGroup title="By Account" icon={<Wallet size={14} className="text-purple-500" />} rows={byAccount} render={(r) => r.name} dot={(r) => accountMeta[r.name]?.color} />
        <MiniGroup title="By Asset" icon={<Coins size={14} className="text-amber-500" />} rows={byAsset} render={(r) => `${assetInfo(r.name).flag} ${r.name}`} />
        <MiniGroup title="By Setup" icon={<Layers size={14} className="text-violet-500" />} rows={bySetup} render={(r) => r.name} />
        <MiniGroup title="By Session" icon={<Clock size={14} className="text-sky-500" />} rows={bySession} render={(r) => r.name} />
        <MiniGroup title="By Emotion" icon={<Brain size={14} className="text-rose-500" />} rows={byEmotion} render={(r) => `${emotionMeta[r.name]?.emoji ?? ''} ${r.name}`} />
      </div>

      {/* ── Best / worst strip ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ExtremeCard kind="best" trade={adv.bestTrade} />
        <ExtremeCard kind="worst" trade={adv.worstTrade} />
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] rounded-2xl bg-slate-900 px-5 py-3 text-[13px] font-bold text-white shadow-xl dark:bg-purple-600">{toast}</div>
      )}
    </div>
  );
}

// ── sub-components ─────────────────────────────────────────────────────────────
const TONE_TEXT: Record<Insight['tone'], string> = {
  good: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/25 dark:bg-emerald-500/10',
  warn: 'border-amber-200 bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/10',
  danger: 'border-rose-200 bg-rose-50/70 dark:border-rose-500/25 dark:bg-rose-500/10',
  info: 'border-sky-200 bg-sky-50/70 dark:border-sky-500/25 dark:bg-sky-500/10',
};

function InsightColumn({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: Insight[]; empty: string }) {
  return (
    <div className="rounded-2xl border border-purple-50 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-700 dark:text-slate-200">{icon}{title}</div>
      <div className="space-y-1.5">
        {items.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 px-2.5 py-2 text-[11px] font-medium text-slate-400 dark:border-white/10">{empty}</div>}
        {items.map((it, i) => (
          <div key={i} className={`rounded-xl border px-2.5 py-1.5 ${TONE_TEXT[it.tone]}`}>
            <div className="text-[11.5px] font-extrabold text-slate-700 dark:text-slate-100">{it.title}</div>
            <div className="text-[10.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">{it.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const QUANT_TONE = {
  good: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-400',
  danger: 'text-rose-500 dark:text-rose-400',
} as const;

function QuantTile({ label, value, hint, tone, icon }: { label: string; value: string; hint: string; tone: keyof typeof QUANT_TONE; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-purple-50 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-[#181a2c]">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
        <span className="text-slate-400">{icon}</span>{label}
      </div>
      <div className={`mt-1 text-[20px] font-extrabold leading-none ${QUANT_TONE[tone]}`}>{value}</div>
      <div className="mt-1 text-[9.5px] font-medium text-slate-400">{hint}</div>
    </div>
  );
}

function MiniGroup({ title, icon, rows, render, dot }: { title: string; icon: React.ReactNode; rows: GroupRow[]; render: (r: GroupRow) => string; dot?: (r: GroupRow) => string | undefined }) {
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
              <span className="w-16 text-right text-[9.5px] font-semibold text-slate-400">{r.trades} · {pct(r.winRate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExtremeCard({ kind, trade }: { kind: 'best' | 'worst'; trade?: Trade }) {
  const good = kind === 'best';
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${good ? 'border-emerald-100 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5' : 'border-rose-100 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/5'}`}>
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-extrabold text-slate-700 dark:text-slate-200">
        {good ? <TrendingUp size={15} className="text-emerald-500" /> : <Shield size={15} className="text-rose-500" />}
        {good ? 'เทรดที่ดีที่สุด' : 'เทรดที่เจ็บที่สุด'}
      </div>
      {trade ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl">{assetInfo(trade.asset).flag}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100">{trade.asset} · {trade.side}</div>
            <div className="truncate text-[10.5px] font-medium text-slate-400">{trade.account} · {trade.setup} · {trade.session} · {trade.date}</div>
          </div>
          <div className="text-right">
            <div className={`text-[16px] font-extrabold ${good ? 'text-emerald-600' : 'text-rose-500'}`}>{usd(trade.pnl)}</div>
            <div className="text-[10px] font-bold text-slate-400">{rStr(trade.r)}</div>
          </div>
        </div>
      ) : (
        <div className="py-3 text-center text-[11px] font-semibold text-slate-400">ยังไม่มีข้อมูล</div>
      )}
    </div>
  );
}
