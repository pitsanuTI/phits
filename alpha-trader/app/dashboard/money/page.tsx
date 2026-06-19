'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '@/components/TopBar';
import {
  Bar, BarChart, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  AlertCircle, BookOpen, CalendarClock, Car, CheckCircle2,
  CreditCard, Droplets, Home, Monitor, Palette, Pencil, Phone, PiggyBank,
  Plane, PlusCircle, ReceiptText, RefreshCw, Shield, Target, FileText, Link2, PenLine,
  Trash2, TrendingUp, Upload, Wallet, X, Zap,
} from 'lucide-react';
// @thesvg/react removed — using Clearbit CDN image logos instead (reliable, no render issues)
import {
  MonthKey, expenseBreakdown, moneyTransactions,
  monthOptions, monthlyCashFlowSeries,
} from '@/data/life-dashboard-mock';
import { useLifeStats, selectMonth } from '@/lib/lifeStats/store';
import { useEscClose } from '@/lib/useEscClose';

type SelMonth = MonthKey | 'all';
import StatCard from '@/components/StatCard';

// â"€â"€â"€ Types â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

type SubscriptionStatus = 'Active' | 'Paused' | 'Trial';
type BillStatus = 'Paid' | 'Due Soon' | 'Overdue' | 'Scheduled';
type CardNetwork = 'Visa' | 'Mastercard' | 'AMEX' | 'UnionPay';

interface CreditCardEntry {
  id: string; name: string; bank: string; network: CardNetwork;
  last4: string; balance: number; limit: number;
  dueDate: string; minPayment: number; gradient: string;
}

interface Subscription {
  id: string; name: string; category: string;
  price: number; cycle: 'Monthly' | 'Yearly';
  renewalDate: string; status: SubscriptionStatus; brand: string;
}
interface Bill {
  id: string; name: string; amount: number;
  dueDate: string; category: string;
  status: BillStatus; autoPay: boolean;
  iconImgUrl?: string;
}
interface Transaction {
  id: string; date: string; title: string;
  type: 'Income' | 'Expense' | 'Transfer';
  amount: number; category: string; status: string;
}
interface SavingsGoal {
  id: string; goal: string; current: number;
  target: number; due: string; color: string;
  lucideIcon: string; iconImgUrl?: string;
}

// â"€â"€â"€ Thai Bank Config â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const THAI_BANKS: Record<string, { label: string; short: string; gradient: string; accent: string }> = {
  kbank:      { label: 'KBank',        short: 'KBank',       gradient: 'from-green-600 to-emerald-700',    accent: '#16a34a' },
  scb:        { label: 'SCB',          short: 'SCB',         gradient: 'from-violet-600 to-purple-800',    accent: '#7c3aed' },
  krungthai:  { label: 'Krungthai',    short: 'Krungthai',   gradient: 'from-sky-500 to-blue-700',         accent: '#0284c7' },
  bbl:        { label: 'Bangkok Bank', short: 'BBL',         gradient: 'from-blue-800 to-indigo-900',      accent: '#1e40af' },
  gsb:        { label: 'GSB',          short: 'GSB',         gradient: 'from-pink-500 to-rose-500',        accent: '#ec4899' },
  ktc:        { label: 'KTC',          short: 'KTC',         gradient: 'from-blue-500 to-cyan-600',        accent: '#0369a1' },
  krungsri:   { label: 'Krungsri',     short: 'Krungsri',    gradient: 'from-yellow-400 to-amber-500',     accent: '#d97706' },
  uob:        { label: 'UOB',          short: 'UOB',         gradient: 'from-red-600 to-rose-700',         accent: '#dc2626' },
  ttb:        { label: 'ttb',          short: 'ttb',         gradient: 'from-teal-500 to-cyan-700',        accent: '#0d9488' },
  citi:       { label: 'Citi',         short: 'Citi',        gradient: 'from-slate-500 to-slate-700',      accent: '#64748b' },
};

const BANK_KEYS = Object.keys(THAI_BANKS);

// ─── Brand Logo Registry (Clearbit CDN — real brand logos, no SVG rendering issues) ──

// cdn: 'si'  = cdn.simpleicons.org/{slug}/ffffff  (white SVG, confirmed working)
// cdn: 'jsd' = cdn.jsdelivr.net/npm/simple-icons/icons/{slug}.svg + CSS invert filter
// cdn: 'cb'  = logo.clearbit.com/{slug}  (PNG, for brands not in Simple Icons)
type IconCdn = 'si' | 'jsd' | 'cb';
interface BrandEntry { label: string; bg: string; slug: string; cdn?: IconCdn; }

const BRANDS: Record<string, BrandEntry> = {
  // ✅ cdn.simpleicons.org — white SVG, confirmed 200
  netflix:      { label: 'Netflix',        bg: '#E50914', slug: 'netflix'         },
  youtube:      { label: 'YouTube',        bg: '#FF0000', slug: 'youtube'         },
  spotify:      { label: 'Spotify',        bg: '#1DB954', slug: 'spotify'         },
  tradingview:  { label: 'TradingView',    bg: '#2962FF', slug: 'tradingview'     },
  github:       { label: 'GitHub',         bg: '#24292E', slug: 'github'          },
  notion:       { label: 'Notion',         bg: '#000000', slug: 'notion'          },
  claude:       { label: 'Claude AI',      bg: '#D97706', slug: 'anthropic'       },
  dropbox:      { label: 'Dropbox',        bg: '#0061FF', slug: 'dropbox'         },
  facebook:     { label: 'Facebook',       bg: '#1877F2', slug: 'facebook'        },
  instagram:    { label: 'Instagram',      bg: '#C13584', slug: 'instagram'       },
  twitter:      { label: 'X / Twitter',    bg: '#000000', slug: 'x'               },
  linkedin:     { label: 'LinkedIn',       bg: '#0A66C2', slug: 'linkedin',       cdn: 'jsd' },
  tiktok:       { label: 'TikTok',         bg: '#010101', slug: 'tiktok'          },
  apple:        { label: 'Apple',          bg: '#000000', slug: 'apple'           },
  figma:        { label: 'Figma',          bg: '#F24E1E', slug: 'figma'           },
  zoom:         { label: 'Zoom',           bg: '#2D8CFF', slug: 'zoom'            },
  line:         { label: 'LINE',           bg: '#06C755', slug: 'line'            },
  google:       { label: 'Google One',     bg: '#4285F4', slug: 'google'          },
  discord:      { label: 'Discord',        bg: '#5865F2', slug: 'discord'         },
  twitch:       { label: 'Twitch',         bg: '#9146FF', slug: 'twitch'          },
  medium:       { label: 'Medium',         bg: '#000000', slug: 'medium'          },
  youtube_music:{ label: 'YT Music',       bg: '#FF0000', slug: 'youtubemusic'    },
  google_drive: { label: 'Google Drive',   bg: '#1A73E8', slug: 'googledrive'     },
  icloud:       { label: 'iCloud+',        bg: '#3693F3', slug: 'icloud'          },
  duolingo:     { label: 'Duolingo',       bg: '#58CC02', slug: 'duolingo'        },
  grammarly:    { label: 'Grammarly',      bg: '#15C39A', slug: 'grammarly'       },
  lastpass:     { label: 'LastPass',       bg: '#D32D27', slug: 'lastpass'        },
  nordvpn:      { label: 'NordVPN',        bg: '#4687FF', slug: 'nordvpn'         },
  evernote:     { label: 'Evernote',       bg: '#00A82D', slug: 'evernote'        },
  headspace:    { label: 'Headspace',      bg: '#FF6F61', slug: 'headspace'       },

  // ✅ jsdelivr — SVG exists, apply CSS invert filter to make white
  chatgpt:      { label: 'ChatGPT',        bg: '#10A37F', slug: 'openai',         cdn: 'jsd' },
  adobe:        { label: 'Adobe Creative', bg: '#FF0000', slug: 'adobe',          cdn: 'jsd' },
  amazon:       { label: 'Amazon',         bg: '#FF9900', slug: 'amazon',         cdn: 'jsd' },
  slack:        { label: 'Slack',          bg: '#4A154B', slug: 'slack',          cdn: 'jsd' },
  canva:        { label: 'Canva',          bg: '#00C4CC', slug: 'canva',          cdn: 'jsd' },
  microsoft:    { label: 'Microsoft 365',  bg: '#0078D4', slug: 'microsoftoffice',cdn: 'jsd' },

  // ✅ Clearbit PNG — not in Simple Icons at all
  disney:       { label: 'Disney+',        bg: '#113CCF', slug: 'disneyplus.com', cdn: 'cb'  },
};

function brandLogoUrl(entry: BrandEntry): string {
  const cdn = entry.cdn ?? 'si';
  if (cdn === 'jsd') return `https://cdn.jsdelivr.net/npm/simple-icons/icons/${entry.slug}.svg`;
  if (cdn === 'cb')  return `https://logo.clearbit.com/${entry.slug}`;
  return `https://cdn.simpleicons.org/${entry.slug}/ffffff`;
}

// Custom brand registry — supports text, image URL, or file dataURL
const customBrands: Record<string, {
  bg: string; textColor: string; text: string; label: string; imgUrl?: string;
}> = {};

function BrandIcon({ brand, size = 36 }: { brand: string; size?: number }) {
  const entry = BRANDS[brand];
  if (entry) {
    const pad = Math.round(size * 0.14);
    const isJsd = (entry.cdn ?? 'si') === 'jsd';
    const isCb  = (entry.cdn ?? 'si') === 'cb';
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-xl overflow-hidden"
        style={{ width: size, height: size, background: entry.bg, padding: isCb ? 0 : pad }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brandLogoUrl(entry)}
          alt={entry.label}
          width={isCb ? size : size - pad * 2}
          height={isCb ? size : size - pad * 2}
          className="object-contain"
          // jsd SVGs use brand colour — invert to white so they show on coloured bg
          style={isJsd ? { filter: 'brightness(0) invert(1)' } : undefined}
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            if (el.parentElement) {
              el.parentElement.style.fontSize = Math.round(size * 0.44) + 'px';
              el.parentElement.style.fontWeight = '800';
              el.parentElement.style.color = '#fff';
              el.parentElement.textContent = entry.label[0];
            }
          }}
        />
      </div>
    );
  }
  const custom = customBrands[brand];
  if (custom) {
    if (custom.imgUrl) {
      return (
        <div className="flex shrink-0 items-center justify-center rounded-xl overflow-hidden border border-slate-100"
          style={{ width: size, height: size, background: custom.bg }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={custom.imgUrl} alt={custom.label} width={size} height={size} className="object-contain" />
        </div>
      );
    }
    return (
      <div className="flex shrink-0 items-center justify-center rounded-xl font-extrabold text-[13px]"
        style={{ width: size, height: size, background: custom.bg, color: custom.textColor }}>
        {custom.text}
      </div>
    );
  }
  return (
    <div className="flex shrink-0 items-center justify-center rounded-xl bg-purple-100 font-extrabold text-[13px] text-purple-600"
      style={{ width: size, height: size }}>
      {brand.slice(0, 1).toUpperCase()}
    </div>
  );
}

// â"€â"€â"€ Goal Icon Map (Lucide) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const LUCIDE_GOAL_ICONS: Record<string, React.ReactNode> = {
  shield:   <Shield size={18} className="text-emerald-600" />,
  plane:    <Plane size={18} className="text-blue-500" />,
  book:     <BookOpen size={18} className="text-purple-500" />,
  trending: <TrendingUp size={18} className="text-orange-500" />,
  monitor:  <Monitor size={18} className="text-slate-600" />,
  home:     <Home size={18} className="text-teal-500" />,
  car:      <Car size={18} className="text-rose-500" />,
  target:   <Target size={18} className="text-indigo-500" />,
  piggy:    <PiggyBank size={18} className="text-pink-500" />,
  zap:      <Zap size={18} className="text-amber-500" />,
};

const GOAL_ICON_KEYS = Object.keys(LUCIDE_GOAL_ICONS);

function GoalIcon({ lucideIcon, iconImgUrl }: { lucideIcon: string; iconImgUrl?: string }) {
  if (iconImgUrl) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconImgUrl} alt={lucideIcon} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm">
      {LUCIDE_GOAL_ICONS[lucideIcon] ?? <Target size={18} className="text-purple-500" />}
    </div>
  );
}

// â"€â"€â"€ Bill Category Icons (Lucide) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const BILL_CAT_ICONS: Record<string, React.ReactNode> = {
  Telecom:   <Phone size={15} className="text-blue-600" />,
  Utilities: <Zap size={15} className="text-amber-500" />,
  Housing:   <Home size={15} className="text-teal-600" />,
  Insurance: <Shield size={15} className="text-purple-600" />,
  Transport: <Car size={15} className="text-rose-500" />,
  Other:     <ReceiptText size={15} className="text-slate-500" />,
};

function BillCatIcon({ category, iconImgUrl }: { category: string; iconImgUrl?: string }) {
  if (iconImgUrl) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconImgUrl} alt={category} className="h-full w-full object-contain" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
      {BILL_CAT_ICONS[category] ?? <ReceiptText size={15} className="text-slate-500" />}
    </div>
  );
}

// â"€â"€â"€ Status Badges â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function SubBadge({ status }: { status: SubscriptionStatus }) {
  const m: Record<SubscriptionStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Paused: 'bg-slate-100 text-slate-500',
    Trial:  'bg-amber-100 text-amber-700',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m[status]}`}>{status}</span>;
}

function BillBadge({ status }: { status: BillStatus }) {
  const m: Record<BillStatus, string> = {
    Paid:       'bg-emerald-100 text-emerald-700',
    'Due Soon': 'bg-amber-100 text-amber-700',
    Overdue:    'bg-rose-100 text-rose-600',
    Scheduled:  'bg-sky-100 text-sky-600',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m[status]}`}>{status}</span>;
}

// ─── Shared Custom Icon Upload Panel ─────────────────────────────────────────
// Used by Add Bill and Add Goal to let users add a custom icon via URL or file.

function CustomIconUpload({
  iconImgUrl, setIconImgUrl,
}: {
  iconImgUrl: string;
  setIconImgUrl: (v: string) => void;
}) {
  const [mode, setMode] = useState<'url' | 'file'>('url');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setIconImgUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Custom Icon (optional)</p>
        {iconImgUrl && (
          <button onClick={() => setIconImgUrl('')} className="text-[10px] text-rose-400 hover:text-rose-600 font-semibold">Clear</button>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden text-[11px] font-bold">
        {(['url', 'file'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 transition inline-flex items-center justify-center gap-1.5 ${mode === m ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-white'}`}>
            {m === 'url' ? <Link2 size={12} /> : <Upload size={12} />}
            {m === 'url' ? 'URL Link' : 'Upload File'}
          </button>
        ))}
      </div>

      {mode === 'url' && (
        <div className="space-y-2">
          <input
            value={iconImgUrl}
            onChange={e => setIconImgUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition bg-white"
          />
        </div>
      )}

      {mode === 'file' && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 hover:border-purple-400 transition">
          <Upload size={16} className="text-purple-500 shrink-0" />
          <span className="text-[12px] text-slate-500">Click to upload PNG / SVG / JPG</span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      )}

      {iconImgUrl && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconImgUrl} alt="preview" className="h-full w-full object-contain" />
          </div>
          <span className="text-[12px] font-semibold text-emerald-700">Icon preview looks good!</span>
        </div>
      )}
    </div>
  );
}

// ─── Modal Shell (Extra Large) ────────────────────────────────────────────────

function Modal({ title, onClose, children, wide = false }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  useEscClose(onClose);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 flex flex-col w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} max-h-[90vh] rounded-3xl border border-purple-100 bg-white shadow-2xl`}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-7 py-5">
          <h2 className="text-[17px] font-extrabold text-slate-900">{title}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 transition">
            <X size={17} className="text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-5">{children}</div>
      </div>
    </div>
  );
}

function FormInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</label>
      <input {...props} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition" />
    </div>
  );
}

function FormSelect({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</label>
      <select {...props} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] text-slate-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition">
        {children}
      </select>
    </div>
  );
}

// â"€â"€â"€ Icon Picker Panel (SVG brand logos) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function IconPickerPanel({
  selected, onSelect, showCustom = true,
}: {
  selected: string;
  onSelect: (brand: string) => void;
  showCustom?: boolean;
}) {
  const [search, setSearch] = useState('');
  const filtered = Object.entries(BRANDS).filter(([, v]) =>
    v.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search brand (Netflix, Slack, LINE...)"
        className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-[12px] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
      />
      <div className="grid grid-cols-5 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 max-h-[260px] overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
        {filtered.map(([key, v]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            title={v.label}
            className={`group flex flex-col items-center gap-1 rounded-xl p-1.5 transition ${selected === key ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-slate-100'}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden"
              style={{ background: v.bg, padding: 4 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brandLogoUrl(v)} alt={v.label}
                width={28} height={28} className="object-contain"
                style={(v.cdn ?? 'si') === 'jsd' ? { filter: 'brightness(0) invert(1)' } : undefined}
                onError={e => { (e.currentTarget.parentElement as HTMLElement).textContent = v.label[0]; }}
              />
            </div>
            <span className="text-[9px] text-slate-500 leading-none truncate w-full text-center">{v.label.split(' ')[0]}</span>
          </button>
        ))}
        {showCustom && (
          <button
            onClick={() => onSelect('_custom')}
            title="Custom"
            className={`flex flex-col items-center gap-1 rounded-xl p-2 transition hover:bg-white hover:shadow-sm ${selected === '_custom' ? 'bg-white shadow-md ring-2 ring-purple-500' : ''}`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 border border-purple-200">
              <Palette size={18} className="text-purple-600" />
            </div>
            <span className="text-[9px] text-slate-500 leading-none">Custom</span>
          </button>
        )}
      </div>
      {selected && BRANDS[selected] && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
          <BrandIcon brand={selected} size={28} />
          <span className="text-[12px] font-semibold text-emerald-700">{BRANDS[selected].label} selected</span>
        </div>
      )}
    </div>
  );
}

// â"€â"€â"€ Icon Library Modal (browse all SVG logos) â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function IconLibraryModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const filtered = Object.entries(BRANDS).filter(([, v]) =>
    v.label.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Modal title="Brand Icon Library" onClose={onClose} wide>
      <p className="mb-4 text-[12px] text-slate-400">Real brand logos via Clearbit CDN -- เลือก icon ที่ตรงกับ service เมื่อเพิ่ม Subscription ใหม่</p>
      <input
        value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search brand..."
        className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[13px] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
      />
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {filtered.map(([key, v]) => (
          <div key={key} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden"
              style={{ background: v.bg, padding: 8 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brandLogoUrl(v)} alt={v.label} width={40} height={40} className="object-contain"
                style={(v.cdn ?? 'si') === 'jsd' ? { filter: 'brightness(0) invert(1)' } : undefined}
                onError={e => { (e.currentTarget.parentElement as HTMLElement).textContent = v.label[0]; }} />
            </div>
            <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{v.label}</span>
            <code className="text-[8px] text-slate-400 bg-slate-100 rounded px-1">{key}</code>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Add Subscription Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function AddSubModal({ onAdd, onClose, initialBrand = '' }: {
  onAdd: (s: Subscription) => void; onClose: () => void; initialBrand?: string;
}) {
  const [name, setName]       = useState('');
  const [category, setCat]    = useState('Entertainment');
  const [price, setPrice]     = useState('');
  const [cycle, setCycle]     = useState<'Monthly' | 'Yearly'>('Monthly');
  const [renewal, setRenewal] = useState('2026-07-01');
  const [status, setStatus]   = useState<SubscriptionStatus>('Active');
  const [brand, setBrand]     = useState(initialBrand);
  const [customText, setCustomText]   = useState('');
  const [customBg, setCustomBg]       = useState('#7c5cbf');
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [customImgMode, setCustomImgMode] = useState<'text' | 'url' | 'file'>('text');

  const resolvedBrand = brand === '_custom'
    ? (name ? `_c_${name.slice(0, 4).toLowerCase()}` : '_custom')
    : brand;

  const handleAdd = () => {
    if (!name || !price || !brand) return;
    if (brand === '_custom') {
      const key = resolvedBrand;
      customBrands[key] = {
        bg: customBg, textColor: '#fff',
        text: customText || name.slice(0, 2).toUpperCase(),
        label: name,
        imgUrl: customImgMode !== 'text' ? customImgUrl : undefined,
      };
    }
    onAdd({ id: `sub-${Date.now()}`, name, category, price: parseFloat(price) || 0, cycle, renewalDate: renewal, status, brand: resolvedBrand });
    onClose();
  };

  return (
    <Modal title="Add Subscription" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormInput label="Service Name" placeholder="e.g. Disney+" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <FormInput label="Price" type="number" placeholder="9.99" value={price} onChange={e => setPrice(e.target.value)} />
          <FormSelect label="Billing Cycle" value={cycle} onChange={e => setCycle(e.target.value as 'Monthly' | 'Yearly')}>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </FormSelect>
          <FormSelect label="Category" value={category} onChange={e => setCat(e.target.value)}>
            {['Entertainment','Music','AI Tools','Trading','Design','Dev Tools','Productivity','Storage','Social','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </FormSelect>
          <FormSelect label="Status" value={status} onChange={e => setStatus(e.target.value as SubscriptionStatus)}>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Paused">Paused</option>
          </FormSelect>
          <div className="col-span-2">
            <FormInput label="Next Renewal Date" type="date" value={renewal} onChange={e => setRenewal(e.target.value)} />
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Brand Icon (SVG)</label>
          <IconPickerPanel selected={brand} onSelect={setBrand} />
          {brand === '_custom' && (
            <div className="mt-3 space-y-3">
              {/* Mode toggle */}
              <div className="flex rounded-xl border border-slate-200 overflow-hidden text-[11px] font-bold">
                {(['text','url','file'] as const).map(m => (
                  <button key={m} onClick={() => setCustomImgMode(m)}
                    className={`flex-1 py-2 transition capitalize inline-flex items-center justify-center gap-1.5 ${customImgMode === m ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                    {m === 'text' ? <PenLine size={13} /> : m === 'url' ? <Link2 size={13} /> : <FileText size={13} />}
                    {m === 'text' ? 'Text' : m === 'url' ? 'URL' : 'File'}
                  </button>
                ))}
              </div>

              {customImgMode === 'text' && (
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Icon Text (1-2 chars)" placeholder="FB" maxLength={2} value={customText} onChange={e => setCustomText(e.target.value)} />
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Background Color</label>
                    <input type="color" value={customBg} onChange={e => setCustomBg(e.target.value)} className="h-[42px] w-full cursor-pointer rounded-xl border border-slate-200" />
                  </div>
                </div>
              )}

              {customImgMode === 'url' && (
                <div className="space-y-2">
                  <FormInput label="Image URL (PNG, SVG, JPG)" placeholder="https://example.com/logo.png"
                    value={customImgUrl} onChange={e => setCustomImgUrl(e.target.value)} />
                  {customImgUrl && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customImgUrl} alt="preview" className="h-8 w-8 object-contain" onError={e => (e.currentTarget.style.display='none')} />
                      </div>
                      <span className="text-[11px] text-slate-500">Preview</span>
                    </div>
                  )}
                </div>
              )}

              {customImgMode === 'file' && (
                <div className="space-y-2">
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Upload Image</label>
                  <input type="file" accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setCustomImgUrl(ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-1 file:text-[11px] file:font-bold file:text-purple-700" />
                  {customImgUrl && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customImgUrl} alt="preview" className="h-8 w-8 object-contain" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold"><CheckCircle2 size={12} /> Image loaded</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleAdd} disabled={!name || !price || !brand}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[13px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition">
            Add Subscription
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Edit Subscription Modal (full edit: all fields + icon) ──────────────────

function EditSubModal({ sub, onSave, onClose }: {
  sub: Subscription;
  onSave: (updated: Subscription) => void;
  onClose: () => void;
}) {
  const [name, setName]       = useState(sub.name);
  const [category, setCat]    = useState(sub.category);
  const [price, setPrice]     = useState(String(sub.price));
  const [cycle, setCycle]     = useState<'Monthly' | 'Yearly'>(sub.cycle);
  const [renewal, setRenewal] = useState(sub.renewalDate);
  const [status, setStatus]   = useState<SubscriptionStatus>(sub.status);
  const [brand, setBrand]     = useState(sub.brand);
  const [customText, setCustomText]     = useState('');
  const [customBg, setCustomBg]         = useState('#7c5cbf');
  const [customImgUrl, setCustomImgUrl] = useState('');
  const [customImgMode, setCustomImgMode] = useState<'text' | 'url' | 'file'>('text');

  const resolvedBrand = brand === '_custom'
    ? (name ? `_c_${name.slice(0,4).toLowerCase()}` : '_custom')
    : brand;

  const handleSave = () => {
    if (!name || !price) return;
    if (brand === '_custom') {
      const key = resolvedBrand;
      customBrands[key] = {
        bg: customBg, textColor: '#fff',
        text: customText || name.slice(0,2).toUpperCase(),
        label: name,
        imgUrl: customImgMode !== 'text' ? customImgUrl : undefined,
      };
    }
    onSave({ ...sub, name, category, price: parseFloat(price)||0, cycle, renewalDate: renewal, status, brand: resolvedBrand });
    onClose();
  };

  return (
    <Modal title={`Edit Subscription`} onClose={onClose}>
      <div className="space-y-4">
        {/* Live preview header */}
        <div className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50 p-4">
          <BrandIcon brand={resolvedBrand} size={52} />
          <div>
            <div className="text-[16px] font-extrabold text-slate-900">{name || 'Service Name'}</div>
            <div className="text-[11px] text-slate-500">{category} · ${price || '0'}/{cycle === 'Monthly' ? 'mo' : 'yr'}</div>
            <div className="mt-1"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status==='Active'?'bg-emerald-100 text-emerald-700':status==='Trial'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-500'}`}>{status}</span></div>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormInput label="Service Name" placeholder="e.g. Disney+" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <FormInput label="Price" type="number" placeholder="9.99" value={price} onChange={e => setPrice(e.target.value)} />
          <FormSelect label="Billing Cycle" value={cycle} onChange={e => setCycle(e.target.value as 'Monthly'|'Yearly')}>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </FormSelect>
          <FormSelect label="Category" value={category} onChange={e => setCat(e.target.value)}>
            {['Entertainment','Music','AI Tools','Trading','Design','Dev Tools','Productivity','Storage','Social','Other'].map(c=><option key={c} value={c}>{c}</option>)}
          </FormSelect>
          <FormSelect label="Status" value={status} onChange={e => setStatus(e.target.value as SubscriptionStatus)}>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Paused">Paused</option>
          </FormSelect>
          <div className="col-span-2">
            <FormInput label="Next Renewal Date" type="date" value={renewal} onChange={e => setRenewal(e.target.value)} />
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Brand Icon</label>
          <IconPickerPanel selected={brand} onSelect={setBrand} />
          {brand === '_custom' && (
            <div className="mt-3 space-y-3">
              <div className="flex rounded-xl border border-slate-200 overflow-hidden text-[11px] font-bold">
                {(['text','url','file'] as const).map(m => (
                  <button key={m} onClick={() => setCustomImgMode(m)}
                    className={`flex-1 py-2 transition capitalize inline-flex items-center justify-center gap-1.5 ${customImgMode===m?'bg-purple-100 text-purple-700':'text-slate-500 hover:bg-slate-50'}`}>
                    {m==='text'?<PenLine size={13}/>:m==='url'?<Link2 size={13}/>:<FileText size={13}/>}
                    {m==='text'?'Text':m==='url'?'URL':'File'}
                  </button>
                ))}
              </div>
              {customImgMode==='text' && (
                <div className="grid grid-cols-2 gap-3">
                  <FormInput label="Icon Text (1-2 chars)" placeholder="FB" maxLength={2} value={customText} onChange={e=>setCustomText(e.target.value)} />
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Background Color</label>
                    <input type="color" value={customBg} onChange={e=>setCustomBg(e.target.value)} className="h-[42px] w-full cursor-pointer rounded-xl border border-slate-200" />
                  </div>
                </div>
              )}
              {customImgMode==='url' && (
                <FormInput label="Image URL (PNG, SVG, JPG)" placeholder="https://example.com/logo.png"
                  value={customImgUrl} onChange={e=>setCustomImgUrl(e.target.value)} />
              )}
              {customImgMode==='file' && (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 hover:border-purple-400 transition">
                  <Upload size={16} className="text-purple-500 shrink-0" />
                  <span className="text-[12px] text-slate-500">Click to upload PNG / SVG / JPG</span>
                  <input type="file" accept="image/*" onChange={e=>{
                    const file=e.target.files?.[0]; if(!file) return;
                    const reader=new FileReader();
                    reader.onload=ev=>setCustomImgUrl(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }} className="hidden" />
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleSave} disabled={!name||!price}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[13px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition">
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Add Bill Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function AddBillModal({ onAdd, onClose }: { onAdd: (b: Bill) => void; onClose: () => void }) {
  const [name, setName]           = useState('');
  const [amount, setAmount]       = useState('');
  const [dueDate, setDueDate]     = useState('2026-06-30');
  const [category, setCat]        = useState('Utilities');
  const [autoPay, setAutoPay]     = useState(false);
  const [iconImgUrl, setIconUrl]  = useState('');

  return (
    <Modal title="Add Bill" onClose={onClose}>
      <div className="space-y-4">
        <FormInput label="Bill Name" placeholder="e.g. AIS Mobile Plan" value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Amount (฿)" type="number" placeholder="500" value={amount} onChange={e => setAmount(e.target.value)} />
          <FormInput label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>
        <FormSelect label="Category" value={category} onChange={e => setCat(e.target.value)}>
          {['Telecom','Utilities','Housing','Insurance','Transport','Other'].map(c => <option key={c} value={c}>{c}</option>)}
        </FormSelect>

        {/* Icon: show custom if uploaded, else category default */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Icon Preview</p>
          <div className="flex items-center gap-2">
            <BillCatIcon category={category} iconImgUrl={iconImgUrl || undefined} />
            <span className="text-[12px] font-semibold text-slate-700">{name || category}</span>
          </div>
        </div>

        {/* Custom icon upload */}
        <CustomIconUpload iconImgUrl={iconImgUrl} setIconImgUrl={setIconUrl} />

        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={autoPay} onChange={e => setAutoPay(e.target.checked)} className="h-4 w-4 rounded accent-purple-600" />
          <span className="text-[13px] font-semibold text-slate-700">Enable Auto-Pay</span>
        </label>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => { if (!name || !amount) return; onAdd({ id: `bill-${Date.now()}`, name, amount: parseFloat(amount)||0, dueDate, category, status: 'Scheduled', autoPay, iconImgUrl: iconImgUrl || undefined }); onClose(); }}
            disabled={!name || !amount}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[13px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition">
            Add Bill
          </button>
        </div>
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Add Transaction Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function AddTxModal({ onAdd, onClose }: { onAdd: (t: Transaction) => void; onClose: () => void }) {
  const [title, setTitle]   = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType]     = useState<'Income' | 'Expense' | 'Transfer'>('Expense');
  const [category, setCat]  = useState('Other');
  const [date, setDate]     = useState('2026-06-06');

  return (
    <Modal title="Add Transaction" onClose={onClose}>
      <div className="space-y-4">
        <FormInput label="Description" placeholder="e.g. Grocery shopping" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Type" value={type} onChange={e => setType(e.target.value as 'Income'|'Expense'|'Transfer')}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
            <option value="Transfer">Transfer</option>
          </FormSelect>
          <FormInput label="Amount (฿)" type="number" placeholder="1000" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect label="Category" value={category} onChange={e => setCat(e.target.value)}>
            {['Work','Trading','Learning','Health','Savings','Food','Transport','Housing','Entertainment','Other'].map(c => <option key={c} value={c}>{c}</option>)}
          </FormSelect>
          <FormInput label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button
            onClick={() => { if (!title||!amount) return; const signed = type==='Income'?Math.abs(parseFloat(amount)):-Math.abs(parseFloat(amount)); onAdd({id:`tx-${Date.now()}`,date,title,type,amount:signed,category,status:'Posted'}); onClose(); }}
            disabled={!title||!amount}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[13px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition">
            Add Transaction
          </button>
        </div>
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Add Savings Goal Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const GOAL_COLORS = [
  { label: 'Teal',   value: 'from-emerald-500 to-teal-500' },
  { label: 'Blue',   value: 'from-blue-500 to-indigo-500' },
  { label: 'Purple', value: 'from-purple-500 to-fuchsia-500' },
  { label: 'Orange', value: 'from-orange-500 to-rose-500' },
  { label: 'Slate',  value: 'from-slate-500 to-slate-700' },
  { label: 'Pink',   value: 'from-pink-400 to-rose-500' },
];

function AddGoalModal({ onAdd, onClose }: { onAdd: (g: SavingsGoal) => void; onClose: () => void }) {
  const [goal, setGoal]           = useState('');
  const [current, setCurrent]     = useState('');
  const [target, setTarget]       = useState('');
  const [due, setDue]             = useState('2026-12-31');
  const [icon, setIcon]           = useState('shield');
  const [color, setColor]         = useState(GOAL_COLORS[0].value);
  const [iconImgUrl, setIconUrl]  = useState('');

  return (
    <Modal title="Add Savings Goal" onClose={onClose}>
      <div className="space-y-4">
        <FormInput label="Goal Name" placeholder="e.g. New Laptop" value={goal} onChange={e => setGoal(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Current Amount (฿)" type="number" placeholder="0" value={current} onChange={e => setCurrent(e.target.value)} />
          <FormInput label="Target Amount (฿)" type="number" placeholder="50000" value={target} onChange={e => setTarget(e.target.value)} />
        </div>
        <FormInput label="Target Date" type="date" value={due} onChange={e => setDue(e.target.value)} />

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Goal Icon {iconImgUrl && <span className="text-purple-600 normal-case">(custom icon active)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICON_KEYS.map(k => (
              <button key={k} onClick={() => { setIcon(k); setIconUrl(''); }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition hover:shadow-sm ${icon === k && !iconImgUrl ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-300' : 'border-slate-200 bg-white'}`}>
                {LUCIDE_GOAL_ICONS[k]}
              </button>
            ))}
          </div>
        </div>

        {/* Custom icon upload */}
        <CustomIconUpload iconImgUrl={iconImgUrl} setIconImgUrl={setIconUrl} />

        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Color Theme</label>
          <div className="flex gap-2">
            {GOAL_COLORS.map(c => (
              <button key={c.value} onClick={() => setColor(c.value)}
                className={`h-8 flex-1 rounded-xl bg-gradient-to-r ${c.value} text-[9px] font-bold text-white transition ${color===c.value ? 'ring-2 ring-offset-1 ring-purple-500 scale-105' : 'opacity-70 hover:opacity-100'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => { if (!goal||!target) return; onAdd({id:`sg-${Date.now()}`,goal,current:parseFloat(current)||0,target:parseFloat(target)||0,due,color,lucideIcon:icon,iconImgUrl:iconImgUrl||undefined}); onClose(); }}
            disabled={!goal||!target}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[13px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition">
            Create Goal
          </button>
        </div>
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Confirm Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function ConfirmModal({ message, onConfirm, onClose }: { message: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title="Confirm Action" onClose={onClose}>
      <p className="mb-6 text-[14px] text-slate-600">{message}</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Keep</button>
        <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 h-11 rounded-xl bg-rose-500 text-[13px] font-bold text-white hover:bg-rose-600 transition">Yes, Remove</button>
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Add Credit Card Modal â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

function AddCreditCardModal({ onAdd, onClose }: { onAdd: (c: CreditCardEntry) => void; onClose: () => void }) {
  const [bankKey, setBankKey]     = useState('kbank');
  const [cardName, setCardName]   = useState('');
  const [network, setNetwork]     = useState<CardNetwork>('Visa');
  const [last4, setLast4]         = useState('');
  const [limit, setLimit]         = useState('');
  const [balance, setBalance]     = useState('');
  const [dueDate, setDueDate]     = useState('2026-07-20');

  const bank = THAI_BANKS[bankKey];
  const minPayment = Math.round((parseFloat(balance) || 0) * 0.05);

  const handleAdd = () => {
    if (!cardName || !last4 || !limit) return;
    onAdd({
      id: `cc-${Date.now()}`,
      name: cardName,
      bank: bank.short,
      network,
      last4: last4.slice(-4).padStart(4, '0'),
      balance: parseFloat(balance) || 0,
      limit: parseFloat(limit) || 0,
      dueDate,
      minPayment,
      gradient: bank.gradient,
    });
    onClose();
  };

  return (
    <Modal title="Add Credit Card" onClose={onClose}>
      <div className="space-y-4">
        {/* Card Preview */}
        <div className={`relative h-[110px] rounded-2xl bg-gradient-to-br ${bank.gradient} p-4 text-white overflow-hidden`}>
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="text-[10px] opacity-70">{bank.short}</div>
            <div className="text-[14px] font-extrabold">{cardName || 'Card Name'}</div>
            <div className="mt-2 text-[11px] font-mono tracking-widest opacity-80">
              **** **** **** {last4 || '0000'}
            </div>
            <div className="mt-0.5 text-[10px] opacity-60">{network} · Due {dueDate}</div>
          </div>
        </div>

        {/* Bank selector */}
        <div>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">ธนาคาร</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BANK_KEYS.map(k => (
              <button key={k} onClick={() => setBankKey(k)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition hover:shadow-sm ${bankKey === k ? 'border-transparent ring-2 ring-purple-500' : 'border-slate-200'}`}
                style={{ background: bankKey === k ? `${THAI_BANKS[k].accent}18` : undefined }}>
                <div className={`h-4 w-4 rounded-full bg-gradient-to-br ${THAI_BANKS[k].gradient} shrink-0`} />
                <span className="text-[11px] font-semibold text-slate-700 truncate">{THAI_BANKS[k].short}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Card Name" placeholder="e.g. Platinum" value={cardName} onChange={e => setCardName(e.target.value)} />
          <FormSelect label="Network" value={network} onChange={e => setNetwork(e.target.value as CardNetwork)}>
            {(['Visa','Mastercard','AMEX','UnionPay'] as CardNetwork[]).map(n => <option key={n} value={n}>{n}</option>)}
          </FormSelect>
          <FormInput label="Last 4 Digits" placeholder="4892" maxLength={4} value={last4} onChange={e => setLast4(e.target.value.replace(/\D/g,''))} />
          <FormInput label="Credit Limit (฿)" type="number" placeholder="80000" value={limit} onChange={e => setLimit(e.target.value)} />
          <FormInput label="Current Balance (฿)" type="number" placeholder="0" value={balance} onChange={e => setBalance(e.target.value)} />
          <FormInput label="Payment Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>

        {parseFloat(balance) > 0 && (
          <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-[12px]">
            <span className="font-semibold text-purple-700">Min. Payment (5%): </span>
            <span className="font-extrabold text-purple-900">฿{minPayment.toLocaleString()}</span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleAdd} disabled={!cardName || !last4 || !limit}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-[13px] font-bold text-white disabled:opacity-40 hover:opacity-90 transition">
            Add Card
          </button>
        </div>
      </div>
    </Modal>
  );
}

// â"€â"€â"€ Mock Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

const INIT_SUBS: Subscription[] = [
  { id:'s1',  name:'Netflix',          category:'Entertainment', price:15.49, cycle:'Monthly', renewalDate:'2026-06-12', status:'Active', brand:'netflix' },
  { id:'s2',  name:'YouTube Premium',  category:'Entertainment', price:13.99, cycle:'Monthly', renewalDate:'2026-06-18', status:'Active', brand:'youtube' },
  { id:'s3',  name:'Spotify',          category:'Music',         price:9.99,  cycle:'Monthly', renewalDate:'2026-06-22', status:'Active', brand:'spotify' },
  { id:'s4',  name:'ChatGPT Plus',     category:'AI Tools',      price:20.0,  cycle:'Monthly', renewalDate:'2026-06-10', status:'Active', brand:'chatgpt' },
  { id:'s5',  name:'TradingView Pro',  category:'Trading',       price:14.95, cycle:'Monthly', renewalDate:'2026-06-25', status:'Active', brand:'tradingview' },
  { id:'s6',  name:'Adobe Creative',   category:'Design',        price:54.99, cycle:'Monthly', renewalDate:'2026-06-08', status:'Active', brand:'adobe' },
  { id:'s7',  name:'GitHub Pro',       category:'Dev Tools',     price:4.0,   cycle:'Monthly', renewalDate:'2026-06-30', status:'Active', brand:'github' },
  { id:'s8',  name:'Notion',           category:'Productivity',  price:8.0,   cycle:'Monthly', renewalDate:'2026-06-15', status:'Active', brand:'notion' },
  { id:'s9',  name:'Claude Pro',       category:'AI Tools',      price:20.0,  cycle:'Monthly', renewalDate:'2026-06-20', status:'Trial',  brand:'claude' },
  { id:'s10', name:'Dropbox Plus',     category:'Storage',       price:9.99,  cycle:'Monthly', renewalDate:'2026-06-28', status:'Paused', brand:'dropbox' },
];

const INIT_BILLS: Bill[] = [
  { id:'b1', name:'ค่าโทรศัพท์ AIS',  amount:699,   dueDate:'2026-06-10', category:'Telecom',   status:'Due Soon',  autoPay:true },
  { id:'b2', name:'ค่าไฟฟ้า MEA',     amount:1240,  dueDate:'2026-06-15', category:'Utilities', status:'Due Soon',  autoPay:false },
  { id:'b3', name:'ค่าน้ำประปา',       amount:320,   dueDate:'2026-06-20', category:'Utilities', status:'Scheduled', autoPay:false },
  { id:'b4', name:'Internet TRUE',     amount:599,   dueDate:'2026-06-12', category:'Telecom',   status:'Paid',      autoPay:true },
  { id:'b5', name:'ค่าเช่า Condo',     amount:12000, dueDate:'2026-06-01', category:'Housing',   status:'Paid',      autoPay:false },
  { id:'b6', name:'ค่าจอดรถ',          amount:1800,  dueDate:'2026-06-01', category:'Housing',   status:'Paid',      autoPay:false },
  { id:'b7', name:'ประกันรถ CHUBB',    amount:4200,  dueDate:'2026-07-01', category:'Insurance', status:'Scheduled', autoPay:false },
  { id:'b8', name:'ประกันสุขภาพ',       amount:2800,  dueDate:'2026-07-15', category:'Insurance', status:'Scheduled', autoPay:false },
];

const INIT_CC: CreditCardEntry[] = [
  { id:'c1', name:'KBank Platinum', bank:'KBank',       network:'Visa',       last4:'4892', balance:18450, limit:80000, dueDate:'2026-06-20', minPayment:925, gradient:'from-green-600 to-emerald-700' },
  { id:'c2', name:'SCB FIRST',      bank:'SCB',         network:'Mastercard', last4:'7231', balance:6200,  limit:50000, dueDate:'2026-06-18', minPayment:310, gradient:'from-violet-600 to-purple-800' },
  { id:'c3', name:'KTC World',      bank:'KTC',         network:'Mastercard', last4:'3378', balance:2900,  limit:30000, dueDate:'2026-06-28', minPayment:145, gradient:'from-sky-500 to-blue-700' },
];

const INIT_SAVINGS: SavingsGoal[] = [
  { id:'g1', goal:'Emergency Fund',   current:80000, target:100000, due:'2026-12-31', color:'from-emerald-500 to-teal-500',   lucideIcon:'shield' },
  { id:'g2', goal:'Travel Fund',      current:24000, target:50000,  due:'2026-10-31', color:'from-blue-500 to-indigo-500',    lucideIcon:'plane' },
  { id:'g3', goal:'Education Budget', current:32000, target:45000,  due:'2026-09-30', color:'from-purple-500 to-fuchsia-500', lucideIcon:'book' },
  { id:'g4', goal:'Trading Reserve',  current:60000, target:80000,  due:'2026-08-30', color:'from-orange-500 to-rose-500',    lucideIcon:'trending' },
  { id:'g5', goal:'MacBook Pro',      current:18000, target:60000,  due:'2026-11-30', color:'from-slate-500 to-slate-700',    lucideIcon:'monitor' },
];

const INIT_TX: Transaction[] = [
  { id:'t1', date:'2026-05-28', title:'Freelance Payment',        type:'Income',   amount:9500,  category:'Work',     status:'Cleared' },
  { id:'t2', date:'2026-05-26', title:'Trading Profit Transfer',  type:'Income',   amount:11200, category:'Trading',  status:'Cleared' },
  { id:'t3', date:'2026-05-24', title:'Course Subscription',      type:'Expense',  amount:-450,  category:'Learning', status:'Posted' },
  { id:'t4', date:'2026-05-20', title:'Health Checkup',           type:'Expense',  amount:-960,  category:'Health',   status:'Posted' },
  { id:'t5', date:'2026-05-18', title:'Emergency Fund Top-up',    type:'Transfer', amount:-3200, category:'Savings',  status:'Scheduled' },
];

const TABS = ['Overview','Subscriptions','Bills','Credit Cards','Savings','Cash Flow'] as const;
type MoneyTab = typeof TABS[number];
const EXP_COLORS = ['#7c5cbf','#38bdf8','#10b981','#f59e0b','#f97316','#f43f5e'];

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - new Date('2026-06-06').getTime()) / 86400000); }

// ─── localStorage hook ────────────────────────────────────────────────────────
// Reads initial value from localStorage on first render (client-side only).
// Writes back to localStorage whenever the value changes.
// Falls back to `initial` if nothing is stored yet or JSON parse fails.

function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage full or unavailable — fail silently
    }
  }, [key, value]);

  return [value, setValue];
}

// â"€â"€â"€ Page â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€

export default function MoneyPage() {
  const [tab, setTab]             = useState<MoneyTab>('Overview');
  const [month, setMonth]         = useState<SelMonth>('2026-05');
  const [toast, setToast]         = useState('');
  const [subs, setSubs]           = useLocalStorage<Subscription[]>('alpha_money_subs', INIT_SUBS);
  const [bills, setBills]         = useLocalStorage<Bill[]>('alpha_money_bills', INIT_BILLS);
  const [txList, setTxList]       = useLocalStorage<Transaction[]>('alpha_money_tx', INIT_TX);
  const [goals, setGoals]         = useLocalStorage<SavingsGoal[]>('alpha_money_goals', INIT_SAVINGS);

  const [cards, setCards]               = useLocalStorage<CreditCardEntry[]>('alpha_money_cards', INIT_CC);
  const [showAddSub, setShowAddSub]     = useState(false);
  const [showAddBill, setShowAddBill]   = useState(false);
  const [showAddTx, setShowAddTx]       = useState(false);
  const [showAddGoal, setShowAddGoal]   = useState(false);
  const [showAddCC, setShowAddCC]       = useState(false);
  const [showIconLib, setShowIconLib]   = useState(false);
  const [editSub, setEditSub]           = useState<Subscription | null>(null);
  const [confirmDel, setConfirmDel]     = useState<{msg:string; fn:()=>void}|null>(null);
  const [billMonth, setBillMonth]       = useState<string>('all');
  const [billStatus, setBillStatus]     = useState<string>('All');

  const { stats: lifeStats } = useLifeStats();
  const sel = useMemo(() => {
    if (month === 'all') {
      const total = lifeStats.reduce((acc, m) => ({
        income: acc.income + m.income, expenses: acc.expenses + m.expenses,
        savings: acc.savings + m.savings, netCashFlow: acc.netCashFlow + m.netCashFlow,
      }), { income: 0, expenses: 0, savings: 0, netCashFlow: 0 });
      return { ...lifeStats[lifeStats.length - 1], ...total,
        savingsRate: Math.round((total.savings / total.income) * 100) };
    }
    return selectMonth(lifeStats, month) ?? lifeStats[lifeStats.length - 1];
  }, [month, lifeStats]);
  const activeSubs = subs.filter(s => s.status === 'Active');
  const totalSubMo = activeSubs.reduce((a, s) => a + (s.cycle==='Monthly' ? s.price : s.price/12), 0);
  const totalDebt  = cards.reduce((a, c) => a + c.balance, 0);
  const dueSoon    = bills.filter(b => b.status==='Due Soon'||b.status==='Overdue').length;

  const toast$ = (m: string) => { setToast(m); window.setTimeout(()=>setToast(''), 1800); };

  const delSub  = (id: string) => { const s = subs.find(x=>x.id===id); setConfirmDel({ msg:`Cancel "${s?.name}" subscription?`, fn:()=>{setSubs(p=>p.filter(x=>x.id!==id)); toast$('Subscription cancelled');} }); };
  const payBill = (id: string) => { setBills(p=>p.map(b=>b.id===id?{...b,status:'Paid' as BillStatus}:b)); toast$('Bill marked as paid âœ"'); };
  const delGoal = (id: string) => { const g = goals.find(x=>x.id===id); setConfirmDel({ msg:`Remove goal "${g?.goal}"?`, fn:()=>{setGoals(p=>p.filter(x=>x.id!==id)); toast$('Goal removed');} }); };
  const saveSub  = (updated: Subscription) => { setSubs(p=>p.map(s=>s.id===updated.id?updated:s)); toast$('Subscription updated!'); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TopBar title="Money" subtitle="จัดการรายรับ รายจ่าย Subscription บัตรเครดิต และเป้าหมายการออม" />

      {/* Tab Bar */}
      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max items-center gap-2">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`h-10 rounded-xl px-4 text-[12px] font-extrabold whitespace-nowrap transition ${tab===t ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)] dark:bg-purple-500/20 dark:text-purple-300' : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-500/10'}`}>
              {t}
            </button>
          ))}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* Month filter -- always visible, controls KPI cards */}
            <select value={month} onChange={e => setMonth(e.target.value as SelMonth)}
              className="h-10 rounded-xl border border-purple-100 bg-white px-3 text-[12px] font-semibold text-slate-600 outline-none focus:border-purple-300">
              <option value="all">All Months</option>
              {monthOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard index={0} status="good"   title="Monthly Income"   value={`฿${sel.income.toLocaleString()}`}       note="รวมรายรับเดือนนี้"                          icon={<Wallet size={20} color="#fff"/>} />
        <StatCard index={1} status="danger" title="Monthly Expenses" value={`฿${sel.expenses.toLocaleString()}`}     note="ค่าใช้จ่ายรวมเดือนนี้"                     icon={<ReceiptText size={20} color="#fff"/>} />
        <StatCard index={2} status="warn"   title="Subscriptions/mo" value={`$${totalSubMo.toFixed(2)}`}             note={`${activeSubs.length} active services`}      icon={<RefreshCw size={20} color="#fff"/>} />
        <StatCard index={3} status="danger" title="Total Card Debt"  value={`฿${totalDebt.toLocaleString()}`}        note="รวมยอดค้างทุกใบ"                           icon={<CreditCard size={20} color="#fff"/>} />
        <StatCard index={4} status="warn"   title="Bills Due Soon"   value={`${dueSoon}`}                            note={`${bills.filter(b=>b.status==='Paid').length} paid this month`} icon={<CalendarClock size={20} color="#fff"/>} />
      </div>

      {/* â"€â"€ OVERVIEW â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tab==='Overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <section className="xl:col-span-2 rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-[15px] font-bold text-slate-900">Cash Flow Jan -- May</h3>
              <p className="mb-3 text-[11px] text-slate-400">รายรับ vs รายจ่าย รายเดือน</p>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyCashFlowSeries} barGap={4}>
                    <XAxis dataKey="month" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip/><Legend/>
                    <Bar dataKey="income"   fill="#10b981" radius={[6,6,0,0]} name="Income"/>
                    <Bar dataKey="expenses" fill="#f97316" radius={[6,6,0,0]} name="Expenses"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-[15px] font-bold text-slate-900">Expense Breakdown</h3>
              <p className="mb-3 text-[11px] text-slate-400">สัดส่วนหมวดหมู่รายจ่าย</p>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} dataKey="amount" nameKey="category" innerRadius={45} outerRadius={72}>
                      {expenseBreakdown.map((item,i)=><Cell key={item.category} fill={EXP_COLORS[i%EXP_COLORS.length]}/>)}
                    </Pie><Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1">
                {expenseBreakdown.map((item,i)=>(
                  <div key={item.category} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full" style={{backgroundColor:EXP_COLORS[i%EXP_COLORS.length]}}/>{item.category}</span>
                    <span className="font-semibold text-slate-800">฿{item.amount.toLocaleString()} <span className="text-slate-400">({item.pct}%)</span></span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Top Subs */}
            <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><RefreshCw size={13} className="text-purple-500"/> Top Subscriptions</h3>
              <div className="space-y-2.5">
                {activeSubs.slice(0,5).map(s=>{
                  const d=daysUntil(s.renewalDate), urgent=d>=0&&d<=7;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <BrandIcon brand={s.brand} size={30}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-slate-700 truncate">{s.name}</div>
                        <div className={`text-[9px] font-bold ${urgent?'text-amber-600':'text-slate-400'}`}>{d<0?'Overdue':d===0?'Renews today!':`Renews in ${d}d`}</div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 shrink-0">${s.price}/mo</span>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Upcoming Bills */}
            <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><AlertCircle size={13} className="text-amber-500"/> Upcoming Bills</h3>
              <div className="space-y-2">
                {bills.filter(b=>b.status!=='Paid').slice(0,5).map(b=>{
                  const d=daysUntil(b.dueDate);
                  return (
                    <div key={b.id} className="flex items-center gap-2">
                      <BillCatIcon category={b.category} iconImgUrl={b.iconImgUrl}/>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-slate-700 truncate">{b.name}</div>
                        <div className="text-[9px] text-slate-400">{d>=0?`${d}d left`:'Overdue'}</div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 shrink-0">฿{b.amount.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Card Utilization */}
            <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-[13px] font-bold text-slate-900 flex items-center gap-1.5"><CreditCard size={13} className="text-blue-500"/> Card Utilization</h3>
              <div className="space-y-3">
                {cards.map(c=>{
                  const pct=Math.round((c.balance/c.limit)*100), bar=pct>70?'bg-rose-500':pct>40?'bg-amber-500':'bg-emerald-500';
                  return (
                    <div key={c.id}>
                      <div className="mb-0.5 flex justify-between text-[10px]"><span className="font-semibold text-slate-700">{c.name}</span><span className="text-slate-500">{pct}%</span></div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${bar}`} style={{width:`${pct}%`}}/></div>
                      <div className="mt-0.5 text-[9px] text-slate-400">฿{c.balance.toLocaleString()} / ฿{c.limit.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* â"€â"€ SUBSCRIPTIONS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tab==='Subscriptions' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-purple-100/70 bg-white p-4 shadow-sm">
            {[['Total / Month',`$${totalSubMo.toFixed(2)}`,'text-slate-900'],['Total / Year',`$${(totalSubMo*12).toFixed(2)}`,'text-purple-700'],['Active Services',`${activeSubs.length}`,'text-emerald-600']].map(([l,v,c])=>(
              <div key={l} className="flex-1 min-w-[110px]"><div className="text-[11px] text-slate-400">{l}</div><div className={`text-[22px] font-extrabold ${c}`}>{v}</div></div>
            ))}
            <button onClick={() => setShowAddSub(true)} className="ml-auto shrink-0 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 text-[12px] font-bold text-white flex items-center gap-1 hover:opacity-90 transition">
              <PlusCircle size={14}/> Add Subscription
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {subs.map(sub=>{
              const d=daysUntil(sub.renewalDate), soon=d>=0&&d<=7;
              return (
                <div key={sub.id} className={`group relative flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${sub.status==='Paused'?'opacity-60':''} ${soon?'border-amber-200':'border-purple-100/70'}`}>
                  {soon && <div className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700"><Zap size={9}/>{d===0?'Today!':`${d}d`}</div>}
                  <BrandIcon brand={sub.brand} size={42}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] font-bold text-slate-900">{sub.name}</span>
                      <SubBadge status={sub.status}/>
                    </div>
                    <div className="text-[10px] text-slate-400">{sub.category}</div>
                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <div className="text-[15px] font-extrabold text-slate-900">${sub.price}<span className="text-[10px] font-medium text-slate-400">/{sub.cycle==='Monthly'?'mo':'yr'}</span></div>
                        <div className={`text-[10px] font-semibold ${d<0?'text-rose-500':d<=7?'text-amber-600':'text-slate-400'}`}>{d<0?'Overdue':d===0?'Renews today':`Renews in ${d} days`}</div>
                        <div className="text-[9px] text-slate-400">{sub.renewalDate}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>setEditSub(sub)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-100 text-purple-400 hover:bg-purple-50 hover:text-purple-600 transition"
                          title="Edit subscription"><Pencil size={13}/></button>
                        <button onClick={()=>delSub(sub.id)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-100 text-rose-400 hover:bg-rose-50 transition"><Trash2 size={13}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={()=>setShowAddSub(true)} className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-white p-5 text-purple-400 hover:border-purple-400 hover:text-purple-600 transition min-h-[140px]">
              <PlusCircle size={24}/><span className="text-[12px] font-semibold">Add New Subscription</span>
            </button>
          </div>
        </div>
      )}

      {/* â"€â"€ BILLS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tab==='Bills' && (()=>{
        // Derive unique months from all bills for the month picker
        const billMonths = Array.from(new Set(bills.map(b => b.dueDate.slice(0,7)))).sort();

        // Apply filters
        const filteredBills = bills.filter(b => {
          const monthOk = billMonth === 'all' || b.dueDate.startsWith(billMonth);
          const statusOk = billStatus === 'All' || b.status === billStatus;
          return monthOk && statusOk;
        });

        const totalAmt  = filteredBills.reduce((a,b)=>a+b.amount,0);
        const paidAmt   = filteredBills.filter(b=>b.status==='Paid').reduce((a,b)=>a+b.amount,0);
        const owedAmt   = filteredBills.filter(b=>b.status!=='Paid').reduce((a,b)=>a+b.amount,0);
        const autoCount = filteredBills.filter(b=>b.autoPay).length;

        // Label for section heading
        const monthLabel = billMonth === 'all'
          ? 'All Months'
          : new Date(billMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        return (
          <div className="space-y-4">
            {/* Filters bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-purple-100/70 bg-white px-4 py-3 shadow-sm">
              {/* Month filter */}
              <div className="flex items-center gap-2">
                <CalendarClock size={14} className="text-purple-400 shrink-0" />
                <select
                  value={billMonth}
                  onChange={e => setBillMonth(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] font-semibold text-slate-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                >
                  <option value="all">All Months</option>
                  {billMonths.map(m => (
                    <option key={m} value={m}>
                      {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter pills */}
              <div className="flex gap-1.5">
                {['All','Paid','Due Soon','Overdue','Scheduled'].map(s => (
                  <button key={s} onClick={() => setBillStatus(s)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      billStatus === s
                        ? s==='Paid'     ? 'bg-emerald-500 text-white'
                        : s==='Due Soon' ? 'bg-amber-400 text-white'
                        : s==='Overdue'  ? 'bg-rose-500 text-white'
                        : s==='Scheduled'? 'bg-sky-500 text-white'
                        :                  'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowAddBill(true)} className="ml-auto shrink-0 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 text-[12px] font-bold text-white flex items-center gap-1 hover:opacity-90 transition">
                <PlusCircle size={13}/> Add Bill
              </button>
            </div>

            {/* Summary KPI strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Total Bills',    `฿${totalAmt.toLocaleString()}`,  'text-slate-900',    'bg-slate-50',   'border-slate-200'],
                ['Already Paid',   `฿${paidAmt.toLocaleString()}`,   'text-emerald-600',  'bg-emerald-50', 'border-emerald-100'],
                ['Still Owed',     `฿${owedAmt.toLocaleString()}`,   'text-amber-600',    'bg-amber-50',   'border-amber-100'],
                ['Auto-Pay Active',`${autoCount} bills`,             'text-purple-700',   'bg-purple-50',  'border-purple-100'],
              ].map(([l,v,tc,bg,bc])=>(
                <div key={l} className={`rounded-2xl border ${bc} ${bg} px-4 py-3`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{l}</div>
                  <div className={`text-[20px] font-extrabold ${tc}`}>{v}</div>
                </div>
              ))}
            </div>

            {/* Bills list */}
            <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-slate-900">
                  Bills -- {monthLabel}
                  <span className="ml-2 text-[12px] font-semibold text-slate-400">{filteredBills.length} items</span>
                </h3>
                {(billMonth !== 'all' || billStatus !== 'All') && (
                  <button onClick={()=>{setBillMonth('all');setBillStatus('All');}}
                    className="text-[11px] font-semibold text-purple-500 hover:text-purple-700 transition">
                    Clear filters
                  </button>
                )}
              </div>

              {filteredBills.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                  <AlertCircle size={28} className="text-slate-300"/>
                  <p className="text-[13px] font-semibold">No bills found for this filter</p>
                  <p className="text-[11px]">Try a different month or status</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredBills.map(bill=>{
                    const d=daysUntil(bill.dueDate);
                    return (
                      <div key={bill.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${bill.status==='Paid'?'border-slate-100 bg-slate-50/50 opacity-70':'border-purple-100/70 bg-white hover:shadow-sm'}`}>
                        <BillCatIcon category={bill.category} iconImgUrl={bill.iconImgUrl}/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-800">{bill.name}</span>
                            {bill.autoPay && <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-600">AUTO</span>}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {bill.category} · Due {bill.dueDate}
                            {bill.status!=='Paid' && <span className={`ml-1 font-semibold ${d<0?'text-rose-500':d<=3?'text-amber-600':'text-slate-400'}`}>{d<0?` (${Math.abs(d)}d overdue)`:`(${d}d left)`}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <BillBadge status={bill.status}/>
                          <span className="text-[14px] font-extrabold text-slate-900">฿{bill.amount.toLocaleString()}</span>
                          {bill.status!=='Paid' && <button onClick={()=>payBill(bill.id)} className="flex h-8 items-center gap-1 rounded-xl bg-emerald-100 px-3 text-[11px] font-bold text-emerald-700 hover:bg-emerald-200 transition"><CheckCircle2 size={12}/>Pay</button>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        );
      })()}

      {/* â"€â"€ CREDIT CARDS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tab==='Credit Cards' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap gap-3 rounded-2xl border border-purple-100/70 bg-white p-4 shadow-sm">
            {[
              ['Total Balance',   `฿${totalDebt.toLocaleString()}`,                                                                 'text-rose-600'],
              ['Total Limit',     `฿${cards.reduce((a,c)=>a+c.limit,0).toLocaleString()}`,                                         'text-slate-900'],
              ['Avg Utilization', `${cards.length ? Math.round((totalDebt/cards.reduce((a,c)=>a+c.limit,0))*100) : 0}%`,           'text-amber-600'],
              ['Min Payments',    `฿${cards.reduce((a,c)=>a+c.minPayment,0).toLocaleString()}`,                                    'text-purple-700'],
            ].map(([l,v,c])=>(
              <div key={l} className="flex-1 min-w-[120px]">
                <div className="text-[11px] text-slate-400">{l}</div>
                <div className={`text-[20px] font-extrabold ${c}`}>{v}</div>
              </div>
            ))}
            <button onClick={() => setShowAddCC(true)} className="ml-auto shrink-0 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 text-[12px] font-bold text-white flex items-center gap-1 hover:opacity-90 transition self-center">
              <PlusCircle size={14}/> Add Card
            </button>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => {
              const pct = Math.round((card.balance / card.limit) * 100);
              const bar = pct > 70 ? 'bg-rose-500' : pct > 40 ? 'bg-amber-400' : 'bg-emerald-400';
              const dd  = daysUntil(card.dueDate);
              return (
                <div key={card.id} className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm space-y-4">
                  {/* Card visual */}
                  <div className={`relative h-[120px] rounded-2xl bg-gradient-to-br ${card.gradient} p-4 text-white overflow-hidden`}>
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] opacity-70">{card.bank}</div>
                          <div className="text-[14px] font-extrabold">{card.name}</div>
                        </div>
                        <CreditCard size={20} className="opacity-80" />
                      </div>
                      <div className="mt-2 text-[11px] font-mono tracking-widest opacity-80">**** **** **** {card.last4}</div>
                      <div className="mt-0.5 flex gap-3 text-[10px] opacity-70">
                        <span>{card.network}</span>
                        <span className={dd >= 0 && dd <= 7 ? 'text-yellow-300 font-bold' : ''}>
                          Due {card.dueDate}{dd >= 0 && dd <= 7 ? ` (${dd}d!)` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2">
                      <div className="text-[10px] text-slate-400">Balance</div>
                      <div className="text-[14px] font-extrabold text-rose-600">฿{card.balance.toLocaleString()}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <div className="text-[10px] text-slate-400">Available</div>
                      <div className="text-[14px] font-extrabold text-emerald-600">฿{(card.limit - card.balance).toLocaleString()}</div>
                    </div>
                  </div>
                  {/* Bar */}
                  <div>
                    <div className="mb-1 flex justify-between text-[10px] text-slate-500"><span>Utilization</span><span className="font-bold">{pct}%</span></div>
                    <div className="h-2 w-full rounded-full bg-slate-100"><div className={`h-2 rounded-full ${bar}`} style={{ width: `${pct}%` }} /></div>
                    <div className="mt-1 text-[9px] text-slate-400">฿{card.balance.toLocaleString()} / ฿{card.limit.toLocaleString()}</div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => toast$(`Min payment ฿${card.minPayment.toLocaleString()} for ${card.name}`)}
                      className="flex-1 h-9 rounded-xl bg-purple-100 text-[11px] font-bold text-purple-700 hover:bg-purple-200 transition">
                      Min ฿{card.minPayment.toLocaleString()}
                    </button>
                    <button onClick={() => toast$(`Full payment ฿${card.balance.toLocaleString()} for ${card.name}`)}
                      className="flex-1 h-9 rounded-xl bg-emerald-100 text-[11px] font-bold text-emerald-700 hover:bg-emerald-200 transition">
                      Full ฿{card.balance.toLocaleString()}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add card tile */}
            <button onClick={() => setShowAddCC(true)}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-white p-5 text-purple-400 hover:border-purple-400 hover:text-purple-600 transition min-h-[280px]">
              <PlusCircle size={28} />
              <span className="text-[12px] font-semibold">Add Credit Card</span>
            </button>
          </div>
        </div>
      )}

      {/* â"€â"€ SAVINGS â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tab==='Savings' && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div><h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={15} className="text-emerald-500"/> Savings Goals</h3><p className="text-[11px] text-slate-400 mt-0.5">ติดตามเป้าหมายการออมทุกรายการ</p></div>
              <button onClick={() => setShowAddGoal(true)} className="h-9 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 text-[12px] font-bold text-white flex items-center gap-1 hover:opacity-90 transition">
                <PlusCircle size={13}/> Add Goal
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goals.map(item=>{
                const pct=Math.round((item.current/item.target)*100), dd=daysUntil(item.due), rem=item.target-item.current;
                return (
                  <div key={item.id} className="group relative rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <button onClick={()=>delGoal(item.id)} className="absolute right-3 top-3 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-lg bg-rose-100 text-rose-400 hover:bg-rose-200 transition"><Trash2 size={11}/></button>
                    <div className="flex items-center gap-2 mb-2">
                      <GoalIcon lucideIcon={item.lucideIcon} iconImgUrl={item.iconImgUrl}/>
                      <span className="text-[13px] font-bold text-slate-800">{item.goal}</span>
                    </div>
                    <div className="flex justify-between text-[12px] mb-1"><span className="text-emerald-600 font-semibold">฿{item.current.toLocaleString()}</span><span className="text-slate-400">/ ฿{item.target.toLocaleString()}</span></div>
                    <div className="h-2 rounded-full bg-slate-200 mb-2"><div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`} style={{width:`${Math.min(pct,100)}%`}}/></div>
                    <div className="flex justify-between text-[10px] text-slate-500"><span className="font-semibold">{pct}% · ฿{rem.toLocaleString()} left</span><span className={dd<30?'text-amber-600 font-semibold':''}>{dd}d to go</span></div>
                  </div>
                );
              })}
              <button onClick={()=>setShowAddGoal(true)} className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-200 bg-white p-4 text-emerald-400 hover:border-emerald-400 hover:text-emerald-600 transition min-h-[130px]">
                <PlusCircle size={20}/><span className="text-[11px] font-semibold">Add New Goal</span>
              </button>
            </div>
          </section>
          <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-[15px] font-bold text-slate-900">Savings Trend</h3>
            <p className="mb-3 text-[11px] text-slate-400">ยอดออมสะสมรายเดือน</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCashFlowSeries}><XAxis dataKey="month" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/><Tooltip/><Line dataKey="savings" stroke="#10b981" strokeWidth={2.5} dot={{r:4,fill:'#10b981'}} name="Savings"/></LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}

      {/* â"€â"€ CASH FLOW â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {tab==='Cash Flow' && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[15px] font-bold text-slate-900">Monthly Cash Flow Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">{['Month','Income','Expenses','Savings','Net Cash Flow'].map(h=><th key={h} className="pb-2 pr-4">{h}</th>)}</tr></thead>
                <tbody>
                  {monthlyCashFlowSeries.map(r=>(
                    <tr key={r.month} className="border-b border-slate-50 text-[12px] hover:bg-slate-50/60 transition">
                      <td className="py-3 pr-4 font-semibold text-slate-800">{r.month}</td>
                      <td className="py-3 pr-4 text-emerald-600 font-semibold">฿{r.income.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-rose-500 font-semibold">฿{r.expenses.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-cyan-600 font-semibold">฿{r.savings.toLocaleString()}</td>
                      <td className="py-3 font-extrabold text-slate-900">฿{r.cashFlow.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="rounded-2xl border border-purple-100/70 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-slate-900">Recent Transactions</h3>
              <button onClick={() => setShowAddTx(true)} className="h-9 rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-4 text-[12px] font-bold text-white flex items-center gap-1 hover:opacity-90 transition">
                <PlusCircle size={13}/> Add Entry
              </button>
            </div>
            <div className="space-y-2">
              {txList.map(item=>(
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${item.amount>=0?'bg-emerald-100':'bg-rose-100'}`}>
                    {item.amount>=0?<TrendingUp size={14} className="text-emerald-600"/>:<ReceiptText size={14} className="text-rose-500"/>}
                  </div>
                  <div className="flex-1"><div className="text-[12px] font-semibold text-slate-800">{item.title}</div><div className="text-[10px] text-slate-400">{item.date} · {item.category} · <span className="font-medium">{item.status}</span></div></div>
                  <div className={`text-[13px] font-extrabold ${item.amount>=0?'text-emerald-600':'text-rose-500'}`}>{item.amount>=0?'+':''}฿{Math.abs(item.amount).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* â"€â"€ Modals â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€ */}
      {showAddCC   && <AddCreditCardModal onAdd={c=>{setCards(p=>[...p,c]); toast$(`${c.name} added âœ"`);}} onClose={()=>setShowAddCC(false)}/>}
      {showAddSub  && <AddSubModal  onAdd={s=>{setSubs(p=>[...p,s]); toast$(`"${s.name}" added âœ"`);}} onClose={()=>setShowAddSub(false)}/>}
      {showAddBill && <AddBillModal onAdd={b=>{setBills(p=>[...p,b]); toast$(`"${b.name}" added âœ"`);}} onClose={()=>setShowAddBill(false)}/>}
      {showAddTx   && <AddTxModal  onAdd={t=>{setTxList(p=>[t,...p]); toast$(`Transaction added âœ"`);}} onClose={()=>setShowAddTx(false)}/>}
      {showAddGoal && <AddGoalModal onAdd={g=>{setGoals(p=>[...p,g]); toast$(`Goal "${g.goal}" created âœ"`);}} onClose={()=>setShowAddGoal(false)}/>}
      {showIconLib && <IconLibraryModal onClose={()=>setShowIconLib(false)}/>}
      {editSub && <EditSubModal sub={editSub} onSave={saveSub} onClose={()=>setEditSub(null)}/>}
      {confirmDel  && <ConfirmModal message={confirmDel.msg} onConfirm={confirmDel.fn} onClose={()=>setConfirmDel(null)}/>}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed right-6 bottom-6 z-[60] rounded-xl border border-purple-200 bg-white px-4 py-2 text-[12px] font-semibold text-purple-700 shadow-lg"
        >
          {toast}
        </motion.div>
      )}
    </motion.div>
  );
}
