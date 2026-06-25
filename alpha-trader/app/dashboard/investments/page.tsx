'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import { useAnimatedValue } from '@/components/StatCard';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart2,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clipboard,
  CircleCheckBig,
  Coins,
  Gift,
  Globe,
  Landmark,
  LineChart as LineChartIcon,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { Apple, CocaCola, Microsoft, ProcterAndGamble } from '@thesvg/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  InvestmentMonthKey,
  InvestmentTab,
  allocationRows,
  countryExposure,
  currencyExposure,
  dcaConsistency,
  dcaPlan,
  dcaTransactions,
  dividendByAsset,
  dividendCalendar,
  dividendGrowth,
  dividendHoldings,
  dividendMonthly,
  goldPurchases,
  goldTrend,
  hedgeMix,
  investmentMonths,
  investmentTabs,
  nextMonthActionPlan,
  overviewAllocation,
  portfolioGrowth,
  portfolioSummary,
  rebalanceActions,
  reviewChecklist,
  reviewConcerns,
  reviewPerformance,
  targetHedgeAllocation,
  topHoldings,
} from '@/data/investments-mock';

type HoldingItem = {
  asset: string;
  type: string;
  value: number;
  weight: number;
  unrealized: number;
  unrealizedPct: number;
  dividend: number;
  icon?: string; // base64 or URL
};

type GrowthItem = (typeof portfolioGrowth)[number];

const THB = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const USD = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const tabSubtitles: Record<InvestmentTab, string> = {
  Overview: 'สรุปภาพรวมพอร์ต มูลค่า การเติบโต เงินปันผล และความเสี่ยงหลัก',
  'Asset Allocation': 'เทียบสัดส่วนเป้าหมายกับพอร์ตจริง และดู drift ที่ควรปรับสมดุล',
  'DCA Planner': 'วางแผนซื้อรายเดือนให้ตรงงบและรักษาวินัยการลงทุน',
  'DCA Journal': 'ดูประวัติการลงทุน DCA ทั้งหมด พร้อมรายละเอียดและการวิเคราะห์',
  'Dividend Income': 'ติดตามกระแสเงินสดจากปันผลและเป้าหมาย passive income',
  'Gold & Hedge': 'ดูทองคำ เงินสด และสินทรัพย์ป้องกันความเสี่ยงในพอร์ต',
  'Portfolio Review': 'ทบทวนพอร์ตประจำเดือน พร้อม checklist และ action plan',
};

const USD_RATE = 36.5;
let ACTIVE_CURRENCY: 'THB' | 'USD' = 'THB';

function showTHB(value: number) {
  return ACTIVE_CURRENCY === 'USD'
    ? `$${USD.format(value / USD_RATE)}`
    : `${THB.format(value)} THB`;
}

function showUSD(value: number) {
  return `$${USD.format(value)}`;
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`rounded-2xl border border-purple-100/70 bg-white/90 p-4 shadow-[0_12px_32px_rgba(45,35,95,0.06)] backdrop-blur ${className}`}
    >
      {children}
    </motion.section>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[15px] font-extrabold leading-tight text-[#151a3d]">{title}</h3>
      {subtitle && <p className="mt-1 text-[11px] font-medium leading-snug text-slate-500">{subtitle}</p>}
    </div>
  );
}

function Progress({ value, tone = 'green' }: { value: number; tone?: 'green' | 'purple' | 'blue' | 'orange' | 'red' | 'gold' }) {
  const colors = {
    green: 'from-emerald-500 to-teal-400',
    purple: 'from-purple-600 to-violet-400',
    blue: 'from-blue-500 to-sky-400',
    orange: 'from-amber-500 to-orange-400',
    red: 'from-rose-500 to-red-400',
    gold: 'from-yellow-500 to-amber-400',
  };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
        transition={{ duration: 0.42, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${colors[tone]}`}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = 'green',
  progress,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ElementType;
  tone?: 'green' | 'purple' | 'blue' | 'orange' | 'red' | 'gold';
  progress?: number;
}) {
  const toneMap: Record<string, [string, string, string]> = {
    green:  ['#10b981', '#34d399', 'rgba(16,185,129,0.40)'],
    purple: ['#7c3aed', '#a855f7', 'rgba(124,58,237,0.40)'],
    blue:   ['#0ea5e9', '#38bdf8', 'rgba(14,165,233,0.40)'],
    orange: ['#f59e0b', '#fbbf24', 'rgba(245,158,11,0.42)'],
    red:    ['#f43f5e', '#fb7185', 'rgba(244,63,94,0.42)'],
    gold:   ['#eab308', '#facc15', 'rgba(234,179,8,0.42)'],
  };
  const [from, to, glow] = toneMap[tone] ?? toneMap.green;
  const animatedValue = useAnimatedValue(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, boxShadow: `0 18px 40px ${glow}` }}
      className="vivid-card relative overflow-hidden rounded-2xl p-4"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 12px 30px ${glow}` }}
    >
      {/* Large ghost icon — decorative background */}
      <div className="pointer-events-none absolute -bottom-2 -right-2 select-none" style={{ opacity: 0.18 }}>
        <Icon size={48} color="#fff" strokeWidth={1} />
      </div>

      {/* Sparkle accents */}
      <span className="spark-dot text-white" style={{ top: 8, right: 12, fontSize: 13, lineHeight: 1, '--sp-dur': '2.6s' } as React.CSSProperties}>✦</span>
      <span className="spark-dot text-white" style={{ top: 24, right: 30, fontSize: 7, lineHeight: 1, '--sp-delay': '0.9s', '--sp-dur': '3.4s' } as React.CSSProperties}>✦</span>
      <span className="spark-dot text-white" style={{ bottom: 12, left: '45%', fontSize: 9, lineHeight: 1, '--sp-delay': '1.5s', '--sp-dur': '3s' } as React.CSSProperties}>✦</span>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold text-white/85">{label}</div>
          <div className="stat-num mt-1 text-[22px] font-extrabold leading-none text-white drop-shadow-sm">{animatedValue}</div>
          <div className="mt-2 text-[11px] font-semibold text-white/90">{note}</div>
          {typeof progress === 'number' && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-white/90"
              />
            </div>
          )}
        </div>
        <div className="icon-frost flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-sm">
          <Icon size={19} color="#fff" />
        </div>
      </div>
    </motion.div>
  );
}

function MiniMetric({ title, value, note, tone = 'green' }: { title: string; value: string; note: string; tone?: 'green' | 'orange' | 'red' | 'blue' | 'purple' }) {
  const color = tone === 'red' ? 'text-rose-600 bg-rose-50 border-rose-100' : tone === 'orange' ? 'text-orange-600 bg-orange-50 border-orange-100' : tone === 'blue' ? 'text-blue-600 bg-blue-50 border-blue-100' : tone === 'purple' ? 'text-purple-600 bg-purple-50 border-purple-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-80">{title}</div>
      <div className="stat-num mt-1 text-[17px] font-extrabold text-[#151a3d]">{value}</div>
      <div className="mt-1 text-[10px] font-semibold opacity-80">{note}</div>
    </div>
  );
}

function DonutChart({
  data,
  center,
  height = 230,
}: {
  data: { name: string; value: number; color: string }[];
  center: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="relative h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height={height}>
        <RePieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RePieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">{center}</div>
    </div>
  );
}

/* ─── Custom Dropdown Component ────────────────────────────────────── */
function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  minWidth = '150px',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  minWidth?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex h-10 min-w-[150px] items-center justify-between gap-2 rounded-xl border border-purple-100 bg-white px-3 text-[12px] font-bold text-slate-700 transition hover:border-purple-200"
        style={{ minWidth }}
      >
        <span>{options.find((o) => o.value === value)?.label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full z-50 mt-2 w-full rounded-xl border border-purple-100 bg-white shadow-[0_12px_32px_rgba(45,35,95,0.12)]"
          >
            {options.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                whileHover={{ backgroundColor: '#f3f4f6' }}
                className={`flex w-full items-center px-3 py-2.5 text-left text-[12px] font-bold transition ${
                  opt.value === value
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Controls({
  month,
  setMonth,
  currency,
  setCurrency,
  risk,
  setRisk,
  onReset,
  primaryLabel,
  onPrimary,
}: {
  month: InvestmentMonthKey;
  setMonth: (month: InvestmentMonthKey) => void;
  currency: 'THB' | 'USD';
  setCurrency: (c: 'THB' | 'USD') => void;
  risk: string;
  setRisk: (r: string) => void;
  onReset: () => void;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  const currencyOptions = [
    { label: 'THB', value: 'THB' as const },
    { label: 'USD', value: 'USD' as const },
  ];

  const monthOptions = [
    { label: 'All Months (Jan-May)', value: 'all-months' as InvestmentMonthKey },
    ...investmentMonths.map((m) => ({
      label: m.label,
      value: m.key,
    })),
  ];

  const riskOptions = [
    { label: 'Moderate Risk', value: 'Moderate' },
    { label: 'Balanced', value: 'Balanced' },
    { label: 'Growth', value: 'Growth' },
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <CustomSelect
        value={currency}
        onChange={setCurrency}
        options={currencyOptions}
        minWidth="120px"
      />
      <CustomSelect
        value={month}
        onChange={setMonth}
        options={monthOptions}
        minWidth="170px"
      />
      <CustomSelect
        value={risk}
        onChange={setRisk}
        options={riskOptions}
        minWidth="150px"
      />
      <button onClick={onReset} className="h-10 rounded-xl border border-purple-100 bg-white px-4 text-[12px] font-bold text-slate-600 transition hover:border-purple-300 hover:text-purple-700">
        <RefreshCw size={14} className="mr-1 inline" />
        Reset
      </button>
      <button onClick={onPrimary} className="ml-auto h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 text-[12px] font-extrabold text-white shadow-[0_10px_24px_rgba(124,58,237,0.18)] transition hover:-translate-y-0.5">
        <Plus size={14} className="mr-1 inline" />
        {primaryLabel}
      </button>
    </div>
  );
}

/* ─── Modal: Add / Edit Investment ─────────────────────────────────── */
function InvestmentFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: HoldingItem;
  onClose: () => void;
  onSave: (item: HoldingItem) => void;
}) {
  const [form, setForm] = useState<HoldingItem>(
    initial ?? { asset: '', type: 'Equity (Global)', value: 0, weight: 0, unrealized: 0, unrealizedPct: 0, dividend: 0 }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconUrl, setIconUrl] = useState(form.icon || '');
  const [iconPreview, setIconPreview] = useState(form.icon || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle paste from clipboard (modern Clipboard API)
  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      try {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.read) {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            const imageTypes = item.types.filter(t => t.startsWith('image/'));
            if (imageTypes.length > 0) {
              const blob = await item.getType(imageTypes[0]);
              const reader = new FileReader();
              reader.onload = (evt) => {
                const base64 = evt.target?.result as string;
                setIconPreview(base64);
                setForm((prev) => ({ ...prev, icon: base64 }));
                setIconUrl('');
              };
              reader.readAsDataURL(blob);
              break;
            }
          }
        } else if (e.clipboardData?.items) {
          // Fallback to clipboardData
          for (let item of e.clipboardData.items) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                  const base64 = evt.target?.result as string;
                  setIconPreview(base64);
                  setForm((prev) => ({ ...prev, icon: base64 }));
                  setIconUrl('');
                };
                reader.readAsDataURL(file);
              }
              break;
            }
          }
        }
      } catch (err) {
        console.error('Clipboard read failed:', err);
      }
    };

    document.addEventListener('paste', handleGlobalPaste);
    return () => document.removeEventListener('paste', handleGlobalPaste);
  }, []);

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.asset.trim()) errs.asset = 'กรุณาระบุชื่อสินทรัพย์';
    if (form.value <= 0) errs.value = 'มูลค่าต้องมากกว่า 0';
    if (form.weight < 0 || form.weight > 100) errs.weight = 'น้ำหนักต้องอยู่ระหว่าง 0–100%';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setIconPreview(base64);
      setForm((prev) => ({ ...prev, icon: base64 }));
      setIconUrl('');
    };
    reader.readAsDataURL(file);
  }

  function handleIconUrlChange(url: string) {
    setIconUrl(url);
    if (url) {
      setIconPreview(url);
      setForm((prev) => ({ ...prev, icon: url }));
    }
  }

  function handleClearIcon() {
    setIconUrl('');
    setIconPreview('');
    setForm((prev) => ({ ...prev, icon: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSave() {
    if (!validate()) return;
    onSave(form);
    onClose();
  }

  const field = (label: string, key: keyof HoldingItem, type: 'text' | 'number' = 'text', placeholder = '') => (
    <div>
      <label className="mb-1 block text-[11px] font-bold text-slate-600">{label}</label>
      <input
        type={type}
        value={type === 'number' ? (form[key] as number) || '' : (form[key] as string)}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-purple-100 px-3 text-[12px] font-bold text-slate-700 outline-none focus:border-purple-300"
      />
      {errors[key] && <p className="mt-1 text-[10px] font-bold text-rose-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_24px_64px_rgba(45,35,95,0.18)] max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
          <X size={16} />
        </button>
        <h2 className="mb-1 text-[18px] font-extrabold text-[#151a3d]">
          {initial ? 'แก้ไขสินทรัพย์' : 'เพิ่มสินทรัพย์ใหม่'}
        </h2>
        <p className="mb-5 text-[11px] font-medium text-slate-400">
          {initial ? 'แก้ไขข้อมูลสินทรัพย์ใน Portfolio' : 'เพิ่มสินทรัพย์เข้าใน Investment Portfolio Planner'}
        </p>
        <div className="space-y-3">
          {field('ชื่อสินทรัพย์', 'asset', 'text', 'เช่น Apple Inc. (AAPL)')}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-600">ประเภทสินทรัพย์</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="h-10 w-full rounded-xl border border-purple-100 px-3 text-[12px] font-bold text-slate-700 outline-none focus:border-purple-300"
            >
              {['Equity (Global)', 'Equity (Thai)', 'Bonds', 'Gold', 'REITs', 'Cash'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('มูลค่า (THB)', 'value', 'number', '0.00')}
            {field('น้ำหนัก (%)', 'weight', 'number', '0.00')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('Unrealized Gain (THB)', 'unrealized', 'number', '0.00')}
            {field('Unrealized (%)', 'unrealizedPct', 'number', '0.00')}
          </div>
          {field('YTD Dividend (THB)', 'dividend', 'number', '0.00')}

          {/* Icon Upload Section */}
          <div className="border-t border-slate-100 pt-3 mt-5">
            <label className="mb-2 block text-[11px] font-bold text-slate-600">🎨 Icon สินทรัพย์ (ตัวเลือก)</label>
            <div className="space-y-2">
              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('bg-purple-50', 'border-purple-300');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-purple-50', 'border-purple-300');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('bg-purple-50', 'border-purple-300');
                  const file = e.dataTransfer.files[0];
                  if (file?.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const base64 = evt.target?.result as string;
                      setIconPreview(base64);
                      setForm((prev) => ({ ...prev, icon: base64 }));
                      setIconUrl('');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/50 p-4 text-center transition hover:border-purple-300"
              >
                <div className="text-[11px] font-bold text-purple-700">
                  📎 Drag & Drop รูป หรือ Ctrl+V วาง
                </div>
                <div className="mt-2 text-[10px] text-purple-600">
                  (Copy image → Ctrl+V ปะติด)
                </div>
              </div>

              {/* File Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-9 rounded-lg border border-purple-200 bg-white text-[11px] font-bold text-purple-600 transition hover:bg-purple-50"
                >
                  📁 เลือกรูปจากคอมพิวเตอร์
                </button>
              </div>

              {/* URL Input */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500">หรือ Paste URL รูปจาก Google</label>
                <input
                  type="text"
                  value={iconUrl}
                  onChange={(e) => handleIconUrlChange(e.target.value)}
                  placeholder="https://example.com/icon.png"
                  className="mt-1 h-9 w-full rounded-lg border border-purple-100 px-3 text-[11px] font-bold text-slate-700 outline-none focus:border-purple-300"
                />
              </div>

              {/* Preview */}
              {iconPreview && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-purple-200">
                      <img src={iconPreview} alt="preview" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-purple-700">Preview ✓</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearIcon}
                    className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50"
                  >
                    Clear
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 transition hover:border-slate-300">
            ยกเลิก
          </button>
          <button onClick={handleSave} className="flex-1 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5">
            {initial ? 'บันทึกการแก้ไข' : 'เพิ่มสินทรัพย์'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Modal: Rebalance Detail ───────────────────────────────────────── */
function RebalanceDetailModal({ onClose, showToast }: { onClose: () => void; showToast: (m: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_24px_64px_rgba(45,35,95,0.18)]"
      >
        <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
          <X size={16} />
        </button>
        <h2 className="mb-1 text-[18px] font-extrabold text-[#151a3d]">รายละเอียดการปรับพอร์ต</h2>
        <p className="mb-4 text-[11px] font-medium text-slate-400">Rebalance Recommendation — May 2026</p>

        <div className="mb-4 space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">Allocation Drift</p>
          {allocationRows.map((item) => (
            <div key={item.assetClass} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-[12px]">
              <span className="font-extrabold text-slate-800">{item.assetClass}</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="text-slate-400">เป้า {item.target}%</span>
                <span className="font-bold text-slate-700">จริง {item.current}%</span>
                <span className={`font-extrabold ${item.drift > 0 ? 'text-rose-500' : item.drift < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {item.drift > 0 ? '+' : ''}{item.drift}%
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === 'Overweight' ? 'bg-rose-50 text-rose-500' : item.status === 'Underweight' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 space-y-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">แผนปรับสัดส่วน</p>
          {rebalanceActions.map((item) => (
            <div key={item.action} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-[12px]">
              <span className="font-semibold text-slate-700">{item.action}</span>
              <span className={`font-extrabold ${item.amount < 0 ? 'text-rose-500' : item.amount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {item.amount === 0 ? '—' : showTHB(Math.abs(item.amount))}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-[12px] font-bold text-slate-600 transition hover:border-slate-300">
            ปิด
          </button>
          <button
            onClick={() => { showToast('บันทึกแผน Rebalance แล้ว'); onClose(); }}
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
          >
            บันทึกแผน Rebalance
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Modal: Investment Guide ───────────────────────────────────────── */
function InvestmentGuideModal({ onClose }: { onClose: () => void }) {
  const sections = [
    { icon: TrendingUp, title: 'Overview', color: '#10b981', desc: 'ดูมูลค่าพอร์ตรวม กำไรขาดทุนสะสม เงินปันผล และสถานะ DCA ทั้งหมดในที่เดียว ใช้ filter เดือนเพื่อดูข้อมูลย้อนหลัง' },
    { icon: Target, title: 'Asset Allocation', color: '#7c3aed', desc: 'เทียบสัดส่วนพอร์ตจริงกับเป้าหมาย (target) และดู drift ที่เกินกรอบ ±5% เพื่อตัดสินใจ rebalance' },
    { icon: CalendarDays, title: 'DCA Planner', color: '#2563eb', desc: 'วางแผนซื้อสินทรัพย์รายเดือนให้สอดคล้องกับ allocation target รักษาวินัยและติดตามความสม่ำเสมอ' },
    { icon: Gift, title: 'Dividend Income', color: '#16a34a', desc: 'ติดตามกระแสเงินสดจากเงินปันผล เช็ควันจ่าย คำนวณ yield on cost และวัดความคืบหน้าสู่เป้าหมาย passive income' },
    { icon: Landmark, title: 'Gold & Hedge', color: '#d97706', desc: 'ดูน้ำหนักทองคำและสินทรัพย์ป้องกันความเสี่ยง เทียบ drawdown ของพอร์ตกับทอง และบันทึกการซื้อทอง' },
    { icon: RefreshCw, title: 'Portfolio Review', color: '#a855f7', desc: 'ทบทวนพอร์ตประจำเดือน ตรวจ checklist ดู performance vs goal บันทึก note และวางแผนสำหรับเดือนถัดไป' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg rounded-2xl border border-purple-100 bg-white p-6 shadow-[0_24px_64px_rgba(45,35,95,0.18)] max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
          <X size={16} />
        </button>
        <div className="mb-1 flex items-center gap-2">
          <BookOpen size={20} className="text-purple-600" />
          <h2 className="text-[18px] font-extrabold text-[#151a3d]">คู่มือ Investment Portfolio Planner</h2>
        </div>
        <p className="mb-5 text-[11px] font-medium text-slate-400">วิธีใช้งานแต่ละ Tab เพื่อวางแผนพอร์ตลงทุนอย่างเป็นระบบ</p>
        <div className="space-y-3">
          {sections.map(({ icon: Icon, title, color, desc }) => (
            <div key={title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <div className="text-[12px] font-extrabold text-slate-800">{title}</div>
                <div className="mt-0.5 text-[11px] font-medium leading-relaxed text-slate-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-3 text-[11px] font-semibold leading-relaxed text-purple-700">
          💡 <strong>เคล็ดลับ:</strong> ใช้ filter เดือนด้านบนเพื่อดูข้อมูลพอร์ต ณ เดือนนั้น ๆ และเลือก Risk Profile ให้ตรงกับเป้าหมายการลงทุนของคุณ
        </div>
        <button onClick={onClose} className="mt-4 h-10 w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[12px] font-extrabold text-white">
          เข้าใจแล้ว
        </button>
      </motion.div>
    </div>
  );
}

/* ─── Tab: Overview ─────────────────────────────────────────────────── */
function OverviewTab({
  showToast,
  risk,
  holdings,
  onEditHolding,
  onDeleteHolding,
  filteredGrowth,
  monthSnapshot,
  monthLabel,
  onShowRebalance,
  onShowGuide,
  month,
  setMonth,
  currency,
  setCurrency,
  setRisk,
  onReset,
  onAddInvestment,
}: {
  showToast: (message: string) => void;
  risk: string;
  holdings: HoldingItem[];
  onEditHolding: (item: HoldingItem) => void;
  onDeleteHolding: (asset: string) => void;
  filteredGrowth: GrowthItem[];
  monthSnapshot: GrowthItem;
  monthLabel: string;
  onShowRebalance: () => void;
  onShowGuide: () => void;
  month: InvestmentMonthKey;
  setMonth: (month: InvestmentMonthKey) => void;
  currency: 'THB' | 'USD';
  setCurrency: (c: 'THB' | 'USD') => void;
  setRisk: (r: string) => void;
  onReset: () => void;
  onAddInvestment: () => void;
}) {
  const riskTone = risk === 'Growth' ? 'orange' : risk === 'Balanced' ? 'green' : 'blue';
  const riskNote = risk === 'Growth' ? 'รับความเสี่ยงสูงขึ้น' : risk === 'Balanced' ? 'สมดุลเสี่ยง/ผลตอบแทน' : 'เหมาะสมกับเป้าหมาย';
  const unrealizedPct = monthSnapshot.invested > 0 ? ((monthSnapshot.gain / monthSnapshot.invested) * 100).toFixed(2) : '0.00';
  const prevGrowth = filteredGrowth.length > 1 ? filteredGrowth[filteredGrowth.length - 2] : null;
  const vsNote = prevGrowth ? `${monthSnapshot.portfolio >= prevGrowth.portfolio ? '+' : ''}${(((monthSnapshot.portfolio - prevGrowth.portfolio) / prevGrowth.portfolio) * 100).toFixed(2)}% vs prev month` : 'ข้อมูลเดือนแรก';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Portfolio Value" value={showTHB(monthSnapshot.portfolio)} note={vsNote} icon={TrendingUp} tone="green" />
        <StatCard label="Total Invested" value={showTHB(monthSnapshot.invested)} note="Total contributions" icon={Wallet} tone="purple" />
        <StatCard label="Unrealized Gain" value={showTHB(monthSnapshot.gain)} note={`+${unrealizedPct}% total return`} icon={LineChartIcon} tone="green" />
        <StatCard label="Dividend YTD" value={showTHB(monthSnapshot.dividend)} note={monthLabel} icon={Gift} tone="blue" />
        <StatCard label="DCA Completion" value={`${portfolioSummary.dcaCompletion}%`} note={`${portfolioSummary.dcaMonthsDone} of ${portfolioSummary.dcaMonthsTotal} months`} icon={Target} tone="green" progress={portfolioSummary.dcaCompletion} />
        <StatCard label="Risk Level" value={risk} note={riskNote} icon={ShieldCheck} tone={riskTone} />
      </div>

      {/* Filter Controls — moved below KPI cards */}
      <Controls
        month={month}
        setMonth={setMonth}
        currency={currency}
        setCurrency={(c) => { setCurrency(c); showToast(`Currency: ${c}`); }}
        risk={risk}
        setRisk={(r) => { setRisk(r); showToast(`Risk profile: ${r}`); }}
        onReset={onReset}
        primaryLabel="Add Investment"
        onPrimary={onAddInvestment}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-6">
          <SectionTitle
            title="Portfolio Growth (THB)"
            subtitle={`มูลค่าพอร์ตเทียบกับเงินลงทุนสะสม — ${month === 'all-months' ? '📊 All Months' : monthLabel}`}
          />
          <div className="h-[275px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredGrowth}>
                <defs>
                  <linearGradient id="growthGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.26} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.10)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                <Tooltip formatter={(value: number) => showTHB(value)} />
                <Legend />
                <Area dataKey="portfolio" name="Portfolio Value" type="monotone" stroke="#10b981" strokeWidth={2.4} fill="url(#growthGreen)" />
                <Line dataKey="invested" name="Total Invested" type="monotone" stroke="#64748b" strokeDasharray="5 5" strokeWidth={1.8} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="xl:col-span-4">
          <SectionTitle title="Asset Allocation" subtitle="สัดส่วนสินทรัพย์หลักของพอร์ต" />
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_150px]">
            <DonutChart
              data={overviewAllocation}
              center={<div><div className="stat-num text-[14px] font-extrabold text-slate-900">{showTHB(monthSnapshot.portfolio)}</div></div>}
            />
            <div className="space-y-2 text-[11px]">
              {overviewAllocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.name}</span>
                  <span className="font-extrabold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-4 xl:col-span-2">
          <Panel>
            <SectionTitle title="Rebalance Alert" subtitle="มี drift เกินกรอบใน 2 หมวด" />
            <div className="space-y-2 text-[11px] font-semibold text-slate-600">
              <div className="flex justify-between"><span>Equity (Global)</span><span className="text-rose-500">+6.1%</span></div>
              <div className="flex justify-between"><span>Cash</span><span className="text-emerald-600">-1.8%</span></div>
            </div>
            <button
              onClick={onShowRebalance}
              className="mt-4 h-9 w-full rounded-xl border border-emerald-100 bg-emerald-50 text-[11px] font-extrabold text-emerald-700 transition hover:bg-emerald-100"
            >
              ดูรายละเอียดและปรับพอร์ต <ArrowRight size={13} className="ml-1 inline" />
            </button>
          </Panel>
          <Panel>
            <SectionTitle title="Investment Insights" subtitle="พอร์ตยังเติบโตจาก DCA และ ETF หลัก" />
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredGrowth}>
                  <Line dataKey="gain" type="monotone" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7">
          <div className="mb-3 flex items-start justify-between">
            <SectionTitle title="Top Holdings" subtitle="สินทรัพย์หลักที่ขับเคลื่อนผลตอบแทน" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                  <th className="pb-2">Asset</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Value</th>
                  <th className="pb-2">Weight</th>
                  <th className="pb-2">Unrealized Gain</th>
                  <th className="pb-2">YTD Dividend</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((item) => {
                  const iconMap: Record<string, { type: 'svg' | 'badge'; bg: string; text: string; label: string }> = {
                    'Apple Inc. (AAPL)':            { type: 'svg',   bg: '#f3f4f6', text: '#000', label: '' },
                    'Vanguard S&P 500 ETF (VOO)':   { type: 'badge', bg: '#932722', text: '#fff', label: 'VOO' },
                    'SCB SET Index Fund (SCBSET)':  { type: 'badge', bg: '#4f46e5', text: '#fff', label: 'SCB' },
                    'PTT Public Co., Ltd. (PTT)':   { type: 'badge', bg: '#0f766e', text: '#fff', label: 'PTT' },
                    'SPDR Gold Shares (GLD)':       { type: 'badge', bg: '#d97706', text: '#fff', label: 'GLD' },
                  };
                  const cfg = iconMap[item.asset];
                  const initials = item.asset.match(/\(([^)]+)\)/)?.[1]?.slice(0, 3) ?? item.asset.slice(0, 3).toUpperCase();
                  const hasCustomIcon = !!item.icon;

                  return (
                    <tr key={item.asset} className="border-b border-slate-50 text-[11px] transition hover:bg-purple-50/20">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 shadow-sm"
                            style={{ background: hasCustomIcon ? 'transparent' : cfg?.bg ?? '#e5e7eb' }}
                          >
                            {hasCustomIcon ? (
                              <img src={item.icon} alt={item.asset} className="h-full w-full object-cover" />
                            ) : cfg?.type === 'svg' ? (
                              <Apple style={{ width: 18, height: 18 }} />
                            ) : (
                              <span className="text-[9px] font-extrabold" style={{ color: cfg?.text ?? '#fff' }}>{cfg?.label ?? initials}</span>
                            )}
                          </div>
                          <span className="font-extrabold text-slate-900">{item.asset}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-semibold text-slate-500">{item.type}</td>
                      <td className="py-2.5 font-bold text-slate-800">{THB.format(item.value)}</td>
                      <td className="py-2.5 font-bold text-slate-800">{item.weight}%</td>
                      <td className="py-2.5 font-bold text-emerald-600">+{THB.format(item.unrealized)} (+{item.unrealizedPct}%)</td>
                      <td className="py-2.5 font-bold text-slate-800">{THB.format(item.dividend)}</td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditHolding(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 transition hover:bg-purple-100"
                            title="แก้ไข"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`ลบ "${item.asset}" ออกจากพอร์ต?`)) onDeleteHolding(item.asset);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100"
                            title="ลบ"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {holdings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[12px] font-semibold text-slate-400">
                      ยังไม่มีสินทรัพย์ — กด "+ Add Investment" เพื่อเพิ่ม
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel className="xl:col-span-2">
          <SectionTitle title="DCA This Month" subtitle="สถานะแผนซื้อประจำเดือน" />
          <div className="stat-num text-[24px] font-extrabold text-slate-900">{showTHB(portfolioSummary.dcaThisMonth.budget)}</div>
          <div className="mt-4"><Progress value={portfolioSummary.dcaCompletion} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <MiniMetric title="Paid" value={showTHB(monthSnapshot.dca)} note="จ่ายแล้ว" />
            <MiniMetric title="Remain" value={showTHB(Math.max(0, portfolioSummary.dcaThisMonth.budget - monthSnapshot.dca))} note="คงเหลือ" tone="blue" />
          </div>
          <button onClick={() => showToast('DCA plan opened')} className="mt-4 h-9 w-full rounded-xl border border-purple-100 bg-purple-50 text-[11px] font-extrabold text-purple-700">ดูแผน DCA</button>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="What This Tab Means" subtitle="ภาพรวมพอร์ตลงทุนทั้งหมด" />
          <p className="text-[12px] leading-relaxed text-slate-600">
            ใช้ดูมูลค่าพอร์ต ผลตอบแทน เงินปันผล ความเสี่ยง และสถานะ DCA เพื่อให้ตัดสินใจลงทุนได้เป็นระบบขึ้น.
          </p>
          <button
            onClick={onShowGuide}
            className="mt-4 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 text-[11px] font-extrabold text-white transition hover:-translate-y-0.5"
          >
            <BookOpen size={13} className="mr-1 inline" />
            อ่านเพิ่มเติม
          </button>
        </Panel>
      </div>
    </div>
  );
}

function AllocationTab({ showToast }: { showToast: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Target Match" value="91%" note="+4% vs Apr" icon={Target} tone="green" />
        <StatCard label="Current Drift" value="3.8%" note="+0.6% vs Apr" icon={LineChartIcon} tone="orange" />
        <StatCard label="Equity Exposure" value="62.5%" note="Within Policy" icon={TrendingUp} tone="green" />
        <StatCard label="Defensive Assets" value="31.0%" note="Within Policy" icon={ShieldCheck} tone="blue" />
        <StatCard label="Gold Weight" value="6.5%" note="Within Policy" icon={Landmark} tone="gold" />
        <StatCard label="Rebalance Status" value="On Track" note="Last plan: 1 May 2026" icon={RefreshCw} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionTitle title="Current vs Target Allocation" subtitle="รวมสัดส่วนเป้าหมายและพอร์ตจริง" />
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_210px]">
            <DonutChart
              data={allocationRows.map((item) => ({ name: item.assetClass, value: item.current, color: item.color }))}
              center={<div><div className="text-[10px] font-bold text-slate-500">Total</div><div className="stat-num text-[24px] font-extrabold text-slate-900">100%</div></div>}
            />
            <div className="space-y-2 text-[11px]">
              {allocationRows.map((item) => (
                <div key={item.assetClass} className="grid grid-cols-[1fr_44px_44px_44px] gap-1">
                  <span className="font-semibold text-slate-600">{item.assetClass}</span>
                  <span>{item.target}%</span><span>{item.current}%</span>
                  <span className={item.drift > 0 ? 'text-emerald-600' : item.drift < 0 ? 'text-rose-500' : 'text-slate-500'}>{item.drift > 0 ? '+' : ''}{item.drift}%</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Target vs Current (%)" subtitle="เทียบ allocation แบบ bar chart" />
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationRows} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.08)" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="assetClass" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={82} />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" name="Target" fill="#c4b5fd" radius={[0, 8, 8, 0]} />
                <Bar dataKey="current" name="Current" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-2">
          <SectionTitle title="Country Exposure" subtitle="Top 5 ภูมิภาคหลัก" />
          <div className="space-y-3">
            {countryExposure.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600"><span>{item.name}</span><span>{item.value}%</span></div>
                <Progress value={item.value} tone={item.name === 'Others' ? 'purple' : 'green'} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Currency Exposure" subtitle="สกุลเงินที่พอร์ตถืออยู่" />
          <div className="space-y-3">
            {currencyExposure.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600"><span>{item.name}</span><span>{item.value}%</span></div>
                <Progress value={item.value} tone={item.name === 'USD' ? 'green' : 'blue'} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <Panel>
          <SectionTitle title="Allocation Drift Table" subtitle="สถานะน้ำหนักรายสินทรัพย์" />
          <div className="space-y-2">
            {allocationRows.map((item) => (
              <div key={item.assetClass} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px]">
                <span className="font-extrabold text-slate-800">{item.assetClass}</span>
                <span className="font-bold text-slate-500">{item.current}%</span>
                <span className={item.status === 'Overweight' ? 'rounded-full bg-rose-50 px-2 py-1 font-bold text-rose-500' : item.status === 'Underweight' ? 'rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-600' : 'rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-500'}>{item.status}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <SectionTitle title="Rebalance Recommendation" subtitle="คำแนะนำปรับสัดส่วน" />
          <div className="space-y-2">
            {rebalanceActions.map((item) => (
              <div key={item.action} className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>{item.action}</span>
                <span className={item.amount < 0 ? 'text-rose-500' : item.amount > 0 ? 'text-emerald-600' : 'text-slate-400'}>{item.amount === 0 ? '-' : showTHB(item.amount)}</span>
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Rebalance plan saved')} className="mt-4 h-9 w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[11px] font-extrabold text-white">Save Rebalance Plan</button>
        </Panel>
        <Panel>
          <SectionTitle title="What This Tab Means" subtitle="Target, current, drift และ rebalance" />
          <p className="text-[12px] leading-relaxed text-slate-600">ใช้ดูว่าสัดส่วนพอร์ตยังอยู่ในกรอบเป้าหมายหรือไม่ และควรโยกเงินส่วนไหนเพื่อคุมความเสี่ยง.</p>
        </Panel>
        <Panel>
          <SectionTitle title="Allocation Insights" subtitle="ข้อสังเกตสำคัญ" />
          {['Equity สูงกว่าเป้าหมายเล็กน้อย', 'Fixed Income ต่ำกว่าเป้า', 'Gold ยังอยู่ในกรอบนโยบาย', 'Diversification ครอบคลุมดี'].map((text) => (
            <div key={text} className="mb-2 flex gap-2 text-[12px] font-semibold text-slate-600"><CheckCircle2 size={15} className="text-emerald-500" />{text}</div>
          ))}
          <button onClick={() => showToast('Allocation insight opened')} className="mt-2 text-[11px] font-extrabold text-purple-600">ดู insight ทั้งหมด</button>
        </Panel>
      </div>
    </div>
  );
}

function DcaPlannerTab({ showToast }: { showToast: (message: string) => void }) {
  const [selectedMonth, setSelectedMonth] = useState<InvestmentMonthKey>('2026-06');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDCADetail, setShowDCADetail] = useState(false);
  const today = 14; // June 14, 2026

  // Get data for selected month
  const selectedMonthData = useMemo(() => {
    if (selectedMonth === '2026-06') return { label: 'June 2026', daysInMonth: 30, monthStr: '06' };
    if (selectedMonth === '2026-05') return { label: 'May 2026', daysInMonth: 31, monthStr: '05' };
    if (selectedMonth === '2026-04') return { label: 'April 2026', daysInMonth: 30, monthStr: '04' };
    if (selectedMonth === '2026-03') return { label: 'March 2026', daysInMonth: 31, monthStr: '03' };
    if (selectedMonth === '2026-02') return { label: 'February 2026', daysInMonth: 28, monthStr: '02' };
    if (selectedMonth === '2026-01') return { label: 'January 2026', daysInMonth: 31, monthStr: '01' };
    if (selectedMonth === 'all-months') return { label: 'All Months', daysInMonth: 31, monthStr: '*' };
    return { label: 'June 2026', daysInMonth: 30, monthStr: '06' };
  }, [selectedMonth]);

  // Get transaction dates for selected month
  const transactionDatesForMonth = useMemo(() => {
    const dates = new Set<number>();
    dcaTransactions.forEach((tx) => {
      if (selectedMonth === 'all-months' || tx.date.includes(selectedMonthData.monthStr)) {
        const dayStr = tx.date.split('-')[2];
        const day = parseInt(dayStr);
        dates.add(day);
      }
    });
    return dates;
  }, [selectedMonth, selectedMonthData.monthStr]);

  // Get transactions for selected day
  const selectedDayTransactions = useMemo(() => {
    if (!selectedDay || selectedMonth === 'all-months') return [];
    const dateStr = `2026-${selectedMonthData.monthStr}-${String(selectedDay).padStart(2, '0')}`;
    return dcaTransactions.filter((tx) => tx.date === dateStr);
  }, [selectedDay, selectedMonth, selectedMonthData.monthStr]);

  const monthOptions = [
    { label: 'All Months', value: 'all-months' as InvestmentMonthKey },
    { label: 'January 2026', value: '2026-01' as InvestmentMonthKey },
    { label: 'February 2026', value: '2026-02' as InvestmentMonthKey },
    { label: 'March 2026', value: '2026-03' as InvestmentMonthKey },
    { label: 'April 2026', value: '2026-04' as InvestmentMonthKey },
    { label: 'May 2026', value: '2026-05' as InvestmentMonthKey },
    { label: 'June 2026', value: '2026-06' as InvestmentMonthKey },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Monthly Budget" value="฿10,000" note="+10.0% จากเดือนที่แล้ว" icon={Wallet} tone="green" />
        <StatCard label="DCA Completion" value="83%" note="ครบ 5 จาก 6 แผน" icon={Target} tone="green" progress={83} />
        <StatCard label="Missed Months" value="1" note="พลาดเดือนล่าสุด: May" icon={CalendarDays} tone="red" />
        <StatCard label="Auto Allocation" value="On" note="ตามเป้าหมายที่ตั้งไว้" icon={RefreshCw} tone="green" />
        <StatCard label="Next Buy Date" value="10 Jun 2026" note="อีก 2 วัน" icon={CalendarDays} tone="blue" />
        <StatCard label="Portfolio Alignment" value="85%" note="ใกล้เคียงเป้าหมาย" icon={LineChartIcon} tone="purple" />
      </div>

      {/* Month Filter - Below KPI cards */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-bold text-slate-600">เลือกเดือน:</span>
        <CustomSelect
          value={selectedMonth}
          onChange={v => setSelectedMonth(v as InvestmentMonthKey)}
          options={monthOptions}
          minWidth="140px"
        />
        <span className="text-[10px] text-slate-400">📅 วันนี้: June 14, 2026</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionTitle title="Monthly DCA Plan" subtitle="การเฉลี่ยซื้อรายเดือน" />
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_230px]">
            <DonutChart
              data={dcaPlan.map((item) => ({ name: item.asset, value: item.weight, color: item.color }))}
              center={<div><div className="text-[10px] font-bold text-slate-500">Total</div><div className="stat-num text-[22px] font-extrabold text-slate-900">฿10,000</div></div>}
            />
            <div className="space-y-2 text-[11px]">
              {dcaPlan.map((item) => (
                <div key={item.ticker} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-600"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.asset}</span>
                  <span className="font-extrabold text-slate-800">฿{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="DCA Calendar" subtitle={`ตารางการซื้อเดือน ${selectedMonthData.label}`} />
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'].map((day) => <div key={day} className="py-1 font-bold text-slate-400">{day}</div>)}
            {(() => {
              // Calculate first day of month offset (Mon-start: 0=Mon, 6=Sun)
              const [yr, mo] = selectedMonth === 'all-months' ? [2026, 6] : selectedMonth.split('-').map(Number);
              const jsFirstDay = new Date(yr, mo - 1, 1).getDay(); // 0=Sun,1=Mon...6=Sat
              const startOffset = (jsFirstDay + 6) % 7; // Convert to Mon-start
              const daysInMonth = selectedMonthData.daysInMonth;
              const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
              return Array.from({ length: totalCells }, (_, index) => {
              const day = index - startOffset + 1; // 1-based day number
              // Today is June 14, 2026 - highlight only if viewing June
              const isToday = selectedMonth === '2026-06' && day === 14;
              // Get planned purchase days from transaction dates
              const planned = transactionDatesForMonth.has(day) && day >= 1;

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (day > 0 && day <= daysInMonth) {
                      setSelectedDay(day);
                      const dateStr = `2026-${selectedMonthData.monthStr}-${String(day).padStart(2, '0')}`;
                      const txns = dcaTransactions.filter((tx) => tx.date === dateStr);
                      if (txns.length > 0) {
                        setShowDCADetail(true);
                      } else {
                        showToast(`No DCA transactions on this day`);
                      }
                    }
                  }}
                  className={`h-8 rounded-lg font-bold transition ${
                    isToday
                      ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300'
                      : planned
                      ? 'bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100'
                      : day > 0 && day <= daysInMonth
                      ? 'text-slate-600 hover:bg-purple-50'
                      : 'text-slate-300'
                  }`}
                >
                  {day >= 1 && day <= daysInMonth ? day : ''}
                </button>
              );
              });
            })()}
          </div>
          <div className="mt-3 flex gap-4 text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /><CircleCheckBig size={13} className="text-blue-500" /> วันนี้</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /><Check size={13} className="text-emerald-500" /> ซื้อแล้ว</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-rose-500" /><AlertCircle size={13} className="text-rose-500" /> พลาดแผน</span>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="Suggested Buy This Month" subtitle="คำแนะนำซื้อวันที่ 10 Jun 2026" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[430px] text-left">
              <thead className="text-[10px] uppercase text-slate-400"><tr><th className="pb-2">Asset</th><th className="pb-2">Ticker</th><th className="pb-2">Amount</th><th className="pb-2">Action</th></tr></thead>
              <tbody>
                {dcaPlan.map((item) => {
                  const tickerIconMap: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
                    'EFVN3001': { icon: BarChart2,  bg: '#ede9fe', color: '#7c3aed' },
                    'VOO':      { icon: Globe,       bg: '#dbeafe', color: '#2563eb' },
                    'AGG':      { icon: Landmark,    bg: '#fef3c7', color: '#d97706' },
                    'I-REIT':   { icon: Building2,   bg: '#d1fae5', color: '#059669' },
                    'GLD':      { icon: Coins,       bg: '#fef9c3', color: '#ca8a04' },
                    'SCBMM':    { icon: Banknote,    bg: '#f1f5f9', color: '#475569' },
                  };
                  const cfg = tickerIconMap[item.ticker];
                  const IconComp = cfg?.icon;
                  return (
                    <tr key={item.ticker} className="border-b border-slate-50 text-[11px] transition hover:bg-purple-50/20">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {IconComp && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: cfg.bg }}>
                              <IconComp size={14} color={cfg.color} />
                            </div>
                          )}
                          <span className="font-bold text-slate-800">{item.asset}</span>
                        </div>
                      </td>
                      <td className="py-2 text-slate-500">{item.ticker}</td>
                      <td className="py-2 font-bold">฿{item.amount.toLocaleString()}</td>
                      <td className="py-2"><button onClick={() => showToast(`Buy order prepared: ${item.ticker}`)} className="rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">Buy</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionTitle title="Target Alignment After DCA" subtitle="สัดส่วนหลังทำ DCA ตามแผน" />
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dcaPlan} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="asset" type="category" width={100} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="weight" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="DCA Consistency Trend" subtitle="อัตราทำตามแผนย้อนหลัง" />
          <div className="h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dcaConsistency}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Line dataKey="completion" type="monotone" stroke="#16a34a" strokeWidth={2.4} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="DCA Insights" subtitle="สิ่งที่ควรรักษาและปรับปรุง" />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-1">
            {['ลงทุนอย่างสม่ำเสมอช่วยลดความผันผวน', 'รักษาวินัยต่อเนื่องใกล้เป้าหมาย', 'ใกล้เป้าหมายมากขึ้นหลัง DCA'].map((item, index) => (
              <div key={item} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-[12px] font-semibold text-emerald-800">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600">{index + 1}</span>{item}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* DCA Detail Modal - Extra Large */}
      <AnimatePresence>
        {showDCADetail && selectedDay && selectedDayTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDCADetail(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">DCA Transaction Details</h2>
                  <p className="text-sm text-slate-500">
                    {selectedDay} {selectedMonthData.label} • {selectedDayTransactions.length} transaction{selectedDayTransactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowDCADetail(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedDayTransactions.map((tx, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-25 p-4">
                      {/* Header */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
                            <CheckCircle2 size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{tx.asset}</div>
                            <div className="text-sm text-slate-500">{tx.ticker} • {tx.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">฿{tx.amount.toLocaleString()}</div>
                          <div className="text-xs text-slate-500 capitalize">{tx.status === 'completed' ? 'สำเร็จ' : tx.status}</div>
                        </div>
                      </div>

                      {/* Main Details */}
                      <div className="mb-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 md:grid-cols-4">
                        <div>
                          <div className="text-xs font-bold text-slate-600">ราคาซื้อต่อหน่วย</div>
                          <div className="font-extrabold text-slate-900">฿{tx.price.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-600">จำนวนหน่วย</div>
                          <div className="font-extrabold text-slate-900">{tx.units.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-600">มูลค่ารวม</div>
                          <div className="font-extrabold text-slate-900">฿{tx.totalValue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-600">ภาคส่วน</div>
                          <div className="text-sm text-slate-700">{tx.sector}</div>
                        </div>
                      </div>

                      {/* Extended Details */}
                      <div className="mb-3 space-y-2 border-t border-slate-200 pt-3">
                        <div className="flex items-start gap-2">
                          <TrendingUp size={16} className="mt-1 flex-shrink-0 text-slate-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-600">คาดการณ์ผลตอบแทน</div>
                            <div className="text-sm text-slate-700">{tx.expectedReturn}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Target size={16} className="mt-1 flex-shrink-0 text-slate-600" />
                          <div>
                            <div className="text-xs font-bold text-slate-600">เหตุผลการลงทุน</div>
                            <div className="text-sm text-slate-700">{tx.reason}</div>
                          </div>
                        </div>
                        {tx.notes && (
                          <div className="flex items-start gap-2">
                            <BookOpen size={16} className="mt-1 flex-shrink-0 text-slate-600" />
                            <div>
                              <div className="text-xs font-bold text-slate-600">หมายเหตุ</div>
                              <div className="text-sm text-slate-700">{tx.notes}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase text-emerald-700">Total Invested</div>
                      <div className="mt-1 text-2xl font-extrabold text-emerald-900">
                        ฿{selectedDayTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase text-emerald-700">Total Units</div>
                      <div className="mt-1 text-2xl font-extrabold text-emerald-900">
                        {selectedDayTransactions.reduce((sum, tx) => sum + tx.units, 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase text-emerald-700">Avg Price</div>
                      <div className="mt-1 text-2xl font-extrabold text-emerald-900">
                        ฿{(selectedDayTransactions.reduce((sum, tx) => sum + tx.amount, 0) / selectedDayTransactions.reduce((sum, tx) => sum + tx.units, 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowDCADetail(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast(`DCA on ${selectedDay} ${selectedMonthData.label} confirmed`);
                    setShowDCADetail(false);
                  }}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-white transition hover:bg-emerald-600"
                >
                  Confirm & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DCAJournalTab({ showToast }: { showToast: (message: string) => void }) {
  const [filterType, setFilterType] = useState<'all' | 'Growth' | 'Dividend' | 'Bond' | 'Fund' | 'Cash'>('all');
  const [selectedTx, setSelectedTx] = useState<typeof dcaTransactions[0] | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<typeof dcaTransactions[0] | null>(null);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return dcaTransactions;
    return dcaTransactions.filter((tx) => tx.type === filterType);
  }, [filterType]);

  const stats = useMemo(() => {
    return {
      totalInvested: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalUnits: filteredTransactions.reduce((sum, tx) => sum + tx.units, 0),
      avgPrice: filteredTransactions.length > 0
        ? filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) / filteredTransactions.reduce((sum, tx) => sum + tx.units, 0)
        : 0,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const typeOptions = [
    { label: 'ทั้งหมด', value: 'all' as const },
    { label: 'หุ้นเติบโต', value: 'Growth' as const },
    { label: 'หุ้นปั่นผล', value: 'Dividend' as const },
    { label: 'พันธบัตร', value: 'Bond' as const },
    { label: 'กองทุน', value: 'Fund' as const },
    { label: 'เงินสด', value: 'Cash' as const },
  ];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="รวมเงินลงทุน" value={showTHB(stats.totalInvested)} note={`${stats.transactionCount} รายการ`} icon={Wallet} tone="green" />
        <StatCard label="รวมหน่วย" value={stats.totalUnits.toFixed(2)} note="หน่วยที่ได้" icon={Coins} tone="blue" />
        <StatCard label="ราคาเฉลี่ย" value={showTHB(stats.avgPrice)} note="ต่อหน่วย" icon={Target} tone="purple" />
        <StatCard label="จำนวนรายการ" value={stats.transactionCount.toString()} note="ทั้งสิ้น" icon={BarChart2} tone="orange" />
      </div>

      {/* Filter */}
      <Panel>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600">ประเภท:</span>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => setFilterType(opt.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                  filterType === opt.value
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Table */}
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400">
                <th className="pb-2">วันที่</th>
                <th className="pb-2">ชื่อสินทรัพย์</th>
                <th className="pb-2">ประเภท</th>
                <th className="pb-2">ภาคส่วน</th>
                <th className="pb-2">ราคา</th>
                <th className="pb-2">หน่วย</th>
                <th className="pb-2">มูลค่า</th>
                <th className="pb-2">เหตุผล</th>
                <th className="pb-2 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTransactions.map((tx, idx) => (
                  <motion.tr
                    key={`${tx.date}-${tx.ticker}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-50 transition hover:bg-purple-50/20 group cursor-pointer"
                  >
                    <td className="py-2.5 font-bold text-slate-800">{tx.date}</td>
                    <td className="py-2.5">
                      <div>
                        <div className="font-bold text-slate-900">{tx.asset}</div>
                        <div className="text-[10px] text-slate-500">{tx.ticker}</div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold ${
                        tx.type === 'Growth' ? 'bg-blue-100 text-blue-700' :
                        tx.type === 'Dividend' ? 'bg-emerald-100 text-emerald-700' :
                        tx.type === 'Bond' ? 'bg-orange-100 text-orange-700' :
                        tx.type === 'Fund' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-600">{tx.sector}</td>
                    <td className="py-2.5 font-bold text-slate-900">฿{tx.price.toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-slate-900">{tx.units.toFixed(2)}</td>
                    <td className="py-2.5 font-bold text-emerald-600">฿{tx.amount.toLocaleString()}</td>
                    <td className="py-2.5 text-slate-600 text-[10px]">{tx.reason.substring(0, 30)}...</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedTx(tx);
                            setEditForm(tx);
                            setShowEditModal(true);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                          title="แก้ไข"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => showToast(`ลบ "${tx.asset}" จากประวัติ DCA`)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                          title="ลบ"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-6">
          <SectionTitle title="การวิเคราะห์ DCA" subtitle="สถิติและแนวโน้ม" />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-600" />
                <span className="text-sm text-slate-600">ประเภทที่ลงทุนมากที่สุด</span>
              </div>
              <span className="font-bold text-slate-900">Growth (หุ้นเติบโต)</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-blue-600" />
                <span className="text-sm text-slate-600">เดือนที่ลงทุนมากที่สุด</span>
              </div>
              <span className="font-bold text-slate-900">June 2026</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-purple-600" />
                <span className="text-sm text-slate-600">การปฏิบัติตามแผน</span>
              </div>
              <span className="font-bold text-emerald-600">100%</span>
            </div>
          </div>
        </Panel>

        <Panel className="xl:col-span-6">
          <SectionTitle title="ข้อแนะนำ" subtitle="เพื่อปรับปรุงกลยุทธ์ DCA" />
          <div className="space-y-2">
            {['ลงทุนต่อเนื่องตามแผนเพื่อลดความเสี่ยงจากความผันผวน', 'พิจารณาเพิ่มสัดส่วนหุ้นปั่นผลเพื่อรายได้ประจำ', 'รักษาสมดุลระหว่างเติบโตและเสถียรภาพ'].map((item) => (
              <div key={item} className="flex gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-[11px] text-emerald-800">
                <Check size={14} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Edit/Delete Modal - Extra Large */}
      <AnimatePresence>
        {showEditModal && editForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="h-[95vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">แก้ไข DCA Transaction</h2>
                  <p className="text-sm text-slate-500">{editForm.asset} ({editForm.ticker})</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
                >
                  <X size={18} className="text-slate-600" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
                {/* Asset Image Upload */}
                <div className="flex items-start gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">รูปภาพสินทรัพย์</label>
                    <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 w-24 h-24 flex-shrink-0">
                      <img src={editForm.icon} alt={editForm.asset} className="w-20 h-20 object-contain" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">วิธีเพิ่มรูป</label>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
                        <BarChart2 size={14} />
                        ไฟล์
                      </button>
                      <button className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
                        <Globe size={14} />
                        URL
                      </button>
                      <button className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
                        <Clipboard size={14} />
                        Paste
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transaction Details - Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600">วันที่</label>
                    <div className="mt-1 text-sm font-bold text-slate-900">{editForm.date}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">ประเภท</label>
                    <div className="mt-1 text-sm font-bold text-slate-900">{editForm.type}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">ภาคส่วน</label>
                    <div className="mt-1 text-sm font-bold text-slate-900">{editForm.sector}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">ราคาซื้อ</label>
                    <div className="mt-1 text-sm font-bold text-slate-900">฿{editForm.price.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">จำนวนหน่วย</label>
                    <div className="mt-1 text-sm font-bold text-slate-900">{editForm.units.toFixed(2)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">มูลค่า</label>
                    <div className="mt-1 text-sm font-bold text-emerald-600">฿{editForm.amount.toLocaleString()}</div>
                  </div>
                </div>

                {/* Reason & Expected Return */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600">เหตุผลการลงทุน</label>
                    <div className="mt-1 p-3 rounded-lg bg-slate-50 text-sm text-slate-700">{editForm.reason}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600">คาดการณ์ผลตอบแทน</label>
                    <div className="mt-1 p-3 rounded-lg bg-slate-50 text-sm text-slate-700">{editForm.expectedReturn}</div>
                  </div>
                  {editForm.notes && (
                    <div>
                      <label className="text-xs font-bold text-slate-600">หมายเหตุ</label>
                      <div className="mt-1 p-3 rounded-lg bg-slate-50 text-sm text-slate-700">{editForm.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    showToast(`ลบ "${editForm.asset}" สำเร็จ`);
                    setShowEditModal(false);
                  }}
                  className="flex-1 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 font-bold text-rose-600 transition hover:bg-rose-100"
                >
                  ลบรายการนี้
                </button>
                <button
                  onClick={() => {
                    showToast(`บันทึกการแก้ไข "${editForm.asset}" สำเร็จ`);
                    setShowEditModal(false);
                  }}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-white transition hover:bg-emerald-600"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DividendTab({ showToast }: { showToast: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Dividend YTD" value={showUSD(4386.72)} note="+18.6% vs 2025 YTD" icon={Gift} tone="green" />
        <StatCard label="Forward Yield" value="3.72%" note="Weighted average" icon={Target} tone="green" />
        <StatCard label="Yield on Cost" value="5.48%" note="Total portfolio" icon={LineChartIcon} tone="purple" />
        <StatCard label="Next Payout" value={showUSD(126.45)} note="In 5 days" icon={CalendarDays} tone="orange" />
        <StatCard label="Annual Goal Progress" value="36.6%" note="$4,386.72 / $12,000" icon={Target} tone="green" progress={36.6} />
        <StatCard label="Dividend Growth" value="+14.2%" note="vs 2025" icon={TrendingUp} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionTitle title="Dividend Income Trend" subtitle="รายได้ปันผลรายเดือน" />
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dividendMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => showUSD(value)} />
                <Bar dataKey="income" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Dividend Calendar" subtitle="รายการปันผลที่กำลังจะเข้า" />
          <div className="space-y-2">
            {dividendCalendar.map((item) => {
              type BrandCfg = { svg: React.ElementType; bg: string } | { svg: null; bg: string; text: string; label: string };
              const divBrandMap: Record<string, BrandCfg> = {
                MSFT: { svg: Microsoft,        bg: '#f0f9ff' },
                KO:   { svg: CocaCola,         bg: '#fff1f2' },
                JPM:  { svg: null, bg: '#dbeafe', text: '#1d4ed8', label: 'JPM' },
                O:    { svg: null, bg: '#fdf4ff', text: '#7e22ce', label: 'O'   },
                PG:   { svg: ProcterAndGamble, bg: '#f0fdf4' },
              };
              const cfg = divBrandMap[item.ticker];
              return (
                <button key={item.ticker} onClick={() => showToast(`${item.ticker} payout detail opened`)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-left transition hover:bg-purple-50/30">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100" style={{ background: cfg?.bg ?? '#f1f5f9' }}>
                    {cfg && cfg.svg
                      ? <cfg.svg style={{ width: 18, height: 18 }} />
                      : <span className="text-[9px] font-extrabold" style={{ color: (cfg as { svg: null; text: string }).text }}>{(cfg as { svg: null; label: string }).label}</span>
                    }
                  </div>
                  <div className="min-w-0 flex-1"><div className="truncate text-[11px] font-extrabold text-slate-800">{item.asset}</div><div className="text-[10px] text-slate-500">{item.date}</div></div>
                  <div className="text-[11px] font-bold text-slate-900">{showUSD(item.amount)}</div>
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Dividend by Asset" subtitle="แหล่งรายได้ปันผล" />
          <DonutChart
            data={dividendByAsset}
            center={<div><div className="stat-num text-[18px] font-extrabold text-slate-900">$4,386.72</div><div className="text-[10px] font-bold text-slate-500">YTD</div></div>}
          />
        </Panel>
        <Panel className="xl:col-span-2">
          <SectionTitle title="Passive Income Goal" subtitle="เป้าหมายรายได้ประจำปี" />
          <div className="stat-num text-[30px] font-extrabold text-emerald-600">36.6%</div>
          <div className="mt-3"><Progress value={36.6} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <MiniMetric title="Monthly Target" value="$1,000" note="เป้าหมาย" tone="blue" />
            <MiniMetric title="Monthly Avg" value="$731.12" note="YTD" />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-6">
          <SectionTitle title="Top Dividend Holdings" subtitle="หุ้นและกองทุนที่สร้างเงินปันผลหลัก" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="text-[10px] uppercase text-slate-400"><tr><th className="pb-2">Asset</th><th className="pb-2">Ticker</th><th className="pb-2">Sector</th><th className="pb-2">Weight</th><th className="pb-2">Yield</th><th className="pb-2">YTD</th><th className="pb-2">YoY</th></tr></thead>
              <tbody>
                {dividendHoldings.map((item) => {
                  type HoldCfg = { svg: React.ElementType; bg: string } | { svg: null; bg: string; text: string; label: string };
                  const holdBrandMap: Record<string, HoldCfg> = {
                    MSFT: { svg: Microsoft,        bg: '#f0f9ff' },
                    KO:   { svg: CocaCola,         bg: '#fff1f2' },
                    JPM:  { svg: null, bg: '#dbeafe', text: '#1d4ed8', label: 'JPM' },
                    O:    { svg: null, bg: '#fdf4ff', text: '#7e22ce', label: 'O'   },
                    PG:   { svg: ProcterAndGamble, bg: '#f0fdf4' },
                  };
                  const cfg = holdBrandMap[item.ticker];
                  return (
                    <tr key={item.ticker} className="border-b border-slate-50 text-[11px] transition hover:bg-purple-50/20">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-100" style={{ background: cfg?.bg ?? '#f1f5f9' }}>
                            {cfg && cfg.svg
                              ? <cfg.svg style={{ width: 16, height: 16 }} />
                              : <span className="text-[8px] font-extrabold" style={{ color: (cfg as { svg: null; text: string }).text }}>{(cfg as { svg: null; label: string }).label}</span>
                            }
                          </div>
                          <span className="font-bold text-slate-900">{item.asset}</span>
                        </div>
                      </td>
                      <td className="py-2">{item.ticker}</td>
                      <td className="py-2">{item.sector}</td>
                      <td className="py-2">{item.weight}%</td>
                      <td className="py-2">{item.yield}%</td>
                      <td className="py-2">{showUSD(item.ytd)}</td>
                      <td className="py-2 font-bold text-emerald-600">+{item.yoy}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Dividend Growth (YoY)" subtitle="การเติบโตของรายได้ปันผล" />
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dividendGrowth}>
                <defs><linearGradient id="divGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.26} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} /></linearGradient></defs>
                <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number) => showUSD(value)} />
                <Area dataKey="income" type="monotone" stroke="#16a34a" fill="url(#divGrowth)" strokeWidth={2.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-right text-[13px] font-extrabold text-emerald-600">CAGR 15.3%</div>
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Dividend Insights" subtitle="ข้อสังเกตสำหรับรายได้ระยะยาว" />
          {['คุณมีอัตราเงินปันผลเฉลี่ยดี', 'กลุ่ม Consumer Staples สม่ำเสมอ', 'พิจารณาเพิ่ม REITs เพื่อกระแสเงินสด', 'มุ่งเน้น Dividend Growth อย่างต่อเนื่อง'].map((item) => (
            <div key={item} className="mb-2 flex gap-2 text-[12px] font-semibold text-slate-600"><CheckCircle2 size={15} className="text-emerald-500" />{item}</div>
          ))}
          <button onClick={() => showToast('Dividend added')} className="mt-3 h-9 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[11px] font-extrabold text-white">Add Dividend</button>
        </Panel>
      </div>
    </div>
  );
}

function GoldHedgeTab({ showToast }: { showToast: (message: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Gold Value" value={showTHB(83245.6)} note="+11,430 (+1.61%)" icon={Landmark} tone="gold" />
        <StatCard label="Gold Weight" value="9.24%" note="vs Target 10.00%" icon={Target} tone="gold" progress={92.4} />
        <StatCard label="Gold Gain (MTD)" value="+฿18,420" note="+6.01% vs last month" icon={TrendingUp} tone="green" />
        <StatCard label="Hedge Score" value="78/100" note="Good" icon={ShieldCheck} tone="blue" />
        <StatCard label="Gold DCA (YTD)" value="฿90,000" note="Avg. ฿15,000 / เดือน" icon={CalendarDays} tone="gold" />
        <StatCard label="Inflation Protection" value="High" note="Score 82 / 100" icon={ShieldCheck} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-4">
          <SectionTitle title="Gold Allocation Trend" subtitle="น้ำหนักทองเทียบเป้าหมาย" />
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goldTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line dataKey="weight" name="Gold Weight" type="monotone" stroke="#16a34a" strokeWidth={2.4} />
                <Line dataKey="target" name="Target" type="monotone" stroke="#10b981" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="Gold vs Portfolio Drawdown" subtitle="ทองช่วยลด drawdown พอร์ต" />
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goldTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line dataKey="portfolioDrawdown" name="Portfolio Drawdown" type="monotone" stroke="#ef4444" strokeWidth={2.1} />
                <Line dataKey="goldDrawdown" name="Gold Drawdown" type="monotone" stroke="#16a34a" strokeWidth={2.1} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="Hedge Mix" subtitle="สินทรัพย์ป้องกันความเสี่ยง" />
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_160px]">
            <DonutChart
              data={hedgeMix}
              center={<div><div className="text-[10px] font-bold text-slate-500">Hedge Mix</div><div className="stat-num text-[22px] font-extrabold text-slate-900">35.6%</div></div>}
            />
            <div className="space-y-2 text-[11px]">
              {hedgeMix.map((item) => <div key={item.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.name}</span><b>{item.value}%</b></div>)}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-6">
          <SectionTitle title="Gold Purchase Log" subtitle="ประวัติการซื้อทอง" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-[11px]">
              <thead className="text-[10px] uppercase text-slate-400"><tr><th className="pb-2">Date</th><th>Type</th><th>Product</th><th>Amount</th><th>Gold Price</th><th>Impact</th><th>Notes</th></tr></thead>
              <tbody>
                {goldPurchases.map((item) => (
                  <tr key={`${item.date}-${item.price}`} className="border-b border-slate-50">
                    <td className="py-2 font-bold">{item.date}</td><td><span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-600">{item.type}</span></td><td>{item.product}</td><td>{showTHB(item.amount)}</td><td>{THB.format(item.price)}</td><td className="font-bold text-emerald-600">+{item.impact}%</td><td>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="Target vs Current Hedge Allocation" subtitle="เปรียบเทียบสินทรัพย์กันชน" />
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetHedgeAllocation}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="current" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="xl:col-span-2">
          <SectionTitle title="Hedge Insights" subtitle="ข้อสังเกตสำคัญ" />
          {['ทองคำอยู่ในโซนปลายเป้าหมาย', 'กระจายสินทรัพย์กันชนได้ดี', 'รักษาสัดส่วนทองที่ 8-12%'].map((item) => <div key={item} className="mb-2 flex gap-2 text-[12px] font-semibold text-slate-600"><CheckCircle2 size={15} className="text-emerald-500" />{item}</div>)}
          <button onClick={() => showToast('Gold purchase form opened')} className="mt-3 h-9 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-400 text-[11px] font-extrabold text-white">Add Gold Purchase</button>
        </Panel>
      </div>
    </div>
  );
}

function PortfolioReviewTab({ showToast }: { showToast: (message: string) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => Object.fromEntries(reviewChecklist.map((item) => [item, true])));
  const completed = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Review Score" value="84/100" note="+6 pts จากเดือนที่แล้ว" icon={Target} tone="green" />
        <StatCard label="Rebalance Status" value="On Track" note="Threshold ±5%" icon={RefreshCw} tone="purple" />
        <StatCard label="DCA Completion" value="92%" note="9,200 / 10,000 THB" icon={CalendarDays} tone="green" progress={92} />
        <StatCard label="Dividend Goal" value="102%" note="6,120 / 6,000 THB" icon={Gift} tone="green" />
        <StatCard label="Risk Alignment" value="Good" note="Risk Score 4.2/10" icon={ShieldCheck} tone="blue" />
        <StatCard label="Next Review" value="15 Jun 2026" note="อีก 21 วัน" icon={CalendarDays} tone="orange" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-3">
          <SectionTitle title="Monthly Review Checklist" subtitle="รายการที่ควรเช็คทุกเดือน" />
          <div className="space-y-2">
            {reviewChecklist.map((item) => (
              <button key={item} onClick={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))} className="flex w-full items-center gap-2 text-left text-[12px] font-semibold text-slate-600">
                {checked[item] ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Circle size={16} className="text-slate-300" />}
                {item}
              </button>
            ))}
          </div>
          <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">ครบถ้วน {completed} / 5 รายการ</div>
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="Portfolio Drift Summary" subtitle="สรุป drift ต่อเป้าหมาย" />
          <div className="space-y-2">
            {allocationRows.slice(0, 5).map((item) => (
              <div key={item.assetClass} className="grid grid-cols-[1fr_48px_48px_48px] gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-[11px]">
                <span className="font-bold text-slate-800">{item.assetClass}</span><span>{item.target}%</span><span>{item.current}%</span><span className={item.drift > 0 ? 'text-emerald-600' : item.drift < 0 ? 'text-rose-500' : 'text-slate-500'}>{item.drift > 0 ? '+' : ''}{item.drift}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="xl:col-span-5">
          <SectionTitle title="Performance vs Goal" subtitle="ผลตอบแทนเทียบเป้าหมายสะสม" />
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reviewPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,92,191,0.08)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line dataKey="portfolio" name="Portfolio" type="monotone" stroke="#16a34a" strokeWidth={2.4} />
                <Line dataKey="goal" name="Goal" type="monotone" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.8} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-3">
          <SectionTitle title="Rule Compliance" subtitle="กรอบนโยบายการลงทุน" />
          {['สัดส่วนสินทรัพย์อยู่ในเกณฑ์ ±5%', 'เงินสดคงเหลือขั้นต่ำ 3%', 'ไม่เกิน 20% ในหุ้นรายตัว', 'DCA ตามแผนการลงทุน', 'ไม่ลงทุนในสินทรัพย์เสี่ยงเกินไป'].map((item) => <div key={item} className="mb-2 flex items-center justify-between text-[12px] font-semibold text-slate-600"><span>{item}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">ผ่าน</span></div>)}
        </Panel>
        <Panel className="xl:col-span-4">
          <SectionTitle title="Review Notes" subtitle="May 2026" />
          <ul className="space-y-2 text-[12px] leading-relaxed text-slate-600">
            <li>ตลาดหุ้นสหรัฐฟื้นตัวต่อเนื่องจากความชัดเจนเรื่องดอกเบี้ย.</li>
            <li>Bond Yield ลดลง ทำให้ราคาพันธบัตรปรับตัวดีขึ้น.</li>
            <li>สัดส่วนหุ้นไทยเกินเป้าหมายจากการปรับขึ้นของตลาด.</li>
            <li>เพิ่มเงินลงทุน DCA 1,000 THB ในเดือนถัดไป.</li>
          </ul>
          <button onClick={() => showToast('Review note editor opened')} className="mt-4 rounded-xl bg-emerald-50 px-4 py-2 text-[11px] font-extrabold text-emerald-700">Edit Note</button>
        </Panel>
        <Panel className="xl:col-span-2">
          <SectionTitle title="Top Concerns" subtitle="จุดที่ควรติดตาม" />
          {reviewConcerns.map((item) => <div key={item.title} className="mb-3 text-[12px]"><div className="flex gap-2 font-extrabold text-rose-500"><AlertTriangle size={15} />{item.title}</div><div className="mt-1 text-slate-500">{item.detail}</div></div>)}
        </Panel>
        <Panel className="xl:col-span-3">
          <SectionTitle title="Action Plan for Next Month" subtitle="สิ่งที่ต้องทำต่อ" />
          {nextMonthActionPlan.map((item, index) => <div key={item} className="mb-2 flex gap-2 text-[12px] font-semibold text-slate-600">{index < 3 ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Circle size={15} className="text-slate-400" />}{item}</div>)}
          <button onClick={() => showToast('Portfolio review saved')} className="mt-3 h-9 w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[11px] font-extrabold text-white">Save Review</button>
        </Panel>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState<InvestmentTab>('Overview');
  const [selectedMonth, setSelectedMonth] = useState<InvestmentMonthKey>('2026-05');
  const [currency, setCurrency] = useState<'THB' | 'USD'>('THB');
  const [risk, setRisk] = useState('Moderate');
  const [toast, setToast] = useState('');

  // Holdings local state — load from localStorage or use mock data
  const [holdings, setHoldings] = useState<HoldingItem[]>(() => {
    try {
      const saved = localStorage.getItem('investments-holdings');
      return saved ? JSON.parse(saved) : [...topHoldings];
    } catch {
      return [...topHoldings];
    }
  });

  // Save holdings to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('investments-holdings', JSON.stringify(holdings));
    } catch (err) {
      console.error('Failed to save holdings:', err);
      if (err instanceof Error && err.message.includes('QuotaExceededError')) {
        showToast('⚠️ Storage penuh — ลองลบ icon บ้างเพื่อเพิ่มพื้นที่');
      }
    }
  }, [holdings]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<HoldingItem | null>(null);
  const [rebalanceModalOpen, setRebalanceModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  ACTIVE_CURRENCY = currency;

  // Month-aware derived data
  const selectedMonthMeta = useMemo(() => {
    if (selectedMonth === 'all-months') {
      return { key: 'all-months', label: 'All Months (Jan-May)', short: '' };
    }
    return investmentMonths.find((m) => m.key === selectedMonth) ?? investmentMonths[investmentMonths.length - 1];
  }, [selectedMonth]);

  const filteredGrowth = useMemo(() => {
    if (selectedMonth === 'all-months') {
      return portfolioGrowth; // Show all months
    }
    const idx = portfolioGrowth.findIndex((item) => item.month === selectedMonthMeta.short);
    return idx >= 0 ? portfolioGrowth.slice(0, idx + 1) : portfolioGrowth;
  }, [selectedMonth, selectedMonthMeta]);
  const monthSnapshot = useMemo(() => filteredGrowth[filteredGrowth.length - 1] ?? portfolioGrowth[portfolioGrowth.length - 1], [filteredGrowth]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  function handleAddHolding(item: HoldingItem) {
    setHoldings((prev) => [...prev, item]);
    showToast(`เพิ่ม ${item.asset} แล้ว`);
  }

  function handleEditHolding(updated: HoldingItem) {
    setHoldings((prev) => prev.map((h) => (h.asset === editingHolding?.asset ? updated : h)));
    showToast(`อัปเดต ${updated.asset} แล้ว`);
    setEditingHolding(null);
  }

  function handleDeleteHolding(asset: string) {
    setHoldings((prev) => prev.filter((h) => h.asset !== asset));
    showToast(`ลบ ${asset} แล้ว`);
  }

  const primaryLabel =
    activeTab === 'Asset Allocation' ? 'Rebalance Plan'
    : activeTab === 'DCA Planner' ? 'Add DCA Plan'
    : activeTab === 'Dividend Income' ? 'Add Dividend'
    : activeTab === 'Gold & Hedge' ? 'Add Gold Purchase'
    : activeTab === 'Portfolio Review' ? 'Add Review Note'
    : 'Add Investment';

  function handlePrimary() {
    if (activeTab === 'Overview') {
      setAddModalOpen(true);
    } else {
      showToast(`${activeTab} action opened`);
    }
  }

  return (
    <div className="investment-premium min-w-0" style={{ fontFamily: 'var(--font-sans)' }}>
      <TopBar title="Investments" subtitle="วางแผนพอร์ต DCA เงินปันผล และการป้องกันความเสี่ยงให้เป็นระบบ" />

      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm">
        <div className="flex min-w-max items-center gap-2">
          {investmentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-10 rounded-xl px-4 text-[12px] font-extrabold transition ${
                activeTab === tab
                  ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)]'
                  : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>


      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {activeTab === 'Overview' && (
          <OverviewTab
            showToast={showToast}
            risk={risk}
            holdings={holdings}
            onEditHolding={setEditingHolding}
            onDeleteHolding={handleDeleteHolding}
            filteredGrowth={filteredGrowth}
            monthSnapshot={monthSnapshot}
            monthLabel={selectedMonth === 'all-months' ? 'All Months (Jan-May)' : selectedMonthMeta.label}
            onShowRebalance={() => setRebalanceModalOpen(true)}
            onShowGuide={() => setGuideModalOpen(true)}
            month={selectedMonth}
            setMonth={setSelectedMonth}
            currency={currency}
            setCurrency={setCurrency}
            setRisk={setRisk}
            onReset={() => { setCurrency('THB'); setRisk('Moderate'); setSelectedMonth('2026-05'); showToast('Investment filters reset'); }}
            onAddInvestment={() => setAddModalOpen(true)}
          />
        )}
        {activeTab === 'Asset Allocation' && <AllocationTab showToast={showToast} />}
        {activeTab === 'DCA Planner' && <DcaPlannerTab showToast={showToast} />}
        {activeTab === 'DCA Journal' && <DCAJournalTab showToast={showToast} />}
        {activeTab === 'Dividend Income' && <DividendTab showToast={showToast} />}
        {activeTab === 'Gold & Hedge' && <GoldHedgeTab showToast={showToast} />}
        {activeTab === 'Portfolio Review' && <PortfolioReviewTab showToast={showToast} />}
      </motion.div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-purple-200 bg-white px-4 py-2 text-[12px] font-extrabold text-purple-700 shadow-[0_18px_44px_rgba(45,35,95,0.16)]">
          {toast}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {addModalOpen && (
          <InvestmentFormModal
            onClose={() => setAddModalOpen(false)}
            onSave={handleAddHolding}
          />
        )}
        {editingHolding && (
          <InvestmentFormModal
            initial={editingHolding}
            onClose={() => setEditingHolding(null)}
            onSave={handleEditHolding}
          />
        )}
        {rebalanceModalOpen && (
          <RebalanceDetailModal
            onClose={() => setRebalanceModalOpen(false)}
            showToast={showToast}
          />
        )}
        {guideModalOpen && (
          <InvestmentGuideModal onClose={() => setGuideModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
