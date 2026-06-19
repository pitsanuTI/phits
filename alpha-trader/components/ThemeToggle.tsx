'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    if (next) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  }

  // Avoid hydration mismatch flash
  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl border border-purple-100 bg-white" />;
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label="Toggle dark mode"
      className="relative w-8 h-8 flex items-center justify-center rounded-xl border border-purple-100 bg-white shadow-sm transition hover:border-purple-300 dark:border-white/10 dark:bg-white/5"
    >
      <motion.span
        key={dark ? 'moon' : 'sun'}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {dark
          ? <Moon size={15} className="text-amber-300" />
          : <Sun size={15} className="text-amber-500" />}
      </motion.span>
    </motion.button>
  );
}
