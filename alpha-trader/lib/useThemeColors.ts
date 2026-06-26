'use client';
import { useEffect, useState } from 'react';
import type { ColorTheme } from './colorTheme';

export interface ThemeColors {
  /** Main chart line / area stroke — follows the active color theme */
  primary: string;
  /** Lighter variant of primary — for secondary lines, dots */
  primarySoft: string;
  /** Grid lines (semi-transparent) */
  grid: string;
  /** Tooltip cursor background (very light) */
  cursor: string;
  /** Secondary accent line (e.g. SMA, benchmark) */
  accent: string;
  /** Profit / gain — semantic, always green */
  profit: string;
  /** Loss / risk — semantic, always red-coral */
  loss: string;
  /** Win bars */
  barWin: string;
  /** Loss bars */
  barLoss: string;
  /** Neutral / reference lines */
  neutral: string;
}

const PALETTES: Record<ColorTheme, ThemeColors> = {
  purple: {
    primary: '#7c3aed',
    primarySoft: '#a78bfa',
    grid: 'rgba(124,58,237,0.08)',
    cursor: 'rgba(124,58,237,0.04)',
    accent: '#38bdf8',
    profit: '#10b981',
    loss: '#f43f5e',
    barWin: '#34d399',
    barLoss: '#fb7185',
    neutral: '#94a3b8',
  },
  mono: {
    primary: '#374151',
    primarySoft: '#9ca3af',
    grid: 'rgba(55,65,81,0.08)',
    cursor: 'rgba(55,65,81,0.04)',
    accent: '#94a3b8',
    profit: '#10b981',
    loss: '#f43f5e',
    barWin: '#34d399',
    barLoss: '#fb7185',
    neutral: '#9ca3af',
  },
  blue: {
    primary: '#2563eb',
    primarySoft: '#60a5fa',
    grid: 'rgba(37,99,235,0.08)',
    cursor: 'rgba(37,99,235,0.04)',
    accent: '#06b6d4',
    profit: '#10b981',
    loss: '#f43f5e',
    barWin: '#34d399',
    barLoss: '#fb7185',
    neutral: '#94a3b8',
  },
  green: {
    primary: '#059669',
    primarySoft: '#34d399',
    grid: 'rgba(5,150,105,0.08)',
    cursor: 'rgba(5,150,105,0.04)',
    accent: '#a3e635',
    profit: '#10b981',
    loss: '#f43f5e',
    barWin: '#34d399',
    barLoss: '#fb7185',
    neutral: '#94a3b8',
  },
  orange: {
    primary: '#ea580c',
    primarySoft: '#fb923c',
    grid: 'rgba(234,88,12,0.08)',
    cursor: 'rgba(234,88,12,0.04)',
    accent: '#fbbf24',
    profit: '#10b981',
    loss: '#f43f5e',
    barWin: '#34d399',
    barLoss: '#fb7185',
    neutral: '#94a3b8',
  },
};

function getCurrentTheme(): ColorTheme {
  try {
    return (localStorage.getItem('colorTheme') as ColorTheme) || 'purple';
  } catch {
    return 'purple';
  }
}

export function useThemeColors(): ThemeColors {
  const [theme, setTheme] = useState<ColorTheme>('purple');

  useEffect(() => {
    setTheme(getCurrentTheme());
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ColorTheme>;
      setTheme(ce.detail ?? getCurrentTheme());
    };
    window.addEventListener('alpha-theme-change', handler);
    return () => window.removeEventListener('alpha-theme-change', handler);
  }, []);

  return PALETTES[theme] ?? PALETTES.purple;
}
