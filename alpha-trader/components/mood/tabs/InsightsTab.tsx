'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { cardEntrance, hoverLift, staggerContainer, rowStagger, rowEntrance } from '@/lib/animations';
import { MoodHeatmap } from '../shared/MoodCalendar';
import {
  moodTrend30, energyTrend30, correlations, themeWords, improvementThemes,
  lessonFrequency, triggerStats,
} from '@/data/mood-journal-mock';
import type { TrendPoint } from '@/types/mood-journal';

const KPI_CARDS = [
  { label: 'Average Mood',      value: '4.0', unit: '/5',   sub: '↑ 0.4 vs เดือนก่อน', grad: ['#7c3aed', '#a855f7'] },
  { label: 'Average Energy',    value: '6.6', unit: '/10',  sub: '↑ 0.8 vs เดือนก่อน', grad: ['#10b981', '#34d399'] },
  { label: 'Reflection Streak', value: '6',   unit: 'วัน',  sub: 'Best: 14 วัน',         grad: ['#f59e0b', '#fbbf24'] },
  { label: 'Triggers Logged',   value: '5',   unit: 'รายการ', sub: 'เดือนนี้',            grad: ['#f43f5e', '#fb7185'] },
];

const THEME_COLORS = ['#7c3aed', '#10b981', '#38bdf8', '#f59e0b', '#f43f5e', '#a78bfa'];

function TrendCard({ title, data, color, gradId, badge }: { title: string; data: TrendPoint[]; color: string; gradId: string; badge: string }) {
  return (
    <motion.div variants={cardEntrance} {...hoverLift} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-bold text-gray-800">{title}</h3>
        <button className="text-[11px] text-gray-500 border border-gray-100 rounded-lg px-2.5 py-1 hover:border-purple-200 transition">{badge} ▾</button>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill={`url(#${gradId})`}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default function InsightsTab() {
  const [toast, setToast] = useState('');
  function notify(m: string) { setToast(m); setTimeout(() => setToast(''), 2500); }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_CARDS.map(k => (
          <motion.div key={k.label} variants={cardEntrance} whileHover={{ y: -4 }}
            className="rounded-2xl p-4 text-white relative overflow-hidden shadow-sm"
            style={{ background: `linear-gradient(135deg,${k.grad[0]},${k.grad[1]})` }}>
            <div className="text-[11px] font-medium text-white/85 leading-tight mb-2">{k.label}</div>
            <div className="text-[26px] font-extrabold leading-none">
              {k.value}<span className="text-[12px] font-normal text-white/75 ml-1">{k.unit}</span>
            </div>
            <div className="text-[10px] text-white/70 mt-1.5">{k.sub}</div>
            <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-white/10" />
          </motion.div>
        ))}
      </div>

      {/* Mood + Energy Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TrendCard title="Mood Trend" data={moodTrend30} color="#7c3aed" gradId="moodTrend2" badge="Last 30 Days" />
        <TrendCard title="Energy Trend" data={energyTrend30} color="#38bdf8" gradId="energyTrend2" badge="Last 30 Days" />
      </div>

      {/* Lesson Frequency + Trigger Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Lesson Frequency */}
        <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
            <div>
              <h3 className="text-[13px] font-bold text-white">บทเรียนที่บันทึก / สัปดาห์</h3>
              <p className="text-[10px] text-white/75">จำนวนครั้งที่เขียน lesson ในแต่ละสัปดาห์</p>
            </div>
          </div>
          <div className="bg-white p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={lessonFrequency} margin={{ top: 14, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecfdf5" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #d1fae5' }} formatter={(v: number) => [v, 'บทเรียน']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36} isAnimationActive animationDuration={800} fill="#10b981">
                  <LabelList dataKey="value" position="top" fontSize={10} fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-emerald-600 mt-1 text-right font-medium">เป้าหมาย: 5 บทเรียน/สัปดาห์</div>
          </div>
        </motion.div>

        {/* Trigger Patterns */}
        <motion.div variants={cardEntrance} {...hoverLift} className="rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
          <div className="px-5 py-3"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
            <h3 className="text-[13px] font-bold text-white">รูปแบบ Emotion Trigger</h3>
            <p className="text-[10px] text-white/75">สัดส่วน trigger ที่เกิดซ้ำมากที่สุด</p>
          </div>
          <div className="bg-white p-4 space-y-3">
            {triggerStats.map(t => (
              <div key={t.label}>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                    {t.label}
                  </span>
                  <span className="font-extrabold" style={{ color: t.color }}>{t.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-2 rounded-full"
                    style={{ background: t.color }}
                    initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.7 }} />
                </div>
              </div>
            ))}
            <div className="text-[10px] text-gray-400 pt-1">% ของ triggers ทั้งหมดที่บันทึกไว้</div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Heatmap + Correlations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={cardEntrance} {...hoverLift} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold text-gray-800">Monthly Heatmap</h3>
            <button className="text-[11px] text-gray-500 border border-gray-100 rounded-lg px-2.5 py-1 hover:border-purple-200 transition">Jun 2026 ▾</button>
          </div>
          <MoodHeatmap />
        </motion.div>

        <motion.div variants={cardEntrance} {...hoverLift} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
          <h3 className="text-[13px] font-bold text-gray-800 mb-3">Correlations <span className="text-gray-400 font-normal text-xs">30 วันที่ผ่านมา</span></h3>
          <div className="space-y-3">
            {correlations.map(c => (
              <div key={c.labelA} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-28 flex-shrink-0 text-[11px] text-gray-600">
                  {c.labelA}<span className="text-gray-300 mx-0.5">vs</span>{c.labelB}
                </div>
                <div className="flex-1 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                      <XAxis dataKey="x" type="number" hide domain={[0, 10]} />
                      <YAxis dataKey="y" type="number" hide domain={[0, 10]} />
                      <Scatter data={c.points} fill={c.color} fillOpacity={0.55} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-right flex-shrink-0 w-16">
                  <div className="text-[12px] font-extrabold" style={{ color: c.color }}>r = {c.r}</div>
                  <div className="text-[9px] text-gray-400">{c.strength}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Word cloud */}
        <motion.div variants={cardEntrance} {...hoverLift}
          className="rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
            <h3 className="text-[13px] font-bold text-white">Top Themes ใน Reflections</h3>
          </div>
          <div className="p-5 flex flex-wrap gap-x-3 gap-y-2 items-center justify-center bg-white">
            {themeWords.map((t, i) => (
              <motion.span key={t.word}
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.12 }}
                className="font-extrabold cursor-pointer leading-none"
                style={{
                  fontSize: `${0.65 + t.weight * 0.22}rem`,
                  color: THEME_COLORS[i % THEME_COLORS.length],
                  opacity: 0.5 + t.weight * 0.1,
                }}>
                {t.word}
              </motion.span>
            ))}
          </div>
          <div className="px-5 pb-3 text-[10px] text-gray-400 bg-white">⊙ จากบันทึกทั้งหมดปี 2026</div>
        </motion.div>

        {/* Improvement themes */}
        <motion.div variants={cardEntrance} {...hoverLift}
          className="rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
            <h3 className="text-[13px] font-bold text-white">สิ่งที่ต้องปรับปรุง</h3>
          </div>
          <motion.div variants={rowStagger} initial="hidden" animate="visible" className="p-5 space-y-3 bg-white">
            {improvementThemes.map(t => (
              <motion.div key={t.label} variants={rowEntrance}>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-gray-700 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />{t.label}
                  </span>
                  <span className="font-extrabold text-amber-500">{t.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                    initial={{ width: 0 }} animate={{ width: `${t.pct}%` }} transition={{ duration: 0.65 }} />
                </div>
              </motion.div>
            ))}
            <div className="text-[10px] text-gray-400 pt-1">% ของ reflections ที่กล่าวถึงเรื่องนี้</div>
          </motion.div>
        </motion.div>
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
