'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Zap, TrendingUp,
  Smile, Laugh, Meh, Frown, Angry,
  Heart, BookOpenCheck, MessageSquare, type LucideIcon,
} from 'lucide-react';
import { cardEntrance, hoverLift, staggerContainer } from '@/lib/animations';
import MoodCalendar from '../shared/MoodCalendar';
import JournalEntryModal from '../JournalEntryModal';
import { weeklyMoodTrend, weeklyEnergyTrend, previousEntries, MOODS } from '@/data/mood-journal-mock';
import type { MoodLevel } from '@/types/mood-journal';

const MOOD_ICONS: Record<MoodLevel, LucideIcon> = {
  5: Laugh, 4: Smile, 3: Meh, 2: Frown, 1: Angry,
};

// Calendar display filters
const CAL_FILTERS: { id: string; label: string; icon: LucideIcon; desc: string }[] = [
  { id: 'mood',     label: 'อารมณ์',     icon: Heart,           desc: 'สีอารมณ์บนเซลล์' },
  { id: 'energy',   label: 'พลังงาน',    icon: Zap,             desc: 'แถบพลังงาน' },
  { id: 'journal',  label: 'บันทึก',     icon: BookOpenCheck,   desc: 'จุดบันทึกที่บันทึกแล้ว' },
  { id: 'feelings', label: 'ความรู้สึก', icon: MessageSquare,   desc: 'แท็กอารมณ์รายวัน' },
];

const FILTER_COLORS: Record<string, string> = {
  mood: '#7c3aed', energy: '#0ea5e9', journal: '#10b981', feelings: '#f59e0b',
};

function MiniTrend({ data, color, gradId }: { data: { date: string; value: number }[]; color: string; gradId: string }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 10]} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${gradId})`}
          dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function TodayTab() {
  const [activeFilters, setActiveFilters] = useState<string[]>(['mood', 'energy', 'journal', 'feelings']);
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [energy, setEnergy] = useState(7);
  const [note, setNote] = useState('');
  const [toast, setToast] = useState('');
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [modalYear, setModalYear] = useState(2026);
  const [modalMonth, setModalMonth] = useState(6);
  const [savedVersion, setSavedVersion] = useState(0);

  const MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayKey = modalDay !== null ? `${modalYear}-${String(modalMonth).padStart(2, '0')}-${String(modalDay).padStart(2, '0')}` : '';
  const dayLabel = modalDay !== null ? `${modalDay} ${MONTH_NAMES_SHORT[modalMonth - 1]} ${modalYear}` : '';

  function notify(m: string) { setToast(m); setTimeout(() => setToast(''), 2800); }
  function toggleFilter(id: string) {
    setActiveFilters(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">

      {/* ── HERO: Calendar Card ── */}
      <motion.div variants={cardEntrance}
        className="relative rounded-3xl overflow-hidden border border-purple-100 dark:border-white/10 shadow-[0_18px_40px_-18px_rgba(124,58,237,0.35)] bg-white dark:bg-[#181a2c]">

        <div className="bg-white dark:bg-[#181a2c] p-5">
          {/* Filter chips */}
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">แสดงบนปฏิทิน</div>
            <div className="flex items-center gap-2 flex-wrap">
              {CAL_FILTERS.map(f => {
                const on = activeFilters.includes(f.id);
                const c = FILTER_COLORS[f.id];
                const Icon = f.icon;
                return (
                  <motion.button key={f.id} onClick={() => toggleFilter(f.id)}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    title={f.desc}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border-2 transition-all duration-200 ${!on ? 'bg-white dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/10' : ''}`}
                    style={on ? {
                      background: c + '12', color: c, borderColor: c + '50',
                      boxShadow: `0 3px 10px ${c}20`,
                    } : undefined}>
                    <Icon size={13} strokeWidth={2.5} />
                    <span>{f.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Calendar */}
          <MoodCalendar
            key={savedVersion}
            showMoods={activeFilters.includes('mood')}
            showEnergyBar={activeFilters.includes('energy')}
            showJournalDot={activeFilters.includes('journal')}
            showFeelings={activeFilters.includes('feelings')}
            onSelectDay={(day, yr, mo) => {
              setModalDay(day);
              setModalYear(yr);
              setModalMonth(mo);
            }}
          />
        </div>
      </motion.div>

      {/* ── Weekly Trends ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={cardEntrance} {...hoverLift} className="bg-white dark:bg-[#181a2c] rounded-2xl border border-purple-50 dark:border-white/8 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/30">
                <TrendingUp size={14} className="text-purple-600" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-gray-800">Mood Trend</div>
                <div className="text-[10px] text-gray-400">7 วันที่ผ่านมา</div>
              </div>
            </div>
            <span className="text-[20px] font-extrabold text-purple-600 leading-none">
              6.8<span className="text-[11px] text-gray-300 font-normal ml-1">/10</span>
            </span>
          </div>
          <MiniTrend data={weeklyMoodTrend} color="#7c3aed" gradId="moodMini3" />
        </motion.div>

        <motion.div variants={cardEntrance} {...hoverLift} className="bg-white dark:bg-[#181a2c] rounded-2xl border border-purple-50 dark:border-white/8 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-50 dark:bg-sky-900/30">
                <Zap size={14} className="text-sky-500" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-gray-800">Energy Trend</div>
                <div className="text-[10px] text-gray-400">7 วันที่ผ่านมา</div>
              </div>
            </div>
            <span className="text-[20px] font-extrabold text-sky-500 leading-none">
              7.1<span className="text-[11px] text-gray-300 font-normal ml-1">/10</span>
            </span>
          </div>
          <MiniTrend data={weeklyEnergyTrend} color="#38bdf8" gradId="energyMini3" />
        </motion.div>
      </div>

      {/* ── Recent Entries ── */}
      <motion.div variants={cardEntrance} {...hoverLift} className="bg-white dark:bg-[#181a2c] rounded-2xl border border-purple-50 dark:border-white/8 shadow-sm p-5">
        <h4 className="text-[13px] font-bold text-gray-800 mb-3">รายการล่าสุด</h4>
        <div className="space-y-2">
          {previousEntries.map(e => {
            const m = MOODS[e.mood];
            const Icon = MOOD_ICONS[e.mood];
            return (
              <motion.div key={e.date} whileHover={{ x: 3 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:border-purple-100 hover:bg-purple-50/20 transition cursor-pointer">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner" style={{ background: m.bg }}>
                  <Icon size={17} strokeWidth={2.4} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-gray-700">{e.date}</div>
                  <div className="text-[11px] text-gray-400 truncate">{e.note}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[15px] font-extrabold text-purple-600 leading-none">{e.score}</div>
                  <div className="text-[9px] text-gray-300">/10</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal */}
      <JournalEntryModal
        open={modalDay !== null}
        dayKey={dayKey}
        dayLabel={dayLabel}
        onClose={() => setModalDay(null)}
        onSaved={() => {
          setSavedVersion(v => v + 1);
          notify('✓ บันทึก Reflection สำเร็จ! — ดูที่ปฏิทินได้เลย');
        }}
        onDeleted={() => {
          setSavedVersion(v => v + 1);
          notify('ลบ Reflection แล้ว');
        }}
      />

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white text-[13px] font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2">
          {toast}
        </motion.div>
      )}
    </motion.div>
  );
}
