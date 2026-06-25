'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight,
  Laugh, Smile, Meh, Frown, Angry,
  Flame, Zap, BookOpenCheck, TrendingUp,
} from 'lucide-react';
import { generateMonthData, calendarDays, calendarLeading, MOODS } from '@/data/mood-journal-mock';
import { loadEntries } from '@/lib/journalStore';
import type { MoodLevel } from '@/types/mood-journal';

const MOOD_ICONS: Record<MoodLevel, typeof Smile> = {
  5: Laugh,
  4: Smile,
  3: Meh,
  2: Frown,
  1: Angry,
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function energyColor(e: number) {
  if (e <= 3) return { bar: 'linear-gradient(90deg,#f43f5e,#fb923c)', bg: '#fff1f2' };
  if (e <= 6) return { bar: 'linear-gradient(90deg,#f59e0b,#fde047)', bg: '#fef9c3' };
  return { bar: 'linear-gradient(90deg,#10b981,#34d399)', bg: '#d1fae5' };
}

interface Props {
  showMoods?: boolean;
  showEnergyBar?: boolean;
  showJournalDot?: boolean;
  showFeelings?: boolean;
  selectedDay?: number;
  onSelectDay?: (day: number, year: number, month: number) => void;
}

export default function MoodCalendar({
  showMoods = true,
  showEnergyBar = false, showJournalDot = true, showFeelings = true, selectedDay = 0, onSelectDay,
}: Props) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6);
  const [selected, setSelected] = useState(selectedDay);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Today — for hiding future mock data
  const todayDate = useMemo(() => new Date(), []);
  const todayYear  = todayDate.getFullYear();
  const todayMonth = todayDate.getMonth() + 1;
  const todayDay   = todayDate.getDate();

  function isFutureDay(day: number): boolean {
    if (year > todayYear) return true;
    if (year < todayYear) return false;
    if (month > todayMonth) return true;
    if (month < todayMonth) return false;
    return day > todayDay;
  }

  function isTodayDay(day: number): boolean {
    return year === todayYear && month === todayMonth && day === todayDay;
  }

  const { days, leadingDays } = useMemo(() => {
    if (year === 2025 && month === 5) {
      return { days: calendarDays, leadingDays: calendarLeading };
    }
    return generateMonthData(year, month);
  }, [year, month]);

  // Load saved entries for this month (includes energy)
  const savedEntries = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const all = loadEntries();
    const result: Record<number, {
      feelings: { icon: string; label: string }[];
      title?: string;
      score?: number;
      energy?: number;
    }> = {};
    for (const [k, v] of Object.entries(all)) {
      if (k.startsWith(prefix)) {
        const day = parseInt(k.split('-')[2], 10);
        result[day] = {
          feelings: v.feelings ?? [],
          title: v.title,
          score: v.score,
          energy: (v as { energy?: number }).energy,
        };
      }
    }
    return result;
  }, [year, month]);

  const savedDaySet = useMemo(() => new Set(Object.keys(savedEntries).map(Number)), [savedEntries]);

  // ── Stats for the visible month ─────────────────────────────────────────
  const monthStats = useMemo(() => {
    const counts: Record<MoodLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let scoreSum = 0;
    let scoreCount = 0;
    let savedEntriesCount = 0;
    let daysInMonth = 0;
    for (const dy of days) {
      daysInMonth++;
      // Skip future days from analysis
      if (year === todayYear && month === todayMonth && dy.day > todayDay) continue;
      if (year > todayYear || (year === todayYear && month > todayMonth)) continue;

      const saved = savedEntries[dy.day];
      // Prefer saved mood, fall back to mock
      const moodLvl: MoodLevel | null = saved
        ? ((saved.score && saved.score >= 8) ? 5 : (saved.score && saved.score >= 6.5) ? 4 : (saved.score && saved.score >= 5) ? 3 : (saved.score && saved.score >= 3) ? 2 : 1) as MoodLevel
        : (dy.mood as MoodLevel | null) ?? null;
      if (moodLvl) {
        counts[moodLvl]++;
        total++;
      }
      const score = saved?.score ?? (dy.score > 0 ? dy.score : undefined);
      if (score !== undefined) { scoreSum += score; scoreCount++; }
      if (saved) savedEntriesCount++;
    }
    // Streak: consecutive days from latest valid day backwards with mood or saved
    let streak = 0;
    const sortedDays = [...days].sort((a, b) => b.day - a.day);
    for (const dy of sortedDays) {
      // Skip future days
      if (year === todayYear && month === todayMonth && dy.day > todayDay) continue;
      if (year > todayYear || (year === todayYear && month > todayMonth)) continue;
      const hasMood = !!savedEntries[dy.day] || !!dy.mood;
      if (hasMood) streak++;
      else break;
    }

    const topMood = (Object.entries(counts) as [string, number][])
      .sort((a, b) => b[1] - a[1])[0];
    const mostFrequent = topMood && topMood[1] > 0 ? MOODS[Number(topMood[0]) as MoodLevel] : null;
    const mostFrequentCount = topMood ? topMood[1] : 0;
    const avgScore = scoreCount > 0 ? scoreSum / scoreCount : 0;

    return {
      counts, total, mostFrequent, mostFrequentCount,
      avgScore, scoreCount,
      savedEntriesCount, daysInMonth,
      streak,
    };
  }, [days, savedEntries, year, month, todayYear, todayMonth, todayDay]);

  function handleSelect(d: number) {
    setSelected(d);
    onSelectDay?.(d, year, month);
  }

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(0);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(0);
  }

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div>
      {/* ── Mood Analytics Panel ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-4 rounded-2xl border border-purple-100/70 bg-gradient-to-br from-white via-purple-50/30 to-violet-50/40 dark:border-white/10 dark:from-[#1a1c30] dark:via-[#1d1f35] dark:to-[#1f213a] p-4 shadow-[0_6px_22px_-12px_rgba(124,58,237,0.25)]"
      >
        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Most Frequent Mood */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(124,58,237,0.40)' }}
            transition={{ duration: 0.18 }}
            className="vivid-card relative overflow-hidden rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 12px 28px rgba(124,58,237,0.35)' }}
          >
            <span className="spark-dot text-white" style={{ top: 7, right: 11, fontSize: 12, lineHeight: 1, '--sp-dur': '2.8s' } as React.CSSProperties}>✦</span>
            <span className="spark-dot text-white" style={{ bottom: 10, left: '40%', fontSize: 8, lineHeight: 1, '--sp-delay': '1.4s', '--sp-dur': '3.2s' } as React.CSSProperties}>✦</span>
            <div className="relative flex items-center justify-between">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-white/80">อารมณ์บ่อยสุด</div>
              <div className="icon-frost flex h-7 w-7 items-center justify-center bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                <TrendingUp size={14} className="text-white" strokeWidth={2.6} />
              </div>
            </div>
            <div className="relative mt-2.5 flex items-center gap-2">
              {monthStats.mostFrequent ? (() => {
                const Icon = MOOD_ICONS[monthStats.mostFrequent.level];
                return (
                  <>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/25">
                      <Icon size={20} strokeWidth={2.4} className="text-white" />
                    </div>
                    <span className="text-[16px] font-black tracking-tight text-white">
                      {monthStats.mostFrequent.labelTh}
                    </span>
                  </>
                );
              })() : (
                <span className="text-[14px] font-extrabold text-white/50">—</span>
              )}
            </div>
            <div className="relative mt-2 text-[11px] font-bold text-white/75 tabular-nums">
              {monthStats.mostFrequentCount} วันในเดือนนี้
            </div>
          </motion.div>

          {/* Average Score */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(168,85,247,0.40)' }}
            transition={{ duration: 0.18 }}
            className="vivid-card relative overflow-hidden rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg,#c026d3,#a855f7)', boxShadow: '0 12px 28px rgba(168,85,247,0.35)' }}
          >
            <span className="spark-dot text-white" style={{ top: 7, right: 11, fontSize: 12, lineHeight: 1, '--sp-dur': '3.0s', '--sp-delay': '0.3s' } as React.CSSProperties}>✦</span>
            <span className="spark-dot text-white" style={{ bottom: 10, left: '40%', fontSize: 8, lineHeight: 1, '--sp-delay': '1.7s', '--sp-dur': '2.6s' } as React.CSSProperties}>✦</span>
            <div className="relative flex items-center justify-between">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-white/80">คะแนนเฉลี่ย</div>
              <div className="icon-frost flex h-7 w-7 items-center justify-center bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                <Smile size={14} className="text-white" strokeWidth={2.4} />
              </div>
            </div>
            <div className="relative mt-2.5 flex items-baseline gap-1">
              <span className="text-[28px] leading-none font-black tracking-tight tabular-nums text-white drop-shadow-sm">
                {monthStats.avgScore > 0 ? monthStats.avgScore.toFixed(1) : '—'}
              </span>
              <span className="text-[14px] font-extrabold text-white/70">/10</span>
            </div>
            <div className="relative mt-2 text-[11px] font-bold text-white/75 tabular-nums">
              จาก {monthStats.scoreCount} วัน
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(251,146,60,0.40)' }}
            transition={{ duration: 0.18 }}
            className="vivid-card relative overflow-hidden rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24)', boxShadow: '0 12px 28px rgba(251,146,60,0.35)' }}
          >
            <span className="spark-dot text-white" style={{ top: 7, right: 11, fontSize: 12, lineHeight: 1, '--sp-dur': '2.6s', '--sp-delay': '0.6s' } as React.CSSProperties}>✦</span>
            <span className="spark-dot text-white" style={{ bottom: 10, left: '40%', fontSize: 8, lineHeight: 1, '--sp-delay': '2.0s', '--sp-dur': '3.4s' } as React.CSSProperties}>✦</span>
            <div className="relative flex items-center justify-between">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-white/80">Streak ปัจจุบัน</div>
              <motion.div
                animate={monthStats.streak >= 3 ? { scale: [1, 1.08, 1] } : undefined}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="icon-frost flex h-7 w-7 items-center justify-center bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
              >
                <Flame size={14} className="text-white" strokeWidth={2.4} />
              </motion.div>
            </div>
            <div className="relative mt-2.5 flex items-baseline gap-1.5">
              <span className="text-[28px] leading-none font-black tracking-tight tabular-nums text-white drop-shadow-sm">
                {monthStats.streak}
              </span>
              <span className="text-[13px] font-extrabold text-white/75">วันติด</span>
            </div>
            <div className="relative mt-2 text-[11px] font-bold text-white/75">
              {monthStats.streak === 0 ? 'เริ่มวันนี้!' : monthStats.streak < 3 ? 'ทำต่อให้สม่ำเสมอ' : 'ดีมาก รักษาไว้นะ'}
            </div>
          </motion.div>

          {/* Total entries */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 18px 40px rgba(20,184,166,0.40)' }}
            transition={{ duration: 0.18 }}
            className="vivid-card relative overflow-hidden rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg,#0d9488,#34d399)', boxShadow: '0 12px 28px rgba(20,184,166,0.35)' }}
          >
            <span className="spark-dot text-white" style={{ top: 7, right: 11, fontSize: 12, lineHeight: 1, '--sp-dur': '3.2s', '--sp-delay': '0.8s' } as React.CSSProperties}>✦</span>
            <span className="spark-dot text-white" style={{ bottom: 10, left: '40%', fontSize: 8, lineHeight: 1, '--sp-delay': '2.2s', '--sp-dur': '2.8s' } as React.CSSProperties}>✦</span>
            <div className="relative flex items-center justify-between">
              <div className="text-[10.5px] font-black uppercase tracking-wider text-white/80">บันทึกที่มี</div>
              <div className="icon-frost flex h-7 w-7 items-center justify-center bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                <BookOpenCheck size={14} className="text-white" strokeWidth={2.4} />
              </div>
            </div>
            <div className="relative mt-2.5 flex items-baseline gap-1">
              <span className="text-[28px] leading-none font-black tracking-tight tabular-nums text-white drop-shadow-sm">
                {monthStats.savedEntriesCount}
              </span>
              <span className="text-[13px] font-extrabold text-white/75">/ {monthStats.daysInMonth}</span>
            </div>
            <div className="relative mt-2 text-[11px] font-bold text-white/75 tabular-nums">
              {Math.round((monthStats.savedEntriesCount / Math.max(monthStats.daysInMonth, 1)) * 100)}% ของเดือน
            </div>
          </motion.div>
        </div>

        {/* Mood distribution bar */}
        {monthStats.total > 0 && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">การกระจายอารมณ์ — {monthLabel}</span>
              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tabular-nums">{monthStats.total} วัน</span>
            </div>
            <div className="flex h-4 w-full rounded-full overflow-hidden ring-1 ring-purple-100 dark:ring-white/10 bg-slate-50 dark:bg-white/5">
              {[5, 4, 3, 2, 1].map((lvl, idx) => {
                const m = MOODS[lvl as MoodLevel];
                const count = monthStats.counts[lvl as MoodLevel];
                if (count === 0) return null;
                const pct = (count / monthStats.total) * 100;
                return (
                  <motion.div
                    key={lvl}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.55, delay: 0.1 + idx * 0.05, ease: 'easeOut' }}
                    className="h-full first:rounded-l-full last:rounded-r-full relative group"
                    style={{ background: m.color }}
                    title={`${m.labelTh} — ${count} วัน (${pct.toFixed(0)}%)`}
                  >
                    {pct >= 12 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10.5px] font-black text-white drop-shadow tabular-nums">
                        {Math.round(pct)}%
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {[5, 4, 3, 2, 1].map(lvl => {
                const m = MOODS[lvl as MoodLevel];
                const c = monthStats.counts[lvl as MoodLevel];
                return (
                  <span key={lvl} className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${c === 0 ? 'opacity-40' : ''}`}>
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: m.color }} />
                    <span className="text-slate-700 dark:text-slate-300">{m.labelTh}</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">{c}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Month/Year navigation — year filter removed */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={prevMonth}
          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition shadow-sm">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => setShowMonthPicker(!showMonthPicker)}
          className="text-[16px] font-extrabold text-gray-800 dark:text-gray-100 hover:text-purple-600 transition px-3 py-1 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20">
          {MONTH_NAMES[month - 1]} {year}
        </button>
        <button onClick={nextMonth}
          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition shadow-sm">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Month picker */}
      {showMonthPicker && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-4 gap-1.5 mb-4 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-900/20 border border-purple-100 dark:border-white/10">
          {MONTH_NAMES.map((name, i) => (
            <button key={name} onClick={() => { setMonth(i + 1); setShowMonthPicker(false); setSelected(0); }}
              className={`py-2 rounded-xl text-[12px] font-bold transition ${
                month === i + 1 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-800/40'
              }`}>
              {name.slice(0, 3)}
            </button>
          ))}
        </motion.div>
      )}

      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1.5">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[11px] font-bold text-gray-400 py-1">{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {leadingDays.map(d => (
          <div key={`lead-${d}`} className="rounded-2xl flex items-start justify-center pt-2 text-[13px] text-gray-200 dark:text-white/10 h-[148px]">
            {d}
          </div>
        ))}

        {days.map((dy, i) => {
          const future = isFutureDay(dy.day);
          const today = isTodayDay(dy.day);
          // For future days, never show mock data — only saved data
          const moodLevel = (!future && showMoods && dy.mood) ? dy.mood : null;
          const mood = moodLevel ? MOODS[moodLevel] : null;
          const isSelected = dy.day === selected;
          const savedEntry = savedEntries[dy.day];
          const hasSaved = savedDaySet.has(dy.day);
          const feelings = savedEntry?.feelings ?? [];
          // Title: only show saved title, or mock title for past/today
          const displayTitle = savedEntry?.title || (!future ? dy.title : undefined);

          // Score — prefer saved, fall back to mock score from current view
          const scoreVal: number | undefined = savedEntry?.score ?? (!future && dy.score > 0 ? dy.score : undefined);

          // Energy: prefer saved, fall back to mock for past days only
          const energyVal: number | undefined = savedEntry?.energy ?? (!future && dy.energy > 0 ? dy.energy : undefined);
          const eColor = energyVal !== undefined ? energyColor(energyVal) : null;

          return (
            <motion.button
              key={dy.day}
              onClick={() => handleSelect(dy.day)}
              whileHover={{ scale: 1.025, y: -2, boxShadow: '0 10px 26px -8px rgba(124,58,237,0.22)' }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.006 }}
              className={`relative rounded-2xl border flex flex-col items-start justify-start p-3 pb-5 transition-colors h-[148px] overflow-hidden text-left subpixel-antialiased
                ${today
                  ? 'border-2 border-purple-500 dark:border-purple-400 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-purple-500/20 dark:via-fuchsia-500/15 dark:to-pink-500/15 ring-4 ring-purple-200/60 dark:ring-purple-500/30 shadow-[0_8px_28px_-8px_rgba(168,85,247,0.45)]'
                  : isSelected
                    ? 'border-purple-400 dark:border-purple-500 bg-purple-50/80 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-700/40 shadow-md'
                    : hasSaved
                      ? 'border-purple-200 dark:border-purple-700/60 bg-gradient-to-b from-purple-50/60 dark:from-purple-900/30 to-white dark:to-[#181a2c] hover:border-purple-300 hover:shadow-sm'
                      : future
                        ? 'border-gray-50 dark:border-white/5 bg-white/60 dark:bg-white/5 hover:border-purple-100 opacity-50'
                        : mood
                          ? 'border-gray-100 dark:border-white/8 hover:border-purple-200 bg-white dark:bg-[#1e2035] hover:shadow-sm'
                          : 'border-gray-50 dark:border-white/5 bg-gray-50/40 dark:bg-white/[0.03] hover:border-gray-200 dark:hover:border-white/10'}`}
            >
              {/* Pulsing glow ring for Today */}
              {today && (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(168,85,247,0.4)' }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* ── Row 1: Day number + Today badge ── */}
              <div className="relative flex items-center gap-1.5 w-full">
                <span className={`text-[16px] leading-none font-black tracking-tight tabular-nums ${
                  today
                    ? 'w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-purple-950'
                    : isSelected
                      ? 'w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center'
                      : hasSaved
                        ? 'text-purple-700 dark:text-purple-300'
                        : future
                          ? 'text-gray-300 dark:text-white/20'
                          : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {dy.day}
                </span>
                {today && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-[3px] text-[11px] font-black uppercase tracking-wider text-white shadow-sm"
                  >
                    Today
                  </motion.span>
                )}
              </div>

              {/* ── Row 2: Mood icon + Score (headline) ── */}
              {showMoods && (mood || scoreVal !== undefined) && (
                <div className="mt-2 flex items-center gap-2">
                  {mood && moodLevel && (() => {
                    const Icon = MOOD_ICONS[moodLevel];
                    return (
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg shadow-inner" style={{ background: mood.bg }} title={mood.labelTh}>
                        <Icon size={17} strokeWidth={2.5} style={{ color: mood.color }} />
                      </div>
                    );
                  })()}
                  {scoreVal !== undefined && (
                    <span className="text-[17px] leading-none font-black tracking-tight tabular-nums" style={{ color: mood?.color ?? '#7c5cbf' }}>
                      {scoreVal}
                      <span className="text-[11px] text-slate-400 font-extrabold ml-0.5">/10</span>
                    </span>
                  )}
                </div>
              )}

              {/* ── Row 3: Feelings tags OR title ── */}
              {showFeelings && feelings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 w-full">
                  {feelings.slice(0, 2).map((f, fi) => (
                    <span key={fi} className="text-[12px] leading-none flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-2 py-[4px] rounded-md font-extrabold">
                      {f.icon && <span className="text-[13px]">{f.icon}</span>}
                      <span className="truncate max-w-[80px]">{f.label}</span>
                    </span>
                  ))}
                  {feelings.length > 2 && (
                    <span className="text-[11px] text-purple-500 font-extrabold self-center">+{feelings.length - 2}</span>
                  )}
                </div>
              )}

              {showFeelings && feelings.length === 0 && displayTitle && (
                <span className="mt-2 text-[12.5px] font-extrabold text-slate-700 dark:text-slate-300 leading-tight w-full truncate tracking-tight">
                  {displayTitle}
                </span>
              )}

              {/* ── Row 4: Energy bar at bottom ── */}
              {showEnergyBar && eColor && energyVal !== undefined && (
                <div className="absolute bottom-2 left-3 right-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Zap size={10} strokeWidth={2.6} className="text-slate-500 dark:text-slate-400" />
                      Energy
                    </span>
                    <span className="text-[12px] font-black tabular-nums" style={{ color: eColor.bar.includes('10b981') ? '#059669' : eColor.bar.includes('f59e0b') ? '#b45309' : '#be123c' }}>
                      {energyVal}<span className="text-slate-400 font-extrabold">/10</span>
                    </span>
                  </div>
                  <div className="h-[4px] rounded-full overflow-hidden" style={{ background: eColor.bg }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(energyVal / 10) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.01, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: eColor.bar }}
                    />
                  </div>
                </div>
              )}

              {/* Saved indicator dot */}
              {showJournalDot && hasSaved && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.006, type: 'spring', stiffness: 360, damping: 22 }}
                  className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-purple-500 ring-2 ring-white shadow-sm"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex-wrap">
        <span className="flex items-center gap-2 text-[12.5px] font-extrabold">
          <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 ring-2 ring-purple-200/60 shadow-sm" />
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">วันนี้</span>
        </span>
        {showMoods && [5, 4, 3, 2, 1].map(l => {
          const m = MOODS[l as MoodLevel];
          return (
            <span key={l} className="flex items-center gap-1.5 text-[12.5px] font-bold">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: m.color }} />
              <span className="text-slate-700 dark:text-slate-300">{m.labelTh}</span>
            </span>
          );
        })}
        {showJournalDot && (
          <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" /> บันทึกแล้ว
          </span>
        )}
        {showEnergyBar && (
          <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-600 dark:text-slate-400">
            <span className="w-6 h-2 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400" /> พลังงาน
          </span>
        )}
      </div>
    </div>
  );
}

/* Compact heatmap variant for Insights tab */
export function MoodHeatmap() {
  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-center text-[10px] font-medium text-gray-400">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarLeading.map(d => <div key={`l-${d}`} className="aspect-square" />)}
        {calendarDays.map(dy => {
          const mood = dy.mood ? MOODS[dy.mood] : null;
          return (
            <div key={dy.day}
              className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium"
              style={{ background: mood ? mood.bg : '#f3f4f6', color: mood ? mood.color : '#9ca3af' }}>
              {dy.day}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-2 mt-2 text-[10px] text-gray-400">
        <span>น้อย</span>
        {['#ede9ff', '#ddd6fe', '#c4b5fd', '#a78bfa', '#7c5cbf'].map((c, i) => (
          <span key={i} className="w-4 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>มาก</span>
      </div>
    </div>
  );
}
