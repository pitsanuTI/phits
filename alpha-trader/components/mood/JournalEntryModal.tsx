'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, CalendarDays, Plus, Star, Zap } from 'lucide-react';
import {
  REFLECTION_SECTIONS, EMPTY_REFLECTION, getEntry, saveEntry, deleteEntry,
  loadFeelings, addCustomFeeling,
  type JournalReflection, type FeelingTag,
} from '@/lib/journalStore';
import { useEscClose } from '@/lib/useEscClose';

interface Props {
  open: boolean;
  dayKey: string;
  dayLabel: string;
  onClose: () => void;
  onSaved?: (dayKey: string) => void;
  onDeleted?: (dayKey: string) => void;
}

const FEELING_COLORS = [
  '#7c5cbf', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e',
  '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#6366f1', '#14b8a6', '#e879f9', '#fb923c', '#22d3ee',
];

function getFeelingColor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return FEELING_COLORS[Math.abs(hash) % FEELING_COLORS.length];
}

export default function JournalEntryModal({ open, dayKey, dayLabel, onClose, onSaved, onDeleted }: Props) {
  const [data, setData] = useState<JournalReflection>(EMPTY_REFLECTION);
  const [existing, setExisting] = useState(false);
  const [allFeelings, setAllFeelings] = useState<FeelingTag[]>([]);
  const [feelingSearch, setFeelingSearch] = useState('');
  const [showFeelingDropdown, setShowFeelingDropdown] = useState(false);
  const feelingRef = useRef<HTMLDivElement>(null);

  useEscClose(onClose, open);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const e = getEntry(dayKey);
      setData(e ?? EMPTY_REFLECTION);
      setExisting(!!e);
      setAllFeelings(loadFeelings());
      setFeelingSearch('');
      setShowFeelingDropdown(false);
    });
    return () => { cancelled = true; };
  }, [open, dayKey]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (feelingRef.current && !feelingRef.current.contains(e.target as Node)) {
        setShowFeelingDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSave() {
    saveEntry(dayKey, data);
    onSaved?.(dayKey);
    onClose();
  }
  function handleDelete() {
    deleteEntry(dayKey);
    onDeleted?.(dayKey);
    onClose();
  }

  function toggleFeeling(f: FeelingTag) {
    setData(p => ({
      ...p,
      feelings: p.feelings.some(x => x.label === f.label)
        ? p.feelings.filter(x => x.label !== f.label)
        : [...p.feelings, f],
    }));
  }

  function handleCreateFeeling() {
    const trimmed = feelingSearch.trim();
    if (!trimmed) return;
    const newTag: FeelingTag = { icon: '', label: trimmed };
    addCustomFeeling(newTag);
    setAllFeelings(loadFeelings());
    setData(p => ({ ...p, feelings: [...p.feelings, newTag] }));
    setFeelingSearch('');
  }

  const filteredFeelings = allFeelings.filter(f =>
    f.label.toLowerCase().includes(feelingSearch.toLowerCase())
  );

  const isNewFeeling = !!feelingSearch.trim() &&
    !allFeelings.some(f => f.label.toLowerCase() === feelingSearch.trim().toLowerCase());

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]"
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-5 text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <CalendarDays size={20} />
                </span>
                <div>
                  <div className="text-[15px] font-bold leading-tight">Daily Reflection</div>
                  <div className="text-[12px] text-white/80">{dayLabel}</div>
                </div>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition">
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div className="max-h-[62vh] overflow-y-auto px-6 py-5 space-y-5">

              {/* Title field */}
              <div>
                <label className="text-[13px] font-bold text-gray-800 dark:text-gray-100 mb-1.5 block">
                  หัวเรื่องวันนี้
                </label>
                <p className="mb-2 text-[11px] text-gray-400">ตั้งชื่อให้วันนี้ — จะแสดงเป็นหัวเรื่องในปฏิทิน</p>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData(p => ({ ...p, title: e.target.value }))}
                  placeholder="เช่น Focused Day, Recovery Day, Big Win..."
                  className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-[14px] font-semibold outline-none focus:border-purple-400 transition dark:border-white/10 dark:bg-[#14162a] dark:text-gray-100"
                />
              </div>

              {/* Score */}
              <div>
                <label className="text-[13px] font-bold text-gray-800 dark:text-gray-100 mb-1.5 block">
                  คะแนนวันนี้
                </label>
                <p className="mb-2 text-[11px] text-gray-400">ให้คะแนนวันนี้ 1-10 — จะแสดงในปฏิทิน</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} onClick={() => setData(p => ({ ...p, score: n }))}
                        className={`w-9 h-9 rounded-xl text-[13px] font-bold transition-all ${
                          data.score === n
                            ? 'bg-purple-600 text-white shadow-lg scale-110'
                            : data.score >= n
                              ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-purple-500" fill={data.score >= 7 ? '#7c3aed' : 'none'} />
                    <span className="text-[15px] font-extrabold text-purple-600">{data.score}/10</span>
                  </div>
                </div>
              </div>

              {/* Energy */}
              <div>
                <label className="text-[13px] font-bold text-gray-800 dark:text-gray-100 mb-1.5 block flex items-center gap-1.5">
                  <Zap size={13} className="text-sky-400" /> พลังงานวันนี้
                </label>
                <p className="mb-2 text-[11px] text-gray-400">ระดับพลังงานโดยรวม 1 = หมดแรงมาก, 10 = พลังสูงสุด</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range" min={1} max={10} value={data.energy ?? 5}
                      onChange={e => setData(p => ({ ...p, energy: +e.target.value }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right,${
                          (data.energy ?? 5) <= 3 ? '#f43f5e' : (data.energy ?? 5) <= 6 ? '#f59e0b' : '#10b981'
                        } ${((data.energy ?? 5) - 1) / 9 * 100}%,#e5e7eb ${((data.energy ?? 5) - 1) / 9 * 100}%)`,
                        accentColor: (data.energy ?? 5) <= 3 ? '#f43f5e' : (data.energy ?? 5) <= 6 ? '#f59e0b' : '#10b981',
                      }}
                    />
                    <div className="flex justify-between text-[9px] text-gray-300 mt-1">
                      <span>หมดแรง</span><span>พลังสูงมาก</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[22px] font-extrabold leading-none" style={{
                      color: (data.energy ?? 5) <= 3 ? '#f43f5e' : (data.energy ?? 5) <= 6 ? '#f59e0b' : '#10b981'
                    }}>{data.energy ?? 5}</span>
                    <span className="text-[11px] text-gray-300 font-normal">/10</span>
                  </div>
                </div>
              </div>

              {/* Feelings — icon + label tags */}
              <div ref={feelingRef}>
                <label className="text-[13px] font-bold text-gray-800 dark:text-gray-100 mb-1.5 block">
                  วันนี้รู้สึกอย่างไร
                </label>
                <p className="mb-2 text-[11px] text-gray-400">เลือกหรือสร้าง tag ได้เอง — กด Enter หรือคลิก &quot;เพิ่ม&quot;</p>

                {/* Selected tags */}
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px]">
                  {data.feelings.map((f) => {
                    const color = getFeelingColor(f.label);
                    return (
                      <motion.span
                        key={f.label}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition hover:opacity-75"
                        style={{ background: color + '18', color }}
                        onClick={() => toggleFeeling(f)}
                      >
                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                        <span>{f.label}</span>
                        <X size={11} className="opacity-50 flex-shrink-0" />
                      </motion.span>
                    );
                  })}
                  {data.feelings.length === 0 && (
                    <span className="text-[11px] text-gray-300 italic py-1">ยังไม่ได้เลือก tag...</span>
                  )}
                </div>

                {/* Search/create input */}
                <div className="relative">
                  <input
                    type="text"
                    value={feelingSearch}
                    onChange={(e) => { setFeelingSearch(e.target.value); setShowFeelingDropdown(true); }}
                    onFocus={() => setShowFeelingDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isNewFeeling) { e.preventDefault(); handleCreateFeeling(); }
                    }}
                    placeholder="ค้นหาหรือพิมพ์ชื่ออารมณ์ใหม่..."
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-[13px] outline-none focus:border-purple-400 transition dark:border-white/10 dark:bg-[#14162a] dark:text-gray-100"
                  />

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showFeelingDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 mt-1 max-h-[360px] overflow-y-auto rounded-xl border-2 border-purple-100 bg-white shadow-2xl z-30 dark:bg-[#191a2c] dark:border-white/10"
                      >
                        {/* ── New feeling creation panel ── */}
                        {isNewFeeling && (
                          <div className="border-b border-purple-100 dark:border-white/10 p-3 bg-purple-50/40 dark:bg-purple-500/5">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                              <Plus size={13} className="text-purple-600 flex-shrink-0" />
                              <span className="text-[13px] font-semibold text-purple-700 dark:text-purple-300">
                                สร้าง &quot;{feelingSearch.trim()}&quot;
                              </span>
                            </div>

                            {/* Preview + create button */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 dark:bg-white/5 dark:border-purple-500/30">
                                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                                <span className="text-[12px] font-semibold text-purple-700 dark:text-purple-300 max-w-[160px] truncate">
                                  {feelingSearch.trim()}
                                </span>
                              </div>
                              <button
                                onClick={handleCreateFeeling}
                                className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-[12px] font-bold transition hover:opacity-90 shadow-sm"
                                style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                              >
                                <Plus size={12} /> เพิ่ม Tag
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── Existing feelings list ── */}
                        {filteredFeelings.map((f) => {
                          const isActive = data.feelings.some(x => x.label === f.label);
                          const color = getFeelingColor(f.label);
                          return (
                            <button
                              key={f.label}
                              onClick={() => { toggleFeeling(f); setFeelingSearch(''); setShowFeelingDropdown(false); }}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition hover:bg-gray-50 dark:hover:bg-white/5 ${
                                isActive ? 'bg-purple-50/60 dark:bg-purple-500/10' : ''
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                              <span className="flex-1 text-left text-gray-700 dark:text-gray-200">{f.label}</span>
                              {isActive && (
                                <span className="text-[11px] font-extrabold text-purple-500 flex-shrink-0">✓</span>
                              )}
                            </button>
                          );
                        })}

                        {filteredFeelings.length === 0 && !isNewFeeling && (
                          <div className="px-4 py-4 text-[12px] text-gray-400 text-center">
                            ไม่พบผลลัพธ์ — ลองพิมพ์เพื่อสร้างใหม่
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-white/10" />

              {/* Reflection sections */}
              {REFLECTION_SECTIONS.map((s) => (
                <div key={s.key}>
                  <label className="flex items-center gap-1.5 text-[13px] font-bold text-gray-800 dark:text-gray-100">
                    {s.title}
                  </label>
                  <p className="mb-1.5 text-[11px] leading-snug text-gray-400">{s.hint}</p>
                  <textarea
                    rows={2}
                    value={data[s.key] as string}
                    onChange={(e) => setData((p) => ({ ...p, [s.key]: e.target.value }))}
                    placeholder={s.placeholder}
                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-[13px] outline-none focus:border-purple-400 transition dark:border-white/10 dark:bg-[#14162a] dark:text-gray-100"
                  />
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-6 py-4 dark:border-white/10">
              {existing ? (
                <button onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition dark:border-red-500/30">
                  <Trash2 size={14} /> ลบ
                </button>
              ) : <span />}
              <div className="flex items-center gap-2">
                <button onClick={onClose}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 transition dark:border-white/10">
                  ยกเลิก
                </button>
                <button onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90 shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                  <Save size={14} /> บันทึก
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
