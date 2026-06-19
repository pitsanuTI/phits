'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Brain, BookOpen, BarChart3 } from 'lucide-react';
import TodayTab    from './tabs/TodayTab';
import ReflectTab  from './tabs/ReflectTab';
import JournalTab  from './tabs/JournalTab';
import InsightsTab from './tabs/InsightsTab';

const TABS = [
  { id: 'today',    label: 'Today',    icon: Sun,       desc: 'Check-in ประจำวัน' },
  { id: 'reflect',  label: 'Reflect',  icon: Brain,     desc: 'พูดคุยกับตัวเอง' },
  { id: 'journal',  label: 'Journal',  icon: BookOpen,  desc: 'บันทึกทั้งหมด' },
  { id: 'insights', label: 'Insights', icon: BarChart3, desc: 'วิเคราะห์แนวโน้ม' },
];

export default function MoodJournalPage() {
  const [tab, setTab] = useState('today');

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Bar */}
      <div className="mb-4 overflow-x-auto rounded-2xl border border-purple-100/70 bg-white/80 p-2 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max items-center gap-2">
          {TABS.map(t => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 h-10 rounded-xl px-4 text-[12px] font-extrabold whitespace-nowrap transition ${
                  active
                    ? 'bg-purple-100 text-purple-700 shadow-[inset_0_-2px_0_rgba(124,58,237,0.45)] dark:bg-purple-500/20 dark:text-purple-300'
                    : 'text-slate-500 hover:bg-purple-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-purple-500/10'
                }`}
              >
                <Icon size={14} className={active ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22 }}
      >
        {tab === 'today'    && <TodayTab />}
        {tab === 'reflect'  && <ReflectTab />}
        {tab === 'journal'  && <JournalTab />}
        {tab === 'insights' && <InsightsTab />}
      </motion.div>
    </div>
  );
}
