'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Flame, Zap, AlertCircle, HelpCircle, Plus, Check, ChevronDown, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { cardEntrance, hoverLift, staggerContainer, rowStagger, rowEntrance } from '@/lib/animations';
import { emotionTriggers, triggerStats } from '@/data/mood-journal-mock';
import type { TriggerType, EmotionTrigger } from '@/data/mood-journal-mock';

const TRIGGERS_KEY = 'alpha_mood_triggers';

const REFLECT_FIELDS = [
  {
    key: 'happened', icon: '📝',
    label: 'วันนี้เกิดอะไรขึ้น?',
    hint: 'เล่าให้ตัวเองฟัง — เหตุการณ์ ความรู้สึก สิ่งที่ได้เจอ',
    ph: 'วันนี้ฉันเจอ...',
  },
  {
    key: 'learned', icon: '💡',
    label: 'ฉันเรียนรู้อะไรจากวันนี้?',
    hint: 'บทเรียนที่ได้จากเหตุการณ์ — เล็กหรือใหญ่ก็มีค่าเท่ากัน',
    ph: 'สิ่งที่ฉันได้เรียนรู้คือ...',
  },
  {
    key: 'prevent', icon: '🛡️',
    label: 'ครั้งหน้าจะทำยังไงให้ต่างออกไป?',
    hint: 'วางแผนป้องกัน — เพื่อไม่ให้เจอปัญหาเดิมซ้ำ',
    ph: 'ครั้งต่อไปฉันจะ...',
  },
];

const TRIGGER_TYPES = [
  { id: 'anger' as TriggerType,   label: 'หัวร้อน',       icon: Flame,       color: '#f43f5e', bg: '#fff1f2' },
  { id: 'impulse' as TriggerType, label: 'ตัดสินใจเร็ว', icon: Zap,         color: '#f59e0b', bg: '#fffbeb' },
  { id: 'fear' as TriggerType,    label: 'กลัว/FOMO',    icon: AlertCircle, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'doubt' as TriggerType,   label: 'ลังเล',         icon: HelpCircle,  color: '#38bdf8', bg: '#f0f9ff' },
];

const STREAK_DAYS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
const STREAK_DONE = [true, true, true, true, true, true, false];

export default function ReflectTab() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');

  // Trigger logger state
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [triggerType, setTriggerType] = useState<TriggerType>('anger');
  const [triggerText, setTriggerText] = useState('');
  const [consequenceText, setConsequenceText] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [expandedTrigger, setExpandedTrigger] = useState<string | null>(null);
  const [localTriggers, setLocalTriggers] = useState<EmotionTrigger[]>(emotionTriggers);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(TRIGGERS_KEY);
      if (raw) setLocalTriggers(JSON.parse(raw) as EmotionTrigger[]);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(TRIGGERS_KEY, JSON.stringify(localTriggers)); } catch {}
  }, [localTriggers, hydrated]);

  function notify(m: string) { setToast(m); setTimeout(() => setToast(''), 2500); }

  function handleSaveReflect() {
    const filled = Object.values(fields).some(v => v.trim());
    if (!filled) { notify('กรุณากรอกอย่างน้อย 1 ช่อง'); return; }
    notify('บันทึก Reflection สำเร็จ!');
    setFields({});
  }

  function handleAddTrigger() {
    if (!triggerText.trim()) return;
    const typeInfo = TRIGGER_TYPES.find(t => t.id === triggerType)!;
    const newTrigger: EmotionTrigger = {
      id: `t${Date.now()}`,
      date: 'Jun 6, 2026',
      type: triggerType,
      label: typeInfo.label,
      trigger: triggerText,
      consequence: consequenceText,
      lesson: lessonText,
      color: typeInfo.color,
      resolved: false,
    };
    setLocalTriggers(p => [newTrigger, ...p]);
    setTriggerText('');
    setConsequenceText('');
    setLessonText('');
    setShowTriggerForm(false);
    notify('บันทึก Trigger สำเร็จ!');
  }

  function markResolved(id: string) {
    setLocalTriggers(p => p.map(t => t.id === id ? { ...t, resolved: true } : t));
    notify('ทำเครื่องหมายว่าแก้ไขแล้ว ✓');
  }

  const allFilled = REFLECT_FIELDS.every(f => (fields[f.key] ?? '').trim().length > 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-4 min-w-0">

      {/* Header */}
      <motion.div variants={cardEntrance}
        className="rounded-2xl overflow-hidden border border-purple-100 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
          <div>
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2">
              <Brain size={17} /> Self-Reflection
            </h3>
            <p className="text-[11px] text-white/75 mt-0.5">พูดคุยกับตัวเอง — เรียนรู้และเติบโตทุกวัน</p>
          </div>
          {/* Streak */}
          <div className="text-right">
            <div className="text-[10px] text-white/70 mb-1">Streak สัปดาห์นี้</div>
            <div className="flex gap-1">
              {STREAK_DAYS.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-0.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${STREAK_DONE[i] ? 'bg-white/25' : 'bg-white/10 border border-dashed border-white/30'}`}>
                    {STREAK_DONE[i] && <Check size={11} className="text-white" />}
                  </div>
                  <span className="text-[8px] text-white/60">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reflection form */}
        <div className="bg-white p-5 space-y-4">
          {REFLECT_FIELDS.map((f, i) => (
            <motion.div key={f.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <label className="flex items-center gap-2 text-[13px] font-bold text-gray-800 mb-1">
                <span>{f.icon}</span> {f.label}
              </label>
              <p className="text-[11px] text-gray-400 mb-2">{f.hint}</p>
              <textarea
                rows={3} value={fields[f.key] ?? ''}
                onChange={e => setFields(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.ph}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-[13px] text-gray-700 focus:outline-none focus:border-purple-400 resize-none transition placeholder:text-gray-300"
              />
            </motion.div>
          ))}

          <div className="flex items-center justify-between pt-1">
            {allFilled ? (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-medium">
                <CheckCircle2 size={13} /> ครบทุกช่องแล้ว!
              </span>
            ) : (
              <span className="text-[11px] text-gray-400">{Object.values(fields).filter(v => v.trim()).length}/{REFLECT_FIELDS.length} ช่อง</span>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSaveReflect}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              บันทึก Reflection
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Emotion Trigger Logger */}
      <motion.div variants={cardEntrance} className="rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
          <div>
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
              <Flame size={15} /> Emotion Trigger Log
            </h3>
            <p className="text-[10px] text-white/75 mt-0.5">จดบันทึกเมื่อ "หัวร้อน" หรือ "ตัดสินใจเร็ว" — เพื่อหยุดวงจรนี้</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowTriggerForm(p => !p)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/25 hover:bg-white/35 rounded-xl text-[12px] font-semibold text-white transition">
            <Plus size={13} /> เพิ่ม Trigger
          </motion.button>
        </div>

        <div className="bg-white">
          {/* Add Trigger Form */}
          <AnimatePresence>
            {showTriggerForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-orange-100">
                <div className="p-5 space-y-3" style={{ background: 'linear-gradient(to bottom,#fffbeb,#fff)' }}>
                  {/* Type selector */}
                  <div>
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">ประเภท Trigger</div>
                    <div className="flex gap-2 flex-wrap">
                      {TRIGGER_TYPES.map(t => {
                        const Icon = t.icon;
                        const active = triggerType === t.id;
                        return (
                          <button key={t.id} onClick={() => setTriggerType(t.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[12px] font-semibold transition"
                            style={active ? { borderColor: t.color, background: t.bg, color: t.color } : { borderColor: '#e5e7eb', color: '#9ca3af' }}>
                            <Icon size={13} /> {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Trigger คืออะไร?</label>
                    <input value={triggerText} onChange={e => setTriggerText(e.target.value)}
                      placeholder="เช่น: Trade loss ทำให้ไม่ยอมตัด stop loss"
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-[13px] focus:outline-none focus:border-amber-400 transition" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">ผลที่เกิดขึ้น</label>
                      <input value={consequenceText} onChange={e => setConsequenceText(e.target.value)}
                        placeholder="เช่น: ขาดทุนเพิ่มอีก 2%"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-[13px] focus:outline-none focus:border-amber-400 transition" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1">บทเรียน / Plan แก้ไข</label>
                      <input value={lessonText} onChange={e => setLessonText(e.target.value)}
                        placeholder="เช่น: ตั้ง stop loss ก่อนกดปุ่มเสมอ"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 text-[13px] focus:outline-none focus:border-amber-400 transition" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowTriggerForm(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition">
                      ยกเลิก
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={handleAddTrigger}
                      className="px-5 py-2 rounded-xl text-[12px] font-bold text-white shadow-sm"
                      style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
                      บันทึก Trigger
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trigger list */}
          <motion.div variants={rowStagger} initial="hidden" animate="visible" className="divide-y divide-gray-50">
            {localTriggers.slice(0, 5).map(t => {
              const isOpen = expandedTrigger === t.id;
              const typeInfo = TRIGGER_TYPES.find(x => x.id === t.type)!;
              const Icon = typeInfo?.icon ?? Flame;
              return (
                <motion.div key={t.id} variants={rowEntrance}>
                  <div onClick={() => setExpandedTrigger(isOpen ? null : t.id)}
                    className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors ${isOpen ? 'bg-orange-50/40' : 'hover:bg-gray-50'}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: t.color + '18' }}>
                      <Icon size={15} style={{ color: t.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: t.color + '15', color: t.color }}>{t.label}</span>
                        <span className="text-[11px] text-gray-500 truncate">{t.trigger}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.date}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {t.resolved ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-lg">
                          <Check size={10} /> แก้ไขแล้ว
                        </span>
                      ) : (
                        <button onClick={e => { e.stopPropagation(); markResolved(t.id); }}
                          className="text-[10px] text-gray-400 hover:text-emerald-500 border border-gray-200 hover:border-emerald-300 px-2 py-0.5 rounded-lg transition">
                          Mark Done
                        </button>
                      )}
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown size={13} className="text-gray-400" />
                      </motion.div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-5 pb-4 pt-1">
                          <div className="rounded-xl p-3 border" style={{ background: t.color + '08', borderColor: t.color + '25' }}>
                            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: t.color }}>Trigger ที่เกิด</div>
                            <div className="text-[12px] text-gray-700 leading-snug">{t.trigger || '—'}</div>
                          </div>
                          <div className="bg-orange-50/60 rounded-xl p-3 border border-orange-100">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-orange-600 mb-1">ผลที่เกิดขึ้น</div>
                            <div className="text-[12px] text-gray-700 leading-snug">{t.consequence || '—'}</div>
                          </div>
                          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 mb-1">บทเรียน / Plan</div>
                            <div className="text-[12px] text-gray-700 leading-snug">{t.lesson || '—'}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* Trigger Pattern Stats */}
      <motion.div variants={cardEntrance} {...hoverLift} className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
        <h4 className="text-[13px] font-bold text-gray-800 mb-1">รูปแบบ Trigger ของคุณ</h4>
        <p className="text-[11px] text-gray-400 mb-4">วิเคราะห์จาก triggers ที่บันทึกไว้ — เพื่อรู้จักตัวเองมากขึ้น</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bar chart */}
          <div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={triggerStats} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 50]} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff' }}
                  formatter={(v: number) => [`${v}%`, 'สัดส่วน']} />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} maxBarSize={20} isAnimationActive animationDuration={700}>
                  {triggerStats.map((t, i) => <Cell key={i} fill={t.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Breakdown cards */}
          <div className="grid grid-cols-2 gap-2">
            {triggerStats.map(t => (
              <div key={t.label} className="rounded-xl p-3 border-2 flex flex-col gap-1"
                style={{ borderColor: t.color + '30', background: t.color + '08' }}>
                <div className="text-[18px] font-extrabold leading-none" style={{ color: t.color }}>{t.count}</div>
                <div className="text-[10px] font-bold" style={{ color: t.color }}>{t.label}</div>
                <div className="text-[9px] text-gray-400">{t.pct}% ของทั้งหมด</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-50 text-[11px] text-gray-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>หัวร้อน + ตัดสินใจเร็ว คิดเป็น <strong className="text-gray-600">75%</strong> ของ triggers ทั้งหมด — ควรโฟกัสที่นี่ก่อน</span>
        </div>
      </motion.div>

      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl z-50">
          ✓ {toast}
        </motion.div>
      )}
    </motion.div>
  );
}
