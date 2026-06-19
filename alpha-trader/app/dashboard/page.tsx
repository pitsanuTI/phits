'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import {
  Calendar, Target, Clock, Sparkles, Plus, Trash2, Edit3,
  Upload, X, Image as ImageIcon, Video, Star, Info, Bell,
  PartyPopper,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import IconGlyph from '@/components/IconGlyph';
import { useEscClose } from '@/lib/useEscClose';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface Milestone {
  id: string;
  label: string;
  week: number;
  icon: string;
  color: string;
}

interface UpcomingEvent {
  id: string;
  label: string;
  date: string; // YYYY-MM-DD
  icon: string;
  recurring: boolean;
  imageB64?: string;  // compressed base64
  imageFocalX?: number; // 0–100
  imageFocalY?: number; // 0–100
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: string;
  caption: string;
  week?: number;
  addedAt: string;
  focalX?: number; // 0–100
  focalY?: number; // 0–100
  imgW?: number;
  imgH?: number;
}

interface WeekFocus {
  focus: string;
  reminder: string;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function getCurrentWeek(birthdate: string): number {
  if (!birthdate) return 0;
  const birth = new Date(birthdate);
  const now = new Date();
  const ms = now.getTime() - birth.getTime();
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getCoverSize(imgW: number, imgH: number, contW: number, contH: number) {
  if (imgW === 0 || imgH === 0) return { w: contW, h: contH };
  const imgAspect = imgW / imgH;
  const contAspect = contW / contH;
  if (imgAspect > contAspect) return { w: contH * imgAspect, h: contH };
  return { w: contW, h: contW / imgAspect };
}

// Crop exactly what's visible in the square modal to canvas (WYSIWYG)
function cropToCanvas(
  file: File,
  contW: number,
  imgW: number,
  imgH: number,
  zoom: number,
  panX: number,
  panY: number,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // Cover size at zoom=1: portrait → width=contW, landscape → height=contW
      const cover = getCoverSize(imgW, imgH, contW, contW);
      // Scale: original pixels → screen pixels at current zoom
      const imgScale = zoom * cover.w / imgW;
      // Rendered image size on screen
      const renderedW = imgW * imgScale;
      const renderedH = imgH * imgScale;
      // Image top-left in container coords
      // CSS: top:50% left:50% transform:translate(-50%+panX, -50%+panY)
      const imgLeft = contW / 2 + panX - renderedW / 2;
      const imgTop  = contW / 2 + panY - renderedH / 2;
      // Crop window = full square container (0,0,contW,contW) → in original image coords
      const srcX = (0 - imgLeft) / imgScale;
      const srcY = (0 - imgTop)  / imgScale;
      const srcSide = contW / imgScale; // same width & height (square crop)
      // Clamp to image bounds
      const cX = Math.max(0, Math.min(imgW - 1, srcX));
      const cY = Math.max(0, Math.min(imgH - 1, srcY));
      const cW = Math.min(srcSide, imgW - cX);
      const cH = Math.min(srcSide, imgH - cY);
      // Output at natural crop resolution, max 1200px
      const out = Math.round(Math.min(1200, Math.max(cW, cH)));
      const canvas = document.createElement('canvas');
      canvas.width = out; canvas.height = out;
      canvas.getContext('2d')!.drawImage(img, cX, cY, cW, cH, 0, 0, out, out);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
    img.src = url;
  });
}

function compressToBase64(file: File, maxW = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ──────────────────────────────────────────────
// Week color palette — warm, cool, earthy tones
// ──────────────────────────────────────────────
const WEEK_COLORS = [
  '#a78bfa','#818cf8','#60a5fa','#34d399','#fbbf24','#f87171','#fb923c',
  '#e879f9','#38bdf8','#4ade80','#facc15','#f472b6','#c084fc','#67e8f9',
  '#86efac','#fde68a','#fca5a5','#93c5fd','#6ee7b7','#d8b4fe','#fed7aa',
  '#a5f3fc','#bbf7d0','#fef08a','#fecdd3','#c7d2fe','#99f6e4','#fde047',
  '#f9a8d4','#bfdbfe','#6d28d9','#0369a1','#065f46','#92400e','#9f1239',
  '#1e40af','#166534','#78350f','#831843','#1e3a8a','#14532d','#7c2d12',
  '#4c1d95','#0c4a6e','#064e3b','#451a03','#4a044e','#0f172a','#1c1917',
  '#7e22ce','#0284c7','#059669','#d97706','#dc2626','#7c3aed','#0891b2',
  '#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#22c55e','#eab308',
  '#f43f5e','#a855f7','#14b8a6','#84cc16','#f97316','#ec4899','#6366f1',
];

function weekColor(w: number): string {
  // use a simple hash so adjacent weeks don't share colors
  const h = (w * 2654435761) >>> 0;
  return WEEK_COLORS[h % WEEK_COLORS.length];
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const TOTAL_WEEKS = 4000;
const MILESTONE_ICONS = ['learning', 'work', 'heart', 'savings', 'growth', 'sparkle', 'chart', 'achievement', 'target', 'calendar', 'money', 'notes'];
const MILESTONE_COLORS = ['#7c5cbf', '#10b981', '#f59e0b', '#38bdf8', '#f43f5e', '#a78bfa'];
const LIFE_CATEGORIES = [
  { name: 'Work', value: 20, color: '#a78bfa' },
  { name: 'Health', value: 15, color: '#10b981' },
  { name: 'Learning', value: 12, color: '#38bdf8' },
  { name: 'Trading', value: 10, color: '#f59e0b' },
  { name: 'Money', value: 10, color: '#fbbf24' },
  { name: 'Family', value: 15, color: '#f9a8d4' },
  { name: 'Rest', value: 8, color: '#67e8f9' },
  { name: 'Personal Growth', value: 10, color: '#c4b5fd' },
];

const DEFAULT_MILESTONES: Milestone[] = [
  { id: '1', label: 'Graduation', week: 723, icon: 'learning', color: '#7c5cbf' },
  { id: '2', label: 'First Job', week: 834, icon: 'work', color: '#10b981' },
  { id: '3', label: 'Resignation', week: 1201, icon: 'growth', color: '#f59e0b' },
  { id: '4', label: 'Marriage', week: 1357, icon: 'heart', color: '#f43f5e' },
  { id: '5', label: 'Started Trading Full-Time', week: 1508, icon: 'chart', color: '#38bdf8' },
  { id: '6', label: 'Retirement Plan', week: 3500, icon: 'achievement', color: '#a78bfa' },
];

// ──────────────────────────────────────────────
// Gradient accent palette
// ──────────────────────────────────────────────
const ACCENTS = {
  violet: 'from-violet-500 to-purple-600',
  teal:   'from-teal-500 to-emerald-400',
  sky:    'from-sky-500 to-blue-500',
  amber:  'from-amber-400 to-orange-400',
  pink:   'from-pink-500 to-fuchsia-500',
} as const;

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent, badge }: {
  icon: React.ReactNode; label: string; value: string; sub: React.ReactNode;
  accent: keyof typeof ACCENTS; badge?: React.ReactNode;
}) {
  const grad = ACCENTS[accent];
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-4 shadow-lg h-[128px]`}
    >
      {/* gloss overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 rounded-t-2xl bg-gradient-to-b from-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70 truncate">{label}</div>
          <div className="mt-1.5 text-[25px] font-bold leading-none tracking-tight text-white drop-shadow-sm">{value}</div>
          <div className="mt-1.5 text-[11px] font-medium text-white/80">{sub}</div>
          {badge && <div className="mt-2">{badge}</div>}
        </div>
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 shadow-lg ring-1 ring-white/40 backdrop-blur-sm">
            <span className="text-white drop-shadow">{icon}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MilestoneModal({ open, onClose, onSave, existing, defaultWeek }: {
  open: boolean; onClose: () => void;
  onSave: (m: Omit<Milestone, 'id'>) => void;
  existing?: Milestone | null;
  defaultWeek?: number;
}) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [week, setWeek] = useState(existing?.week?.toString() ?? defaultWeek?.toString() ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? 'learning');
  const [color, setColor] = useState(existing?.color ?? '#7c5cbf');

  useEffect(() => {
    if (existing) { setLabel(existing.label); setWeek(existing.week.toString()); setIcon(existing.icon); setColor(existing.color); }
    else { setLabel(''); setWeek(defaultWeek?.toString() ?? ''); setIcon('learning'); setColor('#7c5cbf'); }
  }, [existing, open, defaultWeek]);

  useEscClose(onClose, open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">{existing ? 'Edit Milestone' : 'Add Milestone'}</h3>
              <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Event Name</label>
                <input value={label} onChange={e => setLabel(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  placeholder="e.g. Started my business" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Week Number (1–4000)</label>
                <input type="number" min={1} max={4000} value={week} onChange={e => setWeek(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                  placeholder="e.g. 1500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {MILESTONE_ICONS.map(i => (
                    <button key={i} onClick={() => setIcon(i)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition ${icon === i ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
                      <IconGlyph token={i} size={17} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Color</label>
                <div className="flex gap-2">
                  {MILESTONE_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${color === c ? 'border-gray-700 scale-110' : 'border-transparent'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={() => { if (label && week) { onSave({ label, week: parseInt(week), icon, color }); onClose(); } }}
                className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 transition">
                {existing ? 'Save Changes' : 'Add Milestone'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────
// Event Modal
// ──────────────────────────────────────────────
const EVENT_ICONS = ['🎂','🎉','🏆','💍','✈️','🎓','💼','❤️','⭐','🎯','🌟','📅'];

function EventModal({ open, onClose, onSave, existing }: {
  open: boolean; onClose: () => void;
  onSave: (e: Omit<UpcomingEvent, 'id'>) => void;
  existing?: UpcomingEvent | null;
}) {
  const [label, setLabel]       = useState(existing?.label ?? '');
  const [date, setDate]         = useState(existing?.date ?? '');
  const [icon, setIcon]         = useState(existing?.icon ?? '🎂');
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);
  const [imageB64, setImageB64] = useState(existing?.imageB64 ?? '');
  const [focalX, setFocalX]     = useState(existing?.imageFocalX ?? 50);
  const [focalY, setFocalY]     = useState(existing?.imageFocalY ?? 50);
  const [compressing, setCompressing] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      setLabel(existing.label); setDate(existing.date); setIcon(existing.icon);
      setRecurring(existing.recurring); setImageB64(existing.imageB64 ?? '');
      setFocalX(existing.imageFocalX ?? 50); setFocalY(existing.imageFocalY ?? 50);
    } else {
      setLabel(''); setDate(''); setIcon('🎂'); setRecurring(false);
      setImageB64(''); setFocalX(50); setFocalY(50);
    }
  }, [existing, open]);

  async function handleImgSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCompressing(true);
    try {
      const b64 = await compressToBase64(file, 1200, 0.82);
      setImageB64(b64);
      setFocalX(50); setFocalY(50);
    } finally { setCompressing(false); }
  }

  useEscClose(onClose, open);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="event-modal-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            key="event-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-800">{existing ? 'Edit Event' : 'Add Upcoming Event'}</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Image upload + focal point */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">รูปประกอบกิจกรรม</label>
            {imageB64 ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 group" style={{ paddingBottom: '56.25%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageB64} alt="event"
                  className="absolute inset-0 w-full h-full object-cover cursor-crosshair select-none"
                  style={{ objectPosition: `${focalX}% ${focalY}%` }}
                  onClick={e => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setFocalX(Math.round(((e.clientX - r.left) / r.width) * 100));
                    setFocalY(Math.round(((e.clientY - r.top) / r.height) * 100));
                  }}
                  draggable={false}
                />
                {/* crosshair */}
                <div className="absolute pointer-events-none"
                  style={{ left: `${focalX}%`, top: `${focalY}%`, transform: 'translate(-50%,-50%)' }}>
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow-lg bg-white/25 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
                  <div className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">คลิกเพื่อตั้งจุดโฟกัส</div>
                </div>
                {/* change / remove */}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => imgInputRef.current?.click()}
                    className="bg-white/90 text-[10px] text-purple-600 font-semibold px-2 py-1 rounded-lg shadow hover:bg-purple-50 transition">เปลี่ยนรูป</button>
                  <button onClick={() => setImageB64('')}
                    className="bg-white/90 text-[10px] text-red-400 font-semibold px-2 py-1 rounded-lg shadow hover:bg-red-50 transition">ลบรูป</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => imgInputRef.current?.click()}
                disabled={compressing}
                className="w-full border-2 border-dashed border-purple-200 rounded-xl py-5 text-xs text-purple-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50 transition flex flex-col items-center gap-1.5">
                {compressing ? '⏳ กำลังบีบอัด...' : <><span className="text-2xl">🖼️</span><span>แตะเพื่อเพิ่มรูปกิจกรรม</span></>}
              </button>
            )}
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgSelect} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Event Name</label>
            <input value={label} onChange={e => setLabel(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
              placeholder="e.g. วันเกิด, ครบรอบ, งาน..." />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">วันที่</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_ICONS.map(ic => (
                <button key={ic} onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 transition ${icon === ic ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}
              className="w-4 h-4 accent-purple-500" />
            <span className="text-sm text-gray-600">Recurring yearly (วันครบรอบ/วันเกิด)</span>
          </label>
        </div>

        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => {
              if (label && date) {
                onSave({ label, date, icon, recurring, imageB64: imageB64 || undefined, imageFocalX: focalX, imageFocalY: focalY });
                onClose();
              }
            }}
            className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 transition">
            {existing ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────
export default function DashboardPage() {
  // Birthdate & week
  const [birthdate, setBirthdate] = useState('');
  const [showBirthInput, setShowBirthInput] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [clickedWeek, setClickedWeek] = useState<number | undefined>(undefined);
  const [hoveredMilestoneId, setHoveredMilestoneId] = useState<string | null>(null);

  // Weekly focus
  const [weekFocus, setWeekFocus] = useState<WeekFocus>({ focus: 'Build with intention', reminder: "You're becoming someone your future self will be grateful for." });
  const [editingFocus, setEditingFocus] = useState(false);
  const [focusDraft, setFocusDraft] = useState(weekFocus);

  // Upcoming events
  const [events, setEvents] = useState<UpcomingEvent[]>([
    { id: 'default-bday', label: 'วันเกิด', date: '', icon: '🎂', recurring: true },
  ]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UpcomingEvent | null>(null);

  // Media
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImgRef = useRef<HTMLImageElement>(null);
  const livePanRef = useRef({ panX: 0, panY: 0 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });
  const [mediaCaption, setMediaCaption] = useState('');
  const [pendingFile, setPendingFile] = useState<{ file: File; url: string; imgW: number; imgH: number; zoom: number; panX: number; panY: number } | null>(null);

  useEscClose(() => setPendingFile(null), !!pendingFile);

  // Week notes (per-week diary)
  const [weekNotes, setWeekNotes] = useState<Record<number, string>>({});
  const [editingWeekNote, setEditingWeekNote] = useState(false);
  const [weekNoteDraft, setWeekNoteDraft] = useState('');

  // Weekly reflection
  const [reflection, setReflection] = useState({
    mattered: 'Focused work, meaningful conversations, and showing up for my health.',
    learned: 'Discipline compounds. Small daily actions create massive long-term results.',
    improve: 'Reduce distractions and protect deep work time.',
  });
  const [editingReflection, setEditingReflection] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const bd = localStorage.getItem('life4000_birthdate') || '';
    const ms = localStorage.getItem('life4000_milestones');
    const wf = localStorage.getItem('life4000_weekfocus');
    const media = localStorage.getItem('life4000_media');
    const ref = localStorage.getItem('life4000_reflection');
    const ev = localStorage.getItem('life4000_events');
    if (bd) { setBirthdate(bd); setCurrentWeek(getCurrentWeek(bd)); }
    if (ms) setMilestones(JSON.parse(ms));
    if (wf) { const p = JSON.parse(wf); setWeekFocus(p); setFocusDraft(p); }
    if (media) setMediaItems(JSON.parse(media));
    if (ref) setReflection(JSON.parse(ref));
    if (ev) setEvents(JSON.parse(ev));
    const wn = localStorage.getItem('life4000_weeknotes');
    if (wn) setWeekNotes(JSON.parse(wn));
  }, []);

  function saveBirthdate(val: string) {
    setBirthdate(val);
    setCurrentWeek(getCurrentWeek(val));
    localStorage.setItem('life4000_birthdate', val);
    setShowBirthInput(false);
  }

  function saveWeekNote(week: number, text: string) {
    const updated = { ...weekNotes, [week]: text };
    setWeekNotes(updated);
    localStorage.setItem('life4000_weeknotes', JSON.stringify(updated));
    setEditingWeekNote(false);
  }

  function saveEvents(list: UpcomingEvent[]) {
    setEvents(list);
    localStorage.setItem('life4000_events', JSON.stringify(list));
  }
  function addEvent(data: Omit<UpcomingEvent, 'id'>) {
    saveEvents([...events, { ...data, id: Date.now().toString() }]);
  }
  function updateEvent(id: string, data: Omit<UpcomingEvent, 'id'>) {
    saveEvents(events.map(e => e.id === id ? { ...data, id } : e));
  }
  function deleteEvent(id: string) {
    saveEvents(events.filter(e => e.id !== id));
  }

  // Compute next occurrence for an event (handles recurring yearly)
  function nextOccurrence(ev: UpcomingEvent): Date | null {
    if (!ev.date) return null;
    const base = new Date(ev.date);
    if (isNaN(base.getTime())) return null;
    const now = new Date();
    if (!ev.recurring) return base >= now ? base : null;
    // recurring: find next year occurrence >= today
    const candidate = new Date(now.getFullYear(), base.getMonth(), base.getDate());
    if (candidate < now) candidate.setFullYear(candidate.getFullYear() + 1);
    return candidate;
  }

  // Sort events by days remaining, filter only upcoming
  const upcomingEvents = events
    .map(ev => {
      const next = nextOccurrence(ev);
      if (!next) return null;
      const daysLeft = Math.ceil((next.getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
      const week = birthdate ? Math.floor((next.getTime() - new Date(birthdate).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1 : null;
      return { ...ev, next, daysLeft, week };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  function saveMilestones(list: Milestone[]) {
    setMilestones(list);
    localStorage.setItem('life4000_milestones', JSON.stringify(list));
  }

  function addMilestone(data: Omit<Milestone, 'id'>) {
    saveMilestones([...milestones, { ...data, id: Date.now().toString() }]);
  }

  function updateMilestone(id: string, data: Omit<Milestone, 'id'>) {
    saveMilestones(milestones.map(m => m.id === id ? { ...data, id } : m));
  }

  function deleteMilestone(id: string) {
    saveMilestones(milestones.filter(m => m.id !== id));
  }

  function saveFocus() {
    setWeekFocus(focusDraft);
    localStorage.setItem('life4000_weekfocus', JSON.stringify(focusDraft));
    setEditingFocus(false);
  }

  function saveReflection(r: typeof reflection) {
    setReflection(r);
    localStorage.setItem('life4000_reflection', JSON.stringify(r));
    setEditingReflection(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaCaption('');
    e.target.value = '';
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => setPendingFile({ file, url, imgW: img.naturalWidth, imgH: img.naturalHeight, zoom: 1, panX: 0, panY: 0 });
      img.src = url;
    } else {
      setPendingFile({ file, url, imgW: 0, imgH: 0, zoom: 1, panX: 0, panY: 0 });
    }
  }

  function handleCropPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    // livePanRef always holds the latest pan (kept in sync by zoom and drag handlers)
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPanX: livePanRef.current.panX, startPanY: livePanRef.current.panY };
  }

  function handleCropPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.dragging || !pendingFile || !cropContainerRef.current || !cropImgRef.current) return;
    const c = cropContainerRef.current;
    const cover = getCoverSize(pendingFile.imgW, pendingFile.imgH, c.offsetWidth, c.offsetHeight);
    const maxPanX = Math.max(0, (cover.w * pendingFile.zoom - c.offsetWidth) / 2);
    const maxPanY = Math.max(0, (cover.h * pendingFile.zoom - c.offsetHeight) / 2);
    const newPanX = Math.max(-maxPanX, Math.min(maxPanX, dragRef.current.startPanX + (e.clientX - dragRef.current.startX)));
    const newPanY = Math.max(-maxPanY, Math.min(maxPanY, dragRef.current.startPanY + (e.clientY - dragRef.current.startY)));
    livePanRef.current = { panX: newPanX, panY: newPanY };
    // Avoid nested calc() — split centering and pan into separate transforms
    cropImgRef.current.style.transform = `translate(-50%, -50%) translateX(${newPanX}px) translateY(${newPanY}px)`;
  }

  function handleCropPointerUp() {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const { panX, panY } = livePanRef.current;
    setPendingFile(p => p ? { ...p, panX, panY } : p);
  }

  function handleZoomChange(newZoom: number) {
    if (!pendingFile || !cropContainerRef.current || !cropImgRef.current) return;
    const c = cropContainerRef.current;
    const cover = getCoverSize(pendingFile.imgW, pendingFile.imgH, c.offsetWidth, c.offsetHeight);
    const maxPanX = Math.max(0, (cover.w * newZoom - c.offsetWidth) / 2);
    const maxPanY = Math.max(0, (cover.h * newZoom - c.offsetHeight) / 2);
    // Use livePanRef (not stale state) so rapid drag→zoom sequences are correct
    const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, livePanRef.current.panX));
    const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, livePanRef.current.panY));
    livePanRef.current = { panX: clampedPanX, panY: clampedPanY };
    // Apply to DOM immediately — React reconciler skips DOM writes when the transform
    // string is unchanged (panX/panY same), leaving a stale drag-set transform in place.
    // Direct write guarantees the image always reflects the new zoom.
    const isPortrait = pendingFile.imgH / pendingFile.imgW >= 1;
    cropImgRef.current.style.width  = isPortrait ? `${newZoom * 100}%` : 'auto';
    cropImgRef.current.style.height = isPortrait ? 'auto' : `${newZoom * 100}%`;
    cropImgRef.current.style.transform = `translate(-50%, -50%) translateX(${clampedPanX}px) translateY(${clampedPanY}px)`;
    setPendingFile(p => p ? { ...p, zoom: newZoom, panX: clampedPanX, panY: clampedPanY } : p);
  }

  async function confirmAddMedia() {
    if (!pendingFile) return;
    const { file, imgW, imgH, zoom, panX, panY } = pendingFile;
    const isVideo = file.type.startsWith('video/');

    // Crop exactly what's visible in the modal (WYSIWYG) — no focalX/focalY needed
    let persistedUrl: string;
    if (isVideo) {
      persistedUrl = pendingFile.url;
    } else if (cropContainerRef.current && imgW > 0) {
      persistedUrl = await cropToCanvas(file, cropContainerRef.current.offsetWidth, imgW, imgH, zoom, panX, panY);
    } else {
      persistedUrl = await compressToBase64(file, 1200, 0.82);
    }

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type: isVideo ? 'video' : 'image',
      url: persistedUrl,
      name: file.name,
      size: formatBytes(file.size),
      caption: mediaCaption,
      week: currentWeek || undefined,
      addedAt: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
      focalX: 50, focalY: 50, imgW, imgH,
    };
    const updated = [newItem, ...mediaItems];
    setMediaItems(updated);
    const toSave = updated.filter(m => m.type === 'image');
    localStorage.setItem('life4000_media', JSON.stringify(toSave));
    setPendingFile(null);
  }

  function deleteMedia(id: string) {
    setMediaItems(prev => {
      const updated = prev.filter(m => m.id !== id);
      const toSave = updated.filter(m => m.type === 'image');
      localStorage.setItem('life4000_media', JSON.stringify(toSave));
      return updated;
    });
  }

  const lifeProgress = currentWeek > 0 ? ((currentWeek / TOTAL_WEEKS) * 100).toFixed(1) : '0.0';
  const weeksRemaining = currentWeek > 0 ? TOTAL_WEEKS - currentWeek : TOTAL_WEEKS;

  // Week grid — 80 cols × 50 rows = 4000
  const COLS = 80;
  const milestoneWeeks = new Set(milestones.map(m => m.week));

  function getMilestoneForWeek(w: number) {
    return milestones.find(m => m.week === w);
  }

  // ─────────────────────────────────────────────
  return (
    <div>
      <TopBar title="Life in 4000 Weeks" subtitle="This week will never come again. Use it well." />

      {/* Birthdate setup prompt */}
      {!birthdate && (
        <div className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="text-sm text-purple-800 font-medium">ตั้งค่าวันเกิดเพื่อดูว่าตอนนี้อยู่สัปดาห์ที่เท่าไหร่</div>
          <button onClick={() => setShowBirthInput(true)} className="bg-purple-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition">
            ตั้งค่าวันเกิด
          </button>
        </div>
      )}
      {showBirthInput && (
        <div className="mb-5 bg-white border border-purple-200 rounded-2xl p-4 flex items-center gap-4">
          <label className="text-sm text-gray-700 font-medium flex-shrink-0">วันเกิดของคุณ:</label>
          <input type="date" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
            defaultValue={birthdate} id="bd-input" />
          <button onClick={() => {
            const el = document.getElementById('bd-input') as HTMLInputElement;
            if (el.value) saveBirthdate(el.value);
          }} className="bg-purple-600 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-purple-700">บันทึก</button>
          <button onClick={() => setShowBirthInput(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 items-stretch">

        <div onClick={() => setShowBirthInput(true)} className="cursor-pointer h-full">
          <KpiCard
            accent="violet"
            icon={<Calendar size={22} />}
            label="Current Week"
            value={currentWeek > 0 ? currentWeek.toLocaleString() : '—'}
            sub="of 4,000 weeks total"
          />
        </div>

        <KpiCard
          accent="teal"
          icon={<span className="font-extrabold text-lg">%</span>}
          label="Life Progress"
          value={`${lifeProgress}%`}
          sub={
            <span className="flex flex-col gap-1">
              <span>ชีวิตที่ผ่านมาแล้ว</span>
              <span className="block w-full bg-white/20 rounded-full h-1.5 mt-0.5">
                <span className="block bg-white rounded-full h-1.5 transition-all" style={{ width: `${lifeProgress}%` }} />
              </span>
            </span>
          }
        />

        <KpiCard
          accent="sky"
          icon={<Clock size={22} />}
          label="Weeks Remaining"
          value={weeksRemaining.toLocaleString()}
          sub="สัปดาห์ที่เหลืออยู่"
        />

        <KpiCard
          accent="amber"
          icon={<Target size={22} />}
          label="This Week Focus"
          value={weekFocus.focus.length > 14 ? weekFocus.focus.slice(0, 14) + '…' : weekFocus.focus}
          sub="โฟกัสสัปดาห์นี้"
        />

        {/* Upcoming Events */}
        <div onClick={() => { setEditingEvent(null); setEventModalOpen(true); }} className="cursor-pointer h-full">
          <KpiCard
            accent="pink"
            icon={<Bell size={22} />}
            label="Upcoming Events"
            value={upcomingEvents.length > 0 ? `${upcomingEvents[0].daysLeft}d` : '—'}
            sub={
              upcomingEvents.length > 0
                ? <span>{upcomingEvents[0].icon} {upcomingEvents[0].label}{upcomingEvents[0].week ? ` · Week ${upcomingEvents[0].week}` : ''}</span>
                : <span>คลิกเพื่อเพิ่มกิจกรรม</span>
            }
            badge={
              upcomingEvents.length > 1
                ? <span className="text-[10px] text-white/70">+{upcomingEvents.length - 1} more events</span>
                : undefined
            }
          />
        </div>

      </div>

      {/* ── Main content: 2/3 left + 1/3 right ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT (2/3) */}
        <div className="xl:col-span-2 space-y-5">

          {/* Life in Weeks Grid */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-800">Life in Weeks</h2>
                <Info size={14} className="text-gray-300" />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex gap-0.5">
                    {['#f87171','#fbbf24','#34d399','#60a5fa','#a78bfa'].map(c => (
                      <span key={c} className="w-2.5 h-3 rounded-sm inline-block" style={{ background: c }} />
                    ))}
                  </span>
                  Past
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block bg-purple-600 ring-2 ring-purple-300" />
                  This Week
                </span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-100 inline-block border border-gray-200" /> Future</span>
                <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-amber-400" /> Milestone</span>
              </div>
            </div>


            <div className="relative overflow-x-auto">
              {/* "You are here" label above the grid */}
              {currentWeek > 0 && (
                <div
                  className="absolute top-0 z-10 pointer-events-none"
                  style={{ left: `calc(${((currentWeek - 1) / TOTAL_WEEKS) * 100}% )`, transform: 'translateX(-50%)' }}
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                      Week {currentWeek} ← คุณอยู่ที่นี่
                    </div>
                    <div className="w-px h-2 bg-purple-500" />
                  </div>
                </div>
              )}

              <div
                className="grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  marginTop: currentWeek > 0 ? '28px' : '0',
                }}
                onMouseLeave={() => setHoveredWeek(null)}
              >
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                  const w = i + 1;
                  const isPast = w < currentWeek;
                  const isCurrent = w === currentWeek;
                  const isMilestone = milestoneWeeks.has(w);
                  const ms = getMilestoneForWeek(w);
                  const isFutureMilestone = isMilestone && !isPast && !isCurrent;

                  const cellColor = isPast ? weekColor(w) : undefined;

                  let cls = 'rounded-[2px] cursor-pointer transition-transform hover:scale-125 ';
                  if (isCurrent) cls += 'z-10 ';
                  else if (isFutureMilestone) cls += 'border border-purple-300 ';
                  else if (!isPast) cls += 'bg-gray-100 border border-gray-200 hover:bg-purple-50 hover:border-purple-200 ';

                  return (
                    <div
                      key={w}
                      className={cls}
                      style={{
                        paddingBottom: '100%',
                        position: 'relative',
                        backgroundColor: isCurrent
                          ? '#ffffff'
                          : isFutureMilestone
                            ? (ms?.color ?? '#7c5cbf') + '30'
                            : cellColor,
                        outline: isCurrent ? '2.5px solid #7c3aed' : isFutureMilestone ? `1.5px solid ${ms?.color ?? '#7c5cbf'}` : undefined,
                        outlineOffset: isCurrent ? '1px' : undefined,
                        boxShadow: isCurrent ? '0 0 0 2px #7c3aed, 0 0 8px 3px rgba(124,58,237,0.6)' : undefined,
                      }}
                      onMouseEnter={e => {
                        setHoveredWeek(w);
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onClick={() => {
                        if (!isCurrent) {
                          const existing = getMilestoneForWeek(w);
                          if (existing) {
                            setEditingMilestone(existing);
                          } else {
                            setEditingMilestone(null);
                          }
                          // pre-fill week in modal via state
                          setClickedWeek(w);
                          setMilestoneModalOpen(true);
                        }
                      }}
                    >
                      {isMilestone && !isCurrent && (
                        <span className="absolute inset-0 flex items-center justify-center leading-none pointer-events-none select-none"
                          style={{ fontSize: isFutureMilestone ? '8px' : '6px' }}>
                          <IconGlyph token={ms?.icon ?? '✦'} size={isFutureMilestone ? 8 : 6} color={ms?.color} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tooltip — slide in from left */}
              <AnimatePresence>
                {hoveredWeek && (
                  <motion.div
                    key={hoveredWeek}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.9 }}
                    className="fixed z-50 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg pointer-events-none shadow-lg whitespace-nowrap"
                    style={{ left: tooltipPos.x + 14, top: tooltipPos.y - 32, transformOrigin: 'bottom left' }}
                  >
                    {hoveredWeek === currentWeek
                      ? `Week ${hoveredWeek} — คุณอยู่ที่นี่!`
                      : getMilestoneForWeek(hoveredWeek)
                        ? `${getMilestoneForWeek(hoveredWeek)!.label} · Week ${hoveredWeek} · คลิกเพื่อแก้ไข`
                        : hoveredWeek < currentWeek
                          ? `Week ${hoveredWeek} — ผ่านมาแล้ว · คลิกเพื่อเพิ่ม milestone`
                          : `Week ${hoveredWeek} — อนาคต · คลิกเพื่อเพิ่ม milestone`}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Axis labels */}
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-0.5">
                {[1, 1000, 2000, 3000, 4000].map(n => <span key={n}>{n}</span>)}
              </div>
            </div>
          </div>

          {/* Bottom row: Milestone + Reflection + Pie */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Milestone Timeline */}
            <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-400" />
                  <span className="font-bold text-gray-800 text-sm">Milestone Timeline</span>
                  <Sparkles size={13} className="text-amber-400" />
                </div>
                <button onClick={() => { setEditingMilestone(null); setClickedWeek(undefined); setMilestoneModalOpen(true); }}
                  className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition">
                  <Plus size={14} className="text-purple-600" />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {milestones.sort((a, b) => a.week - b.week).map(m => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3"
                    onMouseEnter={() => setHoveredMilestoneId(m.id)}
                    onMouseLeave={() => setHoveredMilestoneId(null)}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 truncate"><IconGlyph token={m.icon} size={13} color={m.color} /> {m.label}</div>
                    </div>
                    <div className="text-[11px] font-bold flex-shrink-0" style={{ color: m.color }}>Week {m.week}</div>
                    <AnimatePresence>
                      {hoveredMilestoneId === m.id && (
                        <motion.div
                          className="flex gap-1"
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          <button onClick={() => { setEditingMilestone(m); setMilestoneModalOpen(true); }}
                            className="p-0.5 text-gray-300 hover:text-purple-500 transition-colors duration-150"><Edit3 size={11} /></button>
                          <button onClick={() => deleteMilestone(m.id)}
                            className="p-0.5 text-gray-300 hover:text-red-400 transition-colors duration-150"><Trash2 size={11} /></button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Reflection */}
            <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={13} className="text-pink-400" />
                  <span className="font-bold text-gray-800 text-sm">Weekly Reflection</span>
                  <Sparkles size={13} className="text-purple-300" />
                </div>
                <button onClick={() => setEditingReflection(true)}
                  className="text-gray-300 hover:text-purple-500"><Edit3 size={13} /></button>
              </div>
              {editingReflection ? (
                <div className="space-y-3">
                  {(['mattered', 'learned', 'improve'] as const).map(k => (
                    <div key={k}>
                      <label className="text-[10px] text-gray-400 capitalize block mb-0.5">
                        {k === 'mattered' ? 'What mattered this week?' : k === 'learned' ? 'What I learned?' : 'What I should improve?'}
                      </label>
                      <textarea rows={2} value={reflection[k]} onChange={e => setReflection(r => ({ ...r, [k]: e.target.value }))}
                        className="w-full text-xs border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-purple-400 resize-none" />
                    </div>
                  ))}
                  <button onClick={() => saveReflection(reflection)}
                    className="w-full bg-purple-600 text-white text-xs py-1.5 rounded-xl font-semibold">Save</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { icon: '⭐', label: 'What mattered this week?', val: reflection.mattered },
                    { icon: '💡', label: 'What I learned?', val: reflection.learned },
                    { icon: '📈', label: 'What I should improve?', val: reflection.improve },
                  ].map(r => (
                    <div key={r.label} className="flex gap-2">
                      <IconGlyph token={r.icon} size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-gray-400 font-semibold">{r.label}</div>
                        <div className="text-xs text-gray-600 leading-relaxed">{r.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Life Categories Pie */}
            <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
              <div className="font-bold text-gray-800 text-sm mb-3">Life Categories Allocation</div>
              <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={LIFE_CATEGORIES} cx="50%" cy="50%" innerRadius={32} outerRadius={54}
                      dataKey="value" stroke="none">
                      {LIFE_CATEGORIES.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2">
                {LIFE_CATEGORIES.map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-[11px] text-gray-600">{c.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (1/3) */}
        <div className="flex flex-col gap-5">

          {/* This Week panel */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-purple-500" />
                <span className="font-bold text-gray-700 text-sm">This Week</span>
              </div>
              <button
                onClick={() => {
                  setWeekNoteDraft(currentWeek > 0 ? (weekNotes[currentWeek] ?? '') : '');
                  setEditingWeekNote(true);
                }}
                className="text-gray-300 hover:text-purple-500 transition"
                title="บันทึกรายละเอียดสัปดาห์นี้"
              >
                <Edit3 size={14} />
              </button>
            </div>

            <div className="text-2xl font-extrabold text-purple-700 mt-2">
              Week {currentWeek > 0 ? currentWeek.toLocaleString() : '—'}
            </div>
            <div className="text-xs text-gray-400 mb-4">
              {currentWeek > 0 ? `${weeksRemaining.toLocaleString()} weeks remaining` : 'Set your birthdate to begin'}
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Focus</div>
              {editingFocus ? (
                <div className="space-y-2">
                  <input value={focusDraft.focus} onChange={e => setFocusDraft(f => ({ ...f, focus: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-purple-400" />
                  <textarea rows={2} value={focusDraft.reminder} onChange={e => setFocusDraft(f => ({ ...f, reminder: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-purple-400 resize-none" />
                  <button onClick={saveFocus} className="w-full bg-purple-600 text-white text-xs py-1.5 rounded-xl font-semibold">Save</button>
                </div>
              ) : (
                <div className="group relative">
                  <div className="font-bold text-purple-700 text-base leading-tight">{weekFocus.focus}</div>
                  <button onClick={() => setEditingFocus(true)}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-purple-500 transition">
                    <Edit3 size={13} />
                  </button>
                </div>
              )}
            </div>

            {!editingFocus && (
              <div className="bg-purple-50 rounded-xl p-3 text-xs text-gray-500 leading-relaxed border border-purple-100">
                <span className="text-purple-300 text-lg leading-none mr-1">&quot;</span>
                {weekFocus.reminder}
              </div>
            )}

            {/* Week Notes */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">บันทึกสัปดาห์นี้</div>
              </div>
              {editingWeekNote ? (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={weekNoteDraft}
                    onChange={e => setWeekNoteDraft(e.target.value)}
                    placeholder="สัปดาห์นี้เป็นอย่างไรบ้าง? ความรู้สึก เหตุการณ์สำคัญ สิ่งที่เกิดขึ้น..."
                    className="w-full border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 resize-none text-gray-700 leading-relaxed"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingWeekNote(false)}
                      className="flex-1 border border-gray-200 rounded-xl py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                      ยกเลิก
                    </button>
                    <button onClick={() => saveWeekNote(currentWeek, weekNoteDraft)}
                      className="flex-1 bg-purple-600 text-white rounded-xl py-1.5 text-xs font-semibold hover:bg-purple-700 transition">
                      บันทึก
                    </button>
                  </div>
                </div>
              ) : currentWeek > 0 && weekNotes[currentWeek] ? (
                <div
                  onClick={() => { setWeekNoteDraft(weekNotes[currentWeek]); setEditingWeekNote(true); }}
                  className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed border border-gray-100 cursor-pointer hover:border-purple-200 hover:bg-purple-50 transition whitespace-pre-wrap"
                >
                  {weekNotes[currentWeek]}
                </div>
              ) : (
                <button
                  onClick={() => { setWeekNoteDraft(''); setEditingWeekNote(true); }}
                  className="w-full border border-dashed border-purple-200 rounded-xl py-3 text-xs text-purple-400 hover:border-purple-400 hover:text-purple-500 transition flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} /> เพิ่มบันทึกสัปดาห์นี้
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>Life progress</span><span>{lifeProgress}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-full h-2 transition-all"
                  style={{ width: `${lifeProgress}%` }} />
              </div>
            </div>
          </div>

          {/* Upcoming Events Panel */}
          <div className="bg-white rounded-2xl p-5 border border-pink-50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PartyPopper size={14} className="text-pink-500" />
                <span className="font-bold text-gray-800 text-sm">Upcoming Events</span>
              </div>
              <button onClick={() => { setEditingEvent(null); setEventModalOpen(true); }}
                className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition">
                <Plus size={14} className="text-pink-600" />
              </button>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">ยังไม่มีกิจกรรม · คลิก + เพื่อเพิ่ม</div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {upcomingEvents.map(ev => (
                  <div key={ev.id} className="flex items-center gap-3 group p-2 rounded-xl hover:bg-pink-50 transition">
                    <div className="text-xl flex-shrink-0">{ev.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700 truncate">{ev.label}</div>
                      {ev.week && ev.week > 0 && (
                        <div className="text-[10px] text-purple-500">Week {ev.week}</div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-pink-600">{ev.daysLeft === 0 ? 'Today!' : `${ev.daysLeft}d`}</div>
                      <div className="text-[10px] text-gray-400">{ev.next.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="hidden group-hover:flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setEditingEvent(events.find(x => x.id === ev.id) ?? null); setEventModalOpen(true); }}
                        className="p-0.5 text-gray-300 hover:text-purple-500"><Edit3 size={11} /></button>
                      <button onClick={e => { e.stopPropagation(); deleteEvent(ev.id); }}
                        className="p-0.5 text-gray-300 hover:text-red-400"><Trash2 size={11} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Memory Gallery — photos & videos */}
          <div className="bg-white rounded-2xl p-5 border border-purple-50 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-bold text-gray-800 text-sm">Memory Gallery</div>
                <div className="text-[11px] text-gray-400">
                  {(() => {
                    const ev = upcomingEvents.find(e => e.imageB64);
                    return ev ? `${ev.icon} ${ev.label} · ${ev.daysLeft === 0 ? 'วันนี้!' : `อีก ${ev.daysLeft} วัน`}` : 'รูปภาพ / วีดีโอ ความทรงจำสำคัญ';
                  })()}
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-xl font-semibold hover:bg-purple-700 transition">
                <Upload size={12} /> อัพโหลด
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
            </div>

            {/* Event hero image — auto-shows nearest upcoming event with image */}
            {(() => {
              const heroEvent = upcomingEvents.find(e => e.imageB64);
              if (!heroEvent) return null;
              return (
                <div className="relative rounded-xl overflow-hidden mb-3 group" style={{ paddingBottom: '65%' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroEvent.imageB64}
                    alt={heroEvent.label}
                    className="absolute inset-0 w-full h-full object-cover cursor-crosshair select-none"
                    style={{ objectPosition: `${heroEvent.imageFocalX ?? 50}% ${heroEvent.imageFocalY ?? 50}%` }}
                    onClick={e => {
                      const r = e.currentTarget.getBoundingClientRect();
                      const x = Math.round(((e.clientX - r.left) / r.width) * 100);
                      const y = Math.round(((e.clientY - r.top) / r.height) * 100);
                      // save focal point back to the event
                      const evObj = events.find(ev => ev.id === heroEvent.id);
                      if (evObj) updateEvent(evObj.id, { ...evObj, imageFocalX: x, imageFocalY: y });
                    }}
                    draggable={false}
                  />
                  {/* gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* label */}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <div className="text-white font-bold text-sm">{heroEvent.icon} {heroEvent.label}</div>
                    <div className="text-white/70 text-[11px]">
                      {heroEvent.daysLeft === 0 ? '🎉 วันนี้!' : `อีก ${heroEvent.daysLeft} วัน`}
                      {heroEvent.week && heroEvent.week > 0 ? ` · Week ${heroEvent.week}` : ''}
                    </div>
                  </div>
                  {/* focal point hint */}
                  <div className="absolute top-2 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <div className="bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">คลิกเพื่อปรับตำแหน่งรูป</div>
                  </div>
                  {/* edit event button */}
                  <button
                    onClick={() => { const evObj = events.find(ev => ev.id === heroEvent.id); if (evObj) { setEditingEvent(evObj); setEventModalOpen(true); } }}
                    className="absolute top-2 right-2 bg-white/80 text-[10px] text-purple-600 font-semibold px-2 py-1 rounded-lg shadow opacity-0 group-hover:opacity-100 transition hover:bg-purple-50">
                    แก้ไข
                  </button>
                </div>
              );
            })()}

            {/* Manual media grid */}
            {mediaItems.length === 0 ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center flex-1 text-gray-300 w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:text-purple-400 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
                style={{ minHeight: 100 }}
              >
                <ImageIcon size={32} className="mb-2" />
                <div className="text-xs font-medium">ยังไม่มีรูปหรือวีดีโอ</div>
                <div className="text-[10px] mt-0.5">กดที่นี่เพื่อเพิ่มความทรงจำ</div>
              </button>
            ) : mediaItems.length === 1 ? (
              <div className="flex-1 relative rounded-xl overflow-hidden border border-gray-100 hover:border-purple-200 transition group" style={{ minHeight: 80 }}>
                {mediaItems[0].type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaItems[0].url} alt={mediaItems[0].caption || mediaItems[0].name}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: `${mediaItems[0].focalX ?? 50}% ${mediaItems[0].focalY ?? 50}%` }} />
                ) : (
                  <video src={mediaItems[0].url} className="absolute inset-0 w-full h-full object-cover"
                    onClick={e => { const v = e.target as HTMLVideoElement; v.paused ? v.play() : v.pause(); }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
                  {mediaItems[0].caption && <div className="text-xs text-white font-medium truncate">{mediaItems[0].caption}</div>}
                  {mediaItems[0].week && <div className="text-[10px] text-purple-300">Week {mediaItems[0].week}</div>}
                </div>
                <button onClick={() => deleteMedia(mediaItems[0].id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-100">
                  <Trash2 size={12} className="text-red-400" />
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-0.5" style={{ minHeight: 0 }}>
                <div className="grid gap-2" style={{ gridTemplateColumns: mediaItems.length === 2 ? '1fr 1fr' : 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                  {mediaItems.map(item => (
                    <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-100 hover:border-purple-200 transition aspect-square">
                      {item.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.url} alt={item.caption || item.name}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `${item.focalX ?? 50}% ${item.focalY ?? 50}%` }} />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover"
                          onClick={e => { const v = e.target as HTMLVideoElement; v.paused ? v.play() : v.pause(); }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2">
                        {item.caption && <div className="text-[10px] text-white truncate">{item.caption}</div>}
                        {item.week && <div className="text-[9px] text-purple-300">Week {item.week}</div>}
                      </div>
                      <button onClick={() => deleteMedia(item.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-100">
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        open={milestoneModalOpen}
        onClose={() => { setMilestoneModalOpen(false); setClickedWeek(undefined); }}
        onSave={data => {
          if (editingMilestone) updateMilestone(editingMilestone.id, data);
          else addMilestone(data);
        }}
        existing={editingMilestone}
        defaultWeek={clickedWeek}
      />

      {/* Image Upload Modal */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            key="crop-modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              key="crop-modal-content"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm"
            >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="font-bold text-gray-800 text-sm">เพิ่มรูปความทรงจำ</div>
              <button onClick={() => setPendingFile(null)}><X size={16} className="text-gray-400" /></button>
            </div>

            {pendingFile.file.type.startsWith('image/') ? (
              <>
                {/* Crop & Move area */}
                <div className="bg-gray-950">
                  <div
                    ref={cropContainerRef}
                    className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
                    style={{ paddingBottom: '100%' }}
                    onPointerDown={handleCropPointerDown}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    onPointerCancel={handleCropPointerUp}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={cropImgRef}
                      src={pendingFile.url}
                      alt="preview"
                      draggable={false}
                      className="absolute pointer-events-none"
                      style={{
                        top: '50%',
                        left: '50%',
                        ...(pendingFile.imgH / pendingFile.imgW >= 1
                          ? { width: `${pendingFile.zoom * 100}%`, height: 'auto' }
                          : { height: `${pendingFile.zoom * 100}%`, width: 'auto' }
                        ),
                        transform: `translate(-50%, -50%) translateX(${pendingFile.panX}px) translateY(${pendingFile.panY}px)`,
                      }}
                    />
                    {/* Crop frame corners */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-white/90 rounded-tl-sm" />
                      <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-white/90 rounded-tr-sm" />
                      <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-white/90 rounded-bl-sm" />
                      <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-white/90 rounded-br-sm" />
                      {/* rule-of-thirds grid */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                        backgroundSize: '33.33% 33.33%',
                      }} />
                    </div>
                    {/* Hint — only show when no pan/zoom applied */}
                    {pendingFile.panX === 0 && pendingFile.panY === 0 && pendingFile.zoom === 1 && (
                      <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
                        <div className="bg-black/60 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                          ↔ ลากรูปเพื่อขยับ · ใช้ slider ด้านล่างซูม
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zoom slider */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                  <span className="text-base leading-none">🔍</span>
                  <input
                    type="range" min="1" max="3" step="0.01"
                    value={pendingFile.zoom}
                    onChange={e => handleZoomChange(parseFloat(e.target.value))}
                    className="flex-1 h-1.5 accent-purple-600"
                  />
                  <button
                    onClick={() => setPendingFile(p => p ? { ...p, zoom: 1, panX: 0, panY: 0 } : p)}
                    className="text-[11px] text-purple-500 font-semibold hover:text-purple-700 transition whitespace-nowrap px-2 py-1 rounded-lg hover:bg-purple-50"
                  >
                    Reset
                  </button>
                  <span className="text-[11px] text-gray-400 w-9 text-right tabular-nums">
                    {Math.round(pendingFile.zoom * 100)}%
                  </span>
                </div>

                {/* Info bar */}
                {pendingFile.imgW > 0 && (
                  <div className="px-4 py-1.5 bg-gray-50 flex items-center gap-2 text-[10px] text-gray-400 border-b border-gray-100">
                    <span className="font-semibold text-gray-600">{pendingFile.imgW} × {pendingFile.imgH}px</span>
                    <span>·</span>
                    <span>{formatBytes(pendingFile.file.size)}</span>
                    <span>·</span>
                    <span className={pendingFile.imgW < 800 ? 'text-amber-500 font-medium' : 'text-emerald-500 font-medium'}>
                      {pendingFile.imgW >= 1200 ? 'คุณภาพดีเยี่ยม' : pendingFile.imgW >= 800 ? 'คุณภาพดี' : 'ความละเอียดต่ำ'}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 px-4 py-6 text-center text-xs text-gray-500 border-b border-gray-100">
                📹 {pendingFile.file.name}<br />
                <span className="text-gray-400">{formatBytes(pendingFile.file.size)}</span>
              </div>
            )}

            {/* Caption + actions */}
            <div className="p-4 space-y-3">
              <input
                value={mediaCaption}
                onChange={e => setMediaCaption(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                placeholder="Caption (optional)"
              />
              <div className="flex gap-2">
                <button onClick={() => setPendingFile(null)}
                  className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-500 hover:bg-gray-50 transition">
                  ยกเลิก
                </button>
                <button onClick={confirmAddMedia}
                  className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 transition">
                  บันทึกรูป
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Modal */}
      <EventModal
        open={eventModalOpen}
        onClose={() => { setEventModalOpen(false); setEditingEvent(null); }}
        onSave={data => {
          if (editingEvent) updateEvent(editingEvent.id, data);
          else addEvent(data);
        }}
        existing={editingEvent}
      />
    </div>
  );
}
