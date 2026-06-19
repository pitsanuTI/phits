'use client';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_10px_30px_rgba(16,84,55,0.05)] dark:border-white/10 dark:bg-[#181a2c] ${className}`}
    >
      {children}
    </motion.section>
  );
}

export function SectionTitle({ title, subtitle, info = true, right }: { title: string; subtitle?: string; info?: boolean; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-2">
      <div>
        <h3 className="flex items-center gap-1.5 text-[15px] font-extrabold text-slate-800 dark:text-slate-100">
          {title}
          {info && <Info size={13} className="text-slate-300" />}
        </h3>
        {subtitle && <p className="mt-0.5 text-[11px] font-medium text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function ProgressBar({ value, gradient = 'from-emerald-500 to-green-400', track = 'bg-slate-100 dark:bg-white/10', h = 'h-2' }: { value: number; gradient?: string; track?: string; h?: string }) {
  return (
    <div className={`${h} w-full overflow-hidden rounded-full ${track}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
      />
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { key: T; label: string; icon?: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${
            value === o.key ? 'bg-white text-emerald-600 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Dropdown({ value, onChange, options, className = '' }: { value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold text-slate-600 outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-[#14162a] dark:text-slate-200 ${className}`}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Tag({ children, tone = 'good' }: { children: ReactNode; tone?: 'good' | 'warn' | 'danger' | 'info' | 'neutral' }) {
  const map: Record<string, string> = {
    good: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    warn: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    danger: 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300',
    info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
    neutral: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300',
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${map[tone]}`}>{children}</span>;
}
