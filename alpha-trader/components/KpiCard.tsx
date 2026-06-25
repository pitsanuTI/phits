'use client';

import { ReactNode, useId } from 'react';
import { motion } from 'framer-motion';
import { resolveTone, toneGradient } from '@/lib/cardTones';

const STAR_PATH = 'M5,0 C5,0 5.2,3.8 5.6,4.4 C6.2,4.8 10,5 10,5 C10,5 6.2,5.2 5.6,5.6 C5.2,6.2 5,10 5,10 C5,10 4.8,6.2 4.4,5.6 C3.8,5.2 0,5 0,5 C0,5 3.8,4.8 4.4,4.4 C4.8,3.8 5,0 5,0 Z';

type StarProps = {
  size: number;
  top?: number | string; bottom?: number | string;
  left?: number | string; right?: number | string;
  delay: number; duration: number;
};

function SparkStar({ size, top, bottom, left, right, delay, duration }: StarProps) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 10 10"
      style={{ position: 'absolute', top, bottom, left, right, pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
      animate={{
        opacity: [0, 0.85, 0.15, 1, 0.55, 0],
        scale:   [0.3, 1.2,  0.75, 1.1, 0.9, 0.3],
        rotate:  [0,   18,   8,    22,   12,  0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.45, 0.6, 0.8, 1] }}
    >
      <path d={STAR_PATH} fill="rgba(255,255,255,0.95)" />
      <path d={STAR_PATH} fill="rgba(255,255,255,0.4)"
        style={{ filter: `blur(${size * 0.35}px)`, transform: `scale(1.5) translate(-${size * 0.025}px, -${size * 0.025}px)` }} />
    </motion.svg>
  );
}

function DimensionalSparkline({ data, uid }: { data: { v: number }[]; uid: string }) {
  const values = data.map(d => d.v);
  if (values.length < 2) return null;

  const W = 300, H = 30, PY = 3, PX = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const sy = (v: number) => PY + (1 - (v - min) / range) * (H - PY * 2);
  const sx = (i: number) => PX + (i / (values.length - 1)) * (W - PX * 2);
  const pts: [number, number][] = values.map((v, i) => [sx(i), sy(v)]);

  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    const p0 = pts[Math.max(0, i - 2)];
    const p1 = pts[i - 1];
    const p2 = p;
    const p3 = pts[Math.min(pts.length - 1, i + 1)];
    const cp1x = (p1[0] + (p2[0] - p0[0]) / 6).toFixed(2);
    const cp1y = (p1[1] + (p2[1] - p0[1]) / 6).toFixed(2);
    const cp2x = (p2[0] - (p3[0] - p1[0]) / 6).toFixed(2);
    const cp2y = (p2[1] - (p3[1] - p1[1]) / 6).toFixed(2);
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }, '');

  const last = pts[pts.length - 1];
  const areaPath = `${linePath} L ${last[0].toFixed(2)} ${H + 2} L ${pts[0][0].toFixed(2)} ${H + 2} Z`;
  const areaId = `${uid}-a`;
  const glowId = `${uid}-g`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.5} />
          <stop offset="55%" stopColor="white" stopOpacity={0.18} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <filter id={glowId} x="-5%" y="-120%" width="110%" height="340%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path d={linePath} stroke="rgba(255,255,255,0.22)" strokeWidth={7}
        fill="none" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: 'blur(5px)' }} />

      <path d={areaPath} fill={`url(#${areaId})`} />

      <path d={linePath} stroke="rgba(255,255,255,0.92)" strokeWidth={2.2}
        fill="none" strokeLinecap="round" strokeLinejoin="round"
        filter={`url(#${glowId})`} />

      <motion.circle cx={last[0]} cy={last[1]} r={3}
        fill="none" stroke="white" strokeWidth={1.2}
        initial={{ r: 3, opacity: 0.85 }}
        animate={{ r: 10, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />

      <circle cx={last[0]} cy={last[1]} r={3} fill="white" opacity={0.95}
        filter={`url(#${glowId})`} />
      <circle cx={last[0]} cy={last[1]} r={1.6} fill="white" />
    </svg>
  );
}

interface Props {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: ReactNode;
  iconBg?: string;
  color?: string;
  sparkData?: { v: number }[];
}

const FALLBACK_SPARK = [
  { v: 28 }, { v: 76 }, { v: 42 }, { v: 91 }, { v: 33 }, { v: 82 },
  { v: 50 }, { v: 95 }, { v: 38 }, { v: 87 }, { v: 44 }, { v: 90 },
];

export default function KpiCard({
  title,
  value,
  change,
  positive = true,
  icon,
  color = '#7c3aed',
  sparkData,
}: Props) {
  const tone = resolveTone(color);
  const uid  = useId().replace(/:/g, '');
  const data = sparkData ?? FALLBACK_SPARK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, boxShadow: `0 22px 44px ${tone.glow}` }}
      whileTap={{ scale: 0.98 }}
      className="vivid-card group h-[128px] rounded-[22px] p-4 flex flex-col"
      style={{
        background: toneGradient(tone),
        boxShadow: `0 14px 32px ${tone.glow}`,
      }}
    >
      <SparkStar size={14} top={6}    right={68} delay={0}   duration={3.0} />
      <SparkStar size={9}  bottom={30} left={14} delay={1.4} duration={2.6} />
      <SparkStar size={7}  bottom={8}  right={14} delay={2.3} duration={3.4} />

      <div className="flex flex-1 min-h-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-bold leading-tight text-white/85">{title}</div>
          <div className="stat-num mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.035em] text-white drop-shadow-sm">
            {value}
          </div>
          {change && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/22 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              <span>{positive ? '▲' : '▼'}</span>
              {change}
            </div>
          )}
        </div>

        {icon && (
          <div className="icon-frost flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-1.5 h-7 flex-shrink-0">
        <DimensionalSparkline data={data} uid={uid} />
      </div>
    </motion.div>
  );
}
