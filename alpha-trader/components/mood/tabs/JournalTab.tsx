'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, Zap, FileText, Image as ImageIcon, BookOpen } from 'lucide-react';
import { cardEntrance, hoverLift, staggerContainer, rowStagger, rowEntrance } from '@/lib/animations';
import MoodCalendar from '../shared/MoodCalendar';
import JournalEntryModal from '../JournalEntryModal';
import { journalEntries2026, MOODS, MOOD_LEGEND } from '@/data/mood-journal-mock';
import type { MoodLevel } from '@/types/mood-journal';

const STAT_CARDS = [
  { label: 'รายการทั้งหมด', value: '5',  sub: 'ปี 2026',    icon: BookOpen, color: '#7c3aed', bg: '#ede9ff' },
  { label: 'Avg. Mood',    value: '3.8', sub: 'Good',       icon: '😊',     color: '#10b981', bg: '#d1fae5', emoji: true },
  { label: 'Avg. Energy',  value: '6.6', sub: '/10',        icon: Zap,      color: '#38bdf8', bg: '#e0f2fe' },
  { label: 'Streak',       value: '6',   sub: 'วัน',         icon: '🔥',    color: '#f59e0b', bg: '#fef3c7', emoji: true },
];

export default function JournalTab() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>('j26_1');
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [modalYear, setModalYear] = useState(2026);
  const [modalMonth, setModalMonth] = useState(6);
  const [savedVersion, setSavedVersion] = useState(0);
  const [toast, setToast] = useState('');

  const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayKey = modalDay ? `${modalYear}-${String(modalMonth).padStart(2, '0')}-${String(modalDay).padStart(2, '0')}` : '';
  const dayLabel = modalDay ? `${modalDay} ${MONTH_NAMES_SHORT[modalMonth - 1]} ${modalYear}` : '';

  function notify(m: string) { setToast(m); setTimeout(() => setToast(''), 2500); }

  const filtered = journalEntries2026.filter(e =>
    !search || e.date.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    e.highlights.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-extrabold text-gray-800">Journal — 2026</h2>
          <p className="text-[11px] text-gray-400">บันทึกทั้งหมดของปีนี้เท่านั้น</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setModalDay(6); setModalYear(2026); setModalMonth(6); }}
          className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold text-white rounded-xl shadow-md"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
          <Plus size={14} /> New Entry
        </motion.button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(s => (
          <motion.div key={s.label} variants={cardEntrance} {...hoverLift}
            className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              {s.emoji
                ? <span className="text-lg">{s.icon as string}</span>
                : typeof s.icon === 'string'
                  ? null
                  : (() => { const Icon = s.icon as React.ElementType; return <Icon size={18} style={{ color: s.color }} />; })()
              }
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-gray-400 font-medium leading-tight">{s.label}</div>
              <div className="text-[20px] font-extrabold text-gray-800 leading-tight">
                {s.value}<span className="text-[11px] text-gray-400 font-normal ml-1">{s.sub}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Journal list — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div variants={cardEntrance} {...hoverLift}
            className="bg-white rounded-2xl border border-purple-50 shadow-sm overflow-hidden">

            {/* Table header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 gap-3 flex-wrap">
              <h3 className="text-[14px] font-bold text-gray-800">รายการ Journal</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="ค้นหา..." className="pl-8 pr-3 py-2 text-[12px] border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 w-36 transition" />
                </div>
                <button className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-200 transition">
                  <SlidersHorizontal size={14} />
                </button>
              </div>
            </div>

            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[1.4fr_0.7fr_0.7fr_1.4fr_0.5fr_0.2fr] gap-2 px-5 py-2 bg-gray-50/60 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>วันที่</span><span>Mood</span><span>พลังงาน</span><span>Tags</span><span>Attachment</span><span></span>
            </div>

            <motion.div variants={rowStagger} initial="hidden" animate="visible" className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <div className="px-5 py-10 text-center text-[12px] text-gray-400">ไม่พบรายการที่ตรงกับการค้นหา</div>
              )}
              {filtered.map(e => {
                const m = MOODS[e.mood as MoodLevel];
                const isOpen = expanded === e.id;
                return (
                  <motion.div key={e.id} variants={rowEntrance}>
                    <div onClick={() => setExpanded(isOpen ? null : e.id)}
                      className={`grid grid-cols-[1.4fr_0.7fr_0.7fr_1.4fr_0.5fr_0.2fr] gap-2 px-5 py-3.5 items-center cursor-pointer transition-colors rounded-none ${
                        isOpen ? 'bg-purple-50/40' : 'hover:bg-gray-50/60'
                      }`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-gray-800 truncate leading-tight">{e.date}</div>
                          <div className="text-[10px] text-gray-400">{e.time}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-medium" style={{ color: m.color }}>{m.labelTh}</div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <Zap size={11} className="text-sky-400" />
                        <span className="font-semibold text-gray-600">{e.energy}/10</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {e.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md font-medium">{t}</span>
                        ))}
                        {e.tags.length > 2 && <span className="text-[9px] text-gray-400">+{e.tags.length - 2}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {e.hasImage && <span className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100"><ImageIcon size={11} className="text-gray-400" /></span>}
                        {e.hasDoc && <span className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100"><FileText size={11} className="text-gray-400" /></span>}
                      </div>
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex justify-end">
                        <ChevronDown size={14} className="text-gray-400" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-5 pb-4 pt-1">
                            <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-100/60">
                              <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wide mb-1.5">เกิดอะไรขึ้น</div>
                              <div className="text-[12px] text-gray-700 leading-snug">{e.highlights}</div>
                            </div>
                            <div className="bg-sky-50/50 rounded-xl p-3 border border-sky-100/60">
                              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wide mb-1.5">Money Feeling</div>
                              <div className="text-[12px] text-gray-700 leading-snug">{e.moneyFeeling}</div>
                            </div>
                            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60">
                              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5">Intention พรุ่งนี้</div>
                              <div className="text-[12px] text-gray-700 leading-snug">{e.nextIntention}</div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Calendar sidebar */}
        <div className="flex flex-col gap-4">
          <motion.div variants={cardEntrance} {...hoverLift}
            className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4">
            <h4 className="text-[13px] font-bold text-gray-800 mb-3">ปฏิทิน 2026</h4>
            <MoodCalendar
              key={savedVersion}
              showJournalDot
              onSelectDay={(day, yr, mo) => { setModalDay(day); setModalYear(yr); setModalMonth(mo); }}
            />
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
              {MOOD_LEGEND.map(m => (
                <span key={m.level} className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.labelTh}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <JournalEntryModal
        open={modalDay !== null}
        dayKey={dayKey}
        dayLabel={dayLabel}
        onClose={() => setModalDay(null)}
        onSaved={() => { setSavedVersion(v => v + 1); notify('บันทึก Journal สำเร็จ!'); }}
        onDeleted={() => { setSavedVersion(v => v + 1); notify('ลบ Journal แล้ว'); }}
      />

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl z-50">
          ✓ {toast}
        </motion.div>
      )}
    </motion.div>
  );
}
