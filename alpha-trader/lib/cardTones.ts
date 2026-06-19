/* ── Vivid gradient card tones ─────────────────────────────────────────────
   Bright, glossy gradients inspired by colorful feature-tile design.
   Used by KpiCard, AnalyticsKpiCard, GradientTile so the whole app shares
   one premium, colorful card language. */

export interface Tone {
  from: string;
  to: string;
  glow: string;   // rgba shadow color
}

/* Canonical vivid palette */
export const TONES: Record<string, Tone> = {
  purple: { from: '#7c3aed', to: '#a855f7', glow: 'rgba(124,58,237,0.40)' },
  violet: { from: '#6366f1', to: '#818cf8', glow: 'rgba(99,102,241,0.40)' },
  teal:   { from: '#0d9488', to: '#2dd4bf', glow: 'rgba(13,148,136,0.40)' },
  mint:   { from: '#10b981', to: '#34d399', glow: 'rgba(16,185,129,0.40)' },
  sky:    { from: '#0ea5e9', to: '#38bdf8', glow: 'rgba(14,165,233,0.40)' },
  blue:   { from: '#3b82f6', to: '#60a5fa', glow: 'rgba(59,130,246,0.40)' },
  amber:  { from: '#f59e0b', to: '#fbbf24', glow: 'rgba(245,158,11,0.42)' },
  orange: { from: '#f97316', to: '#fb923c', glow: 'rgba(249,115,22,0.42)' },
  coral:  { from: '#f43f5e', to: '#fb7185', glow: 'rgba(244,63,94,0.42)' },
  pink:   { from: '#ec4899', to: '#f472b6', glow: 'rgba(236,72,153,0.42)' },
  cyan:   { from: '#06b6d4', to: '#22d3ee', glow: 'rgba(6,182,212,0.40)' },
};

/* Ordered list for auto-cycling (matches the colorful reference layout) */
export const TONE_CYCLE: Tone[] = [
  TONES.purple, TONES.teal, TONES.blue, TONES.amber,
  TONES.sky, TONES.coral, TONES.violet, TONES.pink,
];

/* Map a base hex color (as used around the app) → a vivid tone */
const HEX_MAP: Record<string, Tone> = {
  '#10b981': TONES.mint,
  '#34d399': TONES.mint,
  '#0d9488': TONES.teal,
  '#7c5cbf': TONES.purple,
  '#7c3aed': TONES.purple,
  '#a78bfa': TONES.violet,
  '#6366f1': TONES.violet,
  '#f59e0b': TONES.amber,
  '#fbbf24': TONES.amber,
  '#f97316': TONES.orange,
  '#38bdf8': TONES.sky,
  '#0ea5e9': TONES.sky,
  '#3b82f6': TONES.blue,
  '#f43f5e': TONES.coral,
  '#fb7185': TONES.coral,
  '#ec4899': TONES.pink,
  '#06b6d4': TONES.cyan,
};

export function resolveTone(color?: string): Tone {
  if (color && HEX_MAP[color.toLowerCase()]) return HEX_MAP[color.toLowerCase()];
  if (color) return { from: color, to: color, glow: `${color}66` };
  return TONES.purple;
}

/* ── Semantic status → tone + emotion ───────────────────────────────────────
   good   = ปลอดภัย/กำไร (green)
   info   = ข้อมูลทั่วไป (blue/sky)
   warn   = เริ่มต้องระวัง (yellow/amber)
   danger = อันตราย/ขาดทุน (red/coral)
   premium= เด่น/พิเศษ (purple) */
export type CardStatus = 'good' | 'info' | 'warn' | 'danger' | 'premium' | 'neutral';

export const STATUS_TONE: Record<CardStatus, Tone> = {
  good:    TONES.mint,
  info:    TONES.sky,
  warn:    TONES.amber,
  danger:  TONES.coral,
  premium: TONES.purple,
  neutral: TONES.violet,
};

export function statusTone(status: CardStatus): Tone {
  return STATUS_TONE[status] ?? TONES.purple;
}

/* Auto-derive a semantic status from a numeric-ish value + thresholds.
   Useful for scores (0-100) or percentages. */
export function deriveStatus(
  value: number,
  { warnBelow = 60, dangerBelow = 40, invert = false }:
  { warnBelow?: number; dangerBelow?: number; invert?: boolean } = {},
): CardStatus {
  const v = invert ? 100 - value : value;
  if (v < dangerBelow) return 'danger';
  if (v < warnBelow) return 'warn';
  return 'good';
}

/* CSS gradient string */
export function toneGradient(t: Tone): string {
  return `linear-gradient(135deg, ${t.from} 0%, ${t.to} 100%)`;
}
