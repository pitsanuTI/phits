'use client';
import { useContext, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { SidebarContext } from './SidebarContext';
import {
  Home, Briefcase, Heart, BookOpen, BarChart3,
  Wallet, Smile, Settings, ChevronLeft, Sparkles,
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Work', href: '/dashboard/work', icon: Briefcase },
  { label: 'Health & Habits', href: '/dashboard/health', icon: Heart },
  { label: 'Learning', href: '/dashboard/learning', icon: BookOpen },
  { label: 'Trading', href: '/dashboard/trading', icon: BarChart3 },
  { label: 'Compounding', href: '/dashboard/compounding', icon: Sparkles },
  { label: 'Money', href: '/dashboard/money', icon: Wallet },
  { label: 'Mood & Journal', href: '/dashboard/mood', icon: Smile },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const [activeRoute, setActiveRoute] = useState('/dashboard');

  // Update active route whenever pathname changes
  useEffect(() => {
    setActiveRoute(pathname);
  }, [pathname]);

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return activeRoute === '/dashboard';
    }
    return activeRoute.startsWith(href);
  };

  const sparkles = useMemo(() => [
    { top: '8%', left: '12%', s: 2 },
    { top: '22%', left: '88%', s: 1.5 },
    { top: '38%', left: '6%', s: 1.8 },
    { top: '55%', left: '85%', s: 1.2 },
    { top: '72%', left: '10%', s: 1.6 },
    { top: '88%', left: '82%', s: 1.4 },
  ], []);

  const ALL_ITEMS = [...MENU_ITEMS, ...BOTTOM_ITEMS];

  return (
    <>
    <aside className={[
      'fixed left-0 top-0 h-screen bg-white dark:bg-[#181a2c] border-r border-purple-100 dark:border-white/10 z-40',
      'flex flex-col transition-all duration-300',
      collapsed ? 'w-20' : 'w-[200px]',
      'hidden lg:flex',
    ].join(' ')}>

      {/* Sparkles - no animation to prevent lag */}
      {sparkles.map((sp, i) => (
        <div key={i} className="absolute pointer-events-none opacity-40"
          style={{
            top: sp.top, left: sp.left, width: sp.s, height: sp.s,
            background: 'rgba(168, 139, 250, 0.5)', borderRadius: '1px',
            transform: 'rotate(45deg)',
          }} />
      ))}

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
            style={{ background: 'var(--primary-gradient, linear-gradient(135deg,#7c3aed,#a78bfa))' }}>
            <span className="text-white text-[15px] font-black tracking-tight">P</span>
          </div>
          {!collapsed && (
            <span className="text-[15px] font-black tracking-widest text-gray-900">PHITS</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-purple-50 rounded-lg transition-colors duration-200"
          aria-label="Toggle sidebar">
          <ChevronLeft size={16} className={`text-gray-400 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1 relative z-10">
        {MENU_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: isActive ? 0 : 3, backgroundColor: isActive ? undefined : 'rgba(139,92,246,0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
                  isActive
                    ? 'bg-purple-200/60 text-purple-900 font-semibold shadow-sm'
                    : 'text-gray-600',
                ].join(' ')}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom navigation */}
      <nav className="px-2 py-4 border-t border-purple-100 space-y-1 relative z-10">
        {BOTTOM_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: isActive ? 0 : 3, backgroundColor: isActive ? undefined : 'rgba(139,92,246,0.08)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
                  isActive
                    ? 'bg-purple-200/60 text-purple-900 font-semibold shadow-sm'
                    : 'text-gray-600',
                ].join(' ')}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </aside>

    {/* Mobile bottom navigation — Classic style */}
    <nav
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden border-t border-purple-100 dark:border-white/10 bg-white/97 dark:bg-[#181a2c]/97 backdrop-blur-sm shadow-[0_-2px_12px_rgba(124,92,191,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {([
          { label: 'Home',     href: '/dashboard',          icon: Home     },
          { label: 'Journal',  href: '/dashboard/mood',     icon: Smile    },
          { label: 'Trading',  href: '/dashboard/trading',  icon: BarChart3 },
          { label: 'Money',    href: '/dashboard/money',    icon: Wallet   },
          { label: 'Settings', href: '/dashboard/settings', icon: Settings },
        ] as const).map(item => {
          const Icon = item.icon;
          const active = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-150 active:bg-purple-50 dark:active:bg-purple-900/20"
            >
              {/* Active top indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] w-8 rounded-full bg-purple-600 dark:bg-purple-400" />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                className={active
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-slate-400 dark:text-slate-500'}
              />
              <span className={`text-[10px] leading-none font-semibold ${active
                ? 'text-purple-700 dark:text-purple-300'
                : 'text-slate-400 dark:text-slate-500'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
