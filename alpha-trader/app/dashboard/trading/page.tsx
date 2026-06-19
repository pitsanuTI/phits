'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import OverviewTab from './tabs/OverviewTab';
import FundingTab from './tabs/FundingTab';
import JournalTab from './tabs/JournalTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import StrategyTab from './tabs/StrategyTab';
import BacktestTab from './tabs/BacktestTab';
import RiskTab from './tabs/RiskTab';
import ReviewTab from './tabs/ReviewTab';
import DataTab from './tabs/DataTab';
import CalendarTab from './tabs/CalendarTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'funding', label: 'Funding' },
  { id: 'journal', label: 'Journal' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'backtest', label: 'Backtest' },
  { id: 'risk', label: 'Risk' },
  { id: 'review', label: 'Review' },
  { id: 'data', label: 'Data' },
] as const;

type TradingTab = (typeof TABS)[number]['id'];

const META: Record<TradingTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Trading Overview',
    subtitle: 'ติดตามทุน ผลงาน และสุขภาพการเทรดรายเดือน',
  },
  funding: {
    title: 'Funding & Prop Accounts',
    subtitle: 'ติดตามบัญชีทุนสอบ กฎสำคัญ และผลตอบแทน',
  },
  journal: {
    title: 'Trade Journal',
    subtitle: 'บันทึกการเข้าออก อารมณ์ และบทเรียนจากแต่ละดีล',
  },
  calendar: {
    title: 'Trading Calendar',
    subtitle: 'ปฏิทินผลการเทรดรายวัน คลิกวันเพื่อดูดีลของวันนั้น',
  },
  analytics: {
    title: 'AI Performance Lab',
    subtitle: 'วิเคราะห์เชิงลึกระดับกองทุน + คำแนะนำจาก AI Coach',
  },
  strategy: {
    title: 'Strategy Playbook',
    subtitle: 'จัดการ Playbook กฎเข้าออก และกลยุทธ์ที่ควรโฟกัส',
  },
  backtest: {
    title: 'Backtest Lab',
    subtitle: 'ทดสอบกลยุทธ์ตั้งแต่ Jan-May 2026 และจำลอง Prop Firm',
  },
  risk: {
    title: 'Risk Manager',
    subtitle: 'คำนวณขนาดสัญญา คุม Drawdown และ Exposure',
  },
  review: {
    title: 'Weekly Review',
    subtitle: 'สรุปผลงานรายสัปดาห์ วินัย และแผนปรับปรุง',
  },
  data: {
    title: 'Data Center',
    subtitle: 'แหล่งข้อมูลกลาง — กรอก/แก้ไขรายการเทรด แล้ว KPI คำนวณสดทันที',
  },
};

function isTradingTab(value: string | null): value is TradingTab {
  return Boolean(value && TABS.some((tab) => tab.id === value));
}

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

/* ── TradingView Ticker Tape — live asset prices ─────────────────────────── */
function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dark = useDebouncedDarkMode(300);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container) return;

    let buildTimer: ReturnType<typeof setTimeout>;
    let fallbackTimer: ReturnType<typeof setTimeout>;
    let iframeObs: MutationObserver | null = null;

    const fadeIn = () => { if (wrapper) wrapper.style.opacity = '1'; };

    const buildAndWatch = () => {
      while (container.firstChild) container.removeChild(container.firstChild);

      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      container.appendChild(widgetDiv);

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.type = 'text/javascript';
      script.textContent = JSON.stringify({
        symbols: [
          { proName: 'OANDA:XAUUSD', title: 'XAUUSD' },
          { proName: 'FX:USDJPY', title: 'USDJPY' },
          { proName: 'FX:EURUSD', title: 'EURUSD' },
          { proName: 'FOREXCOM:US30', title: 'US30' },
          { proName: 'CAPITALCOM:US100', title: 'NAS100' },
          { proName: 'TVC:DXY', title: 'DXY' },
          { proName: 'FX:GBPJPY', title: 'GBPJPY' },
          { proName: 'FX:EURJPY', title: 'EURJPY' },
        ],
        showSymbolLogo: true,
        colorTheme: dark ? 'dark' : 'light',
        isTransparent: true,
        displayMode: 'adaptive',
        locale: 'en',
      });
      container.appendChild(script);

      // Watch for TradingView's iframe to appear, then fade back in
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
      if (wrapper) wrapper.style.opacity = '0';
      buildTimer = setTimeout(buildAndWatch, 350);
    }

    return () => {
      clearTimeout(buildTimer);
      clearTimeout(fallbackTimer);
      iframeObs?.disconnect();
    };
  }, [dark]);

  return (
    <div
      ref={wrapperRef}
      style={{ transition: 'opacity 0.5s ease', minHeight: 46 }}
      className="tradingview-widget-container mb-3 rounded-2xl border border-purple-100/70 dark:border-white/10 bg-white/80 dark:bg-[#181a2c]/60 shadow-sm overflow-hidden"
    >
      <div ref={containerRef} />
    </div>
  );
}

export default function TradingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const tab = isTradingTab(queryTab) ? queryTab : 'overview';

  const meta = META[tab];

  const handleTabChange = (nextTab: TradingTab) => {
    router.replace(`/dashboard/trading?tab=${nextTab}`, { scroll: false });
  };

  return (
    <div className="trading-premium min-w-0 max-w-full overflow-hidden">
      <TopBar title="Trading" subtitle={meta.subtitle} />

      <TradingViewTicker />

      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max items-center gap-2">
          {TABS.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`h-10 rounded-xl px-4 text-[12px] font-extrabold whitespace-nowrap transition ${
                  active
                    ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)] dark:bg-purple-500/20 dark:text-purple-300'
                    : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-500/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {tab === 'overview' && <OverviewTab />}
        {tab === 'funding' && <FundingTab />}
        {tab === 'journal' && <JournalTab />}
        {tab === 'calendar' && <CalendarTab />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'strategy' && <StrategyTab />}
        {tab === 'backtest' && <BacktestTab />}
        {tab === 'risk' && <RiskTab />}
        {tab === 'review' && <ReviewTab />}
        {tab === 'data' && <DataTab />}
      </motion.div>
    </div>
  );
}
