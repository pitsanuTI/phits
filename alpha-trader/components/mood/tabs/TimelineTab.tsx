'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, Plus, SlidersHorizontal,
  Smile, Zap, FileText, Image as ImageIcon, BookOpen, Tag,
} from 'lucide-react';
import { cardEntrance, hoverLift, staggerContainer, rowStagger, rowEntrance } from '@/lib/animations';
import MoodCalendar from '../shared/MoodCalendar';
import JournalEntryModal from '../JournalEntryModal';
import {
  weekOverview, journalEntries, whatToFillIn, motionNotesTimeline, MOODS, MOOD_LEGEND,
} from '@/data/mood-journal-mock';
import type { MoodLevel } from '@/types/mood-journal';

const CAL_FILTERS = ['Mood', 'Energy', 'Tag', 'Month', 'Money', 'Attachment'];

const STAT_CARDS = [
  { label: 'Average Mood',  value: '3.8', sub: 'Good',      icon: '😊', color: '#7c5cbf', bg: '#ede9ff' },
  { label: 'Average Energy',value: '6.7', sub: '/10  Good', icon: '⚡', color: '#10b981', bg: '#d1fae5' },
  { label: 'Total Entries', value: '7',   sub: 'This week', icon: '📔', color: '#38bdf8', bg: '#e0f2fe' },
  { label: 'Total Tags',    value: '18',  sub: 'This week', icon: '🏷️', color: '#f59e0b', bg: '#fef3c7' },
];

function MoodTick({ x = 0, y = 0, payload = { value: 0 } }: { x?: number; y?: number; payload?: { value: number } }) {
  return <text x={x - 8} y={y + 4} fontSize={10} textAnchor="middle">{payload.value}</text>;
}

export default function TimelineTab() {
  const [view, setView] = useState<'Month' | 'Week'>('Month');
  const [expanded, setExpanded] = useState<string | null>('j1');
  const [page, setPage] = useState(1);
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [savedVersion, setSavedVersion] = useState(0);
  const dayKey = modalDay ? `2025-05-${String(modalDay).padStart(2, '0')}` : '';
  const dayLabel = modalDay ? `${modalDay} May 2025` : '';

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <motion.div variants={cardEntrance} {...hoverLift}
          className="lg:col-span-1 bg-white rounded-2xl border border-purple-50 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-gray-800">May 2025</h3>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 rounded-md border border-gray-100 flex items-center justify-center text-gray-400 hover:border-purple-200"><ChevronLeft size={12} /></button>
              <button className="text-[10px] px-2 py-1 rounded-md border border-gray-100 text-gray-500 hover:border-purple-200">Today</button>
              <button className="w-6 h-6 rounded-md border border-gray-100 flex items-center justify-center text-gray-400 hover:border-purple-200"><ChevronRight size={12} /></button>
            </div>
          </div>

          {/* Month/Week toggle */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-1">
              {(['Month', 'Week'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`flex-1 py-1.5 text-[11px] font-medium transition ${view === v ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
                  {v}
                </button>
              ))}
            </div>
            <button className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400"><SlidersHorizontal size={13} /></button>
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {CAL_FILTERS.map(f => (
              <button key={f} className="flex items-center gap-0.5 text-[10px] text-gray-500 border border-gray-100 rounded-lg px-1.5 py-1 hover:border-purple-200">
                {f} <ChevronDown size={9} />
              </button>
            ))}
            <button className="text-[10px] text-purple-500 px-1.5 py-1">Clear</button>
          </div>

          <MoodCalendar key={savedVersion} showJournalDot={false} onSelectDay={(day) => setModalDay(day)} />

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
            {MOOD_LEGEND.map(m => (
              <span key={m.level} className="flex items-center gap-1 text-[10px] text-gray-500">
                <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.label}
              </span>
            ))}
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-300" />No entry
            </span>
          </div>
        </motion.div>

        {/* Week Overview + Stat cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div variants={cardEntrance} {...hoverLift}
            className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">Week Overview <span className="text-gray-400 font-normal">(May 14 – May 20)</span></h3>
              <span className="text-[11px] text-emerald-500 font-medium bg-emerald-50 px-2 py-1 rounded-lg">vs Last Week ↑ 1.2</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weekOverview} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c5cbf" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c5cbf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={<MoodTick />} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff' }}
                  formatter={(v: number) => [MOODS[v as MoodLevel]?.label ?? v, 'Mood']} />
                <Line type="monotone" dataKey="value" stroke="#7c5cbf" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fff', stroke: '#7c5cbf', strokeWidth: 2 }}
                  activeDot={{ r: 6 }} isAnimationActive animationDuration={900} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {STAT_CARDS.map(s => (
              <motion.div key={s.label} variants={cardEntrance} {...hoverLift}
                className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: s.bg }}>
                  <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400 font-medium leading-tight">{s.label}</div>
                  <div className="text-xl font-bold text-gray-800 leading-tight">
                    {s.value}<span className="text-[11px] text-gray-400 font-normal ml-1">{s.sub}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Journal Timeline table */}
      <motion.div variants={cardEntrance} {...hoverLift}
        className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-800">Journal Timeline <span className="text-gray-400 font-normal text-xs">86 Entries</span></h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input placeholder="Search entries..." className="pl-8 pr-3 py-1.5 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-purple-300 w-44" />
            </div>
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-300"><SlidersHorizontal size={14} /></button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white rounded-lg"
              style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}>
              <Plus size={13} /> New Entry
            </motion.button>
          </div>
        </div>

        {/* Header row */}
        <div className="hidden md:grid grid-cols-[1.3fr_0.8fr_0.8fr_1.3fr_1.5fr_0.6fr_0.3fr] gap-2 px-3 pb-2 border-b border-gray-100 text-[11px] font-medium text-gray-400">
          <span>Date</span><span>Mood</span><span>Energy</span><span>Tags</span><span>Money Feeling</span><span>Attachment</span><span></span>
        </div>

        <motion.div variants={rowStagger} initial="hidden" animate="visible" className="divide-y divide-gray-50">
          {journalEntries.map(e => {
            const m = MOODS[e.mood];
            const isOpen = expanded === e.id;
            return (
              <motion.div key={e.id} variants={rowEntrance}>
                <div
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  className={`grid grid-cols-[1.3fr_0.8fr_0.8fr_1.3fr_1.5fr_0.6fr_0.3fr] gap-2 px-3 py-3 items-center cursor-pointer transition-colors rounded-xl ${isOpen ? 'bg-purple-50/50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-gray-700 truncate">{e.date}</div>
                      <div className="text-[10px] text-gray-400">{e.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-gray-500">{e.energy >= 7 ? '' : ''}{m.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Zap size={11} className="text-sky-400" />
                    <span className="font-medium text-gray-600">{e.energy}/10</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {e.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md">{t}</span>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate pr-2">{e.moneyFeeling}</div>
                  <div className="flex items-center gap-1">
                    {e.hasImage && <span className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center"><ImageIcon size={12} className="text-gray-400" /></span>}
                    {e.hasDoc && <span className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center"><FileText size={12} className="text-gray-400" /></span>}
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex justify-end">
                    <ChevronDown size={14} className="text-gray-400" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-3 pb-4 pt-1">
                        <div className="bg-purple-50/60 rounded-xl p-3">
                          <div className="text-[11px] font-semibold text-purple-700 mb-1">Highlights</div>
                          <div className="text-[11px] text-gray-600 leading-snug">{e.highlights}</div>
                        </div>
                        <div className="bg-sky-50/60 rounded-xl p-3">
                          <div className="text-[11px] font-semibold text-sky-700 mb-1">Money Belief</div>
                          <div className="text-[11px] text-gray-600 leading-snug">{e.moneyBelief}</div>
                        </div>
                        <div className="bg-emerald-50/60 rounded-xl p-3">
                          <div className="text-[11px] font-semibold text-emerald-700 mb-1">Next Intention</div>
                          <div className="text-[11px] text-gray-600 leading-snug">{e.nextIntention}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <span className="text-[11px] text-gray-400">Showing 1 to 5 of 86 entries</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-purple-200 text-xs">«</button>
            <button className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-purple-200"><ChevronLeft size={12} /></button>
            {[1, 2, 3].map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${page === p ? 'bg-purple-600 text-white' : 'border border-gray-100 text-gray-500 hover:border-purple-200'}`}>
                {p}
              </button>
            ))}
            <span className="text-gray-300 px-1">…</span>
            <button className="w-7 h-7 rounded-lg border border-gray-100 text-[11px] text-gray-500 hover:border-purple-200">18</button>
            <button className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-purple-200"><ChevronRight size={12} /></button>
            <button className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:border-purple-200 text-xs">»</button>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            Entries per page:
            <select className="border border-gray-100 rounded-lg px-2 py-1 focus:outline-none"><option>5</option><option>10</option></select>
          </div>
        </div>
      </motion.div>

      <JournalEntryModal
        open={modalDay !== null}
        dayKey={dayKey}
        dayLabel={dayLabel}
        onClose={() => setModalDay(null)}
        onSaved={() => setSavedVersion((v) => v + 1)}
        onDeleted={() => setSavedVersion((v) => v + 1)}
      />
    </motion.div>
  );
}
