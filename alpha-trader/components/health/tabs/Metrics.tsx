'use client';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, SectionTitle, Dropdown, Tag } from '../ui';
import {
  weightTrend30, wellness30, hydrationWeek, sleepWeek, activityWeek, vitals, spark, type Metrics,
} from '@/data/habit-health-mock';
import IconGlyph from '@/components/IconGlyph';

const KPIS = (m: Metrics) => [
  { icon: 'weight', label: 'Current Weight', value: m.weight, unit: 'kg', delta: '↓ 0.6 kg vs yesterday', up: false, from: '#16a34a', to: '#22c55e' },
  { icon: '％', label: 'Body Fat', value: m.bodyFat, unit: '%', delta: '↓ 0.3% vs yesterday', up: false, from: '#0d9488', to: '#2dd4bf' },
  { icon: 'hydration', label: 'Body Water', value: m.bodyWater, unit: '%', delta: '↑ 1.2% vs yesterday', up: true, from: '#2563eb', to: '#3b82f6' },
  { icon: 'sleep', label: 'Sleep Score', value: m.sleepScore, unit: '/100', delta: '↑ 6 pts vs yesterday', up: true, from: '#7c3aed', to: '#a855f7' },
  { icon: 'exercise', label: 'Steps', value: m.steps.toLocaleString(), unit: '', delta: '↑ 12% vs yesterday', up: true, from: '#f59e0b', to: '#fbbf24' },
  { icon: 'heart', label: 'Health Score', value: m.healthScore, unit: '/100', delta: '↑ 4 pts vs yesterday', up: true, from: '#ec4899', to: '#f472b6' },
];

export default function MetricsTab({ metrics }: { metrics: Metrics }) {
  const [r1, setR1] = useState('30 Days');
  const [r2, setR2] = useState('30 Days');

  return (
    <div className="space-y-4">
      {/* Vivid gradient KPI cards (matches reference theme) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPIS(metrics).map((k, i) => (
          <div key={k.label}
            className="vivid-card relative overflow-hidden rounded-[20px] min-h-[116px] p-4 text-white transition-all duration-300 hover:-translate-y-1"
            style={{ background: `linear-gradient(135deg,${k.from},${k.to})`, boxShadow: `0 14px 32px ${k.from}55, inset 0 1px 0 rgba(255,255,255,0.25)` }}>
            {/* sparkles */}
            <span className="spark-dot" style={{ top: 12, right: 14, width: 5, height: 5 }} />
            <span className="spark-dot" style={{ top: 24, right: 28, width: 3, height: 3, opacity: 0.7 }} />
            <span className="spark-dot" style={{ bottom: 30, right: 50, width: 3, height: 3, opacity: 0.55 }} />

            <div className="relative z-10 flex items-center gap-2">
              <span className="icon-frost flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(6px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55)' }}>
                <IconGlyph token={k.icon} size={16} color="#fff" />
              </span>
              <span className="text-[11px] font-bold text-white/90 truncate">{k.label}</span>
            </div>
            <div className="relative z-10 mt-2 text-[22px] font-extrabold text-white drop-shadow-sm"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
              {k.value}<span className="ml-1 text-[12px] font-bold text-white/80">{k.unit}</span>
            </div>
            <div className="relative z-10 text-[10.5px] font-bold text-white/85">{k.delta}</div>
            <div className="relative z-10 mt-1 h-8 opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark(i + 1)} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs><linearGradient id={`mk${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity={0.6} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></linearGradient></defs>
                  <Area dataKey="v" type="monotone" stroke="#fff" strokeWidth={1.8} fill={`url(#mk${i})`} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* trends */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle title="Weight Trend" subtitle="Your weight trend over the last 30 days." right={<Dropdown value={r1} onChange={setR1} options={['30 Days','90 Days']} />} />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weightTrend30} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs><linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity={0.22} /><stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={[68, 76]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v} kg`, 'Weight']} />
              <Area dataKey="value" type="monotone" stroke="#16a34a" strokeWidth={2.2} fill="url(#wt)" dot={{ r: 2, fill: '#16a34a' }} />
            </AreaChart>
          </ResponsiveContainer>
          <ThreeStat a={['74.3 kg', '30-day high']} b={['71.8 kg', '30-day low']} c={['↓ 1.9 kg', '30-day change']} />
        </Card>

        <Card>
          <SectionTitle title="Daily Wellness Score" subtitle="Overall wellness score based on key health metrics." right={<Dropdown value={r2} onChange={setR2} options={['30 Days','90 Days']} />} />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={wellness30} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
              <defs><linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area dataKey="value" type="monotone" stroke="#3b82f6" strokeWidth={2.2} fill="url(#wl)" dot={{ r: 2, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
          <ThreeStat a={['87', '30-day high']} b={['68', '30-day low']} c={['↑ 7 pts', '30-day change']} />
        </Card>

        <Card>
          <SectionTitle title="Hydration & Sleep" subtitle="Daily averages from the last 7 days." />
          <MiniBar label="Hydration" big="2.1 L / 2.5 L" sub="84% of daily goal" icon="hydration" data={hydrationWeek} color="#3b82f6" goal={2.5} />
          <div className="my-3 border-t border-slate-100 dark:border-white/10" />
          <MiniBar label="Sleep" big="7 h 15 m" sub="Good · 82 avg score" icon="sleep" data={sleepWeek} color="#8b5cf6" goal={8} />
        </Card>
      </div>

      {/* activity + vitals + checkin */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle title="Weekly Activity" subtitle="Steps and active minutes over the past 7 days." />
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={activityWeek} margin={{ top: 8, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar yAxisId="l" dataKey="steps" name="Steps" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={14} />
              <Bar yAxisId="r" dataKey="mins" name="Active Minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <ThreeStat a={['59,432', 'Total Steps']} b={['612', 'Total Active Minutes']} c={['+ 18%', 'vs last 7 days']} />
        </Card>

        <Card>
          <SectionTitle title="Vitals & Recovery" subtitle="Key indicators of your daily recovery and well-being." />
          <div className="space-y-2">
            {vitals.map((v) => (
              <div key={v.label} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/10">
                <span className="flex items-center gap-2 text-[12px] font-bold text-slate-600 dark:text-slate-300"><IconGlyph token={v.icon} size={14} />{v.label}</span>
                <div className="flex items-center gap-2"><span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-100">{v.value}</span><Tag tone={v.tone as 'good' | 'info'}>{v.tag}</Tag><ChevronRight size={13} className="text-slate-300" /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Daily Health Check-in" subtitle="Today's logged values" />
          <div className="grid grid-cols-2 gap-2">
            {[['weight','Weight',`${metrics.weight} kg`],['chart','BMI',`${metrics.bmi}`],['chart','Body Fat',`${metrics.bodyFat} %`],['hydration','Water Intake',`${metrics.hydration} L / ${metrics.hydrationGoal} L`],['strength','Muscle Mass',`${metrics.muscle} kg`],['mood','Mood',metrics.mood],['hydration','Body Water',`${metrics.bodyWater} %`]].map(([ic,l,v]) => (
              <div key={l} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-white/10">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400"><IconGlyph token={String(ic)} size={12} /> {l}</span>
                <span className="text-[12px] font-extrabold text-slate-800 dark:text-slate-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/10"><IconGlyph token="✓" size={13} /> All metrics logged today at 08:30 AM</div>
        </Card>
      </div>
    </div>
  );
}

function ThreeStat({ a, b, c }: { a: string[]; b: string[]; c: string[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[a, b, c].map((s, i) => (
        <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 px-2 py-2 text-center dark:border-white/10 dark:bg-white/5">
          <div className={`text-[13px] font-extrabold ${i === 2 ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>{s[0]}</div>
          <div className="text-[9px] font-semibold text-slate-400">{s[1]}</div>
        </div>
      ))}
    </div>
  );
}

function MiniBar({ label, big, sub, icon, data, color, goal }: { label: string; big: string; sub: string; icon: string; data: { day: string; value: number }[]; color: string; goal: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: `${color}1a` }}><IconGlyph token={icon} size={18} color={color} /></span>
      <div className="flex-shrink-0">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100">{big}</div>
        <div className="text-[10px] font-semibold text-slate-400">{sub}</div>
      </div>
      <div className="h-12 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <YAxis domain={[0, goal]} hide />
            <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} maxBarSize={10} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
