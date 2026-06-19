'use client';
import { Star, Flame, Activity, Heart, Bell, ChevronLeft, ChevronRight, Trophy, AlertTriangle, Clock, BedDouble, TrendingUp, CalendarDays } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, SectionTitle } from '../ui';
import { heatLevel, LEVEL_COLORS, LEVEL_LABELS, weeklyCompletion, keyInsights, reminders, type Habit, type Metrics } from '@/data/habit-health-mock';
import IconGlyph from '@/components/IconGlyph';

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const GRADS = [
  { from: '#16a34a', to: '#22c55e', label: 'Habit Score', value: '78/100', note: 'Weekly behavior quality', icon: Star },
  { from: '#f97316', to: '#fb923c', label: 'Current Streak', value: '12 days', note: 'Keep the chain alive', icon: Flame },
  { from: '#2563eb', to: '#3b82f6', label: 'Completion Rate', value: '84%', note: 'This month', icon: Activity },
  { from: '#7c3aed', to: '#8b5cf6', label: 'Health Score', value: '81/100', note: 'Body and wellness status', icon: Heart },
];

export default function OverviewTab({ habits, metrics }: { habits: Habit[]; metrics: Metrics }) {
  const heatHabits = habits.slice(0, 6);
  return (
    <div className="space-y-4">
      {/* gradient KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {GRADS.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.label} className="vivid-card relative overflow-hidden rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg,${g.from},${g.to})`, boxShadow: `0 14px 32px ${g.from}55` }}>
              <span className="spark-dot" style={{ top: 16, right: 18, width: 6, height: 6 }} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12px] font-bold text-white/85">{g.label}</div>
                  <div className="mt-1 text-[30px] font-extrabold leading-none">{g.value}</div>
                  <div className="mt-2 text-[11px] font-semibold text-white/80">{g.note}</div>
                </div>
                <span className="icon-frost flex h-10 w-10 items-center justify-center rounded-xl bg-white/25"><Icon size={18} /></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* heatmap + reminders */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Habit Heatmap" subtitle="Daily overview of your habits this month."
            right={<span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 dark:border-white/10"><CalendarDays size={12} /> Jun 2026</span>} />
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="mb-1 grid" style={{ gridTemplateColumns: '120px repeat(31, 1fr)' }}>
                <div />{DAYS.map((d) => <div key={d} className="text-center text-[8px] font-bold text-slate-400">{d}</div>)}
              </div>
              {heatHabits.map((h, hi) => (
                <div key={h.id} className="mb-1 grid items-center" style={{ gridTemplateColumns: '120px repeat(31, 1fr)' }}>
                  <div className="truncate pr-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{h.name}</div>
                  {DAYS.map((d) => { const lvl = heatLevel(hi, d, 7); return <div key={d} className="mx-[1px] aspect-square rounded-[3px]" style={{ background: LEVEL_COLORS[lvl], border: lvl === 0 ? '1px solid #e2e8f0' : 'none' }} />; })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-400">
            {LEVEL_LABELS.map((l, i) => <span key={l} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: LEVEL_COLORS[i], border: i === 0 ? '1px solid #e2e8f0' : 'none' }} />{l}</span>)}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Upcoming Reminders" subtitle="Today's upcoming habit nudges" info={false} right={<Bell size={16} className="text-emerald-500" />} />
          <div className="space-y-1">
            {reminders.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="flex items-center gap-2.5 text-[12px] font-bold text-slate-600 dark:text-slate-300"><IconGlyph token={r.icon} size={14} />{r.name}</span>
                <span className="text-[11px] font-extrabold text-slate-400">{r.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* checkin + trend + insights */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle title="Today Quick Check-in" subtitle="Your health snapshot for today" info={false} />
          <div className="grid grid-cols-4 gap-2">
            {[['weight','Weight',`${metrics.weight} kg`],['chart','Body Fat',`${metrics.bodyFat} %`],['hydration','Body Water',`${metrics.bodyWater} %`],['sleep','Sleep',`${metrics.sleepHours} hrs`],['exercise','Steps',metrics.steps.toLocaleString()],['hydration','Hydration',`${metrics.hydration} L`],['mood','Mood',metrics.mood],['energy','Energy',metrics.energy]].map(([ic,l,v]) => (
              <div key={l} className="rounded-xl border border-slate-100 p-2 dark:border-white/10"><div className="flex items-center gap-1 text-[9px] font-bold text-slate-400"><IconGlyph token={String(ic)} size={11} /> {l}</div><div className="mt-0.5 text-[12px] font-extrabold text-slate-800 dark:text-slate-100">{v}</div></div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 text-[10px] font-bold text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span className="inline-flex items-center gap-1"><IconGlyph token="chart" size={12} /> BMI {metrics.bmi}</span><span className="inline-flex items-center gap-1"><IconGlyph token="strength" size={12} /> Muscle {metrics.muscle} kg</span><span className="inline-flex items-center gap-1"><IconGlyph token="heart" size={12} /> Visceral {metrics.visceralFat}</span><span className="inline-flex items-center gap-1"><IconGlyph token="momentum" size={12} /> BMR {metrics.bmr} kcal</span>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Weekly Habit Trend" subtitle="Completion rate and total completions this week" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold"><span className="text-slate-500">Completion Rate (%)</span><span className="rounded bg-emerald-50 px-1.5 text-emerald-600 dark:bg-emerald-500/15">84% Avg</span></div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weeklyCompletion} margin={{ top: 6, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} /><Tooltip />
                  <Line dataKey="rate" type="monotone" stroke="#16a34a" strokeWidth={2.2} dot={{ r: 2.5, fill: '#16a34a' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold"><span className="text-slate-500">Total Completions</span><span className="rounded bg-blue-50 px-1.5 text-blue-600 dark:bg-blue-500/15">126 Total</span></div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={weeklyCompletion} margin={{ top: 6, right: 4, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} /><Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Key Insights" subtitle="" info />
          <div className="grid grid-cols-2 gap-2">
            {keyInsights.map((k) => (
              <div key={k.label} className="rounded-xl border border-slate-100 p-2.5 dark:border-white/10">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><IconGlyph token={k.icon} size={12} />{k.label}</div>
                <div className="mt-0.5 text-[12px] font-extrabold text-slate-800 dark:text-slate-100">{k.value}</div>
                <div className="text-[10px] font-semibold text-slate-400">{k.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-600"><TrendingUp size={13} /> Recommendation</div>
            <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">Great consistency! Try adding 15 minutes of mobility work after your morning exercise.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function IconBtn({ children }: { children: React.ReactNode }) {
  return <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-white/10">{children}</button>;
}
