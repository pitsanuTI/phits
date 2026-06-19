'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LucideIcon, X } from 'lucide-react';
import { ReactNode } from 'react';
import { SparkPoint } from '@/types/work';
import { useEscClose } from '@/lib/useEscClose';

export function WorkPanel({
  children,
  className = '',
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`rounded-3xl border border-purple-100/70 bg-white/88 shadow-[0_14px_34px_rgba(81,59,164,0.08)] backdrop-blur ${noPadding ? '' : 'p-4 lg:p-5'} ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-3 flex items-start justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-[15px] font-extrabold leading-tight text-[#151a3d]">{title}</h3>
        {subtitle && <p className="mt-1 text-[11px] font-medium text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const toneStyles = {
  purple: {
    bg: 'linear-gradient(135deg,#a855f7 0%,#8b5cf6 50%,#c084fc 100%)',
    shadow: '0 14px 34px rgba(139, 92, 246, 0.26)',
  },
  mint: {
    bg: 'linear-gradient(135deg,#34d399 0%,#10b981 50%,#99f6e4 100%)',
    shadow: '0 14px 34px rgba(16, 185, 129, 0.24)',
  },
  blue: {
    bg: 'linear-gradient(135deg,#60a5fa 0%,#3b82f6 55%,#818cf8 100%)',
    shadow: '0 14px 34px rgba(59, 130, 246, 0.24)',
  },
  orange: {
    bg: 'linear-gradient(135deg,#fbbf24 0%,#fb923c 50%,#fdba74 100%)',
    shadow: '0 14px 34px rgba(251, 146, 60, 0.24)',
  },
  coral: {
    bg: 'linear-gradient(135deg,#fb7185 0%,#f97316 55%,#fda4af 100%)',
    shadow: '0 14px 34px rgba(251, 113, 133, 0.24)',
  },
} as const;

export function Sparkline({
  data,
  color = '#ffffff',
  width = 112,
  height = 34,
}: {
  data: SparkPoint[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const safeRange = Math.max(1, max - min);

  const points = data
    .map((item, index) => {
      const x = (index / Math.max(1, data.length - 1)) * width;
      const y = height - ((item.value - min) / safeRange) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-90">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VividKpiCard({
  icon: Icon,
  title,
  value,
  note,
  trend,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  note: string;
  trend: SparkPoint[];
  tone: keyof typeof toneStyles;
}) {
  const style = toneStyles[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[22px] border border-white/40 p-4 text-white"
      style={{ background: style.bg, boxShadow: style.shadow }}
    >
      <div className="pointer-events-none absolute -right-2 -top-3 h-24 w-24 rounded-full bg-white/20 blur-sm" />
      <div className="pointer-events-none absolute right-6 top-6 h-2 w-2 rotate-45 rounded-[1px] bg-white/75" />
      <div className="pointer-events-none absolute right-14 top-9 h-1.5 w-1.5 rotate-45 rounded-[1px] bg-white/65" />
      <div className="pointer-events-none absolute right-9 top-14 h-1 w-1 rotate-45 rounded-[1px] bg-white/65" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 backdrop-blur">
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-bold text-white/95">{title}</div>
            <div className="stat-num mt-1 text-[39px] font-extrabold leading-none tracking-[-0.03em]">{value}</div>
            <div className="mt-1 text-[12px] font-semibold text-white/90">{note}</div>
          </div>
        </div>
        <Sparkline data={trend} />
      </div>
    </motion.div>
  );
}

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'gray';
}) {
  const cls = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    orange: 'border-orange-200 bg-orange-50 text-orange-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
    purple: 'border-purple-200 bg-purple-50 text-purple-700',
    gray: 'border-slate-200 bg-slate-100 text-slate-600',
  }[tone];
  return <span className={`inline-flex h-7 items-center rounded-full border px-3 text-[11px] font-bold ${cls}`}>{label}</span>;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  widthClass = 'max-w-[520px]',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
}) {
  useEscClose(onClose, open);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[90] bg-slate-950/25 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 48, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`fixed right-0 top-0 z-[91] h-full w-full ${widthClass} overflow-y-auto border-l border-purple-100 bg-white p-5 shadow-[0_18px_46px_rgba(45,35,95,0.16)]`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-[18px] font-extrabold text-[#151a3d]">{title}</h4>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={17} />
              </button>
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEscClose(onClose, open);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[90] bg-slate-950/25 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-[91] w-[96vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-purple-100 bg-white p-5 shadow-[0_22px_56px_rgba(45,35,95,0.2)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-[18px] font-extrabold text-[#151a3d]">{title}</h4>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={17} />
              </button>
            </div>
            {children}
            {footer && <div className="mt-4">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function InlineToast({
  message,
  tone = 'purple',
}: {
  message: string;
  tone?: 'purple' | 'green' | 'blue';
}) {
  const bg = tone === 'green' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : tone === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200';
  return <div className={`rounded-2xl border px-3 py-2 text-[12px] font-semibold ${bg}`}>{message}</div>;
}

export const workMotion = {
  content: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.22, ease: 'easeOut' },
  },
};
