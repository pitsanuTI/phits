'use client';
import { Bell, ChevronDown, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

interface Props { title: string; subtitle?: string }

function formatThaiDate(date: Date): string {
  const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const d = date.getDate();
  const m = thMonths[date.getMonth()];
  const y = date.getFullYear() + 543;
  return `${d} ${m} ${y}`;
}

export default function TopBar({ title, subtitle }: Props) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    setDateLabel(formatThaiDate(new Date()));
  }, []);

  function handleLogout() { logout(); router.push('/login'); }

  return (
    <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
      {/* Left: title + subtitle (mobile nav now lives in a bottom icon bar) */}
      <div className="flex items-start gap-2 min-w-0">
        {/* gradient left bar */}
        <div
          className="w-[3.5px] rounded-full flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(180deg, #6d28d9, #a78bfa)', alignSelf: 'stretch', minHeight: '28px' }}
        />
        <div className="min-w-0">
          <h1
            className="text-[22px] font-bold leading-tight"
            style={{
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(90deg, #5b21b6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-gray-400 mt-0.5 leading-snug" style={{ fontFamily: 'var(--font-sans)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Date pill */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-xl text-[12px] text-gray-600 dark:text-gray-300 shadow-sm hover:border-purple-300 transition whitespace-nowrap">
          <Calendar size={13} className="text-purple-500" />
          {dateLabel}
          <ChevronDown size={11} className="text-gray-400" />
        </button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Bell */}
        <button className="relative w-8 h-8 flex items-center justify-center bg-white border border-purple-100 rounded-xl shadow-sm hover:border-purple-300 transition dark:border-white/10 dark:bg-white/5">
          <Bell size={14} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
        </button>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(v => !v)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-white dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-xl shadow-sm hover:border-purple-300 transition"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">
              P
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 leading-tight">Phitsanu P.</div>
            </div>
            <ChevronDown size={11} className="text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 w-36 bg-white dark:bg-[#181a2c] border border-purple-100 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[12px] text-red-500 hover:bg-red-50 transition font-medium"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
