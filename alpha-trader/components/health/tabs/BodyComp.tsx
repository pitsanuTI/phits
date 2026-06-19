'use client';
import { useState } from 'react';
import { Check, User, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, SectionTitle, Dropdown, ProgressBar } from '../ui';
import { bodyKpis, compositionTrend, compositionBreakdown, measurements, bodyFooter } from '@/data/habit-health-mock';
import IconGlyph from '@/components/IconGlyph';

const KPI_TONE: Record<string, string> = { good: '#16a34a', info: '#3b82f6', warn: '#f59e0b', premium: '#8b5cf6' };

export default function BodyCompTab() {
  const [range, setRange] = useState('All Time');

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {bodyKpis.map((k) => {
          const c = KPI_TONE[k.tone];
          return (
            <Card key={k.label} className="!p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-sm" style={{ background: `${c}1a`, color: c }}><IconGlyph token={k.icon} size={16} color={c} /></span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{k.label}</span>
              </div>
              <div className="mt-2 text-[22px] font-extrabold text-slate-800 dark:text-slate-100">{k.value}<span className="ml-1 text-[12px] font-bold text-slate-400">{k.unit}</span></div>
              <div className="text-[10.5px] font-bold" style={{ color: k.tone === 'warn' ? '#f59e0b' : k.tone === 'premium' ? '#8b5cf6' : k.tone === 'info' ? '#3b82f6' : '#16a34a' }}>{k.note}</div>
            </Card>
          );
        })}
      </div>

      {/* trend + breakdown + goals */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle title="Body Composition Trend" subtitle="Track changes in key body metrics over time." right={<Dropdown value={range} onChange={setRange} options={['All Time','This Year']} />} />
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={compositionTrend} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line dataKey="weight" name="Weight (kg)" type="monotone" stroke="#16a34a" strokeWidth={2.2} dot={{ r: 2 }} />
              <Line dataKey="bodyFat" name="Body Fat (%)" type="monotone" stroke="#f59e0b" strokeWidth={2.2} dot={{ r: 2 }} />
              <Line dataKey="muscle" name="Muscle Mass (kg)" type="monotone" stroke="#8b5cf6" strokeWidth={2.2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="Composition Breakdown" subtitle="Current body composition snapshot." />
          <div className="flex items-center gap-3">
            <div className="relative h-[170px] w-[150px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={compositionBreakdown.filter((d) => d.value > 0)} dataKey="value" innerRadius="62%" outerRadius="92%" paddingAngle={2}>
                    {compositionBreakdown.filter((d) => d.value > 0).map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><div className="text-[18px] font-extrabold text-slate-800 dark:text-slate-100">72.4</div><div className="text-[10px] font-bold text-slate-400">kg</div></div>
            </div>
            <div className="flex-1 space-y-2 text-[11px]">
              {compositionBreakdown.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{d.value ? `${d.value} kg` : '-'}</span>
                  <span className="w-9 text-right font-bold text-slate-400">{d.pct ? `${d.pct}%` : '-'}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] text-slate-400">Values may not add up to 100% due to rounding.</p>
        </Card>

        <Card>
          <SectionTitle title="Goal Progress" subtitle="Track your progress toward your goals." />
          <GoalRow icon="weight" title="Weight Goal" cur="72.4 kg" target="68.0 kg" pct={73} note="â†“ 4.4 kg to go" gradient="from-emerald-500 to-green-400" />
          <div className="my-3" />
          <GoalRow icon="ï¼…" title="Body Fat Goal" cur="18.5 %" target="15.0 %" pct={62} note="â†“ 3.5% to go" gradient="from-amber-500 to-orange-400" />
        </Card>
      </div>

      {/* measurements + photos + recomp */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle title="Measurements" subtitle="Track your body measurements and weekly changes." />
          <table className="w-full text-left">
            <thead><tr className="text-[10px] font-bold uppercase text-slate-400"><th className="pb-2">Measurement</th><th className="pb-2">Current</th><th className="pb-2">Last Week</th><th className="pb-2">Change</th></tr></thead>
            <tbody>
              {measurements.map((m) => {
                const diff = +(m.current - m.last).toFixed(1);
                return (
                  <tr key={m.name} className="border-t border-slate-50 text-[11px] dark:border-white/5">
                    <td className="py-2 font-bold text-slate-700 dark:text-slate-200"><span className="inline-flex items-center gap-1.5"><IconGlyph token={m.icon} size={13} /> {m.name}</span></td>
                    <td className="py-2 text-slate-600 dark:text-slate-300">{m.current.toFixed(1)} cm</td>
                    <td className="py-2 text-slate-400">{m.last.toFixed(1)} cm</td>
                    <td className={`py-2 font-bold ${diff < 0 ? 'text-emerald-500' : diff > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{diff < 0 ? 'â†“' : diff > 0 ? 'â†‘' : 'â€”'} {Math.abs(diff).toFixed(1)} cm</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card>
          <SectionTitle title="Progress Photos" subtitle="Visual progress over time." />
          <div className="grid grid-cols-3 gap-2">
            {['Front','Side','Back'].map((p) => (
              <div key={p} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-center dark:border-white/10 dark:bg-white/5">
                <div className="mx-auto flex h-24 items-center justify-center text-slate-300"><User size={48} /></div>
                <div className="mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">{p}</div>
              </div>
            ))}
          </div>
          <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-300 py-2.5 text-[12px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"><Plus size={14} /> Add New Photos</button>
        </Card>

        <Card>
          <SectionTitle title="Recomposition Insight" subtitle="Your body is moving in the right direction." />
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={18} /></span><div><div className="text-[14px] font-extrabold text-emerald-600">Great Progress!</div><div className="text-[11px] text-slate-500 dark:text-slate-400">You&apos;re building muscle and losing body fat.</div></div></div>
          </div>
          <div className="mt-3 space-y-2">
            {[['heart','Body Fat',"Great job! Your body fat is trending down.",'Down 1.8%'],['strength','Muscle Mass',"Excellent! You're building lean muscle.",'Up 1.3 kg']].map(([ic,t,d,v]) => (
              <div key={t} className="flex items-center gap-2 rounded-xl border border-slate-100 p-2.5 dark:border-white/10">
                <IconGlyph token={String(ic)} size={15} /><div className="min-w-0 flex-1"><div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{t}</div><div className="text-[10px] text-slate-400">{d}</div></div>
                <span className="text-[11px] font-extrabold text-emerald-600">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-emerald-50 py-2 text-center text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/10">Keep it up! Consistency is the key to transformation.</div>
        </Card>
      </div>

      {/* footer metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {bodyFooter.map((f) => (
          <Card key={f.label} className="!p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-sm" style={{ background: `${f.color}1a` }}><IconGlyph token={f.icon} size={16} color={f.color} /></span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{f.label}</span>
            </div>
            <div className="mt-2 text-[18px] font-extrabold text-slate-800 dark:text-slate-100">{f.value} <span className="text-[11px] font-bold text-slate-400">{f.unit}</span></div>
            <div className="text-[10px] font-semibold text-slate-400">{f.note}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function GoalRow({ icon, title, cur, target, pct, note, gradient }: { icon: string; title: string; cur: string; target: string; pct: number; note: string; gradient: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-3 dark:border-white/10">
      <div className="mb-2 flex items-center gap-2 text-[13px] font-extrabold text-slate-700 dark:text-slate-200"><IconGlyph token={icon} size={14} />{title}</div>
      <div className="mb-1 flex justify-between text-[10px] font-bold text-slate-400"><span>Current</span><span>Target</span></div>
      <div className="mb-2 flex justify-between text-[13px] font-extrabold text-slate-700 dark:text-slate-200"><span>{cur}</span><span>{target}</span></div>
      <ProgressBar value={pct} gradient={gradient} />
      <div className="mt-1.5 flex justify-between text-[11px] font-bold"><span className="text-amber-600">{note}</span><span className="text-emerald-600">{pct}%</span></div>
    </div>
  );
}
