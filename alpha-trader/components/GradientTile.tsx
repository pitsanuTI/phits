'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import type { Tone } from '@/lib/cardTones';
import { toneGradient } from '@/lib/cardTones';

interface Props {
  label: string;
  sublabel?: string;
  icon: ReactNode;
  tone: Tone;
  href?: string;
}

/**
 * Premium gradient tile — matches the colorful "feature card" reference.
 * Diagonal glossy gradient + frosted soft-graphic blob + sparkle dots.
 */
export default function GradientTile({ label, sublabel, icon, tone, href }: Props) {
  const content = (
    <div
      className="vivid-card group relative flex h-[112px] items-center gap-3 overflow-hidden rounded-[22px] px-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer"
      style={{
        background: toneGradient(tone),
        boxShadow: `0 18px 38px ${tone.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
      }}
    >
      {/* ── Sparkle dots (more, scattered for premium feel) ── */}
      <span className="spark-dot" style={{ top: 14, right: 70, width: 6, height: 6 }} />
      <span className="spark-dot" style={{ top: 28, right: 56, width: 4, height: 4, opacity: 0.75 }} />
      <span className="spark-dot" style={{ bottom: 22, right: 90, width: 4, height: 4, opacity: 0.6 }} />
      <span className="spark-dot" style={{ top: 50, right: 26, width: 3, height: 3, opacity: 0.55 }} />
      <span className="spark-dot" style={{ bottom: 14, right: 50, width: 5, height: 5, opacity: 0.5 }} />
      <span className="spark-dot" style={{ top: 16, left: 22, width: 3, height: 3, opacity: 0.4 }} />

      {/* ── Label ── */}
      <div className="relative z-10 min-w-0 flex-1">
        <div
          className="truncate text-[19px] font-extrabold leading-tight text-white drop-shadow-sm"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}
        >
          {label}
        </div>
        {sublabel && (
          <div className="mt-0.5 truncate text-[11px] font-semibold text-white/85">{sublabel}</div>
        )}
      </div>

      {/* ── Icon — frosted glyph (soft graphic mirroring the reference) ── */}
      <div
        className="icon-frost relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[18px] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
        style={{
          background: 'rgba(255,255,255,0.28)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 12px rgba(0,0,0,0.08)',
        }}
      >
        {icon}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
