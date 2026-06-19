'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Star, XCircle, Flame, CalendarDays, LayoutGrid, TrendingUp, Smile, Plus, ChevronDown } from 'lucide-react';
import { Card, SectionTitle, Segmented } from '../ui';
import {
  heatLevel, LEVEL_COLORS, LEVEL_LABELS, heatmapSummary, dayOfWeek,
  type Habit, type Note,
} from '@/data/habit-health-mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import IconGlyph from '@/components/IconGlyph';

const TODAY = new Date(2026, 5, 7); // June 7, 2026

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const NOTE_ICON: Record<string, { i: string; c: string }> = {
  good:    { i: 'mood',     c: 'bg-emerald-50 text-emerald-500' },
  bad:     { i: 'lowMood',  c: 'bg-rose-50 text-rose-500' },
  water:   { i: 'hydration',c: 'bg-blue-50 text-blue-500' },
  neutral: { i: 'neutral',  c: 'bg-amber-50 text-amber-500' },
};

const ALL_CATEGORIES = ['All Categories','Fitness','Mind','Growth','Health','Diet','Recovery'];
const ALL_STATUSES   = ['All Statuses', ...LEVEL_LABELS];

export default function HeatmapTab({
  habits, notes, onAddEntry, onAddHabit,
}: { habits: Habit[]; notes: Note[]; onAddEntry: () => void; onAddHabit: () => void }) {
  const [view, setView] = useState<'status' | 'pct' | 'mood'>('status');
  const [selYear, setSelYear] = useState(TODAY.getFullYear());
  const [selMonth, setSelMonth] = useState(TODAY.getMonth());
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus,   setFilterStatus]   = useState('All Statuses');

  const isCurrentMonth = selYear === TODAY.getFullYear() && selMonth === TODAY.getMonth();
  const totalDays = daysInMonth(selYear, selMonth);
  const currentDay = isCurrentMonth ? TODAY.getDate() : totalDays;
  const DAYS = Array.from({ length: totalDays }, (_, i) => i + 1);
  const monthLabel = `${MONTH_NAMES[selMonth]} ${selYear}`;

  function prevMonth() {
    if (selMonth === 0) { setSelMonth(11); setSelYear((y) => y - 1); }
    else setSelMonth((m) => m - 1);
  }
  function nextMonth() {
    if (selYear === TODAY.getFullYear() && selMonth >= TODAY.getMonth()) return;
    if (selMonth === 11) { setSelMonth(0); setSelYear((y) => y + 1); }
    else setSelMonth((m) => m + 1);
  }

  // filter habits
  const filteredHabits = habits.filter((h) => {
    if (filterCategory !== 'All Categories' && h.category !== filterCategory) return false;
    if (filterStatus !== 'All Statuses') {
      // check if this habit has ANY day with the selected status in current view
      const hasStatus = DAYS.some((d) => LEVEL_LABELS[heatLevel(habits.indexOf(h), d, currentDay)] === filterStatus);
      if (!hasStatus) return false;
    }
    return true;
  });

  const calOffset = (() => {
    const dow = new Date(selYear, selMonth, 1).getDay();
    return dow === 0 ? 6 : dow - 1;
  })();

  return (
    <div className="space-y-4">
      {/* ── Filter + action bar ── */}
      <Card className="!p-3">
        <div className="flex flex-wrap items-center gap-3">

          {/* Month — wired to navigation */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-slate-500">Month</span>
            <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-white/10 dark:bg-[#14162a]">
              <button onClick={prevMonth} className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:text-emerald-500">
                <ChevronLeft size={12} />
              </button>
              <span className="mx-1 text-[12px] font-bold text-slate-700 dark:text-slate-200">{monthLabel}</span>
              <button onClick={nextMonth} disabled={isCurrentMonth}
                className={`flex h-5 w-5 items-center justify-center rounded text-slate-400 ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:text-emerald-500'}`}>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-slate-500">Category</span>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-[#14162a]">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-transparent pr-5 text-[12px] font-bold text-slate-700 outline-none dark:text-slate-200 cursor-pointer"
              >
                {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 text-slate-400" />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-slate-500">Status</span>
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-[#14162a]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-transparent pr-5 text-[12px] font-bold text-slate-700 outline-none dark:text-slate-200 cursor-pointer"
              >
                {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={11} className="pointer-events-none absolute right-2 text-slate-400" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onAddEntry}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[12px] font-extrabold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              <Plus size={13} /> Insert Data
            </button>
            <button
              onClick={onAddHabit}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 px-3 py-1.5 text-[12px] font-extrabold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5"
            >
              <Plus size={13} /> Add Habit
            </button>
          </div>

          {/* View segmented */}
          <Segmented
            value={view}
            onChange={(v) => setView(v as 'status' | 'pct' | 'mood')}
            options={[
              { key: 'status', label: 'Status',       icon: <LayoutGrid size={13} /> },
              { key: 'pct',    label: 'Completion %', icon: <TrendingUp size={13} /> },
              { key: 'mood',   label: 'Mood Overlay', icon: <Smile size={13} /> },
            ]}
          />
        </div>

        {/* Active filter pills */}
        {(filterCategory !== 'All Categories' || filterStatus !== 'All Statuses') && (
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 dark:border-white/10">
            <span className="text-[11px] font-bold text-slate-400">Filters:</span>
            {filterCategory !== 'All Categories' && (
              <span className="flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                {filterCategory}
                <button onClick={() => setFilterCategory('All Categories')} className="text-purple-400 hover:text-purple-600"><XCircle size={11} /></button>
              </span>
            )}
            {filterStatus !== 'All Statuses' && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {filterStatus}
                <button onClick={() => setFilterStatus('All Statuses')} className="text-emerald-400 hover:text-emerald-600"><XCircle size={11} /></button>
              </span>
            )}
            <span className="text-[11px] text-slate-400">{filteredHabits.length} of {habits.length} habits shown</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        {/* Heatmap grid */}
        <Card>
          <SectionTitle
            title="Habit Heatmap"
            subtitle={`Daily view of habit consistency — ${monthLabel}`}
            right={
              <div className="flex items-center gap-1">
                <IconBtn onClick={prevMonth}><ChevronLeft size={14} /></IconBtn>
                <span className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500 dark:border-white/10">
                  <CalendarDays size={12} /> {monthLabel}
                </span>
                <IconBtn onClick={nextMonth} disabled={isCurrentMonth}><ChevronRight size={14} /></IconBtn>
              </div>
            }
          />
          {filteredHabits.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-[13px] font-semibold text-slate-400">
              No habits match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="mb-1 grid" style={{ gridTemplateColumns: `120px repeat(${totalDays}, 1fr)` }}>
                  <div />
                  {DAYS.map((d) => (
                    <div key={d} className={`text-center text-[8px] font-bold ${isCurrentMonth && d === TODAY.getDate() ? 'text-emerald-600' : 'text-slate-400'}`}>{d}</div>
                  ))}
                </div>
                {filteredHabits.map((h) => {
                  const hi = habits.indexOf(h);
                  return (
                    <div key={h.id} className="mb-1 grid items-center" style={{ gridTemplateColumns: `120px repeat(${totalDays}, 1fr)` }}>
                      <div className="flex items-center gap-1.5 pr-2">
                        <IconGlyph token={h.icon} size={11} />
                        <span className="truncate text-[11px] font-semibold text-slate-600 dark:text-slate-300">{h.name}</span>
                      </div>
                      {DAYS.map((d) => {
                        const lvl = heatLevel(hi, d, currentDay);
                        const isToday = isCurrentMonth && d === TODAY.getDate();
                        return (
                          <div
                            key={d}
                            className="mx-[1px] aspect-square rounded-[3px]"
                            style={{
                              background: LEVEL_COLORS[lvl],
                              border: isToday ? '2px solid #16a34a' : lvl === 0 ? '1px solid #e2e8f0' : 'none',
                            }}
                            title={`${h.name} · ${monthLabel} ${d}: ${LEVEL_LABELS[lvl]}`}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Legend />
        </Card>

        {/* Summary + mini calendar */}
        <div className="flex flex-col gap-4">
          <Card>
            <SectionTitle title="Heatmap Summary" subtitle={monthLabel} info />
            {[
              { icon: <CheckCircle2 size={15} className="text-emerald-500" />, label: 'Total Active Habits', value: filteredHabits.length },
              { icon: <Star size={15} className="text-emerald-500" />,         label: 'Perfect Days (All Habits)', value: heatmapSummary.perfectDays },
              { icon: <XCircle size={15} className="text-rose-400" />,         label: 'Missed Logs',               value: heatmapSummary.missedLogs },
              { icon: <Flame size={15} className="text-orange-500" />,         label: 'Best Streak (All Habits)',  value: `${heatmapSummary.bestStreak} days` },
              { icon: <CalendarDays size={15} className="text-blue-500" />,    label: 'This Month Completion',     value: `${heatmapSummary.monthCompletion}%` },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between border-b border-slate-50 py-2 last:border-0 dark:border-white/5">
                <span className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">{r.icon}{r.label}</span>
                <span className="text-[13px] font-extrabold text-emerald-600">{r.value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <IconBtn onClick={prevMonth}><ChevronLeft size={13} /></IconBtn>
              <span className="text-[13px] font-extrabold text-slate-700 dark:text-slate-200">{monthLabel} Overview</span>
              <IconBtn onClick={nextMonth} disabled={isCurrentMonth}><ChevronRight size={13} /></IconBtn>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <div key={d} className="text-[9px] font-bold text-slate-400">{d}</div>)}
              {Array.from({ length: calOffset }).map((_, i) => <div key={`e${i}`} />)}
              {DAYS.map((d) => {
                const lvl = heatLevel(0, d, currentDay);
                const isToday = isCurrentMonth && d === TODAY.getDate();
                return (
                  <div
                    key={d}
                    className={`rounded-md py-1.5 text-[10px] font-bold ${isToday ? 'ring-2 ring-emerald-500' : ''}`}
                    style={{ background: lvl ? LEVEL_COLORS[lvl] : 'transparent', color: lvl >= 3 ? '#fff' : '#64748b' }}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
            <Legend small />
          </Card>
        </div>
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <SectionTitle title="Habit Consistency by Habit" subtitle="Average completion rate this month" />
          <div className="space-y-2.5">
            {[...filteredHabits].sort((a, b) => b.consistency - a.consistency).map((h) => (
              <div key={h.id}>
                <div className="mb-1 flex items-center gap-2">
                  <IconGlyph token={h.icon} size={12} />
                  <div className="flex flex-1 justify-between text-[11px] font-bold">
                    <span className="text-slate-600 dark:text-slate-300">{h.name}</span>
                    <span className="text-emerald-600">{h.consistency}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${h.consistency}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Day-of-Week Completion Pattern" subtitle="Average completion rate by day" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={dayOfWeek} margin={{ top: 20, right: 6, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.12)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Completion']} />
              <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={30}>
                <LabelList dataKey="value" position="top" formatter={(v: number) => `${v}%`} fontSize={10} fill="#16a34a" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="Recent Notes & Remarks" subtitle="" info right={<button className="text-[11px] font-bold text-emerald-600">View all</button>} />
          <div className="space-y-2">
            {notes.map((n) => {
              const ni = NOTE_ICON[n.mood];
              return (
                <div key={n.id} className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 dark:border-white/10">
                  <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg dark:bg-white/5 ${ni.c}`}>
                    <IconGlyph token={ni.i} size={14} />
                  </span>
                  <div className="min-w-0 flex-1"><div className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{n.text}</div></div>
                  <span className="flex-shrink-0 text-[10px] font-semibold text-slate-400">{n.time}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-white/10 ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-emerald-300 hover:text-emerald-500'}`}
    >
      {children}
    </button>
  );
}

function Legend({ small }: { small?: boolean }) {
  return (
    <div className={`mt-3 flex flex-wrap gap-3 ${small ? 'text-[9px]' : 'text-[10px]'} font-semibold text-slate-400`}>
      {LEVEL_LABELS.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: LEVEL_COLORS[i], border: i === 0 ? '1px solid #e2e8f0' : 'none' }} />
          {l}
        </span>
      ))}
    </div>
  );
}
