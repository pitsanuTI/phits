'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronRight, ChevronLeft, Plus, Check } from 'lucide-react';
import { cardEntrance, hoverLift, staggerContainer, rowStagger, rowEntrance } from '@/lib/animations';
import BottomBar from '../shared/BottomBar';
import { promptCategories, guidedPrompts, reflectionConsistency } from '@/data/mood-journal-mock';

const PROMPT_FILL_IN = [
  { label: 'Selected Prompt Category', desc: 'Choose the right area to focus on' },
  { label: 'Prompt Answers',           desc: 'Reflect and write your response' },
  { label: 'Wins',                     desc: 'Capture your highlights' },
  { label: 'Gratitude',                desc: 'List what you\'re thankful for' },
  { label: 'Improvement',              desc: 'What can you do better?' },
  { label: 'Tomorrow Intention',       desc: 'Set your focus for tomorrow' },
  { label: 'Notes',                    desc: 'Add any other thoughts' },
];

const PREMIUM_MOTION = [
  { icon: '✦', title: 'Card hover glow', desc: 'Soft glow on hover' },
  { icon: '↔', title: 'Prompt slide transition', desc: 'Smooth slide between prompts' },
  { icon: '⌨', title: 'Typing placeholder reveal', desc: 'Animated typing effect' },
  { icon: '✨', title: 'Category chip shimmer', desc: 'Subtle shimmer on hover' },
  { icon: '📅', title: 'Calendar highlight', desc: 'Delightful day highlight' },
  { icon: '◇', title: 'Autosave shimmer', desc: 'Subtle saving feedback' },
];

const JOURNAL_PROMPTS = [
  { key: 'happened', icon: '✨', label: 'What happened today?', ph: 'Write your thoughts...' },
  { key: 'learn',    icon: '📖', label: 'What did I learn?',    ph: 'Write your thoughts...' },
  { key: 'grateful', icon: '💚', label: 'What am I grateful for?', ph: 'List the things you\'re grateful for...' },
  { key: 'improve',  icon: '📈', label: 'What can I improve tomorrow?', ph: 'What can you do better tomorrow?' },
  { key: 'intention',icon: '🎯', label: 'What is my intention for tomorrow?', ph: 'Set your intention for a better tomorrow...' },
  { key: 'notes',    icon: '📝', label: 'Notes (anything else on your mind?)', ph: 'Additional thoughts...' },
];

const STREAK_DAYS = [
  { d: 'Mon', done: true }, { d: 'Tue', done: true }, { d: 'Wed', done: true },
  { d: 'Thu', done: true }, { d: 'Fri', done: true }, { d: 'Sat', done: true }, { d: 'Sun', done: false },
];

export default function PromptsTab() {
  const [activeCat, setActiveCat] = useState('self');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  function notify(m: string) { setToast(m); setTimeout(() => setToast(''), 2500); }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {/* Category cards */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {promptCategories.map(c => (
              <motion.button key={c.id} variants={cardEntrance} onClick={() => setActiveCat(c.id)}
                whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className={`rounded-2xl p-4 text-white flex flex-col items-center gap-1.5 relative overflow-hidden transition-shadow ${activeCat === c.id ? 'ring-2 ring-offset-2 ring-purple-300 shadow-md' : ''}`}
                style={{ background: `linear-gradient(135deg,${c.gradient[0]},${c.gradient[1]})` }}>
                <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                <span className="text-[11px] font-semibold leading-tight text-center">{c.label}</span>
                <span className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-white/10" />
              </motion.button>
            ))}
          </div>

          {/* Guided prompts + streak + calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Guided prompts */}
            <motion.div variants={cardEntrance} {...hoverLift}
              className="rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}>
                <h3 className="text-[13px] font-semibold text-white flex items-center gap-1.5">Guided Prompts</h3>
                <p className="text-[10px] text-white/80">Choose a prompt to reflect and grow.</p>
              </div>
              <motion.div variants={rowStagger} initial="hidden" animate="visible" className="p-3 space-y-2">
                {guidedPrompts.map(p => (
                  <motion.button key={p.id} variants={rowEntrance} whileHover={{ x: 3 }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/40 transition text-left">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.categoryColor + '18' }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.categoryColor }} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-gray-700 truncate">{p.question}</div>
                      <div className="text-[10px]" style={{ color: p.categoryColor }}>{p.category}</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                  </motion.button>
                ))}
                <button className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-purple-200 text-[12px] text-purple-600 hover:bg-purple-50 transition">
                  <Plus size={13} /> Browse all prompts <span className="text-gray-400">120+ prompts</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Streak + consistency */}
            <motion.div variants={cardEntrance} {...hoverLift} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4 flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div>
                    <div className="text-[13px] font-semibold text-gray-800">Prompt Streak</div>
                    <div className="text-[10px] text-gray-400">Keep your reflection streak alive!</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-orange-500 mb-2">18 <span className="text-sm font-normal text-gray-400">days</span></div>
                <div className="flex gap-1.5">
                  {STREAK_DAYS.map(s => (
                    <div key={s.d} className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${s.done ? 'bg-purple-100' : 'bg-gray-50 border border-dashed border-gray-200'}`}>
                        {s.done ? <Check size={13} className="text-purple-600" /> : null}
                      </div>
                      <span className="text-[9px] text-gray-400">{s.d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[12px] font-semibold text-gray-700 flex items-center gap-1">Reflection Consistency</div>
                  <span className="text-[10px] text-gray-400 border border-gray-100 rounded px-1.5 py-0.5">7 Days ▾</span>
                </div>
                <ResponsiveContainer width="100%" height={90}>
                  <LineChart data={reflectionConsistency} margin={{ top: 6, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff' }} />
                    <Line type="monotone" dataKey="value" stroke="#7c5cbf" strokeWidth={2} dot={{ r: 3, fill: '#7c5cbf' }} isAnimationActive animationDuration={800} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Mini calendar */}
            <motion.div variants={cardEntrance} {...hoverLift} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <ChevronLeft size={14} className="text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-700">May 2025</span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-[9px] text-gray-400 font-medium">{d}</div>
                ))}
                {[27, 28, 29, 30].map(d => <div key={`l${d}`} className="text-[10px] text-gray-300 py-1">{d}</div>)}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                  const done = [5, 7, 12, 14, 20, 21, 23, 27, 30].includes(d);
                  return (
                    <div key={d} className={`text-[10px] py-1 rounded-md ${done ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-500'}`}>{d}</div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50 text-[9px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />Completed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200" />No entry</span>
              </div>
            </motion.div>
          </div>

          {/* Today's Guided Journal */}
          <motion.div variants={cardEntrance}
            className="rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">Today&apos;s Guided Journal</h3>
                <p className="text-[10px] text-white/80">Answer your prompts. Your thoughts are private and safe.</p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-white bg-white/20 px-2.5 py-1 rounded-lg">
                <Check size={11} /> Autosaved
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3" style={{ background: 'linear-gradient(135deg,#faf8ff,#f5f0ff)' }}>
              {JOURNAL_PROMPTS.map(p => (
                <div key={p.key}>
                  <label className="text-[12px] text-gray-600 font-medium mb-1 flex items-center gap-1.5">{p.label}</label>
                  <div className="relative">
                    <textarea rows={2} value={fields[p.key] ?? ''} onChange={e => setFields(f => ({ ...f, [p.key]: e.target.value }))}
                      placeholder={p.ph} maxLength={1000}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-[12px] focus:outline-none focus:border-purple-400 resize-none" />
                    <span className="absolute bottom-1.5 right-2 text-[9px] text-gray-300">{(fields[p.key] ?? '').length} / 1000</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <BottomBar saveLabel="Save Journal Entry" onClear={() => { setFields({}); notify('ล้างฟอร์มแล้ว'); }} onSave={() => notify('บันทึก Journal Entry สำเร็จ!')} />
        </div>

      </div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl z-50">
          ✓ {toast}
        </motion.div>
      )}
    </motion.div>
  );
}
