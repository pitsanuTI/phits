'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { ChevronLeft, ChevronRight, ArrowRight, Check } from 'lucide-react';
import { cardEntrance, hoverLift, staggerContainer, rowStagger, rowEntrance } from '@/lib/animations';
import BottomBar from '../shared/BottomBar';
import { moneyEmotionTrend, manifestationConsistency, moneyEntries, whatToFillIn } from '@/data/mood-journal-mock';

const KPI_CARDS = [
  { label: 'Money Confidence',        value: '7.6', unit: '/10', sub: '↑ 1.2 vs last week', icon: '👑', grad: ['#7c5cbf', '#a78bfa'] },
  { label: 'Money Emotion Score',     value: '8.1', unit: '/10', sub: '↑ 0.9 vs last week', icon: '😊', grad: ['#10b981', '#34d399'] },
  { label: 'Aligned Actions This Week', value: '4', unit: '/7',  sub: '57% completed',      icon: '✅', grad: ['#38bdf8', '#7dd3fc'] },
  { label: 'Savings / Budget Check-ins', value: '5', unit: '/7', sub: '71% completed',      icon: '🐷', grad: ['#f59e0b', '#fbbf24'] },
];

const PREMIUM_MOTION = [
  { icon: '✦', title: 'Affirmation fade-in', desc: 'Encouraging words appear gently' },
  { icon: '📈', title: 'Chart grow', desc: 'Charts animate with smooth growth' },
  { icon: '▢', title: 'Card hover lift', desc: 'Subtle lift and glow on hover' },
  { icon: '◌', title: 'Calendar pulse', desc: 'Days with entries gently pulse' },
  { icon: '🔄', title: 'Reframe flip card', desc: 'Flip between belief and reframe' },
  { icon: '◇', title: 'Smooth form autosave', desc: 'Your progress saves seamlessly' },
];

const ENTRY_FIELDS = [
  { key: 'feel',   icon: '😊', ph: 'How do you feel about money today?' },
  { key: 'belief', icon: '💭', ph: 'What money belief came up?' },
  { key: 'manifest', icon: '✨', ph: 'Money manifestation statement' },
  { key: 'gratitude', icon: '💚', ph: 'Money gratitude' },
  { key: 'action', icon: '💰', ph: 'What aligned financial action did you take?' },
  { key: 'intention', icon: '🎯', ph: 'Next money intention' },
];

function MoneyTick({ x, y, payload }: { x: number; y: number; payload: { value: number } }) {
  return <text x={x - 6} y={y + 4} fontSize={9} textAnchor="middle">{payload.value}</text>;
}

export default function MoneyMindsetTab() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  function notify(m: string) { setToast(m); setTimeout(() => setToast(''), 2500); }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {KPI_CARDS.map(k => (
              <motion.div key={k.label} variants={cardEntrance} whileHover={{ y: -4 }}
                className="rounded-2xl p-4 text-white relative overflow-hidden shadow-sm"
                style={{ background: `linear-gradient(135deg,${k.grad[0]},${k.grad[1]})` }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[12px] font-medium text-white/90 leading-tight">{k.label}</span>
                  <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                  </span>
                </div>
                <div className="text-2xl font-bold leading-none">
                  {k.value}<span className="text-sm font-normal text-white/80 ml-1">{k.unit}</span>
                </div>
                <div className="text-[10px] text-white/80 mt-2">{k.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Trend + Manifestation + Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Emotion trend */}
            <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}>
                <h3 className="text-[13px] font-semibold text-white">Money Emotion Trend</h3>
                <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded">This Week ▾</span>
              </div>
              <div className="p-3">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={moneyEmotionTrend} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={<MoneyTick />} axisLine={false} tickLine={false} width={26} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff' }} />
                    <Line type="monotone" dataKey="value" stroke="#7c5cbf" strokeWidth={2.5}
                      dot={{ r: 3, fill: '#fff', stroke: '#7c5cbf', strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={900} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Manifestation consistency */}
            <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                <h3 className="text-[13px] font-semibold text-white">Manifestation Consistency</h3>
                <span className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded">This Month ▾</span>
              </div>
              <div className="p-3">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={manifestationConsistency} margin={{ top: 16, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ecfdf5" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 7, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #d1fae5' }} formatter={(v: number) => [`${v}%`, '']} />
                    <Bar dataKey="pct" radius={[5, 5, 0, 0]} maxBarSize={32} isAnimationActive animationDuration={800}>
                      {manifestationConsistency.map((_, i) => <Cell key={i} fill="#34d399" />)}
                      <LabelList dataKey="pct" position="top" formatter={(v: number) => `${v}%`} fontSize={9} fill="#10b981" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-right text-[10px] text-emerald-500 font-medium -mt-1">Goal 70%</div>
              </div>
            </motion.div>

            {/* Calendar */}
            <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#38bdf8,#7dd3fc)' }}>
                <ChevronLeft size={14} className="text-white" />
                <h3 className="text-[13px] font-semibold text-white">May 2025</h3>
                <ChevronRight size={14} className="text-white" />
              </div>
              <div className="p-3">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="text-[9px] text-gray-400 font-medium">{d}</div>)}
                  {[27, 28, 29, 30].map(d => <div key={`l${d}`} className="text-[10px] text-gray-300 py-0.5">{d}</div>)}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                    const entry = [1, 8, 15, 20, 22].includes(d);
                    const sel = d === 20;
                    return (
                      <div key={d} className="relative text-[10px] py-0.5 text-gray-500">
                        <span className={sel ? 'w-5 h-5 rounded-full bg-purple-600 text-white inline-flex items-center justify-center font-semibold' : ''}>{d}</span>
                        {entry && !sel && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[9px] text-gray-400 mt-2 pt-2 border-t border-gray-50 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Money journal entry
                </div>
              </div>
            </motion.div>
          </div>

          {/* Belief Reframe + Entry form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Belief reframe */}
            <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg,#f43f5e,#fb7185)' }}>
                <h3 className="text-[13px] font-semibold text-white flex items-center gap-1.5">Belief Reframe</h3>
              </div>
              <div className="p-4">
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 bg-red-50/60 rounded-xl p-3 border border-red-100">
                    <div className="text-[10px] font-semibold text-red-500 mb-1 flex items-center gap-1">Limiting Belief</div>
                    <div className="text-[12px] text-gray-600">Money is hard to earn and easy to lose.</div>
                  </div>
                  <div className="flex items-center">
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
                      className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
                      <ArrowRight size={15} className="text-white" />
                    </motion.div>
                  </div>
                  <div className="flex-1 bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                    <div className="text-[10px] font-semibold text-emerald-600 mb-1 flex items-center gap-1">Reframed Belief</div>
                    <div className="text-[12px] text-gray-600">I attract, manage, and grow money with ease and wisdom.</div>
                  </div>
                </div>
                <div className="text-center text-[11px] text-pink-500 mt-3 flex items-center justify-center gap-1">
                  Repeat this reframe daily to rewire your mindset.
                </div>
              </div>
            </motion.div>

            {/* Entry form */}
            <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg,#38bdf8,#7dd3fc)' }}>
                <h3 className="text-[13px] font-semibold text-white flex items-center gap-1.5">Money Mindset Entry</h3>
              </div>
              <div className="p-4 space-y-2">
                {ENTRY_FIELDS.map(f => (
                  <div key={f.key} className="relative">
                    <input value={fields[f.key] ?? ''} onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[12px] focus:outline-none focus:border-sky-400" />
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-emerald-500"><Check size={11} /> Auto-saved just now</span>
                  <button onClick={() => notify('บันทึก Entry แล้ว')} className="text-[11px] font-semibold text-white px-3 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg,#7c5cbf,#a78bfa)' }}>Save Entry</button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent entries */}
          <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
              <h3 className="text-[13px] font-semibold text-white flex items-center gap-1.5">Recent Money Mindset Entries</h3>
            </div>
            <motion.div variants={rowStagger} initial="hidden" animate="visible" className="p-4 space-y-3">
              {moneyEntries.map(e => (
                <motion.div key={e.date} variants={rowEntrance} whileHover={{ x: 3 }}
                  className="flex items-start gap-3 cursor-pointer">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: e.dotColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-gray-700">{e.date}</span>
                      <span className="text-[11px] text-gray-500">{e.emotion}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 leading-snug">{e.note}</div>
                  </div>
                  <span className="text-[12px] font-bold text-gray-600 flex-shrink-0">{e.score}/10</span>
                </motion.div>
              ))}
              <button className="w-full text-[11px] text-purple-600 hover:underline pt-1">View All Entries</button>
            </motion.div>
          </motion.div>

          <BottomBar saveLabel="Save Money Mindset Entry" onClear={() => { setFields({}); notify('ล้างฟอร์มแล้ว'); }} onSave={() => notify('บันทึก Money Mindset Entry สำเร็จ!')} />
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
