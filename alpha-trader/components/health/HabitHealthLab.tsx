'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, X, Save, CheckCircle2 } from 'lucide-react';
import IconGlyph from '@/components/IconGlyph';
import { initialHabits, initialMetrics, initialNotes, type Habit, type Note, type Metrics } from '@/data/habit-health-mock';
import { useEscClose } from '@/lib/useEscClose';

const HABITS_KEY  = 'alpha_health_habits';
const METRICS_KEY = 'alpha_health_metrics';
const NOTES_KEY   = 'alpha_health_notes';

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
import OverviewTab from './tabs/Overview';
import HeatmapTab from './tabs/Heatmap';
import ChecklistTab from './tabs/Checklist';
import MetricsTab from './tabs/Metrics';
import BodyCompTab from './tabs/BodyComp';
import InsightsTab from './tabs/Insights';

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'heatmap',   label: 'Habit Heatmap' },
  { id: 'checklist', label: 'Daily Checklist' },
  { id: 'metrics',   label: 'Health Metrics' },
  { id: 'body',      label: 'Body Composition' },
  { id: 'insights',  label: 'Insights' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function HabitHealthLab() {
  const [tab, setTab] = useState<TabId>('overview');
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [toast, setToast] = useState('');
  const [showHabit, setShowHabit] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHabits(readLS(HABITS_KEY, initialHabits));
    setMetrics(readLS(METRICS_KEY, initialMetrics));
    setNotes(readLS(NOTES_KEY, initialNotes));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) try { localStorage.setItem(HABITS_KEY, JSON.stringify(habits)); } catch {} }, [habits, hydrated]);
  useEffect(() => { if (hydrated) try { localStorage.setItem(METRICS_KEY, JSON.stringify(metrics)); } catch {} }, [metrics, hydrated]);
  useEffect(() => { if (hydrated) try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch {} }, [notes, hydrated]);

  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2000); };

  /* ── shared actions ── */
  const setHabitValue = (id: string, value: number) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, value: Math.max(0, value) } : h)));
  const toggleHabit = (id: string) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, value: h.value >= h.goal ? 0 : h.goal } : h)));
  const addHabit = (h: Habit) => { setHabits((p) => [...p, h]); notify(`เพิ่ม "${h.name}" แล้ว`); };
  const addNote = (n: Note) => setNotes((p) => [n, ...p]);
  const updateMetrics = (m: Partial<Metrics>) => { setMetrics((p) => ({ ...p, ...m })); notify('อัปเดตข้อมูลสุขภาพแล้ว'); };

  const isToday = tab === 'checklist';

  return (
    <div className="habit-lab">
      {/* ── Tab bar (matches Trading style) ── */}
      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max items-center gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`h-10 rounded-xl px-4 text-[12px] font-extrabold whitespace-nowrap transition ${
                  active
                    ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)] dark:bg-purple-500/20 dark:text-purple-300'
                    : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-500/10'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── tab content ── */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === 'overview'  && <OverviewTab habits={habits} metrics={metrics} />}
        {tab === 'heatmap'   && <HeatmapTab habits={habits} notes={notes} onAddEntry={() => setShowEntry(true)} onAddHabit={() => setShowHabit(true)} />}
        {tab === 'checklist' && <ChecklistTab habits={habits} metrics={metrics} toggleHabit={toggleHabit} setHabitValue={setHabitValue} onCheckin={() => setShowEntry(true)} onAddHabit={() => setShowHabit(true)} />}
        {tab === 'metrics'   && <MetricsTab metrics={metrics} />}
        {tab === 'body'      && <BodyCompTab />}
        {tab === 'insights'  && <InsightsTab habits={habits} />}
      </motion.div>

      {/* ── Add Habit modal ── */}
      <AddHabitModal open={showHabit} onClose={() => setShowHabit(false)} onAdd={addHabit} />
      {/* ── Check-in / Add Entry modal ── */}
      <CheckinModal open={showEntry} onClose={() => setShowEntry(false)} metrics={metrics} onSave={(m, note) => { updateMetrics(m); if (note) addNote(note); }} />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-[13px] font-bold text-white shadow-xl">
            <CheckCircle2 size={15} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Add Habit modal ── */
const HABIT_ICON_OPTIONS: { token: string; label: string }[] = [
  { token: 'done',       label: 'Done' },
  { token: 'exercise',   label: 'Exercise' },
  { token: 'meditation', label: 'Meditation' },
  { token: 'learning',   label: 'Read / Learn' },
  { token: 'hydration',  label: 'Hydration' },
  { token: 'blocked',    label: 'No Sugar' },
  { token: 'sleep',      label: 'Sleep' },
  { token: 'journal',    label: 'Journal' },
  { token: 'strength',   label: 'Strength' },
  { token: 'heart',      label: 'Health' },
  { token: 'target',     label: 'Target' },
  { token: 'mood',       label: 'Mood' },
];

function AddHabitModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (h: Habit) => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('done');
  const [category, setCategory] = useState('Health');
  const [goal, setGoal] = useState('1');
  const [unit, setUnit] = useState('minutes');
  const [reminder, setReminder] = useState('09:00');

  function submit() {
    if (!name.trim()) return;
    onAdd({ id: `h${Date.now()}`, name: name.trim(), icon, category, unit, value: 0, goal: parseFloat(goal) || 1, reminder, consistency: 0 });
    setName(''); setIcon('done'); setGoal('1');
    onClose();
  }

  return (
    <ModalShell open={open} onClose={onClose} title="Add Habit" subtitle="สร้างนิสัยใหม่และตั้งเป้าหมาย">
      <div className="space-y-3">
        <div className="grid grid-cols-[80px_1fr] gap-3">
          <Field label="Icon">
            <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputCls}>
              {HABIT_ICON_OPTIONS.map((o) => <option key={o.token} value={o.token}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Habit Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น Morning Walk" className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {['Health','Fitness','Mind','Growth','Diet','Recovery'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Reminder">
            <input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Daily Goal"><input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls} /></Field>
          <Field label="Unit">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
              {['minutes','pages','ml','hours','day','steps','reps'].map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={submit} label="Add Habit" />
    </ModalShell>
  );
}

/* ── Check-in modal ── */
function CheckinModal({ open, onClose, metrics, onSave }: { open: boolean; onClose: () => void; metrics: Metrics; onSave: (m: Partial<Metrics>, note?: Note) => void }) {
  const [weight, setWeight] = useState(String(metrics.weight));
  const [sleep, setSleep] = useState(String(metrics.sleepHours));
  const [water, setWater] = useState(String(metrics.hydration));
  const [mood, setMood] = useState(metrics.mood);
  const [energy, setEnergy] = useState(metrics.energy);
  const [note, setNote] = useState('');

  function submit() {
    onSave(
      { weight: parseFloat(weight) || metrics.weight, sleepHours: parseFloat(sleep) || metrics.sleepHours, hydration: parseFloat(water) || metrics.hydration, mood, energy },
      note.trim() ? { id: `n${Date.now()}`, text: note.trim(), time: 'Today, just now', mood: mood === 'Good' ? 'good' : 'neutral' } : undefined,
    );
    setNote('');
    onClose();
  }

  return (
    <ModalShell open={open} onClose={onClose} title="Daily Health Check-in" subtitle="บันทึกค่าสุขภาพวันนี้ — เชื่อมกับข้อมูลที่แสดง">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Weight (kg)"><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} /></Field>
          <Field label="Sleep (hrs)"><input type="number" value={sleep} onChange={(e) => setSleep(e.target.value)} className={inputCls} /></Field>
          <Field label="Water (L)"><input type="number" value={water} onChange={(e) => setWater(e.target.value)} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mood">
            <select value={mood} onChange={(e) => setMood(e.target.value)} className={inputCls}>{['Great','Good','Okay','Low'].map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
          <Field label="Energy">
            <select value={energy} onChange={(e) => setEnergy(e.target.value)} className={inputCls}>{['High','Medium','Low'].map((m) => <option key={m}>{m}</option>)}</select>
          </Field>
        </div>
        <Field label="Note"><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="How do you feel today?" className={inputCls + ' resize-none'} /></Field>
      </div>
      <ModalFooter onClose={onClose} onSave={submit} label="Save Check-in" />
    </ModalShell>
  );
}

/* ── modal primitives ── */
const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-100';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function ModalShell({ open, onClose, title, subtitle, children }: { open: boolean; onClose: () => void; title: string; subtitle: string; children: React.ReactNode }) {
  useEscClose(onClose, open);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#191a2c]">
            <div className="flex items-center justify-between px-5 py-4 text-white" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
              <div>
                <div className="text-sm font-extrabold">{title}</div>
                <div className="text-[11px] text-white/80">{subtitle}</div>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25"><X size={16} /></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalFooter({ onClose, onSave, label }: { onClose: () => void; onSave: () => void; label: string }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 hover:bg-slate-50 dark:border-white/10">ยกเลิก</button>
      <button onClick={onSave} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-[12px] font-extrabold text-white"><Save size={13} /> {label}</button>
    </div>
  );
}
