'use client';
import { CalendarDays, Clock, TrendingUp, Trophy, ShieldAlert, HeartPulse, ChevronRight, Target } from 'lucide-react';
import { Card, SectionTitle, ProgressBar } from '../ui';
import {
  insightTopCards, insightCorrelations, insightTimeline, insightRecommendations,
  bestTimeBars, bestDayBars, improvedMetrics, focusAreas, type Habit,
} from '@/data/habit-health-mock';
import IconGlyph from '@/components/IconGlyph';

const LEVEL_TONE: Record<string, string> = {
  good: 'bg-emerald-100 text-emerald-700',
  warn: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-600',
  info: 'bg-blue-100 text-blue-700',
  premium: 'bg-violet-100 text-violet-700',
};

export default function InsightsTab({ habits }: { habits: Habit[] }) {
  const spark = insightTopCards.scoreTrend.spark;
  return (
    <div className="space-y-4">
      {/* â”€â”€ 4 gradient summary cards â”€â”€ */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Habit Score Trend */}
        <GradCard from="#16a34a" to="#34d399">
          <CardHead label="Habit Score Trend" icon={<TrendingUp size={17} />} />
          <div className="mt-1 text-[30px] font-extrabold leading-none">{insightTopCards.scoreTrend.delta} <span className="text-[14px] font-bold text-white/85">pts</span></div>
          <div className="text-[11px] font-semibold text-white/80">{insightTopCards.scoreTrend.from} â†’ {insightTopCards.scoreTrend.to} this month</div>
          {/* soft line graphic */}
          <svg viewBox="0 0 160 44" className="mt-2 h-11 w-full">
            <polyline fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              points={spark.map((v, i) => `${(i / (spark.length - 1)) * 160},${44 - ((v - 76) / 16) * 40}`).join(' ')} />
            {spark.map((v, i) => <circle key={i} cx={(i / (spark.length - 1)) * 160} cy={44 - ((v - 76) / 16) * 40} r="2" fill="#fff" />)}
          </svg>
        </GradCard>

        {/* Best Habit */}
        <GradCard from="#f59e0b" to="#fb923c">
          <CardHead label="Best Habit" icon={<Trophy size={17} />} />
          <div className="mt-1 text-[24px] font-extrabold leading-tight">Drink Water</div>
          <div className="text-[11px] font-bold text-white/85">95% completion</div>
          <div className="mt-1 text-[11px] font-semibold text-white/75">Strongly supports hydration &amp; energy</div>
          {/* water-drop soft graphic */}
          <div className="pointer-events-none absolute bottom-2 right-3 flex items-end gap-1 opacity-90">
            <span className="block h-6 w-6 rounded-full rounded-tr-none bg-white/30 rotate-45" />
            <span className="block h-4 w-4 rounded-full rounded-tr-none bg-white/40 rotate-45" />
          </div>
        </GradCard>

        {/* Risk Habit */}
        <GradCard from="#ef4444" to="#fb7185">
          <CardHead label="Risk Habit" icon={<ShieldAlert size={17} />} />
          <div className="mt-1 text-[24px] font-extrabold leading-tight">No Sugar</div>
          <div className="text-[11px] font-bold text-white/85">45% completion</div>
          <div className="mt-1 text-[11px] font-semibold text-white/75">Inconsistentâ€”with late-night cravings</div>
          {/* sugar cubes soft graphic */}
          <div className="pointer-events-none absolute bottom-2 right-3 flex items-end gap-1">
            <span className="block h-5 w-5 rounded-md bg-white/35 rotate-6" />
            <span className="block h-7 w-7 rounded-md bg-white/30 -rotate-6" />
            <span className="block h-4 w-4 rounded-md bg-white/40 rotate-12" />
          </div>
        </GradCard>

        {/* Correlation Score */}
        <GradCard from="#7c3aed" to="#a855f7">
          <CardHead label="Correlation Score" icon={<HeartPulse size={17} />} />
          <div className="mt-1 text-[26px] font-extrabold leading-none">0.72 <span className="text-[13px] font-bold text-white/85">Strong</span></div>
          <div className="mt-1 text-[11px] font-semibold text-white/75">Overall habit â†” health correlation</div>
          {/* bar soft graphic */}
          <div className="pointer-events-none absolute bottom-2.5 right-3 flex items-end gap-[3px]">
            {[5, 8, 6, 10, 7, 12, 9, 14].map((h, i) => <span key={i} className="block w-1.5 rounded-sm bg-white/45" style={{ height: h }} />)}
          </div>
        </GradCard>
      </div>

      {/* â”€â”€ Row 2: correlations / timeline / recommendations â”€â”€ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Correlations table */}
        <Card>
          <SectionTitle title="Habit vs Health Correlations" subtitle="How your habits impact key health metrics." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-left">
              <thead>
                <tr className="text-[9.5px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="pb-2">Habit</th><th className="pb-2">Most Impacted Metric</th><th className="pb-2">Corr.</th><th className="pb-2">Impact</th><th className="pb-2">Strength</th><th className="pb-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {insightCorrelations.map((c) => (
                  <tr key={c.habit} className="border-t border-slate-50 text-[11px] dark:border-white/5">
                    <td className="py-2.5"><div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200"><IconGlyph token={c.icon} size={13} />{c.habit}</div><div className="pl-5 text-[9px] text-slate-400">Daily average</div></td>
                    <td className="py-2.5"><div className="font-bold text-slate-700 dark:text-slate-200">{c.metric}</div><div className="text-[9px] text-emerald-500">{c.metricNote}</div></td>
                    <td className="py-2.5 font-extrabold text-slate-700 dark:text-slate-200">{c.r.toFixed(2)}</td>
                    <td className={`py-2.5 font-bold ${c.dir === 'Positive' ? 'text-emerald-500' : 'text-rose-500'}`}>{c.dir === 'Positive' ? 'â†‘' : 'â†“'} {c.dir}</td>
                    <td className="py-2.5 font-semibold text-slate-500">{c.strength}</td>
                    <td className="py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${LEVEL_TONE[c.levelTone]}`}>{c.level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[10px] text-slate-400">Correlation range: -1.0 (inversed) to +1.0 (direct)</p>
        </Card>

        {/* Weekly timeline */}
        <Card>
          <SectionTitle title="Weekly Insight Timeline" subtitle="Key events and achievements from this week." />
          <div className="relative pl-2">
            <div className="absolute bottom-2 left-[15px] top-2 w-px bg-slate-100 dark:bg-white/10" />
            {insightTimeline.map((t) => (
              <div key={t.day} className="relative mb-3 flex items-start gap-3 last:mb-0">
                <span className="z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100 dark:bg-[#14162a] dark:ring-white/10"><IconGlyph token={t.icon} size={13} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400">{t.day}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${LEVEL_TONE[t.tone]}`}>{t.tag}</span>
                  </div>
                  <div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{t.title}</div>
                  <div className="text-[10.5px] text-slate-400">{t.note}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-[10.5px] font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400"><IconGlyph token="growth" size={12} /> Keep building momentum with small daily wins.</div>
        </Card>

        {/* Recommendation engine */}
        <Card className="!bg-gradient-to-b !from-rose-50/40 !to-white dark:!from-rose-500/5 dark:!to-[#181a2c]">
          <SectionTitle title="Recommendation Engine" subtitle="AI-powered insights to help you level up." />
          <div className="space-y-2">
            {insightRecommendations.map((r) => (
              <div key={r.n} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 dark:border-white/10 dark:bg-[#14162a]">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white" style={{ background: r.color }}>{r.n}</span>
                <IconGlyph token={r.icon} size={14} />
                <div className="min-w-0 flex-1"><div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{r.title}</div><div className="text-[10px] text-slate-400">{r.note}</div></div>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${LEVEL_TONE[r.tone]}`}>{r.tag}</span>
                <ChevronRight size={14} className="flex-shrink-0 text-slate-300" />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[12px] font-extrabold text-slate-700 dark:text-slate-200">Next Best Action</div>
            <button className="mt-1.5 flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-left dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Target size={17} /></span>
              <div className="min-w-0 flex-1"><div className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300">Do 15 minutes of mobility work this morning.</div><div className="text-[10px] text-slate-500 dark:text-slate-400">Based on your patterns, this will boost mood and energy.</div></div>
              <ChevronRight size={16} className="flex-shrink-0 text-emerald-500" />
            </button>
          </div>
        </Card>
      </div>

      {/* â”€â”€ Row 3: best time/day Â· improved Â· focus â”€â”€ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Best Time & Best Day */}
        <GradPanel from="#2563eb" to="#3b82f6" title="Best Time & Best Day" subtitle="When you perform your best.">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/85"><Clock size={13} /> Best Time</div>
              <div className="mt-1 text-[20px] font-extrabold">8:00 AM</div>
              <div className="text-[10px] text-white/75">Highest habit completion</div>
              <div className="mt-2 flex h-10 items-end gap-[2px]">
                {bestTimeBars.map((b) => <span key={b.i} className="flex-1 rounded-sm" style={{ height: `${(b.v / 12) * 100}%`, background: b.peak ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}
              </div>
              <div className="mt-1 flex justify-between text-[8px] text-white/60"><span>12AM</span><span>4AM</span><span>8AM</span><span>12PM</span><span>4PM</span></div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/85"><CalendarDays size={13} /> Best Day</div>
              <div className="mt-1 text-[20px] font-extrabold">Sunday</div>
              <div className="text-[10px] text-white/75">Highest avg completion</div>
              <div className="mt-2 flex h-10 items-end gap-1">
                {bestDayBars.map((b, i) => <span key={i} className="flex-1 rounded-sm" style={{ height: `${(b.v / 12) * 100}%`, background: b.peak ? '#fff' : 'rgba(255,255,255,0.4)' }} />)}
              </div>
              <div className="mt-1 flex justify-between text-[8px] text-white/60">{bestDayBars.map((b, i) => <span key={i}>{b.d}</span>)}</div>
            </div>
          </div>
        </GradPanel>

        {/* What Improved */}
        <GradPanel from="#f59e0b" to="#fbbf24" title="What Improved This Month" subtitle="Top health metrics that improved.">
          <div className="space-y-3">
            {improvedMetrics.map((m) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between text-[11px] font-bold"><span className="flex items-center gap-1.5 text-white/90"><IconGlyph token={m.icon} size={13} color="rgba(255,255,255,0.92)" />{m.label}</span><span className="text-white">{m.value}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-white/25"><div className="h-full rounded-full bg-white/90" style={{ width: `${m.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </GradPanel>

        {/* Focus Areas */}
        <GradPanel from="#3b82f6" to="#60a5fa" title="Focus Areas" subtitle="What needs your attention.">
          <div className="space-y-2">
            {focusAreas.map((f) => (
              <div key={f.title} className="flex items-center gap-2.5 rounded-2xl bg-white/15 p-3">
                <IconGlyph token={f.icon} size={14} color="white" />
                <div className="min-w-0 flex-1"><div className="text-[12px] font-bold text-white">{f.title}</div><div className="text-[10px] text-white/75">{f.note}</div></div>
                <span className="flex-shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold text-white">{f.tag}</span>
                <ChevronRight size={14} className="flex-shrink-0 text-white/70" />
              </div>
            ))}
          </div>
        </GradPanel>
      </div>
    </div>
  );
}

/* â”€â”€ small gradient summary card (top row) â”€â”€ */
function GradCard({ from, to, children }: { from: string; to: string; children: React.ReactNode }) {
  return (
    <div className="vivid-card relative min-h-[140px] overflow-hidden rounded-2xl p-4 text-white" style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 14px 32px ${from}55` }}>
      <span className="spark-dot" style={{ top: 14, right: 44, width: 6, height: 6 }} />
      <span className="spark-dot" style={{ top: 26, right: 60, width: 4, height: 4, opacity: 0.7 }} />
      {children}
    </div>
  );
}
function CardHead({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-[12px] font-bold text-white/85">{label}</span>
      <span className="icon-frost flex h-9 w-9 items-center justify-center rounded-xl bg-white/25">{icon}</span>
    </div>
  );
}

/* â”€â”€ large gradient panel (bottom row) â”€â”€ */
function GradPanel({ from, to, title, subtitle, children }: { from: string; to: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="vivid-card relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg,${from},${to})`, boxShadow: `0 14px 32px ${from}44` }}>
      <span className="spark-dot" style={{ top: 16, right: 20, width: 7, height: 7 }} />
      <h3 className="text-[15px] font-extrabold">{title}</h3>
      <p className="mb-3 text-[11px] font-medium text-white/80">{subtitle}</p>
      {children}
    </div>
  );
}
