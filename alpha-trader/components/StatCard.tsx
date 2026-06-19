'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const STAR_PATH = 'M5,0 C5,0 5.2,3.8 5.6,4.4 C6.2,4.8 10,5 10,5 C10,5 6.2,5.2 5.6,5.6 C5.2,6.2 5,10 5,10 C5,10 4.8,6.2 4.4,5.6 C3.8,5.2 0,5 0,5 C0,5 3.8,4.8 4.4,4.4 C4.8,3.8 5,0 5,0 Z';

type StarProps = { size: number; top?: number|string; bottom?: number|string; left?: number|string; right?: number|string; delay: number; duration: number };
function SparkStar({ size, top, bottom, left, right, delay, duration }: StarProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 10 10"
      style={{ position: 'absolute', top, bottom, left, right, pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
      animate={{ opacity: [0, 0.85, 0.15, 1, 0.55, 0], scale: [0.3, 1.2, 0.75, 1.1, 0.9, 0.3], rotate: [0, 18, 8, 22, 12, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.45, 0.6, 0.8, 1] }}
    >
      <path d={STAR_PATH} fill="rgba(255,255,255,0.95)" />
      <path d={STAR_PATH} fill="rgba(255,255,255,0.4)" style={{ filter: `blur(${size * 0.35}px)`, transform: `scale(1.5) translate(-${size * 0.025}px, -${size * 0.025}px)` }} />
    </motion.svg>
  );
}
import { statusTone, toneGradient, type CardStatus } from '@/lib/cardTones';

interface Props {
  title: string;
  value: string;
  note?: string;
  status?: CardStatus;   // semantic color: good/info/warn/danger/premium/neutral
  icon?: ReactNode;
  index?: number;        // for stagger delay
}

/* ── Count-up: animates the leading numeric part of `value` whenever it changes
   (e.g. when a filter/month changes). Non-numeric values render as-is. ── */
function parseNum(v: string): number {
  const m = v.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : NaN;
}

function useCountUp(target: number, duration = 700): number {
  const [cur, setCur] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isNaN(target)) return;
    const from = isNaN(fromRef.current) ? 0 : fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setCur(from + (target - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return cur;
}

export function useAnimatedValue(value: string): string {
  const target = parseNum(value);
  const cur = useCountUp(target);
  if (isNaN(target)) return value;
  const firstMatch = value.match(/-?[\d,]+(\.\d+)?/);
  const decimals = firstMatch?.[1] ? firstMatch[1].length - 1 : 0;
  const counted = cur.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return value.replace(/-?[\d,]+(\.\d+)?/, counted);
}

export default function StatCard({ title, value, note, status = 'info', icon, index = 0 }: Props) {
  const tone = statusTone(status);
  const displayValue = useAnimatedValue(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, boxShadow: `0 18px 40px ${tone.glow}` }}
      className="vivid-card flex min-h-[112px] flex-col justify-center rounded-[22px] p-4"
      style={{ background: toneGradient(tone), boxShadow: `0 14px 32px ${tone.glow}` }}
    >
      {/* sparkle stars — clear of icon (h-8 w-8 at top-right, ~16–48px each axis) */}
      <SparkStar size={13} top={6}    right={56}  delay={0}   duration={3.0} />
      <SparkStar size={8}  bottom={24} left={12}  delay={1.5} duration={2.7} />
      <SparkStar size={6}  bottom={8}  right={12} delay={2.4} duration={3.3} />

      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold text-white/85">{title}</div>
        {icon && (
          <div className="icon-frost flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/25 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {icon}
          </div>
        )}
      </div>

      <div className="stat-num mt-2 text-[24px] font-extrabold leading-none tracking-[-0.035em] text-white drop-shadow-sm">
        {displayValue}
      </div>

      {note && <div className="mt-1.5 text-[11px] font-semibold text-white/85">{note}</div>}
    </motion.div>
  );
}
