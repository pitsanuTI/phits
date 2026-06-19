'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Trading store — ONE source of truth for the whole Trading module.
//
// The Data Center tab edits trades, and the Calendar + Analytics tabs read them.
// Instead of each tab keeping its own copy, they all subscribe to this external
// store (React `useSyncExternalStore`). Every write persists to the same
// localStorage key the Data Center already used, and a `storage` listener keeps
// other browser tabs in sync. Result: edit a trade anywhere → it shows up
// everywhere, instantly. No more disconnected mock data.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useSyncExternalStore } from 'react';
import { type Trade, seedTrades, STORAGE_KEY, normalizeTrade } from '@/data/trading-data-mock';

let current: Trade[] = seedTrades;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function readStorage(): Trade[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((t: Record<string, unknown>, i: number) => normalizeTrade(t, i));
    }
  } catch {
    /* ignore malformed storage */
  }
  return null;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

// Load persisted trades exactly once (called from a client effect so SSR and the
// first client render both use `seedTrades` → no hydration mismatch).
function hydrateOnce() {
  if (hydrated) return;
  hydrated = true;
  const stored = readStorage();
  if (stored) {
    current = stored;
    emit();
  }
}

export function getTrades(): Trade[] {
  return current;
}

function getServerSnapshot(): Trade[] {
  return seedTrades;
}

export function setTrades(next: Trade[] | ((prev: Trade[]) => Trade[])) {
  current = typeof next === 'function' ? (next as (p: Trade[]) => Trade[])(current) : next;
  persist();
  emit();
}

export function resetTrades() {
  setTrades(seedTrades);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// Cross-tab sync: another browser tab edited the same localStorage key.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      const stored = readStorage();
      current = stored ?? seedTrades;
      emit();
    }
  });
}

/**
 * Subscribe a component to the shared trade log.
 * `setTrades` accepts a value or an updater (same signature as React setState),
 * so existing Data Center call-sites work unchanged.
 */
export function useTradingData() {
  const trades = useSyncExternalStore(subscribe, getTrades, getServerSnapshot);
  useEffect(() => {
    hydrateOnce();
  }, []);
  return { trades, setTrades, resetTrades };
}
