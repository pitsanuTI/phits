'use client';
import { useState } from 'react';
import { CheckCircle2, Circle, Play, BarChart2, Flame, Trophy, ArrowRight, Pencil, CheckCircle, X, TrendingUp, Calendar, Target, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, SectionTitle, ProgressBar, Dropdown, Tag } from '../ui';
import { habitStatus, STATUS_TEXT, weeklyCompletion, streak, streakCalendar, LEVEL_COLORS, heatLevel, type Habit, type Metrics } from '@/data/habit-health-mock';
import IconGlyph from '@/components/IconGlyph';
import { useEscClose } from '@/lib/useEscClose';

/* ── Generate 14-day history for a habit from mock data ── */
function generateHistory(habitIndex: number) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return days.map((day, i) => {
    const lvl = heatLevel(habitIndex, i + 1, 14);
    const pct = [0, 40, 70, 100, 110][lvl];
    return { day: `${day} W${Math.floor(i / 7) + 1}`, pct, status: ['No Data','Missed','Partial','Completed','Perfect'][lvl], lvl };
  });
}

interface Props {
  habits: Habit[];
  metrics: Metrics;
  toggleHabit: (id: string) => void;
  setHabitValue: (id: string, v: number) => void;
  onCheckin: () => void;
  onAddHabit: () => void;
}

export default function ChecklistTab({ habits, metrics, toggleHabit, setHabitValue, onCheckin, onAddHabit }: Props) {
  const [range, setRange] = useState('This Week');
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);

  const completed = habits.filter((h) => h.value >= h.goal).length;
  const pct = Math.round((completed / habits.length) * 100);
  const overdue = habits.filter((h) => h.value <= 0).slice(0, 1);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Left — checklist */}
        <Card>
          <SectionTitle title="Today Habit Checklist" subtitle="Your daily habits and targets" info={false}
            right={
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">{habits.length} habits</span>
                <button
                  onClick={onAddHabit}
                  className="flex items-center gap-1 rounded-lg bg-purple-100 px-2 py-1 text-[11px] font-extrabold text-purple-700 hover:bg-purple-200 dark:bg-purple-500/15 dark:text-purple-300"
                >
                  <Plus size={11} /> Add
                </button>
              </div>
            }
          />
          <div className="space-y-2">
            {habits.map((h) => {
              const st = habitStatus(h);
              const done = h.value >= h.goal;
              const hi = habits.indexOf(h);
              return (
                <div key={h.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/10">
                  <button onClick={() => toggleHabit(h.id)} className="flex-shrink-0">
                    {done ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} className="text-slate-300" />}
                  </button>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5">
                    <IconGlyph token={h.icon} size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13px] font-bold text-slate-800 dark:text-slate-100 ${done ? 'line-through opacity-60' : ''}`}>{h.name}</div>
                    <div className="text-[11px] text-slate-400">{h.value} / {h.goal} {h.unit}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${STATUS_TEXT[st]}`}>{st}</span>
                  <button
                    onClick={() => setHabitValue(h.id, h.value + Math.max(1, Math.round(h.goal / 4)))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 dark:border-white/10"
                    title="Log progress"
                  >
                    <Play size={12} />
                  </button>
                  <button
                    onClick={() => setHistoryHabit(h)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-purple-300 hover:text-purple-500 dark:border-white/10"
                    title="View activity history"
                  >
                    <BarChart2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-white/5">
            <div className="mb-1 flex items-center justify-between text-[12px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300"><Trophy size={14} className="text-amber-500" /> {completed} of {habits.length} habits completed</span>
              <span className="text-emerald-600">{pct}%</span>
            </div>
            <ProgressBar value={pct} />
          </div>
        </Card>

        {/* Middle — streak + check-in */}
        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-500/15"><Flame size={18} /></div>
                <div>
                  <div className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">Streak Power</div>
                  <div className="text-[11px] text-slate-400">Keep the momentum going!</div>
                </div>
              </div>
              <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 dark:border-white/10">View History</button>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-[44px] font-extrabold leading-none text-emerald-600">{streak.current} <span className="text-[16px] font-bold text-slate-400">days</span></div>
              <span className="flex items-center gap-1 text-[12px] font-bold text-slate-500"><Trophy size={13} className="text-amber-500" /> Best: {streak.best} days</span>
            </div>
            <div className="mt-3 mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>{streak.current} days toward a 30-day streak</span><span>{streak.progress}%</span>
            </div>
            <ProgressBar value={streak.progress} />
            <div className="mt-4 text-[12px] font-bold text-slate-600 dark:text-slate-300">Your Streak Calendar</div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <div key={d} className="text-center text-[10px] font-bold text-slate-400">{d}</div>)}
              {streakCalendar.map((lvl, i) => <div key={i} className="aspect-square rounded-md" style={{ background: LEVEL_COLORS[lvl] }} />)}
            </div>
            <Legend />
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15"><IconGlyph token="heart" size={16} color="#059669" /></div>
              <div>
                <div className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">Today Health Check-in</div>
                <div className="text-[11px] text-slate-400">Quick daily check-in to track your health</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['weight','Weight',`${metrics.weight} kg`],
                ['sleep','Sleep',`${metrics.sleepHours} hrs`],
                ['hydration','Water',`${metrics.hydration * 1000} ml`],
                ['mood','Mood',metrics.mood],
                ['energy','Energy',metrics.energy],
                ['notes','Notes','Add note'],
              ].map(([ic,l,v]) => (
                <div key={l} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><IconGlyph token={ic} size={11} /> {l}</div>
                  <div className="mt-0.5 text-[13px] font-extrabold text-slate-800 dark:text-slate-100">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-slate-400"><CheckCircle size={12} className="text-emerald-500" /> Checked in 08:45 AM</span>
              <button onClick={onCheckin} className="flex items-center gap-1 text-emerald-600"><Pencil size={11} /> Edit Check-in</button>
            </div>
          </Card>
        </div>

        {/* Right — trends + overdue */}
        <div className="flex flex-col gap-4">
          <Card>
            <SectionTitle title="Habit Trends" subtitle="Track your progress over time" info={false}
              right={<Dropdown value={range} onChange={setRange} options={['This Week','This Month']} />} />
            <div className="text-[11px] font-bold text-slate-500">Completion Rate (%)</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weeklyCompletion} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line dataKey="rate" type="monotone" stroke="#16a34a" strokeWidth={2.4} dot={{ r: 3, fill: '#16a34a' }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 text-[11px] font-bold text-slate-500">Total Completions</div>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={weeklyCompletion} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <SectionTitle title="Overdue & Upcoming" subtitle="Stay on top of what matters" info={false}
              right={<button className="text-[11px] font-bold text-emerald-600">View All</button>} />
            {overdue.length > 0 && (
              <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50/70 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
                <div className="mb-1 flex items-center justify-between text-[11px] font-bold"><span className="text-rose-500">Overdue</span><span className="text-rose-400">{overdue.length} habit</span></div>
                {overdue.map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><IconGlyph token={h.icon} size={14} /><div><div className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{h.name}</div><div className="text-[10px] text-rose-400">Overdue by 8 hours</div></div></div>
                    <button onClick={() => toggleHabit(h.id)} className="rounded-lg bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white">Start Now</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mb-1 flex items-center justify-between text-[11px] font-bold"><span className="text-slate-600 dark:text-slate-300">Upcoming Reminders</span><span className="text-slate-400">3 today</span></div>
            {[
              ['meditation','Meditation','09:00 AM'],
              ['hydration','Drink Water','12:30 PM'],
              ['learning','Read Book','03:00 PM'],
            ].map(([ic,n,t]) => (
              <div key={n} className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300"><IconGlyph token={ic} size={14} />{n}</span>
                <span className="text-[11px] font-bold text-slate-400">{t}</span>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
              <div><div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Suggested Next Action</div><div className="text-[11px] text-slate-500 dark:text-slate-400">Take a 10-minute walk to boost your daily activity streak.</div></div>
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><ArrowRight size={14} /></div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Habit History Modal ── */}
      <HabitHistoryModal habit={historyHabit} habits={habits} onClose={() => setHistoryHabit(null)} />
    </>
  );
}

/* ── Habit History Modal ── */
function HabitHistoryModal({ habit, habits, onClose }: { habit: Habit | null; habits: Habit[]; onClose: () => void }) {
  useEscClose(onClose, !!habit);
  if (!habit) return null;

  const hi = habits.indexOf(habit);
  const history = generateHistory(hi);
  const completedDays = history.filter((d) => d.lvl >= 3).length;
  const perfectDays   = history.filter((d) => d.lvl === 4).length;
  const missedDays    = history.filter((d) => d.lvl === 1).length;
  const avgPct        = Math.round(history.filter((d) => d.lvl > 0).reduce((s, d) => s + d.pct, 0) / Math.max(1, history.filter((d) => d.lvl > 0).length));

  // streak calc
  let streak = 0, bestStreak = 0, cur = 0;
  for (const d of [...history].reverse()) {
    if (d.lvl >= 3) { cur++; bestStreak = Math.max(bestStreak, cur); }
    else cur = 0;
  }
  for (const d of history) { if (d.lvl >= 3) streak++; else streak = 0; }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative z-10 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <IconGlyph token={habit.icon} size={20} color="#fff" />
              </div>
              <div>
                <div className="text-[16px] font-extrabold">{habit.name}</div>
                <div className="text-[11px] text-white/75">Activity history · Last 14 days</div>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Target size={14} />,    label: 'Goal',          value: `${habit.goal} ${habit.unit}`,  color: '#7c3aed' },
                { icon: <CheckCircle2 size={14} />, label: 'Completed',  value: `${completedDays} days`,       color: '#16a34a' },
                { icon: <TrendingUp size={14} />, label: 'Avg Progress', value: `${avgPct}%`,                  color: '#3b82f6' },
                { icon: <Flame size={14} />,      label: 'Best Streak',  value: `${bestStreak} days`,          color: '#f97316' },
              ].map((k) => (
                <div key={k.label} className="rounded-2xl border border-slate-100 p-3 text-center dark:border-white/10">
                  <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: k.color }}>
                    {k.icon}
                  </div>
                  <div className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{k.value}</div>
                  <div className="text-[10px] font-bold text-slate-400">{k.label}</div>
                </div>
              ))}
            </div>

            {/* 14-day bar chart */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13px] font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar size={14} className="text-purple-500" /> 14-Day Progress History
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Partial</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-200" /> Missed</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={history} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.10)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis domain={[0, 110]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Progress']} labelFormatter={(l) => `${l}`} />
                  <ReferenceLine y={100} stroke="#16a34a" strokeDasharray="4 2" strokeWidth={1.5} />
                  <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={22}>
                    {history.map((d, i) => (
                      <Cell key={i} fill={d.lvl >= 4 ? '#16a34a' : d.lvl === 3 ? '#4ade80' : d.lvl === 2 ? '#fbbf24' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Day-by-day list */}
            <div>
              <div className="mb-2 text-[12px] font-extrabold text-slate-700 dark:text-slate-200">Daily Breakdown</div>
              <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {[...history].reverse().map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-white/10">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{d.day}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{d.pct}%</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        d.lvl === 4 ? 'bg-emerald-100 text-emerald-700' :
                        d.lvl === 3 ? 'bg-green-100 text-green-700' :
                        d.lvl === 2 ? 'bg-amber-100 text-amber-700' :
                        d.lvl === 1 ? 'bg-rose-100 text-rose-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consistency summary */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-3 dark:border-purple-500/20 dark:bg-purple-500/10">
              <div className="mb-1 flex items-center justify-between text-[12px] font-extrabold text-purple-700 dark:text-purple-300">
                <span>Overall Consistency (this month)</span>
                <span>{habit.consistency}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-500/20">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400" style={{ width: `${habit.consistency}%` }} />
              </div>
              <div className="mt-1.5 text-[10px] font-semibold text-purple-600/80 dark:text-purple-400">
                {habit.consistency >= 80 ? 'Excellent! Keep it up.' : habit.consistency >= 60 ? 'Good progress. Push for consistency.' : 'Needs attention — try setting a reminder.'}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold text-slate-400">
      {['No Data','Missed','Partial','Completed','Perfect'].map((l, i) => (
        <span key={l} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: LEVEL_COLORS[i] }} />{l}</span>
      ))}
    </div>
  );
}
