'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  DollarSign, TrendingUp, Target, Award, Zap, Shield,
  AlertTriangle, CheckCircle2, Info,
  ChevronRight, Newspaper, Clock,
  CalendarDays, Crosshair, Layers, BarChart3,
} from 'lucide-react';
import { Bitcoin, Tradingview } from '@thesvg/react';
import { Coins } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import { useTradingData } from '@/lib/trading/store';
import ForexNewsWidget from './ForexNewsWidget';
import {
  calculateTotalCapital,
  calculateMonthlyPnL,
  calculateMonthlyPnLPct,
  calculateWinRate,
  calculateProfitFactor,
  calculateMaxDrawdown,
  getActiveChallenges,
  buildEquityCurve,
  calculateTradingReadiness,
  calculatePsychologyScore,
  calculateDisciplineScore,
  getBestEdge,
  getWorstRisk,
  getRecentTrades,
  buildKpiSparkline,
  currentMonthKey,
  prevMonthKey,
  type EquityPoint,
} from '@/lib/trading/selectors';
import { deriveKpis } from '@/data/trading-data-mock';

// â”€â”€ KPI palette — hex colors that map via resolveTone() in KpiCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These hex values align with vivid card tones in lib/cardTones.ts
const KPI_COLORS = {
  mint:    '#0d9488',
  purple:  '#7c3aed',
  sky:     '#0ea5e9',
  amber:   '#f59e0b',
  violet:  '#6366f1',
  coral:   '#f43f5e',
  cyan:    '#06b6d4',
  emerald: '#10b981',
} as const;
type KpiColorKey = keyof typeof KPI_COLORS;


// â”€â”€ Timeframe options for equity curve â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TIMEFRAMES = ['All Time', '3M', '1M', 'This Week'] as const;
type TF = (typeof TIMEFRAMES)[number];


// â”€â”€ Forex Factoryâ€“style economic calendar (mock, date-aware) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Today is 2026-06-02 (per project clock). Events span the trading week
// 2026-06-01..2026-06-05 so date filters actually change the table.
type NewsItem = {
  date: string;     // YYYY-MM-DD
  time: string;     // HH:MM (24h) or 'Tentative' / 'All Day'
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'NZD' | 'CHF' | 'CNY';
  impact: 'high' | 'medium' | 'low';
  event: string;
  actual: string;   // '' when not released yet
  forecast: string;
  previous: string;
};

const forexFactoryNews: NewsItem[] = [
  // â”€â”€ Mon 2026-06-01 (yesterday) — released â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { date: '2026-06-01', time: '02:00', currency: 'EUR', impact: 'medium', event: 'CPI Flash Estimate y/y',          actual: '2.1%',  forecast: '2.0%',  previous: '2.2%'  },
  { date: '2026-06-01', time: '02:00', currency: 'EUR', impact: 'medium', event: 'Core CPI Flash Estimate y/y',     actual: '2.7%',  forecast: '2.6%',  previous: '2.7%'  },
  { date: '2026-06-01', time: '04:30', currency: 'GBP', impact: 'medium', event: 'Manufacturing PMI',               actual: '49.4',  forecast: '49.2',  previous: '49.1'  },
  { date: '2026-06-01', time: '09:45', currency: 'USD', impact: 'medium', event: 'Final Manufacturing PMI',         actual: '52.1',  forecast: '52.0',  previous: '51.6'  },
  { date: '2026-06-01', time: '10:00', currency: 'USD', impact: 'high',   event: 'ISM Manufacturing PMI',           actual: '48.9',  forecast: '49.5',  previous: '48.7'  },
  { date: '2026-06-01', time: '10:00', currency: 'USD', impact: 'medium', event: 'ISM Manufacturing Prices',        actual: '57.0',  forecast: '58.5',  previous: '60.9'  },

  // â”€â”€ Tue 2026-06-02 (today) — partially released â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { date: '2026-06-02', time: '04:30', currency: 'GBP', impact: 'low',    event: 'BRC Shop Price Index y/y',        actual: '0.6%',  forecast: '0.8%',  previous: '0.7%'  },
  { date: '2026-06-02', time: '07:55', currency: 'EUR', impact: 'low',    event: 'German Unemployment Change',      actual: '8K',    forecast: '12K',   previous: '10K'   },
  { date: '2026-06-02', time: '10:00', currency: 'USD', impact: 'high',   event: 'JOLTS Job Openings',              actual: '',      forecast: '7.40M', previous: '7.19M' },
  { date: '2026-06-02', time: '13:00', currency: 'USD', impact: 'medium', event: 'FOMC Member Williams Speaks',     actual: '',      forecast: '',      previous: ''      },
  { date: '2026-06-02', time: '19:30', currency: 'AUD', impact: 'medium', event: 'Current Account',                 actual: '',      forecast: '-15.0B',previous: '-12.5B'},

  // â”€â”€ Wed 2026-06-03 (tomorrow) — upcoming â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { date: '2026-06-03', time: '00:30', currency: 'AUD', impact: 'high',   event: 'GDP q/q',                         actual: '',      forecast: '0.5%',  previous: '0.6%'  },
  { date: '2026-06-03', time: '08:15', currency: 'USD', impact: 'medium', event: 'ADP Non-Farm Employment Change',  actual: '',      forecast: '128K',  previous: '143K'  },
  { date: '2026-06-03', time: '09:45', currency: 'USD', impact: 'medium', event: 'Final Services PMI',              actual: '',      forecast: '53.4',  previous: '53.4'  },
  { date: '2026-06-03', time: '10:00', currency: 'USD', impact: 'high',   event: 'ISM Services PMI',                actual: '',      forecast: '52.6',  previous: '51.4'  },
  { date: '2026-06-03', time: '14:00', currency: 'USD', impact: 'medium', event: 'Beige Book',                      actual: '',      forecast: '',      previous: ''      },
  { date: '2026-06-03', time: '21:30', currency: 'JPY', impact: 'low',    event: 'Average Cash Earnings y/y',       actual: '',      forecast: '2.7%',  previous: '2.6%'  },

  // â”€â”€ Thu 2026-06-04 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { date: '2026-06-04', time: '04:30', currency: 'GBP', impact: 'medium', event: 'Construction PMI',                actual: '',      forecast: '51.3',  previous: '51.1'  },
  { date: '2026-06-04', time: '07:30', currency: 'EUR', impact: 'high',   event: 'Main Refinancing Rate',           actual: '',      forecast: '2.25%', previous: '2.40%' },
  { date: '2026-06-04', time: '08:15', currency: 'EUR', impact: 'high',   event: 'ECB Press Conference',            actual: '',      forecast: '',      previous: ''      },
  { date: '2026-06-04', time: '08:30', currency: 'USD', impact: 'medium', event: 'Unemployment Claims',             actual: '',      forecast: '226K',  previous: '218K'  },
  { date: '2026-06-04', time: '08:30', currency: 'CAD', impact: 'medium', event: 'Trade Balance',                   actual: '',      forecast: '-1.2B', previous: '-0.5B' },

  // â”€â”€ Fri 2026-06-05 — NFP day â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { date: '2026-06-05', time: '08:30', currency: 'USD', impact: 'high',   event: 'Non-Farm Employment Change',      actual: '',      forecast: '140K',  previous: '177K'  },
  { date: '2026-06-05', time: '08:30', currency: 'USD', impact: 'high',   event: 'Unemployment Rate',               actual: '',      forecast: '4.2%',  previous: '4.2%'  },
  { date: '2026-06-05', time: '08:30', currency: 'USD', impact: 'medium', event: 'Average Hourly Earnings m/m',     actual: '',      forecast: '0.3%',  previous: '0.2%'  },
  { date: '2026-06-05', time: '08:30', currency: 'CAD', impact: 'high',   event: 'Employment Change',               actual: '',      forecast: '15.0K', previous: '7.4K'  },
  { date: '2026-06-05', time: '08:30', currency: 'CAD', impact: 'medium', event: 'Unemployment Rate',               actual: '',      forecast: '7.0%',  previous: '6.9%'  },
  { date: '2026-06-05', time: '10:00', currency: 'CAD', impact: 'medium', event: 'Ivey PMI',                        actual: '',      forecast: '49.8',  previous: '47.9'  },
  { date: '2026-06-05', time: 'Tentative', currency: 'CNY', impact: 'medium', event: 'Trade Balance',               actual: '',      forecast: '95.5B', previous: '96.2B' },
];

// â”€â”€ Date helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TODAY_ISO = '2026-06-02';
const addDaysIso = (iso: string, n: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
};
const weekRangeIso = (iso: string): [string, string] => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Treat Monday as start of week (UTC). getUTCDay(): Sun=0..Sat=6
  const dow = dt.getUTCDay();
  const offsetToMon = dow === 0 ? -6 : 1 - dow;
  const start = addDaysIso(iso, offsetToMon);
  const end = addDaysIso(start, 4); // Mon..Fri
  return [start, end];
};
const formatPrettyDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
};

// Debounced: waits 1000ms after theme toggle before rebuilding TradingView iframe
function useDebouncedDarkMode(delay = 1000) {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      const isDark = el.classList.contains('dark');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setDark(isDark), delay);
    });
    obs.observe(el, { attributeFilter: ['class'] });
    return () => {
      obs.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [delay]);
  return dark;
}

// TradingView Mini Chart Widget — live prices (gold or dollar index)
function TradingViewMiniChart({
  label, tag, symbol, subtitle = 'Live Price · TradingView',
}: { label: string; tag: string; symbol: string; subtitle?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const dark = useDebouncedDarkMode(300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const chartWrapper = chartWrapperRef.current;
    if (!container) return;

    let buildTimer: ReturnType<typeof setTimeout>;
    let fallbackTimer: ReturnType<typeof setTimeout>;
    let iframeObs: MutationObserver | null = null;

    const fadeIn = () => { if (chartWrapper) chartWrapper.style.opacity = '1'; };

    const buildAndWatch = () => {
      container.innerHTML = '';
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
      script.async = true;
      script.textContent = JSON.stringify({
        symbol: symbol,
        width: '100%',
        height: '100%',
        locale: 'en',
        dateRange: '1D',
        colorTheme: dark ? 'dark' : 'light',
        isTransparent: true,
        autosize: true,
        largeChartUrl: '',
        noTimeScale: false,
        chartOnly: false,
      });
      container.appendChild(script);

      iframeObs = new MutationObserver(() => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          iframeObs?.disconnect();
          iframeObs = null;
          clearTimeout(fallbackTimer);
          iframe.addEventListener('load', () => setTimeout(fadeIn, 150), { once: true });
          fallbackTimer = setTimeout(fadeIn, 3000);
        }
      });
      iframeObs.observe(container, { childList: true, subtree: true });
    };

    if (isFirstRender.current) {
      isFirstRender.current = false;
      buildAndWatch();
    } else {
      if (chartWrapper) chartWrapper.style.opacity = '0';
      buildTimer = setTimeout(buildAndWatch, 350);
    }

    return () => {
      clearTimeout(buildTimer);
      clearTimeout(fallbackTimer);
      iframeObs?.disconnect();
    };
  }, [symbol, dark]);

  return (
    <div className="bg-white dark:bg-[#181a2c] rounded-[18px] border border-purple-100 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{label}</span>
          <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">{tag}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Tradingview style={{ width: 11, height: 11 }} />
          <span className="text-[10px] text-gray-400 dark:text-slate-500">{subtitle}</span>
        </div>
      </div>
      <div ref={chartWrapperRef} style={{ transition: 'opacity 0.5s ease' }}>
        <div ref={containerRef} style={{ height: 170 }} className="tradingview-widget-container" />
      </div>
    </div>
  );
}

// Forex Factory News Table with filters
type DateRange = { from: string; to: string };
type QuickDate = 'yesterday' | 'today' | 'tomorrow' | 'this week';

function ForexFactoryNewsTable() {
  const [impactFilter, setImpactFilter] = useState<Set<string>>(new Set(['high', 'medium', 'low']));
  const [quickDate, setQuickDate] = useState<QuickDate | null>('today');
  // Custom-date picker: when set, takes priority over the quick chips
  const [customDate, setCustomDate] = useState<string>('');

  const toggleImpact = (level: string) => {
    setImpactFilter(prev => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  // Compute the active date range from either the custom date or the quick chip
  const range: DateRange = useMemo(() => {
    if (customDate) return { from: customDate, to: customDate };
    switch (quickDate) {
      case 'yesterday': { const d = addDaysIso(TODAY_ISO, -1); return { from: d, to: d }; }
      case 'tomorrow':  { const d = addDaysIso(TODAY_ISO,  1); return { from: d, to: d }; }
      case 'this week': { const [s, e] = weekRangeIso(TODAY_ISO); return { from: s, to: e }; }
      case 'today':
      default:          return { from: TODAY_ISO, to: TODAY_ISO };
    }
  }, [quickDate, customDate]);

  const dateLabel = useMemo(() => {
    if (range.from === range.to) return formatPrettyDate(range.from);
    return `${formatPrettyDate(range.from)} → ${formatPrettyDate(range.to)}`;
  }, [range]);

  const filtered = useMemo(
    () => forexFactoryNews
      .filter(n => impactFilter.has(n.impact))
      .filter(n => n.date >= range.from && n.date <= range.to)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [impactFilter, range]
  );
  const totalInRange = useMemo(
    () => forexFactoryNews.filter(n => n.date >= range.from && n.date <= range.to).length,
    [range]
  );

  const impactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-amber-400';
      case 'low': return 'bg-emerald-400';
      default: return 'bg-gray-300';
    }
  };

  const currencyMeta: Record<string, { code: string; country: string }> = {
    USD: { code: 'us', country: 'United States'  },
    EUR: { code: 'eu', country: 'Euro Zone'      },
    GBP: { code: 'gb', country: 'United Kingdom' },
    JPY: { code: 'jp', country: 'Japan'          },
    CAD: { code: 'ca', country: 'Canada'         },
    AUD: { code: 'au', country: 'Australia'      },
    NZD: { code: 'nz', country: 'New Zealand'    },
    CHF: { code: 'ch', country: 'Switzerland'    },
    CNY: { code: 'cn', country: 'China'          },
  };

  return (
    <div className="bg-white rounded-[22px] border border-purple-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24)' }}>
            <Newspaper size={13} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-sm">Forex Factory News</span>
            <div className="text-[10px] text-gray-400">Economic Calendar · {dateLabel}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Quick date chips */}
        <div className="flex items-center gap-1">
          <Clock size={11} className="text-gray-400" />
          <span className="text-[10px] text-gray-500 font-semibold mr-1">Date:</span>
          {(['yesterday', 'today', 'tomorrow', 'this week'] as QuickDate[]).map(d => {
            const active = !customDate && quickDate === d;
            return (
              <button key={d}
                onClick={() => { setQuickDate(d); setCustomDate(''); }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  active ? 'bg-purple-600 text-white shadow-sm'
                         : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}>
                {d === 'yesterday' ? 'Yesterday' : d === 'today' ? 'Today' : d === 'tomorrow' ? 'Tomorrow' : 'This Week'}
              </button>
            );
          })}
        </div>

        {/* Custom date picker (day / month / year) */}
        <div className="flex items-center gap-1">
          <CalendarDays size={11} className="text-gray-400" />
          <span className="text-[10px] text-gray-500 font-semibold mr-1">Pick:</span>
          <input
            type="date"
            value={customDate}
            onChange={(e) => { setCustomDate(e.target.value); setQuickDate(null); }}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border outline-none transition-all ${
              customDate
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-600 border-purple-200 hover:border-purple-400'
            }`}
            min="2026-05-01"
            max="2026-12-31"
          />
          {customDate && (
            <button
              onClick={() => { setCustomDate(''); setQuickDate('today'); }}
              className="text-[10px] font-semibold text-purple-500 hover:text-purple-700 px-1"
              title="Clear custom date"
            >
              ×
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Impact filter */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-gray-500 font-semibold mr-1">Impact:</span>
          {([
            { key: 'high', label: 'High', color: 'bg-rose-500', activeBg: 'bg-rose-50 border-rose-300', activeText: 'text-rose-700' },
            { key: 'medium', label: 'Medium', color: 'bg-amber-400', activeBg: 'bg-amber-50 border-amber-300', activeText: 'text-amber-700' },
            { key: 'low', label: 'Low', color: 'bg-emerald-400', activeBg: 'bg-emerald-50 border-emerald-300', activeText: 'text-emerald-700' },
          ] as const).map(f => {
            const active = impactFilter.has(f.key);
            return (
              <button key={f.key} onClick={() => toggleImpact(f.key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                  active ? `${f.activeBg} ${f.activeText}` : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}>
                <span className={`w-2 h-2 rounded-full ${active ? f.color : 'bg-gray-300'}`} />
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto text-[10px] text-gray-400">
          {filtered.length} / {totalInRange} events
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-purple-50">
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Date</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Time</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Currency</th>
              <th className="text-center py-2 px-1 text-gray-400 font-semibold uppercase tracking-wider">Impact</th>
              <th className="text-left py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Event</th>
              <th className="text-right py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Actual</th>
              <th className="text-right py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Forecast</th>
              <th className="text-right py-2 px-2 text-gray-400 font-semibold uppercase tracking-wider">Previous</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-[12px]">No events match selected filters</td></tr>
            ) : (
              filtered.map((news, i) => {
                const isFuture = news.date > TODAY_ISO;
                const isReleased = news.actual !== '';
                // simple actual-vs-forecast beat colorization for percentage/numeric headlines
                let actualClass = 'font-bold text-gray-800';
                if (isReleased) {
                  const a = parseFloat(news.actual.replace(/[^\-0-9.]/g, ''));
                  const f = parseFloat(news.forecast.replace(/[^\-0-9.]/g, ''));
                  if (!isNaN(a) && !isNaN(f)) {
                    if (a > f) actualClass = 'font-bold text-emerald-600';
                    else if (a < f) actualClass = 'font-bold text-rose-500';
                  }
                }
                return (
                  <tr key={i} className={`border-b border-gray-50 hover:bg-purple-50/30 transition ${news.impact === 'high' ? 'bg-rose-50/20' : ''} ${isFuture ? 'opacity-90' : ''}`}>
                    <td className="py-2.5 px-2 text-gray-500 font-medium whitespace-nowrap">{news.date.slice(5).replace('-', '/')}</td>
                    <td className="py-2.5 px-2 text-gray-500 font-medium whitespace-nowrap">{news.time}</td>
                    <td className="py-2.5 px-2">
                      {(() => {
                        const meta = currencyMeta[news.currency];
                        return (
                          <div className="flex items-center gap-1.5">
                            {meta ? (
                              <img
                                src={`https://flagcdn.com/w40/${meta.code}.png`}
                                alt={meta.country}
                                title={meta.country}
                                width={24}
                                height={16}
                                className="rounded-sm shadow-sm object-cover"
                                style={{ width: 24, height: 16 }}
                              />
                            ) : (
                              <span className="w-6 h-4 rounded-sm bg-gray-200 inline-block" />
                            )}
                            <span className="font-extrabold text-[11px] text-gray-700">{news.currency}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${impactColor(news.impact)}`} />
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-gray-800 max-w-[220px] truncate">{news.event}</td>
                    <td className={`py-2.5 px-2 text-right ${actualClass}`}>
                      {isReleased ? news.actual : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2.5 px-2 text-right text-gray-500">{news.forecast || <span className="text-gray-300">—</span>}</td>
                    <td className="py-2.5 px-2 text-right text-gray-400">{news.previous || <span className="text-gray-300">—</span>}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> High Impact</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Low</span>
        </div>
        <div className="text-[10px] text-gray-400">Source: Forex Factory</div>
      </div>
    </div>
  );
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main OverviewTab
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function OverviewTab() {
  const { trades } = useTradingData();
  const router = useRouter();
  const goTab = (tab: string) => router.replace(`/dashboard/trading?tab=${tab}`, { scroll: false });
  const [tf, setTf] = useState<TF>('All Time');

  const monthKey = currentMonthKey();
  const prevMonth = prevMonthKey();

  // â”€â”€ All derived values from real data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const kpis = useMemo(() => deriveKpis(trades), [trades]);
  const totalCapital = useMemo(() => calculateTotalCapital(), []);
  const monthlyPnl = useMemo(() => calculateMonthlyPnL(trades, monthKey), [trades, monthKey]);
  const monthlyPct = useMemo(() => calculateMonthlyPnLPct(trades, monthKey), [trades, monthKey]);
  const prevMonthlyPnl = useMemo(() => calculateMonthlyPnL(trades, prevMonth), [trades, prevMonth]);
  const winRate = useMemo(() => calculateWinRate(trades), [trades]);
  const pf = useMemo(() => calculateProfitFactor(trades), [trades]);
  const maxDd = useMemo(() => calculateMaxDrawdown(trades), [trades]);
  const activeChallenges = useMemo(() => getActiveChallenges(), []);
  const readiness = useMemo(() => calculateTradingReadiness(trades), [trades]);
  const psychScore = useMemo(() => calculatePsychologyScore(trades), [trades]);
  const discScore = useMemo(() => calculateDisciplineScore(trades), [trades]);
  const bestEdge = useMemo(() => getBestEdge(trades), [trades]);
  const worstRisk = useMemo(() => getWorstRisk(trades), [trades]);
  const recentTrades = useMemo(() => getRecentTrades(trades, 5), [trades]);
  const spark = useMemo(() => buildKpiSparkline(trades), [trades]);

  // â”€â”€ Equity curve filtered by timeframe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fullCurve = useMemo(() => buildEquityCurve(trades), [trades]);
  const curve = useMemo((): EquityPoint[] => {
    if (tf === 'All Time') return fullCurve;
    const cutoffs: Record<string, string> = { '3M': '2026-03', '1M': '2026-05', 'This Week': '2026-05-24' };
    const cut = cutoffs[tf] ?? '';
    return fullCurve.filter((p) => p.date >= cut);
  }, [fullCurve, tf]);

  // â”€â”€ Formatted display values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fmtUsd = (n: number) =>
    `${n >= 0 ? '+' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  const monthlyPnlChange = useMemo(() => {
    const diff = monthlyPnl - prevMonthlyPnl;
    if (!prevMonthlyPnl) return '+0%';
    return fmtPct((diff / Math.abs(prevMonthlyPnl)) * 100);
  }, [monthlyPnl, prevMonthlyPnl]);

  return (
    <div className="space-y-5">

      {/* â”€â”€ Row 1: 6 KPI Cards — uses shared KpiCard for exact 142px height â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          title="Total Capital"
          value={`$${(totalCapital / 1000).toFixed(0)}K`}
          change={`${activeChallenges} accounts`}
          positive={true}
          icon={<DollarSign size={20} color="#fff" />}
          color={KPI_COLORS.mint}
          sparkData={spark}
        />
        <KpiCard
          title="Monthly P&L"
          value={fmtUsd(monthlyPnl)}
          change={monthlyPnlChange}
          positive={monthlyPnl >= 0}
          icon={<TrendingUp size={20} color="#fff" />}
          color={monthlyPnl >= 0 ? KPI_COLORS.emerald : KPI_COLORS.coral}
          sparkData={spark}
        />
        <KpiCard
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          change={`${kpis.wins}W / ${kpis.losses}L`}
          positive={winRate >= 50}
          icon={<Target size={20} color="#fff" />}
          color={winRate >= 55 ? KPI_COLORS.emerald : winRate >= 45 ? KPI_COLORS.amber : KPI_COLORS.coral}
          sparkData={spark}
        />
        <KpiCard
          title="Profit Factor"
          value={pf.toFixed(2)}
          change={`Avg R ${kpis.avgR.toFixed(2)}`}
          positive={pf >= 1}
          icon={<Award size={20} color="#fff" />}
          color={pf >= 1.5 ? KPI_COLORS.emerald : pf >= 1.2 ? KPI_COLORS.sky : pf >= 1 ? KPI_COLORS.amber : KPI_COLORS.coral}
          sparkData={spark}
        />
        <KpiCard
          title="Active Challenges"
          value={String(activeChallenges)}
          change="Prop Firms"
          positive={true}
          icon={<Zap size={20} color="#fff" />}
          color={KPI_COLORS.violet}
          sparkData={spark}
        />
        <KpiCard
          title="Max Drawdown"
          value={`${maxDd.toFixed(1)}%`}
          change={`${fmtUsd(kpis.netPnl)} net`}
          positive={false}
          icon={<Shield size={20} color="#fff" />}
          color={Math.abs(maxDd) <= 5 ? KPI_COLORS.amber : KPI_COLORS.coral}
          sparkData={spark}
        />
      </div>

      {/* â”€â”€ Row 2: Equity Curve (large) + Right sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">

        {/* Equity Curve */}
        <div className="xl:col-span-2 bg-white rounded-[22px] border border-purple-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
                  <BarChart3 size={13} className="text-white" />
                </div>
                <span className="font-bold text-gray-800 text-sm">Equity Curve</span>
              </div>
              <div className="mt-0.5 text-[11px] text-gray-400">
                Net P&L: <span className={`font-bold ${kpis.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {fmtUsd(kpis.netPnl)}
                </span>
                &nbsp;·&nbsp;{curve.length} data points
              </div>
            </div>
            {/* Timeframe selector */}
            <div className="flex gap-1">
              {TIMEFRAMES.map((t) => (
                <button key={t} onClick={() => setTf(t)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    tf === t
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={310}>
            <AreaChart data={curve} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="eqMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="eqSma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebff" />
              <XAxis dataKey="date"
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v === 'start' ? '' : v.slice(5)}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                tick={{ fontSize: 9, fill: '#9ca3af' }}
                axisLine={false} tickLine={false} width={42}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #ede9ff', background: '#fff' }}
                formatter={(v: number) => [`$${v.toLocaleString('en-US')}`, '']}
                labelStyle={{ color: '#6b7280' }}
              />
              <ReferenceLine y={100000} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
              <Area type="monotone" dataKey="sma" stroke="#38bdf8" strokeWidth={1.5}
                fill="url(#eqSma)" dot={false} strokeDasharray="4 3" />
              <Area type="monotone" dataKey="equity" stroke="#7c3aed" strokeWidth={2.2}
                fill="url(#eqMain)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Chart legend */}
          <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-0.5 rounded" style={{ background: '#7c3aed' }} /> Equity
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: '#38bdf8' }} /> SMA-10
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-6 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: '#94a3b8' }} /> Start Capital
            </span>
          </div>
        </div>

        {/* Right sidebar: Live charts — Gold (XAUUSD) + Dollar Index (DXY) */}
        <div className="space-y-3">
          <TradingViewMiniChart label="XAUUSD" tag="Gold CFD" symbol="OANDA:XAUUSD" />
          <TradingViewMiniChart label="DXY" tag="Dollar Index" symbol="TVC:DXY" subtitle="US Dollar Index · TradingView" />
        </div>
      </div>

      {/* â”€â”€ Row 3: Recent Trades · Today's Plan · Weekly Focus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Recent Trades */}
        <div className="bg-white rounded-[22px] border border-purple-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' }}>
                <Layers size={13} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Recent Trades</span>
            </div>
            <button onClick={() => goTab('journal')} className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:underline">
              Open Journal <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-2">
            {recentTrades.map((t) => {
              const isWin = t.result === 'Win';
              const isLoss = t.result === 'Loss';

              const assetIconMap: Record<string, React.ReactNode> = {
                XAUUSD: <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-100"><Coins size={14} className="text-amber-500" /></div>,
                NAS100: <img src="https://flagcdn.com/w40/us.png" alt="US" title="United States" className="h-[18px] w-[27px] rounded-sm object-cover shadow-sm border border-white/60" />,
                EURUSD: <img src="https://flagcdn.com/w40/eu.png" alt="EU" title="Euro Zone"     className="h-[18px] w-[27px] rounded-sm object-cover shadow-sm border border-white/60" />,
                GBPUSD: <img src="https://flagcdn.com/w40/gb.png" alt="GB" title="United Kingdom" className="h-[18px] w-[27px] rounded-sm object-cover shadow-sm border border-white/60" />,
                BTCUSD: <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 border border-orange-100"><Bitcoin style={{ width: 15, height: 15 }} /></div>,
              };

              return (
                <div key={t.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all hover:shadow-sm cursor-pointer ${
                    isWin ? 'bg-emerald-50 border-emerald-100' :
                    isLoss ? 'bg-rose-50 border-rose-100' :
                    'bg-gray-50 border-gray-100'
                  }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isWin ? 'bg-emerald-400' : isLoss ? 'bg-rose-400' : 'bg-gray-300'
                  }`} />
                  {assetIconMap[t.asset] ?? null}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-gray-800">{t.asset}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        t.side === 'Long' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>{t.side}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{t.setup} · {t.session} · {t.date.slice(5)}</div>
                  </div>
                  <div className={`text-[13px] font-extrabold stat-num ${
                    t.r > 0 ? 'text-emerald-600' : t.r < 0 ? 'text-rose-500' : 'text-gray-400'
                  }`}>
                    {t.r > 0 ? '+' : ''}{t.r.toFixed(2)}R
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-purple-50 grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Total Trades', value: kpis.total },
              { label: 'Avg R', value: `${kpis.avgR >= 0 ? '+' : ''}${kpis.avgR.toFixed(2)}` },
              { label: 'Expectancy', value: `$${Math.round(kpis.expectancy)}` },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</div>
                <div className="text-[13px] font-bold text-gray-700 stat-num mt-0.5">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Trading Plan */}
        <div className="bg-white rounded-[22px] border border-purple-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
                <CalendarDays size={13} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Today's Trading Plan</span>
            </div>
            <button onClick={() => goTab('risk')} className="flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:underline">
              Open Risk <ChevronRight size={11} />
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                label: 'Market Bias',
                value: kpis.netPnl >= 0 ? 'Bullish - Trend Following' : 'Cautious - Wait for Confirmation',
                color: kpis.netPnl >= 0 ? 'text-emerald-700' : 'text-orange-600',
                bg: kpis.netPnl >= 0 ? 'bg-emerald-50' : 'bg-orange-50',
                icon: TrendingUp,
              },
              {
                label: 'Focus Setup',
                value: bestEdge?.name ?? 'Breakout + Trend Follow',
                color: 'text-purple-700',
                bg: 'bg-purple-50',
                icon: Crosshair,
              },
              {
                label: 'Key Assets',
                value: 'XAUUSD · NAS100 · EURUSD',
                color: 'text-sky-700',
                bg: 'bg-sky-50',
                icon: Layers,
              },
              {
                label: 'Risk Per Trade',
                value: '$420 / 0.42% of capital',
                color: 'text-amber-700',
                bg: 'bg-amber-50',
                icon: Shield,
              },
              {
                label: 'Daily Goal',
                value: `${fmtUsd(Math.abs(kpis.expectancy) * 3)} (3 trades target)`,
                color: 'text-violet-700',
                bg: 'bg-violet-50',
                icon: Target,
              },
              {
                label: 'Stop Rule',
                value: `Stop if DD > -2% today (${Math.abs(maxDd).toFixed(1)}% overall)`,
                color: Math.abs(maxDd) > 8 ? 'text-rose-700' : 'text-gray-700',
                bg: Math.abs(maxDd) > 8 ? 'bg-rose-50' : 'bg-gray-50',
                icon: AlertTriangle,
              },
            ].map((row) => {
              const RowIcon = row.icon;
              return (
                <div key={row.label} className={`flex items-start gap-2.5 p-2.5 rounded-xl ${row.bg}`}>
                  <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center mt-0.5`}>
                    <RowIcon size={13} className={row.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.label}</div>
                    <div className={`text-[12px] font-semibold mt-0.5 ${row.color}`}>{row.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Focus / Next Best Action */}
        <div className="bg-white rounded-[22px] border border-purple-100 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6366f1,#818cf8)' }}>
                <Crosshair size={13} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Weekly Focus</span>
            </div>
          </div>

          {/* Primary focus statement */}
          <div className="flex-1 space-y-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
              <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1">This Week's Focus</div>
              <div className="text-[13px] font-bold text-violet-800 leading-snug">
                {bestEdge
                  ? `Double down on ${bestEdge.name} setup - highest edge this period`
                  : 'Stick to your trading rules and track all setups'}
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                <span className="font-semibold">Weekly Progress</span>
                <span className="font-bold stat-num">{Math.round(readiness.score * 0.7 + discScore * 0.3)}%</span>
              </div>
              <div className="w-full bg-purple-50 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.round(readiness.score * 0.7 + discScore * 0.3)}%`,
                    background: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
                  }}
                />
              </div>
            </div>

            {/* Insight list */}
            <div className="space-y-2">
              {[
                {
                  text: worstRisk ? `Avoid ${worstRisk.name} - ${worstRisk.severity} risk` : 'Review your worst trades this week',
                  tone: 'warn',
                },
                {
                  text: `Write journal entry after every trade (${kpis.total} logged so far)`,
                  tone: 'info',
                },
                {
                  text: readiness.label === 'Ready'
                    ? 'You are in the zone - execute your A-setup only'
                    : 'Readiness is low - consider reducing position size today',
                  tone: readiness.label === 'Ready' ? 'good' : 'warn',
                },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-[11px] font-medium ${
                  item.tone === 'good' ? 'bg-emerald-50 text-emerald-700' :
                  item.tone === 'warn' ? 'bg-amber-50 text-amber-700' :
                  'bg-sky-50 text-sky-700'
                }`}>
                  <span className="mt-0.5 flex-shrink-0">
                    {item.tone === 'good' ? <CheckCircle2 size={13} /> : item.tone === 'warn' ? <AlertTriangle size={13} /> : <Info size={13} />}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => goTab('review')}
              className="py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}
            >
              Open Review
            </button>
            <button
              onClick={() => goTab('journal')}
              className="py-2.5 rounded-xl text-[12px] font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 transition-all"
            >
              Open Journal
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Forex Factory News */}
      <ForexNewsWidget />
    </div>
  );
}
