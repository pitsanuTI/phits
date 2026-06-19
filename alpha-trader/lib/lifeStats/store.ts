'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { monthlyLifeStats, type MonthKey, type MonthlyLifeSnapshot } from '@/data/life-dashboard-mock';

const STORAGE_KEY = 'alpha_life_stats';

let current: MonthlyLifeSnapshot[] = monthlyLifeStats;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() { for (const l of listeners) l(); }

function readStorage(): MonthlyLifeSnapshot[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed as MonthlyLifeSnapshot[];
  } catch {}
  return null;
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(current)); } catch {}
}

function hydrateOnce() {
  if (hydrated) return;
  hydrated = true;
  const stored = readStorage();
  if (stored) { current = stored; emit(); }
}

export function getLifeStats(): MonthlyLifeSnapshot[] { return current; }
function getServerSnapshot(): MonthlyLifeSnapshot[] { return monthlyLifeStats; }

export function setLifeStats(next: MonthlyLifeSnapshot[] | ((prev: MonthlyLifeSnapshot[]) => MonthlyLifeSnapshot[])) {
  current = typeof next === 'function' ? (next as (p: MonthlyLifeSnapshot[]) => MonthlyLifeSnapshot[])(current) : next;
  persist();
  emit();
}

export function patchMonth(month: MonthKey, patch: Partial<MonthlyLifeSnapshot>) {
  setLifeStats(prev => prev.map(m => m.month === month ? { ...m, ...patch } : m));
}

export function resetLifeStats() { setLifeStats(monthlyLifeStats); }

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      const stored = readStorage();
      current = stored ?? monthlyLifeStats;
      emit();
    }
  });
}

export function useLifeStats() {
  const stats = useSyncExternalStore(subscribe, getLifeStats, getServerSnapshot);
  useEffect(() => { hydrateOnce(); }, []);
  return { stats, setLifeStats, patchMonth, resetLifeStats };
}

export function selectMonth(stats: MonthlyLifeSnapshot[], month: MonthKey): MonthlyLifeSnapshot | undefined {
  return stats.find(m => m.month === month);
}
