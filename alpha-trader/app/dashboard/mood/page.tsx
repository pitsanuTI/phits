'use client';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import MoodJournalPage from '@/components/mood/MoodJournalPage';

export default function MoodPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <TopBar title="Mood & Journal" subtitle="ติดตามอารมณ์ พลังงาน และบทเรียนในแต่ละวัน" />
      <MoodJournalPage />
    </motion.div>
  );
}
